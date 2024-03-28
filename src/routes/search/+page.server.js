export const load = async ( { params, url, locals: { supabase, /*getSession, s3*/ } }) => {
    const query = url.searchParams.get('q');
    const tags = url.searchParams.get('tag');
    let empty = [];

    if (!query && !tags) {
        return {
            searchResults: empty,
            partialText: ''
        }
    }

    const partial_text = queryBuilder(tags, query);

    let {data: searchResults, error} = await supabase
        .rpc('search_content_sorted', {partial_text})
        .range(0, 10);

    if (error) {
        console.error(error);
        return {
            status: 500,
            body: {
                message: error.message
            }
        }
    }

    return { searchResults, partialText: partial_text }
}

export const actions = {
    loadmore: async ({request, url, locals: {supabase, getSession}}) => {
        const formData = await request.formData();

        const page = formData.get("page");
        const step = 10;

        const query = url.searchParams.get('q');
        const tags = url.searchParams.get('tag');
        let empty = [];

        if (!query && !tags) {
            return {
                searchResults: empty
            }
        }

        const partial_text = queryBuilder(tags, query);

        let {data: searchResults, error} = await supabase
            .rpc('search_content_sorted', {partial_text})
            .range(page * step, page * (step + 1));

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
}

function queryBuilder(tags, query) {
    if (tags != null && query != null) {
        return tags + ' ' + query;
    } else if (tags != null) {
        return tags;
    } else {
        return query;
    }
}