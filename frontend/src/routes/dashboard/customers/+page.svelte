<script>
	import { onMount } from 'svelte';
	import axios from 'axios';
	import 'bulma/css/bulma.min.css';
	import { goto } from '$app/navigation';
	import Navbar from '$lib/components/Navbar.svelte';
	import { page } from '$app/stores';

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

	let submissionError = null;	
	let customerToDelete = null;
	let customers = [];
	let filteredCustomers = [];
	let isLoading = true;
	let error = null;
	let showCreateModal = false;
	let showDeleteConfirmModal = false;
	let deleting = false
	let searchTerm = '';
	let newCustomer = {
		name: '',
		email: '',
		phone: '',
		address: ''
	};

	
	function handleError(err, defaultMessage) {
		error = err.response?.data?.message || defaultMessage;
		if (err.response?.status === 401) {
			goto('/login');
		}
	}

	async function fetchCustomers() {
		try {
			isLoading = true;
			
			const response = await axios.get(`${API_BASE_URL}/api/repair/customer/get-customers`, {
				withCredentials: true
			});
			customers = response.data;
			filteredCustomers = customers;
		} catch (err) {
			handleError(err, 'Failed to fetch customers');
		} finally {
			isLoading = false;
		}
	}

	async function createCustomer() {
		try {
			
			const response = await axios.post(
				`${API_BASE_URL}/api/repair/customer/create-customer`,
				newCustomer,
				{ withCredentials: true }
			);
			customers = [...customers, response.data];
			filteredCustomers = customers;
			showCreateModal = false;
		} catch (err) {
			handleError(err, 'Failed to create customer');
		}
	}

	async function deleteCustomer(customerId) {
		try {
			
			
			await axios.delete(`${API_BASE_URL}/api/repair/customer/delete-customer/${customerId}`, {
				withCredentials: true
			});

			
			location.reload()
		} catch (err) {
			console.error('Repair deletion error:', err);
			submissionError = err.response?.data?.message || 'Failed to delete repair';
			
		}
	}


	function filterCustomers() {
		filteredCustomers = customers.filter((customer) =>
			`${customer.name} ${customer.email} `.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}

	$: searchTerm, filterCustomers();

	onMount(fetchCustomers);
</script>

<Navbar />
<section class="section">
	<div class="container">
		<h1 class="title">Gerenciar Clientes</h1>

		{#if error}
			<div class="notification is-danger">
				{error}
			</div>
		{/if}

		<div class="level">
			<div class="level-left">
				<div class="level-item">
					<button class="button is-primary" on:click={() => (showCreateModal = true)}>
						<span class="icon"><i class="fas fa-plus"></i></span>
						<span>Novo Cliente</span>
					</button>
				</div>
			</div>
		</div>

		<div class="field">
			<div class="control">
				<input
					class="input"
					type="text"
					bind:value={searchTerm}
					placeholder="Busque por nome ou e-mail"
				/>
			</div>
		</div>

		{#if isLoading}
			<progress class="progress is-primary" max="100">Loading</progress>
		{:else if filteredCustomers.length === 0}
			<div class="notification">
				{searchTerm
					? `No customers found matching "${searchTerm}".`
					: 'No customers found. Add a new customer to get started.'}
			</div>
		{:else}
			<table class="table is-fullwidth is-striped is-hoverable">
				<thead>
					<tr>
						<th>Nome</th>
						<th>E-mail</th>
						<th>Telefone</th>
						<th> Ações</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredCustomers as customer (customer._id)}
						<tr>
							<td>{customer.name}</td>
							<td>{customer.email}</td>
							<td>{customer.phone || 'N/A'}</td>
							<td>
								<div class="buttons are-small">
									<button
										class="button is-info is-light"
										on:click={() => goto(`/dashboard/customers/${customer._id}`)}
									>
										Visualizar
									</button>
									<button
									class="button is-danger is-light"
									on:click={() => {
										customerToDelete = customer;
										showDeleteConfirmModal = true;
									}}
								>
									Apagar
								</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</section>

{#if showDeleteConfirmModal}
<div class="modal is-active">
    <div class="modal-background" on:click={() => {
        showDeleteConfirmModal = false;
        customerToDelete = null;
    }}></div>
    <div class="modal-card">
        <header class="modal-card-head">
            <p class="modal-card-title">Confirmar exclusão</p>
            <button 
                class="delete" 
                aria-label="close" 
                on:click={() => {
                    showDeleteConfirmModal = false;
                    customerToDelete = null;
                }}
            ></button>
        </header>
        <section class="modal-card-body">
           Deseja apagar esse cliente? Essa ação não poderá ser desfeita.
        </section>
        <footer class="modal-card-foot">
            <button 
                class="button is-danger" 
                on:click={() => {
                    if (customerToDelete) {
                        deleteCustomer(customerToDelete._id);
                        showDeleteConfirmModal = false;
                    }
                }}
                disabled={deleting}
            >
                {#if deleting}
                    <span class="icon"><i class="fas fa-spinner fa-spin"></i></span>
                    <span>Apagando...</span>
                {:else}
                    <span class="icon"><i class="fas fa-trash"></i></span>
                    <span>Apagar Cliente</span>
                {/if}
            </button>
        
            <button 
                class="button ml-2"
                on:click={() => {
                    showDeleteConfirmModal = false;
                    customerToDelete = null;
                }}
            >
                Cancelar
            </button>
        </footer>
    </div>
</div>
{/if}

{#if showCreateModal}
	<div class="modal is-active">
		<div class="modal-background" on:click={() => (showCreateModal = false)}></div>
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title"><b>Cadastrar Cliente</b></p>
				<button class="delete" aria-label="close" on:click={() => (showCreateModal = false)}
				></button>
			</header>
			<section class="modal-card-body">
                <label class="label">Cliente</label>
				<input
					class="input mb-3"
					type="text"
					bind:value={newCustomer.name}
					placeholder="Nome do cliente"
					required
				/>
                <label class="label">Email</label>
				<input
					class="input mb-3"
					type="email"
					bind:value={newCustomer.email}
					placeholder="E-mail do cliente"
					required
				/>
                
                <label class="label">Telefone</label>
				<input
					class="input mb-3"
					type="tel"
					bind:value={newCustomer.phone}
					placeholder="Insira o número do telefone"
				/>
                <label class="label">Endereço</label>
				<textarea class="textarea" bind:value={newCustomer.address} placeholder="Endereço do cliente"
				></textarea>
			</section>
			<footer class="modal-card-foot">
				<button
					class="button is-success"
					on:click={createCustomer}
					disabled={!newCustomer.name || !newCustomer.email}
				>
					Salvar
				</button>
                
				   <button class="button" on:click={() => (showCreateModal = false)}>Cancelar</button>
			</footer>
		</div>
	</div>
{/if}

<style>
	.table td {
		vertical-align: middle;
	}
</style>
