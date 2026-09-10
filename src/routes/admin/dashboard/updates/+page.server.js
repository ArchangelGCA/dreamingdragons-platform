import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SECRET_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js';
import { isAdmin } from '$lib/utils/misc.js';
import { sanitizeUpdateHtml, UPDATE_CONTENT_MAX_LENGTH } from '$lib/utils/changelog.js';

/**
 * Admin console for the public /updates feed (Supabase `website_updates`).
 * Reads go through the session-bound client; writes use the service-role
 * client only after `isAdmin` passes (same pattern as migrations/newsletter).
 */

function createAdminSupabase() {
	return createClient(PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	});
}

export const load = async ({ locals: { supabase, getSession } }) => {
	const { session } = await getSession();

	const result = await isAdmin(session, supabase);
	if (result !== true) {
		return result;
	}

	const { data: updates, error } = await supabase
		.from('website_updates')
		.select('*')
		.order('created_at', { ascending: false })
		.limit(15);

	if (error) {
		console.error(error);
		return {
			title: 'Admin - Updates',
			description: 'Publish website updates of the DreamingDragons platform.',
			index: false,
			updates: [],
			loadError: true
		};
	}

	return {
		title: 'Admin - Updates',
		description: 'Publish website updates of the DreamingDragons platform.',
		index: false,
		updates: updates ?? []
	};
};

export const actions = {
	publish_update: async ({ request, locals: { supabase, getSession } }) => {
		const { session } = await getSession();

		const result = await isAdmin(session, supabase);
		if (result !== true) {
			return result;
		}

		const formData = await request.formData();
		const rawContent = String(formData.get('content') ?? '').trim();
		const id = String(formData.get('id') ?? '').trim();

		if (!rawContent || rawContent.length > UPDATE_CONTENT_MAX_LENGTH) {
			return {
				status: 400,
				body: {
					message: rawContent
						? `Update too long (max ${UPDATE_CONTENT_MAX_LENGTH} characters)`
						: 'Update content is empty'
				}
			};
		}

		const content = sanitizeUpdateHtml(rawContent);
		const adminSupabase = createAdminSupabase();

		const query = id
			? adminSupabase.from('website_updates').update({ content }).eq('id', id)
			: adminSupabase.from('website_updates').insert({ content });

		const { data, error } = await query.select().single();

		if (error) {
			console.error(error);
			return {
				status: 500,
				body: {
					message: id ? 'Error saving the update' : 'Error publishing the update'
				}
			};
		}

		return {
			status: 200,
			body: {
				message: id ? 'Update saved!' : 'Update published!',
				update: data
			}
		};
	},
	delete_update: async ({ request, locals: { supabase, getSession } }) => {
		const { session } = await getSession();

		const result = await isAdmin(session, supabase);
		if (result !== true) {
			return result;
		}

		const formData = await request.formData();
		const id = String(formData.get('id') ?? '').trim();

		if (!id || !/^[A-Za-z0-9-]{1,64}$/.test(id)) {
			return {
				status: 400,
				body: {
					message: 'Missing or invalid update id'
				}
			};
		}

		const adminSupabase = createAdminSupabase();
		const { error } = await adminSupabase.from('website_updates').delete().eq('id', id);

		if (error) {
			console.error(error);
			return {
				status: 500,
				body: {
					message: 'Error deleting the update'
				}
			};
		}

		return {
			status: 200,
			body: {
				message: 'Update deleted.',
				id
			}
		};
	}
};
