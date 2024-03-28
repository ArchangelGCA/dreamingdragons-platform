<script>
    import { tooltip } from "@svelte-plugins/tooltips";
    import {toast} from "@zerodevx/svelte-toast";
    import {deserialize} from "$app/forms";
    import {onMount} from "svelte";
    import autoAnimate from '@formkit/auto-animate';
    import Comment from "$lib/components/pages/Comment.svelte";

    export let data;
    let { supabase, comments, ip_address, user_id } = data;

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

    onMount(() => {
        handleView();
        hasUserLikedChapter();
        loadAvatarsComments();
    });

    let chapterContent = data.chapterContent[0];
    let tags = data.tags;
    let finalAvatarUrl = '';
    let loadedAvatar = false;
    let avatarFound = true;
    let avatarUrl;
    let isLiked = chapterContent.is_liked;
    let viewsCount = 0;
    let commentsCount = comments.length;
    let likeActionActive = false;
    let text = 'Text not found!';
    let currentYear = new Date().getFullYear();
    let createdAt = new Date(chapterContent.created_at);
    let createdAtFormatted = `${(createdAt.getDate()).toString().padStart(2, '0')}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getFullYear()}`;
    let isTextAreaFocused = false;
    let commentText = '';
    let avatarsLoaded = false;
    if (chapterContent.owner_avatar_url) {
        avatarUrl = chapterContent.owner_avatar_url;
    }

    if (chapterContent.text) {
        text = chapterContent.text;
    }

    if (chapterContent.total_views) {
        viewsCount = chapterContent.total_views;
    }

    tags.forEach((item) => item.url = `/search?tag=${item.name}`);

    async function hasUserLikedChapter() {
        if (!user_id) return;
        likeActionActive = true; // Prevents the user from adding a like while it hasn't loaded the previous like status
        const { data: likes, error } = await supabase
            .from('chapter_likes')
            .select('*')
            .eq('chapter_id', chapterContent.chapter_id)
            .eq('user_id', user_id);

        if (!error) {
            likes.length > 0 ? isLiked = true : isLiked = false;
        }
        likeActionActive = false;
    }

    async function loadAvatarsComments(){
        let avatars = [];
        for (const comment of comments) {
            if (!avatars.some(avatar => avatar.name === comment.profiles.avatar_url)){
                const { data, error } = await supabase.storage.from('avatars').download(comment.profiles.avatar_url);
                if (error) {
                    console.log('Error downloading image: ', error.message);
                } else {
                    const avatarURL = URL.createObjectURL(data);
                    avatars.push({name: comment.profiles.avatar_url, url: avatarURL});
                }
            }
        }
        comments.forEach((comment) => {
            comment.profiles.avatar_url = avatars.find(avatar => avatar.name === comment.profiles.avatar_url).url;
        });
        avatarsLoaded = true;
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

    async function handleView(){
        // try to insert view in supabase
        if (user_id){
            const { error } = await supabase
                .from('views')
                .insert([{
                    chapter_id: chapterContent.chapter_id,
                    ip_address: ip_address,
                    user_id: user_id
                }
                ]);

            if (!error) {
                viewsCount++;
            }
        } else {
            // Using only IP address
            const { error } = await supabase
                .from('views')
                .insert([{
                    chapter_id: chapterContent.chapter_id,
                    ip_address: ip_address
                }
                ]);

            if (!error) {
                viewsCount++;
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

    async function handleCommentSubmit() {
        if (commentText === '') {
            return;
        }

        const data = new FormData();
        data.append('chapterId', chapterContent.chapter_id);
        data.append('content', commentText);

        const response = await fetch('?/add_comment', {
            method: 'POST',
            body: data
        });

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                commentText = '';
                commentsCount++;
                toast.push('Comment added! 📝', {
                    theme: {
                        '--toastBackground': '#5c00a6',
                        '--toastColor': '#fff',
                    }
                });

                comments = [result.data.body.comment, ...comments];
            } else {
                toast.push('Error: ' + result.data.body.message, {
                    theme: {
                        '--toastBackground': '#f44336',
                        '--toastColor': '#fff',
                    }
                });
            }
        } else {
            toast.push('Error during action (Please login)', {
                theme: {
                    '--toastBackground': '#f44336',
                    '--toastColor': '#fff',
                }
            });
        }
    }

    function handleCommentDelete(event) {
        const id = event.detail;
        comments = comments.filter((comment) => comment.id !== id);
        commentsCount--;
    }

    function resetComment() {
        commentText = '';
        handleBlur();
    }

    function handleFocus() {
        isTextAreaFocused = true;
    }

    function handleBlur() {
        if (commentText === '') {
            isTextAreaFocused = false;
        }
    }

    $: if (avatarUrl) downloadAvatar(avatarUrl);

    $: if (avatarUrl) downloadAvatar(avatarUrl);
</script>

<svelte:head>
    <title>{chapterContent.book_title} - {chapterContent.title} | Roses In The Flames</title>
    <meta name="description" content="{chapterContent.title} by {chapterContent.owner_username} - {chapterContent.book_title} | Roses In The Flames">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{chapterContent.book_title} - {chapterContent.title} | Roses In The Flames">
    <meta name="twitter:description" content="{chapterContent.title} by {chapterContent.owner_username} - {chapterContent.book_title} | Roses In The Flames">
    <meta name="twitter:image" content="{chapterContent.book_cover_url}">

    <meta name="og:title" content="{chapterContent.book_title} - {chapterContent.title} | Roses In The Flames">
    <meta name="og:description" content="{chapterContent.title} by {chapterContent.owner_username} - {chapterContent.book_title} | Roses In The Flames">
    <meta name="og:image" content="{chapterContent.book_cover_url}">
</svelte:head>

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
                <div class="col-3 col-md-2 text-end">
                    <a href="/profile/{chapterContent.owner_id}" use:tooltip={{...tooltipConfig}} title="Artist's profile">
                        {#if loadedAvatar === false}
                            <div class="spinner-border text-light" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        {:else if avatarFound === true}
                            <img src="{finalAvatarUrl}" alt="{chapterContent.owner_username}" class="img-fluid rounded-circle" style="height: 70px; width: 70px" loading="lazy">
                        {:else}
                            <img class="img-fluid rounded-circle bg-purple py-3 py-lg-5" alt="Avatar Not Found!">
                        {/if}
                    </a>
                </div>
                <div class="col-9 col-md-10 text-center my-auto">
                    <h2><a class="link-light link-opacity-75 text-decoration-none" href="/content/{chapterContent.book_id}">{chapterContent.book_title}</a>: {chapterContent.title}</h2>
                    <h6 class="mb-0">by <a class="link-light link-opacity-75 text-decoration-none" href="/profile/{chapterContent.owner_id}">{chapterContent.owner_username}</a> - <span class="text-muted">{createdAtFormatted}</span></h6>
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
                    &copy; {currentYear} <a class="link-secondary text-decoration-none" href="/profile/{chapterContent.owner_id}" use:tooltip={{...tooltipConfig}} title="Profile">{chapterContent.owner_username}</a> - {chapterContent.book_title} - {chapterContent.title}
                </small>
            </p>
        </div>
    </div>
    <!-- Comments section -->
    <div class="row justify-content-center">
        <div class="col-12 px-0">
            <p class="h3">Comments:</p>
        </div>
        <div class="col-12">
            <div class="row">
                <div class="col-12 px-0">
                    <div class="form-floating text-center">
                        <textarea class="form-control form-control-lg py-5 {isTextAreaFocused ? 'bg-purple-opacity-10' : 'bg-purple-opacity-25'}" id="commentInput" placeholder="Write your comment here" on:focus={handleFocus} on:blur={handleBlur} bind:value={commentText}></textarea>
                        <label for="commentInput">Write your comment here...</label>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-12 px-0" use:autoAnimate>
                    {#if isTextAreaFocused}
                        <div class="row gx-1 comment-buttons mt-2">
                            <div class="col-6">
                                <button class="btn btn-comment-cancel w-100" type="reset" on:click={resetComment}>Cancel</button>
                            </div>
                            <div class="col-6">
                                <button class="btn btn-comment w-100 " type="submit" on:click={handleCommentSubmit}>Comment</button>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
        {#if commentsCount === 0}
            <div class="col-12 text-center mt-5 mb-4">
                <p class="h5">No comments found!</p>
            </div>
        {:else}
            <div class="col-12 mt-3 mb-1 pt-3 border-top border-light-subtle" use:autoAnimate>
                {#if avatarsLoaded}
                    {#each comments as comment (comment.id)}
                        <Comment {comment} {supabase} on:delete={handleCommentDelete} />
                    {/each}
                {:else}
                    <div class="row justify-content-center">
                        <div class="col-auto">
                            <div class="spinner-border text-light" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        {/if}
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

    .btn-comment-cancel {
        background-color: rgba(109, 47, 157, 0.25);
    }

    .btn-comment-cancel:hover {
        background-color: #4a007f;
    }

    .btn-comment {
        background-color: rgba(92, 0, 166, 0.3);
    }

    .btn-comment:hover {
        background-color: #4a007f;
    }

    .form-control {
        border-color: #5c00a6;
    }

    .form-control:focus {
        border-color: #5c00a6;
        box-shadow: 0 0 0 0.25rem rgba(92, 0, 166, 0.25);
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