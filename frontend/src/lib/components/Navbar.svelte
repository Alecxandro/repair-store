<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import 'bulma/css/bulma.min.css';

    // Logout function
    function logout() {
        localStorage.removeItem('token');
        goto('/');
    }

    // Check if a route is active
    function isActive(path) {
        return $page.url.pathname.startsWith(path);
    }
</script>

<nav class="navbar is-light" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
        <a href="/dashboard" class="navbar-item">
            <strong>Repair Shop</strong>
        </a>

        <a 
            role="button" 
            class="navbar-burger" 
            aria-label="menu" 
            aria-expanded="false" 
            on:click={() => {
                const burger = document.querySelector('.navbar-burger');
                const menu = document.querySelector('.navbar-menu');
                burger.classList.toggle('is-active');
                menu.classList.toggle('is-active');
            }}
        >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
        </a>
    </div>

    <div class="navbar-menu">
        <div class="navbar-start">
            <a 
                href="/dashboard" 
                class="navbar-item {isActive('/dashboard') ? 'is-active' : ''}"
            >
                Início
            </a>

            <a 
                href="/dashboard/customers" 
                class="navbar-item {isActive('/customers') ? 'is-active' : ''}"
            >
                Clientes
            </a>

            <a 
                href="/dashboard/repair" 
                class="navbar-item {isActive('/repairs') ? 'is-active' : ''}"
            >
                Reparos
            </a>

            <a 
                href="/config" 
                class="navbar-item {isActive('/config') ? 'is-active' : ''}"
            >
                Configurações
            </a>
        </div>

        <div class="navbar-end">
            <div class="navbar-item">
                <div class="buttons">
                    <button 
                        class="button is-light" 
                        on:click={logout}
                    >
                        Log out
                    </button>
                </div>
            </div>
        </div>
    </div>
</nav>

<style>
    /* Optional: Add some subtle styling */
    .navbar-item.is-active {
        font-weight: bold;
        background-color: #f5f5f5;
    }
</style>