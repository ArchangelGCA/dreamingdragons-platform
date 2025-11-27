export const load = async ( { url, locals: { supabase, /*getSession,*/ } }) => {
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

    // Fetch chapter counts for all books in search results
    if (searchResults && searchResults.length > 0) {
        const bookIds = searchResults.map(book => book.book_id);
        const { data: chapterCounts, error: chapterError } = await supabase
            .from('chapters')
            .select('book_id')
            .in('book_id', bookIds);
        
        if (!chapterError && chapterCounts) {
            // Count chapters per book
            const countMap = {};
            chapterCounts.forEach(chapter => {
                countMap[chapter.book_id] = (countMap[chapter.book_id] || 0) + 1;
            });
            
            // Attach chapter counts to search results
            searchResults.forEach(book => {
                book.chapter_count = countMap[book.book_id] || 0;
            });
        }
    }

    results.searchResults = searchResults;
    results.title = partial_text + ' - DreamingDragons';
    results.partialText = partial_text;
    results.description = 'Search Results for ' + partial_text + ' on DreamingDragons'
    results.index = (searchResults.length > 0);
    return results;
}

export const actions = {
    loadmore: async ({request, locals: {supabase}}) => {
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

        // Fetch chapter counts for all books in search results
        if (searchResults && searchResults.length > 0) {
            const bookIds = searchResults.map(book => book.book_id);
            const { data: chapterCounts, error: chapterError } = await supabase
                .from('chapters')
                .select('book_id')
                .in('book_id', bookIds);
            
            if (!chapterError && chapterCounts) {
                // Count chapters per book
                const countMap = {};
                chapterCounts.forEach(chapter => {
                    countMap[chapter.book_id] = (countMap[chapter.book_id] || 0) + 1;
                });
                
                // Attach chapter counts to search results
                searchResults.forEach(book => {
                    book.chapter_count = countMap[book.book_id] || 0;
                });
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