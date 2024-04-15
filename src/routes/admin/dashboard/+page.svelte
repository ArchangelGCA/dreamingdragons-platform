<script>

</script>

<div class="container-fluid py-2">
    <div class="row text-center mb-2 mt-1">
        <div class="col-md-12">
            <h2>Admin Dashboard (TODO)</h2>
        </div>
    </div>
    <div class="row">
        <div class="col-lg-6 col-md-12 mb-3">
            <div class="card bg-black bg-opacity-25 text-white border-purple">
                <div class="card-body text-center">
                    <i class="fas fa-users fa-3x mb-3 purple"></i>
                    <h5 class="card-title">Manage Users</h5>
                    <p class="card-text">Click here to manage users</p>
                    <a href="/admin/dashboard/users" class="btn btn-users">Go to Users</a>
                </div>
            </div>
        </div>
        <div class="col-lg-6 col-md-12 mb-3">
            <div class="card bg-black bg-opacity-25 text-white border-purple-content">
                <div class="card-body text-center">
                    <i class="fas fa-file-alt fa-3x mb-3 purple-content"></i>
                    <h5 class="card-title">Manage Content</h5>
                    <p class="card-text">Click here to manage content</p>
                    <a href="/admin/dashboard/content" class="btn btn-content">Go to Content</a>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .purple {
        color: #bd135a;
    }

    .border-purple {
        border-color: #bd135a;
    }

    .btn-users {
        background-color: #bd135a;
        color: white;
    }

    .btn-users:hover {
        background-color: rgba(189, 19, 90, 0.75);
        color: white;
    }

    .btn-users:active {
        background-color: rgba(189, 19, 90, 0.75);
        color: white;
    }

    .purple-content {
        color: #7f13bd;
    }

    .border-purple-content {
        border-color: #7f13bd;
    }

    .btn-content {
        background-color: #7f13bd;
        color: white;
    }

    .btn-content:hover {
        background-color: rgba(127, 19, 189, 0.75);
        color: white;
    }

    .btn-content:active {
        background-color: rgba(127, 19, 189, 0.75);
        color: white;
    }
</style>