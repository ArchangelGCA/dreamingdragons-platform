<script>
    import { tooltip } from "svelte-tooltip-gca";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";
    import {toast} from "$lib/components/svelte-toast";
    import Comment from "$lib/components/pages/Comment.svelte";
    import {deserialize} from "$app/forms";
    import UserAvatar from "$lib/components/layout/UserAvatar.svelte";
    import {invalidateAll} from "$app/navigation";
    import { createProfilePath } from '$lib/utils/slugs.js';
    import { fly, slide } from 'svelte/transition';
    import { quintOut, cubicOut } from 'svelte/easing';

    /** @type {{comment: any, supabase: any, image_proxy: any}} */
    let { comment, supabase, image_proxy } = $props();

    let replyContent = $state('');
    let isHovering = $state(false);
    let isReplyOpen = $state(false);
    let isReplyActionActive = $state(false);
    let isDeleting = $state(false);

    async function deleteComment() {
        if (isDeleting) return;
        
        isDeleting = true;
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', comment.id);

        if (error) {
            console.error('Error deleting comment: ', error.message);
            toast.push('Error deleting comment!', {
                theme: {
                    '--toastBackground': 'rgba(92,0,166,0.9)',
                    '--toastColor': 'white'
                }
            });
            isDeleting = false;
        } else {
            toast.push('Comment deleted!', {
                theme: {
                    '--toastBackground': 'rgba(92,0,166,0.9)',
                    '--toastColor': 'white'
                }
            });
            await invalidateAll();
        }
    }

    function handleMouseEnter() {
        isHovering = true;
    }

    function handleMouseLeave() {
        isHovering = false;
    }

    function toggleReply() {
        isReplyOpen = !isReplyOpen;
        if (!isReplyOpen) {
            replyContent = '';
        }
    }

    async function addReply() {
        if (isReplyActionActive) return;

        if (!replyContent || replyContent.trim() === '') {
            toast.push('Reply content cannot be empty!', {
                theme: {
                    '--toastBackground': 'rgba(92,0,166,0.9)',
                    '--toastColor': 'white'
                }
            });
            return;
        }

        isReplyActionActive = true;

        const toastId = toast.push('Sending reply...', {
            theme: {
                '--toastBackground': 'rgba(92,0,166,0.9)',
                '--toastColor': 'white'
            }
        });

        const data = new FormData();
        data.append('parentCommentId', comment.id);
        data.append('content', replyContent);
        if (comment.book_id) {
            data.append('bookId', comment.book_id);
        } else if (comment.chapter_id) {
            data.append('chapterId', comment.chapter_id);
        }

        const response = await fetch('?/add_comment', {
            method: 'POST',
            body: data
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push('Reply sent!', {
                    theme: {
                        '--toastBackground': 'rgba(92,0,166,0.9)',
                        '--toastColor': 'white'
                    }
                });
                await invalidateAll();
                replyContent = '';
                isReplyOpen = false;
            } else {
                toast.push('Error sending reply!', {
                    theme: {
                        '--toastBackground': 'rgba(92,0,166,0.9)',
                        '--toastColor': 'white'
                    }
                });
            }
        } else {
            toast.push('Error sending reply!', {
                theme: {
                    '--toastBackground': 'rgba(92,0,166,0.9)',
                    '--toastColor': 'white'
                }
            });
        }

        isReplyActionActive = false;
    }
    const createdAt = new Date(comment.created_at);
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    let timeAgo = $derived.by(() => {
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return `${createdAt.getDate().toString().padStart(2, '0')}/${(createdAt.getMonth() + 1).toString().padStart(2, '0')}/${createdAt.getFullYear()}`;
    });
    
    const fullDate = `${createdAt.getDate().toString().padStart(2, '0')}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getFullYear()} ${createdAt.getHours().toString().padStart(2, '0')}:${createdAt.getMinutes().toString().padStart(2, '0')}`;
</script>

<div 
    class="comment-card" 
    class:is-reply={comment.parent_comment_id}
    class:is-deleting={isDeleting}
    onmouseenter={handleMouseEnter} 
    onmouseleave={handleMouseLeave} 
    role="article"
    in:fly={{ y: 20, duration: 300, easing: quintOut }}
    out:slide={{ duration: 300, easing: cubicOut }}
>
    <!-- Decorative accent line -->
    <div class="accent-line"></div>
    
    <div class="comment-content">
        <!-- Avatar Section -->
        <div class="avatar-section">
            <div class="avatar-wrapper">
                <UserAvatar url={comment.profiles.avatar_url} username={comment.profiles.username} id={comment.user_id} {image_proxy} size="48px" />
            </div>
            {#if comment.children && comment.children.length > 0}
                <div class="thread-line"></div>
            {/if}
        </div>
        
        <!-- Main Content -->
        <div class="content-section">
            <!-- Header -->
            <div class="comment-header">
                <div class="user-info">
                    <a class="username" href={createProfilePath(comment.profiles.username, comment.user_id)}>
                        {comment.profiles.username}
                    </a>
                    <span class="timestamp" use:tooltip={{...tooltipConfig, content: fullDate}}>
                        {timeAgo}
                    </span>
                </div>
                
                <!-- Actions -->
                <div class="comment-actions" class:visible={isHovering}>
                    <button 
                        class="action-btn reply-btn" 
                        onclick={toggleReply}
                        use:tooltip={{...tooltipConfig, content: 'Reply'}}
                        aria-label="Reply to comment"
                    >
                        <i class="fas fa-reply"></i>
                    </button>
                    
                    {#if comment.is_owner}
                        <button 
                            class="action-btn delete-btn" 
                            onclick={deleteComment}
                            disabled={isDeleting}
                            use:tooltip={{...tooltipConfig, content: 'Delete'}}
                            aria-label="Delete comment"
                        >
                            {#if isDeleting}
                                <i class="fas fa-spinner fa-spin"></i>
                            {:else}
                                <i class="fas fa-trash-alt"></i>
                            {/if}
                        </button>
                    {/if}
                </div>
            </div>
            
            <!-- Comment Text -->
            <div class="comment-text">
                {comment.content}
            </div>
            
            <!-- Reply Input -->
            {#if isReplyOpen}
                <div class="reply-section" transition:slide={{ duration: 250, easing: quintOut }}>
                    <div class="reply-input-wrapper">
                        <input 
                            type="text" 
                            bind:value={replyContent} 
                            placeholder="Write a reply..."
                            class="reply-input"
                            onkeydown={(e) => e.key === 'Enter' && addReply()}
                        />
                        <div class="reply-actions">
                            <button 
                                class="reply-btn-action cancel" 
                                onclick={toggleReply}
                                aria-label="Cancel reply"
                            >
                                <i class="fas fa-times"></i>
                            </button>
                            <button 
                                class="reply-btn-action send" 
                                onclick={addReply}
                                disabled={isReplyActionActive || !replyContent.trim()}
                                aria-label="Send reply"
                            >
                                {#if isReplyActionActive}
                                    <i class="fas fa-spinner fa-spin"></i>
                                {:else}
                                    <i class="fas fa-paper-plane"></i>
                                {/if}
                            </button>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>

<!-- Nested Replies -->
{#if comment.children && comment.children.length > 0}
    <div class="replies-container">
        {#each comment.children as child (child.id)}
            <div class="reply-wrapper">
                <Comment comment={child} {supabase} {image_proxy} />
            </div>
        {/each}
    </div>
{/if}

<style>
    .comment-card {
        position: relative;
        background: linear-gradient(135deg, rgba(15, 10, 25, 0.6) 0%, rgba(30, 20, 50, 0.4) 100%);
        border: 1px solid rgba(92, 0, 166, 0.25);
        border-radius: 0.875rem;
        padding: 1rem;
        margin-bottom: 0.5rem;
        transition: all 0.25s ease;
        overflow: hidden;
    }

    .comment-card:hover {
        border-color: rgba(168, 85, 247, 0.4);
        background: linear-gradient(135deg, rgba(20, 15, 35, 0.7) 0%, rgba(40, 25, 65, 0.5) 100%);
        box-shadow: 0 4px 20px rgba(92, 0, 166, 0.15);
    }

    .comment-card.is-reply {
        margin-left: 0;
        background: linear-gradient(135deg, rgba(25, 18, 40, 0.5) 0%, rgba(40, 28, 60, 0.3) 100%);
    }

    .comment-card.is-deleting {
        opacity: 0.5;
        pointer-events: none;
    }

    .reply-wrapper {
        overflow: hidden;
    }

    .accent-line {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: linear-gradient(180deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%);
        opacity: 0;
        transition: opacity 0.25s ease;
    }

    .comment-card:hover .accent-line {
        opacity: 1;
    }

    .comment-content {
        display: flex;
        gap: 0.875rem;
    }

    /* Avatar Section */
    .avatar-section {
        position: relative;
        flex-shrink: 0;
    }

    .avatar-wrapper {
        position: relative;
        z-index: 2;
    }

    .thread-line {
        position: absolute;
        left: 50%;
        top: 56px;
        bottom: -1rem;
        width: 2px;
        background: linear-gradient(180deg, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0.1) 100%);
        transform: translateX(-50%);
    }

    /* Content Section */
    .content-section {
        flex: 1;
        min-width: 0;
    }

    .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;
    }

    .user-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .username {
        font-weight: 600;
        color: #e9d5ff;
        text-decoration: none;
        transition: color 0.2s ease;
    }

    .username:hover {
        color: #c084fc;
        text-decoration: none;
    }

    .timestamp {
        font-size: 0.8rem;
        color: rgba(233, 213, 255, 0.5);
    }

    /* Comment Text */
    .comment-text {
        color: rgba(233, 213, 255, 0.9);
        line-height: 1.6;
        word-wrap: break-word;
        font-size: 0.95rem;
    }

    /* Actions */
    .comment-actions {
        display: flex;
        gap: 0.375rem;
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .comment-actions.visible {
        opacity: 1;
    }

    .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 0.5rem;
        background: rgba(92, 0, 166, 0.2);
        color: rgba(233, 213, 255, 0.7);
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .action-btn:hover:not(:disabled) {
        transform: translateY(-2px);
    }

    .reply-btn:hover {
        background: rgba(124, 58, 237, 0.4);
        color: #c084fc;
    }

    .delete-btn:hover {
        background: rgba(239, 68, 68, 0.3);
        color: #f87171;
    }

    .action-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* Reply Section */
    .reply-section {
        margin-top: 0.875rem;
    }

    .reply-input-wrapper {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        background: rgba(92, 0, 166, 0.15);
        border: 1px solid rgba(92, 0, 166, 0.3);
        border-radius: 0.625rem;
        padding: 0.5rem;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .reply-input-wrapper:focus-within {
        border-color: rgba(168, 85, 247, 0.5);
        box-shadow: 0 0 0 3px rgba(92, 0, 166, 0.15);
    }

    .reply-input {
        flex: 1;
        background: transparent;
        border: none;
        color: #e9d5ff;
        font-size: 0.9rem;
        padding: 0.375rem 0.5rem;
        outline: none;
    }

    .reply-input::placeholder {
        color: rgba(233, 213, 255, 0.4);
    }

    .reply-actions {
        display: flex;
        gap: 0.375rem;
    }

    .reply-btn-action {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .reply-btn-action.cancel {
        background: rgba(100, 100, 100, 0.3);
        color: #9ca3af;
    }

    .reply-btn-action.cancel:hover {
        background: rgba(100, 100, 100, 0.5);
    }

    .reply-btn-action.send {
        background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
        color: white;
    }

    .reply-btn-action.send:hover:not(:disabled) {
        background: linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%);
        transform: scale(1.05);
    }

    .reply-btn-action:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    /* Replies Container */
    .replies-container {
        margin-left: 2rem;
        padding-left: 1rem;
        border-left: 2px solid rgba(92, 0, 166, 0.2);
        margin-top: 0.25rem;
    }

    /* Mobile responsive */
    @media (max-width: 576px) {
        .comment-card {
            padding: 0.75rem;
        }

        .comment-content {
            gap: 0.5rem;
        }

        .comment-header {
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .user-info {
            flex: 1;
            min-width: 0;
        }

        .username {
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            display: block;
        }

        .comment-actions {
            opacity: 1;
            flex-shrink: 0;
        }

        .action-btn {
            width: 36px;
            height: 36px;
        }

        .replies-container {
            margin-left: 0.5rem;
            padding-left: 0.625rem;
        }
    }

    /* Extra small screens */
    @media (max-width: 400px) {
        .comment-card {
            padding: 0.625rem;
        }

        .avatar-section {
            flex-shrink: 0;
        }

        .avatar-section :global(img),
        .avatar-section :global(.avatar-fallback) {
            width: 32px !important;
            height: 32px !important;
            font-size: 14px !important;
        }

        .thread-line {
            top: 40px;
        }

        .comment-content {
            gap: 0.5rem;
        }

        .comment-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }

        .user-info {
            flex-direction: row;
            align-items: center;
            gap: 0.375rem;
            flex-wrap: nowrap;
            overflow: hidden;
        }

        .username {
            font-size: 0.85rem;
        }

        .timestamp {
            font-size: 0.7rem;
            flex-shrink: 0;
        }

        .action-btn {
            width: 32px;
            height: 32px;
        }

        .replies-container {
            margin-left: 0.25rem;
            padding-left: 0.5rem;
            border-left-width: 2px;
        }

        .reply-input-wrapper {
            flex-wrap: wrap;
        }

        .reply-input {
            width: 100%;
            min-width: 100%;
        }

        .reply-actions {
            width: 100%;
            justify-content: flex-end;
            margin-top: 0.5rem;
        }
    }
</style>