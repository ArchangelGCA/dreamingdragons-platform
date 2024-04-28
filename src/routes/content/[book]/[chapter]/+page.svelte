<script>
    import { tooltip } from "@svelte-plugins/tooltips";
    import {toast} from "@zerodevx/svelte-toast";
    import {deserialize} from "$app/forms";
    import {onMount} from "svelte";
    import Seo from "sk-seo";
    import {invalidateAll} from "$app/navigation";
    import CommentsSection from "$lib/components/pages/CommentsSection.svelte";
    import UserAvatar from "$lib/components/layout/UserAvatar.svelte";

    export let data;
    let { supabase, comments, ip_address, user_id } = data;
    $: ({ comments, user_id } = data)

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
    let reportActionActive = false;
    let text = 'Text not found!';
    let currentYear = new Date().getFullYear();
    let createdAt = new Date(chapterContent.created_at);
    let createdAtFormatted = `${(createdAt.getDate()).toString().padStart(2, '0')}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getFullYear()}`;
    let deleteChapterActionActive = false;
    let reportText = '';

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

    async function handleChapterDelete(){

        if (deleteChapterActionActive) return;
        if (!chapterContent.is_owner) return;

        if (!confirm('Are you sure that you want to delete this Chapter?')) return;

        deleteChapterActionActive = true;

        const data = new FormData();
        data.append('chapterId', chapterContent.chapter_id);

        const response = await fetch('?/delete_chapter', {
            method: 'POST',
            body: data
        });

        const result = deserialize(await response.text());

        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push('Chapter ' + chapterContent.title + ' deleted! 🗑️', {
                    theme: {
                        '--toastBackground': '#5c00a6',
                        '--toastColor': '#fff',
                    }
                });
                window.location.href = '/content/' + chapterContent.book_id;
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

        deleteChapterActionActive = false;
    }

    async function handleReport(){
        if (reportActionActive) return;

        reportActionActive = true;

        const formData = new FormData();
        formData.append('book_id', chapterContent.book_id);
        formData.append('chapter_id', chapterContent.chapter_id);
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

    async function handleCommentInvalidate(){
        await invalidateAll();
    }

    const seo = {
        title: chapterContent.book_title + ' - ' + chapterContent.title + ' | Roses In The Flames',
        description: chapterContent.title + ' by ' + chapterContent.owner_username + ' - ' +  chapterContent.book_title + ' | Roses In The Flames',
        siteName: 'Roses In The Flames | Tales',
        imageURL: chapterContent.book_cover_url,
        author: 'ArchangelGCA'
    }
</script>

<Seo {...seo} />

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
                <div class="d-flex col-3 col-md-2 justify-content-center justify-content-xl-end">
                    <a class="w-auto" href="/profile/{chapterContent.owner_id}" use:tooltip={{...tooltipConfig}} title="Artist's profile">
                        <UserAvatar url={chapterContent.owner_avatar_url} username={chapterContent.owner_username} id={chapterContent.owner_id} size="80px"/>
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
    <div class="row justify-content-center text-start">
        <div class="col-10 col-md-9 pt-2 px-0">
            <p class="text-secondary text-center">
                <small>
                    &copy; {currentYear} <a class="link-secondary text-decoration-none" href="/profile/{chapterContent.owner_id}" use:tooltip={{...tooltipConfig}} title="Profile">{chapterContent.owner_username}</a> - {chapterContent.book_title} - {chapterContent.title}
                </small>
            </p>
        </div>
        <div class="col-auto text-center my-auto mt-md-1 px-0">
            <button class="btn btn-link-secondary" use:tooltip={{...tooltipConfig}} title="Report" data-bs-toggle="modal" data-bs-target="#reportModal">
                <i class="fas fa-flag"></i>
            </button>
        </div>
    </div>
    {#if chapterContent.is_owner}
        <div class="row justify-content-center text-center bg-danger bg-opacity-10 border border-danger rounded-3 mb-3">
            <div class="col-12 px-0 mt-2">
                <span class="h4 text-danger-emphasis">Danger Zone:</span>
            </div>
            <div class="col-12 px-0">
                <div class="row justify-content-center pt-1">
                    <div class="col-auto">
                        <a href="/edit/{chapterContent.book_id}/{chapterContent.chapter_id}" class="btn btn-lg btn-shortcut text-light text-opacity-50 w-100 rounded-3" use:tooltip={{...tooltipConfig}} title="Edit Chapter">
                            <i class="fas fa-edit"></i>
                            <span class="fs-6">Edit</span>
                        </a>
                    </div>
                    <div class="col-auto">
                        <button class="btn btn-lg btn-shortcut text-light text-opacity-50 w-100 rounded-3" use:tooltip={{...tooltipConfig}} title="Delete Chapter" on:click={handleChapterDelete}>
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
    <CommentsSection {comments} {supabase} chapterId="{chapterContent.chapter_id}" on:invalidate={handleCommentInvalidate} />

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

    .bg-text-opacity-10 {
        background-color: rgba(128, 0, 128, 0.1);
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