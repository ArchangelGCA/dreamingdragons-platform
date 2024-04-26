<script>
    import { tooltip } from "@svelte-plugins/tooltips";
    import {deserialize} from "$app/forms";
    import {toast} from "@zerodevx/svelte-toast";
    import ChapterCard from "$lib/components/profile/ChapterCard.svelte";
    import autoAnimate from '@formkit/auto-animate';
    import {onMount} from "svelte";
    import Comment from "$lib/components/pages/Comment.svelte";
    import Seo from "sk-seo";
    import {invalidateAll} from "$app/navigation";

    export let data;
    let avatarUrl;
    let { supabase, comments, ip_address, user_id } = data;
    $: ({ comments, user_id } = data)

    const tooltipConfig = {
        animation: 'fade',
        delay: 0,
        style: {
            color: 'white',
            backgroundColor: 'rgba(92,0,166,0.9)',
            padding: '10px',
            borderRadius: '5px',
        },
        theme: 'text-center w-auto'
    };

    onMount(() => {
        handleView();
        hasUserLikedBook();
        loadAvatarsComments();
    });

    let bookContent = data.bookContent[0];
    let chapters = bookContent.chapters;
    let tags = data.tags;
    let chaptersFound = false;
    let finalAvatarUrl = '';
    let avatarFound = true;
    let loadedAvatar = false;
    let viewsCount = 0;
    let commentsCount = comments.length;
    let isLiked = bookContent.is_liked;
    let likeActionActive = false;
    let reportActionActive = false;
    let commentActionActive = false;
    let currentYear = new Date().getFullYear();
    let createdAt = new Date(bookContent.created_at);
    let createdAtFormatted = `${(createdAt.getDate()).toString().padStart(2, '0')}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getFullYear()}`;
    let isTextAreaFocused = false;
    let commentText = '';
    let avatarsLoaded = false;
    let deleteBookActionActive = false;
    let reportText = '';
    let parentCommentId = null;

    if (bookContent.owner_avatar_url) {
        avatarUrl = bookContent.owner_avatar_url;
    }

    if (bookContent.total_views){
        viewsCount = bookContent.total_views;
    }

    if (chapters !== undefined && chapters !== null) {
        if (chapters[0].chapter_id !== null) {
            chaptersFound = true;
            chapters.forEach((item) => item.chapter_image_url = bookContent.book_cover_url);
        }
    }

    tags.forEach((item) => item.url = `/search?tag=${item.name}`);

    async function hasUserLikedBook() {
        if (!user_id) return;
        likeActionActive = true; // Prevents the user from adding a like while it hasn't loaded the previous like status
        const { data: likes, error } = await supabase
            .from('book_likes')
            .select('*')
            .eq('book_id', bookContent.book_id)
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

    function resetComment() {
        commentText = '';
        handleBlur();
    }

    async function handleCommentDelete() {
        /*const id = event.detail;
        comments = comments.filter((comment) => comment.id !== id);*/
        await invalidateAll();
        commentsCount--;
    }

    async function handleCommentReply() {
        await invalidateAll();
        commentsCount++;
    }

    async function handleView(){
        if (user_id){
            const { error } = await supabase
                .from('views')
                .insert([{
                    book_id: bookContent.book_id,
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
                    book_id: bookContent.book_id,
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
                    toast.push('Tale liked ❤️', {
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
        if (commentActionActive) return;

        if (commentText === '') {
            return;
        }

        commentActionActive = true;

        const data = new FormData();
        data.append('bookId', bookContent.book_id);
        data.append('content', commentText);
        if (parentCommentId && parentCommentId !== null && parentCommentId !== ''){
            data.append('parentCommentId', parentCommentId);
        }

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

        commentActionActive = false;
    }

    async function handleBookDelete(){

        if (deleteBookActionActive) return;
        if (!bookContent.is_owner) return;

        if (!confirm('Are you sure that you want to delete this Tale?')) return;

        deleteBookActionActive = true;

        const data = new FormData();
        data.append('bookId', bookContent.book_id);

        const response = await fetch('?/delete_book', {
            method: 'POST',
            body: data
        });

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push('Book ' + bookContent.book_title +  ' deleted! 🗑️', {
                    theme: {
                        '--toastBackground': '#5c00a6',
                        '--toastColor': '#fff',
                    }
                });
                window.location.href = '/profile';
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

    async function handleReport(){
        if (reportActionActive) return;

        reportActionActive = true;

        const formData = new FormData();
        formData.append('book_id', bookContent.book_id);
        formData.append('report_description', reportText);

        const response = await fetch('?/report', {
            method: 'POST',
            body: formData
        });

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push('Report submitted! 🚩', {
                    theme: {
                        '--toastBackground': '#5c00a6',
                        '--toastColor': '#fff',
                    }
                });
                reportText = '';
                document.getElementById('reportModal').style.display = 'none';
                const modalBackdrop = document.getElementsByClassName("modal-backdrop fade show");
                if (modalBackdrop.length > 0) {
                    modalBackdrop[0].remove();
                }
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

        reportActionActive = false;
    }

    function handleFocus() {
        isTextAreaFocused = true;
    }

    function handleBlur() {
        if (commentText === '') {
            isTextAreaFocused = false;
        }
    }

    $: if (avatarUrl && finalAvatarUrl === '') downloadAvatar(avatarUrl);

    const seo = {
        title: bookContent.book_title + ' by ' + bookContent.owner_username + ' | Roses In The Flames',
        description: bookContent.book_description,
        siteName: 'Roses In The Flames | Tales',
        imageURL: bookContent.book_cover_url,
        author: 'ArchangelGCA'
    }
</script>

<Seo {...seo} />

<div class="container-xxl">
    <div class="row justify-content-center">
        <div class="col-12 text-center px-0">
            <a href="#chapters" class="btn btn-lg btn-shortcut text-light text-opacity-50 w-100 rounded-3 mt-3" use:tooltip={{...tooltipConfig}} title="Go to Chapters">
                <i class="fas fa-chevron-down"></i>
            </a>
        </div>
    </div>
    <div class="row justify-content-center text-center">
        <div class="col-auto mb-4 mt-3 px-0" use:tooltip={{...tooltipConfig}} title="Original Cover">
            <a href="{bookContent.book_cover_url}" target="_blank">
                <img src="{bookContent.book_cover_url}" alt="{bookContent.book_title}" class="img-fluid rounded-4" style="max-height: 60vh" loading="lazy">
            </a>
        </div>
    </div>
    <div class="row justify-content-center text-center bg-purple-opacity-10 py-3 mb-3 rounded-4">
        <div class="col-12">
            <div class="row justify-content-center d-flex align-items-center">
                <div class="d-flex col-3 col-md-2 justify-content-center justify-content-xl-end">
                    <a class="w-auto" href="/profile/{bookContent.book_owner_id}" use:tooltip={{...tooltipConfig}} title="Artist's profile">
                        {#if loadedAvatar === false}
                            <div class="placeholder-glow" style="height: 70px; width: 70px;">
                                <div class="placeholder rounded-circle w-100 h-100"></div>
                            </div>
                        {:else if avatarFound === true}
                            <img src="{finalAvatarUrl}" alt="{bookContent.owner_username}" class="img-fluid rounded-circle" style="height: 70px; width: 70px;" loading="lazy">
                        {:else}
                            <img class="img-fluid rounded-circle bg-purple py-3 py-lg-5" alt="Avatar Not Found!">
                        {/if}
                    </a>
                </div>
                <div class="col-9 col-md-10 text-center my-auto">
                    <p class="h3">{bookContent.book_title}</p>
                    <p class="h6 mb-0">by <a class="link-light link-opacity-75 text-decoration-none" href="/profile/{bookContent.book_owner_id}">{bookContent.owner_username}</a> - <span class="text-muted">{createdAtFormatted}</span></p>
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
    <div class="row justify-content-between px-lg-5 py-2 py-lg-3 bg-info-stats bg-opacity-10 rounded-3 d-flex align-items-center">
        <div class="col">
            <div class="row justify-content-center d-flex align-items-center" use:tooltip={{...tooltipConfig}} title="Total likes">
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
    <!-- Text section -->
    <div class="row justify-content-center text-center mt-3">
        <div class="col-12 fs-5 bg-purple-opacity-25 p-3 pb-0 mb-2 rounded-4 ">
            {@html bookContent.book_description}
        </div>
    </div>
    <!-- Chapters list section -->
    <div class="row justify-content-center text-center" id="chapters">
        {#if chaptersFound}
            <div class="col-12 pb-2 text-center">
                <p class="h1">Chapters:</p>
            </div>
            <div class="col-12 bg-purple-opacity-25 p-3 px-2 rounded-4 mb-3">
                <div class="row justify-content-evely gy-3 mx-0">
                    {#each chapters as chapter, index (chapter.chapter_id)}
                        <div class="col-12 col-sm-6 col-lg-4 col-xl-3 d-flex align-items-stretch px-0 px-sm-2">
                            <ChapterCard content={chapter} index={index + 1} />
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
    <!-- Copyright and report section -->
    <div class="row justify-content-center text-start">
        <div class="col-10 col-md-9 pt-2 px-0">
            <p class="text-secondary text-center">
                <small>
                    &copy; {currentYear} <a class="link-secondary text-decoration-none" href="/profile/{bookContent.book_owner_id}" use:tooltip={{...tooltipConfig}} title="Profile">{bookContent.owner_username}</a> - {bookContent.book_title}
                </small>
            </p>
        </div>
        <div class="col-auto text-center my-auto mt-md-1 px-0">
            <button class="btn btn-link-secondary" use:tooltip={{...tooltipConfig}} title="Report" data-bs-toggle="modal" data-bs-target="#reportModal">
                <i class="fas fa-flag"></i>
            </button>
        </div>
    </div>
    {#if bookContent.is_owner}
        <div class="row justify-content-center text-center bg-danger bg-opacity-10 border border-danger rounded-3 mb-3">
            <div class="col-12 px-0 mt-2">
                <span class="h4 text-danger-emphasis">Danger Zone:</span>
            </div>
            <div class="col-12 px-0">
                <div class="row justify-content-center pt-1">
                    <div class="col-auto">
                        <a href="/edit/{bookContent.book_id}" class="btn btn-lg btn-shortcut text-light text-opacity-50 w-100 rounded-3" use:tooltip={{...tooltipConfig}} title="Edit Tale">
                            <i class="fas fa-edit"></i>
                            <span class="fs-6">Edit</span>
                        </a>
                    </div>
                    <div class="col-auto">
                        <button class="btn btn-lg btn-shortcut text-light text-opacity-50 w-100 rounded-3" use:tooltip={{...tooltipConfig}} title="Delete Tale" on:click={handleBookDelete}>
                            <i class="fas fa-trash-alt"></i>
                            <span class="fs-6">Delete</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-12 px-0">
                <p class="h6 text-secondary mt-1">This section is visible only to you!</p>
            </div>
        </div>
    {/if}

    <!-- Comments section -->
    <div class="row justify-content-center">
        <div class="col-12 px-0">
            <p class="h3">Comments:</p>
        </div>
        <div class="col-12">
            <div class="row">
                <div class="col-12 px-0">
                    <div class="form-floating text-center">
                        <textarea class="form-control {isTextAreaFocused ? 'bg-purple-opacity-10' : 'bg-purple-opacity-25'}" id="commentInput" placeholder="Write your comment here" maxlength="1000" on:focus={handleFocus} on:blur={handleBlur} bind:value={commentText}></textarea>
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
                        <Comment {comment} {supabase} on:delete={handleCommentDelete} on:reply={handleCommentReply}/>
                    {/each}
                {:else}
                    <div class="row justify-content-center placeholder-glow mb-2">
                        <div class="col-12 placeholder py-4 rounded-3"></div>
                    </div>
                {/if}
            </div>
        {/if}
    </div>

    <!-- Modals section -->
    <div class="modal fade" id="reportModal" tabindex="-1" aria-labelledby="reportModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border border-black text-light bg-purple-dark">
                <div class="modal-header border-bottom border-black">
                    <h5 class="modal-title" id="reportModalLabel">Report Content</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body pb-0">
                    <div class="mb-3">
                        <label for="reportText" class="form-label">Report Text</label>
                        <textarea class="form-control bg-dark bg-opacity-10 text-light" id="reportText" rows="3" maxlength="1000" placeholder="Is this AI? Or NSFW/Mature Content? These are examples of content that can and should be reported ⚠️!" bind:value={reportText}></textarea>
                    </div>
                </div>
                <div class="modal-footer border-0 pt-0">
                    <div class="row w-100">
                        <div class="col ps-0 pe-1">
                            <button type="button" class="btn btn-close-report w-100" data-bs-dismiss="modal">Close</button>
                        </div>
                        <div class="col ps-1 pe-0">
                            <button type="button" class="btn btn-submit-report w-100" on:click={handleReport}>Submit Report</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>

<style>

    #commentInput {
        min-height: 100px;
    }

    .form-floating>.form-control:focus~label,
    .form-floating>.form-control:not(:placeholder-shown)~label,
    .form-floating>.form-select~label {
        opacity: 0;
        transform: scale(.85) translateY(-1.3rem) translateX(0.15rem);
    }

    .fa-heart, .fa-eye, .fa-comment {
        font-size: 1.6rem;
    }

    .bg-info-stats {
        background: linear-gradient(90deg, rgba(128, 0, 128, 0.5) 0%, rgba(75, 0, 130, 0.5) 50%, rgba(60, 0, 104, 0.5) 100%);
    }

    .bg-purple {
        background-color: #5c00a6;
    }

    .bg-purple-opacity-25 {
        background-color: rgba(92, 0, 166, 0.25);
    }

    .bg-purple-opacity-10 {
        background-color: rgba(92, 0, 166, 0.1);
    }

    .bg-purple-dark {
        background-color: #280043;
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

    .btn-link-secondary {
        color: #dc3545;
    }

    .btn-link-secondary:hover {
        color: #dc3545;
    }

    .btn-link-secondary:focus {
        color: #dc3545;
    }

    .btn-link-secondary:active {
        color: #dc3545;
    }

    .btn-submit-report {
        background-color: #5c00a6;
    }

    .btn-submit-report:hover {
        background-color: #4a007f;
    }

    .btn-submit-report:focus {
        background-color: #4a007f;
    }

    .btn-submit-report:active {
        background-color: #4a007f;
    }

    .btn-close-report {
        background-color: rgba(109, 47, 157, 0.25);
    }

    .btn-close-report:hover {
        background-color: #4a007f;
    }

    .btn-close-report:focus {
        background-color: #4a007f;
    }

    .btn-close-report:active {
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

