import { error as errorx } from '@sveltejs/kit';

export const load = async ({ params, locals: { supabase } }) => {
    const { gallery_id } = params;

    const { data: gallery, error } = await supabase
        .from('gallery')
        .select('*, owner:profiles(*), gallery_books(*, book(*, profiles:owner_id(id, username, avatar_url)))')
        .eq('id', gallery_id)
        .single();

    if (error || !gallery) {
        console.error(error);
        throw errorx(404, 'Gallery not found');
    }

    // filter out hidden books
    if (gallery.gallery_books) {
        gallery.gallery_books = gallery.gallery_books.filter(gb => gb.book && !gb.book.hidden);
    }

    return {
        gallery,
        title: `${gallery.name} - Gallery`,
        description: gallery.description
    };
};
