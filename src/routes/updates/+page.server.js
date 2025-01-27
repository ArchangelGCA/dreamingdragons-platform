export const load = async ( { locals: { supabase } }) => {
    const { data: updates, error } = await supabase
        .from('website_updates')
        .select('*')
        .order('created_at', {ascending: false});

    if (error) {
        console.error(error);
        return errorx(500, "Error fetching updates, please try again later...")
    }

    return {
        updates,
        title: 'DreamingDragons - Updates',
        description: 'Updates and changelogs of the DreamingDragons platform.'
    }
}