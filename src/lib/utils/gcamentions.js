import { resolveImageUrl, escapeHtml } from '$lib/utils/images.js';
import {browser} from "$app/environment";

let cachedMentions = null;
let abortController;

/**
 * Enable tooltips on mentions.
 * They should be in the format of:
 *
 * \<a href="/profile/123" class="mention" data-mention-id="123">@username\</a>
 *
 * @param supabase
 * */
export async function mentionTooltip(supabase) {
    if (!browser) return;

    // To delete the listener.
    abortController = new AbortController();
    const signal = abortController.signal;

    document.body.addEventListener('mouseover', async (e) => listenerMentions(e, supabase), { signal });
}

/**
 * Private function async tooltips
 * */
export async function listenerMentions(e, supabase) {
    // Hacky way to keep support of older mentions "workarounds" (such as @mentions with a link attached).
    if (e.target.tagName === 'A' && e.target.href.includes('profile/') && !e.target.hasAttribute('data-mention-id') && e.target.innerText.startsWith('@')) {
        const userId = e.target.href.split('profile/')[1];
        e.target.setAttribute('data-mention-id', userId);
        e.target.classList.add('mention');
    }
    if (e.target.classList.contains('mention')) {
        const userId = e.target.getAttribute('data-mention-id');

        if (!cachedMentions || !cachedMentions.find((u) => u.id === userId)) {
            const user = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .eq('id', userId)
                .single();

            if (user.error) {
                console.error('Error fetching user:', user.error);
                return;
            }

            if (!cachedMentions) {
                cachedMentions = [user.data];
            } else {
                cachedMentions.push(user.data);
            }
        }

        const user = cachedMentions.find((u) => u.id === userId);
        const tooltip = document.createElement('div');
        tooltip.classList.add('mention-tooltip');
        // Build tooltip with DOM APIs to avoid stored XSS via username/avatar_url.
        const row = document.createElement('div');
        row.className = 'd-flex align-items-center';
        const img = document.createElement('img');
        img.src = resolveImageUrl(user.avatar_url);
        img.alt = `${user.username ?? 'user'} avatar`;
        img.className = 'rounded-circle';
        img.style.width = '50px';
        img.style.height = '50px';
        img.loading = 'lazy';
        const label = document.createElement('span');
        label.className = 'ms-2';
        label.textContent = user.username ?? 'user';
        // Keep escaped HTML string only as fallback structure (no raw interpolation)
        void escapeHtml;
        row.appendChild(img);
        row.appendChild(label);
        tooltip.appendChild(row);

        tooltip.style.position = 'absolute';
        tooltip.style.top = e.pageY + 'px';
        tooltip.style.left = e.pageX + 'px';
        // Keep in sync with tooltipConfig in gcacommons.js (svelte-tooltip-gca purple theme).
        tooltip.style.backgroundColor = 'rgba(92,0,166,0.9)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '10px';
        tooltip.style.borderRadius = '5px';
        tooltip.style.fontSize = '0.875rem';
        tooltip.style.maxWidth = '300px';
        tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.transition = 'opacity 0.15s';
        tooltip.style.opacity = 0;

        document.body.appendChild(tooltip);

        setTimeout(() => {
            tooltip.style.opacity = 1;
        }, 50);

        e.target.addEventListener('mouseout', () => {
            tooltip.remove();
            document.querySelectorAll('.mention-tooltip').forEach((el) => el.remove());
        });

        // On click, destroy
        e.target.addEventListener('click', () => {
            tooltip.remove();
            document.querySelectorAll('.mention-tooltip').forEach((el) => el.remove());
        });

        e.target.addEventListener('mousemove', (ev) => {
            tooltip.style.top = ev.pageY + 'px';
            tooltip.style.left = ev.pageX + 'px';
        });
    }
}

/**
 * Remove mouseover listener for mentions.
 * */
export async function removeMentionListener() {
    if (abortController) {
        abortController.abort();
    }
    await removeMentionTooltips();
}

/**
 * Remove all mention tooltips.
 */
export async function removeMentionTooltips() {
    if (browser) document.querySelectorAll('.mention-tooltip').forEach((el) => el.remove());
}