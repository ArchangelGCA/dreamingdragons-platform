export const load = async ( { params, url, locals: { supabase, /*getSession,*/ } }) => {
    const query = url.searchParams.get('q');
    const tags = url.searchParams.get('tag');
    let empty = [];

    const results = {
        searchResults: empty,
        partialText: ''
    }

    if (!query && !tags) {
        return results;
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

    results.searchResults = searchResults;
    results.title = partial_text + ' - Roses in The Flames';
    results.partialText = partial_text;
    results.description = 'Search Results for ' + partial_text + ' on Roses in The Flames'
    results.index = (searchResults.length > 0);
    return results;
}

export const actions = {
    loadmore: async ({request, url, locals: {supabase}}) => {
        const formData = Object.fromEntries(await request.formData());

        const page = formData.page ? parseInt(formData.page) : 0;
        const query = formData.query;
        const step = 10;

        if (!query || !page) {
            return {
                searchResults: []
            }
        }

        const partial_text = queryBuilder(query);


        let {data: searchResults, error} = await supabase
            .rpc('search_content_sorted', {partial_text})
            .range(page * step, (page + 1) * step);

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