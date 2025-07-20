<script>
    import {
        PUBLIC_COVER_MAX_WIDTH,
        PUBLIC_COVER_MAX_HEIGHT,
        PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES,
        PUBLIC_CONVERTER_URL
    } from "$env/static/public";
    import {toast} from "$lib/components/svelte-toast";
    import {deserialize} from "$app/forms";
    import { tooltip } from "@svelte-plugins/tooltips";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";
    import autoAnimate from '@formkit/auto-animate';
    import {invalidateAll} from "$app/navigation";
    import Editor from "@tinymce/tinymce-svelte";
    import {conf} from "$lib/utils/gcatinymce.js"

    /** @type {{data: any}} */
    let { data } = $props();

    let { book, can_upload, image_proxy } = $state(data);
    $effect(() => {
        ({book, can_upload, image_proxy} = data);
    });

    const maxFileSizeMB = PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES / 1024 / 1024;
    
    // Step-by-step UI state
    let currentStep = $state(1);
    let totalSteps = $state(3);
    
    // Form state
    let formData = $state({
        title: '',
        description: '',
        selectedImageFile: null
    });
    
    // Image handling
    let previewUrl = $state(null);
    let fileName = $state(null);
    let isDragging = $state(false);
    let isCompressing = $state(false);
    let isTooBig = $state(false);
    let compressedMessage = $state('');
    
    // Tag handling
    let tags = $state([]);
    let inputTag = $state('');
    let suggestions = $state([]);
    let selectedSuggestionIndex = $state(-1);
    let tagSuggestionTimer;
    
    // Upload state
    let editActive = $state(false);
    let uploadProgress = $state(0);
    let isUploading = $state(false);

    // Navigation functions for stepped UI
    function goToStep(step) {
        if (step >= 1 && step <= totalSteps) {
            currentStep = step;
        }
    }

    function nextStep() {
        if (currentStep < totalSteps) {
            currentStep++;
        }
    }

    function prevStep() {
        if (currentStep > 1) {
            currentStep--;
        }
    }

    // Validation functions
    function validateStep1() {
        return formData.title.trim().length > 0;
    }

    function validateStep2() {
        return formData.description && formData.description.trim().length > 0;
    }

    function validateStep3() {
        return true; // Tags are optional
    }

    // Initialize form data from book
    $effect(() => {
        if (book) {
            formData.title = book.title || '';
            formData.description = book.description || '';
            tags = [...(book.tags || [])];
        }
    });

    async function handleEdit(event) {
        event.preventDefault();

        if (editActive) return;

        if (!can_upload) {
            toast.push('You don\'t have permission to edit content!', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
            return;
        }

        editActive = true;
        isUploading = true;
        uploadProgress = 0;

        const formDataToSend = new FormData();
        formDataToSend.append('bookId', book.id);
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('tags', tags.join(','));
        
        if (formData.selectedImageFile) {
            formDataToSend.append('image', formData.selectedImageFile);
        }

        const toastId = toast.push('Updating tale...', {
            duration: 600000,
            theme: {
                '--toastBackground': '#ffcc00',
                '--toastColor': '#000'
            }
        });

        try {
            const response = await fetch('?/editbook', {
                method: 'POST',
                body: formDataToSend,
            });

            toast.pop(toastId);

            const result = deserialize(await response.text());
            
            if (result.type === 'success') {
                if (result.data.status === 200) {
                    const bookUrl = '/content/' + book.id;

                    toast.push(result.data.body.message + '. View it <a class="link-light" href="' + bookUrl + '" target="_blank">here</a>.', {
                        theme: {
                            '--toastBackground': '#4caf50',
                            '--toastColor': '#fff'
                        }
                    });
                    
                    await invalidateAll();
                    
                    // Reset to first step after successful edit
                    currentStep = 1;
                } else {
                    toast.push('Error: ' + result.data.body.message, {
                        theme: {
                            '--toastBackground': '#ff4d4d',
                            '--toastColor': '#fff'
                        }
                    });
                }
            } else {
                toast.push('Error: Update failed', {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
            }
        } catch (error) {
            toast.pop(toastId);
            toast.push('Error: Network error', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        } finally {
            editActive = false;
            isUploading = false;
            uploadProgress = 0;
        }
    }

    // Tag handling functions
    async function addTag(e) {
        if (e.type === 'click') {
            e.preventDefault();
            const tag = e.target.value.trim();
            if (tag) {
                if (tags.includes(tag)) {
                    toast.push('Tag already added', {
                        theme: {
                            '--toastBackground': '#ffcc00',
                            '--toastColor': '#000'
                        }
                    });
                    return;
                }
                tags = [...tags, tag];
                e.target.value = '';
                suggestions = [];
                inputTag = '';
                selectedSuggestionIndex = -1;
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (suggestions.length > 0) {
                selectedSuggestionIndex = (selectedSuggestionIndex + 1) % suggestions.length;
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (suggestions.length > 0) {
                selectedSuggestionIndex = selectedSuggestionIndex <= 0 ? suggestions.length - 1 : selectedSuggestionIndex - 1;
            }
        } else if (e.key === 'Tab' && suggestions.length > 0) {
            e.preventDefault();
            const suggestionToAdd = selectedSuggestionIndex >= 0 ? suggestions[selectedSuggestionIndex] : suggestions[0];
            if (tags.includes(suggestionToAdd)) {
                toast.push('Tag already added', {
                    theme: {
                        '--toastBackground': '#ffcc00',
                        '--toastColor': '#000'
                    }
                });
                return;
            }
            tags = [...tags, suggestionToAdd];
            e.target.value = '';
            suggestions = [];
            selectedSuggestionIndex = -1;
        } else if (e.key === ' ' || e.key === ',' || e.key === 'Enter') {
            e.preventDefault();
            let tag = e.target.value.trim();

            // If a suggestion is selected, use it
            if (e.key === 'Enter' && selectedSuggestionIndex >= 0 && suggestions.length > 0) {
                tag = suggestions[selectedSuggestionIndex];
            }

            if (tag) {
                if (tags.includes(tag)) {
                    toast.push('Tag already added', {
                        theme: {
                            '--toastBackground': '#ffcc00',
                            '--toastColor': '#000'
                        }
                    });
                    e.target.value = '';
                    return;
                }
                tags = [...tags, tag];
                e.target.value = '';
                suggestions = [];
                selectedSuggestionIndex = -1;
            }
        } else {
            // Debounced tag suggestions
            clearTimeout(tagSuggestionTimer);
            tagSuggestionTimer = setTimeout(async () => {
                const tag = e.target.value.trim();
                if (tag && tag.length > 1) {
                    await fetchTags(tag);
                } else {
                    suggestions = [];
                    selectedSuggestionIndex = -1;
                }
            }, 300);
        }
    }

    async function fetchTags(tag) {
        if (!tag) {
            suggestions = [];
        } else {
            const formData = new FormData();
            formData.append('tag', tag);

            try {
                const response = await fetch('?/tagsuggestions', {
                    method: 'POST',
                    body: formData,
                });

                const result = deserialize(await response.text());
                if (result.type === 'success') {
                    if (result.data.status === 200) {
                        suggestions = result.data.body.map(tag => tag.name).filter(suggestion => !tags.includes(suggestion));
                        selectedSuggestionIndex = -1;
                    } else {
                        toast.push('Error: ' + result.data.body.message, {
                            theme: {
                                '--toastBackground': '#ff4d4d',
                                '--toastColor': '#fff'
                            }
                        });
                    }
                } else {
                    toast.push('Error: Tag suggestions failed', {
                        theme: {
                            '--toastBackground': '#ff4d4d',
                            '--toastColor': '#fff'
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching tags:', error);
            }
        }
    }

    function removeTag(e) {
        e.preventDefault();
        // Find the button element that has the value attribute
        const button = e.target.closest('button');
        if (!button || !button.value) return;

        const tag = button.value.trim();
        tags = tags.filter(t => t !== tag);
        suggestions = [];
        inputTag = '';
    }

    // Image handling functions
    async function getToken() {
        const response = await fetch('/upload/token');
        if (!response.ok) {
            console.error('Failed to get token');
            return null;
        }
        const data = await response.json();
        return data.token;
    }

    // Function ran on "compress" button call
    async function compressImage() {
        if (!isTooBig) {
            toast.push('Image is not too big', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
            return;
        }
        if (isCompressing) {
            toast.push('Already compressing image, please wait...', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
            return;
        }

        isCompressing = true;

        // Get token
        const token = await getToken();
        if (!token) {
            toast.push('Failed to get token', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
            isCompressing = false;
            return;
        }

        // Check if we have a selected image file
        if (!formData.selectedImageFile) {
            toast.push('Error: No image selected', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
            isCompressing = false;
            return;
        }
        const file = formData.selectedImageFile;
        const oldSize = file.size;

        // Create form data and append the image file
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        uploadFormData.append('token', token);
        uploadFormData.enctype = 'multipart/form-data';
        uploadFormData.mode = 'no-cors';

        // Show loading toast
        const toastId = toast.push('Compressing image...', {
            duration: 600000,
            theme: {
                '--toastBackground': '#ffcc00',
                '--toastColor': '#000'
            }
        });

        // Send POST request to PUBLIC_CONVERTER_URL/image with form data
        try {
            const response = await fetch(PUBLIC_CONVERTER_URL + '/image', {
                method: 'POST',
                body: uploadFormData,
            });

            // Remove loading toast
            toast.pop(toastId);

            if (!response.ok) {
                let errorMessage = 'Failed to compress image';
                try {
                    const error = await response.json();
                    errorMessage += ': ' + (error.message || error.error || 'Unknown error');
                } catch (e) {
                    errorMessage += ': Server error';
                }
                toast.push(errorMessage, {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
                isCompressing = false;
                return;
            }

            // Get response data
            const blob = await response.blob();
            isTooBig = blob.size > PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES;

            if (!isTooBig) {
                previewUrl = URL.createObjectURL(blob);
                const dataTransfer = new DataTransfer();
                const tempImageFile = new File([blob], file.name, {type: 'image/webp', lastModified: Date.now()});
                formData.selectedImageFile = tempImageFile;
                dataTransfer.items.add(tempImageFile);
                const fileInput = document.getElementById('imageInput');
                if (fileInput) {
                    fileInput.files = dataTransfer.files;
                }

                // New size
                const newSize = blob.size;
                compressedMessage = '🍀 Image compressed from ' + (oldSize / 1024 / 1024).toFixed(2) + 'MB to ' + (newSize / 1024 / 1024).toFixed(2) + 'MB';

                // Show success toast
                toast.push('Image compressed successfully', {
                    theme: {
                        '--toastBackground': '#4caf50',
                        '--toastColor': '#fff'
                    }
                });
            } else {
                toast.push('Failed to compress image: Image is still too big', {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
            }
            isCompressing = false;
        } catch (error) {
            // Remove loading toast if still active
            toast.pop(toastId);
            console.error('Error compressing image:', error);
            toast.push('Failed to compress image: Network or server error', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
            isCompressing = false;
        }
    }

    function loadImagePreview(file) {
        if (!file) return;

        formData.selectedImageFile = file;
        fileName = file.name;
        
        const reader = new FileReader();
        reader.onloadend = () => {
            previewUrl = reader.result;
        };
        reader.readAsDataURL(file);
        
        // Get image size (bytes) and if it's too big, set isTooBig to true
        isTooBig = file.size > PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES;
        compressedMessage = '';
    }

    function handleFileInput(event) {
        const file = event.target.files[0];
        if (file) {
            loadImagePreview(file);
        }
    }

    function handleDragOver(event) {
        event.preventDefault();
        isDragging = true;
    }

    function handleDragLeave(event) {
        event.preventDefault();
        isDragging = false;
    }

    async function handleDrop(event) {
        event.preventDefault();
        isDragging = false;

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                loadImagePreview(file);
                // Set the files to the input safely
                const fileInput = document.getElementById('imageInput');
                if (fileInput) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    fileInput.files = dataTransfer.files;
                }
            } else {
                toast.push('Please drop an image file', {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
            }
        }
    }
</script>
<div class="container-xxl px-0 px-md-3 mt-4 mb-5">
    <!-- Header -->
    <div class="row text-center mb-4">
        <div class="col">
            <div class="edit-header rounded-4 py-4 px-2 mb-3">
                <h1 class="h2 fw-bold mb-2 text-white">
                    <i class="fas fa-edit me-2"></i>Edit Tale
                </h1>
                <p class="lead text-white-50 mb-0">Update your tale details, content, and tags</p>
            </div>
        </div>
    </div>

    <!-- Permission Check -->
    {#if !can_upload}
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    You don't have permission to edit content. Please contact an administrator.
                </div>
            </div>
        </div>
    {:else}
        <!-- Main Form Container -->
        <div class="row justify-content-center">
            <div class="col-xl-10">
                <div class="edit-form-container px-0 px-lg-3" use:autoAnimate>
                    <!-- Progress Indicator -->
                    <div class="progress-container mb-4 px-2 px-md-0">
                        <div class="progress progress-bar-custom">
                            <div class="progress-bar bg-gradient-primary"
                                 style="width: {(currentStep / totalSteps) * 100}%"
                                 role="progressbar"
                                 aria-valuenow="{currentStep}"
                                 aria-valuemin="0"
                                 aria-valuemax="{totalSteps}">
                            </div>
                        </div>
                        <div class="step-indicators mt-3">
                            <div class="row text-center">
                                <div class="col-4">
                                    <button type="button" 
                                            class="step-indicator {currentStep >= 1 ? 'active' : ''}"
                                            onclick={() => goToStep(1)}>
                                        <div class="step-number">1</div>
                                        <div class="step-label">Details</div>
                                    </button>
                                </div>
                                <div class="col-4">
                                    <button type="button"
                                            class="step-indicator {currentStep >= 2 ? 'active' : ''}"
                                            onclick={() => validateStep1() && goToStep(2)}>
                                        <div class="step-number">2</div>
                                        <div class="step-label">Content</div>
                                    </button>
                                </div>
                                <div class="col-4">
                                    <button type="button"
                                            class="step-indicator {currentStep >= 3 ? 'active' : ''}"
                                            onclick={() => validateStep1() && validateStep2() && goToStep(3)}>
                                        <div class="step-number">3</div>
                                        <div class="step-label">Tags & Save</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Form Steps -->
                    <form onsubmit={handleEdit} class="edit-form">
                        <div class="form-steps" use:autoAnimate>
                            <!-- Step 1: Basic Details -->
                            {#if currentStep === 1}
                                <div class="form-step step-1 px-3">
                                    <div class="step-header mb-4">
                                        <h3 class="h4 fw-bold mb-2">
                                            <i class="fas fa-info-circle me-2 text-primary"></i>
                                            Tale Details
                                        </h3>
                                        <p class="text-muted">Update your tale's title and cover image</p>
                                    </div>

                                    <div class="row g-4">
                                        <!-- Title Input -->
                                        <div class="col-12">
                                            <div class="form-floating">
                                                <input type="text"
                                                       class="form-control form-control-modern"
                                                       id="stepTitle"
                                                       placeholder="Enter title"
                                                       bind:value={formData.title}
                                                       required>
                                                <label for="stepTitle">
                                                    <i class="fas fa-heading me-2"></i>
                                                    Tale Title
                                                </label>
                                            </div>
                                        </div>

                                        <!-- Cover Image Upload -->
                                        <div class="col-12">
                                            <div class="image-upload-section">
                                                <label for="imageInput" class="form-label fw-bold mb-3">
                                                    <i class="fas fa-image me-2"></i>
                                                    Cover Image
                                                </label>
                                                
                                                <!-- Drag & Drop Area -->
                                                <div class="image-upload-area {isDragging ? 'dragging' : ''} {isTooBig ? 'error' : ''}"
                                                     role="button"
                                                     tabindex="0"
                                                     ondragover={handleDragOver}
                                                     ondragleave={handleDragLeave}
                                                     ondrop={handleDrop}
                                                     onclick={() => document.getElementById('imageInput').click()}
                                                     onkeydown={(e) => e.key === 'Enter' && document.getElementById('imageInput').click()}>
                                                    
                                                    <!-- File Input -->
                                                    <input type="file"
                                                           id="imageInput"
                                                           class="d-none"
                                                           accept="image/*"
                                                           onchange={handleFileInput}>
                                                    
                                                    <!-- Preview or Current Image -->
                                                    {#if previewUrl}
                                                        <div class="image-preview">
                                                            <img src={previewUrl} 
                                                                 alt="Preview" 
                                                                 class="preview-image">
                                                            <div class="image-info">
                                                                <p class="mb-2 fw-bold text-success">
                                                                    <i class="fas fa-check-circle me-2"></i>
                                                                    {fileName}
                                                                </p>
                                                                {#if isTooBig}
                                                                    <div class="alert alert-warning border-0 mb-3 image-controls">
                                                                        <div class="d-flex align-items-center justify-content-between">
                                                                            <div>
                                                                                <i class="fas fa-exclamation-triangle me-2"></i>
                                                                                File too large! Maximum size: {maxFileSizeMB}MB
                                                                            </div>
                                                                            <div>
                                                                                {#if !isCompressing}
                                                                                    <button type="button"
                                                                                            class="btn btn-sm btn-warning ms-2 compress-btn"
                                                                                            onclick={(e) => { e.stopPropagation(); compressImage(); }}>
                                                                                        <i class="fas fa-compress me-1"></i>
                                                                                        Compress
                                                                                    </button>
                                                                                {:else}
                                                                                    <div class="spinner-border spinner-border-sm ms-2"
                                                                                         role="status">
                                                                                        <span class="visually-hidden">Compressing...</span>
                                                                                    </div>
                                                                                {/if}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                {/if}
                                                                {#if compressedMessage}
                                                                    <div class="alert alert-success border-0 mb-3 image-controls">
                                                                        {@html compressedMessage}
                                                                    </div>
                                                                {/if}
                                                                <div class="image-overlay">
                                                                    <button type="button" 
                                                                            class="btn btn-primary btn-sm me-2"
                                                                            onclick={(e) => { e.stopPropagation(); document.getElementById('imageInput').click(); }}>
                                                                        <i class="fas fa-edit me-2"></i>Change Image
                                                                    </button>
                                                                    <button type="button"
                                                                            class="btn btn-outline-secondary btn-sm"
                                                                            onclick={(e) => { e.stopPropagation(); previewUrl = null; fileName = null; isTooBig = false; formData.selectedImageFile = null; compressedMessage = ''; }}>
                                                                        <i class="fas fa-times me-1"></i>
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    {:else if book?.cover_url}
                                                        {@const optimizedCoverUrl = image_proxy && book.cover_url && !book.cover_url.startsWith(image_proxy) ? image_proxy + book.cover_url : book.cover_url}
                                                        <div class="image-preview">
                                                            <img src={optimizedCoverUrl + '?width=800&quality=80'} 
                                                                 alt="Current cover" 
                                                                 class="preview-image">
                                                            <div class="image-overlay">
                                                                <button type="button" 
                                                                        class="btn btn-primary btn-sm"
                                                                        onclick={(e) => { e.stopPropagation(); document.getElementById('imageInput').click(); }}>
                                                                    <i class="fas fa-edit me-2"></i>Change Image
                                                                </button>
                                                            </div>
                                                        </div>
                                                    {:else}
                                                        <div class="upload-prompt">
                                                            <i class="fas fa-cloud-upload-alt mb-3"></i>
                                                            <h5>Drop an image here or click to browse</h5>
                                                            <p class="text-muted mb-3">
                                                                Max size: {maxFileSizeMB}MB<br>
                                                                Max resolution: {PUBLIC_COVER_MAX_WIDTH}x{PUBLIC_COVER_MAX_HEIGHT}
                                                            </p>
                                                            <button type="button" 
                                                                    class="btn btn-outline-primary"
                                                                    onclick={() => document.getElementById('imageInput').click()}>
                                                                <i class="fas fa-folder-open me-2"></i>Choose File
                                                            </button>
                                                        </div>
                                                    {/if}

                                                    <!-- Compression Status -->
                                                    {#if isCompressing}
                                                        <div class="compression-status">
                                                            <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                                                            Compressing image...
                                                        </div>
                                                    {/if}

                                                    {#if compressedMessage}
                                                        <div class="compression-info">
                                                            <i class="fas fa-compress-alt me-2"></i>
                                                            {compressedMessage}
                                                        </div>
                                                    {/if}
                                                </div>

                                                {#if fileName}
                                                    <div class="selected-file-info mt-2">
                                                        <small class="text-muted">
                                                            <i class="fas fa-file-image me-1"></i>
                                                            Selected: {fileName}
                                                        </small>
                                                    </div>
                                                {/if}
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Step Navigation -->
                                    <div class="step-navigation mt-4 d-flex justify-content-end">
                                        <button type="button"
                                                class="btn btn-primary btn-lg"
                                                onclick={nextStep}
                                                disabled={!validateStep1()}>
                                            Next<i class="fas fa-chevron-right ms-2"></i>
                                        </button>
                                    </div>
                                </div>
                            {/if}

                            <!-- Step 2: Content -->
                            {#if currentStep === 2}
                                <div class="form-step step-2 px-1 px-md-3">
                                    <div class="step-header mb-4 px-3">
                                        <h3 class="h4 fw-bold mb-2">
                                            <i class="fas fa-edit me-2 text-primary"></i>
                                            Tale Description
                                        </h3>
                                        <p class="text-muted">Update your tale's description using the rich text editor</p>
                                    </div>

                                    <div class="editor-container">
                                        <Editor {conf}
                                                scriptSrc="../tinymce/tinymce.min.js"
                                                bind:value={formData.description}
                                        />
                                    </div>

                                    <!-- Step Navigation -->
                                    <div class="step-navigation mt-4 d-flex justify-content-between">
                                        <button type="button"
                                                class="btn btn-outline-secondary"
                                                onclick={prevStep}>
                                            <i class="fas fa-chevron-left me-2"></i>Previous
                                        </button>
                                        <button type="button"
                                                class="btn btn-primary btn-lg"
                                                onclick={nextStep}
                                                disabled={!validateStep2()}>
                                            Next<i class="fas fa-chevron-right ms-2"></i>
                                        </button>
                                    </div>
                                </div>
                            {/if}

                            <!-- Step 3: Tags & Submit -->
                            {#if currentStep === 3}
                                <div class="form-step step-3">
                                    <div class="step-header mb-4">
                                        <h3 class="h4 fw-bold mb-2">
                                            <i class="fas fa-tags me-2 text-primary"></i>
                                            Tags & Final Review
                                        </h3>
                                        <p class="text-muted">Add tags to help readers discover your tale</p>
                                    </div>

                                    <div class="tags-section mb-4">
                                        <h6 class="fw-bold mb-3">
                                            <i class="fas fa-tags me-2"></i>Tags
                                        </h6>

                                        <div class="tag-input-container">
                                            <div class="tag-display mb-3" use:autoAnimate>
                                                {#each tags as tag}
                                                    <span class="badge tag-pill">
                                                        {tag}
                                                        <button type="button"
                                                                class="tag-remove"
                                                                onclick={removeTag}
                                                                value={tag}
                                                                aria-label="Remove tag">
                                                            <i class="fas fa-times"></i>
                                                        </button>
                                                    </span>
                                                {/each}
                                            </div>

                                            <div class="input-group">
                                                <input type="text"
                                                       class="form-control form-control-modern"
                                                       placeholder="Type tags and press Enter, Space, or Comma"
                                                       bind:value={inputTag}
                                                       onkeydown={addTag}
                                                       onkeyup={addTag}>
                                                <span class="input-group-text">
                                                    <i class="fas fa-plus"></i>
                                                </span>
                                            </div>

                                            {#if suggestions.length > 0}
                                                <div class="tag-suggestions mt-2" use:autoAnimate>
                                                    <small class="text-muted mb-2 d-block">
                                                        <i class="fas fa-lightbulb me-1"></i>Suggestions:
                                                    </small>
                                                    <div class="suggestions-list">
                                                        {#each suggestions as suggestion, index}
                                                            <button type="button"
                                                                    class="suggestion-btn {index === selectedSuggestionIndex ? 'selected' : ''}"
                                                                    onclick={addTag}
                                                                    value={suggestion}>
                                                                {suggestion}
                                                            </button>
                                                        {/each}
                                                    </div>
                                                </div>
                                            {/if}
                                        </div>
                                    </div>

                                    <!-- Summary Section -->
                                    <div class="summary-section mb-4">
                                        <h6 class="fw-bold mb-3">
                                            <i class="fas fa-eye me-2"></i>Review Changes
                                        </h6>
                                        <div class="summary-card">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <strong>Title:</strong>
                                                    <p class="mb-2">{formData.title}</p>
                                                    <strong>Tags:</strong>
                                                    <p class="mb-0">
                                                        {tags.length > 0 ? tags.join(', ') : 'No tags'}
                                                    </p>
                                                </div>
                                                <div class="col-md-6">
                                                    <strong>Image:</strong>
                                                    <p class="mb-0">
                                                        {formData.selectedImageFile ? 'New image selected' : 'Using current image'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Step Navigation -->
                                    <div class="step-navigation mt-4 d-flex justify-content-between">
                                        <button type="button"
                                                class="btn btn-outline-secondary"
                                                onclick={prevStep}>
                                            <i class="fas fa-chevron-left me-2"></i>Previous
                                        </button>
                                        
                                        <div class="d-flex gap-2">
                                            {#if isUploading}
                                                <button type="submit"
                                                        class="btn btn-primary btn-lg"
                                                        disabled>
                                                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                                                    Updating...
                                                </button>
                                            {:else}
                                                <button type="submit"
                                                        class="btn btn-primary btn-lg ms-2">
                                                    <i class="fas fa-save me-2"></i>Save Changes
                                                </button>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </form>

                    <!-- Legal Notice -->
                    <div class="legal-notice mt-4 text-center">
                        <p class="text-muted small mb-0">
                            By updating your tale, you agree to our 
                            <a href="/legal/tos" target="_blank" class="link-secondary">terms of service</a> 
                            and 
                            <a href="/legal/privacy-policy" target="_blank" class="link-secondary">privacy policy</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    :global(.form-control-modern) {
        background: linear-gradient(145deg, rgba(26, 26, 46, 0.9), rgba(40, 40, 70, 0.8));
        border: 2px solid rgba(92, 0, 166, 0.3);
        color: #e8e3f3;
        border-radius: 12px;
        padding: 12px 16px;
        font-size: 1rem;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
    }

    :global(.form-control-modern:focus) {
        background: linear-gradient(145deg, rgba(26, 26, 46, 0.95), rgba(40, 40, 70, 0.9));
        border-color: #5c00a6;
        box-shadow: 0 0 20px rgba(92, 0, 166, 0.4);
        outline: none;
    }

    :global(.form-control-modern::placeholder) {
        color: rgba(232, 227, 243, 0.6);
    }

    :global(.form-floating > .form-control-modern ~ label) {
        background: transparent;
        color: rgba(232, 227, 243, 0.8);
        padding: 0 8px;
    }

    :global(.form-floating > .form-control-modern:focus ~ label),
    :global(.form-floating > .form-control-modern:not(:placeholder-shown) ~ label) {
        color: #a78bfa;
        transform: scale(0.85) translateY(-0.5rem) translateX(0.15rem);
    }

    .edit-header {
        background: linear-gradient(135deg, #0b0086, #5c00a6, #8b5cf6);
        background-size: 300% 300%;
        animation: gradientShift 8s ease infinite;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
    }

    @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }

    .edit-form-container {
        background: linear-gradient(145deg, rgba(15, 15, 35, 0.9), rgba(30, 30, 60, 0.8));
        border: 1px solid rgba(92, 0, 166, 0.2);
        border-radius: 20px;
        padding: 2rem;
        backdrop-filter: blur(20px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .progress-bar-custom {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        height: 6px;
        overflow: hidden;
    }

    .bg-gradient-primary {
        background: linear-gradient(90deg, #0b0086, #5c00a6, #a78bfa);
        background-size: 200% 100%;
        animation: progressGlow 2s ease infinite;
        border-radius: 20px;
    }

    @keyframes progressGlow {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }

    .step-indicator {
        cursor: pointer;
        transition: all 0.3s ease;
        padding: 1rem;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: none;
        color: inherit;
        width: 100%;
    }

    .step-indicator:hover {
        background: rgba(92, 0, 166, 0.1);
        transform: translateY(-2px);
    }

    .step-indicator.active {
        background: linear-gradient(135deg, rgba(92, 0, 166, 0.3), rgba(167, 139, 250, 0.2));
        border: 1px solid rgba(92, 0, 166, 0.5);
    }

    .step-number {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(92, 0, 166, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 0.5rem;
        font-weight: 600;
        color: #e8e3f3;
        transition: all 0.3s ease;
    }

    .step-indicator.active .step-number {
        background: linear-gradient(135deg, #5c00a6, #a78bfa);
        color: white;
        box-shadow: 0 4px 15px rgba(92, 0, 166, 0.4);
    }

    .step-label {
        font-size: 0.875rem;
        color: rgba(232, 227, 243, 0.8);
        font-weight: 500;
    }

    .step-indicator.active .step-label {
        color: #a78bfa;
        font-weight: 600;
    }

    .form-step {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 2rem;
        margin-bottom: 2rem;
        backdrop-filter: blur(10px);
    }

    .step-header h3 {
        color: #e8e3f3;
        margin-bottom: 0.5rem;
    }

    .step-header p {
        color: rgba(232, 227, 243, 0.7);
        margin-bottom: 0;
    }

    .image-upload-area {
        border: 2px dashed rgba(92, 0, 166, 0.3);
        border-radius: 16px;
        padding: 2rem;
        text-align: center;
        background: linear-gradient(145deg, rgba(26, 26, 46, 0.5), rgba(40, 40, 70, 0.3));
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    .image-upload-area:hover {
        border-color: rgba(92, 0, 166, 0.6);
        background: linear-gradient(145deg, rgba(26, 26, 46, 0.7), rgba(40, 40, 70, 0.5));
        transform: translateY(-2px);
    }

    .image-upload-area.dragging {
        border-color: #a78bfa;
        background: linear-gradient(145deg, rgba(92, 0, 166, 0.1), rgba(167, 139, 250, 0.05));
        animation: pulse 1s infinite;
    }

    .image-upload-area.error {
        border-color: #ef4444;
        background: linear-gradient(145deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }

    .upload-prompt i {
        font-size: 3rem;
        color: rgba(92, 0, 166, 0.6);
        margin-bottom: 1rem;
    }

    .upload-prompt h5 {
        color: #e8e3f3;
        margin-bottom: 1rem;
    }

    .image-preview {
        position: relative;
        display: inline-block;
        border-radius: 12px;
        overflow: hidden;
        max-width: 100%;
    }

    .preview-image {
        max-height: 300px;
        max-width: 100%;
        object-fit: contain;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1;
    }

    .image-preview:hover .image-overlay {
        opacity: 1;
    }

    .image-controls {
        position: relative;
        z-index: 2;
    }

    .compress-btn {
        position: relative;
        z-index: 3;
    }

    .compression-status,
    .compression-info {
        margin-top: 1rem;
        padding: 0.75rem;
        border-radius: 8px;
        background: rgba(92, 0, 166, 0.1);
        color: #a78bfa;
        font-size: 0.875rem;
    }

    .selected-file-info {
        color: rgba(232, 227, 243, 0.7);
        font-size: 0.875rem;
    }

    .editor-container {
        border-radius: 12px;
        overflow: hidden;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .tag-pill {
        background: linear-gradient(135deg, #5c00a6, #a78bfa);
        color: white;
        border-radius: 20px;
        padding: 8px 12px;
        margin: 4px;
        display: inline-flex;
        align-items: center;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.3s ease;
    }

    .tag-pill:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(92, 0, 166, 0.4);
    }

    .tag-remove {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        margin-left: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        color: white;
    }

    .tag-remove:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.1);
    }

    .tag-suggestions {
        background: rgba(15, 15, 35, 0.9);
        border: 1px solid rgba(92, 0, 166, 0.3);
        border-radius: 12px;
        padding: 0.75rem;
        backdrop-filter: blur(10px);
    }

    .suggestions-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .suggestion-btn {
        margin: 4px;
        border-radius: 20px;
        transition: all 0.2s ease;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(232, 227, 243, 0.8);
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
        cursor: pointer;
    }

    .suggestion-btn:hover {
        background: #5c00a6;
        border-color: #5c00a6;
        color: white;
        transform: translateY(-1px);
    }

    .suggestion-btn.selected {
        background: #5c00a6;
        border-color: #5c00a6;
        color: white;
    }

    .summary-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 1.5rem;
        color: #e8e3f3;
    }

    .summary-card strong {
        color: #a78bfa;
    }

    .btn-primary {
        background: linear-gradient(135deg, #0b0086, #5c00a6);
        border: 1px solid rgba(92, 0, 166, 0.5);
        color: white;
        padding: 0.75rem 2rem;
        border-radius: 12px;
        font-weight: 600;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(92, 0, 166, 0.2);
    }

    .btn-primary:hover:not(:disabled) {
        background: linear-gradient(135deg, #5c00a6, #a78bfa);
        border-color: #a78bfa;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(92, 0, 166, 0.3);
    }

    .btn-primary:disabled {
        background: rgba(92, 0, 166, 0.3);
        border-color: rgba(92, 0, 166, 0.2);
        opacity: 0.6;
        cursor: not-allowed;
    }

    .btn-outline-secondary {
        background: transparent;
        border: 2px solid rgba(255, 255, 255, 0.2);
        color: rgba(232, 227, 243, 0.8);
        padding: 0.75rem 2rem;
        border-radius: 12px;
        font-weight: 600;
        transition: all 0.3s ease;
    }

    .btn-outline-secondary:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.3);
        color: #e8e3f3;
    }

    .legal-notice {
        color: rgba(232, 227, 243, 0.6);
        padding-top: 2rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .legal-notice a {
        color: #a78bfa;
        text-decoration: none;
        transition: color 0.2s ease;
    }

    .legal-notice a:hover {
        color: #c4b5fd;
        text-decoration: underline;
    }

    .alert-warning {
        background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05));
        border: 1px solid rgba(251, 191, 36, 0.3);
        color: #fbbf24;
        border-radius: 12px;
        padding: 1.5rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .edit-form-container {
            padding: 1.5rem;
        }
        
        .form-step {
            padding: 1.5rem;
        }
        
        .step-indicator {
            padding: 0.75rem;
        }
        
        .step-number {
            width: 32px;
            height: 32px;
        }
        
        .btn-lg {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
        }
    }
</style>