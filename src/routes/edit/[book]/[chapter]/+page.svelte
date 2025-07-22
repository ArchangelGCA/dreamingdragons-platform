<script>
    import Editor from "@tinymce/tinymce-svelte";
    import {toast} from "$lib/components/svelte-toast";
    import {deserialize} from "$app/forms";
    import { tooltip } from "@svelte-plugins/tooltips";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";
    import autoAnimate from '@formkit/auto-animate';
    import {invalidateAll} from "$app/navigation";
    import {conf} from "$lib/utils/gcatinymce.js";

    /** @type {{data: any}} */
    let { data } = $props();

    let { chapter, books } = $state(data);
    $effect(() => {
        ({ chapter, books } = data);
    });

    // Step-by-step UI state
    let currentStep = $state(1);
    let totalSteps = $state(3);

    // Form state
    let formData = $state({
        title: '',
        content: '',
        selectedBook: ''
    });

    // Tag handling state
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
        return formData.title.trim().length > 0 && formData.selectedBook;
    }

    function validateStep2() {
        return formData.content && formData.content.trim().length > 0;
    }

    function validateStep3() {
        return true; // Tags are optional
    }

    // Initialize form data from chapter
    $effect(() => {
        if (chapter) {
            formData.title = chapter.title || '';
            formData.content = chapter.text || '';
            formData.selectedBook = chapter.book_id || '';
            tags = chapter.chapter_tags ? chapter.chapter_tags.map(tag => tag.tags.name) : [];
        }
    });

    async function handleEdit(event) {
        event.preventDefault();

        if (editActive) return;

        editActive = true;
        isUploading = true;
        uploadProgress = 0;

        const formDataToSend = new FormData();
        formDataToSend.append('chapterId', chapter.id);
        formDataToSend.append('bookId', chapter.book_id);
        formDataToSend.append('title', formData.title);
        formDataToSend.append('content', formData.content);
        formDataToSend.append('book', formData.selectedBook);
        formDataToSend.append('tags', tags.join(','));

        const toastId = toast.push('Saving chapter...', {
            duration: 600000,
            theme: {
                '--toastBackground': '#ffcc00',
                '--toastColor': '#000'
            }
        });

        try {
            const response = await fetch('?/editchapter', {
                method: 'POST',
                body: formDataToSend,
            });

            toast.pop(toastId);

            const result = deserialize(await response.text());
            
            if (result.type === 'success') {
                if (result.data.status === 200) {
                    // Use the current chapter data to build SEO-friendly URL
                    const chapterUrl = `/content/${chapter.book_id}/${chapter.id}`;

                    toast.push(result.data.body.message + '. View it <a class="link-light" href="' + chapterUrl + '" target="_blank">here</a>.', {
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
            selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
        } else if (e.key === 'Tab' && suggestions.length > 0) {
            e.preventDefault();
            const tagToAdd = selectedSuggestionIndex >= 0 ? suggestions[selectedSuggestionIndex] : suggestions[0];
            if (tags.includes(tagToAdd)) {
                toast.push('Tag already added', {
                    theme: {
                        '--toastBackground': '#ffcc00',
                        '--toastColor': '#000'
                    }
                });
                return;
            }
            tags = [...tags, tagToAdd];
            e.target.value = '';
            suggestions = [];
            inputTag = '';
            selectedSuggestionIndex = -1;
        } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
            e.preventDefault();
            const tagToAdd = suggestions[selectedSuggestionIndex];
            if (tags.includes(tagToAdd)) {
                toast.push('Tag already added', {
                    theme: {
                        '--toastBackground': '#ffcc00',
                        '--toastColor': '#000'
                    }
                });
                return;
            }
            tags = [...tags, tagToAdd];
            e.target.value = '';
            suggestions = [];
            inputTag = '';
            selectedSuggestionIndex = -1;
        } else if (e.key === ' ' || e.key === ',' || e.key === 'Enter') {
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
                    e.target.value = '';
                    return;
                }
                tags = [...tags, tag];
                e.target.value = '';
                suggestions = [];
                inputTag = '';
                selectedSuggestionIndex = -1;
            }
        } else {
            inputTag = e.target.value.trim();
            selectedSuggestionIndex = -1;
            
            // Debounce tag suggestions
            clearTimeout(tagSuggestionTimer);
            tagSuggestionTimer = setTimeout(() => {
                if (inputTag) {
                    fetchTags(inputTag);
                } else {
                    suggestions = [];
                }
            }, 300);
        }
    }

    async function fetchTags(tag) {
        if (!tag) {
            suggestions = [];
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('tag', tag);

            const response = await fetch('?/tagsuggestions', {
                method: 'POST',
                body: formDataToSend,
            });

            const result = deserialize(await response.text());
            if (result.type === 'success') {
                if (result.data.status === 200) {
                    suggestions = result.data.body.map(tag => tag.name).filter(suggestion => !tags.includes(suggestion));
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
            console.error('Error fetching tag suggestions:', error);
            suggestions = [];
        }
    }

    function removeTag(e) {
        const tag = e.target.value;
        tags = tags.filter(t => t !== tag);
        suggestions = [];
        inputTag = '';
        selectedSuggestionIndex = -1;
    }
</script>

<div class="container-xxl px-0 px-md-3 mt-4 mb-5">
    <!-- Header -->
    <div class="row text-center mb-4">
        <div class="col">
            <div class="edit-header rounded-4 py-4 mb-3">
                <h1 class="h2 fw-bold mb-2 text-white">
                    <i class="fas fa-edit me-2"></i>Edit Chapter
                </h1>
                <p class="lead text-white-50 mb-0">Update your chapter details, content, and tags</p>
            </div>
        </div>
    </div>

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
                                        onclick={() => validateStep2() && goToStep(3)}>
                                    <div class="step-number">3</div>
                                    <div class="step-label">Tags & Review</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Form Content -->
                <form method="POST" enctype="multipart/form-data" action="?/editchapter" onsubmit={handleEdit} use:autoAnimate>
                    <!-- Step 1: Basic Info -->
                    {#if currentStep === 1}
                        <div class="form-step step-1">
                            <div class="step-header mb-4">
                                <h3 class="h4 fw-bold mb-2">
                                    <i class="fas fa-info-circle me-2 text-primary"></i>Chapter Details
                                </h3>
                                <p class="text-muted">Set up the basic information for your chapter</p>
                            </div>
                            
                            <div class="row g-4">
                                <div class="col-12">
                                    <div class="form-floating">
                                        <select 
                                            class="form-control form-control-modern bg-dark"
                                            id="book-select"
                                            bind:value={formData.selectedBook} 
                                            required
                                        >
                                            <option value="" disabled>Select a tale...</option>
                                            {#each books as book (book.id)}
                                                <option class="option-custom" value={book.id}>{book.title}</option>
                                            {/each}
                                        </select>
                                        <label for="book-select">
                                            <i class="fas fa-book me-2"></i>Target Tale
                                        </label>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <div class="form-floating">
                                        <input 
                                            type="text" 
                                            class="form-control form-control-modern" 
                                            id="chapter-title"
                                            placeholder="Enter chapter title" 
                                            bind:value={formData.title} 
                                            required
                                        >
                                        <label for="chapter-title">
                                            <i class="fas fa-heading me-2"></i>Chapter Title
                                        </label>
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
                                    <i class="fas fa-edit me-2 text-primary"></i>Chapter Content
                                </h3>
                                <p class="text-muted">Write and edit your chapter content</p>
                            </div>

                            <div class="row">
                                <div class="col-12">
                                    <div class="editor-container">
                                        <Editor 
                                            {conf}
                                            scriptSrc="../../../tinymce/tinymce.min.js"
                                            bind:value={formData.content}
                                        />
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
                                <button type="button"
                                        class="btn btn-primary btn-lg"
                                        onclick={nextStep}
                                        disabled={!validateStep2()}>
                                    Next<i class="fas fa-chevron-right ms-2"></i>
                                </button>
                            </div>
                        </div>
                    {/if}

                    <!-- Step 3: Tags & Review -->
                    {#if currentStep === 3}
                        <div class="form-step step-3">
                            <div class="step-header mb-4">
                                <h3 class="h4 fw-bold mb-2">
                                    <i class="fas fa-tags me-2 text-primary"></i>Tags & Final Review
                                </h3>
                                <p class="text-muted">Add tags and review your chapter before saving</p>
                            </div>

                            <div class="row">
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
                                                <strong>Tale:</strong>
                                                <p class="mb-2">
                                                    {#each books as book (book.id)}
                                                        {#if book.id === formData.selectedBook}
                                                            {book.title}
                                                        {/if}
                                                    {/each}
                                                </p>
                                                <strong>Title:</strong>
                                                <p class="mb-2">{formData.title || 'Untitled Chapter'}</p>
                                            </div>
                                            <div class="col-md-6">
                                                <strong>Content Length:</strong>
                                                <p class="mb-2">{formData.content ? formData.content.replace(/<[^>]*>/g, '').trim().length : 0} characters</p>
                                                <strong>Tags:</strong>
                                                <p class="mb-0">{tags.length > 0 ? tags.join(', ') : 'No tags'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Step Navigation -->
                            <div class="step-navigation mt-1 d-flex justify-content-between">
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

                    <!-- Legal Notice -->
                    <div class="legal-notice mt-4 text-center">
                        <p class="text-muted small mb-0">
                            By updating your chapter, you agree to our 
                            <a href="/legal/tos" target="_blank" class="link-secondary">terms of service</a> 
                            and 
                            <a href="/legal/privacy-policy" target="_blank" class="link-secondary">privacy policy</a>.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>
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

    /* Form container styling matching book edit page */
    .edit-form-container {
        background: linear-gradient(145deg, rgba(15, 15, 35, 0.9), rgba(30, 30, 60, 0.8));
        border: 1px solid rgba(92, 0, 166, 0.2);
        border-radius: 20px;
        padding: 2rem;
        backdrop-filter: blur(20px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    /* Progress bar styling */
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

    /* Step indicators */
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

    /* Form step styling */
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

    /* Input group styling for tag input */
    .input-group-text {
        background: rgba(92, 0, 166, 0.2);
        border: 2px solid rgba(92, 0, 166, 0.3);
        border-left: none;
        color: #a78bfa;
    }

    .input-group .form-control-modern {
        border-right: none;
    }

    .input-group .form-control-modern:focus {
        z-index: 3;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .edit-form-container {
            padding: 1.5rem;
        }

        .form-step {
            padding: 1.5rem;
        }

        .step-navigation {
            gap: 0.5rem;
        }

        .step-navigation .btn {
            flex: 1;
        }

        .step-navigation .d-flex {
            flex: 1;
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

    /* Loading spinner */
    .spinner-border-sm {
        width: 1rem;
        height: 1rem;
        border-width: 0.125rem;
    }
</style>