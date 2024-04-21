<script>
    import UserAvatar from "$lib/components/layout/UserAvatar.svelte";
    import { tooltip } from "@svelte-plugins/tooltips";
    import {toast} from "@zerodevx/svelte-toast";
    import autoAnimate from "@formkit/auto-animate";
    import {deserialize} from "$app/forms";

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

    export let profile;
    export let supabase;
    let isWarningActive = false;
    let isSendWarningActive = false;
    let isCanUploadActive = false;
    let isResetAvatarActive = false;
    let isResetCoverActive = false;
    let warningMessage = '';
    let finalCoverUrl = '';

    // Format the date by checking if it is a valid date, if not return the original value
    function formatDate(date) {
        if (date === null) {
            return date;
        }
        const finalDate = new Date(date);
        if (finalDate === "Invalid Date" || isNaN(finalDate)) {
            return date;
        }
        return finalDate.toLocaleString();
    }

    // Format the date by checking if it is a valid date, if not return the original value
    profile.created_at = formatDate(profile.created_at);
    profile.updated_at = formatDate(profile.updated_at);

    if (profile.website === null || profile.website === "") {
        profile.website = "N/A";
    }

    async function deleteNotification(notificationId) {
        if (isWarningActive) return;
        if (!notificationId || notificationId === null || notificationId === "") {
            toast.push("Error: Notification ID is missing", {
                theme: {
                    '--toastBackground': 'red',
                    '--toastBody': 'white',
                    '--toastIconFill': 'white',
                    '--toastIconStroke': 'white'
                }
            });
            return;
        }
        if (!confirm("Are you sure you want to delete this warning?")) return;

        isWarningActive = true;

        const formData = new FormData();
        formData.append("warningId", notificationId);

        const toastId = toast.push("Deleting warning...", {
            duration: 10000,
            theme: {
                '--toastBackground': 'black',
                '--toastBody': 'white',
                '--toastIconFill': 'white',
                '--toastIconStroke': 'white'
            },
        })

        const response = await fetch(`?/delete_warning`, {
            method: "POST",
            body: formData
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': 'green',
                        '--toastBody': 'white',
                        '--toastIconFill': 'white',
                        '--toastIconStroke': 'white'
                    }
                });
                profile.notifications = profile.notifications.filter(notification => notification.id !== notificationId);
            } else {
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': 'red',
                        '--toastBody': 'white',
                        '--toastIconFill': 'white',
                        '--toastIconStroke': 'white'
                    }
                });
            }
        } else {
            toast.push(result.data.body.message, {
                theme: {
                    '--toastBackground': 'red',
                    '--toastBody': 'white',
                    '--toastIconFill': 'white',
                    '--toastIconStroke': 'white'
                }
            });
        }

        isWarningActive = false;
    }

    async function sendWarningMessage(){
        if (isSendWarningActive) return;

        if (warningMessage === null || warningMessage === ''){
            toast.push('Error: Warning message is missing', {
                theme: {
                    '--toastBackground': 'red',
                    '--toastBody': 'white',
                    '--toastIconFill': 'white',
                    '--toastIconStroke': 'white'
                }
            });
            return;
        }

        isSendWarningActive = true;

        const formData = new FormData();
        formData.append('recipientId', profile.id);
        formData.append('warningMessage', warningMessage);

        const toastId = toast.push('Sending warning...', {
            duration: 10000,
            theme: {
                '--toastBackground': 'black',
                '--toastBody': 'white',
                '--toastIconFill': 'white',
                '--toastIconStroke': 'white'
            },
        })

        const response = await fetch(`?/send_warning`, {
            method: 'POST',
            body: formData
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': 'green',
                        '--toastBody': 'white',
                        '--toastIconFill': 'white',
                        '--toastIconStroke': 'white'
                    }
                });

                profile.notifications = [result.data.body.notification, ...profile.notifications];

                document.getElementById(`warningModal-${profile.id}`).style.display = 'none';
                const modalBackdrop = document.getElementsByClassName("modal-backdrop fade show");
                if (modalBackdrop.length > 0) {
                    modalBackdrop[0].remove();
                }
            } else {
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': 'red',
                        '--toastBody': 'white',
                        '--toastIconFill': 'white',
                        '--toastIconStroke': 'white'
                    }
                });
            }
        } else {
            toast.push(result.data.body.message, {
                theme: {
                    '--toastBackground': 'red',
                    '--toastBody': 'white',
                    '--toastIconFill': 'white',
                    '--toastIconStroke': 'white'
                }
            });
        }

        isSendWarningActive = false;
    }

    async function handleCopyToClipboard(){
        await navigator.clipboard.writeText(profile.id);
        toast.push('User ID copied', {
            theme: {
                '--toastBackground': 'green',
                '--toastBody': 'white',
                '--toastIconFill': 'white',
                '--toastIconStroke': 'white'
            }
        });
    }

    async function handleCanUploadToggle(){
        if (isCanUploadActive) return;

        isCanUploadActive = true;

        const formData = new FormData();
        formData.append('userId', profile.id);
        formData.append('uploadStatus', !profile.can_upload)

        const toastId = toast.push('Updating user upload status...', {
            duration: 10000,
            theme: {
                '--toastBackground': 'black',
                '--toastBody': 'white',
                '--toastIconFill': 'white',
                '--toastIconStroke': 'white'
            },
        });

        const response = await fetch(`?/toggle_upload`, {
            method: 'POST',
            body: formData
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': 'green',
                        '--toastBody': 'white',
                        '--toastIconFill': 'white',
                        '--toastIconStroke': 'white'
                    }
                });
                profile.can_upload = !profile.can_upload;
            } else {
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': 'red',
                        '--toastBody': 'white',
                        '--toastIconFill': 'white',
                        '--toastIconStroke': 'white'
                    }
                });
            }
        } else {
            toast.push(result.data.body.message, {
                theme: {
                    '--toastBackground': 'red',
                    '--toastBody': 'white',
                    '--toastIconFill': 'white',
                    '--toastIconStroke': 'white'
                }
            });
        }

        isCanUploadActive = false;
    }

    async function handleResetAvatar(){
        if (isResetAvatarActive) return;

        isResetAvatarActive = true;

        const formData = new FormData();
        formData.append('userId', profile.id);

        const toastId = toast.push('Resetting user avatar...', {
            duration: 10000,
            theme: {
                '--toastBackground': 'black',
                '--toastBody': 'white',
                '--toastIconFill': 'white',
                '--toastIconStroke': 'white'
            },
        });

        const response = await fetch(`?/reset_avatar`, {
            method: 'POST',
            body: formData
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': 'green',
                        '--toastBody': 'white',
                        '--toastIconFill': 'white',
                        '--toastIconStroke': 'white'
                    }
                });

                profile.avatar_url = null;

                document.getElementById(`resetAvatarModal-${profile.id}`).style.display = 'none';
                const modalBackdrop = document.getElementsByClassName("modal-backdrop fade show");
                if (modalBackdrop.length > 0) {
                    modalBackdrop[0].remove();
                }
            } else {
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': 'red',
                        '--toastBody': 'white',
                        '--toastIconFill': 'white',
                        '--toastIconStroke': 'white'
                    }
                });
            }
        } else {
            toast.push(result.data.body.message, {
                theme: {
                    '--toastBackground': 'red',
                    '--toastBody': 'white',
                    '--toastIconFill': 'white',
                    '--toastIconStroke': 'white'
                }
            });
        }

        isResetAvatarActive = false;
    }

    async function handleResetCover(){
        if (isResetCoverActive) return;

        isResetCoverActive = true;

        const formData = new FormData();
        formData.append('userId', profile.id);

        const toastId = toast.push('Resetting user cover...', {
            duration: 10000,
            theme: {
                '--toastBackground': 'black',
                '--toastBody': 'white',
                '--toastIconFill': 'white',
                '--toastIconStroke': 'white'
            },
        });

        const response = await fetch(`?/reset_cover`, {
            method: 'POST',
            body: formData
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        if (result.type === 'success'){
            if (result.data.status === 200){
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': 'green',
                        '--toastBody': 'white',
                        '--toastIconFill': 'white',
                        '--toastIconStroke': 'white'
                    }
                });

                profile.cover_url = null;
                finalCoverUrl = '';

                document.getElementById(`resetCoverModal-${profile.id}`).style.display = 'none';
                const modalBackdrop = document.getElementsByClassName("modal-backdrop fade show");
                if (modalBackdrop.length > 0) {
                    modalBackdrop[0].remove();
                }
            } else {
                toast.push(result.data.body.message, {
                    theme: {
                        '--toastBackground': 'red',
                        '--toastBody': 'white',
                        '--toastIconFill': 'white',
                        '--toastIconStroke': 'white'
                    }
                });
            }
        } else {
            toast.push(result.data.body.message, {
                theme: {
                    '--toastBackground': 'red',
                    '--toastBody': 'white',
                    '--toastIconFill': 'white',
                    '--toastIconStroke': 'white'
                }
            });
        }

        isResetCoverActive = false;
    }

    async function downloadCover(path) {
        if (finalCoverUrl !== '') return;
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);

            if (error) {
                throw error;
            }

            finalCoverUrl = URL.createObjectURL(data);
        } catch (error) {
            if (error instanceof Error) {
                console.log('Error downloading image: ', error.message);
                finalCoverUrl = '';
            }
        }
    }

    $: if (profile && profile.cover_url && finalCoverUrl === '') {
        downloadCover(profile.cover_url);
    }

</script>

<div class="container border {profile.can_upload ? 'border-magenta bg-black bg-opacity-25' : 'border-danger bg-danger bg-opacity-10'} rounded-4 mb-4 p-4 shadow-sm">
    <div class="row">
        <div class="col-12">
            <div class="row justify-content-center">
                <div class="col-12 col-md-auto my-auto mb-3 mb-md-auto">
                    <UserAvatar url={profile.avatar_url} username={profile.username} id={profile.id} {supabase} size="100px" />
                </div>
                <div class="col-12 col-md-auto my-auto">
                    <h1 class="h1 text-center">{profile.username}</h1>
                </div>
                <div class="col-12 text-center mt-2">
                    <p class="fs-6 mb-2">ID: {profile.id}
                        <span class="ms-2">
                            <button class="btn btn-sm btn-outline-secondary" on:click={handleCopyToClipboard}>
                                <i class="fas fa-copy"></i> Copy ID
                            </button>
                        </span>
                    </p>
                </div>
            </div>
            <div class="accordion" id="profileAccordion-{profile.id}">
                <div class="accordion-item">
                    <h2 class="accordion-header" id="headingOne-{profile.id}">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne-{profile.id}" aria-expanded="true" aria-controls="collapseOne-{profile.id}">
                            User Info
                        </button>
                    </h2>
                    <div id="collapseOne-{profile.id}" class="accordion-collapse collapse" aria-labelledby="headingOne-{profile.id}" data-bs-parent="#profileAccordion-{profile.id}">
                        <div class="accordion-body">
                            <div class="row">
                                <div class="col-12 col-md-6 mb-3 mb-md-auto my-auto">
                                    <UserAvatar url={profile.avatar_url} username={profile.username} id={profile.id} {supabase} size="200px" />
                                </div>
                                <div class="col-12 col-md-6 my-auto">
                                    <p>Full Name: {profile.full_name}</p>
                                    <p>Email: {profile.email}</p>
                                    <p>Website: {profile.website}</p>
                                    <p>Can Upload: <span class="{profile.can_upload ? 'text-success' : 'text-danger'}">{profile.can_upload}</span></p>
                                    <p>Created At: {profile.created_at}</p>
                                    <p>Updated At: {profile.updated_at}</p>
                                </div>
                                <div class="col-12 border-top border-primary pt-3">
                                    <p class="h5 text-center">Profile cover: </p>
                                    {#if profile.cover_url && finalCoverUrl}
                                        <a href="{finalCoverUrl}" target="_blank">
                                            <img src={finalCoverUrl} alt="Profile cover" class="img-fluid rounded-4" on:load={() => downloadCover(profile.cover_url)} use:tooltip={{...tooltipConfig}} title="View Cover" />
                                        </a>
                                    {:else}
                                        <p class="text-center text-warning">No cover image</p>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {#if profile.notifications.length > 0}
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="headingNotifications-{profile.id}">
                            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseNotifications-{profile.id}" aria-expanded="true" aria-controls="collapseNotifications-{profile.id}">
                                Warnings
                            </button>
                        </h2>
                        <div id="collapseNotifications-{profile.id}" class="accordion-collapse collapse" aria-labelledby="headingNotifications-{profile.id}" data-bs-parent="#profileAccordion-{profile.id}">
                            <div class="accordion-body" use:autoAnimate>
                                {#each profile.notifications as notification (notification.id)}
                                    <div class="alert alert-warning d-flex justify-content-between align-items-center">
                                        <div class="col">
                                            <p class="mb-0">{notification.content}</p>
                                            <small class="text-muted">{formatDate(notification.created_at)}</small>
                                        </div>
                                        <button class="btn btn-outline-danger btn-sm" on:click={() => deleteNotification(notification.id)}>
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
            <div class="row justify-content-center text-center mt-3">
                <div class="col-12 col-md-6 mb-2 mb-md-auto">
                    <button type="button" class="btn btn-sm btn-warning w-100" data-bs-toggle="modal" data-bs-target="#warningModal-{profile.id}">
                        <i class="fas fa-exclamation-triangle"></i> Send Warning
                    </button>
                </div>
                <div class="col-12 col-md-6">
                    <button type="button" class="btn btn-sm w-100 {profile.can_upload ? 'btn-danger' : 'btn-success'}" on:click={handleCanUploadToggle}>
                        <i class="fas fa-ban"></i> {profile.can_upload ? 'Disable Upload' : 'Enable Upload'}
                    </button>
                </div>
            </div>
            <div class="row mt-2">
                <div class="col-12">
                    <div class="dropdown">
                        <button class="btn btn-secondary btn-sm dropdown-toggle w-100" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                            Reset Actions
                        </button>
                        <ul class="dropdown-menu w-100" aria-labelledby="dropdownMenuButton">
                            {#if profile.avatar_url}
                                <li><a href="#" class="dropdown-item" data-bs-toggle="modal" data-bs-target="#resetAvatarModal-{profile.id}"><i class="fas fa-refresh text-warning"></i> <i class="fas fa-user text-primary-emphasis"></i> Reset Avatar</a></li>
                            {/if}
                            {#if profile.cover_url}
                                <li><a href="#" class="dropdown-item" data-bs-toggle="modal" data-bs-target="#resetCoverModal-{profile.id}"><i class="fas fa-refresh text-warning"></i> <i class="fas fa-image text-secondary-emphasis"></i> Reset Cover</a></li>
                            {/if}
                            {#if !profile.avatar_url && !profile.cover_url}
                                <li><a href="#" class="dropdown-item disabled"><i class="fas fa-exclamation-triangle text-danger"></i> No actions available, the user doesn't have neither avatar or cover</a></li>
                            {/if}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="warningModal-{profile.id}" tabindex="-1" aria-labelledby="warningModalLabel-{profile.id}" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="warningModalLabel-{profile.id}">Send Warning</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="warningForm">
                        <div class="mb-3">
                            <label for="warningMessage" class="form-label">Warning Message</label>
                            <textarea class="form-control" id="warningMessage" placeholder="Enter warning message here..." rows="3" bind:value={warningMessage}></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-warning" on:click={sendWarningMessage}>Send Warning</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="resetAvatarModal-{profile.id}" tabindex="-1" aria-labelledby="resetAvatarModalLabel-{profile.id}" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="resetAvatarModalLabel-{profile.id}">Confirm Reset Avatar</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" use:autoAnimate>
                    <p>Are you sure you want to reset the avatar of {profile.username}?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-warning" on:click={handleResetAvatar}>Reset Avatar</button>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="resetCoverModal-{profile.id}" tabindex="-1" aria-labelledby="resetCoverModalLabel-{profile.id}" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="resetCoverModalLabel-{profile.id}">Confirm Reset Cover</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" use:autoAnimate>
                    <p>Are you sure you want to reset the cover of {profile.username}?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-warning" on:click={handleResetCover}>Reset Cover</button>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .border-magenta {
        border-color: #ef43cd !important;
    }
</style>