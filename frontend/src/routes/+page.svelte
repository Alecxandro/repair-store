
<script>
    import { onMount } from 'svelte';
    import axios from 'axios';
    import { goto } from '$app/navigation';
    import 'bulma/css/bulma.min.css';

    let email = '';
    let password = '';
    let errorMessage = '';
    let isLoading = false;

    async function handleLogin() {
        // Reset previous error
        errorMessage = '';
        isLoading = true;

        try {
            const response = await axios.post('http://localhost:5000/api/repair/auth/login', {
                email,
                password
            });

            // Store token and user info in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));

            // Redirect to dashboard or home page
            goto('/dashboard');
        } catch (error) {
            // Handle login errors
            errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            console.error('Login error:', error);
        } finally {
            isLoading = false;
        }
    }

    // Optional: Add form validation
    $: loginDisabled = !email || !password || isLoading;

    // Optional: Check if already logged in
    onMount(() => {
        const token = localStorage.getItem('token');
        if (token) {
            goto('/dashboard');
        }
    });
</script>

<section class="section">
    <div class="container">
        <div class="columns is-centered">
            <div class="column is-half">
                <div class="card">
                    <div class="card-content">
                        <h2 class="title has-text-centered mb-5">Manutenção</h2>
                        
                        {#if errorMessage}
                            <div class="notification is-danger">
                                {errorMessage}
                            </div>
                        {/if}

                        <form on:submit|preventDefault={handleLogin}>
                            <div class="field">
                                <label class="label" for="email">Email address</label>
                                <div class="control has-icons-left">
                                    <input 
                                        type="email" 
                                        class="input" 
                                        id="email" 
                                        bind:value={email}
                                        required
                                        placeholder="Enter your email"
                                    >
                                    <span class="icon is-small is-left">
                                        <i class="fas fa-envelope"></i>
                                    </span>
                                </div>
                            </div>
                            
                            <div class="field">
                                <label class="label" for="password">Password</label>
                                <div class="control has-icons-left">
                                    <input 
                                        type="password" 
                                        class="input" 
                                        id="password" 
                                        bind:value={password}
                                        required
                                        placeholder="Enter your password"
                                    >
                                    <span class="icon is-small is-left">
                                        <i class="fas fa-lock"></i>
                                    </span>
                                </div>
                            </div>

                            <div class="field">
                                <div class="control">
                                    <button 
                                        type="submit" 
                                        class="button is-primary is-fullwidth" 
                                        disabled={loginDisabled}
                                    >
                                        {#if isLoading}
                                            <span class="loader"></span>
                                            Loading...
                                        {:else}
                                            Login
                                        {/if}
                                    </button>
                                </div>
                            </div>
                        </form>

                        
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<style>
    /* Custom loader for Bulma */
    .loader {
        border: 2px solid #fff;
        border-top: 2px solid transparent;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        animation: spin 1s linear infinite;
        margin-right: 10px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>

<!-- Add Font Awesome for icons -->
<svelte:head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
</svelte:head>