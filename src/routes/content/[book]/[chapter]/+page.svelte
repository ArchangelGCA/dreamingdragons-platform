<script>
    import { tooltip } from "@svelte-plugins/tooltips";
    import {toast} from "@zerodevx/svelte-toast";
    import {deserialize} from "$app/forms";
    import autoAnimate from '@formkit/auto-animate';
    import {invalidateAll} from "$app/navigation";
    import CommentsSection from "$lib/components/pages/CommentsSection.svelte";
    import UserAvatar from "$lib/components/layout/UserAvatar.svelte";
    import ContentImage from "$lib/components/layout/ContentImage.svelte";
    import {onMount} from "svelte";

    export let data;

    let {
        supabase,
        comments,
        image_proxy,
        user_id,
        is_liked,
        tooltipConfig,
        chapterContent,
        chapters,
        tags
    } = data;

    $: ({
        comments,
        chapterContent,
        user_id,
        is_liked,
        chapters,
        tags
    } = data)

    let likeActionActive = false;
    let reportActionActive = false;
    let hasPreviousChapter = true;
    let hasNextChapter = true;
    let previousChapterId = 0;
    let nextChapterId = 0;
    let likes_count;
    let currentYear;
    let createdAt;
    let createdAtFormatted;
    let createdAtDetailed;
    let deleteChapterActionActive = false;
    let reportText = '';

    onMount(async () => {
        await getClientIp().then((ip) => handleView(ip));
    });

    async function getClientIp() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            return await response.json().then((data) => {return data.ip});
        } catch (error) {
            console.error('Error fetching IP address:', error);
            return null;
        }
    }

    async function handleView(ip = null){
        if (user_id && ip) {
            await supabase
                .from('views')
                .insert([{
                    chapter_id: chapterContent.chapter_id,
                    ip_address: ip,
                    user_id: user_id
                }
                ]).then((error) => {
                    if (!error) chapterContent.total_views++;
                });
        } else if (ip){
            // Using only IP address
            await supabase
                .from('views')
                .insert([{
                    chapter_id: chapterContent.chapter_id,
                    ip_address: ip
                }
                ]).then((error) => {
                    if (!error) chapterContent.total_views++;
                });
        }
    }

    async function handlePreviousAndNextChapters() {
        hasPreviousChapter = true;
        hasNextChapter = true;
        const { data: chapters, error } = await supabase
            .from('chapters')
            .select('id, number_ordinal')
            .eq('book_id', chapterContent.book_id)
            .order('number_ordinal');

        if (!error && chapters.length > 0) {
            const currentIndex = chapters.findIndex(chapter => chapter.number_ordinal === chapterContent.number_ordinal);

            if (currentIndex > 0) {
                hasPreviousChapter = true;
                previousChapterId = chapters[currentIndex - 1].id;
            } else {
                hasPreviousChapter = false;
            }

            if (currentIndex < chapters.length - 1) {
                hasNextChapter = true;
                nextChapterId = chapters[currentIndex + 1].id;
            } else {
                hasNextChapter = false;
            }
        } else {
            hasPreviousChapter = false;
            hasNextChapter = false;
        }
    }

    async function handleHeartClick() {

        if (likeActionActive) {
            return;
        }

        likeActionActive = true;
        const data = new FormData();
        data.append('chapterId', chapterContent.chapter_id);

        is_liked = !is_liked;

        const response = await fetch('?/like', {
            method: 'POST',
            body: data
        });

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                if (is_liked) {
                    toast.push('Chapter liked ❤️', {
                        theme: {
                            '--toastBackground': '#5c00a6',
                            '--toastColor': '#fff',
                        }
                    });
                    likes_count++;
                } else {
                    toast.push('Chapter unliked 💔', {
                        theme: {
                            '--toastBackground': '#5c00a6',
                            '--toastColor': '#fff',
                        }
                    });
                    likes_count--;
                }
            } else {
                is_liked = !is_liked;
                toast.push('Error: ' + result.data.body.message, {
                    theme: {
                        '--toastBackground': '#f44336',
                        '--toastColor': '#fff',
                    }
                });
            }
        } else {
            is_liked = !is_liked;
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

    $: if (chapterContent) {
        handleView();
        handlePreviousAndNextChapters();
        currentYear = new Date().getFullYear();
        likes_count = chapterContent.likes_count;
        createdAt = new Date(chapterContent.created_at);
        createdAtFormatted = `${(createdAt.getDate()).toString().padStart(2, '0')}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getFullYear()}`;
        createdAtDetailed = `${(createdAt.getDate()).toString().padStart(2, '0')}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getFullYear()} ${createdAt.getHours().toString().padStart(2, '0')}:${createdAt.getMinutes().toString().padStart(2, '0')}`;
        tags.forEach((item) => item.url = `/search?tag=${item.name}`);
    }
</script>

<div class="container-xxl">
    <!-- Shortcut button -->
    <div class="row justify-content-center my-2">
        <div class="col-12 text-center px-0">
            <a href="#title" class="btn btn-shortcut text-light text-opacity-50 w-100 rounded-3 py-3 py-md-2" use:tooltip={{...tooltipConfig}} title="Go to Text" aria-label="Go to text">
                <i class="fas fa-chevron-down"></i>
            </a>
        </div>
    </div>
    <!-- Chapter and Book cover -->
    <div class="row justify-content-center text-center">
        <div class="col-12 mb-4 px-0" use:tooltip={{...tooltipConfig}} title="Open Book">
            <a href="/content/{chapterContent.book_id}" target="_blank" aria-label="Open image in a new page.">
                <ContentImage url={chapterContent.book_cover_url} alt={chapterContent.book_title} />
            </a>
        </div>
    </div>
    <!-- Owner, Title, Tags -->
    <div class="row justify-content-center text-center bg-purple-opacity-10 py-3 mb-3 rounded-4">
        <div class="col-12">
            <div class="row justify-content-center d-flex align-items-center">
                <div class="d-flex col-3 col-md-2 justify-content-center justify-content-xl-end pe-0 pe-md-1">
                    <a class="w-auto" href="/profile/{chapterContent.owner_id}" aria-label="Visit author's profile">
                        <UserAvatar url={chapterContent.owner_avatar_url} username={chapterContent.owner_username} id={chapterContent.owner_id} {image_proxy} size="75px"/>
                    </a>
                </div>
                <div class="col-9 col-md-10 text-center my-auto">
                    <h2><a class="link-light link-opacity-75 text-decoration-none" href="/content/{chapterContent.book_id}">{chapterContent.book_title}</a>: {chapterContent.title}</h2>
                    <h6 class="mb-0">by <a class="link-light link-opacity-75 text-decoration-none" href="/profile/{chapterContent.owner_id}">{chapterContent.owner_username}</a> - <span class="text-muted" use:tooltip={{...tooltipConfig}} title="{createdAtDetailed}">{createdAtFormatted}</span></h6>
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
    <!-- Stats -->
    <div class="row justify-content-between px-lg-5 py-2 py-lg-3 mb-3 bg-info-stats bg-opacity-10 rounded-3 d-flex align-items-center">
        <div class="col">
            <div class="row justify-content-center d-flex align-items-center" use:tooltip={{...tooltipConfig}} title="Total likes">
                <div class="col-auto d-flex align-items-center pe-0">
                    <button class="btn btn-link text-decoration-none p-0 border-0 w-auto mt-1" on:click={handleHeartClick}>
                        <i class="fas fa-heart {is_liked ? 'liked' : 'unliked'}"></i>
                    </button>
                </div>
                <div class="col-auto">
                    <span class="mt-1">{likes_count}</span>
                </div>
            </div>
        </div>
        <div class="col">
            <div class="row justify-content-center d-flex align-items-center" use:tooltip={{...tooltipConfig}} title="Views">
                <div class="col-auto d-flex align-items-center pe-0">
                    <i class="fas fa-eye"></i>
                </div>
                <div class="col-auto mt-1">
                    <span>{chapterContent.total_views}</span>
                </div>
            </div>
        </div>
        <div class="col">
            <div class="row justify-content-center d-flex align-items-center" use:tooltip={{...tooltipConfig}} title="Comments">
                <div class="col-auto d-flex align-items-center pe-0">
                    <i class="fas fa-comment"></i>
                </div>
                <div class="col-auto mt-1">
                    <span class="">{comments.length}</span>
                </div>
            </div>
        </div>
    </div>
    <!-- Chapter title -->
    <div class="row justify-content-center text-center" id="title">
        <div class="col-12 px-0">
            <p class="fs-5 bg-purple-opacity-25 p-3 rounded-4">{chapterContent.title}</p>
        </div>
    </div>
    <!-- Previous and Next Chapters buttons -->
    {#if hasPreviousChapter || hasNextChapter}
        <div class="row justify-content-center text-center mb-3">
            <div class="col-12 col-md-6 col-lg-5">
                <!-- Chapters navigator -->
                <div class="row justify-content-center mb-2">
                    <div class="col-12 px-1">
                        <button class="btn btn-chapters-navigator w-100" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasPageNavigation" aria-controls="offcanvasPageNavigation">
                            <i class="fas fa-list"></i>
                            <span class="fs-6">Chapters</span>
                        </button>
                    </div>
                </div>
                <!-- Previous and Next Chapters -->
                <div class="row justify-content-center text-center">
                    <div class="col-6 px-1" use:autoAnimate>
                        {#if hasPreviousChapter}
                            <a href="/content/{chapterContent.book_id}/{previousChapterId}" class="btn btn-chapters text-opacity-50 w-100 rounded-3" use:tooltip={{...tooltipConfig}} title="Previous Chapter" data-sveltekit-noscroll>
                                <i class="fas fa-chevron-left"></i>
                                <span class="fs-6">Previous</span>
                            </a>
                        {:else if hasNextChapter}
                            <span class="btn btn-dark text-light text-opacity-50 w-100 rounded-3 disabled" use:tooltip={{...tooltipConfig}} title="No previous chapters">
                                <i class="fas fa-chevron-left"></i>
                                <span class="fs-6">You're here! 😅</span>
                            </span>
                        {/if}
                    </div>
                    <div class="col-6 px-1" use:autoAnimate>
                        {#if hasNextChapter}
                            <a href="/content/{chapterContent.book_id}/{nextChapterId}" class="btn btn-chapters text-opacity-50 w-100 rounded-3" use:tooltip={{...tooltipConfig}} title="Next Chapter" data-sveltekit-noscroll>
                                <span class="fs-6">Next</span>
                                <i class="fas fa-chevron-right"></i>
                            </a>
                        {:else if hasPreviousChapter}
                            <span class="btn btn-dark text-light text-opacity-50 w-100 rounded-3 disabled" use:tooltip={{...tooltipConfig}} title="No more chapters">
                                <span class="fs-6">You're here! 😅</span>
                                <i class="fas fa-chevron-right"></i>
                            </span>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    {/if}
    <!-- Chapter text -->
    <div class="row justify-content-center bg-text-opacity-10 rounded-3 py-3 px-2 px-md-auto">
        <div class="col-12 col-lg-10 bg-black bg-opacity-25 shadow-lg mx-auto px-2 px-md-5 pt-3 pb-2 rounded-3">
            {@html chapterContent.text}
        </div>
    </div>
    <!-- Copyright and Report -->
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
    <CommentsSection {comments} {supabase} chapterId="{chapterContent.chapter_id}" {image_proxy} on:invalidate={handleCommentInvalidate} />

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
    <!-- Bottom offcanvas chapters navigation -->
    <div class="offcanvas offcanvas-bottom h-auto border-top-purple" tabindex="-1" id="offcanvasPageNavigation" aria-labelledby="offcanvasPageNavigationLabel">
        <div class="offcanvas-header bg-black bg-opacity-75 pb-0">
            <h5 id="offcanvasPageNavigationLabel">Chapters navigator</h5>
            <button type="button" class="btn-close text-reset me-md-3" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body bg-black bg-opacity-75 pt-1 pt-md-2">
            <div class="row">
                <div class="col-12">
                    <div class="row row-horizontal flex-nowrap py-2">
                        {#each chapters as chapter, index (chapter.id)}
                            <div class="col-3 col-md-2 col-lg-1">
                                <a href="/content/{chapter.book_id}/{chapter.id}" data-sveltekit-noscroll class="btn {chapter.id === chapterContent.chapter_id ? 'btn-chapters-active' : 'btn-chapters'} w-100">{index}</a>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
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

    .bg-purple-dark {
        background-color: #280043;
    }

    .border-top-purple {
        border-top: 1px solid #5c00a6;
    }

    .btn-shortcut {
        background-color: transparent;
    }

    .btn-shortcut:hover {
        background-color: #4a007f;
        border-color: #4a007f;
    }

    .btn-chapters {
        background-color: #5c00a6;
    }

    .btn-chapters:hover {
        background-color: #4a007f;
        border-color: #4a007f;
    }

    .btn-chapters:active {
        background-color: #4a007f;
        border-color: #4a007f;
    }

    .btn-chapters-active {
        background-color: #4a007f;
        border-color: #4a007f;
        box-shadow: 0 0 0.15rem 0.2rem rgba(92, 0, 166, 0.75);
    }

    .btn-chapters-navigator {
        background-color: rgba(92, 0, 166, 0.15);
        border-color: rgba(92, 0, 166, 0.75);
    }

    .btn-chapters-navigator:hover {
        background-color: rgba(92, 0, 166, 0.25);
        border-color: rgba(92, 0, 166, 0.75);
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

    .row-horizontal {
        overflow-x: auto;
        white-space: nowrap;
    }

    /** customize scrollbar chapters navigator */
    .row-horizontal::-webkit-scrollbar {
        width: 10px;
    }

    .row-horizontal::-webkit-scrollbar-track {
        background: rgba(92, 0, 166, 0.25);
    }

    .row-horizontal::-webkit-scrollbar-thumb {
        background: rgba(92, 0, 166, 0.80);
        border-radius: 8px;
        cursor: pointer;
    }

    .row-horizontal::-webkit-scrollbar-thumb:hover {
        background: rgba(92, 0, 166, 1);
    }

    .row-horizontal::-webkit-scrollbar-thumb:active {
        background: rgba(92, 0, 166, 1);
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