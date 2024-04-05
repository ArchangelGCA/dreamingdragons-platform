import {error as errorx, redirect} from "@sveltejs/kit";

export const load = async ({ params, locals: { supabase, getSession} }) => {
    const session = await getSession();

    if (!session) {
        throw redirect(303, '/login');
    }

    if (!params.book){
        errorx(400, "Missing required fields");
        return;
    }

    const sessionUserId = session.user.id;
    const bookId = params.book;

    const {data: bookSearch, error} = await supabase
        .from('book')
        .select('*, chapters(id, title), book_tags(tags(id, name))')
        .eq('id', bookId)
        .eq('owner_id', sessionUserId);

    if (error){
        errorx(500, 'Something went wrong, perhaps the IDs may be invalid or you are\'t the owner of this Content...');
        return;
    }

    if (!bookSearch || bookSearch.length === 0) {
        errorx(404, "Content not found OR you are not the owner of this Content...");
        return;
    }

     const book = bookSearch[0];

    return { book };
}

export const actions = {
    tagsuggestions: async ({ request, locals: { supabase, getSession } }) => {
        const session = await getSession();

        if (!session) {
            return {
                status: 401,
                body: {
                    message: "Unauthorized"
                }
            }
        }

        const formData = Object.fromEntries(await request.formData());
        const tag = formData.tag;

        if (tag === null || tag === undefined || tag === "") {
            return {
                status: 200,
                body: []
            }
        }

        const { data, error } = await supabase.rpc('get_similar_tags', {
            partial_tag: tag
        });

        if (error) {
            return {
                status: 500,
                body: {
                    message: error.message
                }
            }
        }

        return {
            status: 200,
            body: data
        }
    }
}