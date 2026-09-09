<script>
    import {page} from "$app/state";
    import autoAnimate from '@formkit/auto-animate';
    /** @type {{children?: import('svelte').Snippet}} */
    let { children } = $props();

    const groups = [
        {
            label: 'Moderate',
            links: [
                { href: '/admin/dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
                { href: '/admin/dashboard/users', icon: 'fa-users', label: 'Users' },
                { href: '/admin/dashboard/content', icon: 'fa-file-alt', label: 'Content' },
                { href: '/admin/dashboard/reports', icon: 'fa-flag', label: 'Reports' },
            ]
        },
        {
            label: 'System',
            links: [
                { href: '/admin/dashboard/migrations', icon: 'fa-right-left', label: 'Migrations' },
                { href: '/admin/dashboard/newsletter', icon: 'fa-envelope', label: 'Newsletter' },
            ]
        }
    ];

    function isActive(href) {
        return href === '/admin/dashboard'
            ? page.url.pathname === href
            : page.url.pathname === href || page.url.pathname.startsWith(href + '/');
    }
</script>

<div class="row g-0 admin-shell">
    <nav class="col-12 col-lg-2 admin-nav navbar navbar-expand-lg navbar-dark bg-black bg-opacity-10 rounded-bottom-4 rounded-lg-end-0 border-bottom border-lg-bottom-0 border-lg-end border-light-subtle px-3 py-2 py-lg-3" aria-label="Admin sections">
        <div class="d-flex w-100 align-items-center justify-content-between gap-2">
            <span class="navbar-brand mb-0 h6 d-lg-none"><i class="fas fa-shield-halved me-2" aria-hidden="true"></i>Admin</span>
            <button class="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#adminNav" aria-controls="adminNav" aria-expanded="false" aria-label="Toggle admin navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
        </div>
        <div class="collapse navbar-collapse" id="adminNav">
            <ul class="navbar-nav flex-column w-100 text-start text-lg-center gap-1 py-2">
                {#each groups as group (group.label)}
                    <li class="nav-caption" aria-hidden="true">{group.label}</li>
                    {#each group.links as link (link.href)}
                        <li class="nav-item">
                            <a
                                class="nav-link admin-link d-flex align-items-center gap-2 px-3 py-2 rounded-3 {isActive(link.href) ? 'active' : ''}"
                                href={link.href}
                                aria-current={isActive(link.href) ? 'page' : undefined}
                            >
                                <i class="fas {link.icon} fa-fw" aria-hidden="true"></i> {link.label}
                            </a>
                        </li>
                    {/each}
                {/each}
            </ul>
        </div>
    </nav>

    <div class="col-12 col-lg-10">
        <div class="container py-3 admin-content" use:autoAnimate>
            {@render children?.()}
        </div>
    </div>
</div>

<style>
    .admin-shell {
        min-height: calc(100vh - 140px);
    }
    .admin-nav {
        background: transparent;
    }
    @media (min-width: 992px) {
        .admin-nav {
            position: sticky;
            top: 0;
            align-self: flex-start;
            min-height: calc(100vh - 140px);
        }
    }
    .admin-link {
        min-height: 48px;
    }
    .admin-link.active {
        background: hsl(273, 100%, 33%);
        color: #fff;
    }
    .nav-caption {
        list-style: none;
        font-size: 0.7rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: hsl(0, 0%, 60%);
        padding: 0.75rem 1rem 0.15rem;
    }
    .admin-content {
        min-height: 60vh;
    }
</style>