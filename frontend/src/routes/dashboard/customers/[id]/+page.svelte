<script>
    import { onMount } from 'svelte';
    import axios from 'axios';
    import Navbar from '$lib/components/Navbar.svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import 'bulma/css/bulma.min.css';

    let customer = null;
    let repairs = [];
    let isLoading = true;
    let error = null;

    // Fetch specific customer details and repairs
    async function fetchCustomerDetails() {
        try {
            // Extract customer ID from the route
            const customerId = $page.params.id;
            const token = localStorage.getItem('token');
            
            if (!token) {
                goto('/login');
                return;
            }

            // Fetch customer details
            const customerResponse = await axios.get(`http://localhost:5000/api/repair/customer/get-customer/${customerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            customer = customerResponse.data;

            // Fetch customer's repairs
            const repairsResponse = await axios.get(`http://localhost:5000/api/repair/customer/get-customers-repairs/${customerId}`, {
               
            headers: { Authorization: `Bearer ${token}` }
            });
            
            repairs = repairsResponse.data;
            isLoading = false;
        } catch (err) {
            error = err.response?.data?.message || 'Failed to fetch customer details';
            isLoading = false;
            
            if (err.response?.status === 401) {
                goto('/login');
            }
        }
    }

    // Edit customer functionality
    let isEditing = false;
    let editedCustomer = {};

    function startEditing() {
        editedCustomer = { ...customer };
        isEditing = true;
    }

    async function updateCustomer() {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/repair/customer/update-customer/${customer._id}`, 
                editedCustomer,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            customer = response.data;
            isEditing = false;
        } catch (err) {
            error = err.response?.data?.message || 'Failed to update customer';
        }
    }

    // Delete customer
    async function deleteCustomer() {
        if (!confirm('Are you sure you want to delete this customer?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/repair/customer/${customer._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            goto('/customers');
        } catch (err) {
            error = err.response?.data?.message || 'Failed to delete customer';
        }
    }

    // Lifecycle method to fetch customer details
    onMount(fetchCustomerDetails);

    // Helper function to format date
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }
</script>

<Navbar/>
<section class="section">
    <div class="container">
        {#if error}
            <div class="notification is-danger">
                {error}
            </div>
        {/if}

        {#if isLoading}
            <progress class="progress is-primary" max="100">Loading</progress>
        {:else if customer}
            <div class="card mb-4">
                <header class="card-header">
                    <p class="card-header-title is-size-3"> { customer.name }</p>
                </header>
                
                {#if !isEditing}
                    <div class="card-content">
                        <div class="content">
                            <p><strong>Email:</strong> {customer.email}</p>
                            <p><strong>Phone:</strong> {customer.phone || 'N/A'}</p>
                            <p><strong>Address:</strong> {customer.address || 'N/A'}</p>
                        </div>
                    </div>
                {:else}
                    <div class="card-content">
                        <div class="field">
                            <label class="label">Name</label>
                            <div class="control">
                                <input 
                                    class="input" 
                                    type="text" 
                                    bind:value={editedCustomer.name}
                                    placeholder="Customer Name"
                                    required
                                >
                            </div>
                        </div>

                        <div class="field">
                            <label class="label">Email</label>
                            <div class="control">
                                <input 
                                    class="input" 
                                    type="email" 
                                    bind:value={editedCustomer.email}
                                    placeholder="Customer Email"
                                    required
                                >
                            </div>
                        </div>

                        <div class="field">
                            <label class="label">Phone</label>
                            <div class="control">
                                <input 
                                    class="input" 
                                    type="tel" 
                                    bind:value={editedCustomer.phone}
                                    placeholder="Customer Phone"
                                >
                            </div>
                        </div>

                        <div class="field">
                            <label class="label">Address</label>
                            <div class="control">
                                <textarea 
                                    class="textarea" 
                                    bind:value={editedCustomer.address}
                                    placeholder="Customer Address"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                {/if}

                <footer class="card-footer">
                    {#if !isEditing}
                        <a href="#" class="card-footer-item" on:click|preventDefault={startEditing}>
                            Edit
                        </a>
                        <a href="#" class="card-footer-item has-text-danger" on:click|preventDefault={deleteCustomer}>
                            Delete
                        </a>
                        <a href="/dashboard/customers" class="card-footer-item">
                            Back to List
                        </a>
                    {:else}
                        <a href="#" class="card-footer-item is-success" on:click|preventDefault={updateCustomer}>
                            Save Changes
                        </a>
                        <a href="#" class="card-footer-item" on:click|preventDefault={() => isEditing = false}>
                            Cancel
                        </a>
                    {/if}
                </footer>
            </div>

            <!-- Repairs Section -->
            <div class="card">
                <header class="card-header">
                    <p class="card-header-title">Repair History</p>
                </header>
                
                {#if repairs.length === 0}
                    <div class="card-content">
                        <p>No repair history found for this customer.</p>
                    </div>
                {:else}
                    <div class="card-content">
                        <table class="table is-fullwidth is-striped">
                            <thead>
                                <tr>
                                    <th>Device</th>
                                    <th>Brand/Model</th>
                                    <th>Problem</th>
                                    <th>Status</th>
                                    <th>Estimated Cost</th>
                                    <th>Completion Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each repairs as repair}
                                    <tr>
                                        <td>{repair.deviceType}</td>
                                        <td>{repair.brand} {repair.model}</td>
                                        <td>{repair.problemDescription}</td>
                                        <td>
                                            <span class={`tag ${
                                                repair.status === 'completed' ? 'is-success' :
                                                repair.status === 'in-progress' ? 'is-warning' :
                                                repair.status === 'cancelled' ? 'is-danger' :
                                                'is-info'
                                            }`}>
                                                {repair.status}
                                            </span>
                                        </td>
                                        <td>${repair.estimatedCost.toFixed(2)}</td>
                                        <td>{repair.completionDate ? formatDate(repair.completionDate) : 'N/A'}</td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</section>