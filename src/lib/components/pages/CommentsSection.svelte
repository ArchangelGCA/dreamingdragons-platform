<script>
    import Comment from "$lib/components/pages/Comment.svelte";
    import {deserialize} from "$app/forms";
    import {toast} from "$lib/components/svelte-toast";
    import {invalidateAll} from "$app/navigation";
    import { fade, slide } from 'svelte/transition';
    import { flip } from 'svelte/animate';
    import { cubicOut } from 'svelte/easing';

    /** @type {{comments: any, supabase: any, bookId?: any, chapterId?: any, image_proxy?: any}} */
    let {
        comments = $bindable(),
        supabase,
        bookId = null,
        chapterId = null,
        image_proxy = null
    } = $props();

    let commentText = $state('');
    let isTextAreaFocused = $state(false);
    let commentActionActive = $state(false);
    let avatarsLoaded = true;

    let commentsCount = $derived(comments.length);
    let charCount = $derived(commentText.length);
    let maxChars = 1000;

    async function handleCommentSubmit() {
        if (commentActionActive) return;

        if (commentText.trim() === '') return;

        commentActionActive = true;

        const data = new FormData();
        if (chapterId && chapterId !== null && chapterId !== ''){
            data.append('chapterId', chapterId);
        } else {
            data.append('bookId', bookId);
        }
        data.append('content', commentText);

        const response = await fetch('?/add_comment', {
            method: 'POST',
            body: data
        });

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                commentText = '';
                toast.push('Comment added! 📝', {
                    theme: {
                        '--toastBackground': '#004a5a',
                        '--toastColor': '#f0f8ff',
                    }
                });
                comments = [result.data.body.comment, ...comments];
                await invalidateAll();
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

    function resetComment() {
        commentText = '';
        handleBlur();
    }

    function handleBlur() {
        if (commentText === '') {
            isTextAreaFocused = false;
        }
    }

    function handleFocus() {
        isTextAreaFocused = true;
    }

</script>

<div class="comments-section">
    <!-- Header Section -->
    <div class="comments-header">
        <div class="d-flex align-items-center gap-2">
            <i class="fas fa-comments comments-icon"></i>
            <h3 class="comments-title mb-0">Discussion</h3>
        </div>
        <div class="comments-count-badge">
            <span class="count-number">{commentsCount}</span>
            <span class="count-label">{commentsCount === 1 ? 'comment' : 'comments'}</span>
        </div>
    </div>

    <!-- Comment Input Section -->
    <div class="comment-input-wrapper" class:focused={isTextAreaFocused}>
        <div class="input-glow"></div>
        <div class="input-container">
            <div class="textarea-wrapper">
                <textarea 
                    class="comment-textarea" 
                    id="commentInput" 
                    placeholder="Share your thoughts..." 
                    maxlength={maxChars} 
                    onfocus={handleFocus} 
                    onblur={handleBlur} 
                    bind:value={commentText}
                ></textarea>
                {#if isTextAreaFocused || commentText}
                    <div class="char-counter" class:warning={charCount > maxChars * 0.9} transition:fade={{ duration: 200 }}>
                        {charCount}/{maxChars}
                    </div>
                {/if}
            </div>
            
            {#if isTextAreaFocused || commentText}
                <div class="comment-actions" transition:slide={{ duration: 250, easing: cubicOut }}>
                    <button class="btn-action btn-cancel" type="reset" onclick={resetComment}>
                        <i class="fas fa-times"></i>
                        <span>Cancel</span>
                    </button>
                    <button 
                        class="btn-action btn-submit" 
                        type="submit" 
                        onclick={handleCommentSubmit}
                        disabled={commentActionActive || !commentText.trim()}
                    >
                        {#if commentActionActive}
                            <i class="fas fa-spinner fa-spin"></i>
                            <span>Posting...</span>
                        {:else}
                            <i class="fas fa-paper-plane"></i>
                            <span>Post Comment</span>
                        {/if}
                    </button>
                </div>
            {/if}
        </div>
    </div>

    <!-- Comments List -->
    <div class="comments-list-container">
        {#if commentsCount === 0}
            <div class="empty-state" transition:fade>
                <div class="empty-icon">
                    <i class="far fa-comment-dots"></i>
                </div>
                <p class="empty-title">No comments yet</p>
                <p class="empty-subtitle">Be the first to share your thoughts!</p>
            </div>
        {:else}
            <div class="comments-list">
                {#if avatarsLoaded}
                    {#each comments as comment (comment.id)}
                        <div animate:flip={{ duration: 300, easing: cubicOut }}>
                            <Comment {comment} {supabase} {image_proxy}/>
                        </div>
                    {/each}
                {:else}
                    <div class="skeleton-comment">
                        <div class="skeleton-avatar"></div>
                        <div class="skeleton-content">
                            <div class="skeleton-line short"></div>
                            <div class="skeleton-line"></div>
                            <div class="skeleton-line medium"></div>
                        </div>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    .comments-section {
        position: relative;
    }

    /* Header Styles */
    .comments-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
        margin-bottom: 1.5rem;
        border-bottom: 2px solid #1c3350;
    }

    .comments-icon {
        font-size: 1.5rem;
        color: #20dde0;
    }

    .comments-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #f0f8ff;
    }

    .comments-count-badge {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: rgba(0, 165, 148, 0.15);
        border: 1px solid rgba(32, 221, 224, 0.3);
        border-radius: 2rem;
        backdrop-filter: blur(8px);
    }

    .count-number {
        font-weight: 700;
        font-size: 1.1rem;
        color: #f0f8ff;
    }

    .count-label {
        font-size: 0.85rem;
        color: #8ba3b0;
    }

    /* Comment Input Styles */
    .comment-input-wrapper {
        position: relative;
        margin-bottom: 2rem;
        border-radius: 1rem;
        transition: all 0.3s ease;
    }

    .input-glow {
        position: absolute;
        inset: -2px;
        border-radius: 1rem;
        background: rgba(0, 165, 148, 0.25);
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: -1;
    }

    .comment-input-wrapper.focused .input-glow {
        opacity: 1;
    }

    .input-container {
        background: #0a141f;
        border: 1px solid #1c3350;
        border-radius: 1rem;
        padding: 1rem;
        backdrop-filter: blur(10px);
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }

    .comment-input-wrapper.focused .input-container {
        border-color: rgba(32, 221, 224, 0.5);
        box-shadow: 0 0 20px rgba(0, 165, 148, 0.2);
    }

    .textarea-wrapper {
        position: relative;
    }

    .comment-textarea {
        width: 100%;
        min-height: 100px;
        padding: 1rem;
        background: #04090f;
        border: 1px solid #1c3350;
        border-radius: 0.75rem;
        color: #f0f8ff;
        font-size: 1rem;
        line-height: 1.6;
        resize: vertical;
        transition: all 0.3s ease;
    }

    .comment-textarea::placeholder {
        color: #8ba3b0;
    }

    .comment-textarea:focus {
        outline: none;
        background: rgba(0, 165, 148, 0.15);
        border-color: rgba(32, 221, 224, 0.5);
    }

    .char-counter {
        position: absolute;
        bottom: 0.5rem;
        right: 0.75rem;
        font-size: 0.75rem;
        color: #8ba3b0;
        transition: color 0.2s ease;
    }

    .char-counter.warning {
        color: #ffc94d;
    }

    /* Action Buttons */
    .comment-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1rem;
    }

    .btn-action {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1.25rem;
        border: none;
        border-radius: 0.5rem;
        font-weight: 500;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .btn-cancel {
        background: rgba(100, 100, 100, 0.3);
        color: #d1d5db;
        border: 1px solid rgba(100, 100, 100, 0.4);
    }

    .btn-cancel:hover {
        background: rgba(100, 100, 100, 0.5);
        transform: translateY(-1px);
    }

    .btn-submit {
        background: #004a5a;
        color: #f0f8ff;
        border: 1px solid rgba(32, 221, 224, 0.3);
    }

    .btn-submit:hover:not(:disabled) {
        background: #00a594;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 165, 148, 0.3);
    }

    .btn-submit:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    /* Comments List */
    .comments-list-container {
        margin-top: 1.5rem;
    }

    .comments-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    /* Empty State */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 3rem 1rem;
        text-align: center;
    }

    .empty-icon {
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 165, 148, 0.12);
        border-radius: 50%;
        margin-bottom: 1.5rem;
        border: 2px dashed rgba(32, 221, 224, 0.3);
    }

    .empty-icon i {
        font-size: 2rem;
        color: #20dde0;
    }

    .empty-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #f0f8ff;
        margin-bottom: 0.5rem;
    }

    .empty-subtitle {
        color: #8ba3b0;
        font-size: 0.95rem;
    }

    /* Skeleton Loading - flat teal tints, opacity pulse only */
    .skeleton-comment {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background: rgba(0, 165, 148, 0.1);
        border-radius: 0.75rem;
    }

    .skeleton-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: rgba(0, 165, 148, 0.15);
        animation: skeleton-opacity 1.5s ease-in-out infinite;
    }

    .skeleton-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .skeleton-line {
        height: 12px;
        background: rgba(0, 165, 148, 0.15);
        border-radius: 4px;
        animation: skeleton-opacity 1.5s ease-in-out infinite;
    }

    .skeleton-line.short {
        width: 30%;
    }

    .skeleton-line.medium {
        width: 60%;
    }

    /* Animations */
    @keyframes skeleton-opacity {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.6;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .skeleton-avatar,
        .skeleton-line {
            animation: none;
        }
    }

    /* Responsive */
    @media (max-width: 576px) {
        .comments-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }

        .comment-actions {
            flex-direction: column;
        }

        .btn-action {
            justify-content: center;
        }
    }
</style>