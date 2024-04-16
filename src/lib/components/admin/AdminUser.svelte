<script>
    import UserAvatar from "$lib/components/layout/UserAvatar.svelte";

    export let profile;
    export let supabase;

    // Format the date by checking if it is a valid date, if not return the original value
    function formatDate(date) {
        if (date === null) {
            return date;
        }
        const finalDate = new Date(date);
        if (finalDate === "Invalid Date" || isNaN(finalDate)) {
            return date;
        }
        return finalDate.toLocaleString();
    }

    // Format the date by checking if it is a valid date, if not return the original value
    profile.created_at = formatDate(profile.created_at);
    profile.updated_at = formatDate(profile.updated_at);

    if (profile.website === null || profile.website === "") {
        profile.website = "N/A";
    }

</script>

<div class="container border {profile.can_upload ? 'border-magenta bg-black bg-opacity-25' : 'border-danger bg-danger bg-opacity-10'} rounded-4 mb-4 p-4 shadow-sm">
    <div class="row">
        <div class="col-12">
            <div class="row justify-content-center mb-3">
                <div class="col-12 col-md-auto my-auto mb-3 mb-md-auto">
                    <UserAvatar url={profile.avatar_url} username={profile.username} id={profile.id} {supabase} size="100px" />
                </div>
                <div class="col-12 col-md-auto my-auto">
                    <h1 class="h1 text-center">{profile.username}</h1>
                </div>
            </div>
            <div class="accordion" id="profileAccordion-{profile.id}">
                <div class="accordion-item">
                    <h2 class="accordion-header" id="headingOne-{profile.id}">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne-{profile.id}" aria-expanded="true" aria-controls="collapseOne-{profile.id}">
                            User Info
                        </button>
                    </h2>
                    <div id="collapseOne-{profile.id}" class="accordion-collapse collapse" aria-labelledby="headingOne-{profile.id}" data-bs-parent="#profileAccordion-{profile.id}">
                        <div class="accordion-body">
                            <div class="row">
                                <div class="col-12 col-md-6 mb-3 mb-md-auto my-auto">
                                    <UserAvatar url={profile.avatar_url} username={profile.username} id={profile.id} {supabase} size="200px" />
                                </div>
                                <div class="col-12 col-md-6 my-auto">
                                    <p>Full Name: {profile.full_name}</p>
                                    <p>Email: {profile.email}</p>
                                    <p>Website: {profile.website}</p>
                                    <p>Can Upload: <span class="{profile.can_upload ? 'text-success' : 'text-danger'}">{profile.can_upload}</span></p>
                                    <p>Created At: {profile.created_at}</p>
                                    <p>Updated At: {profile.updated_at}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .border-magenta {
        border-color: #ef43cd !important;
    }
</style>