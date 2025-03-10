export async function fetchProfiles({ supabase, origin }) {
    let { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url");

    if (data) {
        data = data.filter(profile => !profile.username.startsWith("Please update"));
        data.forEach(profile => {
            profile.name = profile.username;
            profile.image = !profile.avatar_url || profile.avatar_url === "" ? `${origin}/favicon-96x96.png` : profile.avatar_url;
            profile.description = "Mention " + profile.username;
            delete profile.username;
            delete profile.avatar_url;
        });
    }

    if (error) {
        return {
            status: 500,
            body: {
                message: error.message
            }
        };
    }

    return {
        status: 200,
        body: data
    };
}