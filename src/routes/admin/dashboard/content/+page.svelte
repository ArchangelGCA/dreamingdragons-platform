<script>
    export let data;
    let { content, supabase } = data;
    $: ({content, chapters} = data)

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

    // For each item in content, format created_at date
    content = content.map(item => {
        item.created_at = formatDate(item.created_at);
        return item;
    });

</script>

<div class="container py-3" style="height: 100vh">
    <div class="row mb-2">
        <div class="col text-center">
            <h2>Manage Content</h2>
        </div>
    </div>

    <div class="row">
        {#each content as item (item.id)}
            <div class="col-12 col-md-6 col-lg-4 mb-4">
                <div class="card">
                    <img src={item.cover_url} class="card-img-top" alt={item.title} />
                    <div class="card-body">
                        <h5 class="card-title">{item.title}</h5>
                        <p class="card-text">By: <a href="/profile/{item.profiles.id}" target="_blank">{item.profiles.username}</a></p>
                        <p class="card-text">{@html item.description}</p>
                        <div class="row justify-content-center text-center">
                            <div class="col-12 col-md-6">
                                <button class="btn btn-link {item.chapters.length === 0 ? 'disabled' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#chapters-{item.id}">
                                    Show Chapters
                                </button>
                            </div>
                            <div class="col-12 col-md-6">
                                <button class="btn btn-link" type="button" data-bs-toggle="collapse" data-bs-target="#profile-{item.id}">
                                    Show Profile
                                </button>
                            </div>
                        </div>
                        <div class="collapse" id="chapters-{item.id}">
                            <div class="accordion" id="accordionChapters-{item.id}">
                                {#each item.chapters as chapter (chapter.id)}
                                    <div class="accordion-item">
                                        <h2 class="accordion-header" id="heading-{chapter.id}">
                                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-{chapter.id}" aria-expanded="false" aria-controls="collapse-{chapter.id}">
                                                {chapter.title}
                                            </button>
                                        </h2>
                                        <div id="collapse-{chapter.id}" class="accordion-collapse collapse" aria-labelledby="heading-{chapter.id}" data-bs-parent="#accordionChapters-{item.id}">
                                            <div class="accordion-body">
                                                {@html chapter.text}
                                            </div>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                        <div class="collapse" id="profile-{item.id}">
                            <div>
                                <h6>{item.profiles.username}</h6>
                                <p>id: <a href="/profile/{item.profiles.id}" target="_blank">{item.profiles.id}</a></p>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <small class="text-muted">Created at: {item.created_at}</small>
                        <div class="row mt-1">
                            <div class="col-6 text-center">
                                <button class="btn btn-primary btn-sm w-100">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                            </div>
                            <div class="col-6">
                                <button class="btn btn-danger btn-sm w-100">
                                    <i class="fas fa-trash-alt"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>