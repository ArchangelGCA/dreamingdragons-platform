<script>
    import { onMount } from 'svelte';
    import { invalidateAll } from '$app/navigation';
    import { toast } from '$lib/components/svelte-toast/index.js';
    import { deserialize } from '$app/forms';
    import { tooltip } from '@svelte-plugins/tooltips';
    import { tooltipConfig } from '$lib/utils/gcacommons';

    let { data } = $props();
    let { galleries, userBooks, profile } = $state(data);

    let gallery = $state({
        id: null,
        name: '',
        description: ''
    });
    let booksInGallery = $state([]);
    let selectedBook = $state('');

    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const galleryId = urlParams.get('id');
        if (galleryId) {
            const g = galleries.find(g => g.id === galleryId);
            if (g) {
                gallery = { ...g };
                booksInGallery = g.gallery_books.map(gb => gb.book);
            }
        }
    });

    async function handleSaveGallery(e) {
        e.preventDefault();

        const formData = new FormData();
        if (gallery.id) {
            formData.append('id', gallery.id);
        }
        formData.append('name', gallery.name);
        formData.append('description', gallery.description);

        const response = await fetch('?/saveGallery', {
            method: 'POST',
            body: formData
        });

        const result = deserialize(await response.text());

        if (result.type === 'success') {
            toast.push('Gallery saved successfully!');
            if (!gallery.id) {
                gallery.id = result.data.body.id;
            }
            await invalidateAll();
        } else {
            toast.push(result.data?.message || 'Error saving gallery', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        }
    }

    async function handleDeleteGallery() {
        if (!gallery.id) return;

        if (!confirm('Are you sure you want to delete this gallery?')) {
            return;
        }

        const formData = new FormData();
        formData.append('id', gallery.id);

        const response = await fetch('?/deleteGallery', {
            method: 'POST',
            body: formData
        });

        const result = deserialize(await response.text());

        if (result.type === 'success') {
            toast.push('Gallery deleted successfully!');
            gallery.id = null;
            gallery.name = '';
            gallery.description = '';
            booksInGallery = [];
            await invalidateAll();
        } else {
            toast.push(result.data?.message || 'Error deleting gallery', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        }
    }

    async function handleAddBook() {
        if (!gallery.id || !selectedBook) return;

        const formData = new FormData();
        formData.append('gallery_id', gallery.id);
        formData.append('book_id', selectedBook);

        const response = await fetch('?/addBookToGallery', {
            method: 'POST',
            body: formData
        });

        const result = deserialize(await response.text());

        if (result.type === 'success') {
            toast.push('Book added to gallery!');
            booksInGallery = [...booksInGallery, userBooks.find(b => b.id === selectedBook)];
            selectedBook = '';
            await invalidateAll();
        } else {
            toast.push(result.data?.message || 'Error adding book to gallery', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        }
    }

    async function handleRemoveBook(bookId) {
        if (!gallery.id) return;

        const formData = new FormData();
        formData.append('gallery_id', gallery.id);
        formData.append('book_id', bookId);

        const response = await fetch('?/removeBookFromGallery', {
            method: 'POST',
            body: formData
        });

        const result = deserialize(await response.text());

        if (result.type === 'success') {
            toast.push('Book removed from gallery!');
            booksInGallery = booksInGallery.filter(b => b.id !== bookId);
            await invalidateAll();
        } else {
            toast.push(result.data?.message || 'Error removing book from gallery', {
                theme: {
                    '--toastBackground': '#ff4d4d',
                    '--toastColor': '#fff'
                }
            });
        }
    }

    function selectGallery(g) {
        if (g) {
            gallery = { ...g };
            booksInGallery = g.gallery_books.map(gb => gb.book);
        } else {
            gallery = { id: null, name: '', description: '' };
            booksInGallery = [];
        }
    }

</script>

<svelte:head>
    <title>Manage Galleries - {profile.username}</title>
</svelte:head>

<div class="container">
    <div class="row">
        <div class="col-12">
            <h1 class="text-center">Manage Galleries</h1>
        </div>
    </div>

    <div class="row mt-4">
        <div class="col-md-4">
            <h2>My Galleries</h2>
            <div class="list-group">
                <button type="button" class="list-group-item list-group-item-action" class:active={!gallery.id} onclick={() => selectGallery(null)}>
                    + Create New Gallery
                </button>
                {#each galleries as g (g.id)}
                    <button type="button" class="list-group-item list-group-item-action" class:active={gallery.id === g.id} onclick={() => selectGallery(g)}>
                        {g.name}
                    </button>
                {/each}
            </div>
        </div>

        <div class="col-md-8">
            <h2>{gallery.id ? 'Edit Gallery' : 'Create Gallery'}</h2>
            <form onsubmit={handleSaveGallery}>
                <div class="mb-3">
                    <label for="galleryName" class="form-label">Name</label>
                    <input type="text" class="form-control" id="galleryName" bind:value={gallery.name} required>
                </div>
                <div class="mb-3">
                    <label for="galleryDescription" class="form-label">Description</label>
                    <textarea class="form-control" id="galleryDescription" rows="3" bind:value={gallery.description}></textarea>
                </div>
                <button type="submit" class="btn btn-primary">{gallery.id ? 'Save Changes' : 'Create Gallery'}</button>
                {#if gallery.id}
                    <button type="button" class="btn btn-danger ms-2" onclick={handleDeleteGallery}>Delete Gallery</button>
                {/if}
            </form>

            {#if gallery.id}
                <hr class="my-4">

                <h3>Add Book to Gallery</h3>
                <div class="input-group mb-3">
                    <select class="form-select" bind:value={selectedBook}>
                        <option value="" disabled>Select a book</option>
                        {#each userBooks.filter(ub => !booksInGallery.some(bg => bg.id === ub.id)) as book (book.id)}
                            <option value={book.id}>{book.title}</option>
                        {/each}
                    </select>
                    <button class="btn btn-outline-secondary" type="button" onclick={handleAddBook} disabled={!selectedBook}>Add Book</button>
                </div>

                <h3>Books in this Gallery</h3>
                <ul class="list-group">
                    {#each booksInGallery as book (book.id)}
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <a href="/content/{book.id}" target="_blank" rel="noopener noreferrer">{book.title}</a>
                            <button class="btn btn-sm btn-danger" aria-label="Click to remove from gallery" onclick={() => handleRemoveBook(book.id)} use:tooltip={{...tooltipConfig}} title="Remove from gallery">
                                <i class="fas fa-trash"></i>
                            </button>
                        </li>
                    {:else}
                        <li class="list-group-item">This gallery is empty.</li>
                    {/each}
                </ul>
            {/if}
        </div>
    </div>
</div>
