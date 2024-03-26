export const load = async ( { params, url, locals: { supabase, /*getSession, s3*/ } }) => {
    const query = url.searchParams.get('q');
    const tags = url.searchParams.get('tag');
    let empty = [];

    if (!query && !tags) {
        return {
            searchResults: empty
        }
    }

    let partial_text = '';
    if (tags != null && query != null) {
        partial_text = tags + ' ' + query;
    } else if (tags != null) {
        partial_text = tags;
    } else {
        partial_text = query;
    }

    let {data: searchResults, error} = await supabase
        .rpc('search_content_sorted', {partial_text}); // TODO: pagination


    if (error) {
        console.error(error);
        return {
            status: 500,
            body: {
                message: error.message
            }
        }
    }

    return { searchResults }
}