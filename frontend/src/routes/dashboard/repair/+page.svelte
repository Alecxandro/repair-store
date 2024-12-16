<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import axios from 'axios';
	import Navbar from '$lib/components/Navbar.svelte';
	import 'bulma/css/bulma.min.css';

	let repairs = []; // Full repairs list
	let filteredRepairs = []; // Filtered list for display
	let searchTerm = ''; // User input for filtering
	let loading = true;
	let error = null;
	let showModal = false;
	let newRepair = {
		customerId: '',
		deviceType: '',
		brand: '',
		model: '',
		problemDescription: '',
		estimatedCost: null,
		repairNotes: '',
		completionDate: null
	};
	let customers = [];
	let submissionError = null;

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

	async function createRepair() {
		submissionError = null;
		try {
			console.log('Sending repair data:', newRepair);
			const response = await axios.post(
				`${API_BASE_URL}/api/repair/repair/create-repair`,
				newRepair,
				{ withCredentials: true }
			);

			repairs = [...repairs, response.data];
			newRepair = {
				customerId: '',
				deviceType: '',
				brand: '',
				model: '',
				problemDescription: '',
				estimatedCost: null,
				repairNotes: '',
				completionDate: null
			};
			showModal = false;
			location.reload();
		} catch (err) {
			console.error('Repair creation error:', err);
			submissionError = err.response?.data?.message || 'Failed to create repair';
		}
	}

	async function updateRepairStatus(repairId, newStatus) {
		try {
			await axios.put(
				`${API_BASE_URL}/api/repair/repair/update-repair/${repairId}`,
				{ status: newStatus },
				{ withCredentials: true }
			);
			await fetchRepairs();
		} catch (err) {
			handleError(err, 'Failed to update repair status');
		}
	}

	async function fetchCustomers() {
		try {
			const response = await axios.get(`${API_BASE_URL}/api/repair/customer/get-customers`, {
				withCredentials: true
			});
			customers = response.data;
		} catch (err) {
			handleError(err, 'Failed to fetch customers');
		}
	}

	// 4. Update fetchRepairs function
	async function fetchRepairs() {
		try {
			loading = true;
			const response = await axios.get(`${API_BASE_URL}/api/repair/repair/get-repairs`, {
				withCredentials: true
			});
			repairs = response.data;
			filterRepairs();
		} catch (err) {
			handleError(err, 'Failed to fetch repairs');
		} finally {
			loading = false;
		}
	}

	function handleError(err, defaultMessage) {
		console.error('Full error:', err);
		error = err.response?.data?.message || defaultMessage;
		if (err.response?.status === 401) {
			goto('/');
		}
	}

	function filterRepairs() {
		filteredRepairs = repairs.filter((repair) =>
			`${repair.customer.name} ${repair.deviceType} ${repair.brand} ${repair.model} ${repair.problemDescription}`
				.toLowerCase()
				.includes(searchTerm.toLowerCase())
		);
	}

	function getStatusClass(status) {
		switch (status) {
			case 'pending':
				return 'is-warning';
			case 'in-progress':
				return 'is-info';
			case 'completed':
				return 'is-success';
			case 'cancelled':
				return 'is-danger';
			default:
				return '';
		}
	}

	$: searchTerm, filterRepairs();

	onMount(() => {
		fetchRepairs();
		fetchCustomers();
	});
</script>

<Navbar />
<section class="section">
	<div class="container">
		<h1 class="title">Reparos</h1>
		<div class="level">
			<div class="level-left">
				<div class="level-item">
					<button on:click={() => (showModal = true)} class="button is-primary">
						<span class="icon"><i class="fas fa-plus"></i></span>
						<span>Novo Reparo</span>
					</button>
				</div>
			</div>
		</div>

		<div class="field">
			<div class="control">
				<input
					type="text"
					class="input"
					bind:value={searchTerm}
					placeholder="Busque por cliente, dispositivo, marca, modelo, ou problema"
				/>
			</div>
		</div>

		{#if loading}
			<progress class="progress is-primary" max="100">Loading</progress>
		{:else if error}
			<div class="notification is-danger">{error}</div>
		{:else if filteredRepairs.length === 0}
			<div class="notification">Não há reparos cadastrados ainda</div>
		{:else}
			<table class="table is-fullwidth is-striped is-hoverable">
				<thead>
					<tr>
						<th>Cliente</th>
						<th>Dispositivo</th>
						<th>Marca/Modelo</th>
						<th>Problema</th>
						<th>Status</th>
						<th>Valor</th>
						<th><center>Ações</center></th>
					</tr>
				</thead>
				<tbody>
					{#each filteredRepairs as repair}
						<tr>
							<td>{repair.customer.name}</td>
							<td>{repair.deviceType}</td>
							<td>{repair.brand} {repair.model}</td>
							<td>{repair.problemDescription}</td>
							<td>
								<span class={`tag ${getStatusClass(repair.status)}`}>
									{repair.status}
								</span>
							</td>
							<td>${repair.estimatedCost}</td>
							<td>
								<div class="buttons are-small">
									<a href={`/dashboard/repair/${repair._id}`} class="button is-info is-light"
										>Visualizar</a
									>
									<div class="select is-small">
										<select
											value={repair.status}
											on:change={(e) => updateRepairStatus(repair._id, e.target.value)}
										>
											<option value="pending">Pendente</option>
											<option value="in-progress">Em Andamento</option>
											<option value="completed">Concluído</option>
											<option value="cancelled">Cancelado</option>
										</select>
									</div>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</section>
{#if showModal}
	<div class="modal is-active">
		<div class="modal-background" on:click={() => (showModal = false)}></div>
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title"><b>Novo Reparo</b></p>
				<button class="delete" aria-label="close" on:click={() => (showModal = false)}></button>
			</header>
			<section class="modal-card-body">
				{#if submissionError}
					<div class="notification is-danger">{submissionError}</div>
				{/if}
				<form on:submit|preventDefault={createRepair}>
					<div class="field">
						<label class="label">Cliente</label>
						<div class="control">
							<div class="select is-fullwidth">
								<select bind:value={newRepair.customerId} required>
									<option value="">Escolha um cliente</option>
									{#each customers as customer}
										<option value={customer._id}>{customer.name} ({customer.email})</option>
									{/each}
								</select>
							</div>
						</div>
					</div>

					<div class="field">
						<label class="label">Dispositivo</label>
						<div class="control">
							<div class="select is-fullwidth">
								<select bind:value={newRepair.deviceType} required>
									<option value="">Selecione um dispositivo</option>
									<option value="smartphone">Smartphone</option>
									<option value="laptop">Notebok</option>
									<option value="tablet">Tablet</option>
									<option value="desktop">Desktop</option>
									<option value="smartwatch">Smartwatch</option>
									<option value="other">Outros</option>
								</select>
							</div>
						</div>
					</div>

					<div class="field">
						<label class="label">Marca</label>
						<div class="control">
							<input
								class="input"
								type="text"
								bind:value={newRepair.brand}
								placeholder="Digite uma marca"
								required
							/>
						</div>
					</div>

					<div class="field">
						<label class="label">Modelo</label>
						<div class="control">
							<input
								class="input"
								type="text"
								bind:value={newRepair.model}
								placeholder="Digite o modelo"
								required
							/>
						</div>
					</div>

					<div class="field">
						<label class="label">Descrição do problema</label>
						<div class="control">
							<textarea
								class="textarea"
								bind:value={newRepair.problemDescription}
								placeholder="Descreva o problema..."
								required
							></textarea>
						</div>
					</div>

					<div class="field">
						<label class="label">Custo do Reparo</label>
						<div class="control">
							<input
								class="input"
								type="number"
								bind:value={newRepair.estimatedCost}
								placeholder="Insira o preço"
								min="0"
								step="0.01"
								required
							/>
						</div>
					</div>

					<div class="field">
						<label class="label">Observações (opcional)</label>
						<div class="control">
							<textarea
								class="textarea"
								bind:value={newRepair.repairNotes}
								placeholder="Observações adicionais"
							></textarea>
						</div>
					</div>

					<div class="field">
						<label class="label">Data de conclusão do serviço (opcional)</label>
						<div class="control">
							<input class="input" type="date" bind:value={newRepair.completionDate} />
						</div>
					</div>

					<div class="field is-grouped">
						<div class="control">
							<button type="submit" class="button is-primary">Salvar</button>
						</div>
						<div class="control">
							<button type="button" class="button is-light" on:click={() => (showModal = false)}
								>Cancel</button
							>
						</div>
					</div>
				</form>
			</section>
		</div>
	</div>
{/if}

<style>
	.table td {
		vertical-align: middle;
	}
</style>
