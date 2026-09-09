import { PUBLIC_SUPABASE_URL, PUBLIC_POCKETBASE_URL_IMG_API } from '$env/static/public';
import { SUPABASE_SECRET_KEY } from '$env/static/private';
import {createClient} from "@supabase/supabase-js";
import {isAdmin} from "$lib/utils/misc.js";
import {buildFileUrl, createSuperuserClient} from "$lib/server/pocketbase.js";
import {
	DIRECTIONS,
	MIGRATION_TARGETS,
	NEW_HOST,
	NEW_SUBSTRING,
	OLD_HOST,
	OLD_SUBSTRING,
	findTarget,
	migrateBatch,
	parseSkipIds,
	scanAll
} from "$lib/server/pockethost-migration.js";

function createAdminSupabase() {
	return createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});
}

export const load = async ( { locals: { supabase, getSession } }) => {
    const {session} = await getSession();

    const result = await isAdmin(session, supabase);
    if (result !== true) return result;

    return {
        title: 'Admin - Migrations',
        description: 'Admin Migrations Dashboard of DreamingDragons platform.',
        index: false
    }
}

export const actions = {
    migrate_avatars: async ({request, locals: {supabase, getSession}}) => {
        const {session} = await getSession();

        const result = await isAdmin(session, supabase);
        if (result !== true) {
            return result;
        }

        const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const pb = await createSuperuserClient();
        try {
        // Get all profiles
        const {data: profiles, error: profilesError} = await supabase
            .from('profiles')
            .select('*');

        if (profilesError) {
            console.error(profilesError);
            return {
                status: 500,
                body: {
                    message: "Error fetching profiles"
                }
            }
        }

        if (!profiles || profiles.length === 0) {
            return {
                status: 200,
                body: {
                    message: "No profiles found"
                }
            }
        }

        for (const profile of profiles) {
            if (profile.avatar_url && profile.avatar_url !== '' && !profile.avatar_url.startsWith(PUBLIC_POCKETBASE_URL_IMG_API)) {

                const {data: avatarData, error: avatarError} = await adminSupabase.storage
                    .from('avatars')
                    .download(profile.avatar_url);


                if (avatarError) {
                    console.error(avatarError);
                    console.log('Error downloading avatar:', profile);
                    continue;
                }

                const file = new File([avatarData], profile.avatar_url, {type: 'image/webp', lastModified: Date.now()});

                const formData = new FormData();
                formData.append('image', file);
                formData.append('user_id', profile.id);

                const createdRecord = await pb.collection('profiles_media').create(formData);
                const finalUrl = buildFileUrl(pb, createdRecord, createdRecord.image);

                // Update the avatar_url in profiles
                const {error: updateError} = await adminSupabase
                    .from('profiles')
                    .update({
                    avatar_url: finalUrl
                    })
                    .eq('id', profile.id);

                if (updateError) {
                    console.error(updateError);
                    return {
                        status: 500,
                        body: {
                            message: "Error updating profile"
                        }
                    }
                }

                console.log(`Migrated ${profile.id} avatar successfully!`);
            }
        }

        return {
            status: 200,
            body: {
                message: "Avatars migrated successfully"
            }
        }
        } finally {
            pb.authStore.clear();
        }
    },
    migrate_covers: async ({request, locals: {supabase, getSession}}) => {
        const {session} = await getSession();

        const result = await isAdmin(session, supabase);
        if (result !== true) {
            return result;
        }

        const adminSupabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const pb = await createSuperuserClient();
        try {
        // Get all profiles
        const {data: profiles, error: profilesError} = await supabase
            .from('profiles')
            .select('*');

        if (profilesError) {
            console.error(profilesError);
            return {
                status: 500,
                body: {
                    message: "Error fetching profiles"
                }
            }
        }

        if (!profiles || profiles.length === 0) {
            return {
                status: 200,
                body: {
                    message: "No profiles found"
                }
            }
        }

        for (const profile of profiles) {
            if (profile.cover_url && profile.cover_url !== '' && !profile.cover_url.startsWith(PUBLIC_POCKETBASE_URL_IMG_API)) {
                const {data: coverData, error: coverError} = await adminSupabase.storage
                    .from('avatars')
                    .download(profile.cover_url);

                if (coverError) {
                    console.error(coverError);
                    console.log('Error downloading cover:', profile);
                    continue;
                }

                const file = new File([coverData], profile.cover_url, {type: 'image/webp', lastModified: Date.now()});

                const formData = new FormData();
                formData.append('image', file);
                formData.append('user_id', profile.id);

                const createdRecord = await pb.collection('profiles_media').create(formData);
                const finalUrl = buildFileUrl(pb, createdRecord, createdRecord.image);

                // Update the cover_url in profiles
                const {error: updateError} = await adminSupabase
                    .from('profiles')
                    .update({
                        cover_url: finalUrl
                    })
                    .eq('id', profile.id);

                if (updateError) {
                    console.error(updateError);
                    return {
                        status: 500,
                        body: {
                            message: "Error updating profile"
                        }
                    }
                }

                console.log(`Migrated ${profile.id} cover successfully!`);
            }
        }

        return {
            status: 200,
            body: {
                message: "Covers migrated successfully"
            }
        }
        } finally {
            pb.authStore.clear();
        }
    },
    pockethost_scan: async ({request, locals: {supabase, getSession}}) => {
        const {session} = await getSession();

        const result = await isAdmin(session, supabase);
        if (result !== true) {
            return result;
        }

        const formData = await request.formData();
        const direction = String(formData.get('direction') ?? 'forward');
        if (!DIRECTIONS.includes(direction)) {
            return {
                status: 400,
                body: {
                    message: "Invalid direction (expected 'forward' or 'reverse')"
                }
            }
        }

        const adminSupabase = createAdminSupabase();
        const scan = await scanAll(adminSupabase, direction);

        return {
            status: 200,
            body: {
                message: "Scan complete",
                direction,
                oldHost: OLD_HOST,
                newHost: NEW_HOST,
                oldSubstring: OLD_SUBSTRING,
                newSubstring: NEW_SUBSTRING,
                targets: MIGRATION_TARGETS.map((t) => ({
                    table: t.table,
                    column: t.column,
                    kind: t.kind
                })),
                results: scan.targets,
                total: scan.total
            }
        }
    },
    pockethost_batch: async ({request, locals: {supabase, getSession}}) => {
        const {session} = await getSession();

        const result = await isAdmin(session, supabase);
        if (result !== true) {
            return result;
        }

        const formData = await request.formData();
        const table = String(formData.get('table') ?? '');
        const column = String(formData.get('column') ?? '');
        const direction = String(formData.get('direction') ?? 'forward');
        const limit = Math.min(Math.max(parseInt(String(formData.get('limit') ?? '50'), 10) || 50, 1), 200);
        // Ids previously rejected by the database — exclude so the run can
        // continue past them instead of fetching the same blocked rows again.
        const skipIds = parseSkipIds(formData.get('skip_ids') ?? '');

        if (!DIRECTIONS.includes(direction)) {
            return {
                status: 400,
                body: {
                    message: "Invalid direction (expected 'forward' or 'reverse')"
                }
            }
        }

        const target = findTarget(table, column);
        if (!target) {
            return {
                status: 400,
                body: {
                    message: "Unknown migration target (table/column not in allowlist)"
                }
            }
        }

        const adminSupabase = createAdminSupabase();
        // Pass the verified admin's own client as a fallback identity:
        // permission triggers reading auth.uid() reject service-role (NULL
        // uid) but may accept the real admin JWT.
        const batch = await migrateBatch(adminSupabase, target, direction, limit, skipIds, supabase);

        if (batch.failed > 0) {
            console.error(`Pockethost migration ${direction} ${table}.${column} batch: ${batch.failed} failed`, batch.errors);
        }

        return {
            status: batch.failed > 0 ? 207 : 200,
            body: {
                message: batch.failed > 0
                    ? `Batch partially failed (${batch.updated} updated, ${batch.failed} failed)`
                    : `Batch processed (${batch.updated} updated)`,
                batch
            }
        }
    }
}