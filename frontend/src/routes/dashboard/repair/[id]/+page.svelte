<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import axios from 'axios';
	import Navbar from '$lib/components/Navbar.svelte';
	import 'bulma/css/bulma.min.css';
	import '@fortawesome/fontawesome-free/css/all.min.css';

	const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

	let repair = null;
	let loading = true;
	let error = null;
	let editMode = false;
	let editedRepair = null;
	let submissionError = null;
	let showDeleteConfirmModal = false;
	let deleting = false;

	function handleError(err, defaultMessage) {
		console.error('Full error:', err);
		error = err.response?.data?.message || defaultMessage;
		if (err.response?.status === 401) {
			goto('/');
		}
	}

	async function fetchRepairDetails() {
		try {
			loading = true;
			const repairId = $page.params.id;

			const response = await axios.get(`${API_BASE_URL}/api/repair/repair/get-repair/${repairId}`, {
				withCredentials: true
			});

			repair = response.data;
			editedRepair = { ...repair };
		} catch (err) {
			handleError(err, 'Failed to fetch repair details');
		} finally {
			loading = false;
		}
	}

	async function updateRepair() {
		submissionError = null;
		try {
			const response = await axios.put(
				`${API_BASE_URL}/api/repair/repair/update-repair/${repair._id}`,
				{
					status: editedRepair.status,
					deviceType: editedRepair.deviceType,
					brand: editedRepair.brand,
					model: editedRepair.model,
					problemDescription: editedRepair.problemDescription,
					estimatedCost: editedRepair.estimatedCost,
					repairNotes: editedRepair.repairNotes,
					completionDate: editedRepair.completionDate
				},
				{
					withCredentials: true
				}
			);

			location.reload();
		} catch (err) {
			console.error('Repair update error:', err);
			submissionError = err.response?.data?.message || 'Failed to update repair';
		}
	}

	async function deleteRepair() {
		try {
			deleting = true;

			await axios.delete(`${API_BASE_URL}/api/repair/repair/delete-repair/${repair._id}`, {
				withCredentials: true
			});

			goto('/dashboard/repair');
		} catch (err) {
			console.error('Repair deletion error:', err);
			submissionError = err.response?.data?.message || 'Failed to delete repair';
			deleting = false;
		}
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

	onMount(() => {
		fetchRepairDetails();
	});
</script>

<Navbar />

<section class="section">
	<div class="container">
		{#if loading}
			<progress class="progress is-primary" max="100">Loading</progress>
		{:else if error}
			<div class="notification is-danger">{error}</div>
		{:else if repair}
			<div class="card">
				<header class="card-header">
					<p class="card-header-title">
						Reparo - {repair.deviceType}
					</p>
					<div class="card-header-icon">
						<div class="buttons">
							<button
								class="button is-small is-light"
								aria-label="edit"
								on:click={() => {
									editMode = !editMode;
									editedRepair = { ...repair };
								}}
							>
								<span class="icon">
									<i class="fas {editMode ? 'fa-times' : 'fa-edit'}"></i>
								</span>
								<span>{editMode ? 'Cancelar' : 'Editar'}</span>
							</button>
							<button
								class="button is-small is-danger"
								aria-label="delete"
								on:click={() => (showDeleteConfirmModal = true)}
							>
								<span class="icon">
									<i class="fas fa-trash"></i>
								</span>
								<span>Apagar</span>
							</button>
							<a class="button is-small is-primary" href="/dashboard/repair">
								<span class="icon">
									<i class="fas fa-backspace"></i>
								</span>
								<span>Voltar</span>
							</a>
						</div>
					</div>
				</header>

				{#if submissionError}
					<div class="notification is-danger">{submissionError}</div>
				{/if}

				{#if !editMode}
					<div class="card-content">
						<div class="content">
							<div class="columns">
								<div class="column">
									<strong>Cliente:</strong>
									{repair.customer ? repair.customer.name : 'N/A'}
								</div>
								<div class="column">
									<strong>Dispositivo:</strong>
									{repair.brand}
									{repair.model}
								</div>
							</div>

							<div class="columns">
								<div class="column">
									<strong>Tipo de dispositivo:</strong>
									{repair.deviceType}
								</div>
								<div class="column">
									<strong>Status:</strong>
									<span class={`tag ${getStatusClass(repair.status)}`}>
										{repair.status}
									</span>
								</div>
							</div>

							<div class="columns">
								<div class="column">
									<strong>Preço do reparo:</strong>
									${repair.estimatedCost}
								</div>
								{#if repair.completionDate}
									<div class="column">
										<strong>Data:</strong>
										{new Date(repair.completionDate).toLocaleDateString()}
									</div>
								{/if}
							</div>

							<div class="block">
								<strong>Descrição do Problema:</strong>
								<p>{repair.problemDescription}</p>
							</div>

							{#if repair.repairNotes}
								<div class="block">
									<strong>Observações:</strong>
									<p>{repair.repairNotes}</p>
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<div class="card-content">
						<form on:submit|preventDefault={updateRepair}>
							<div class="field">
								<label class="label">Status</label>
								<div class="control">
									<div class="select is-fullwidth">
										<select bind:value={editedRepair.status} required>
											<option value="pending">Pendente</option>
											<option value="in-progress">In Progress</option>
											<option value="completed">Completed</option>
											<option value="cancelled">Cancelled</option>
										</select>
									</div>
								</div>
							</div>

							<div class="field">
								<label class="label">Device Type</label>
								<div class="control">
									<div class="select is-fullwidth">
										<select bind:value={editedRepair.deviceType} required>
											<option value="smartphone">Smartphone</option>
											<option value="laptop">Laptop</option>
											<option value="tablet">Tablet</option>
											<option value="desktop">Desktop</option>
											<option value="smartwatch">Smartwatch</option>
											<option value="other">Other</option>
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
										bind:value={editedRepair.brand}
										placeholder="Insira a marca"
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
										bind:value={editedRepair.model}
										placeholder="Enter model"
										required
									/>
								</div>
							</div>

							<div class="field">
								<label class="label">Descrição do problema</label>
								<div class="control">
									<textarea
										class="textarea"
										bind:value={editedRepair.problemDescription}
										placeholder="Describe the repair issue"
										required
									></textarea>
								</div>
							</div>

							<div class="field">
								<label class="label">Preço do reparo</label>
								<div class="control">
									<input
										class="input"
										type="number"
										bind:value={editedRepair.estimatedCost}
										placeholder="Enter estimated cost"
										min="0"
										step="0.01"
										required
									/>
								</div>
							</div>

							<div class="field">
								<label class="label">Observações (Opcional)</label>
								<div class="control">
									<textarea
										class="textarea"
										bind:value={editedRepair.repairNotes}
										placeholder="Additional repair notes"
									></textarea>
								</div>
							</div>

							<div class="field">
								<label class="label">Data (opcional)</label>
								<div class="control">
									<input class="input" type="date" bind:value={editedRepair.completionDate} />
								</div>
							</div>

							<div class="field is-grouped">
								<div class="control">
									<button type="submit" class="button is-primary">Atualizar</button>
								</div>
								<div class="control">
									<button type="button" class="button is-light" on:click={() => (editMode = false)}>
										Cancelar
									</button>
								</div>
							</div>
						</form>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</section>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirmModal}
	<div class="modal is-active">
		<div class="modal-background" on:click={() => (showDeleteConfirmModal = false)}></div>
		<div class="modal-card">
			<header class="modal-card-head">
				<p class="modal-card-title">Confirmar exclusão</p>
				<button class="delete" aria-label="close" on:click={() => (showDeleteConfirmModal = false)}
				></button>
			</header>
			<section class="modal-card-body">
				Deseja apagar essa manutenção? Essa ação não poderá ser desfeita.
			</section>
			<footer class="modal-card-foot">
				<button class="button is-danger" on:click={deleteRepair} disabled={deleting}>
					{#if deleting}
						<span class="icon"><i class="fas fa-spinner fa-spin"></i></span>
						<span>Apagando...</span>
					{:else}
						<span class="icon"><i class="fas fa-trash"></i></span>
						<span>Apagar Reparo</span>
					{/if}
				</button>
				<button
					class="button ml-1"
					on:click={() => (showDeleteConfirmModal = false)}
					disabled={deleting}
				>
					Cancelar
				</button>
			</footer>
		</div>
	</div>
{/if}

<style>
	.card-content {
		word-break: break-word;
	}
</style>
