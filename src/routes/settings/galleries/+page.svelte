<script>
    import {onMount} from 'svelte';
    import {invalidateAll} from '$app/navigation';
    import {toast} from '$lib/components/svelte-toast/index.js';
    import {deserialize} from '$app/forms';
    import autoAnimate from "@formkit/auto-animate";

    import {fly, scale} from 'svelte/transition';

    let {data} = $props();

    let galleries = $derived(data.galleries || []);
    let userBooks = $derived(data.userBooks || []);
    let profile = $derived(data.profile);
    let image_proxy = $derived(data.image_proxy);
    let galleryParam = $derived(data.galleryParam);

    function getOptimizedImageUrl(url, width = 300, quality = 80) {
        if (!url || url === '') return '/favicon.webp';
        if (!image_proxy || url.startsWith(image_proxy)) return url;
        return `${image_proxy}${url}?width=${width}&quality=${quality}`;
    }

    let selectedGallery = $state(null);
    let selectedGalleryId = $state(null);
    let newGallery = $state({id: null, name: '', description: ''});
    let isLoading = $state(false);
    let searchBooks = $state('');
    let searchTimeout = null;

    function handleSearchInput(event) {
        const value = event.target.value;
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchBooks = value;
        }, 300);
    }

    let imageLoadingStates = $state({});

    let availableBooks = $derived.by(() => {
        if (!selectedGallery) return userBooks.filter((_, index) => {
            return searchBooks === '' ? index < 20 :
                userBooks[index].title.toLowerCase().includes(searchBooks.toLowerCase());
        });

        const galleryBookIds = new Set(selectedGallery.gallery_books.map(gb => gb.book_id));
        const filtered = userBooks.filter(book => !galleryBookIds.has(book.id));

        if (searchBooks === '') return filtered;

        const searchLower = searchBooks.toLowerCase();
        return filtered.filter(book => book.title.toLowerCase().includes(searchLower));
    });

    onMount(() => {
        function handleKeydown(event) {
            if (event.key === 'Escape' && selectedGallery) {
                selectGallery(null);
            }
        }

        window.addEventListener('keydown', handleKeydown);

        // Check for gallery parameter from server data
        if (galleryParam && galleries.length > 0) {
            const galleryId = parseInt(galleryParam, 10);
            const targetGallery = galleries.find(g => g.id === galleryId);
            if (targetGallery) {
                selectGallery(targetGallery);
            }
        }

        return () => {
            window.removeEventListener('keydown', handleKeydown);
            if (searchTimeout) clearTimeout(searchTimeout);
        };
    });

    function selectGallery(g) {
        if (g) {
            selectedGallery = {...g};
            selectedGalleryId = g.id;
        } else {
            selectedGallery = null;
            selectedGalleryId = null;
            newGallery = {id: null, name: '', description: ''};
        }
        searchBooks = '';
    }

    $effect(() => {
        if (selectedGalleryId && galleries.length > 0) {
            const updatedGallery = galleries.find(g => g.id === selectedGalleryId);
            if (updatedGallery) {
                selectedGallery = {...updatedGallery};
            } else {
                selectGallery(null);
            }
        }
    });

    function updateLocalGalleryData(galleryId, updater) {
        const galleryIndex = galleries.findIndex(g => g.id === galleryId);
        if (galleryIndex !== -1) {
            invalidateAll();
        }
    }

    async function handleSaveGallery(e) {
        e.preventDefault();

        if (isLoading) return;
        isLoading = true;

        const galleryToSave = selectedGallery || newGallery;
        const isNew = !galleryToSave.id;

        const formData = new FormData();
        if (galleryToSave.id) {
            formData.append('id', galleryToSave.id);
        }
        formData.append('name', galleryToSave.name);
        formData.append('description', galleryToSave.description);

        try {
            const response = await fetch('?/saveGallery', {
                method: 'POST',
                body: formData
            });

            const result = deserialize(await response.text());

            if (result.type === 'success') {
                toast.push('Gallery saved successfully!', {
                    theme: {
                        '--toastBackground': '#4caf50',
                        '--toastColor': '#fff'
                    }
                });
                await invalidateAll();
                if (isNew) {
                    selectedGalleryId = result.data.body.id;
                }
            } else {
                toast.push(result.data?.message || 'Error saving gallery', {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
            }
        } catch (error) {
            console.error('Error saving gallery:', error);
            toast.push('Error saving gallery', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        } finally {
            isLoading = false;
        }
    }

    async function handleDeleteGallery() {
        if (!selectedGallery?.id) return;

        if (!confirm('Are you sure you want to delete this gallery? This action cannot be undone.')) {
            return;
        }

        const formData = new FormData();
        formData.append('id', selectedGallery.id);

        try {
            const response = await fetch('?/deleteGallery', {
                method: 'POST',
                body: formData
            });

            const result = deserialize(await response.text());

            if (result.type === 'success') {
                toast.push('Gallery deleted successfully!', {
                    theme: {
                        '--toastBackground': '#4caf50',
                        '--toastColor': '#fff'
                    }
                });
                selectGallery(null);
                await invalidateAll();
            } else {
                toast.push(result.data?.message || 'Error deleting gallery', {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
            }
        } catch (error) {
            console.error('Error deleting gallery:', error);
            toast.push('Error deleting gallery', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        }
    }

    async function handleAddBook(bookId) {
        if (!selectedGallery?.id || !bookId || isLoading) return;

        const isAlreadyInGallery = selectedGallery.gallery_books.some(gb => gb.book_id === bookId);
        if (isAlreadyInGallery) {
            toast.push('Book is already in this gallery', {
                theme: {
                    '--toastBackground': '#ff9800',
                    '--toastColor': '#fff'
                }
            });
            return;
        }

        isLoading = true;

        const formData = new FormData();
        formData.append('gallery_id', selectedGallery.id);
        formData.append('book_id', bookId);

        try {
            const response = await fetch('?/addBookToGallery', {
                method: 'POST',
                body: formData
            });

            const result = deserialize(await response.text());

            if (result.type === 'success') {
                toast.push('Book added to gallery!', {
                    theme: {
                        '--toastBackground': '#4caf50',
                        '--toastColor': '#fff'
                    }
                });
                updateLocalGalleryData(selectedGallery.id);
            } else {
                toast.push(result.data?.message || 'Error adding book to gallery', {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
            }
        } catch (error) {
            console.error('Error adding book:', error);
            toast.push('Error adding book to gallery', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        } finally {
            isLoading = false;
        }
    }

    async function handleRemoveBook(bookId) {
        if (!selectedGallery?.id || isLoading) return;

        isLoading = true;

        const formData = new FormData();
        formData.append('gallery_id', selectedGallery.id);
        formData.append('book_id', bookId);

        try {
            const response = await fetch('?/removeBookFromGallery', {
                method: 'POST',
                body: formData
            });

            const result = deserialize(await response.text());

            if (result.type === 'success') {
                toast.push('Book removed from gallery!', {
                    theme: {
                        '--toastBackground': '#4caf50',
                        '--toastColor': '#fff'
                    }
                });
                // Update local data
                updateLocalGalleryData(selectedGallery.id);
            } else {
                toast.push(result.data?.message || 'Error removing book from gallery', {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': '#fff'
                    }
                });
            }
        } catch (error) {
            console.error('Error removing book:', error);
            toast.push('Error removing book from gallery', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        } finally {
            isLoading = false;
        }
    }

</script>

<svelte:head>
    <title>Manage Galleries - {profile.username}</title>
</svelte:head>

<div class="container p-1 p-lg-2 mb-4">
    <div class="text-center mb-5 mt-3">
        <h1 class="galleries-title mb-2">
            <i class="fas fa-images me-3"></i>
            Manage Galleries
        </h1>
        <p class="galleries-subtitle mb-0">Organize and showcase your creative works</p>
    </div>

    <div class="galleries-layout">
        <!-- Sidebar - Galleries List -->
        <div class="galleries-sidebar">
            <button
                    class="btn btn-create-gallery mb-1"
                    onclick={() => selectGallery(null)}
                    type="button"
            >
                <i class="fas fa-plus me-2"></i>
                <span>Create New Gallery</span>
            </button>

            <div class="galleries-list pt-3" use:autoAnimate>
                {#if galleries.length === 0}
                    <div class="empty-state text-center py-4">
                        <i class="fas fa-images fa-3x text-muted mb-3"></i>
                        <p class="text-muted">No galleries yet</p>
                        <small class="text-muted">Create your first gallery to get started</small>
                    </div>
                {:else}
                    {#each galleries as gallery (gallery.id)}
                        <button
                                class="gallery-card"
                                class:active={selectedGallery?.id === gallery.id}
                                onclick={() => selectGallery(gallery)}
                                transition:scale={{ duration: 200, delay: galleries.indexOf(gallery) * 50 }}
                                aria-label="Select gallery {gallery.name}"
                                type="button"
                        >
                            <div class="gallery-card-header">
                                <h5 class="gallery-name">{gallery.name}</h5>
                                <span class="gallery-count">{gallery.gallery_books.length}</span>
                            </div>
                            <p class="gallery-description">{gallery.description || 'No description'}</p>
                            <div class="gallery-preview">
                                {#if gallery.gallery_books.length > 0}
                                    <div class="preview-images">
                                        {#each gallery.gallery_books.slice(0, 3) as gb, i}
                                            <img
                                                    src={getOptimizedImageUrl(gb.book.cover_url, 100)}
                                                    alt="Book cover preview"
                                                    class="preview-img"
                                                    style="z-index: {3-i}; transform: translateX({i * -8}px)"
                                                    loading="lazy"
                                            />
                                        {/each}
                                    </div>
                                {:else}
                                    <div class="preview-empty">
                                        <i class="fas fa-image"></i>
                                    </div>
                                {/if}
                            </div>
                        </button>
                    {/each}
                {/if}
            </div>
        </div>

        <!-- Main Content -->
        <div class="galleries-main">
            {#if selectedGallery}
                <div class="gallery-details" transition:fly={{ x: 20, duration: 300 }}>
                    <div class="gallery-details-header">
                        <div>
                            <h2 class="details-title">
                                <i class="fas fa-edit me-2"></i>
                                Manage Gallery: <span class="gallery-name-highlight">{selectedGallery.name}</span>
                            </h2>
                            <p class="details-subtitle">Customize your gallery settings and content</p>
                        </div>
                        <div class="header-actions">
                            <button
                                    class="btn btn-back-to-create"
                                    onclick={() => selectGallery(null)}
                                    data-tooltip="Back to Create Gallery"
                                    aria-label="Back to create gallery"
                                    type="button"
                            >
                                <i class="fas fa-plus"></i>
                            </button>
                            <button
                                    class="btn btn-delete-gallery"
                                    onclick={(e) => {
                                    e.preventDefault();
                                    handleDeleteGallery();
                                }}
                                    data-tooltip="Delete Gallery"
                                    aria-label="Delete gallery"
                                    type="button"
                            >
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    <form class="gallery-form" onsubmit={handleSaveGallery}>
                        <div class="gallery-stats-quick">
                            <div class="stat-quick">
                                <i class="fas fa-book"></i>
                                <span>{selectedGallery.gallery_books.length} {selectedGallery.gallery_books.length && selectedGallery.gallery_books.length >= 2 ? "tales" : "tale"}</span>
                            </div>
                            <div class="stat-quick">
                                <i class="fas fa-calendar"></i>
                                <span>Created {new Date(selectedGallery.created_at || Date.now()).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="galleryName" class="form-label">Gallery Name</label>
                            <input
                                    type="text"
                                    class="form-control"
                                    id="galleryName"
                                    bind:value={selectedGallery.name}
                                    placeholder="Enter gallery name..."
                                    required
                            />
                        </div>
                        <div class="form-group">
                            <label for="galleryDescription" class="form-label">Description</label>
                            <textarea
                                    class="form-control"
                                    id="galleryDescription"
                                    rows="3"
                                    bind:value={selectedGallery.description}
                                    placeholder="Describe your gallery..."
                            ></textarea>
                        </div>
                        <button type="submit" class="btn btn-save-gallery" disabled={isLoading}>
                            {#if isLoading}
                                <i class="fas fa-spinner fa-spin me-2"></i>
                                Saving...
                            {:else}
                                <i class="fas fa-save me-2"></i>
                                Save Changes
                            {/if}
                        </button>
                    </form>

                    <div class="section-divider">
                        <span>Gallery Content</span>
                    </div>

                    <div class="books-section" use:autoAnimate>
                        <h3 class="section-title">
                            <i class="fas fa-book me-2"></i>
                            Books in Gallery
                            <span class="count-badge">{selectedGallery.gallery_books.length}</span>
                        </h3>

                        {#if selectedGallery.gallery_books.length > 0}
                            <div class="books-grid" role="grid" aria-label="Books in gallery">
                                {#each selectedGallery.gallery_books.map(gb => gb.book) as book (book.id)}
                                    <div class="book-item" transition:scale={{ duration: 200 }} role="gridcell">
                                        <div class="book-cover-container">
                                            {#if !imageLoadingStates[book.id]}
                                                <div class="placeholder-glow">
                                                    <div class="placeholder bg-light-subtle rounded-3 w-100 h-100">
                                                        <img
                                                                src={getOptimizedImageUrl(book.cover_url)}
                                                                alt="Cover for {book.title}"
                                                                class="book-cover"
                                                                loading="lazy"
                                                                style="width: 1px; height: 1px;"
                                                                onload={() => imageLoadingStates[book.id] = true}
                                                        />
                                                    </div>
                                                </div>
                                            {:else}
                                                <img
                                                        src={getOptimizedImageUrl(book.cover_url)}
                                                        alt="Cover for {book.title}"
                                                        class="book-cover"
                                                        loading="lazy"
                                                />
                                            {/if}
                                            <div class="book-overlay">
                                                <button
                                                        class="btn btn-remove-book"
                                                        onclick={(e) => {
                                                        e.preventDefault();
                                                        handleRemoveBook(book.id);
                                                    }}
                                                        data-tooltip="Remove from gallery"
                                                        aria-label="Remove {book.title} from gallery"
                                                        type="button"
                                                        disabled={isLoading}
                                                >
                                                    {#if isLoading}
                                                        <i class="fas fa-spinner fa-spin"></i>
                                                    {:else}
                                                        <i class="fas fa-times"></i>
                                                    {/if}
                                                </button>
                                            </div>
                                        </div>
                                        <div class="book-info">
                                            <h6 class="book-title">{book.title}</h6>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            <div class="empty-gallery">
                                <i class="fas fa-images fa-3x mb-3"></i>
                                <h4>Empty Gallery</h4>
                                <p>This gallery doesn't have any Tale yet. Add some from the selection below.</p>
                            </div>
                        {/if}
                    </div>

                    <div class="section-divider">
                        <span>Add Content</span>
                    </div>

                    <div class="add-books-section">
                        <h3 class="section-title">
                            <i class="fas fa-plus-circle me-2"></i>
                            Add Tales to Gallery
                        </h3>

                        {#if userBooks.filter(ub => !selectedGallery.gallery_books.some(gb => gb.book_id === ub.id)).length > 0}
                            <div class="search-books-container">
                                <div class="form-group">
                                    <label for="searchBooks" class="form-label">Search Tales</label>
                                    <input
                                            type="text"
                                            class="form-control"
                                            id="searchBooks"
                                            oninput={handleSearchInput}
                                            placeholder="Search your tales to add..."
                                    />
                                </div>
                            </div>

                            <div class="books-grid" role="grid" aria-label="Available books to add">
                                {#each availableBooks as book (book.id)}
                                    <button
                                            class="book-item add-book-item"
                                            onclick={(e) => {
                                            e.preventDefault();
                                            handleAddBook(book.id);
                                        }}
                                            aria-label="Add {book.title} to gallery"
                                            type="button"
                                            role="gridcell"
                                            disabled={isLoading}
                                    >
                                        <div class="book-cover-container">
                                            {#if !imageLoadingStates[`add-${book.id}`]}
                                                <div class="placeholder-glow">
                                                    <div class="placeholder bg-light-subtle rounded-3 w-100 h-100">
                                                        <img
                                                                src={getOptimizedImageUrl(book.cover_url)}
                                                                alt="Cover for {book.title}"
                                                                class="book-cover"
                                                                loading="lazy"
                                                                style="width: 1px; height: 1px;"
                                                                onload={() => imageLoadingStates[`add-${book.id}`] = true}
                                                        />
                                                    </div>
                                                </div>
                                            {:else}
                                                <img
                                                        src={getOptimizedImageUrl(book.cover_url)}
                                                        alt="Cover for {book.title}"
                                                        class="book-cover"
                                                        loading="lazy"
                                                />
                                            {/if}
                                            <div class="book-overlay add-overlay">
                                                <div class="add-icon">
                                                    {#if isLoading}
                                                        <i class="fas fa-spinner fa-spin"></i>
                                                    {:else}
                                                        <i class="fas fa-plus"></i>
                                                    {/if}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="book-info">
                                            <h6 class="book-title">{book.title}</h6>
                                        </div>
                                    </button>
                                {/each}
                            </div>

                            {#if availableBooks.length === 0 && searchBooks !== ''}
                                <div class="no-search-results">
                                    <i class="fas fa-search fa-2x mb-2 text-muted"></i>
                                    <p>No tales found matching "{searchBooks}"</p>
                                    <button
                                            class="btn btn-secondary btn-sm"
                                            onclick={() => searchBooks = ''}
                                            type="button"
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            {/if}
                        {:else}
                            <div class="no-books-available">
                                <i class="fas fa-check-circle fa-2x mb-2 text-success"></i>
                                <p>All your tales are already in this gallery!</p>
                            </div>
                        {/if}
                    </div>
                </div>
            {:else}
                <div class="create-gallery-section" transition:fly={{ x: 20, duration: 300 }}>
                    <div class="create-gallery-content">
                        <div class="create-gallery-icon">
                            <i class="fas fa-images"></i>
                        </div>
                        <h2 class="create-title">Create a New Gallery</h2>
                        <p class="create-subtitle">Start organizing your creative works into beautiful collections</p>

                        <form class="create-gallery-form" onsubmit={handleSaveGallery}>
                            <div class="form-group">
                                <label for="newGalleryName" class="form-label">Gallery Name</label>
                                <input
                                        type="text"
                                        class="form-control"
                                        id="newGalleryName"
                                        bind:value={newGallery.name}
                                        placeholder="Enter a creative name for your gallery..."
                                        required
                                />
                            </div>
                            <div class="form-group">
                                <label for="newGalleryDescription" class="form-label">Description</label>
                                <textarea
                                        class="form-control"
                                        id="newGalleryDescription"
                                        rows="3"
                                        bind:value={newGallery.description}
                                        placeholder="What's this gallery about? Describe the theme or collection..."
                                ></textarea>
                            </div>
                            <button type="submit" class="btn btn-create-new" disabled={isLoading}>
                                {#if isLoading}
                                    <i class="fas fa-spinner fa-spin me-2"></i>
                                    Creating...
                                {:else}
                                    <i class="fas fa-magic me-2"></i>
                                    Create Gallery
                                {/if}
                            </button>
                        </form>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>

    .galleries-title {
        background: linear-gradient(135deg, var(--primary-color), hsl(290, 100%, 60%));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-size: 2.5rem;
        font-weight: 700;
    }

    .galleries-subtitle {
        color: hsla(var(--primary-hue), 30%, 70%, 0.8);
        font-size: 1.1rem;
    }

    .galleries-layout {
        display: grid;
        grid-template-columns: 350px 1fr;
        gap: 2rem;
        max-width: 1400px;
        margin: 0 auto;
    }

    .galleries-sidebar {
        background: hsla(var(--primary-hue), 20%, 15%, 0.6);
        border-radius: 16px;
        padding: 1.5rem;
        height: fit-content;
        border: 1px solid hsla(var(--primary-hue), 30%, 40%, 0.2);
        backdrop-filter: blur(10px);
    }

    .btn-create-gallery {
        width: 100%;
        background: linear-gradient(135deg, var(--primary-color), hsl(290, 100%, 45%));
        color: white;
        border: none;
        border-radius: 12px;
        padding: 1rem 1.5rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        box-shadow: 0 4px 20px hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.3);
    }

    .btn-create-gallery:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.4);
        background: linear-gradient(135deg, hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 5%)), hsl(290, 100%, 50%));
    }

    .galleries-list {
        max-height: 70vh;
        overflow-y: auto;
        padding-right: 0.5rem;
    }

    .galleries-list::-webkit-scrollbar {
        width: 6px;
    }

    .galleries-list::-webkit-scrollbar-track {
        background: transparent;
    }

    .galleries-list::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, var(--primary-color), transparent);
        border-radius: 3px;
    }

    .gallery-card {
        background: hsla(var(--primary-hue), 15%, 20%, 0.4);
        border: 1px solid hsla(var(--primary-hue), 30%, 35%, 0.3);
        border-radius: 12px;
        padding: 1.25rem;
        margin-bottom: 1rem;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        width: 100%;
        text-align: left;
    }

    .gallery-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, hsla(var(--primary-hue), 50%, 50%, 0.1), transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .gallery-card:hover::before {
        opacity: 1;
    }

    .gallery-card:hover {
        transform: translateY(-3px);
        border-color: hsla(var(--primary-hue), 60%, 60%, 0.5);
        box-shadow: 0 8px 30px hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.2);
    }

    .gallery-card.active {
        background: linear-gradient(135deg,
        hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.3),
        hsla(var(--primary-hue), 80%, 45%, 0.2)
        );
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.5);
        transform: translateY(-2px);
    }

    .gallery-card.active::before {
        opacity: 1;
    }

    .gallery-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.75rem;
    }

    .gallery-name {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-color);
        margin: 0;
        line-height: 1.3;
    }

    .gallery-count {
        background: linear-gradient(135deg, var(--primary-color), hsl(290, 100%, 50%));
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        min-width: 2rem;
        text-align: center;
    }

    .gallery-description {
        color: hsla(var(--primary-hue), 30%, 70%, 0.8);
        font-size: 0.9rem;
        line-height: 1.4;
        margin-bottom: 1rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .gallery-preview {
        display: flex;
        justify-content: center;
    }

    .preview-images {
        position: relative;
        height: 40px;
        width: 60px;
    }

    .preview-img {
        position: absolute;
        width: 28px;
        height: 40px;
        object-fit: cover;
        border-radius: 4px;
        border: 2px solid var(--surface-color);
        transition: transform 0.3s ease;
    }

    .gallery-card:hover .preview-img {
        transform: translateX(0) !important;
    }

    .preview-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: hsla(var(--primary-hue), 20%, 25%, 0.5);
        border-radius: 8px;
        color: hsla(var(--primary-hue), 30%, 60%, 0.6);
    }

    .empty-state {
        padding: 2rem 1rem;
    }

    .galleries-main {
        background: hsla(var(--primary-hue), 15%, 18%, 0.4);
        border-radius: 16px;
        border: 1px solid hsla(var(--primary-hue), 30%, 40%, 0.2);
        overflow: hidden;
        backdrop-filter: blur(10px);
    }

    .gallery-details {
        padding: 2rem;
        height: 100%;
    }

    .gallery-details-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid hsla(var(--primary-hue), 30%, 35%, 0.3);
    }

    .details-title {
        color: var(--text-color);
        font-size: 1.75rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    .details-subtitle {
        color: hsla(var(--primary-hue), 30%, 70%, 0.8);
        margin: 0;
    }

    .gallery-name-highlight {
        color: var(--primary-color);
        font-weight: 700;
    }

    .header-actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;
    }

    .btn-back-to-create {
        background: linear-gradient(135deg, var(--primary-color), hsl(290, 100%, 45%));
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.75rem;
        transition: all 0.3s ease;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .btn-back-to-create:hover {
        background: linear-gradient(135deg, hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 5%)), hsl(290, 100%, 50%));
        transform: translateY(-2px);
        box-shadow: 0 4px 15px hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.3);
    }

    .btn-delete-gallery {
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.75rem;
        transition: all 0.3s ease;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .btn-delete-gallery:hover {
        background: linear-gradient(135deg, #c0392b, #a93226);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
    }

    .gallery-form, .create-gallery-form {
        margin-bottom: 2rem;
    }

    .gallery-stats-quick {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: hsla(var(--primary-hue), 20%, 15%, 0.6);
        border-radius: 8px;
        border: 1px solid hsla(var(--primary-hue), 30%, 35%, 0.3);
    }

    .stat-quick {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: hsla(var(--primary-hue), 50%, 70%, 0.9);
        font-size: 0.9rem;
    }

    .stat-quick i {
        color: var(--primary-color);
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    .form-label {
        color: var(--text-color);
        font-weight: 600;
        margin-bottom: 0.5rem;
        display: block;
    }

    .form-control {
        background: hsla(var(--primary-hue), 15%, 12%, 0.8);
        border: 1px solid hsla(var(--primary-hue), 30%, 35%, 0.4);
        border-radius: 8px;
        color: var(--text-color);
        padding: 0.75rem 1rem;
        transition: all 0.3s ease;
        width: 100%;
    }

    .form-control:focus {
        background: hsla(var(--primary-hue), 15%, 15%, 0.9);
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.2);
        outline: none;
    }

    .form-control::placeholder {
        color: hsla(var(--primary-hue), 20%, 60%, 0.6);
    }

    .btn-save-gallery, .btn-create-new {
        background: linear-gradient(135deg, var(--primary-color), hsl(290, 100%, 50%));
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.875rem 1.5rem;
        font-weight: 600;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }

    .btn-save-gallery:hover, .btn-create-new:hover {
        background: linear-gradient(135deg, hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 5%)), hsl(290, 100%, 55%));
        transform: translateY(-2px);
        box-shadow: 0 6px 20px hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.3);
    }

    .btn-save-gallery:disabled, .btn-create-new:disabled {
        background: linear-gradient(135deg, hsla(var(--primary-hue), 30%, 40%, 0.5), hsla(290, 30%, 40%, 0.5));
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    .btn-save-gallery:disabled:hover, .btn-create-new:disabled:hover {
        background: linear-gradient(135deg, hsla(var(--primary-hue), 30%, 40%, 0.5), hsla(290, 30%, 40%, 0.5));
        transform: none;
        box-shadow: none;
    }

    .section-divider {
        display: flex;
        align-items: center;
        margin: 2.5rem 0;
        position: relative;
    }

    .section-divider::before {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, transparent, hsla(var(--primary-hue), 50%, 50%, 0.3), transparent);
    }

    .section-divider span {
        padding: 0 1.5rem;
        color: hsla(var(--primary-hue), 50%, 70%, 0.8);
        font-weight: 600;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .books-section, .add-books-section {
        margin-bottom: 2rem;
    }

    .section-title {
        color: var(--text-color);
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .count-badge {
        background: linear-gradient(135deg, var(--primary-color), hsl(290, 100%, 50%));
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-left: auto;
    }

    .books-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 1.25rem;
    }

    .book-item {
        background: hsla(var(--primary-hue), 15%, 20%, 0.4);
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid hsla(var(--primary-hue), 30%, 35%, 0.3);
    }

    .book-item:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 30px hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.2);
        border-color: hsla(var(--primary-hue), 60%, 60%, 0.5);
    }

    .add-book-item {
        cursor: pointer;
        border: none;
        padding: 0;
        background: transparent;
        width: 100%;
        text-align: left;
    }

    .add-book-item:hover {
        border-color: hsl(120, 60%, 50%);
        box-shadow: 0 12px 30px hsla(120, 60%, 50%, 0.2);
    }

    .book-cover-container {
        position: relative;
        aspect-ratio: 2 / 3;
        overflow: hidden;
    }

    .book-cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }

    .book-item:hover .book-cover {
        transform: scale(1.05);
    }

    .book-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(to bottom,
        transparent 0%,
        transparent 60%,
        hsla(0, 0%, 0%, 0.8) 100%
        );
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        padding: 0.75rem;
        opacity: 0;
        transition: all 0.3s ease;
    }

    .book-item:hover .book-overlay {
        opacity: 1;
    }

    .add-overlay {
        background: linear-gradient(to bottom,
        hsla(120, 60%, 50%, 0.1) 0%,
        hsla(120, 60%, 50%, 0.3) 60%,
        hsla(120, 60%, 30%, 0.8) 100%
        );
        align-items: center;
        justify-content: center;
    }

    .btn-remove-book {
        background: linear-gradient(135deg, #e74c3c, #c0392b);
        color: white;
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }

    .btn-remove-book:hover {
        background: linear-gradient(135deg, #c0392b, #a93226);
        transform: scale(1.1);
    }

    .add-icon {
        background: linear-gradient(135deg, #27ae60, #2ecc71);
        color: white;
        border: none;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        font-size: 1.25rem;
    }

    .add-book-item:hover .add-icon {
        background: linear-gradient(135deg, #2ecc71, #58d68d);
        transform: scale(1.1);
    }

    .book-item:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
    }

    .btn-remove-book:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .book-info {
        padding: 1rem;
    }

    .book-title {
        color: var(--text-color);
        font-size: 0.9rem;
        font-weight: 500;
        margin: 0;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .empty-gallery {
        text-align: center;
        padding: 3rem 2rem;
        color: hsla(var(--primary-hue), 30%, 60%, 0.8);
    }

    .empty-gallery i {
        color: hsla(var(--primary-hue), 40%, 50%, 0.6);
    }

    .empty-gallery h4 {
        color: var(--text-color);
        margin: 1rem 0 0.5rem;
    }

    .no-books-available {
        text-align: center;
        padding: 2rem;
        color: hsla(120, 40%, 60%, 0.8);
    }

    .search-books-container {
        margin-bottom: 1.5rem;
    }

    .no-search-results {
        text-align: center;
        padding: 2rem;
        color: hsla(var(--primary-hue), 30%, 60%, 0.8);
    }

    .create-gallery-section {
        padding: 3rem 2rem;
        text-align: center;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .create-gallery-content {
        max-width: 500px;
        width: 100%;
    }

    .create-gallery-icon {
        margin-bottom: 2rem;
    }

    .create-gallery-icon i {
        font-size: 4rem;
        background: linear-gradient(135deg, var(--primary-color), hsl(290, 100%, 60%));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .create-title {
        color: var(--text-color);
        font-size: 2rem;
        font-weight: 600;
        margin-bottom: 1rem;
    }

    .create-subtitle {
        color: hsla(var(--primary-hue), 30%, 70%, 0.8);
        font-size: 1.1rem;
        margin-bottom: 2.5rem;
        line-height: 1.5;
    }

    .create-gallery-form {
        text-align: left;
    }

    @media (max-width: 1024px) {
        .galleries-layout {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }

        .galleries-sidebar {
            order: 1;
        }

        .galleries-main {
            order: 2;
        }
    }

    @media (max-width: 768px) {

        .galleries-title {
            font-size: 2rem;
        }

        .books-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 1rem;
        }

        .gallery-details {
            padding: 1.5rem;
        }

        .galleries-sidebar {
            padding: 1rem;
        }
    }

    @media (max-width: 480px) {
        .books-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 0.75rem;
        }

        .create-gallery-section {
            padding: 2rem 1rem;
        }

        .create-title {
            font-size: 1.5rem;
        }
    }
</style>
