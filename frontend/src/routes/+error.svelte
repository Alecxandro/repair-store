<script>
    import { page } from '$app/stores';
</script>

<div class="error-container">
    <h1>{$page.status}: {$page.error?.message}</h1>
</div>

<style>
    .error-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }
</style> 