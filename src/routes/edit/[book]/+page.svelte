<script>
    import {
        PUBLIC_COVER_MAX_WIDTH,
        PUBLIC_COVER_MAX_HEIGHT,
        PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES,
        PUBLIC_CONVERTER_URL
    } from "$env/static/public";
    import {toast} from "$lib/components/svelte-toast";
    import {deserialize} from "$app/forms";
    import { tooltip } from "$lib/utils/tooltip.js";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";
    import autoAnimate from '@formkit/auto-animate';
    import {invalidateAll} from "$app/navigation";
    import Editor from "@tinymce/tinymce-svelte";
    import {conf} from "$lib/utils/gcatinymce.js";
    import {createBookPath} from "$lib/utils/slugs.js";

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
                    const bookUrl = createBookPath(book.title, book.id);

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
<div class="container-fluid px-1 px-sm-2 px-md-3">
    <!-- Main Edit Interface -->
    <div class="row justify-content-center">
        <div class="col-12 col-lg-8">
            <!-- Header -->
            <div class="edit-header text-center mb-4">
                <h1 class="display-6 fw-bold gradient-text my-2">
                    <i class="fas fa-edit me-2"></i>
                    Edit Tale
                </h1>
                <p class="text-muted">Update your tale details, content, and tags</p>
            </div>

            <!-- Permission Check -->
            {#if !can_upload}
                <div class="alert alert-warning text-center border-0 rounded-4 shadow-sm" role="alert">
                    <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                    <h4 class="alert-heading mb-2">Edit Restricted</h4>
                    <p class="mb-2">You don't have permission to edit content at this time.</p>
                    <hr class="my-2">
                    <p class="mb-0 small">
                        If you believe this is an error, please contact an administrator.
                    </p>
                </div>
            {:else}
                <!-- Main Form Container -->
                <div class="edit-form-container" use:autoAnimate>
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
            {/if}
        </div>
    </div>
</div>

<style>
    :global(.form-control-modern) {
        border: 2px solid var(--border-color);
        border-radius: 12px;
        padding: 12px 16px;
        background: hsl(var(--primary-hue), 15%, 12%);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        color: var(--text-color);
    }

    :global(.form-control-modern:focus) {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 0.2rem var(--primary-color-alpha-90);
        background: hsl(var(--primary-hue), 20%, 8%);
        color: var(--text-color);
    }

    :global(.form-select.form-control-modern) {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23e6e6e6' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 12px center;
        background-size: 16px 16px;
    }

    :global(.form-select.form-control-modern:focus) {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%235c00a6' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e");
    }

    :global(.form-control-modern::placeholder) {
        color: rgba(232, 227, 243, 0.6);
    }

    :global(.form-floating > .form-control-modern ~ label) {
        color: var(--text-color);
        opacity: 0.8;
    }

    :global(.form-floating > .form-control-modern:focus ~ label),
    :global(.form-floating > .form-control-modern:not(:placeholder-shown) ~ label) {
        color: var(--primary-color);
        opacity: 1;
    }

    .edit-header {
        background: linear-gradient(135deg, 
            hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) - 20%)),
            var(--primary-color),
            hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 10%))
        );
        background-size: 300% 300%;
        animation: gradientShift 8s ease infinite;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        padding: 2rem;
    }

    @keyframes gradientShift {
        0%, 100% {
            background-position: 0 50%;
        }
        50% {
            background-position: 100% 50%;
        }
    }

    .gradient-text {
        color: white;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        font-weight: 700;
    }

    .edit-form-container {
        background: linear-gradient(145deg, 
            hsl(var(--primary-hue), 20%, 8%), 
            hsl(var(--primary-hue), 15%, 12%)
        );
        border: 1px solid hsl(var(--primary-hue), 25%, 20%);
        border-radius: 20px;
        padding: 2rem;
        backdrop-filter: blur(20px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .progress-bar-custom {
        height: 8px;
        border-radius: 10px;
        background-color: var(--surface-color);
        overflow: hidden;
        border: 1px solid var(--border-color);
    }

    .progress-bar {
        background: linear-gradient(90deg, var(--primary-color), hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 15%)));
        transition: width 0.3s ease;
    }

    .bg-gradient-primary {
        background: linear-gradient(90deg, var(--primary-color), hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 15%))) !important;
    }

    .step-indicator {
        transition: all 0.3s ease;
        cursor: pointer;
        padding: 1rem;
        border-radius: 12px;
        background: transparent;
        border: none;
        color: inherit;
        width: 100%;
    }

    .step-indicator:hover {
        background: hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) - 25%));
        transform: translateY(-2px);
    }
    
    .step-indicator:hover .step-label {
        color: white;
    }

    .step-indicator.active {
        background: linear-gradient(135deg, 
            hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) - 10%)), 
            hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 5%))
        );
        border: 1px solid var(--primary-color);
    }

    .step-number {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: hsl(var(--primary-hue), 15%, 12%);
        color: var(--text-color);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 8px;
        font-weight: bold;
        transition: all 0.3s ease;
        border: 2px solid hsl(var(--primary-hue), 25%, 20%);
    }

    .step-indicator.active .step-number {
        background: var(--primary-color);
        color: white;
        box-shadow: 0 4px 12px var(--primary-color-alpha-90);
        border-color: var(--primary-color);
    }

    .step-label {
        font-size: 0.9rem;
        font-weight: 500;
        color: hsl(0, 0%, 80%);
        transition: color 0.3s ease;
    }

    .step-indicator.active .step-label {
        color: white;
        font-weight: 600;
    }

    .form-step {
        background: hsl(var(--primary-hue), 15%, 12%);
        backdrop-filter: blur(10px);
        border: 1px solid hsl(var(--primary-hue), 25%, 20%);
        border-radius: 16px;
        padding: 2rem;
        transition: all 0.3s ease;
    }

    .step-header h3 {
        color: var(--text-color);
        margin-bottom: 0.5rem;
    }

    .step-header p {
        color: hsl(0, 0%, 60%);
        margin-bottom: 0;
    }

    .image-upload-area {
        border: 2px dashed hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 20%));
        border-radius: 16px;
        padding: 2rem;
        background: hsl(var(--primary-hue), 15%, 12%);
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    .image-upload-area:hover {
        border-color: var(--primary-color);
        background: hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) - 15%));
        transform: translateY(-2px);
        box-shadow: 0 8px 25px var(--primary-color-alpha-90);
    }

    .image-upload-area.dragging {
        border-color: hsl(120, 50%, 50%);
        background: hsl(120, 50%, 10%);
        animation: pulse 1.5s ease-in-out infinite;
    }

    .image-upload-area.error {
        border-color: hsl(0, 70%, 50%);
        background: hsl(0, 70%, 10%);
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.7;
        }
    }

    .upload-prompt i {
        font-size: 3rem;
        color: var(--primary-color);
        margin-bottom: 1rem;
    }

    .upload-prompt h5 {
        color: var(--text-color);
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
        border: 2px solid hsl(var(--primary-hue), 25%, 20%);
        transition: border-color 0.3s ease;
        background: hsl(var(--primary-hue), 15%, 12%);
    }

    .editor-container:focus-within {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 0.2rem var(--primary-color-alpha-90);
    }

    .tag-pill {
        background: linear-gradient(135deg, var(--primary-color), hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 10%)));
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
        box-shadow: 0 4px 12px var(--primary-color-alpha-90);
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
        background: hsl(var(--primary-hue), 15%, 12%);
        border: 1px solid hsl(var(--primary-hue), 25%, 20%);
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
        background: hsl(var(--primary-hue), 15%, 12%);
        border: 1px solid hsl(var(--primary-hue), 25%, 20%);
        color: var(--text-color);
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
        cursor: pointer;
    }

    .suggestion-btn:hover {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: white;
        transform: translateY(-1px);
    }

    .suggestion-btn.selected {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: white;
    }

    .summary-card {
        background: hsl(var(--primary-hue), 15%, 12%);
        backdrop-filter: blur(10px);
        border: 1px solid hsl(var(--primary-hue), 25%, 20%);
        border-radius: 16px;
        padding: 1.5rem;
        transition: all 0.3s ease;
        color: var(--text-color);
    }

    .summary-card:hover {
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        transform: translateY(-2px);
        border-color: var(--primary-color);
    }

    .summary-card strong {
        color: hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 20%));
    }

    .btn-primary {
        background: linear-gradient(135deg, var(--primary-color), hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 10%)));
        border: none;
        color: white;
        transition: all 0.3s ease;
        border-color: var(--primary-color);
        border-radius: 12px;
        font-weight: 600;
        padding: 0.75rem 2rem;
    }

    .btn-primary:hover:not(:disabled),
    .btn-primary:focus:not(:disabled) {
        background: linear-gradient(135deg, hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 5%)), hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 15%)));
        box-shadow: 0 4px 15px var(--primary-color-alpha-90);
        transform: translateY(-2px);
        color: white;
        border-color: var(--primary-color);
    }

    .btn-primary:disabled {
        background: var(--primary-color);
        opacity: 0.6;
        transform: none;
        box-shadow: none;
        border-color: var(--primary-color);
    }

    .btn-outline-secondary {
        border-color: hsl(var(--primary-hue), 25%, 20%);
        color: var(--text-color);
        background: hsl(var(--primary-hue), 15%, 12%);
        transition: all 0.3s ease;
        padding: 0.75rem 2rem;
        border-radius: 12px;
        font-weight: 600;
    }

    .btn-outline-secondary:hover,
    .btn-outline-secondary:focus {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: white;
    }

    .btn-outline-primary {
        color: var(--primary-color);
        border-color: var(--primary-color);
        background: transparent;
        transition: all 0.3s ease;
    }

    .btn-outline-primary:hover,
    .btn-outline-primary:focus {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: white;
        box-shadow: 0 4px 15px var(--primary-color-alpha-90);
        transform: translateY(-2px);
    }

    .btn-warning {
        background: linear-gradient(135deg, hsl(45, 90%, 45%), hsl(45, 90%, 55%));
        border-color: hsl(45, 90%, 50%);
        color: white;
    }

    .btn-warning:hover {
        background: linear-gradient(135deg, hsl(45, 90%, 50%), hsl(45, 90%, 60%));
        box-shadow: 0 4px 15px hsla(45, 90%, 50%, 0.4);
    }

    .legal-notice {
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid var(--border-color);
        color: hsl(0, 0%, 60%);
    }

    .legal-notice a {
        color: hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 20%));
        text-decoration: none;
        transition: color 0.2s ease;
    }

    .legal-notice a:hover {
        color: hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 30%));
        text-decoration: underline;
    }

    /* Text colors */
    .text-muted {
        color: hsl(0, 0%, 60%) !important;
    }

    .text-success {
        color: hsl(140, 60%, 60%) !important;
    }

    .text-primary {
        color: var(--primary-color) !important;
    }

    /* Small text and links */
    small.text-muted {
        color: hsl(0, 0%, 70%) !important;
    }

    .alert {
        border: none;
        border-radius: 12px;
        background: hsl(var(--primary-hue), 15%, 12%);
        color: var(--text-color);
        border-left: 4px solid;
    }

    .alert-warning {
        border-left-color: hsl(45, 90%, 50%);
        background: hsl(45, 90%, 10%);
        color: hsl(45, 90%, 80%);
    }

    .alert-success {
        border-left-color: hsl(140, 60%, 50%);
        background: hsl(140, 60%, 10%);
        color: hsl(140, 60%, 80%);
    }



    /* Input group text */
    .input-group-text {
        background: hsl(var(--primary-hue), 15%, 12%);
        border-color: hsl(var(--primary-hue), 25%, 20%);
        color: var(--text-color);
    }

    /* Loading States */
    .spinner-border-sm {
        width: 1rem;
        height: 1rem;
        border-color: var(--primary-color);
        border-right-color: transparent;
    }

    /* Form floating label fixes */
    :global(.form-floating > .form-control-modern ~ label) {
        background: transparent;
        color: hsl(0, 0%, 80%);
        padding: 0 8px;
        transform: scale(1) translateY(0);
        transform-origin: 0 0;
        transition: all 0.2s ease-in-out;
    }

    :global(.form-floating > .form-control-modern:focus ~ label),
    :global(.form-floating > .form-control-modern:not(:placeholder-shown) ~ label) {
        color: var(--primary-color);
        opacity: 1;
        transform: scale(0.85) translateY(-0.5rem) translateX(0rem);
    }

    /* Accessibility improvements */
    .form-control-modern:focus {
        outline: none;
    }

    button:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .edit-header {
            margin-left: -0.5rem;
            margin-right: -0.5rem;
            padding: 1.5rem 1rem;
        }
        
        .edit-form-container {
            padding: 1rem;
            margin-left: -0.5rem;
            margin-right: -0.5rem;
        }
        
        .form-step {
            padding: 1rem;
        }
        
        .step-indicator {
            padding: 0.5rem;
        }
        
        .step-number {
            width: 32px;
            height: 32px;
            font-size: 0.85rem;
        }
        
        .step-label {
            font-size: 0.8rem;
        }
        
        .btn-lg {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
        }

        .image-upload-area {
            padding: 1.5rem 1rem;
        }

        .step-navigation {
            flex-direction: row !important;
            flex-wrap: wrap;
            gap: 0.75rem;
        }

        .step-navigation > button {
            flex: 0 0 auto;
            min-width: 140px;
            padding: 0.75rem 1.25rem;
        }

        .tag-pill {
            font-size: 0.85rem;
            padding: 6px 10px;
        }

        .summary-card {
            padding: 1rem;
        }
    }

    @media (max-width: 576px) {
        .edit-header {
            margin-left: -0.75rem;
            margin-right: -0.75rem;
            padding: 1rem 0.75rem;
        }
        
        .edit-form-container {
            margin-left: -0.75rem;
            margin-right: -0.75rem;
            padding: 0.75rem;
        }
        
        .form-step {
            padding: 0.75rem;
        }

        .image-upload-area {
            padding: 1rem 0.5rem;
        }

        .step-header h3 {
            font-size: 1.1rem;
        }
        
        .step-indicator {
            padding: 0.4rem;
        }
        
        .step-number {
            width: 28px;
            height: 28px;
            font-size: 0.8rem;
        }
        
        .step-label {
            font-size: 0.75rem;
        }

        .btn-lg {
            padding: 0.6rem 1.2rem;
            font-size: 0.95rem;
        }
        
        .progress-container {
            margin-left: -0.25rem;
            margin-right: -0.25rem;
        }
    }
</style>