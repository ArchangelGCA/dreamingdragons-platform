<script>
    import {
        PUBLIC_COVER_MAX_WIDTH,
        PUBLIC_COVER_MAX_HEIGHT,
        PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES,
        PUBLIC_CONVERTER_URL
    } from "$env/static/public";
    import {deserialize} from '$app/forms';
    import {toast} from "$lib/components/svelte-toast";
    import Editor from '@tinymce/tinymce-svelte';
    import {invalidateAll} from "$app/navigation";
    import autoAnimate from '@formkit/auto-animate';
    import {tooltip} from "$lib/utils/tooltip.js";
    import {conf} from "$lib/utils/gcatinymce.js"
    import {tooltipConfig} from "$lib/utils/gcacommons.js";
    import {createBookPath, createChapterPath} from "$lib/utils/slugs.js";

    /** @type {{data: any}} */
    let {data} = $props();
    let {books, can_upload} = $state(data);

    const maxFileSizeMB = PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES / 1024 / 1024;
    let previewUrl = $state('');
    let fileName = $state('');
    let editorContent = $state('');
    let selectedOption = $state('book');
    let inputTag = $state('');
    let suggestions = $state([]);
    let activeUpload = $state(false);
    let editorContentTale = $state('');
    let activePreviousChapterTags = $state(false);
    let selectedBook = $state();
    let chaptersNumber = $derived(selectedBook && books && books.length > 0 ? books.find(book => book.id === selectedBook).chapters : 0);
    let discordLink = 'https://discord.gg/u6qFjfDDy2';
    let isDragging = $state(false);
    let isCompressing = $state(false);

    let isTooBig = $state(false);

    let compressedMessage = $state('');

    let tags = $state([]);

    // Debounce timer for tag suggestions
    let tagSuggestionTimer;
    let selectedSuggestionIndex = $state(-1);

    // New state for step-by-step UI
    let currentStep = $state(1);
    let totalSteps = $state(3);
    let formData = $state({
        title: '',
        selectedImageFile: null
    });

    // Progress states
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

    function validateStep1() {
        if (selectedOption === 'book') {
            return formData.title && formData.selectedImageFile && !isTooBig;
        } else {
            return formData.title && selectedBook;
        }
    }

    function validateStep2() {
        if (selectedOption === 'book') {
            return editorContentTale.trim().length > 0;
        } else {
            return editorContent.trim().length > 0;
        }
    }

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
            selectedSuggestionIndex = -1; // Reset selection when typing
            const tag = e.target.value.trim();
            if (tag) {
                // Clear existing timer
                if (tagSuggestionTimer) {
                    clearTimeout(tagSuggestionTimer);
                }
                // Debounce tag suggestions to reduce API calls
                tagSuggestionTimer = setTimeout(() => {
                    fetchTags(tag);
                }, 300);
            } else {
                suggestions = [];
            }
        }
    }

    async function fetchTags(tag) {
        if (!tag) {
            suggestions = [];
        } else {
            const formData = new FormData();
            formData.append('tag', tag);

            const response = await fetch('?/tagsuggestions', {
                method: 'POST',
                body: formData,
            });

            const result = deserialize(await response.text());
            if (result.type === 'success') {
                if (result.data && result.data.status === 200) {
                    suggestions = result.data.body.map(tag => tag.name).filter(suggestion => !tags.includes(suggestion));
                } else {
                    const errorMessage = result.data?.body?.message || 'Tag suggestions failed';
                    toast.push('Error: ' + errorMessage, {
                        theme: {
                            '--toastBackground': '#ff4d4d',
                            '--toastColor': '#fff'
                        }
                    });
                }
            } else if (result.type === 'failure') {
                const errorMessage = result.data?.body?.message || 'Tag suggestions failed';
                toast.push('Error: ' + errorMessage, {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
            } else {
                toast.push('Error: Tag suggestions failed', {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
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

    // Function to load image preview
    function loadImagePreview(event) {
        const file = event.target.files[0];
        if (file) {
            formData.selectedImageFile = file;
            const reader = new FileReader();
            reader.onloadend = () => {
                previewUrl = reader.result;
            };
            reader.readAsDataURL(file);
            fileName = file.name;
            // Get image size (bytes) and if it's too big, set isTooBig to true
            isTooBig = file.size > PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES;
            compressedMessage = '';
        }
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }

    function handleDragEnter(event) {
        event.preventDefault();
        isDragging = true;
    }

    function handleDragLeave(event) {
        event.preventDefault();
        isDragging = false;
    }

    function handleDrop(event) {
        event.preventDefault();
        isDragging = false;
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            // Check if file is an image, if not return
            if (!files[0].type.startsWith('image/')) {
                toast.push('Error: File is not an image', {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
                return;
            }
            formData.selectedImageFile = files[0];
            loadImagePreview({target: {files: [files[0]]}});
            // Set the files to the input safely
            const fileInput = document.getElementById('file');
            if (fileInput) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(files[0]);
                fileInput.files = dataTransfer.files;
            }
        }
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
        uploadFormData.mode = 'no-cors';        // Show loading toast
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
                const fileInput = document.getElementById('file');
                if (fileInput) {
                    fileInput.files = dataTransfer.files;
                }

                // New size
                const newSize = blob.size;
                compressedMessage = '🍀 Image compressed from <b>' + (oldSize / 1024 / 1024).toFixed(2) + 'MB</b> to <b>' + (newSize / 1024 / 1024).toFixed(2) + 'MB</b>';

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

    async function getToken() {
        const response = await fetch('/upload/token');
        if (!response.ok) {
            console.error('Failed to get token');
            return null;
        }
        const data = await response.json();
        return data.token;
    }

    async function fetchPreviousChapterTags() {

        if (activePreviousChapterTags) return;

        activePreviousChapterTags = true;

        // Use selectedBook instead of DOM query
        if (!selectedBook) {
            activePreviousChapterTags = false;
            toast.push('You must select a Content!', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
            return;
        }

        const formData = new FormData();
        formData.append('book_id', selectedBook);

        const toastId = toast.push('Fetching previous chapter tags... 🔗', {
            duration: 600000,
            theme: {
                '--toastBackground': '#ffcc00',
                '--toastColor': '#000'
            }
        });

        const response = await fetch('?/previouschaptertags', {
            method: 'POST',
            body: formData,
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        if (result.type === 'success') {
            if (result.data && result.data.status === 200) {
                if (result.data.body.length <= 0) {
                    toast.push('No previous chapters or tags found... ☹️', {
                        theme: {
                            '--toastBackground': '#ff4d4d',
                            '--toastColor': '#fff'
                        }
                    });
                } else {
                    // Add to tags array (but only those that are not already in the array) and also count how many tags were added
                    let addedTags = 0;
                    result.data.body.forEach(tag => {
                        if (!tags.includes(tag)) {
                            tags = [...tags, tag];
                            addedTags++;
                        }
                    });
                    if (addedTags > 0) {
                        toast.push(addedTags + ' Tags added successfully! 🤩', {
                            theme: {
                                '--toastBackground': '#4caf50',
                                '--toastColor': '#fff'
                            }
                        });
                    } else {
                        toast.push('No tags were added... 🤔', {
                            theme: {
                                '--toastBackground': '#ff4d4d',
                                '--toastColor': '#fff'
                            }
                        });
                    }
                }
            } else {
                const errorMessage = result.data?.body?.message || 'Previous chapter tags fetch failed';
                toast.push('Error: ' + errorMessage, {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
            }
        } else if (result.type === 'failure') {
            const errorMessage = result.data?.body?.message || 'Previous chapter tags fetch failed';
            toast.push('Error: ' + errorMessage, {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        } else {
            toast.push('Error: Previous chapter tags fetch failed', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        }

        activePreviousChapterTags = false;
    }

    async function handleBookUpload(event) {
        event.preventDefault();

        if (activeUpload) return;
        if (isCompressing) {
            toast.push('Please wait for the image to finish compressing', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
            return;
        }

        activeUpload = true;
        isUploading = true;

        const uploadFormData = new FormData();
        uploadFormData.append('title', formData.title);
        uploadFormData.append('description', editorContentTale);
        uploadFormData.append('tags', tags.join(','));

        // Use the stored file reference
        if (formData.selectedImageFile) {
            uploadFormData.append('image', formData.selectedImageFile);
        } else {
            toast.push('Error: No image selected', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
            activeUpload = false;
            isUploading = false;
            return;
        }

        if (!formData.selectedImageFile.type.startsWith('image/')) {
            toast.push('Error: File is not an image', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
            activeUpload = false;
            isUploading = false;
            return;
        }

        if (formData.selectedImageFile.size > PUBLIC_COVER_MAX_UPLOAD_SIZE_BYTES) {
            toast.push('Error: File is too large', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
            activeUpload = false;
            isUploading = false;
            return;
        }

        const toastId = toast.push('Uploading your tale...', {
            duration: 600000,
            theme: {
                '--toastBackground': '#ffcc00',
                '--toastColor': '#000'
            }
        });

        const response = await fetch('?/postbook', {
            method: 'POST',
            body: uploadFormData,
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        await invalidateAll();
        if (result.type === 'success') {
            // For successful responses, data is accessible directly
            if (result.data && result.data.status === 200) {
                const bookId = result.data.body.book_id;
                const bookUrl = createBookPath(formData.title, bookId);

                toast.push(result.data.body.message + '. View it <a class="link-light" href=\"' + bookUrl + '" target="_blank">here</a>.', {
                    theme: {
                        '--toastBackground': '#4caf50',
                        '--toastColor': '#fff'
                    }
                });

                // Reset form
                formData.title = '';
                formData.selectedImageFile = null;
                tags = [];
                previewUrl = '';
                fileName = '';
                isTooBig = false;
                compressedMessage = '';
                editorContentTale = '';
                currentStep = 1;
            } else {
                // Handle success case where data structure is different
                console.log('Unexpected success response format:', result.data);
                toast.push('Error: Unexpected response format', {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
            }
        } else if (result.type === 'failure') {
            // For failed responses using fail(), data is in result.data
            console.log('Failure response:', result);
            const errorMessage = result.data?.body?.message || 'Upload failed';
            toast.push('Error: ' + errorMessage, {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        } else {
            console.log('Unknown response type:', result);
            toast.push('Error: Upload failed', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        }

        activeUpload = false;
        isUploading = false;
    }

    async function handleChapterUpload(event) {
        event.preventDefault();

        if (activeUpload) return;

        activeUpload = true;
        isUploading = true;

        const uploadFormData = new FormData();
        uploadFormData.append('title', formData.title);
        uploadFormData.append('content', editorContent);
        uploadFormData.append('book', selectedBook);
        uploadFormData.append('tags', tags.join(','));

        const toastId = toast.push('Uploading your chapter...', {
            duration: 600000,
            theme: {
                '--toastBackground': '#ffcc00',
                '--toastColor': '#000'
            }
        });

        const response = await fetch('?/postchapter', {
            method: 'POST',
            body: uploadFormData,
        });

        toast.pop(toastId);

        const result = deserialize(await response.text());
        await invalidateAll();
        if (result.type === 'success') {
            // For successful responses, data is accessible directly
            if (result.data && result.data.status === 200) {
                const bookId = result.data.body.book_id;
                const chapterId = result.data.body.chapter_id;
                const bookTitle = books.find(b => b.id === selectedBook)?.title || 'Book';
                const chapterUrl = createChapterPath(bookTitle, bookId, formData.title, chapterId);

                toast.push(result.data.body.message + '. View it <a class="link-light" href=\"' + chapterUrl + '" target="_blank">here</a>.', {
                    theme: {
                        '--toastBackground': '#4caf50',
                        '--toastColor': '#fff'
                    }
                });

                // Reset form
                formData.title = '';
                tags = [];
                editorContent = '';
                selectedBook = undefined;
                currentStep = 1;
            } else {
                // Handle success case where data structure is different
                console.log('Unexpected success response format:', result.data);
                toast.push('Error: Unexpected response format', {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
            }
        } else if (result.type === 'failure') {
            // For failed responses using fail(), data is in result.data
            console.log('Failure response:', result);
            const errorMessage = result.data?.body?.message || 'Upload failed';
            toast.push('Error: ' + errorMessage, {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        } else {
            console.log('Unknown response type:', result);
            toast.push('Error: Upload failed', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        }

        activeUpload = false;
        isUploading = false;
    }
</script>

<div class="container-fluid px-2 px-md-3">
    <!-- Upload Permission Alert -->
    {#if !can_upload}
        <div class="row justify-content-center">
            <div class="col-12 col-lg-8">
                <div class="alert alert-danger text-center mt-3 mb-4 border-0 rounded-4 shadow-sm" role="alert">
                    <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                    <h4 class="alert-heading mb-2">Upload Restricted</h4>
                    <p class="mb-2">You don't have permission to upload content at this time.</p>
                    <hr class="my-2">
                    <p class="mb-0 small">
                        If you believe this is an error, please reach out to us on
                        <a href="{discordLink}" class="alert-link text-decoration-none" target="_blank">
                            <i class="fab fa-discord"></i> Discord
                        </a>
                    </p>
                </div>
            </div>
        </div>
    {/if}

    <!-- Main Upload Interface -->
    <div class="row justify-content-center">
        <div class="col-12 col-lg-8">
            <!-- Header -->
            <div class="upload-header text-center mb-4">
                <h1 class="display-6 fw-bold gradient-text my-2">
                    <i class="fas fa-cloud-upload-alt me-2"></i>
                    Upload Content
                </h1>
                <p class="text-muted">Share your stories with the world</p>
            </div>

            <!-- Content Type Selection -->
            <div class="content-type-selector mb-4" use:autoAnimate>
                <div class="row g-2">
                    <div class="col-6">
                        <button type="button"
                                class="btn btn-outline-primary btn-lg w-100 content-type-btn {selectedOption === 'book' ? 'active' : ''}"
                                onclick={() => {selectedOption = 'book'; currentStep = 1; totalSteps = 3;}}
                                disabled={!can_upload}>
                            <span class="content-type-content">
                                <i class="fas fa-book fa-2x mb-2"></i>
                                <span class="fw-bold d-block">New Tale</span>
                                <small class="text-muted">Start a new story</small>
                            </span>
                        </button>
                    </div>
                    <div class="col-6">
                        <button type="button"
                                class="btn btn-outline-primary btn-lg w-100 content-type-btn {selectedOption === 'chapter' ? 'active' : ''}"
                                onclick={() => {selectedOption = 'chapter'; currentStep = 1; totalSteps = 3;}}
                                disabled={!can_upload || books.length === 0}>
                            <span class="content-type-content">
                                <i class="fas fa-file-alt fa-2x mb-2"></i>
                                <span class="fw-bold d-block">New Chapter</span>
                                <small class="text-muted">Add to existing tale</small>
                            </span>
                        </button>
                    </div>
                </div>

                {#if books.length === 0 && selectedOption === 'chapter'}
                    <div class="alert alert-info mt-3 border-0 rounded-3" role="alert">
                        <i class="fas fa-info-circle me-2"></i>
                        You need to create a tale first before adding chapters.
                    </div>
                {/if}
            </div>

            <!-- Upload Form -->
            {#if can_upload && (selectedOption === 'book' || (selectedOption === 'chapter' && books.length > 0))}
                <div class="upload-form-container" use:autoAnimate>
                    <!-- Progress Indicator -->
                    <div class="progress-container mb-4">
                        <div class="progress progress-bar-custom">
                            <div class="progress-bar bg-gradient-primary"
                                 style="width: {(currentStep / totalSteps) * 100}%"
                                 role="progressbar"
                                 aria-valuenow="{currentStep}"
                                 aria-valuemin="0"
                                 aria-valuemax="{totalSteps}">
                            </div>
                        </div>
                        <div class="step-indicators mt-2">
                            <div class="row text-center">
                                <div class="col-4">
                                    <div class="step-indicator {currentStep >= 1 ? 'active' : ''}">
                                        <div class="step-number">1</div>
                                        <div class="step-label">Details</div>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="step-indicator {currentStep >= 2 ? 'active' : ''}">
                                        <div class="step-number">2</div>
                                        <div class="step-label">Content</div>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <div class="step-indicator {currentStep >= 3 ? 'active' : ''}">
                                        <div class="step-number">3</div>
                                        <div class="step-label">Tags & Submit</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Form Steps -->
                    <div class="form-steps" use:autoAnimate>
                        <!-- Step 1: Basic Details -->
                        {#if currentStep === 1}
                            <div class="form-step step-1">
                                <div class="step-header mb-4">
                                    <h3 class="h4 fw-bold mb-2">
                                        <i class="fas fa-info-circle me-2 text-primary"></i>
                                        {selectedOption === 'book' ? 'Tale Details' : 'Chapter Details'}
                                    </h3>
                                    <p class="text-muted">
                                        {selectedOption === 'book'
                                            ? 'Set up your new tale with a title and cover image'
                                            : 'Choose the tale and set the chapter title'}
                                    </p>
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
                                            <label for="stepTitle" class="text-start">
                                                <i class="fas fa-heading me-2"></i>
                                                {selectedOption === 'book' ? 'Tale Title' : 'Chapter Title'}
                                            </label>
                                        </div>
                                    </div>

                                    {#if selectedOption === 'chapter'}
                                        <!-- Book Selection for Chapter -->
                                        <div class="col-12">
                                            <label for="stepBook" class="form-label fw-bold">
                                                <i class="fas fa-book me-2"></i>
                                                Select Tale
                                            </label>
                                            <div class="form-floating">
                                                <select class="form-select form-control-modern pt-3"
                                                        id="stepBook"
                                                        bind:value={selectedBook}
                                                        required
                                                        aria-describedby="stepBookHelp">
                                                    <option value="">Select an existing tale...</option>
                                                    {#each books as book (book.id)}
                                                        <option value={book.id}>{book.title}</option>
                                                    {/each}
                                                </select>
                                                <label for="stepBook" class="visually-hidden">
                                                    Select Tale
                                                </label>
                                            </div>
                                            {#if selectedBook}
                                                <small id="stepBookHelp" class="text-muted mt-1">
                                                    <i class="fas fa-info-circle me-1"></i>
                                                    This tale has {chaptersNumber} existing chapters
                                                </small>
                                            {/if}
                                        </div>
                                    {/if}

                                    {#if selectedOption === 'book'}
                                        <!-- Image Upload -->
                                        <div class="col-12">
                                            <div class="upload-zone {isDragging ? 'dragging' : ''} {isTooBig ? 'error' : ''}"
                                                 ondragover={handleDragOver}
                                                 ondrop={handleDrop}
                                                 ondragenter={handleDragEnter}
                                                 ondragleave={handleDragLeave}
                                                 role="button"
                                                 tabindex="0"
                                                 aria-label="Upload zone - click or drag files here"
                                                 onkeydown={(e) => {
                                                     if (e.key === 'Enter' || e.key === ' ') {
                                                         e.preventDefault();
                                                         document.getElementById('file').click();
                                                     }
                                                 }}>

                                                {#if !previewUrl}
                                                    <div class="upload-placeholder text-center">
                                                        <i class="fas fa-image fa-3x text-primary mb-3"></i>
                                                        <h5 class="mb-2">Choose or Drag Cover Image</h5>
                                                        <p class="text-muted mb-3">
                                                            Maximum {maxFileSizeMB}MB • {PUBLIC_COVER_MAX_WIDTH}
                                                            × {PUBLIC_COVER_MAX_HEIGHT}px
                                                        </p>
                                                        <input type="file"
                                                               class="form-control d-none"
                                                               id="file"
                                                               name="image"
                                                               accept="image/*"
                                                               onchange={loadImagePreview}
                                                               required>
                                                        <label for="file" class="btn btn-primary btn-lg">
                                                            <i class="fas fa-upload me-2"></i>Choose Image
                                                        </label>
                                                    </div>
                                                {:else}
                                                    <div class="image-preview text-center">
                                                        <img src={previewUrl} alt="Cover preview"
                                                             class="preview-image mb-3">
                                                        <div class="image-info">
                                                            <p class="mb-2 fw-bold text-success">
                                                                <i class="fas fa-check-circle me-2"></i>
                                                                {fileName}
                                                            </p>
                                                            {#if isTooBig}
                                                                <div class="alert alert-warning border-0 mb-3">
                                                                    <div class="d-flex align-items-center justify-content-between">
                                                                        <div>
                                                                            <i class="fas fa-exclamation-triangle me-2"></i>
                                                                            File too large! Maximum
                                                                            size: {maxFileSizeMB}MB
                                                                        </div>
                                                                        <div>
                                                                            {#if !isCompressing}
                                                                                <button type="button"
                                                                                        class="btn btn-sm btn-warning ms-2"
                                                                                        onclick={compressImage}>
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
                                                                <div class="alert alert-success border-0 mb-3">
                                                                    {@html compressedMessage}
                                                                </div>
                                                            {/if}
                                                            <button type="button"
                                                                    class="btn btn-outline-secondary btn-sm"
                                                                    onclick={() => {previewUrl = ''; fileName = ''; isTooBig = false; formData.selectedImageFile = null;}}>
                                                                <i class="fas fa-times me-1"></i>
                                                                Remove Image
                                                            </button>
                                                        </div>
                                                    </div>
                                                {/if}
                                            </div>
                                        </div>
                                    {/if}
                                </div>

                                <!-- Step Navigation -->
                                <div class="step-navigation mt-4 d-flex justify-content-between">
                                    <button type="button" class="btn btn-outline-secondary" disabled>
                                        <i class="fas fa-chevron-left me-2"></i>Previous
                                    </button>
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
                            <div class="form-step step-2">
                                <div class="step-header mb-4">
                                    <h3 class="h4 fw-bold mb-2">
                                        <i class="fas fa-edit me-2 text-primary"></i>
                                        {selectedOption === 'book' ? 'Tale Description' : 'Chapter Content'}
                                    </h3>
                                    <p class="text-muted">
                                        {selectedOption === 'book'
                                            ? 'Write a compelling description for your tale'
                                            : 'Write your chapter content using the rich text editor'}
                                    </p>
                                </div>

                                <div class="editor-container">
                                    {#if selectedOption === 'book'}
                                        <Editor {conf}
                                                scriptSrc="tinymce/tinymce.min.js"
                                                bind:value={editorContentTale}
                                        />
                                    {:else}
                                        <Editor {conf}
                                                scriptSrc="tinymce/tinymce.min.js"
                                                bind:value={editorContent}
                                        />
                                    {/if}
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
                                    <p class="text-muted">Add tags to help readers discover your content</p>
                                </div>

                                <div class="tags-section mb-4">
                                    <h6 class="fw-bold mb-3">
                                        <i class="fas fa-tags me-2"></i>Tags
                                    </h6>

                                    <div class="tag-input-container">
                                        <div class="tag-display" use:autoAnimate>
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

                                        <div class="input-group mt-2">
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
                                                    {#each suggestions as suggestion, index (suggestion)}
                                                        <button type="button"
                                                                class="btn btn-sm btn-outline-secondary suggestion-btn {selectedSuggestionIndex === index ? 'selected' : ''}"
                                                                onclick={addTag}
                                                                value={suggestion}>
                                                            {suggestion}
                                                        </button>
                                                    {/each}
                                                </div>
                                            </div>
                                        {/if}
                                    </div>

                                    {#if selectedOption === 'chapter' && chaptersNumber > 0}
                                        <div class="mt-3">
                                            <button type="button"
                                                    class="btn btn-outline-purple-light btn-sm"
                                                    onclick={fetchPreviousChapterTags}
                                                    disabled={activePreviousChapterTags}>
                                                {#if activePreviousChapterTags}
                                                    <span class="spinner-border spinner-border-sm me-2" role="status">
                                                        <span class="visually-hidden">Loading...</span>
                                                    </span>
                                                {:else}
                                                    <i class="fas fa-history me-2"></i>
                                                {/if}
                                                Use Previous Chapter Tags
                                            </button>
                                        </div>
                                    {/if}
                                </div>

                                <!-- Summary Review -->
                                <div class="review-section mb-4">
                                    <h5 class="fw-bold mb-3">
                                        <i class="fas fa-eye me-2"></i>Review
                                        Your {selectedOption === 'book' ? 'Tale' : 'Chapter'}
                                    </h5>

                                    <div class="review-card">
                                        <div class="row g-3">
                                            {#if selectedOption === 'book' && previewUrl}
                                                <div class="col-md-4 col-lg-3">
                                                    <div class="review-image-container">
                                                        <img src={previewUrl} alt="Cover" class="review-image">
                                                    </div>
                                                </div>
                                                <div class="col-md-8 col-lg-9">
                                                    <div class="review-content">
                                                        <h6 class="fw-bold mb-2">{formData.title}</h6>
                                                        <p class="text-muted small mb-3">Tale • {tags.length} tags</p>
                                                        <div class="content-preview">
                                                            {@html editorContentTale.substring(0, 200)}
                                                            {#if editorContentTale.length > 200}...{/if}
                                                        </div>
                                                    </div>
                                                </div>
                                            {:else}
                                                <div class="col-12">
                                                    <div class="review-content">
                                                        <h6 class="fw-bold mb-2">{formData.title}</h6>
                                                        <p class="text-muted small mb-3">
                                                            Chapter
                                                            {#if selectedBook && books}for
                                                                "{books.find(b => b.id === selectedBook)?.title}"
                                                            {/if}
                                                            • {tags.length} tags
                                                        </p>
                                                        <div class="content-preview">
                                                            {@html (selectedOption === 'book' ? editorContentTale : editorContent).substring(0, 200)}
                                                            {#if (selectedOption === 'book' ? editorContentTale : editorContent).length > 200}
                                                                ...
                                                            {/if}
                                                        </div>
                                                    </div>
                                                </div>
                                            {/if}
                                        </div>
                                    </div>
                                </div>

                                <!-- Form Submission -->
                                <form method="POST"
                                      enctype="multipart/form-data"
                                      action="?/{selectedOption === 'book' ? 'postbook' : 'postchapter'}"
                                      onsubmit={selectedOption === 'book' ? handleBookUpload : handleChapterUpload}>

                                    <!-- Hidden inputs -->
                                    <input type="hidden" name="title" value={formData.title}>
                                    {#if selectedOption === 'book' && formData.selectedImageFile}
                                        <input type="file" name="image" class="d-none" id="hiddenFileInput">
                                    {:else if selectedOption === 'chapter'}
                                        <input type="hidden" name="book" value={selectedBook}>
                                    {/if}
                                    <input type="hidden" name="tags" value={tags.join(',')}>

                                    <!-- Step Navigation -->
                                    <div class="step-navigation mt-4 d-flex justify-content-between align-items-center">
                                        <button type="button"
                                                class="btn btn-outline-secondary"
                                                onclick={prevStep}>
                                            <i class="fas fa-chevron-left me-2"></i>Previous
                                        </button>

                                        <div class="submit-section">
                                            {#if isUploading || activeUpload}
                                                <button type="submit" class="btn btn-primary btn-lg" disabled>
                                                    <span class="spinner-border spinner-border-sm me-2" role="status">
                                                        <span class="visually-hidden">Uploading...</span>
                                                    </span>
                                                    Uploading...
                                                </button>
                                            {:else}
                                                <button type="submit"
                                                        class="btn btn-primary btn-lg submit-btn"
                                                        disabled={!can_upload}>
                                                    <i class="fas fa-rocket me-2"></i>
                                                    Publish {selectedOption === 'book' ? 'Tale' : 'Chapter'}
                                                </button>
                                            {/if}
                                        </div>
                                    </div>
                                </form>
                            </div>
                        {/if}
                    </div>
                </div>
            {/if}

            <!-- Footer Guidelines -->
            <div class="upload-footer mt-5 pt-4 border-top">
                <div class="row text-center">
                    <div class="col-12 mb-3">
                        <div class="alert alert-warning border-0 rounded-4" role="alert">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            <strong>Content Guidelines:</strong> No AI-generated content or NSFW material allowed
                        </div>
                    </div>
                    <div class="col-12">
                        <p class="text-muted small mb-0">
                            By uploading content, you agree to our
                            <a href="/legal/tos" target="_blank" class="text-decoration-none">Terms of Service</a>
                            and
                            <a href="/legal/privacy-policy" target="_blank" class="text-decoration-none">Privacy
                                Policy</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>

    .btn-outline-purple-light {
        color: var(--text-color);
        border-color: var(--primary-color-alpha-90);
        background-color: transparent;
        transition: all 0.3s ease;
    }

    .btn-outline-purple-light:hover {
        color: white;
        background-color: var(--primary-color);
        border-color: var(--primary-color);
    }

    .gradient-text {
        background: linear-gradient(135deg, var(--primary-color), hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 15%)));
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-size: 200% 200%;
        animation: gradientShift 3s ease-in-out infinite;
    }

    .content-type-selector .content-type-btn {
        min-height: 120px;
        border: 2px solid transparent;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        background: hsl(var(--primary-hue), 15%, 12%);
        color: var(--text-color);
        border-color: hsl(var(--primary-hue), 25%, 20%);
    }

    .content-type-btn:not(.active):hover {
        border-color: var(--primary-color);
        box-shadow: 0 4px 15px var(--primary-color-alpha-90);
        transform: translateY(-2px);
        background: hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) - 20%));
        color: white;
    }

    .content-type-btn.active {
        background: linear-gradient(135deg, var(--primary-color), hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 10%)));
        border-color: var(--primary-color);
        color: white;
        box-shadow: 0 8px 25px var(--primary-color-alpha-90);
    }

    .content-type-btn.active .text-muted {
        color: rgba(255, 255, 255, 0.8) !important;
    }

    .content-type-btn:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 0.2rem var(--primary-color-alpha-90);
    }

    .content-type-content {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .content-type-content .fw-bold.d-block {
        display: block !important;
        margin: 0.5rem 0 0.25rem 0;
    }

    /* Progress Bar */
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

    /* Step Indicators */
    .step-indicator {
        transition: all 0.3s ease;
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
        color: var(--text-color);
        transition: color 0.3s ease;
    }

    .step-indicator.active .step-label {
        color: var(--primary-color);
        font-weight: 600;
    }

    /* Form Styles */
    .form-control-modern {
        border: 2px solid var(--border-color);
        border-radius: 12px;
        padding: 12px 16px;
        background: hsl(var(--primary-hue), 15%, 12%);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        color: var(--text-color);
    }

    .form-control-modern:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 0.2rem var(--primary-color-alpha-90);
        background: hsl(var(--primary-hue), 20%, 8%);
        color: var(--text-color);
    }

    .form-select.form-control-modern {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23e6e6e6' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 12px center;
        background-size: 16px 16px;
    }

    .form-select.form-control-modern:focus {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%235c00a6' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m1 6 7 7 7-7'/%3e%3c/svg%3e");
    }

    .form-floating > label {
        color: var(--text-color);
        opacity: 0.8;
    }

    .form-floating > .form-control:focus ~ label,
    .form-floating > .form-control:not(:placeholder-shown) ~ label,
    .form-floating > .form-select ~ label {
        color: var(--primary-color);
        opacity: 1;
    }

    /* Upload Zone */
    .upload-zone {
        border: 2px dashed hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 20%));
        border-radius: 16px;
        padding: 2rem;
        background: hsl(var(--primary-hue), 15%, 12%);
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    .upload-zone:hover {
        border-color: var(--primary-color);
        background: hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) - 15%));
        transform: translateY(-2px);
        box-shadow: 0 8px 25px var(--primary-color-alpha-90);
    }

    .upload-zone.dragging {
        border-color: hsl(120, 50%, 50%);
        background: hsl(120, 50%, 10%);
        animation: pulse 1.5s ease-in-out infinite;
    }

    .upload-zone.error {
        border-color: hsl(0, 70%, 50%);
        background: hsl(0, 70%, 10%);
    }

    .upload-placeholder {
        color: var(--text-color);
    }

    .upload-placeholder .text-primary {
        color: var(--primary-color) !important;
    }

    .upload-placeholder .text-muted {
        color: hsl(0, 0%, 60%) !important;
    }

    .preview-image {
        max-height: 200px;
        width: auto;
        border-radius: 12px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        transition: transform 0.3s ease;
    }

    .preview-image:hover {
        transform: scale(1.05);
    }

    /* Tags */
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

    .suggestion-btn {
        margin: 4px;
        border-radius: 20px;
        transition: all 0.2s ease;
        background: hsl(var(--primary-hue), 15%, 12%);
        border: 1px solid hsl(var(--primary-hue), 25%, 20%);
        color: var(--text-color);
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

    /* Review Section */
    .review-card {
        background: hsl(var(--primary-hue), 15%, 12%);
        backdrop-filter: blur(10px);
        border: 1px solid hsl(var(--primary-hue), 25%, 20%);
        border-radius: 16px;
        padding: 1.5rem;
        transition: all 0.3s ease;
    }

    .review-card:hover {
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        transform: translateY(-2px);
        border-color: var(--primary-color);
    }

    .review-image-container {
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        height: fit-content;
    }

    .review-image {
        width: 100%;
        height: auto;
        max-height: 200px;
        object-fit: cover;
        display: block;
    }

    .review-content {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .content-preview {
        flex: 1;
        line-height: 1.6;
        color: var(--text-color);
    }

    .content-preview:last-child {
        margin-bottom: 0;
    }

    .review-image {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: 8px;
    }

    .content-preview {
        font-size: 0.9rem;
        line-height: 1.4;
        color: var(--text-color);
        opacity: 0.8;
    }

    /* Submit Button */
    .submit-btn {
        background: linear-gradient(135deg, hsl(140, 60%, 40%), hsl(140, 60%, 50%));
        border: none;
        border-radius: 12px;
        padding: 12px 32px;
        font-weight: 600;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        color: white;
    }

    .submit-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px hsla(140, 60%, 40%, 0.4);
        background: linear-gradient(135deg, hsl(140, 60%, 45%), hsl(140, 60%, 55%));
    }

    .submit-btn:disabled {
        opacity: 0.6;
        transform: none;
        box-shadow: none;
    }

    /* Buttons */
    .btn-primary {
        background: linear-gradient(135deg, var(--primary-color), hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 10%)));
        border: none;
        color: white;
        transition: all 0.3s ease;
        border-color: var(--primary-color);
    }

    .btn-primary:hover,
    .btn-primary:focus {
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

    .btn-outline-secondary {
        border-color: hsl(var(--primary-hue), 25%, 20%);
        color: var(--text-color);
        background: hsl(var(--primary-hue), 15%, 12%);
        transition: all 0.3s ease;
    }

    .btn-outline-secondary:hover,
    .btn-outline-secondary:focus {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: white;
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

    /* Step Navigation */
    .step-navigation {
        margin-top: 2rem;
        padding-top: 1.5rem;
    }

    /* Editor Container */
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

    /* Alert Styles */
    .alert {
        border: none;
        border-radius: 12px;
        background: hsl(var(--primary-hue), 15%, 12%);
        color: var(--text-color);
        border-left: 4px solid;
    }

    .alert-danger {
        border-left-color: hsl(0, 70%, 50%);
        background: hsl(0, 70%, 10%);
        color: hsl(0, 70%, 80%);
    }

    .alert-info {
        border-left-color: hsl(200, 70%, 50%);
        background: hsl(200, 70%, 10%);
        color: hsl(200, 70%, 80%);
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

    .upload-footer {
        margin-top: 3rem;
        padding-top: 2rem;
        border-top: 1px solid var(--border-color);
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

    .alert-link {
        color: inherit !important;
        text-decoration: underline;
        opacity: 0.9;
    }

    .alert-link:hover {
        opacity: 1;
    }

    /* Input group text */
    .input-group-text {
        background: hsl(var(--primary-hue), 15%, 12%);
        border-color: hsl(var(--primary-hue), 25%, 20%);
        color: var(--text-color);
    }

    /* Mobile Responsiveness */
    @media (max-width: 768px) {
        .content-type-btn {
            min-height: 100px !important;
        }

        .content-type-content i {
            font-size: 1.5rem !important;
        }

        .step-number {
            width: 35px;
            height: 35px;
            font-size: 0.9rem;
        }

        .upload-zone {
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

        .step-navigation .submit-section {
            flex: 0 0 auto;
            min-width: 200px;
        }

        .step-navigation .submit-section button {
            width: 100%;
            min-height: 48px;
        }

        .form-floating > label {
            font-size: 0.9rem;
            text-align: left !important;
        }

        .tag-pill {
            font-size: 0.85rem;
            padding: 6px 10px;
        }

        .review-card {
            padding: 1rem;
        }

        .preview-image {
            max-height: 150px;
        }
    }

    @media (max-width: 576px) {
        .upload-zone {
            padding: 1rem 0.5rem;
        }

        .content-type-btn {
            min-height: 80px !important;
            padding: 0.75rem;
        }

        .step-header h3 {
            font-size: 1.2rem;
        }

        .btn-lg {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
        }
    }

    /* Animations */
    @keyframes gradientShift {
        0%, 100% {
            background-position: 0 50%;
        }
        50% {
            background-position: 100% 50%;
        }
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.7;
        }
    }

    /* Loading States */
    .spinner-border-sm {
        width: 1rem;
        height: 1rem;
        border-color: var(--primary-color);
        border-right-color: transparent;
    }

    /* Accessibility improvements */
    .form-control-modern:focus {
        outline: none;
    }

    button:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
    }
</style>