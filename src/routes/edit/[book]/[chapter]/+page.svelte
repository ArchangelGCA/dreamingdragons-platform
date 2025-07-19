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
                    const chapterUrl = '/content/' + chapter.book_id + "/" + chapter.id;

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

<div class="container-md mt-4 mb-3">
    <div class="row text-center">
        <div class="col px-0">
            <p class="h1 rounded-4 animate-background py-2">Edit Chapter</p>
        </div>
    </div>

    <!-- Progress Steps -->
    <div class="row mt-4 mb-3">
        <div class="col">
            <div class="progress-container">
                <button 
                    type="button"
                    class="progress-step {currentStep >= 1 ? 'active' : ''}" 
                    onclick={() => goToStep(1)}
                >
                    <div class="step-number">1</div>
                    <div class="step-title">Basic Info</div>
                </button>
                <div class="progress-line {currentStep > 1 ? 'active' : ''}"></div>
                <button 
                    type="button"
                    class="progress-step {currentStep >= 2 ? 'active' : ''}" 
                    onclick={() => goToStep(2)}
                >
                    <div class="step-number">2</div>
                    <div class="step-title">Content</div>
                </button>
                <div class="progress-line {currentStep > 2 ? 'active' : ''}"></div>
                <button 
                    type="button"
                    class="progress-step {currentStep >= 3 ? 'active' : ''}" 
                    onclick={() => goToStep(3)}
                >
                    <div class="step-number">3</div>
                    <div class="step-title">Tags & Review</div>
                </button>
            </div>
        </div>
    </div>

    <div class="row mt-3 mx-0 justify-content-center text-center">
        <div class="col px-0">
            <form method="POST" enctype="multipart/form-data" action="?/editchapter" onsubmit={handleEdit}>
                <!-- Step 1: Basic Info -->
                {#if currentStep === 1}
                    <div class="step-content" use:autoAnimate>
                        <div class="row">
                            <div class="col-12 rounded-3 px-0 mb-3">
                                <p class="fs-5 text-start mb-2 ms-1"><i class="fas fa-book"></i> Target Tale</p>
                                <div class="form-floating" use:tooltip={{...tooltipConfig}} title="Select the tale this chapter belongs to">
                                    <select 
                                        class="form-select form-select-lg form-select-custom" 
                                        id="book-select"
                                        bind:value={formData.selectedBook} 
                                        required
                                    >
                                        <option value="" disabled>Select a tale...</option>
                                        {#each books as book (book.id)}
                                            <option class="option-custom" value={book.id}>{book.title}</option>
                                        {/each}
                                    </select>
                                    <label for="book-select"><i class="fas fa-book"></i> Tale</label>
                                </div>
                            </div>
                            <div class="col-12 rounded-3 mb-2 px-0">
                                <div class="form-floating" use:tooltip={{...tooltipConfig}} title="Enter the chapter title">
                                    <input 
                                        type="text" 
                                        class="form-control form-control-lg form-control-custom" 
                                        id="chapter-title"
                                        placeholder="Chapter Title" 
                                        bind:value={formData.title} 
                                        required
                                    >
                                    <label for="chapter-title" class="form-label"><i class="fas fa-heading"></i> Chapter Title</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row mt-3">
                            <div class="col-12 d-flex justify-content-between px-0">
                                <div></div> <!-- Empty div for spacing -->
                                <button 
                                    type="button" 
                                    class="btn btn-lg animate-button"
                                    onclick={nextStep}
                                    disabled={!validateStep1()}
                                >
                                    Next: Content <i class="fas fa-arrow-right ms-2"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                {/if}

                <!-- Step 2: Content -->
                {#if currentStep === 2}
                    <div class="step-content" use:autoAnimate>
                        <div class="row">
                            <div class="col-12 px-0 mb-3">
                                <p class="fs-5 text-start mb-2 ms-1"><i class="fas fa-edit"></i> Chapter Content</p>
                                <Editor 
                                    {conf}
                                    scriptSrc="../../../tinymce/tinymce.min.js"
                                    bind:value={formData.content}
                                />
                            </div>
                        </div>
                        
                        <div class="row mt-3">
                            <div class="col-12 d-flex justify-content-between px-0">
                                <button 
                                    type="button" 
                                    class="btn btn-lg btn-outline-secondary"
                                    onclick={prevStep}
                                >
                                    <i class="fas fa-arrow-left me-2"></i> Back
                                </button>
                                <button 
                                    type="button" 
                                    class="btn btn-lg animate-button"
                                    onclick={nextStep}
                                    disabled={!validateStep2()}
                                >
                                    Next: Tags & Review <i class="fas fa-arrow-right ms-2"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                {/if}

                <!-- Step 3: Tags & Review -->
                {#if currentStep === 3}
                    <div class="step-content" use:autoAnimate>
                        <div class="row">
                            <div class="col-12 mt-2 px-0 rounded-3 mb-3">
                                <p class="fs-6 text-start mb-2 ms-1"><i class="fas fa-tags"></i> Tags (Optional):</p>
                                <div class="tag-input-container" use:autoAnimate use:tooltip={{...tooltipConfig}} title="Use space, comma, or enter to add tags. Use arrow keys to navigate suggestions.">
                                    <div class="tags-display">
                                        {#each tags as tag, index (tag)}
                                            <div class="badge tag-custom rounded-4 pe-2 my-auto me-1 mb-1">
                                                <span>{tag}</span>
                                                <button class="button-tags text-danger-emphasis ms-1" type="button" onclick={removeTag} value={tag}>×</button>
                                            </div>
                                        {/each}
                                    </div>
                                    <div class="tag-input-wrapper">
                                        <input 
                                            class="input-tags" 
                                            type="text" 
                                            bind:value={inputTag} 
                                            placeholder={tags.length === 0 ? "Add tags (optional)" : "Add more tags..."} 
                                            onkeydown={addTag} 
                                            onkeyup={addTag}
                                        />
                                        {#if suggestions.length > 0}
                                            <div class="suggestions-dropdown">
                                                {#each suggestions as suggestion, index (suggestion)}
                                                    <button 
                                                        class="suggestion-item {index === selectedSuggestionIndex ? 'selected' : ''}" 
                                                        type="button"
                                                        onclick={addTag} 
                                                        value={suggestion}
                                                    >
                                                        {suggestion}
                                                    </button>
                                                {/each}
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            </div>

                            <!-- Review Summary -->
                            <div class="col-12 px-0 mb-3">
                                <div class="review-summary">
                                    <h5 class="mb-3"><i class="fas fa-eye"></i> Review Your Chapter</h5>
                                    <div class="summary-item">
                                        <strong>Tale:</strong> 
                                        {#each books as book (book.id)}
                                            {#if book.id === formData.selectedBook}
                                                {book.title}
                                            {/if}
                                        {/each}
                                    </div>
                                    <div class="summary-item">
                                        <strong>Title:</strong> {formData.title || 'Untitled Chapter'}
                                    </div>
                                    <div class="summary-item">
                                        <strong>Content Length:</strong> {formData.content ? formData.content.replace(/<[^>]*>/g, '').trim().length : 0} characters
                                    </div>
                                    <div class="summary-item">
                                        <strong>Tags:</strong> {tags.length > 0 ? tags.join(', ') : 'No tags'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row mt-3">
                            <div class="col-12 d-flex justify-content-between px-0">
                                <button 
                                    type="button" 
                                    class="btn btn-lg btn-outline-secondary"
                                    onclick={prevStep}
                                >
                                    <i class="fas fa-arrow-left me-2"></i> Back
                                </button>
                                <button 
                                    type="submit" 
                                    class="btn btn-lg animate-button" 
                                    disabled={editActive || !validateStep1() || !validateStep2()}
                                    use:tooltip={{...tooltipConfig}} 
                                    title="Click to save your changes"
                                >
                                    {#if editActive}
                                        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Saving...
                                    {:else}
                                        <i class="fas fa-save me-2"></i> Save Changes
                                    {/if}
                                </button>
                            </div>
                        </div>
                    </div>
                {/if}

                <div class="col-12 mt-4 px-0 rounded-3">
                    <p class="text-secondary text-center mb-0">By submitting, you agree to our <a href="/legal/tos" target="_blank" class="link-secondary text-decoration-none">terms of service</a> and <a href="/legal/privacy-policy" target="_blank" class="link-secondary text-decoration-none">privacy policy</a>.</p>
                </div>
            </form>
        </div>
    </div>
</div>

<style>
    /* Progress Steps Styling */
    .progress-container {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px 0;
    }

    .progress-step {
        all: unset;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background: none;
        border: none;
    }

    .progress-step.active .step-number {
        background: linear-gradient(45deg, #5c00a6, #0b0086);
        color: #fff;
        box-shadow: 0 0 10px rgba(92, 0, 166, 0.5);
    }

    .step-number {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        color: #999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin-bottom: 8px;
        transition: all 0.3s ease;
    }

    .step-title {
        font-size: 0.9rem;
        color: #999;
        text-align: center;
        transition: color 0.3s ease;
    }

    .progress-step.active .step-title {
        color: #dcd6f7;
    }

    .progress-line {
        width: 80px;
        height: 2px;
        background: rgba(255, 255, 255, 0.1);
        margin: 0 10px;
        transition: background 0.3s ease;
    }

    .progress-line.active {
        background: linear-gradient(90deg, #5c00a6, #0b0086);
    }

    /* Step content styling */
    .step-content {
        min-height: 400px;
    }

    /* Review summary styling */
    .review-summary {
        background: rgba(92, 0, 166, 0.1);
        border: 1px solid rgba(92, 0, 166, 0.3);
        border-radius: 12px;
        padding: 20px;
        text-align: left;
    }

    .summary-item {
        margin-bottom: 10px;
        font-size: 0.95rem;
    }

    .summary-item:last-child {
        margin-bottom: 0;
    }

    /* Tag input styling */
    .tag-input-container {
        background: linear-gradient(45deg, rgba(92, 0, 166, 0.1), rgba(11, 0, 134, 0.1));
        border: 1px solid rgba(92, 0, 166, 0.3);
        border-radius: 12px;
        padding: 12px;
        position: relative;
    }

    .tags-display {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 8px;
    }

    .tag-input-wrapper {
        position: relative;
        width: 100%;
    }

    .input-tags {
        all: unset;
        width: 100%;
        padding: 8px;
        color: #dcd6f7;
        font-size: 1rem;
    }

    .input-tags::placeholder {
        color: rgba(220, 214, 247, 0.6);
    }

    .suggestions-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: linear-gradient(45deg, rgb(47, 0, 89), rgb(25, 0, 45));
        border: 1px solid rgba(92, 0, 166, 0.5);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        max-height: 200px;
        overflow-y: auto;
    }

    .suggestion-item {
        all: unset;
        display: block;
        width: 100%;
        padding: 10px 12px;
        color: #dcd6f7;
        cursor: pointer;
        transition: background-color 0.2s ease;
        text-align: left;
    }

    .suggestion-item:hover,
    .suggestion-item.selected {
        background-color: rgba(92, 0, 166, 0.5);
    }

    .suggestion-item:first-child {
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
    }

    .suggestion-item:last-child {
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
    }

    /* Existing styles with improvements */
    .animate-button {
        background: linear-gradient(270deg, #0b0086, #5c00a6);
        background-size: 200% 200%;
        animation: Gradient 10s ease infinite;
        border: none;
        color: #fff;
        transition: all 0.3s ease;
    }

    .animate-button:hover:not(:disabled) {
        box-shadow: 0 0 18px #5c00a6;
        background: linear-gradient(270deg, #0b0086, #5c00a6);
        background-size: 200% 200%;
        animation: Gradient 1.5s ease infinite;
        transform: translateY(-2px);
    }

    .animate-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    .animate-background {
        background: linear-gradient(270deg, #0b0086, #5c00a6);
        background-size: 200% 200%;
        animation: Gradient 10s ease infinite;
        color: #fff;
    }

    .form-control-custom {
        background: linear-gradient(45deg, rgba(92, 0, 166, 0.65), rgb(11, 0, 134));
        color: #dcd6f7;
        border: 1px solid rgba(92, 0, 166, 0.3);
        border-radius: 8px;
        transition: all 0.3s ease;
    }

    .form-control-custom:hover {
        background: linear-gradient(45deg, rgba(92, 0, 166, 0.75), rgb(11, 0, 134));
        border-color: rgba(92, 0, 166, 0.5);
    }

    .form-control-custom:focus {
        outline: none;
        box-shadow: 0 0 0 0.2rem rgba(92, 0, 166, 0.25);
        background: linear-gradient(45deg, rgba(92, 0, 166, 0.8), rgb(11, 0, 134));
        border-color: #5c00a6;
        color: #fff;
    }

    .form-control-custom::placeholder {
        color: rgba(220, 214, 247, 0.6);
    }

    .form-select-custom {
        background: linear-gradient(45deg, rgba(92, 0, 166, 0.65), rgb(11, 0, 134));
        color: #dcd6f7;
        border: 1px solid rgba(92, 0, 166, 0.3);
        border-radius: 8px;
        transition: all 0.3s ease;
    }

    .form-select-custom:hover {
        background: linear-gradient(45deg, rgba(92, 0, 166, 0.75), rgb(11, 0, 134));
        border-color: rgba(92, 0, 166, 0.5);
    }

    .form-select-custom:focus {
        outline: none;
        box-shadow: 0 0 0 0.2rem rgba(92, 0, 166, 0.25);
        background: linear-gradient(45deg, rgba(92, 0, 166, 0.8), rgb(11, 0, 134));
        border-color: #5c00a6;
        color: #fff;
    }

    .tag-custom {
        background: linear-gradient(45deg, rgba(92, 0, 166, 0.86), rgba(11, 0, 134, 0.86));
        color: #dcd6f7;
        border: 1px solid rgba(92, 0, 166, 0.5);
        transition: all 0.3s ease;
        font-size: 0.85rem;
    }

    .tag-custom:hover {
        background: linear-gradient(45deg, rgba(92, 0, 166, 0.95), rgba(11, 0, 134, 0.95));
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(92, 0, 166, 0.3);
    }

    .option-custom {
        background-color: rgb(47, 0, 89);
        color: #dcd6f7;
    }

    .button-tags {
        all: unset;
        color: #ff6b6b;
        cursor: pointer;
        font-weight: bold;
        font-size: 1.1rem;
        transition: color 0.2s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
    }

    .button-tags:hover {
        color: #ff4757;
        transform: scale(1.2);
    }

    .btn-outline-secondary {
        border-color: rgba(92, 0, 166, 0.5);
        color: #dcd6f7;
        background: transparent;
    }

    .btn-outline-secondary:hover {
        background: rgba(92, 0, 166, 0.2);
        border-color: #5c00a6;
        color: #fff;
    }

    /* Loading spinner */
    .spinner-border-sm {
        width: 1rem;
        height: 1rem;
        border-width: 0.125rem;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
        .progress-container {
            padding: 15px 0;
        }

        .step-title {
            font-size: 0.8rem;
        }

        .progress-line {
            width: 40px;
            margin: 0 5px;
        }

        .step-number {
            width: 35px;
            height: 35px;
            font-size: 0.9rem;
        }

        .step-content {
            min-height: 300px;
        }
    }

    @keyframes Gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
</style>