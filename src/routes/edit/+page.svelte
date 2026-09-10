<script>
</script>

<div class="container-fluid px-1 px-sm-2 px-md-3">
    <div class="row justify-content-center">
        <div class="col-12 col-lg-8">
            <!-- Header -->
            <div class="edit-header text-center mb-4">
                <h1 class="display-6 fw-bold gradient-text my-2">
                    <i class="fas fa-edit me-2"></i>
                    Edit Content
                </h1>
                <p class="text-muted">Update your tales and stories</p>
            </div>

            <!-- Error Message -->
            <div class="alert alert-danger text-center border-0 rounded-4 shadow-sm" role="alert">
                <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                <h4 class="alert-heading mb-2">Missing Book ID</h4>
                <p class="mb-2">No book ID was provided for editing.</p>
                <hr class="my-2">
                <p class="mb-0 small">
                    Please select a book from your profile or content page to edit.
                </p>
            </div>
        </div>
    </div>
</div>

<style>
    .gradient-text {
        color: #f0f8ff;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        font-weight: 700;
    }

    .edit-header {
        background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 22%),
            #04090f;
        border: 1px solid #1c3350;
        backdrop-filter: blur(20px);
        border-radius: 20px;
        padding: 2rem;
        margin-bottom: 2rem;
    }

    .alert-danger {
        background: rgba(217, 51, 51, 0.1);
        border: 1px solid rgba(217, 51, 51, 0.3);
        color: #f87171;
        border-radius: 16px;
    }

    .alert-heading {
        color: #ef4444;
    }

    .text-muted {
        color: #8ba3b0 !important;
    }

    /* Mobile Responsiveness */
    @media (max-width: 768px) {
        .edit-header {
            margin-left: -0.5rem;
            margin-right: -0.5rem;
            padding: 1.5rem 1rem;
        }
    }

    @media (max-width: 576px) {
        .edit-header {
            margin-left: -0.75rem;
            margin-right: -0.75rem;
            padding: 1rem 0.75rem;
        }
    }
</style>