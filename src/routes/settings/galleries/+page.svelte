<script>
    import {onMount} from 'svelte';
    import {invalidateAll} from '$app/navigation';
    import {toast} from '$lib/components/svelte-toast/index.js';
    import {deserialize} from '$app/forms';
    import autoAnimate from "@formkit/auto-animate";
    import {tooltip} from "svelte-tooltip-gca";
    import {tooltipConfig} from "$lib/utils/gcacommons.js";

    import {fly, scale} from 'svelte/transition';
    import { resolveImageUrl } from '$lib/utils/images.js';

    let {data} = $props();

    let galleries = $derived(data.galleries || []);
    let userBooks = $derived(data.userBooks || []);
    let profile = $derived(data.profile);
    let image_proxy = $derived(data.image_proxy);
    let galleryParam = $derived(data.galleryParam);

    // image_proxy deprecated: serve originals at best quality.
    function getOptimizedImageUrl(url) {
        return resolveImageUrl(url, image_proxy, '/favicon.webp');
    }

    function getOptimizedImageSrcSet(url) {
        const resolved = resolveImageUrl(url, image_proxy, '/favicon.webp');
        return {
            src: resolved,
            srcset: undefined
        };
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
                        '--toastColor': 'var(--text-color)'
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
                        '--toastColor': 'var(--text-color)'
                    }
                });
            }
        } catch (error) {
            console.error('Error saving gallery:', error);
            toast.push('Error saving gallery', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': 'var(--text-color)'
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
                        '--toastColor': 'var(--text-color)'
                    }
                });
                selectGallery(null);
                await invalidateAll();
            } else {
                toast.push(result.data?.message || 'Error deleting gallery', {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': 'var(--text-color)'
                    }
                });
            }
        } catch (error) {
            console.error('Error deleting gallery:', error);
            toast.push('Error deleting gallery', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': 'var(--text-color)'
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
                    '--toastColor': 'var(--text-color)'
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
                        '--toastColor': 'var(--text-color)'
                    }
                });
                updateLocalGalleryData(selectedGallery.id);
            } else {
                toast.push(result.data?.message || 'Error adding book to gallery', {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': 'var(--text-color)'
                    }
                });
            }
        } catch (error) {
            console.error('Error adding book:', error);
            toast.push('Error adding book to gallery', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': 'var(--text-color)'
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
                        '--toastColor': 'var(--text-color)'
                    }
                });
                // Update local data
                updateLocalGalleryData(selectedGallery.id);
            } else {
                toast.push(result.data?.message || 'Error removing book from gallery', {
                    theme: {
                        '--toastBackground': '#ff4d4d',
                        '--toastColor': 'var(--text-color)'
                    }
                });
            }
        } catch (error) {
            console.error('Error removing book:', error);
            toast.push('Error removing book from gallery', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': 'var(--text-color)'
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

<div class="container-xxl p-2 p-lg-3 mb-4">
    <div class="text-center mb-5 mt-3">
        <h1 class="galleries-title mb-2">
            <i class="fas fa-images me-3"></i>
            Manage Galleries
        </h1>
        <p class="galleries-subtitle mb-0">Organize and showcase your creative works</p>
    </div>

    <div class="row g-4">
        <!-- Sidebar - Galleries List -->
        <div class="col-12 col-lg-4 col-xl-3">
            <div class="galleries-sidebar card border-0 shadow-sm rounded-4">
                <div class="card-body p-3">
                    <button
                            class="btn btn-primary w-100 mb-3 d-flex align-items-center justify-content-center"
                            onclick={() => selectGallery(null)}
                            type="button"
                    >
                        <i class="fas fa-plus me-2"></i>
                        <span>Create New Gallery</span>
                    </button>

                    <div class="galleries-list pt-2" use:autoAnimate>
                        {#if galleries.length === 0}
                            <div class="empty-state text-center py-4">
                                <i class="fas fa-images fa-3x text-muted mb-3"></i>
                                <p class="text-muted">No galleries yet</p>
                                <small class="text-muted">Create your first gallery to get started</small>
                            </div>
                        {:else}
                            {#each galleries as gallery (gallery.id)}
                                <button
                                        class="gallery-card btn w-100 text-start p-3 mb-3 border-0 shadow-sm"
                                        class:active={selectedGallery?.id === gallery.id}
                                        onclick={() => selectGallery(gallery)}
                                        transition:scale={{ duration: 200, delay: galleries.indexOf(gallery) * 50 }}
                                        aria-label="Select gallery {gallery.name}"
                                        type="button"
                                >
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <h6 class="gallery-name fw-semibold mb-0">{gallery.name}</h6>
                                        <span class="badge bg-purple rounded-pill">{gallery.gallery_books.length}</span>
                                    </div>
                                    <p class="gallery-description text-muted small mb-3">{gallery.description || 'No description'}</p>
                                    <div class="gallery-preview d-flex justify-content-center">
                                        {#if gallery.gallery_books.length > 0}
                                            <div class="preview-images">
                                                {#each gallery.gallery_books.slice(0, 3) as gb, i}
                                                    {@const
                                                        imageData = getOptimizedImageSrcSet(gb.book.cover_url, 120, 85)}
                                                    <img
                                                            srcset={imageData.srcset}
                                                            src={imageData.src}
                                                            alt="Book cover preview"
                                                            class="preview-img rounded"
                                                            style="z-index: {3-i}; transform: translateX({i * -8}px)"
                                                            loading="lazy"
                                                            width="60"
                                                            height="80"
                                                    />
                                                {/each}
                                            </div>
                                        {:else}
                                            <div class="preview-empty bg-light rounded d-flex align-items-center justify-content-center">
                                                <i class="fas fa-image text-muted"></i>
                                            </div>
                                        {/if}
                                    </div>
                                </button>
                            {/each}
                        {/if}
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="col-12 col-lg-8 col-xl-9">
            <div class="galleries-main card border-0 shadow-sm rounded-4">
                <div class="card-body p-4">
                    {#if selectedGallery}
                        <div class="gallery-details" transition:fly={{ x: 20, duration: 300 }}>
                            <div class="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom border-muted">
                                <div>
                                    <h2 class="h3 fw-bold mb-2">
                                        <i class="fas fa-edit me-2"></i>
                                        Manage Gallery: <span
                                            class="gallery-name-highlight">{selectedGallery.name}</span>
                                    </h2>
                                    <p class="text-muted mb-0">Customize your gallery settings and content</p>
                                </div>
                                <div class="d-flex gap-2">
                                    <button
                                            class="btn btn-primary btn-sm"
                                            onclick={() => selectGallery(null)}
                                            use:tooltip={{...tooltipConfig, content: 'Back to Create Gallery'}}
                                            aria-label="Back to create gallery"
                                            type="button"
                                    >
                                        <i class="fas fa-plus"></i>
                                    </button>
                                    <button
                                            class="btn btn-danger btn-sm"
                                            onclick={(e) => {
                                        e.preventDefault();
                                        handleDeleteGallery();
                                    }}
                                            use:tooltip={{...tooltipConfig, content: 'Delete Gallery'}}
                                            aria-label="Delete gallery"
                                            type="button"
                                    >
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>

                            <form class="gallery-form" onsubmit={handleSaveGallery}>
                                <div class="row mb-4 p-3 bg-light bg-opacity-10 rounded">
                                    <div class="col-md-6">
                                        <div class="d-flex align-items-center text-muted">
                                            <i class="fas fa-book text-purple me-2"></i>
                                            <span>{selectedGallery.gallery_books.length} {selectedGallery.gallery_books.length && selectedGallery.gallery_books.length >= 2 ? "tales" : "tale"}</span>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="d-flex align-items-center text-muted">
                                            <i class="fas fa-calendar text-purple me-2"></i>
                                            <span>Created {new Date(selectedGallery.created_at || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="row mb-4">
                                    <div class="col-12">
                                        <label for="galleryName" class="form-label fw-semibold">Gallery Name</label>
                                        <input
                                                type="text"
                                                class="form-control"
                                                id="galleryName"
                                                bind:value={selectedGallery.name}
                                                placeholder="Enter gallery name..."
                                                required
                                        />
                                    </div>
                                </div>
                                <div class="row mb-4">
                                    <div class="col-12">
                                        <label for="galleryDescription"
                                               class="form-label fw-semibold">Description</label>
                                        <textarea
                                                class="form-control"
                                                id="galleryDescription"
                                                rows="3"
                                                bind:value={selectedGallery.description}
                                                placeholder="Describe your gallery..."
                                        ></textarea>
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary" disabled={isLoading}>
                                    {#if isLoading}
                                        <i class="fas fa-spinner fa-spin me-2"></i>
                                        Saving...
                                    {:else}
                                        <i class="fas fa-save me-2"></i>
                                        Save Changes
                                    {/if}
                                </button>
                            </form>

                            <div class="section-header d-flex align-items-center justify-content-center my-4">
                                <div class="flex-grow-1">
                                    <hr>
                                </div>
                                <span class="px-3 text-muted fw-semibold small text-uppercase">Gallery Content</span>
                                <div class="flex-grow-1">
                                    <hr>
                                </div>
                            </div>

                            <div class="books-section" use:autoAnimate>
                                <h3 class="h5 d-flex align-items-center justify-content-between mb-3">
                                <span>
                                    <i class="fas fa-book me-2"></i>
                                    Tales in Gallery
                                </span>
                                    <span class="badge bg-purple">{selectedGallery.gallery_books.length}</span>
                                </h3>

                                {#if selectedGallery.gallery_books.length > 0}
                                    <div class="row g-3" role="grid" aria-label="Tales in gallery">
                                        {#each selectedGallery.gallery_books.map(gb => gb.book) as book (book.id)}
                                            <div class="col-6 col-md-4 col-lg-3" transition:scale={{ duration: 200 }}
                                                 role="gridcell">
                                                <div class="book-item card border-0 shadow-sm h-100 rounded-4">
                                                    <div class="book-cover-container position-relative">
                                                        {#if !imageLoadingStates[book.id]}
                                                            {@const
                                                                imageData = getOptimizedImageSrcSet(book.cover_url, 250, 85)}
                                                            <div class="placeholder-glow" use:autoAnimate>
                                                                <div class="placeholder bg-light rounded-top w-100 h-100">
                                                                    <img
                                                                            srcset={imageData.srcset}
                                                                            src={imageData.src}
                                                                            alt="Cover for {book.title}"
                                                                            class="book-cover card-img-top"
                                                                            loading="lazy"
                                                                            style="width: 1px; height: 1px;"
                                                                            onload={() => imageLoadingStates[book.id] = true}
                                                                    />
                                                                </div>
                                                            </div>
                                                        {:else}
                                                            {@const
                                                                imageData = getOptimizedImageSrcSet(book.cover_url, 250, 85)}
                                                            <img
                                                                    srcset={imageData.srcset}
                                                                    src={imageData.src}
                                                                    alt="Cover for {book.title}"
                                                                    class="book-cover card-img-top"
                                                                    loading="lazy"
                                                                    width="250"
                                                            />
                                                        {/if}
                                                        <div class="book-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end justify-content-end p-2 opacity-0">
                                                            <button
                                                                    class="btn btn-danger btn-sm rounded-circle"
                                                                    onclick={(e) => {
                                                                e.preventDefault();
                                                                handleRemoveBook(book.id);
                                                            }}
                                                                    use:tooltip={{...tooltipConfig, content: 'Remove from gallery'}}
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
                                                    <div class="card-body p-2">
                                                        <h6 class="book-title card-title small m-2">{book.title}</h6>
                                                    </div>
                                                </div>
                                            </div>
                                        {/each}
                                    </div>
                                {:else}
                                    <div class="empty-gallery text-center py-5">
                                        <i class="fas fa-images fa-3x mb-3 text-muted"></i>
                                        <h4 class="h5">Empty Gallery</h4>
                                        <p class="text-muted">This gallery doesn't have any Tale yet. Add some from the
                                            selection below.</p>
                                    </div>
                                {/if}
                            </div>

                            <div class="section-header d-flex align-items-center justify-content-center my-4">
                                <div class="flex-grow-1">
                                    <hr>
                                </div>
                                <span class="px-3 text-muted fw-semibold small text-uppercase">Add Content</span>
                                <div class="flex-grow-1">
                                    <hr>
                                </div>
                            </div>

                            <div class="add-books-section">
                                <h3 class="h5 d-flex align-items-center mb-3">
                                    <i class="fas fa-plus-circle me-2"></i>
                                    Add Tales to Gallery
                                </h3>

                                {#if userBooks.filter(ub => !selectedGallery.gallery_books.some(gb => gb.book_id === ub.id)).length > 0}
                                    <div class="search-books-container mb-4">
                                        <label for="searchBooks" class="form-label fw-semibold">Search Tales</label>
                                        <input
                                                type="text"
                                                class="form-control"
                                                id="searchBooks"
                                                oninput={handleSearchInput}
                                                placeholder="Search your tales to add..."
                                        />
                                    </div>

                                    <div class="row g-3" role="grid" aria-label="Available tales to add">
                                        <div class="row g-3" role="grid" aria-label="Available tales to add">
                                            {#each availableBooks as book (book.id)}
                                                <div class="col-6 col-md-4 col-lg-3">
                                                    <button
                                                            class="book-item add-book-item btn p-0 w-100 border-0"
                                                            onclick={(e) => {
                                                    e.preventDefault();
                                                    handleAddBook(book.id);
                                                }}
                                                            aria-label="Add {book.title} to gallery"
                                                            type="button"
                                                            role="gridcell"
                                                            disabled={isLoading}
                                                    >
                                                        <div class="card border-0 shadow-sm h-100 rounded-4">
                                                            <div class="book-cover-container position-relative">
                                                                {#if !imageLoadingStates[`add-${book.id}`]}
                                                                    {@const
                                                                        imageData = getOptimizedImageSrcSet(book.cover_url, 250, 85)}
                                                                    <div class="placeholder-glow" use:autoAnimate>
                                                                        <div class="placeholder bg-light rounded-top w-100 h-100">
                                                                            <img
                                                                                    srcset={imageData.srcset}
                                                                                    src={imageData.src}
                                                                                    alt="Cover for {book.title}"
                                                                                    class="book-cover card-img-top"
                                                                                    loading="lazy"
                                                                                    style="width: 1px; height: 1px;"
                                                                                    onload={() => imageLoadingStates[`add-${book.id}`] = true}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                {:else}
                                                                    {@const
                                                                        imageData = getOptimizedImageSrcSet(book.cover_url, 250, 85)}
                                                                    <img
                                                                            srcset={imageData.srcset}
                                                                            src={imageData.src}
                                                                            alt="Cover for {book.title}"
                                                                            class="book-cover card-img-top"
                                                                            loading="lazy"
                                                                            width="250"
                                                                    />
                                                                {/if}
                                                                <div class="book-overlay add-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center opacity-0">
                                                                    <div class="add-icon bg-success text-white rounded-circle d-flex align-items-center justify-content-center">
                                                                        {#if isLoading}
                                                                            <i class="fas fa-spinner fa-spin"></i>
                                                                        {:else}
                                                                            <i class="fas fa-plus"></i>
                                                                        {/if}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="card-body p-2">
                                                                <h6 class="book-title card-title small m-2 text-start">{book.title}</h6>
                                                            </div>
                                                        </div>
                                                    </button>
                                                </div>
                                            {/each}
                                        </div>

                                        {#if availableBooks.length === 0 && searchBooks !== ''}
                                            <div class="col-12">
                                                <div class="no-search-results text-center py-4">
                                                    <i class="fas fa-search fa-2x mb-2 text-muted"></i>
                                                    <p class="text-muted">No tales found matching "{searchBooks}"</p>
                                                    <button
                                                            class="btn btn-secondary btn-sm"
                                                            onclick={() => searchBooks = ''}
                                                            type="button"
                                                    >
                                                        Clear Search
                                                    </button>
                                                </div>
                                            </div>
                                        {/if}
                                    </div>
                                {:else}
                                    <div class="no-books-available text-center py-4">
                                        <i class="fas fa-check-circle fa-2x mb-2 text-success"></i>
                                        <p class="text-muted">All your tales are already in this gallery!</p>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {:else}
                        <div class="create-gallery-section text-center py-5" transition:fly={{ x: 20, duration: 300 }}>
                            <div class="create-gallery-content mx-auto" style="max-width: 500px;">
                                <div class="create-gallery-icon mb-4">
                                    <i class="fas fa-images display-1 text-purple"></i>
                                </div>
                                <h2 class="h3 fw-bold mb-3">Create a New Gallery</h2>
                                <p class="text-muted mb-4 fs-5">Start organizing your creative works into beautiful
                                    collections</p>

                                <form class="create-gallery-form text-start" onsubmit={handleSaveGallery}>
                                    <div class="row mb-3">
                                        <div class="col-12">
                                            <label for="newGalleryName" class="form-label fw-semibold">Gallery
                                                Name</label>
                                            <input
                                                    type="text"
                                                    class="form-control"
                                                    id="newGalleryName"
                                                    bind:value={newGallery.name}
                                                    placeholder="Enter a creative name for your gallery..."
                                                    required
                                            />
                                        </div>
                                    </div>
                                    <div class="row mb-4">
                                        <div class="col-12">
                                            <label for="newGalleryDescription" class="form-label fw-semibold">Description</label>
                                            <textarea
                                                    class="form-control"
                                                    id="newGalleryDescription"
                                                    rows="3"
                                                    bind:value={newGallery.description}
                                                    placeholder="What's this gallery about? Describe the theme or collection..."
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div class="text-center">
                                        <button type="submit" class="btn btn-primary btn-lg" disabled={isLoading}>
                                            {#if isLoading}
                                                <i class="fas fa-spinner fa-spin me-2"></i>
                                                Creating...
                                            {:else}
                                                <i class="fas fa-magic me-2"></i>
                                                Create Gallery
                                            {/if}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>

<style>

    .galleries-title {
        color: var(--text-color);
        font-size: 2.5rem;
        font-weight: 700;
    }

    .galleries-subtitle {
        color: hsla(var(--primary-hue), 30%, 70%, 0.8);
        font-size: 1.1rem;
    }

    .galleries-sidebar {
        background: hsla(var(--primary-hue), 20%, 15%, 0.6) !important;
        border: 1px solid hsla(var(--primary-hue), 30%, 40%, 0.2) !important;
        backdrop-filter: blur(10px);
    }

    .btn-primary {
        background: var(--dd-accent) !important;
        border: 1px solid rgba(var(--dd-bright-rgb),0.4) !important;
        color: var(--dd-accent-ink) !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
        font-weight: 600;
        transition: all 0.3s ease;
    }

    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.45), 0 0 0.6rem 0.15rem rgba(var(--dd-bright-rgb),0.35);
        background: var(--dd-accent-bright) !important;
        color: var(--dd-accent-ink) !important;
    }

    .bg-purple {
        background: var(--dd-accent) !important;
    }

    .bg-success {
        background: rgb(46, 204, 113) !important;
    }

    .text-purple {
        color: hsla(var(--primary-hue), var(--primary-saturation), 60%, 1) !important;
    }

    .text-muted {
        color: hsla(var(--primary-hue), 30%, 70%, 0.8) !important;
    }

    .border-muted {
        border-color: hsla(var(--primary-hue), 30%, 40%, 0.2) !important;
    }

    .gallery-card {
        background: hsla(var(--primary-hue), 15%, 20%, 0.4) !important;
        border: 1px solid hsla(var(--primary-hue), 30%, 35%, 0.3) !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
    }

    .gallery-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 30%);
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .gallery-card:hover::before {
        opacity: 1;
    }

    .gallery-card:hover {
        transform: translateY(-3px);
        border-color: hsla(var(--primary-hue), 60%, 60%, 0.5) !important;
        box-shadow: 0 8px 30px hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.2) !important;
    }

    .gallery-card.active {
        background: var(--dd-surface-2) !important;
        border-color: var(--primary-color) !important;
        box-shadow: 0 0 0 2px rgba(var(--dd-bright-rgb),0.35) !important;
        transform: translateY(-2px);
    }

    .gallery-card.active::before {
        opacity: 1;
    }

    .gallery-name {
        color: var(--text-color);
        line-height: 1.3;
    }

    .gallery-description {
        color: hsla(var(--primary-hue), 30%, 70%, 0.8);
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
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
        border: 2px solid var(--surface-color);
        transition: transform 0.3s ease;
    }

    .gallery-card:hover .preview-img {
        transform: translateX(0) !important;
    }

    .preview-empty {
        width: 40px;
        height: 40px;
        background: hsla(var(--primary-hue), 20%, 25%, 0.5);
        color: hsla(var(--primary-hue), 30%, 60%, 0.6);
    }

    .galleries-main {
        background: hsla(var(--primary-hue), 15%, 18%, 0.4) !important;
        border: 1px solid hsla(var(--primary-hue), 30%, 40%, 0.2) !important;
        backdrop-filter: blur(10px);
    }

    .gallery-name-highlight {
        color: var(--primary-color);
        font-weight: 700;
    }

    .form-control {
        background: hsla(var(--primary-hue), 15%, 12%, 0.8) !important;
        border: 1px solid hsla(var(--primary-hue), 30%, 35%, 0.4) !important;
        color: var(--text-color) !important;
        transition: all 0.3s ease;
    }

    .form-control:focus {
        background: hsla(var(--primary-hue), 15%, 15%, 0.9) !important;
        border-color: var(--primary-color) !important;
        box-shadow: 0 0 0 0.2rem rgba(var(--dd-accent-rgb),0.45) !important;
        outline: 1px solid rgba(var(--dd-bright-rgb),0.4);
    }

    .form-control::placeholder {
        color: hsla(var(--primary-hue), 20%, 60%, 0.6) !important;
    }

    .form-label {
        color: var(--text-color) !important;
    }

    .book-item.card, .book-item .card {
        background: hsla(var(--primary-hue), 15%, 20%, 0.4) !important;
        border: 1px solid hsla(var(--primary-hue), 30%, 35%, 0.3) !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .book-item.card:hover, .book-item .card:hover {
        transform: translateY(-5px);
        border-color: hsla(var(--primary-hue), 60%, 60%, 0.5) !important;
        box-shadow: 0 12px 30px hsla(var(--primary-hue), var(--primary-saturation), var(--primary-lightness), 0.2) !important;
    }

    .add-book-item .card:hover {
        border-color: hsla(120, 60%, 50%, 0) !important;
        box-shadow: 0 12px 30px hsla(120, 60%, 50%, 0.2) !important;
    }

    .book-cover-container {
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
        background: linear-gradient(to bottom,
        transparent 0%,
        transparent 60%,
        hsla(0, 0%, 0%, 0.8) 100%
        );
        transition: all 0.3s ease;
    }

    .book-item:hover .book-overlay {
        opacity: 1 !important;
    }

    .add-overlay {
        background: linear-gradient(to bottom,
        hsla(120, 60%, 50%, 0.1) 0%,
        hsla(120, 60%, 50%, 0.3) 60%,
        hsla(120, 60%, 30%, 0.8) 100%
        ) !important;
    }

    .add-icon {
        width: 48px;
        height: 48px;
        font-size: 1.25rem;
        transition: all 0.3s ease;
    }

    .add-book-item:hover .add-icon {
        transform: scale(1.1);
    }

    .book-title {
        color: var(--text-color) !important;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .empty-gallery {
        color: hsla(var(--primary-hue), 30%, 60%, 0.8);
    }

    .empty-gallery i {
        color: hsla(var(--primary-hue), 40%, 50%, 0.6);
    }

    .empty-gallery h4 {
        color: var(--text-color);
    }

    .create-gallery-icon i {
        color: var(--dd-accent-bright);
    }

    @media (max-width: 768px) {
        .galleries-title {
            font-size: 2rem;
        }

        .gallery-card {
            margin-bottom: 1rem !important;
        }
    }

    .placeholder-glow .placeholder {
        animation: placeholder-glow 2s ease-in-out infinite alternate;
    }

    @keyframes placeholder-glow {
        50% {
            opacity: 0.2;
        }
    }
</style>
