<script>
    import {createEventDispatcher} from "svelte";
    import { tooltip } from "@svelte-plugins/tooltips";
    import {toast} from "@zerodevx/svelte-toast";
    import Comment from "$lib/components/pages/Comment.svelte";
    import {deserialize} from "$app/forms";
    import autoAnimate from '@formkit/auto-animate';

    export let comment;
    export let supabase;

    const dispatch = createEventDispatcher();

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

    let finalAvatarUrl = '';
    let loadedAvatar = false;
    let avatarFound = true;
    let avatarUrl = comment.profiles.avatar_url;
    let isHovering = false;
    let isReplyActionActive = false;

    async function downloadAvatar(path) {
        if (path.startsWith('blob:')) {
            finalAvatarUrl = path;
            loadedAvatar = true;
            return;
        }
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
            dispatch('delete', comment.id);
        }
    }

    function handleMouseEnter() {
        if (comment.is_owner){
            isHovering = true;
        }
    }

    function handleMouseLeave() {
        if (comment.is_owner){
            isHovering = false;
        }
    }

    async function addReply(content) {
        if (isReplyActionActive) return;
        isReplyActionActive = true;

        const toastId = toast.push('Sending reply...', {
            theme: {
                '--toastBackground': 'rgba(92,0,166,0.9)',
                '--toastColor': 'white'
            }
        });

        const data = new FormData();
        data.append('parentCommentId', comment.id);
        data.append('content', content);
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
                dispatch('reply', result.data.comment);
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

    $: if (avatarUrl) downloadAvatar(avatarUrl);
</script>

<div class="row mb-2 rounded-3 comment-element py-1" on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave}>
    <div class="col-auto {comment.parent_comment_id && comment.parent_comment_id !== null ? 'border-start border-light-subtle ms-5' : ''}">
        {#if loadedAvatar === false}
            <div class="placeholder-glow" style="height: 50px; width: 50px;">
                <div class="placeholder rounded-circle w-100 h-100"></div>
            </div>
        {:else if avatarFound === true}
            <a href="/profile/{comment.user_id}">
                <img src="{finalAvatarUrl}" alt="{comment.profiles.username}" class="img-fluid rounded-circle" style="height: 50px; width: 50px;" loading="lazy">
            </a>
        {:else}
            <img class="img-fluid rounded-circle bg-purple py-3 py-lg-5" alt="Avatar Not Found!">
        {/if}
    </div>
    <div class="col align-middle pt-1">
        <p class="mb-0"><a class="link-light text-decoration-none" href="/profile/{comment.user_id}">{comment.profiles.username}</a> <span class="text-secondary">{createdAtFormatted}</span></p>
        <span class="text-secondary-emphasis">{comment.content}</span>
    </div>
    <div class="col-2 col-md-1 my-auto">
        {#if comment.is_owner}
            <button type="button" class="btn btn-sm btn-danger btn-delete {isHovering ? 'show' : ''}" on:click={deleteComment} title="Delete Comment" use:tooltip={{...tooltipConfig}}>
                <i class="fas fa-trash"></i>
            </button>
        {/if}
    </div>
</div>
{#if comment.children}
    <div class="row">
        <div class="col-12" use:autoAnimate>
            {#each comment.children as child}
                <Comment comment="{child}" {supabase} on:delete={dispatch('delete', comment.id)} />
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

    .comment-element {
        transition: all 0.2s ease-in-out;
    }

    .comment-element:hover {
        background-color: rgba(92, 0, 166, 0.3);
    }
</style>