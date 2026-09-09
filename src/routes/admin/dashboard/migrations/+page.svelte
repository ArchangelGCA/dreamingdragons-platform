<script>
    import {deserialize} from "$app/forms";
    import {toast} from "$lib/components/svelte-toast";

    const OLD_HOST = 'rosesintheflames.pockethost.io';
    const NEW_HOST = 'dreamingdragons-images.pockethost.io';
    const BATCH_SIZE = 50;
    const CONFIRM_FORWARD = 'MIGRATE';
    const CONFIRM_REVERSE = 'ROLLBACK';

    let isMigrating = $state(false);

    // --- Pockethost host migration state (Svelte 5 runes) ---
    let isScanning = $state(false);
    let isRunning = $state(false);
    let scanBody = $state(null);
    let scanDirection = $state('forward');
    let showConfirm = $state(false);
    let pendingDirection = $state('forward');
    let confirmText = $state('');
    let processed = $state(0);
    let runTotal = $state(0);
    let perTarget = $state({});
    let currentLabel = $state('');
    let runLog = $state([]);
    let lastSummary = $state(null);
    let runJson = $state(null);
    let logEl = $state(null);
    // Last known matching-cell counts per direction. `null` = never scanned
    // this page-load; a `0` means that direction is fully applied (already done).
    let forwardCount = $state(null);
    let reverseCount = $state(null);
    // Rows the database rejected (trigger/RLS) — skipped, collected, reported.
    let failures = $state([]);
    let targetErrors = $state([]);

    let overallPct = $derived(runTotal > 0 ? Math.min(100, Math.round((processed / runTotal) * 100)) : 0);
    let confirmWord = $derived(pendingDirection === 'reverse' ? CONFIRM_REVERSE : CONFIRM_FORWARD);
    let confirmOk = $derived(confirmText.trim() === confirmWord);
    let canRun = $derived(!isRunning && !isScanning && !isMigrating);
    // Idempotency: once a direction scans to zero it is done — disable its
    // trigger so an accidental click can't rewrite anything.
    let forwardDone = $derived(forwardCount === 0);
    let reverseDone = $derived(reverseCount === 0);
    let pendingKnownCount = $derived(pendingDirection === 'reverse' ? reverseCount : forwardCount);
    let pendingAlreadyDone = $derived(pendingKnownCount === 0);
    // Hint when failures look like DB trigger/RLS rejections (service-role
    // bypasses RLS but not triggers) rather than connectivity problems.
    let policyHint = $derived(
        failures.some((f) => /not allowed|permission denied|row-level security|policy|trigger|forbidden|unauthorized/i.test(f.message ?? ''))
    );

    function pushLog(message, kind = 'info') {
        const time = new Date().toLocaleTimeString();
        runLog.push({time, message, kind});
        // Keep the log bounded so a huge migration can't blow up the DOM.
        if (runLog.length > 400) runLog.splice(0, runLog.length - 400);
        if (logEl) {
            // Scroll after paint so the newest line is visible.
            requestAnimationFrame(() => {
                logEl.scrollTop = logEl.scrollHeight;
            });
        }
    }

    function showToast(message, ok = true) {
        toast.push(message, {
            theme: {
                '--toastBackground': ok ? 'rgba(92,0,166,0.9)' : '#ff0000',
                '--toastBody': '#fff',
                '--toastProgress': '#fff',
            },
        });
    }

    async function postAction(action, formData) {
        const response = await fetch(`?/${action}`, {
            method: 'POST',
            body: formData,
        });
        return deserialize(await response.text());
    }

    // Unconditional database scan (no isRunning guard) — the single source of
    // truth for "is there anything left to rewrite?". Returns the scan body
    // or null on failure, and records the per-direction count.
    async function scanNow(direction) {
        scanDirection = direction;
        const formData = new FormData();
        formData.append('direction', direction);
        const result = await postAction('pockethost_scan', formData);
        if (result.type === 'success' && result.data?.status === 200) {
            scanBody = result.data.body;
            const total = scanBody.total ?? 0;
            if (direction === 'reverse') reverseCount = total;
            else forwardCount = total;
            return scanBody;
        }
        return null;
    }

    async function handleScan(direction = 'forward') {
        if (isScanning || isRunning) return;
        isScanning = true;
        try {
            const body = await scanNow(direction);
            if (body) {
                const total = body.total ?? 0;
                pushLog(`Scan (${direction}): ${total} cell(s) still contain "${direction === 'reverse' ? 'dreamingdragons-images' : 'rosesintheflames'}".`, 'info');
            } else {
                pushLog(`Scan failed.`, 'error');
                showToast(`Scan failed.`, false);
            }
        } catch (err) {
            pushLog(`Scan error: ${err?.message ?? err}`, 'error');
            showToast('Scan error — see log.', false);
        } finally {
            isScanning = false;
        }
    }

    function openConfirm(direction) {
        if (!canRun) return;
        // Fast path: we already know this direction is fully applied.
        const known = direction === 'reverse' ? reverseCount : forwardCount;
        if (known === 0) {
            showToast(direction === 'reverse' ? 'Rollback already done — zero matching cells.' : 'Migration already done — zero matching cells.', false);
            pushLog(direction === 'reverse' ? 'Rollback blocked: already done (0 matching cells).' : 'Migration blocked: already done (0 matching cells).', 'error');
            return;
        }
        pendingDirection = direction;
        confirmText = '';
        showConfirm = true;
    }

    async function confirmAndRun() {
        if (!confirmOk || isRunning) return;
        // Second guard: the count may have become zero since the modal opened.
        const known = pendingDirection === 'reverse' ? reverseCount : forwardCount;
        if (known === 0) {
            showToast(pendingDirection === 'reverse' ? 'Rollback already done — zero matching cells.' : 'Migration already done — zero matching cells.', false);
            pushLog('Run blocked: already done (0 matching cells).', 'error');
            showConfirm = false;
            return;
        }
        const direction = pendingDirection;
        showConfirm = false;
        confirmText = '';
        await runMigration(direction);
    }

    async function runMigration(direction) {
        isRunning = true;
        processed = 0;
        runTotal = 0;
        perTarget = {};
        lastSummary = null;
        runJson = null;
        failures = [];
        targetErrors = [];
        currentLabel = 'Scanning…';
        const startedAt = Date.now();
        const batches = [];
        // Ids already rejected by the database for a given target — sent back
        // as skip_ids so subsequent batches move past them instead of
        // re-fetching the same blocked rows forever.
        const failedIdsByTarget = {};
        let backupMissing = false;
        let aborted = false;
        let abortReason = '';

        pushLog(`Starting ${direction === 'reverse' ? 'ROLLBACK (new → old)' : 'migration (old → new)'} in batches of ${BATCH_SIZE}…`, 'info');

        try {
            // Authoritative database check: re-scan this direction live. If the
            // database reports zero matching cells, there is nothing to rewrite
            // (already done) — stop here instead of running batches.
            currentLabel = 'Checking database…';
            const fresh = await scanNow(direction);
            if (!fresh) {
                aborted = true;
                abortReason = 'Database check failed (scan produced no result).';
                pushLog(`✗ ${abortReason}`, 'error');
                showToast(abortReason, false);
                return;
            }
            const targets = (fresh.results ?? []).filter((r) => !r.skipped && r.count > 0);
            runTotal = fresh.total ?? 0;
            if (runTotal === 0) {
                const durationMs = Date.now() - startedAt;
                lastSummary = {
                    direction,
                    processed: 0,
                    planned: 0,
                    remaining: 0,
                    ok: true,
                    alreadyDone: true,
                    aborted: false,
                    abortReason: '',
                    backupMissing: false,
                    durationMs,
                    finishedAt: new Date().toISOString()
                };
                runJson = {
                    migration: 'pockethost-host',
                    oldHost: OLD_HOST,
                    newHost: NEW_HOST,
                    ...lastSummary,
                    batches
                };
                pushLog(direction === 'reverse'
                    ? 'Rollback already done — database reports 0 matching cells. Nothing rewritten.'
                    : 'Migration already done — database reports 0 matching cells. Nothing rewritten.', 'success');
                showToast(direction === 'reverse' ? 'Rollback already done — nothing to do.' : 'Migration already done — nothing to do.');
                return;
            }

            for (const target of targets) {
                const key = `${target.table}.${target.column}`;
                currentLabel = `${target.table}.${target.column}`;
                perTarget[key] = {processed: 0, total: target.count, done: false};
                pushLog(`→ ${key}: ${target.count} cell(s)…`, 'info');
                let guard = 0;
                let targetDone = false;
                while (!targetDone && guard < 2000) {
                    guard += 1;
                    const formData = new FormData();
                    formData.append('table', target.table);
                    formData.append('column', target.column);
                    formData.append('direction', direction);
                    formData.append('limit', String(BATCH_SIZE));
                    const knownFailed = failedIdsByTarget[key] ?? [];
                    if (knownFailed.length > 0) formData.append('skip_ids', knownFailed.join(','));
                    const result = await postAction('pockethost_batch', formData);
                    if (result.type !== 'success') {
                        targetErrors.push(`${key}: batch request failed (non-success action result).`);
                        pushLog(`✗ ${key}: request failed — skipping the rest of this target, continuing with the next.`, 'error');
                        break;
                    }
                    if (result.data?.status !== 200 && result.data?.status !== 207) {
                        const msg = result.data?.body?.message ?? 'batch rejected';
                        targetErrors.push(`${key}: ${msg}`);
                        pushLog(`✗ ${key}: ${msg} — skipping the rest of this target, continuing with the next.`, 'error');
                        break;
                    }
                    const batch = result.data.body.batch;
                    batches.push({table: target.table, column: target.column, ...batch});
                    if (batch.backupAvailable === false) backupMissing = true;
                    processed += batch.updated;
                    perTarget[key] = {
                        processed: (perTarget[key]?.processed ?? 0) + batch.updated,
                        total: target.count,
                        done: batch.done && batch.fetched < BATCH_SIZE
                    };
                    for (const c of (batch.changes ?? []).slice(0, 2)) {
                        pushLog(`  • id=${c.id}: ${c.before} → ${c.after}`, 'info');
                    }
                    if (batch.failed > 0) {
                        // Fault-tolerant: record the blocked rows, exclude them
                        // from subsequent batches, and keep going. A single row
                        // rejected by a DB trigger/policy must not stop the run —
                        // each was already retried once as your admin account.
                        const known = failedIdsByTarget[key] ?? (failedIdsByTarget[key] = []);
                        for (const fid of (batch.failedIds ?? [])) {
                            if (!known.includes(fid)) known.push(fid);
                        }
                        for (const msg of (batch.errors ?? [])) {
                            if (failures.length < 1000) {
                                const m = String(msg);
                                const idMatch = m.match(/id=([A-Za-z0-9_-]{1,64})/);
                                failures.push({
                                    table: target.table,
                                    column: target.column,
                                    id: idMatch ? idMatch[1] : null,
                                    message: m
                                });
                            }
                        }
                        pushLog(`⚠ ${key}: ${batch.failed} row(s) blocked by the database — skipped, continuing (${known.length} skipped in this target).`, 'error');
                        for (const msg of (batch.errors ?? []).slice(0, 2)) pushLog(`  ✗ ${msg}`, 'error');
                    }
                    if (batch.done || batch.fetched === 0) {
                        targetDone = true;
                        perTarget[key] = {...perTarget[key], done: true};
                        pushLog(`✓ ${key}: done (${perTarget[key].processed}/${target.count}).`, 'success');
                    }
                }
                if (guard >= 2000) {
                    targetErrors.push(`${key}: safety guard tripped (too many batches — updates may not be sticking).`);
                    pushLog(`✗ ${key}: safety guard tripped — moving on to the next target.`, 'error');
                }
            }

            // Verify against the database: re-scan the same direction live —
            // zero remaining means fully applied.
            currentLabel = 'Verifying against database…';
            const verify = await scanNow(direction);
            const remaining = verify?.total ?? -1;
            // The opposite direction's cached count is now stale (rows just
            // moved from one host to the other) — invalidate it so its button
            // re-enables and the next scan reads fresh numbers from the DB.
            if (direction === 'forward') reverseCount = null;
            else forwardCount = null;

            const durationMs = Date.now() - startedAt;
            // Blocked rows still contain the old host, so they show up in the
            // verify scan too. Anything remaining beyond the known-blocked ids
            // was never attempted (e.g. a target-level error cut it short).
            const failedUnique = Object.values(failedIdsByTarget).reduce((n, a) => n + a.length, 0);
            const unattempted = remaining >= 0 ? Math.max(0, remaining - failedUnique) : -1;
            const ok = !aborted && targetErrors.length === 0 && remaining === 0;
            const blockedOnly = !aborted && targetErrors.length === 0 && remaining > 0 && unattempted === 0;
            lastSummary = {
                direction,
                processed,
                planned: runTotal,
                remaining,
                failed: failedUnique,
                targetErrors,
                ok,
                blockedOnly,
                alreadyDone: false,
                aborted,
                abortReason,
                backupMissing,
                durationMs,
                finishedAt: new Date().toISOString()
            };
            runJson = {
                migration: 'pockethost-host',
                oldHost: OLD_HOST,
                newHost: NEW_HOST,
                ...lastSummary,
                failures: failures.slice(0, 1000),
                batches
            };

            if (ok) {
                pushLog(`Done in ${(durationMs / 1000).toFixed(1)}s — ${processed} cell(s) rewritten, 0 remaining.`, 'success');
                showToast(direction === 'reverse' ? 'Rollback complete!' : 'Migration complete!');
            } else if (blockedOnly) {
                pushLog(`Done in ${(durationMs / 1000).toFixed(1)}s — ${processed} rewritten, ${failedUnique} blocked by the database (see failures below).`, 'error');
                showToast(`Finished with ${failedUnique} blocked row(s) — see failures.`, false);
            } else if (aborted) {
                pushLog(`Stopped: ${abortReason}`, 'error');
                showToast(`Migration stopped: ${abortReason}`, false);
            } else {
                pushLog(`Finished with issues — ${remaining} cell(s) still match (${failedUnique} blocked, ${unattempted} not yet attempted). Re-run to retry.`, 'error');
                showToast(`Incomplete: ${remaining} remaining — re-run.`, false);
            }
        } finally {
            currentLabel = '';
            isRunning = false;
        }
    }

    function downloadLog() {
        if (!runJson) return;
        const blob = new Blob([JSON.stringify(runJson, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pockethost-migration-${runJson.direction}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }

    async function handleMigrationAvatars() {
        if (isMigrating) return;
        if (!confirm('Are you sure you want to migrate avatars?')) return;

        isMigrating = true;

        const toastId = toast.push('Migrating avatars...', {
            theme: {
                '--toastBackground': '#851919',
                '--toastBody': '#fff',
                '--toastProgress': '#fff',
            },
            duration: 100000,
        });

        const formData = new FormData();

        const response = await fetch('?/migrate_avatars', {
            method: 'POST',
            body: formData,
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push('Avatars migrated successfully!', {
                    theme: {
                        '--toastBackground': 'rgba(92,0,166,0.9)',
                        '--toastBody': '#fff',
                        '--toastProgress': '#fff',
                    },
                });
            } else {
                toast.push('Failed to migrate avatars!', {
                    theme: {
                        '--toastBackground': '#ff0000',
                        '--toastBody': '#fff',
                        '--toastProgress': '#fff',
                    },
                });
            }
        } else {
            toast.push('Failed to migrate avatars!', {
                theme: {
                    '--toastBackground': '#ff0000',
                    '--toastBody': '#fff',
                    '--toastProgress': '#fff',
                },
            });
        }

        isMigrating = false;
    }

    async function handleMigrationCovers(){
        if (isMigrating) return;
        if (!confirm('Are you sure you want to migrate covers?')) return;

        isMigrating = true;

        const toastId = toast.push('Migrating covers...', {
            theme: {
                '--toastBackground': '#851919',
                '--toastBody': '#fff',
                '--toastProgress': '#fff',
            },
            duration: 100000,
        });

        const formData = new FormData();

        const response = await fetch('?/migrate_covers', {
            method: 'POST',
            body: formData,
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());

        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push('Covers migrated successfully!', {
                    theme: {
                        '--toastBackground': 'rgba(92,0,166,0.9)',
                        '--toastBody': '#fff',
                        '--toastProgress': '#fff',
                    },
                });
            } else {
                toast.push('Failed to migrate covers!', {
                    theme: {
                        '--toastBackground': '#ff0000',
                        '--toastBody': '#fff',
                        '--toastProgress': '#fff',
                    },
                });
            }
        } else {
            toast.push('Failed to migrate covers!', {
                theme: {
                    '--toastBackground': '#ff0000',
                    '--toastBody': '#fff',
                    '--toastProgress': '#fff',
                },
            });
        }

        isMigrating = false;
    }
</script>

<div class="row mb-2">
    <div class="col text-center">
        <h2>Migrations</h2>
        <p class="text-danger alert alert-danger">DO NOT USE! MIGRATIONS HAVE ALREADY BEEN RAN!</p>
    </div>
</div>

<!-- Pockethost host migration (active) -->
<div class="row gy-3 mb-3">
    <div class="col-12">
        <div class="card border-warning">
            <div class="card-header bg-warning-subtle fw-bold"><i class="fas fa-right-left me-2" aria-hidden="true"></i>Pockethost Host Migration <span class="badge text-bg-warning ms-1">reversible</span></div>
            <div class="card-body">
                <p class="card-text">
                    Rewrite stored image URLs from
                    <code>{OLD_HOST}</code>
                    to
                    <code>{NEW_HOST}</code>
                    across Supabase (<code>profiles.avatar_url</code>, <code>profiles.cover_url</code>,
                    <code>book.cover_url</code>, plus embedded URLs in <code>book.description</code>,
                    <code>chapters.text</code>, <code>comments.content</code>).
                    Runs in small batches so progress is live and Vercel never times out.
                    Every rewritten cell is also appended to
                    <code>pockethost_host_migration_backup</code> when that table exists
                    (see <code>supabase/migrations/20260909000000_pockethost_host_migration_backup.sql</code>),
                    and the reverse direction restores the old host.
                </p>

                <div class="d-flex flex-wrap gap-2 justify-content-center mb-3">
                    <button type="button" class="btn btn-outline-secondary" disabled={!canRun} onclick={() => handleScan('forward')}>
                        {#if isScanning && scanDirection === 'forward'}<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Scanning…{:else}Scan old → new{/if}
                    </button>
                    <button type="button" class="btn btn-outline-secondary" disabled={!canRun} onclick={() => handleScan('reverse')}>
                        {#if isScanning && scanDirection === 'reverse'}<span class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>Scanning…{:else}Scan new → old (rollback preview){/if}
                    </button>
                    <button type="button" class="btn btn-purple" disabled={!canRun || forwardDone} title={forwardDone ? 'Already migrated — database reports 0 matching cells' : 'Rewrite old host to new host'} onclick={() => openConfirm('forward')}>
                        {forwardDone ? 'Migrated ✓ (already done)' : 'Migrate old → new'}
                    </button>
                    <button type="button" class="btn btn-outline-danger" disabled={!canRun || reverseDone} title={reverseDone ? 'Nothing to roll back — database reports 0 matching cells' : 'Rewrite new host back to old host'} onclick={() => openConfirm('reverse')}>
                        {reverseDone ? 'Nothing to roll back ✓' : 'Roll back new → old'}
                    </button>
                </div>

                {#if scanBody}
                    <div class="table-responsive mb-3">
                        <table class="table table-sm table-striped align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>Table</th>
                                    <th>Column</th>
                                    <th>Kind</th>
                                    <th class="text-end">Matching cells</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each scanBody.results as r (r.table + '.' + r.column)}
                                    {@const key = r.table + '.' + r.column}
                                    {@const prog = perTarget[key]}
                                    <tr>
                                        <td><code>{r.table}</code></td>
                                        <td><code>{r.column}</code></td>
                                        <td><span class="badge text-bg-secondary">{r.kind}</span></td>
                                        <td class="text-end">{r.skipped ? '—' : r.count}</td>
                                        <td>
                                            {#if r.skipped}
                                                <span class="badge text-bg-secondary" title={r.skipReason}>skipped</span>
                                            {:else if prog?.done}
                                                <span class="badge text-bg-success">done ({prog.processed}/{r.count})</span>
                                            {:else if isRunning && currentLabel === key}
                                                <span class="badge text-bg-primary">migrating… {prog?.processed ?? 0}/{r.count}</span>
                                            {:else if (prog?.processed ?? 0) > 0}
                                                <span class="badge text-bg-info">{prog.processed}/{r.count}</span>
                                            {:else}
                                                <span class="badge text-bg-light text-dark">{r.count === 0 ? 'clean' : 'pending'}</span>
                                            {/if}
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                            <tfoot>
                                <tr class="fw-bold">
                                    <td colspan="3">Total ({scanBody.direction})</td>
                                    <td class="text-end">{scanBody.total}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                {/if}

                {#if isRunning || processed > 0 || lastSummary}
                    <div class="mb-2 d-flex justify-content-between small">
                        <span>{currentLabel ? `Working on ${currentLabel}…` : (lastSummary ? 'Finished.' : 'Preparing…')}</span>
                        <span>{processed}/{runTotal} ({overallPct}%)</span>
                    </div>
                    <div class="progress mb-3" role="progressbar" aria-label="Migration progress" aria-valuenow={overallPct} aria-valuemin="0" aria-valuemax="100">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" style:width={overallPct + '%'}>{overallPct}%</div>
                    </div>
                {/if}

                {#if runLog.length > 0}
                    <div bind:this={logEl} class="migration-log border rounded p-2 mb-3" aria-live="polite">
                        {#each runLog as entry, i (i)}
                            <div class={['log-line', entry.kind === 'error' ? 'text-danger' : entry.kind === 'success' ? 'text-success' : '']}>
                                <span class="text-secondary">[{entry.time}]</span> {entry.message}
                            </div>
                        {/each}
                    </div>
                {/if}

                {#if lastSummary}
                    <div class="alert {lastSummary.ok ? 'alert-success' : lastSummary.blockedOnly ? 'alert-warning' : 'alert-danger'}" role="alert">
                        {#if lastSummary.alreadyDone}
                            <strong>{lastSummary.direction === 'reverse' ? 'Rollback already done!' : 'Migration already done!'}</strong>
                            The database reports 0 matching cells — nothing was rewritten.
                        {:else if lastSummary.ok}
                            <strong>{lastSummary.direction === 'reverse' ? 'Rollback complete!' : 'Migration complete!'}</strong>
                            {lastSummary.processed} cell(s) rewritten in {(lastSummary.durationMs / 1000).toFixed(1)}s, 0 remaining.
                        {:else if lastSummary.blockedOnly}
                            <strong>Finished with {lastSummary.failed} blocked row(s).</strong>
                            {lastSummary.processed} cell(s) rewritten; the rest were rejected by the database (each retried once as your admin account) and skipped — see failures below. Fix the cause, then re-run to retry just those rows.
                        {:else if lastSummary.aborted}
                            <strong>Stopped.</strong> {lastSummary.abortReason} Re-run after fixing the issue — already-rewritten rows are skipped automatically.
                        {:else}
                            <strong>Incomplete.</strong> {lastSummary.remaining} cell(s) still match ({lastSummary.failed ?? 0} blocked, {Math.max(0, (lastSummary.remaining ?? 0) - (lastSummary.failed ?? 0))} not yet attempted) — re-run to continue ({lastSummary.processed} done so far).
                        {/if}
                        {#if (lastSummary.targetErrors ?? []).length > 0}
                            <ul class="mt-2 mb-0 small">
                                {#each lastSummary.targetErrors as terr (terr)}
                                    <li>{terr}</li>
                                {/each}
                            </ul>
                        {/if}
                        {#if lastSummary.backupMissing}
                            <div class="mt-1 small">Note: <code>pockethost_host_migration_backup</code> table was not found, so no audit rows were stored this run. Apply the SQL in <code>supabase/migrations/</code> to enable the audit trail (rollback still works via string replace).</div>
                        {/if}
                        <div class="mt-2">
                            <button type="button" class="btn btn-sm btn-outline-dark" onclick={downloadLog} disabled={!runJson}>Download run JSON</button>
                        </div>
                    </div>
                    {#if failures.length > 0}
                        {#if policyHint}
                            <div class="alert alert-warning small" role="alert">
                                These rejections come <strong>from inside the database</strong> (a trigger or policy — the app already verified you as admin, and service-role bypasses RLS but <em>not</em> triggers).
                                Check <strong>Supabase Dashboard → Database → Triggers</strong> on the failing tables (e.g. a rule guarding avatar changes), or fix the flagged rows and re-run — already-migrated rows are skipped automatically.
                            </div>
                        {/if}
                        <div class="table-responsive mb-3">
                            <table class="table table-sm table-striped align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>Table</th>
                                        <th>Column</th>
                                        <th>Record id</th>
                                        <th>Database message</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each failures.slice(0, 50) as f (f.table + '.' + f.column + '.' + f.id)}
                                        <tr>
                                            <td><code>{f.table}</code></td>
                                            <td><code>{f.column}</code></td>
                                            <td><code>{f.id ?? '—'}</code></td>
                                            <td class="small">{f.message}</td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                        {#if failures.length > 50}
                            <p class="small text-secondary">…and {failures.length - 50} more — all {failures.length} are included in the downloaded run JSON.</p>
                        {/if}
                    {/if}
                {/if}
            </div>
        </div>
    </div>

    <div class="col-12">
        <div class="card">
            <div class="card-header"><i class="fas fa-triangle-exclamation me-2" aria-hidden="true"></i>Migrate Avatars</div>
            <div class="card-body text-center">
                <p class="card-text">Migrate avatars from the old system to the new system.</p>
                <button type="button" class="btn btn-purple disabled" disabled onclick={handleMigrationAvatars}>Migrate Avatars</button>
            </div>
        </div>
    </div>
    <!-- migrate covers -->
    <div class="col-12">
        <div class="card">
            <div class="card-header"><i class="fas fa-triangle-exclamation me-2" aria-hidden="true"></i>Migrate Covers</div>
            <div class="card-body text-center">
                <p class="card-text">Migrate covers from the old system to the new system.</p>
                <button type="button" class="btn btn-purple disabled" disabled onclick={handleMigrationCovers}>Migrate Covers</button>
            </div>
        </div>
    </div>
</div>

<!-- Confirm modal (no native confirm(): explicit warning + type-to-confirm) -->
{#if showConfirm}
    <div class="modal-backdrop show"></div>
    <div class="modal show d-block" tabindex="-1" role="dialog" aria-modal="true" aria-label="Confirm migration">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-{pendingDirection === 'reverse' ? 'danger' : 'warning'}">
                <div class="modal-header">
                    <h5 class="modal-title">{pendingDirection === 'reverse' ? 'Confirm ROLLBACK (new → old)' : 'Confirm MIGRATION (old → new)'}</h5>
                    <button type="button" class="btn-close" aria-label="Close" disabled={isRunning} onclick={() => { showConfirm = false; }}></button>
                </div>
                <div class="modal-body">
                    <div class="alert {pendingDirection === 'reverse' ? 'alert-danger' : 'alert-warning'}" role="alert">
                        {#if pendingDirection === 'reverse'}
                            This will rewrite <code>{NEW_HOST}</code> back to <code>{OLD_HOST}</code> in every matched Supabase cell listed above. Use it only if the forward migration caused a problem.
                        {:else}
                            This will rewrite <code>{OLD_HOST}</code> to <code>{NEW_HOST}</code> in every matched Supabase cell listed above. Make sure the new PocketHost instance (<code>{NEW_HOST}</code>) is live and serving the same files first.
                        {/if}
                    </div>
                    <ul class="small mb-3">
                        <li>Runs in small batches with live progress; you can watch each table drain.</li>
                        <li>Fault-tolerant: rows the database rejects (e.g. a trigger guarding avatar changes) are automatically retried once as your admin account, then skipped and reported — they never stop the run. Re-run after fixing to retry just those rows.</li>
                        <li>Reversible: run the opposite direction to undo. Already-rewritten rows are skipped on re-run.</li>
                        <li>Writes an audit row per cell to <code>pockethost_host_migration_backup</code> when that table exists.</li>
                        {#if pendingAlreadyDone}
                            <li><strong>Already done:</strong> the last database scan found <strong>0 matching cells</strong> for this direction — confirming will simply re-check the database and report back without rewriting anything.</li>
                        {:else if scanBody}
                            <li>Last scan ({scanBody.direction}): <strong>{scanBody.total} matching cell(s)</strong>. A fresh database check runs again before the first batch.</li>
                        {:else}
                            <li>No scan yet — a fresh database check runs automatically before the first batch.</li>
                        {/if}
                    </ul>
                    <label class="form-label fw-bold" for="confirm-input">Type <code>{confirmWord}</code> to enable the button:</label>
                    <input id="confirm-input" class="form-control" type="text" autocomplete="off" placeholder={confirmWord} bind:value={confirmText} />
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick={() => { showConfirm = false; }}>Cancel</button>
                    <button type="button" class="btn {pendingDirection === 'reverse' ? 'btn-danger' : 'btn-warning'}" disabled={!confirmOk} onclick={confirmAndRun}>
                        {pendingDirection === 'reverse' ? 'Roll back now' : 'Migrate now'}
                    </button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .migration-log {
        max-height: 260px;
        overflow-y: auto;
        background: rgba(0, 0, 0, 0.35);
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.8rem;
    }

    .log-line {
        padding: 0.1rem 0;
        overflow-wrap: anywhere;
    }

    .modal-backdrop.show {
        opacity: 0.6;
    }
</style>
