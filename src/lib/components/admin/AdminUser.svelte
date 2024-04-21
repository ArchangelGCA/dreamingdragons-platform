<script>
    import UserAvatar from "$lib/components/layout/UserAvatar.svelte";
    import {toast} from "@zerodevx/svelte-toast";
    import autoAnimate from "@formkit/auto-animate";
    import {deserialize} from "$app/forms";

    export let profile;
    export let supabase;
    let isWarningActive = false;
    let isSendWarningActive = false;
    let isCanUploadActive = false;
    let warningMessage = "";

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

    async function sendWarning(){
        if (isSendWarningActive) return;

        if (warningMessage === null || warningMessage === ""){
            toast.push("Error: Warning message is missing", {
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
        formData.append("recipientId", profile.id);
        formData.append("warningMessage", warningMessage);

        const toastId = toast.push("Sending warning...", {
            duration: 10000,
            theme: {
                '--toastBackground': 'black',
                '--toastBody': 'white',
                '--toastIconFill': 'white',
                '--toastIconStroke': 'white'
            },
        })

        const response = await fetch(`?/send_warning`, {
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
                profile.notifications = [result.data.body.notification, ...profile.notifications, ];
                warningMessage = "";
                document.getElementById("warningMessage").value = "";
                document.getElementById("warningModal-" + profile.id).click();
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
        toast.push("User ID copied", {
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
        formData.append("userId", profile.id);
        formData.append("uploadStatus", !profile.can_upload)

        const toastId = toast.push("Updating user upload status...", {
            duration: 10000,
            theme: {
                '--toastBackground': 'black',
                '--toastBody': 'white',
                '--toastIconFill': 'white',
                '--toastIconStroke': 'white'
            },
        });

        const response = await fetch(`?/toggle_upload`, {
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
                <div class="col-12 col-md-6">
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
                    <button type="button" class="btn btn-warning" on:click={sendWarning}>Send Warning</button>
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