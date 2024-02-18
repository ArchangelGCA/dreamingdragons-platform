<script>
    import {onMount} from "svelte";
    import { tooltip } from "@svelte-plugins/tooltips";

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
        isOwner: true/false
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
    let viewsCount = 0;
    let commentsCount = 0;

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
        } catch (error) {
            if (error instanceof Error) {
                console.log('Error downloading image: ', error.message);
                avatarFound = false;
            }
        }
    }

    $: if (avatarUrl) downloadAvatar(avatarUrl);
</script>

<div class="container-xxl">
    <div class="row justify-content-center text-center">
        <div class="col my-4" use:tooltip={{...tooltipConfig}} title="Original Cover">
            <a href="{bookContent.book_cover_url}" target="_blank">
                <img src="{bookContent.book_cover_url}" alt="{bookContent.book_title}" class="img-fluid" style="max-height: 75vh" loading="lazy">
            </a>
        </div>
    </div>
    <div class="row justify-content-center text-center">
        <hr>
        <div class="col-12 mb-3">
            <div class="row justify-content-center d-flex align-items-center">
                <div class="col-3 text-end">
                    <a href="/profile?id={bookContent.book_owner_id}" use:tooltip={{...tooltipConfig}} title="Artist's profile">
                        <img src="{finalAvatarUrl}" alt="{bookContent.owner_username}" class="img-fluid rounded-circle" style="max-height: 100px" loading="lazy">
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
                    <i class="fas fa-heart"></i>
                </div>
                <div class="col-auto mt-1">
                    <span class="">{bookContent.likes_count}</span>
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
</style>

