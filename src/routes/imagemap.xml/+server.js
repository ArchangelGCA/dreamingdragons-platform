export const GET = async ({locals: {supabase}}) => {
    const {data: bookCoverUrls, error: errorBook} = await supabase
        .from('book')
        .select('id, cover_url');

    const {data: profileAvatarCoverUrls, error: errorProfile} = await supabase
        .from('profiles')
        .select('id, avatar_url, cover_url');

    if (errorBook || errorProfile) {
        return {
            status: 500,
            body: {
                error: 'An error occurred while fetching the data.'
            }
        };
    }


    // Check for duplicated book cover url and empty ones and remove them. bookCoverUrls is an array of objects
    // like this [ {cover_url: url} ]
    const bookCoverUrlsFiltered = bookCoverUrls.filter((book, index, self) => {
        return book.cover_url && self.findIndex((t) => t.cover_url === book.cover_url) === index;
    });

    // Check for duplicated profile avatar and cover url and empty ones and remove them, profileAvatarCoverUrls is an array of objects
    const profileAvatarCoverUrlFiltered = profileAvatarCoverUrls.filter((profile, index, self) => {
        return profile.avatar_url && profile.cover_url && self.findIndex((t) => t.avatar_url === profile.avatar_url && t.cover_url === profile.cover_url) === index;
    });

    // Output xml sitemap format like, following google image search sitemap format
    return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
            ${bookCoverUrlsFiltered.map((book) => `
                <url>
                    <loc>https://tales.rosesintheflames.com/content/${book.id}</loc>
                    <image:image>
                        <image:loc>https://images.rosesintheflames.com/image/${book.cover_url}</image:loc>
                    </image:image>
                </url>
            `).join('')}
            ${profileAvatarCoverUrlFiltered.map((profile) => `
                <url>
                    <loc>https://tales.rosesintheflames.com/profile/${profile.id}</loc>
                    <image:image>
                        <image:loc>https://images.rosesintheflames.com/image/${profile.avatar_url}</image:loc>
                    </image:image>
                    <image:image>
                        <image:loc>https://images.rosesintheflames.com/image/${profile.cover_url}</image:loc>
                    </image:image>
                </url>
            `).join('')}
        </urlset>`, {
            headers: {
                'Content-Type': 'application/xml'
            }
        }
    );
}