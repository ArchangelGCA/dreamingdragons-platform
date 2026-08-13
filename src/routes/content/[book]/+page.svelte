<script>
    import {tooltip} from "$lib/utils/tooltip.js";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";
    import {deserialize} from "$app/forms";
    import {toast} from "$lib/components/svelte-toast";
    import ChapterCard from "$lib/components/profile/ChapterCard.svelte";
    import {onDestroy, onMount} from "svelte";
    import {invalidateAll} from "$app/navigation";
    import CommentsSection from "$lib/components/pages/CommentsSection.svelte";
    import UserAvatar from "$lib/components/layout/UserAvatar.svelte";
    import autoAnimate from '@formkit/auto-animate';
    import ContentImage from "$lib/components/layout/ContentImage.svelte";
    import {browser} from "$app/environment";
    import {mentionTooltip, removeMentionListener} from "$lib/utils/gcamentions.js";
    import UserAvatarNavbar from "$lib/components/layout/UserAvatarNavbar.svelte";
    import ShareButton from "$lib/components/layout/ShareButton.svelte";
    import { createBookPath, createProfilePath } from "$lib/utils/slugs.js";
    import { page } from '$app/state';

    /** @type {{data: any}} */
    let {data} = $props();
    let {
        supabase,
        image_proxy,
        bookContent,
        user_id,
    } = $state(data);

    $effect(() => {
        ({
            user_id,
            bookContent,
        } = data)
    });
    
    // Generate SEO-friendly URL for sharing
    let bookUrl = $derived(createBookPath(bookContent.title, bookContent.id));
    //let editUrl = $derived(createBookPath('edit', bookContent.id));

    onMount(async () => {
        if (browser) {
            await getClientIp().then((ip) => handleView(ip));
        }
        await mentionTooltip(supabase);
    });

    onDestroy(async () => {
        await removeMentionListener();
    })

    let commentsCount = $derived(bookContent.comments.length);
    let likeActionActive = false;
    let reportActionActive = false;
    let currentYear = new Date().getFullYear();
    let createdAt = $derived(new Date(bookContent.created_at));
    let createdAtFormatted = $derived(`${(createdAt.getDate()).toString().padStart(2, '0')}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getFullYear()}`);
    let createdAtDetailed = $derived(`${(createdAt.getDate()).toString().padStart(2, '0')}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getFullYear()} ${createdAt.getHours().toString().padStart(2, '0')}:${createdAt.getMinutes().toString().padStart(2, '0')}`);
    let deleteBookActionActive = false;
    let reportText = $state('');

    async function getClientIp() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            return await response.json().then((data) => {
                return data.ip
            });
        } catch (error) {
            console.error('Error fetching IP address:', error);
            return null;
        }
    }

    async function handleView(ip = null) {
        if (user_id && ip) {
            await supabase
                .from('views')
                .insert([{
                    book_id: bookContent.id,
                    ip_address: ip,
                    user_id: user_id
                }
                ]);
        } else if (ip) {
            // Using only IP address
            await supabase
                .from('views')
                .insert([{
                    book_id: bookContent.id,
                    ip_address: ip
                }
                ]);
        }
    }

    async function handleHeartClick() {

        if (likeActionActive) {
            return;
        }

        likeActionActive = true;
        const data = new FormData();
        data.append('contentId', bookContent.id);

        // Store original state for potential rollback
        const originalLiked = bookContent.is_liked;
        const originalBookLikes = [...bookContent.book_likes];

        // Optimistic update
        bookContent.is_liked = !bookContent.is_liked;
        
        if (bookContent.is_liked) {
            // Adding a like - add a temporary like object to the array
            bookContent.book_likes = [...bookContent.book_likes, {
                id: Date.now(), // Temporary ID for reactivity
                user_id: user_id,
                profiles: {
                    username: page.data.session?.user?.user_metadata?.display_name || 'You',
                    avatar_url: page.data.session?.user?.user_metadata?.avatar_url
                },
                created_at: new Date().toISOString()
            }];
        } else {
            // Removing a like - filter out the user's like
            bookContent.book_likes = bookContent.book_likes.filter((like) => like.user_id !== user_id);
        }

        try {
            const response = await fetch('?/like', {
                method: 'POST',
                body: data
            });

            const result = deserialize(await response.text());
            if (result.type === 'success') {
                if (result.data.status === 200) {
                    if (bookContent.is_liked) {
                        toast.push('Tale liked ❤️', {
                            theme: {
                                '--toastBackground': '#5c00a6',
                                '--toastColor': '#fff',
                            }
                        });
                    } else {
                        toast.push('Tale unliked 💔', {
                            theme: {
                                '--toastBackground': '#5c00a6',
                                '--toastColor': '#fff',
                            }
                        });
                    }
                    await invalidateAll();
                } else {
                    // Revert optimistic update on server error
                    bookContent.is_liked = originalLiked;
                    bookContent.book_likes = originalBookLikes;
                    toast.push('Error: ' + result.data.body.message, {
                        theme: {
                            '--toastBackground': '#f44336',
                            '--toastColor': '#fff',
                        }
                    });
                }
            } else {
                // Revert optimistic update on request error
                bookContent.is_liked = originalLiked;
                bookContent.book_likes = originalBookLikes;
                toast.push('Error during action (Please login)', {
                    theme: {
                        '--toastBackground': '#f44336',
                        '--toastColor': '#fff',
                    }
                });
            }
        } catch (error) {
            // Revert optimistic update on network error
            bookContent.is_liked = originalLiked;
            bookContent.book_likes = originalBookLikes;
            console.error('Like action failed:', error);
            toast.push('Network error occurred', {
                theme: {
                    '--toastBackground': '#f44336',
                    '--toastColor': '#fff',
                }
            });
        }

        likeActionActive = false;
    }

    async function handleBookDelete() {

        if (deleteBookActionActive) return;
        if (!bookContent.is_owner) return;

        if (!confirm('Are you sure that you want to delete this Tale?')) return;

        deleteBookActionActive = true;

        const data = new FormData();
        data.append('bookId', bookContent.id);

        const response = await fetch('?/delete_book', {
            method: 'POST',
            body: data
        });

        const result = deserialize(await response.text());
        if (result.type === 'success') {
            if (result.data.status === 200) {
                toast.push('Tale ' + bookContent.title + ' deleted! 🗑️', {
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

    async function handleReport() {
        if (reportActionActive) return;

        reportActionActive = true;

        const formData = new FormData();
        formData.append('book_id', bookContent.id);
        formData.append('report_description', reportText);

        const response = await fetch('?/report', {
            method: 'POST',
            body: formData
        });

        const result = deserialize(await response.text());
        if (result.type === 'success') {
            if (result.data.status === 200) {
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

</script>

<div class="container-xxl">
    <div class="row justify-content-center my-2">
        <div class="col-12 text-center px-0">
            <a href="#chapters" class="btn btn-shortcut text-light text-opacity-50 w-100 rounded-3 py-3 py-md-2"
               use:tooltip={{...tooltipConfig}} title="Go to Chapters" aria-label="View chapters">
                <i class="fas fa-chevron-down"></i>
            </a>
        </div>
    </div>
    <div class="row justify-content-center text-center">
        <div class="col-12 mb-4 px-0" use:tooltip={{...tooltipConfig}} title="Original Cover">
            <a href="{bookContent.cover_url}" target="_blank" aria-label="Open image in new page." use:autoAnimate>
                <ContentImage src={bookContent.cover_url} alt={bookContent.title} {image_proxy}/>
            </a>
        </div>
    </div>
    <div class="row justify-content-center text-center bg-purple-opacity-10 py-3 mb-3 rounded-4">
        <div class="col-12">
            <div class="row justify-content-center d-flex align-items-center">
                <a href={createProfilePath(bookContent.profiles.username, bookContent.owner_id)}
                   class="d-flex col-3 col-md-2 justify-content-center justify-content-xl-end pe-0 pe-md-1">
                    <UserAvatar url={bookContent.profiles.avatar_url} username={bookContent.profiles.username}
                                id={bookContent.owner_id} {image_proxy} link={false} size="75px"/>
                </a>
                <div class="col-9 col-md-10 text-center my-auto">
                    <p class="h3">{bookContent.title}</p>
                    <p class="h6 mb-0">by <a class="link-light link-opacity-75 text-decoration-none"
                                             href={createProfilePath(bookContent.profiles.username, bookContent.owner_id)}>{bookContent.profiles.username}</a>
                        - <span class="text-muted" use:tooltip={{...tooltipConfig}}
                                title="{createdAtDetailed}">{createdAtFormatted}</span></p>
                    {#if bookContent.tags.length !== 0}
                        <div class="row justify-content-center mt-1">
                            <div class="col-auto">
                                {#each bookContent.tags as tag (tag.id)}
                                    <a href="/search?tag={tag.name}"
                                       class="badge bg-purple text-light me-1 mb-1 text-decoration-none"
                                       use:tooltip={{...tooltipConfig}} title="Search for {tag.name}">{tag.name}</a>
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
            <div class="row justify-content-center d-flex align-items-center" use:tooltip={{...tooltipConfig}}
                 title="Likes">
                <div class="col-auto d-flex align-items-center pe-0">
                    <button class="btn btn-link text-decoration-none p-0 border-0 w-auto mt-1"
                            onclick={handleHeartClick} aria-label="Like Tale">
                        <i class="fas fa-heart {bookContent.is_liked ? 'liked' : 'unliked'}"></i>
                    </button>
                </div>
                <div class="col-auto dropdown-center">
                    <span class="btn btn-link text-light text-decoration-none p-0 border-0 mt-1"
                          data-bs-toggle="dropdown" aria-label="Show users who liked"
                          aria-expanded="false">{bookContent.book_likes.length}</span>
                    <ul class="dropdown-menu bg-purple-dark border-0 likes-container">
                        {#if bookContent.book_likes && bookContent.book_likes.length > 0}
                            {#each bookContent.book_likes as like (like.id)}
                                <li>
                                    <a class="dropdown-item" href={createProfilePath(like.profiles.username, like.user_id)}>
                                        <span>
                                            <UserAvatarNavbar url={like.profiles.avatar_url}
                                                              username={like.profiles.username} {image_proxy}
                                                              size="25px"
                                                              classes="me-2"/><span>{like.profiles.username}</span>
                                        </span>
                                    </a>
                                </li>
                            {/each}
                        {:else}
                            <li><span class="dropdown-item text-light text-opacity-50">No likes yet</span></li>
                        {/if}
                    </ul>
                </div>
            </div>
        </div>
        <div class="col">
            <div class="row justify-content-center d-flex align-items-center" use:tooltip={{...tooltipConfig}}
                 title="Views">
                <div class="col-auto d-flex align-items-center pe-0">
                    <i class="fas fa-eye"></i>
                </div>
                <div class="col-auto mt-1">
                    <span class="">{bookContent.views[0].count}</span>
                </div>
            </div>
        </div>
        <div class="col">
            <div class="row justify-content-center d-flex align-items-center" use:tooltip={{...tooltipConfig}}
                 title="Comments">
                <div class="col-auto d-flex align-items-center pe-0">
                    <i class="fas fa-comment"></i>
                </div>
                <div class="col-auto mt-1">
                    <span class="">{commentsCount}</span>
                </div>
            </div>
        </div>
        <div class="col">
            <div class="row justify-content-center d-flex align-items-center">
                <div class="col-auto d-flex align-items-center pe-2">
                    <ShareButton
                            url={typeof window !== 'undefined' ? window.location.href : `https://tales.archangelgca.eu${bookUrl}`}
                            title="{bookContent.title} by {bookContent.profiles.username}"
                            description="Check out this amazing tale on DreamingDragons!"
                    />
                </div>
                <!--<div class="col-auto d-flex align-items-center">
                    <RSSButton
                            rssUrl="/rss/content/{bookContent.id}.xml"
                            label="Book RSS"
                            size="sm"
                    />
                </div>-->
            </div>
        </div>
    </div>
    <!-- Text section -->
    <div class="row justify-content-center text-center mt-3">
        <div class="col-12 fs-5 bg-purple-opacity-25 p-3 pb-0 mb-2 rounded-4 ">
            {@html bookContent.description}
        </div>
    </div>
    <!-- Chapters list section -->
    <div class="row justify-content-center text-center" id="chapters">
        {#if bookContent && bookContent.chapters.length > 0}
            <div class="col-12 py-2 text-center">
                <p class="h1">Chapters:</p>
            </div>
            <div class="col-12 bg-purple-opacity-25 p-3 px-2 rounded-4 mb-3">
                <div class="row justify-content-evely gy-3 mx-0">
                    {#each bookContent.chapters as chapter, index (chapter.id)}
                        <div class="col-12 col-sm-6 col-lg-4 col-xl-3 d-flex align-items-stretch px-0 px-sm-2">
                            <ChapterCard content={chapter} index={index + 1} {image_proxy} {user_id} bookTitle={bookContent.title}/>
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
                    &copy; {currentYear} <a class="link-secondary text-decoration-none"
                                            href={createProfilePath(bookContent.profiles.username, bookContent.owner_id)} use:tooltip={{...tooltipConfig}}
                                            title="Profile">{bookContent.profiles.username}</a> - {bookContent.title}
                </small>
            </p>
        </div>
        <div class="col-auto text-center my-auto mt-md-1 px-0">
            <button class="btn btn-link-secondary" use:tooltip={{...tooltipConfig}} title="Report"
                    data-bs-toggle="modal" data-bs-target="#reportModal" aria-label="Report tale">
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
                        <a href="/edit/{bookContent.id}"
                           class="btn btn-lg btn-shortcut text-light text-opacity-50 w-100 rounded-3"
                           use:tooltip={{...tooltipConfig}} title="Edit Tale">
                            <i class="fas fa-edit"></i>
                            <span class="fs-6">Edit</span>
                        </a>
                    </div>
                    <div class="col-auto">
                        <button class="btn btn-lg btn-shortcut text-light text-opacity-50 w-100 rounded-3"
                                use:tooltip={{...tooltipConfig}} title="Delete Tale" onclick={handleBookDelete}>
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
    <CommentsSection comments={bookContent.comments} {supabase} bookId={bookContent.id} {image_proxy}/>

    <!-- Modals section -->
    <div class="modal fade" id="reportModal" tabindex="-1" aria-labelledby="reportModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border border-black text-light bg-purple-dark">
                <div class="modal-header border-bottom border-black">
                    <h5 class="modal-title" id="reportModalLabel">Report Content</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                            aria-label="Close"></button>
                </div>
                <div class="modal-body pb-0">
                    <div class="mb-3">
                        <label for="reportText" class="form-label">Report Text</label>
                        <textarea class="form-control bg-dark bg-opacity-10 text-light" id="reportText" rows="3"
                                  maxlength="1000"
                                  placeholder="Is this AI? Or NSFW/Mature Content? These are examples of content that can and should be reported ⚠️!"
                                  bind:value={reportText}></textarea>
                    </div>
                </div>
                <div class="modal-footer border-0 pt-0">
                    <div class="row w-100">
                        <div class="col ps-0 pe-1">
                            <button type="button" class="btn btn-close-report w-100" data-bs-dismiss="modal">Close
                            </button>
                        </div>
                        <div class="col ps-1 pe-0">
                            <button type="button" class="btn btn-submit-report w-100" onclick={handleReport}>Submit
                                Report
                            </button>
                        </div>
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

    .dropdown-item:hover {
        background-color: rgba(31, 0, 51, 0.95);
    }

    .dropdown-item:active {
        background-color: rgba(31, 0, 51, 0.95);
    }

    .dropdown-item:focus {
        background-color: rgba(31, 0, 51, 0.95);
    }

    .likes-container {
        overflow-y: auto;
        max-height: 300px;
        box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.5);
    }

    .likes-container::-webkit-scrollbar {
        width: 10px;
        background-color: #1f002e;
        border-top-right-radius: 15px;
        border-bottom-right-radius: 15px;
    }

    .likes-container::-webkit-scrollbar-thumb {
        background: #5b0083;
        border-radius: 20px;
    }

    .likes-container::-webkit-scrollbar-thumb:hover {
        background: #6e00a1;
    }

    @keyframes heart-pulse {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.2);
        }
        100% {
            transform: scale(1);
        }
    }

    @keyframes heart-unpulse {
        0% {
            transform: scale(0.8);
        }
        50% {
            transform: scale(1);
        }
        100% {
            transform: scale(0.8);
        }
    }
</style>

