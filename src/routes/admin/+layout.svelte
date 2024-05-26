<script>
    import Seo from "sk-seo";
    import {page} from "$app/stores";
    import autoAnimate from '@formkit/auto-animate';

</script>

<Seo
    title="Roses In The Flames - Admin Dashboard"
    description="Admin Dashboard for Roses In The Flames."
    index="false"
/>

<div class="row">
    <nav class="col-lg-2 navbar navbar-expand-lg navbar-dark bg-black bg-opacity-10 rounded-end-3 border-end border-light-subtle pt-1 px-3">
        <button class="navbar-toggler w-100" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav flex-column w-100 text-center">
                <li class="nav-item">
                    <a class="nav-link {$page.url.pathname === '/admin/dashboard' ? 'active' : ''}" href="/admin/dashboard">
                        <i class="fas fa-tachometer-alt"></i> Dashboard
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {$page.url.pathname === '/admin/dashboard/users' ? 'active' : ''}" href="/admin/dashboard/users">
                        <i class="fas fa-users"></i> Users
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {$page.url.pathname === '/admin/dashboard/content' ? 'active' : ''}" href="/admin/dashboard/content">
                        <i class="fas fa-file-alt"></i> Content
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {$page.url.pathname === '/admin/dashboard/reports' ? 'active' : ''}" href="/admin/dashboard/reports">
                        <i class="fas fa-flag"></i> Reports
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {$page.url.pathname === '/admin/dashboard/migrations' ? 'active' : ''}" href="/admin/dashboard/migrations">
                        <i class="fas fa-exchange"></i> Migrations
                    </a>
                </li>
            </ul>
        </div>
    </nav>

    <div class="col-12 col-lg-10 overflow-auto">
        <div class="container py-3" style="height: 100vh" use:autoAnimate>
            <slot></slot>
        </div>
    </div>
</div>