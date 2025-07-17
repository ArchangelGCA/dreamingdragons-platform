import { error as errorx, redirect } from '@sveltejs/kit';

export const load = async ({locals: {supabase, getSession}, parent}) => {
    const {session} = await getSession();
    if (!session) {
        throw redirect(303, '/login');
    }

    const { image_proxy } = await parent();

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', session.user.id)
        .single();

    if (profileError) {
        console.error(profileError);
        throw errorx(500, 'Error fetching profile');
    }

    if (!profile) {
        throw redirect(303, '/profile');
    }

    const { data: galleries, error: galleriesError } = await supabase
        .from('gallery')
        .select('*, gallery_books(*, book(id, title, cover_url))')
        .eq('owner_id', session.user.id);

    if (galleriesError) {
        console.error(galleriesError);
        throw errorx(500, 'Error fetching galleries');
    }

    const { data: userBooks, error: booksError } = await supabase
        .from('book')
        .select('id, title, cover_url')
        .eq('owner_id', session.user.id)
        .eq('hidden', false);

    if (booksError) {
        console.error(booksError);
        throw errorx(500, 'Error fetching user books');
    }

    return {
        profile,
        galleries,
        userBooks,
        image_proxy
    };
};

export const actions = {
    saveGallery: async ({ request, locals: { supabase, getSession } }) => {
        const {session} = await getSession();
        if (!session) {
            throw errorx(401, 'Unauthorized');
        }

        const formData = await request.formData();
        const id = formData.get('id');
        const name = formData.get('name');
        const description = formData.get('description');

        let galleryData;
        let error;

        if (id) {
            // Update existing gallery
            ({ data: galleryData, error } = await supabase
                .from('gallery')
                .update({ name, description})
                .eq('id', id)
                .eq('owner_id', session.user.id)
                .select()
                .single());
        } else {
            // Create new gallery
            ({ data: galleryData, error } = await supabase
                .from('gallery')
                .insert({ name, description, owner_id: session.user.id })
                .select()
                .single());
        }

        if (error) {
            console.error(error);
            return {
                status: 500,
                body: { message: 'Error saving gallery' }
            };
        }

        return {
            status: 200,
            body: galleryData
        };
    },

    deleteGallery: async ({ request, locals: { supabase, getSession } }) => {
        const {session} = await getSession();
        if (!session) {
            throw errorx(401, 'Unauthorized');
        }

        const formData = await request.formData();
        const id = formData.get('id');

        const { error } = await supabase
            .from('gallery')
            .delete()
            .eq('id', id)
            .eq('owner_id', session.user.id);

        if (error) {
            console.error(error);
            return {
                status: 500,
                body: { message: 'Error deleting gallery' }
            };
        }

        return {
            status: 200,
            body: { message: 'Gallery deleted' }
        };
    },

    addBookToGallery: async ({ request, locals: { supabase, getSession } }) => {
        const {session} = await getSession();
        if (!session) {
            throw errorx(401, 'Unauthorized');
        }

        const formData = await request.formData();
        const gallery_id = formData.get('gallery_id');
        const book_id = formData.get('book_id');

        // Verify owner of gallery
        const { data: gallery, error: galleryError } = await supabase
            .from('gallery')
            .select('owner_id')
            .eq('id', gallery_id)
            .single();

        if (galleryError || !gallery || gallery.owner_id !== session.user.id) {
             return {
                status: 403,
                body: { message: 'You do not own this gallery.' }
            };
        }

        const { error } = await supabase
            .from('gallery_books')
            .insert({ gallery_id, book_id });

        if (error) {
            console.error(error);
            if (error.code === '23505') {
                 return {
                    status: 409,
                    body: { message: 'Book is already in this gallery.' }
                };
            }
            return {
                status: 500,
                body: { message: 'Error adding book to gallery' }
            };
        }

        return {
            status: 200,
            body: { message: 'Book added to gallery' }
        };
    },

    removeBookFromGallery: async ({ request, locals: { supabase, getSession } }) => {
        const {session} = await getSession();
        if (!session) {
            throw errorx(401, 'Unauthorized');
        }

        const formData = await request.formData();
        const gallery_id = formData.get('gallery_id');
        const book_id = formData.get('book_id');

        // Verify owner of gallery
        const { data: gallery, error: galleryError } = await supabase
            .from('gallery')
            .select('owner_id')
            .eq('id', gallery_id)
            .single();

        if (galleryError || !gallery || gallery.owner_id !== session.user.id) {
             return {
                status: 403,
                body: { message: 'You do not own this gallery.' }
            };
        }

        const { error } = await supabase
            .from('gallery_books')
            .delete()
            .eq('gallery_id', gallery_id)
            .eq('book_id', book_id);

        if (error) {
            console.error(error);
            return {
                status: 500,
                body: { message: 'Error removing book from gallery' }
            };
        }

        return {
            status: 200,
            body: { message: 'Book removed from gallery' }
        };
    }
};
