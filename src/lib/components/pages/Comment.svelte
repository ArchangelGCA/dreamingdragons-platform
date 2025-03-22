<script>
    import { tooltip } from "@svelte-plugins/tooltips";
    import {toast} from "$lib/components/svelte-toast";
    import Comment from "$lib/components/pages/Comment.svelte";
    import {deserialize} from "$app/forms";
    import autoAnimate from '@formkit/auto-animate';
    import UserAvatar from "$lib/components/layout/UserAvatar.svelte";
    import {invalidateAll} from "$app/navigation";

    /** @type {{comment: any, supabase: any, image_proxy: any}} */
    let { comment, supabase, image_proxy } = $props();

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
    let replyContent = $state('');
    let isHovering = $state(false);
    let isReplyVisible = $state(false);
    let isReplyActionActive = false;

    async function deleteComment() {
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
        if (comment.is_owner){
            isHovering = true;
        }
        toggleReplyVisibility();
    }

    function handleMouseLeave() {
        if (comment.is_owner){
            isHovering = false;
        }
        toggleReplyVisibility();
    }

    function toggleReplyVisibility() {
        isReplyVisible = !isReplyVisible;
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
    const createdAtFormatted = `${(createdAt.getDate()).toString().padStart(2, '0')}-${(createdAt.getMonth() + 1).toString().padStart(2, '0')}-${createdAt.getFullYear()}`;
</script>

<div class="row mb-2 rounded-3 comment-element py-1" onmouseenter={handleMouseEnter} onmouseleave={handleMouseLeave} role="none">
    <div class="col-auto">
        <UserAvatar url={comment.profiles.avatar_url} username={comment.profiles.username} id={comment.user_id} {image_proxy} size="50px" />
    </div>
    <div class="col align-middle pt-1">
        <p class="mb-0"><a class="link-light text-decoration-none" href="/profile/{comment.user_id}">{comment.profiles.username}</a> <span class="text-secondary">{createdAtFormatted}</span></p>
        <span class="text-secondary-emphasis">{comment.content}</span>
    </div>
    {#if comment.is_owner}
        <div class="col-2 col-md-auto pe-md-0 my-auto">
            <button type="button" class="btn btn-sm btn-danger btn-delete {isHovering ? 'show' : ''}" onclick={deleteComment} title="Delete Comment" use:tooltip={{...tooltipConfig}} aria-label="Delete Comment">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    {/if}
    {#if isReplyVisible}
        <div class="col-12 col-md-auto my-2 my-md-auto">
            <button class="btn btn-sm btn-reply w-100" type="button" data-bs-toggle="collapse" data-bs-target="#commentReplyInput-{comment.id}" aria-expanded="false" aria-controls="commentReplyInput-{comment.id}"  title="Reply to Comment" use:tooltip={{...tooltipConfig}} aria-label="Reply to Comment">
                <i class="fas fa-reply"></i>
            </button>
        </div>
    {/if}
    <div class="collapse" id="commentReplyInput-{comment.id}">
        <div class="col-12 my-2 mt-1 mt-md-3">
            <div class="input-group">
                <input type="text" bind:value={replyContent} placeholder="Reply to comment..." class="form-control form-control-reply">
                <button type="button" class="btn btn-sm btn-danger" data-bs-toggle="collapse" data-bs-target="#commentReplyInput-{comment.id}" aria-expanded="false" aria-controls="commentReplyInput-{comment.id}" aria-label="Cancel Reply" use:tooltip={{...tooltipConfig}} title="Cancel">
                    <i class="fas fa-times px-2"></i>
                </button>
                <button type="button" class="btn btn-sm btn-reply" data-bs-toggle="collapse" data-bs-target="#commentReplyInput-{comment.id}" aria-expanded="false" aria-controls="commentReplyInput-{comment.id}" onclick={addReply} aria-label="Send Reply" use:tooltip={{...tooltipConfig}} title="Submit">
                    <i class="fas fa-paper-plane px-2"></i>
                </button>
            </div>
        </div>
    </div>
</div>
{#if comment.children}
    <div class="row border-start border-light-subtle ms-5">
        <div class="col-12" use:autoAnimate>
            {#each comment.children as child (child.id)}
                <Comment comment={child} {supabase} {image_proxy} />
            {/each}
        </div>
    </div>
{/if}

<style>
    .btn-delete {
        transition: opacity 0.2s ease-in-out;
        visibility: hidden;
        opacity: 0;
    }

    .btn-delete.show {
        visibility: visible;
        opacity: 1;
    }

    .btn-reply {
        background-color: rgba(92, 0, 166, 0.9);
        border-color: rgba(92, 0, 166, 0.9);
    }

    .btn-reply:hover {
        background-color: rgba(92, 0, 166, 1);
        border-color: rgba(92, 0, 166, 1);
    }

    .form-control-reply {
        background-color: rgba(92, 0, 166, 0.3);
        border-color: rgba(92, 0, 166, 0.3);
        color: white;
    }

    .form-control-reply:focus {
        background-color: rgba(92, 0, 166, 0.1);
        border-color: rgb(92, 0, 166);
        box-shadow: 0 0 0 0.25rem rgba(92, 0, 166, 0.2);
        color: white;
    }

    .comment-element {
        transition: all 0.2s ease-in-out;
    }

    .comment-element:hover {
        background-color: rgba(92, 0, 166, 0.3);
    }

    .text-secondary-emphasis {
        word-wrap: break-word;
    }
</style>