<script>
    import { onMount } from 'svelte';
    import axios from 'axios';
    import { goto } from '$app/navigation';
    import 'bulma/css/bulma.min.css';
    import { Chart, registerables } from 'chart.js';
    import Navbar from '$lib/components/Navbar.svelte';
    Chart.register(...registerables);

    // Dashboard data structure
    let dashboardStats = {
        totalCustomers: 0,
        totalRepairs: 0,
        totalIncome: 0,
        repairStatusBreakdown: {},
        repairDeviceTypeBreakdown: {},
        recentActivity: {
            newCustomers: 0,
            newRepairs: 0
        }
    };

    let chartInstances = {};
    let isLoading = true;
    let error = null;

    // Fetch dashboard data
    async function fetchDashboardData() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                goto('/login');
                return;
            }

            const statsResponse = await axios.get('http://localhost:5000/api/repair/stats/get-stats', {
                headers: { Authorization: `Bearer ${token}` }
            });

            dashboardStats = statsResponse.data;
            isLoading = false;

            // Wait for next tick to ensure DOM is updated
            await new Promise(resolve => setTimeout(resolve, 0));
            createCharts();
        } catch (err) {
            error = err.response?.data?.message || 'Failed to fetch dashboard data';
            isLoading = false;
            
            if (err.response?.status === 401) {
                goto('/login');
            }
        }
    }

    // Create charts after data is loaded
    function createCharts() {
        // Destroy existing charts if they exist
        Object.values(chartInstances).forEach(chart => chart.destroy());
        chartInstances = {};

        
        const statusCtx = document.getElementById('statusBreakdownChart');
        if (statusCtx) {
            chartInstances.statusChart = new Chart(statusCtx, {
                type: 'pie',
                data: {
                    labels: Object.keys(dashboardStats.repairStatusBreakdown),
                    datasets: [{
                        data: Object.values(dashboardStats.repairStatusBreakdown),
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Repair Status Breakdown'
                        }
                    }
                }
            });
        }

        // Device Type Bar Chart
        const deviceCtx = document.getElementById('deviceTypeChart');
        if (deviceCtx) {
            chartInstances.deviceChart = new Chart(deviceCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(dashboardStats.repairDeviceTypeBreakdown),
                    datasets: [{
                        label: 'Repairs by Device Type',
                        data: Object.values(dashboardStats.repairDeviceTypeBreakdown),
                        backgroundColor: 'rgba(153, 102, 255, 0.6)'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }

   
    onMount(fetchDashboardData);
</script>

<svelte:head>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</svelte:head>

<Navbar />
<section class="section">
    <div class="container">
        <div class="columns">
            <div class="column is-12">
                <div class="level">
                    <div class="level-left">
                        <div class="level-item">
                            <h1 class="title">Repair Shop Dashboard</h1>
                        </div>
                    </div>
                    <div class="level-right">
                       
                    </div>
                </div>

                {#if error}
                    <div class="notification is-danger">
                        {error}
                    </div>
                {/if}

                {#if isLoading}
                    <progress class="progress is-primary" max="100">Loading</progress>
                {:else}
                    <div class="columns is-multiline">
                        <!-- Key Statistics Cards -->
                        <div class="column is-3">
                            <div class="card">
                                <div class="card-content">
                                    <div class="content has-text-centered">
                                        <p class="title is-4">{dashboardStats.totalCustomers}</p>
                                        <p class="subtitle is-6">Total Customers</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="column is-3">
                            <div class="card">
                                <div class="card-content">
                                    <div class="content has-text-centered">
                                        <p class="title is-4">{dashboardStats.totalRepairs}</p>
                                        <p class="subtitle is-6">Total Repairs</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="column is-3">
                            <div class="card">
                                <div class="card-content">
                                    <div class="content has-text-centered">
                                        <p class="title is-4">${dashboardStats.totalIncome.toLocaleString()}</p>
                                        <p class="subtitle is-6">Total Income</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="column is-3">
                            <div class="card">
                                <div class="card-content">
                                    <div class="content has-text-centered">
                                        <p class="title is-4">{dashboardStats.recentActivity.newRepairs}</p>
                                        <p class="subtitle is-6">New Repairs (30 Days)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Charts Section -->
                        <div class="column is-6">
                            <div class="card">
                                <div class="card-content">
                                    <canvas id="statusBreakdownChart"></canvas>
                                </div>
                            </div>
                        </div>

                        <div class="column is-6">
                            <div class="card">
                                <div class="card-content">
                                    <canvas id="deviceTypeChart"></canvas>
                                </div>
                            </div>
                        </div>

                        <!-- Recent Activity Card -->
                        <div class="column is-12">
                            <div class="card">
                                <header class="card-header">
                                    <p class="card-header-title">Recent Activity (Last 30 Days)</p>
                                </header>
                                <div class="card-content">
                                    <div class="columns">
                                        <div class="column has-text-centered">
                                            <p class="heading">New Customers</p>
                                            <p class="title">{dashboardStats.recentActivity.newCustomers}</p>
                                        </div>
                                        <div class="column has-text-centered">
                                            <p class="heading">New Repairs</p>
                                            <p class="title">{dashboardStats.recentActivity.newRepairs}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</section>

<style>
    .card-content canvas {
        max-height: 300px;
    }
</style>