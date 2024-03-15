<script>
    import { tooltip } from "@svelte-plugins/tooltips";
    import {toast} from "@zerodevx/svelte-toast";
    import {deserialize} from "$app/forms";

    export let data;
    let { supabase } = data;

    const tooltipConfig = {
        animation: 'fade',
        delay: 0,
        style: {
            color: 'white',
            backgroundColor: 'rgba(92,0,166,0.9)',
            padding: '10px',
            borderRadius: '5px'
        },
        theme: 'text-center w-auto'
    };

    let chapterContent = data.chapterContent[0];
    let tags = data.tags;
    let finalAvatarUrl = '';
    let loadedAvatar = false;
    let avatarFound = true;
    let avatarUrl;
    let isLiked = chapterContent.is_liked;
    let viewsCount = 0;
    let commentsCount = 0;
    let likeActionActive = false;
    let text = 'Text not found!';
    let currentYear = new Date().getFullYear();
    let createdAt = new Date(chapterContent.created_at);
    let createdAtFormatted = `${(createdAt.getDate()).toString().padStart(2, '0')}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getFullYear()}`;
    if (chapterContent.owner_avatar_url) {
        avatarUrl = chapterContent.owner_avatar_url;
    }

    if (chapterContent.text) {
        text = chapterContent.text;
    }

    tags.forEach((item) => item.url = `/search?tag=${item.name}`);

    async function downloadAvatar(path) {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);

            if (error) {
                throw error;
            }

            finalAvatarUrl = URL.createObjectURL(data);
            loadedAvatar = true;
        } catch (error) {
            if (error instanceof Error) {
                console.log('Error downloading image: ', error.message);
                avatarFound = false;
            }
        }
    }

    async function handleHeartClick() {

        if (likeActionActive) {
            return;
        }

        likeActionActive = true;
        const data = new FormData();
        data.append('chapterId', chapterContent.chapter_id);

        isLiked = !isLiked;

        const response = await fetch('?/like', {
            method: 'POST',
            body: data
        });

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                // isLiked = !isLiked;
                if (isLiked) {
                    chapterContent.likes_count++;
                    toast.push('Chapter liked ❤️', {
                        theme: {
                            '--toastBackground': '#5c00a6',
                            '--toastColor': '#fff',
                        }
                    });
                } else {
                    chapterContent.likes_count--;
                    toast.push('Chapter unliked 💔', {
                        theme: {
                            '--toastBackground': '#5c00a6',
                            '--toastColor': '#fff',
                        }
                    });
                }
            } else {
                isLiked = !isLiked;
                toast.push('Error: ' + result.data.body.message, {
                    theme: {
                        '--toastBackground': '#f44336',
                        '--toastColor': '#fff',
                    }
                });
            }
        } else {
            isLiked = !isLiked;
            toast.push('Error during action (Please login)', {
                theme: {
                    '--toastBackground': '#f44336',
                    '--toastColor': '#fff',
                }
            });
        }

        likeActionActive = false;
    }

    $: if (avatarUrl) downloadAvatar(avatarUrl);
</script>

<div class="container-xxl">
    <div class="row justify-content-center">
        <div class="col-12 text-center px-0">
            <a href="#title" class="btn btn-lg btn-shortcut text-light text-opacity-50 w-100 rounded-3 mt-3" use:tooltip={{...tooltipConfig}} title="Go to Text">
                <i class="fas fa-chevron-down"></i>
            </a>
        </div>
    </div>
    <div class="row justify-content-center text-center">
        <div class="col-auto mb-4 mt-3 px-0" use:tooltip={{...tooltipConfig}} title="Open Book">
            <a href="/content/{chapterContent.book_id}">
                <img src="{chapterContent.book_cover_url}" alt="{chapterContent.book_title + ' ' + chapterContent.title}" class="img-fluid rounded-4" style="max-height: 60vh" loading="lazy">
            </a>
        </div>
    </div>
    <div class="row justify-content-center text-center bg-purple-opacity-10 py-3 mb-3 rounded-4">
        <div class="col-12">
            <div class="row justify-content-center d-flex align-items-center">
                <div class="col-3 text-end">
                    <a href="/profile?id={chapterContent.owner_id}" use:tooltip={{...tooltipConfig}} title="Artist's profile">
                        {#if loadedAvatar === false}
                            <div class="spinner-border text-light" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        {:else if avatarFound === true}
                            <img src="{finalAvatarUrl}" alt="{chapterContent.owner_username}" class="img-fluid rounded-circle" style="max-height: 100px" loading="lazy">
                        {:else}
                            <img class="img-fluid rounded-circle bg-purple py-3 py-lg-5" alt="Avatar Not Found!">
                        {/if}
                    </a>
                </div>
                <div class="col-9 text-center my-auto">
                    <h2><a class="link-light link-opacity-75 text-decoration-none" href="/content/{chapterContent.book_id}">{chapterContent.book_title}</a>: {chapterContent.title}</h2>
                    <h6 class="mb-0">by <a class="link-light link-opacity-75 text-decoration-none" href="/profile?id={chapterContent.owner_id}">{chapterContent.owner_username}</a> - <span class="text-muted">{createdAtFormatted}</span></h6>
                    {#if tags.length !== 0}
                        <div class="row justify-content-center mt-1">
                            <div class="col-auto">
                                {#each tags as tag (tag.id)}
                                    <a href="{tag.url}" class="badge bg-purple text-light me-1 mb-1 text-decoration-none" use:tooltip={{...tooltipConfig}} title="Search for {tag.name}">{tag.name}</a>
                                {/each}
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
    <div class="row justify-content-between px-lg-5 py-2 py-lg-3 mb-3 bg-info-stats bg-opacity-10 rounded-3 d-flex align-items-center">
        <div class="col">
            <div class="row justify-content-center d-flex align-items-center" use:tooltip={{...tooltipConfig}} title="Total likes">
                <div class="col-auto d-flex align-items-center pe-0">
                    <button class="btn btn-link text-decoration-none p-0 border-0 w-auto mt-1" on:click={handleHeartClick}>
                        <i class="fas fa-heart {isLiked ? 'liked' : 'unliked'}"></i>
                    </button>
                </div>
                <div class="col-auto">
                    <span class="mt-1">{chapterContent.likes_count}</span>
                </div>
            </div>
        </div>
        <div class="col">
            <div class="row justify-content-center d-flex align-items-center" use:tooltip={{...tooltipConfig}} title="Views">
                <div class="col-auto d-flex align-items-center pe-0">
                    <i class="fas fa-eye"></i>
                </div>
                <div class="col-auto mt-1">
                    <span class="">{viewsCount}</span>
                </div>
            </div>
        </div>
        <div class="col">
            <div class="row justify-content-center d-flex align-items-center" use:tooltip={{...tooltipConfig}} title="Comments">
                <div class="col-auto d-flex align-items-center pe-0">
                    <i class="fas fa-comment"></i>
                </div>
                <div class="col-auto mt-1">
                    <span class="">{commentsCount}</span>
                </div>
            </div>
        </div>
    </div>
    <div class="row justify-content-center text-center" id="title">
        <div class="col-12 px-0">
            <p class="fs-5 bg-purple-opacity-25 p-3 rounded-4">{chapterContent.title}</p>
        </div>
    </div>
    <div class="row justify-content-center bg-text-opacity-10 rounded-3 py-3 px-2 px-md-auto">
        <div class="col-12 col-lg-10 bg-black bg-opacity-25 shadow-lg mx-auto px-2 px-md-5 pt-3 pb-2 rounded-3">
            {@html text}
        </div>
    </div>
    <div class="row justify-content-center text-start mt-3">
        <div class="col-12 px-0">
            <p class="text-secondary text-center">
                <small>
                    &copy; {currentYear} <a class="link-secondary text-decoration-none" href="/profile?id={chapterContent.owner_id}" use:tooltip={{...tooltipConfig}} title="Profile">{chapterContent.owner_username}</a> - {chapterContent.book_title} - {chapterContent.title}
                </small>
            </p>
        </div>
    </div>
</div>

<style>
    .fa-heart, .fa-eye, .fa-comment {
        font-size: 1.6rem;
    }

    .bg-info-stats {
        background: linear-gradient(90deg, rgba(128, 0, 128, 0.5) 0%, rgba(75, 0, 130, 0.5) 50%, rgba(60, 0, 104, 0.5) 100%);
    }

    .bg-purple {
        background-color: #5c00a6;
    }

    .bg-text-opacity-10 {
        background-color: rgba(128, 0, 128, 0.1);
    }

    .bg-purple-opacity-25 {
        background-color: rgba(92, 0, 166, 0.25);
    }

    .bg-purple-opacity-10 {
        background-color: rgba(92, 0, 166, 0.1);
    }

    .btn-shortcut {
        background-color: transparent;
    }

    .btn-shortcut:hover {
        background-color: #4a007f;
        border-color: #4a007f;
    }

    .liked {
        color: #bd135a;
        animation: heart-pulse 0.3s ease-in-out;
        transition: 0.15s all ease-in-out;
    }

    .liked:hover {
        transform: scale(1.1);
    }

    .unliked {
        transform: scale(0.9);
        color: #ffffff;
        animation: heart-unpulse 0.3s ease-in-out;
        transition: 0.15s all ease-in-out;
    }

    .unliked:hover {
        color: #bd135a;
        transform: scale(1);
    }

    @keyframes heart-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }

    @keyframes heart-unpulse {
        0% { transform: scale(0.8); }
        50% { transform: scale(1); }
        100% { transform: scale(0.8); }
    }
</style>