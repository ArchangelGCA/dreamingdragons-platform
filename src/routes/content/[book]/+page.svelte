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

    let bookContent = data.bookContent;
    let chapters = bookContent[0].chapters;
    let finalAvatarUrl = '';
    let avatarFound = true;

    if (bookContent[0].owner_avatar_url) {
        avatarUrl = bookContent[0].owner_avatar_url;
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
            <a href="{bookContent[0].book_cover_url}" target="_blank">
                <img src="{bookContent[0].book_cover_url}" alt="{bookContent[0].book_title}" class="img-fluid" style="max-height: 75vh" loading="lazy">
            </a>
        </div>
    </div>
    <div class="row justify-content-center text-center">
        <hr>
        <div class="col-12 mb-3">
            <div class="row justify-content-center d-flex align-items-center">
                <div class="col-3 text-end">
                    <a href="/profile?id={bookContent[0].book_owner_id}" use:tooltip={{...tooltipConfig}} title="Artist's profile">
                        <img src="{finalAvatarUrl}" alt="{bookContent[0].owner_username}" class="img-fluid rounded-circle" style="max-height: 100px" loading="lazy">
                    </a>
                </div>
                <div class="col-9 text-center">
                    <h2>{bookContent[0].book_title}</h2>
                    <h6>by <a href="/profile?id={bookContent[0].book_owner_id}">{bookContent[0].owner_username}</a></h6>
                </div>
            </div>
        </div>
        <hr>
    </div>
    <div class="row justify-content-center text-center">
        <div class="col">
            <h1>TODO</h1>
        </div>
    </div>
</div>

