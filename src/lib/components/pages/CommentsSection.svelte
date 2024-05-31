<script>
    import Comment from "$lib/components/pages/Comment.svelte";
    import autoAnimate from '@formkit/auto-animate';
    import {deserialize} from "$app/forms";
    import {toast} from "@zerodevx/svelte-toast";
    import {createEventDispatcher, onMount} from "svelte";

    export let comments;
    export let supabase;
    export let bookId = null;
    export let chapterId = null;
    export let image_proxy = null;

    const dispatch = createEventDispatcher();

    let commentText = '';
    let isTextAreaFocused = false;
    let commentActionActive = false;
    let avatarsLoaded = true;

    $: commentsCount = comments.length;

    async function handleInvalidate() {
        dispatch('invalidate');
    }

    async function handleCommentSubmit() {
        if (commentActionActive) return;

        if (commentText === '') return;

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
                    <Comment {comment} {supabase} on:invalidate={handleInvalidate} {image_proxy}/>
                {/each}
            {:else}
                <div class="row justify-content-center placeholder-glow mb-2">
                    <div class="col-12 placeholder py-4 rounded-3"></div>
                </div>
            {/if}
        </div>
    {/if}
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

    .bg-purple-opacity-25 {
        background-color: rgba(92, 0, 166, 0.25);
    }

    .bg-purple-opacity-10 {
        background-color: rgba(92, 0, 166, 0.1);
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