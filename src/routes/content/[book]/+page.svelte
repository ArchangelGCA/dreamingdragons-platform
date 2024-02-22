<script>
    import {onMount} from "svelte";
    import { tooltip } from "@svelte-plugins/tooltips";
    import {deserialize} from "$app/forms";
    import {toast} from "@zerodevx/svelte-toast";


    export let data;
    let avatarUrl;
    let { supabase } = data;

    const tooltipConfig = {
        animation: 'fade',
        delay: 0,
        style: {
            color: 'white',
            backgroundColor: '#5c00a6',
            padding: '10px',
            borderRadius: '5px'
        }
    };

    onMount(() => {
        window.$('[data-bs-toggle="tooltip"]').tooltip();
    });

    /* Example bookContent
    [
      {
        book_id: 1,
        book_title: 'Example Book',
        book_description: "Example Book's Description",
        book_cover_url: 'https://archangelgca.eu/img/logo.jpg',
        likes_count: 0,
        chapters: [ [Object] ],
        owner_id: 'bfc1c4a7-f2af-494a-b7d9-35377f16d33e',
        owner_username: 'ArchangelGCA',
        owner_full_name: 'GCA',
        owner_avatar_url: '0.20207563595383804.png',
        owner_website: 'https://archangelgca.eu',
        is_owner: true/false,
        is_liked: true/false
      }
    ]

     */

    /* Example bookContent[0].chapters
    [
      { chapter_id: 1, chapter_title: 'Test', chapter_likes_count: 0 }
    ]
     */

    let bookContent = data.bookContent[0];
    let chapters = bookContent.chapters;
    let finalAvatarUrl = '';
    let avatarFound = true;
    let loadedAvatar = false;
    let viewsCount = 0;
    let commentsCount = 0;
    let isLiked = bookContent.is_liked;
    let likeActionActive = false;

    if (bookContent.owner_avatar_url) {
        avatarUrl = bookContent.owner_avatar_url;
    }

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
        data.append('contentId', bookContent.book_id);

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
                    bookContent.likes_count++;
                    toast.push('Book liked ❤️', {
                        theme: {
                            '--toastBackground': '#5c00a6',
                            '--toastColor': '#fff',
                        }
                    });
                } else {
                    bookContent.likes_count--;
                    toast.push('Book unliked 💔', {
                        theme: {
                            '--toastBackground': '#5c00a6',
                            '--toastColor': '#fff',
                        }
                    });
                }
            } else {
                isLiked = !isLiked;
                toast.push('Error during action: ' + result.data.body.message, {
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
    <div class="row justify-content-center text-center">
        <div class="col my-4" use:tooltip={{...tooltipConfig}} title="Original Cover">
            <a href="{bookContent.book_cover_url}" target="_blank">
                <img src="{bookContent.book_cover_url}" alt="{bookContent.book_title}" class="img-fluid rounded-4" style="max-height: 75vh" loading="lazy">
            </a>
        </div>
    </div>
    <div class="row justify-content-center text-center">
        <hr>
        <div class="col-12 mb-3">
            <div class="row justify-content-center d-flex align-items-center">
                <div class="col-3 text-end">
                    <a href="/profile?id={bookContent.book_owner_id}" use:tooltip={{...tooltipConfig}} title="Artist's profile">
                        {#if loadedAvatar === false}
                            <div class="spinner-border text-light" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        {:else if avatarFound === true}
                            <img src="{finalAvatarUrl}" alt="{bookContent.owner_username}" class="img-fluid rounded-circle" style="max-height: 100px" loading="lazy">
                        {:else}
                            <!-- Avatar not found, empty circle using css -->
                            <img class="img-fluid rounded-circle bg-purple py-3 py-lg-5" alt="Avatar Not Found!">
                        {/if}
                    </a>
                </div>
                <div class="col-9 text-center">
                    <h2>{bookContent.book_title}</h2>
                    <h6>by <a href="/profile?id={bookContent.book_owner_id}">{bookContent.owner_username}</a></h6>
                </div>
            </div>
        </div>
        <hr>
    </div>
    <div class="row justify-content-between px-lg-5 py-2 py-lg-3 mb-3 bg-info-stats bg-opacity-10 rounded-3 d-flex align-items-center">
        <div class="col">
            <div class="row justify-content-center d-flex align-items-center" data-bs-toggle="tooltip" title="Total likes">
                <div class="col-auto d-flex align-items-center pe-0">
                    <button class="btn btn-link text-decoration-none p-0 border-0 w-auto mt-1" on:click={handleHeartClick}>
                        <i class="fas fa-heart {isLiked ? 'liked' : 'unliked'}"></i>
                    </button>
                </div>
                <div class="col-auto">
                    <span class="mt-1">{bookContent.likes_count}</span>
                </div>
            </div>
        </div>
        <div class="col">
            <div class="row justify-content-center d-flex align-items-center" data-bs-toggle="tooltip" title="Views">
                <div class="col-auto d-flex align-items-center pe-0">
                    <i class="fas fa-eye"></i>
                </div>
                <div class="col-auto mt-1">
                    <span class="">{viewsCount}</span>
                </div>
            </div>
        </div>
        <div class="col">
            <div class="row justify-content-center d-flex align-items-center" data-bs-toggle="tooltip" title="Comments">
                <div class="col-auto d-flex align-items-center pe-0">
                    <i class="fas fa-comment"></i>
                </div>
                <div class="col-auto mt-1">
                    <span class="">{commentsCount}</span>
                </div>
            </div>
        </div>
    </div>
    <div class="row justify-content-center text-center">
        <div class="col">
            <h1>TODO</h1>
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

