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

	async function fetchCustomerDetails() {
		try {
			const customerId = $page.params.id;

			const customerResponse = await axios.get(
				`http://localhost:5000/api/repair/customer/get-customer/${customerId}`,
				{
					withCredentials: true
				}
			);

			customer = customerResponse.data;

			const repairsResponse = await axios.get(
				`http://localhost:5000/api/repair/customer/get-customers-repairs/${customerId}`,
				{
					withCredentials: true
				}
			);

			repairs = repairsResponse.data;
			isLoading = false;
		} catch (err) {
			error = err.response?.data?.message || 'Failed to fetch customer details';
			isLoading = false;

			if (err.response?.status === 401) {
				goto('/');
			}
		}
	}

	let isEditing = false;
	let editedCustomer = {};

	function startEditing() {
		editedCustomer = { ...customer };
		isEditing = true;
	}

	async function updateCustomer() {
		try {
			const response = await axios.put(
				`http://localhost:5000/api/repair/customer/update-customer/${customer._id}`,
				editedCustomer,
				{ withCredentials: true }
			);

			customer = response.data;
			isEditing = false;
		} catch (err) {
			error = err.response?.data?.message || 'Failed to update customer';
		}
	}

	async function deleteCustomer() {
		if (!confirm('Are you sure you want to delete this customer?')) return;

		try {
			await axios.delete(`http://localhost:5000/api/repair/customer/${customer._id}`, {
				withCredentials: true
			});

			goto('/customers');
		} catch (err) {
			error = err.response?.data?.message || 'Failed to delete customer';
		}
	}

	onMount(fetchCustomerDetails);

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString();
	}
</script>

<Navbar />
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
					<p class="card-header-title is-size-3">{customer.name}</p>
					<div class="card-header-icon">
						<div class="buttons">
							{#if !isEditing}
								<a href="#" class="button is-small is-light" on:click|preventDefault={startEditing}>
									<span class="icon">
										<i class="fas {isEditing ? 'fa-times' : 'fa-edit'}"></i>
									</span>
									Editar
								</a>

								<a
									href="#"
									class="button is-small is-danger"
									on:click|preventDefault={deleteCustomer}
								>
									<span class="icon">
										<i class="fas {isEditing ? 'fa-times' : 'fa-edit'}"></i>
									</span>
									Apagar
								</a>

								<a href="/dashboard/customers" class="button is-small is-primary"> Voltar </a>
							{:else}{/if}
						</div>
					</div>
				</header>

				{#if !isEditing}
					<div class="card-content">
						<div class="content">
							<p><strong>E-mail:</strong> {customer.email}</p>
							<p><strong>Telefone:</strong> {customer.phone || 'N/A'}</p>
							<p><strong>Endereço:</strong> {customer.address || 'N/A'}</p>
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
								/>
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
								/>
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
								/>
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
					{#if isEditing}
						<a
							href="#"
							class="card-footer-item is-success"
							on:click|preventDefault={updateCustomer}
						>
							Salvar
						</a>
						<a
							href="#"
							class="card-footer-item"
							on:click|preventDefault={() => (isEditing = false)}
						>
							Cancelar
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
											<span
												class={`tag ${
													repair.status === 'completed'
														? 'is-success'
														: repair.status === 'in-progress'
															? 'is-warning'
															: repair.status === 'cancelled'
																? 'is-danger'
																: 'is-info'
												}`}
											>
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
