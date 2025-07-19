import {error as errorx} from '@sveltejs/kit';

export const load = async ({params, locals: {supabase, getSession}}) => {
    const {session} = await getSession();
    const {gallery_id} = params;

    const {data: gallery, error} = await supabase
        .from('gallery')
        .select('*, owner:profiles(*), gallery_books(*, book(*, profiles:owner_id(id, username, avatar_url), book_likes(user_id)))')
        .eq('id', gallery_id)
        .single();

    if (error || !gallery) {
        console.error(error);
        throw errorx(404, 'Gallery not found');
    }

    // filter out hidden books and process likes
    if (gallery.gallery_books) {
        gallery.gallery_books = gallery.gallery_books.filter(gb => gb.book && !gb.book.hidden);

        // Process likes data for each book
        gallery.gallery_books.forEach(gb => {
            if (gb.book) {
                // Calculate likes count
                gb.book.likes = gb.book.book_likes ? gb.book.book_likes.length : 0;

                // Check if user has liked this book
                if (session && gb.book.book_likes) {
                    gb.book.is_liked = gb.book.book_likes.some(like => like.user_id === session.user.id);
                } else {
                    gb.book.is_liked = false;
                }
            }
        });
    }

    return {
        gallery,
        session,
        title: `${gallery.name} - Gallery`,
        description: gallery.description
    };
};

export const actions = {
    like: async ({request, locals: {supabase, getSession}}) => {
        const formData = Object.fromEntries(await request.formData());
        const {session} = await getSession();

        if (!session) {
            return {
                status: 401,
                body: {
                    message: "You need to be logged in to like content"
                }
            }
        }

        const contentId = formData.contentId;
        const userId = session.user.id;

        if (contentId === null) {
            return {
                status: 400,
                body: {
                    message: "Missing required fields"
                }
            }
        }

        const {data: likes, error} = await supabase
            .from('book_likes')
            .select('*')
            .eq('book_id', contentId)
            .eq('user_id', userId);

        if (error) {
            console.error(error);
            return {
                status: 500,
                body: {
                    message: error.message
                }
            }
        }

        const action = likes.length === 0 ? 'added' : 'removed';

        if (likes.length === 0) {
            const {error} = await supabase
                .from('book_likes')
                .insert([{book_id: contentId, user_id: userId}]);

            if (error) {
                console.error(error);
                return {
                    status: 500,
                    body: {
                        message: error.message
                    }
                }
            }
        } else {
            const {error} = await supabase
                .from('book_likes')
                .delete()
                .eq('book_id', contentId)
                .eq('user_id', userId);

            if (error) {
                console.error(error);
                return {
                    status: 500,
                    body: {
                        message: error.message
                    }
                }
            }
        }

        return {
            status: 200,
            body: {
                message: `Like ${action} successfully`
            }
        }
    }
};
