<script>
    import {onMount} from "svelte";

    export let data;

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
    let foundBook = false;
    let chapters = [];

    if (bookContent.length > 0) {
        chapters = bookContent[0].chapters;
        foundBook = true;
    }
</script>

<h1 class="text-center">TODO</h1>
