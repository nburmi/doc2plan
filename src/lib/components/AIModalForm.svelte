<script lang="ts">
	import type { SvelteComponent } from 'svelte';

	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { planStore } from '../../stores/plan';
	import { get } from 'svelte/store';

	import Fa from 'svelte-fa'
    import { faSpinner, faCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons'

	import { extractChapters as aiExtractChapters } from '$lib/openai';
   

	// Props
	/** Exposes parent props to this component. */
	export let parent: SvelteComponent;

	const modalStore = getModalStore();

	// Form Data
	const formData = {
		name: 'Jane Doe',
		tel: '214-555-1234',
		email: 'jdoe@email.com',
		extractChapters: false,
		extractTopics: false,
		quizes: false,
	};

	let chaptersMap = new Map();
	let chapters = get(planStore).chapters;

	planStore.subscribe((store) => {
		chapters = store.chapters;
	});

	// Add chapters to map
	chapters.forEach((chapter) => {
		chaptersMap.set(chapter, chapter);
	});

	// We've created a custom submit function to pass the response and close the modal.
	function onFormSubmit(): void {
		if ($modalStore[0].response) $modalStore[0].response(formData);
		modalStore.close();
	}

	async function extractChapters() {
		statusMessage = 'Extracting chapters';
		state = status.InProgress;

		try {
			await aiExtractChapters();
			chapters = await aiExtractChapters();
			state = status.Success;
			statusMessage = 'Chapters extracted';
		} catch (error) {
			statusMessage = 'Error extracting chapters';
			state = status.Error;
		}
	}

	async function extractTopics() {
		statusMessage = 'Extracting topics';
		state = status.InProgress;

		try {
			state = status.Success;
			statusMessage = 'Topics extracted';
		} catch (error) {
			statusMessage = 'Error extracting topics';
			state = status.Error;
		}
	}

	// Base Classes
	const cBase = 'card p-4 w-modal shadow-xl space-y-4';
	const cHeader = 'text-2xl font-bold';
	const cForm = 'p-4 space-y-4 ';

	$: disableExtractChapter = state === status.InProgress || !formData.extractChapters;
	$: disableExtractTopics = state === status.InProgress || !formData.extractTopics;

	let statusMessage = '';
	// enum for status
	const status = {
		Success: 'success',
		InProgress: 'in-progress',
		Error: 'error',
		Empty: '',
	};
	let state = status.Empty;
</script>

<!-- @component This example creates a simple form modal. -->

{#if $modalStore[0]}
	<div class="modal-example-form {cBase}">
		<header class={cHeader}>{$modalStore[0].title ?? '(title missing)'}</header>
		<!-- <article>{$modalStore[0].body ?? '(body missing)'}</article> -->
		<!-- Enable for debugging: -->
		<form class="modal-form {cForm}">			
			<div class="flex items-center space-x-2">
				<!-- button -->
				<button class="btn variant-filled-secondary [&>*]:pointer-events-none"  on:click={extractChapters} disabled={disableExtractChapter}>
					{#if state === status.InProgress}
						<Fa icon={faSpinner} class="animate-spin" />
					{:else}
						Extract Chapters
					{/if}
				</button>

				<!-- checkbox -->
				<label class="flex items-center space-x-2">
					<input class="checkbox" type="checkbox" bind:checked={formData.extractChapters} />
					<p>I understand that current content will be deleted.</p>
				</label>
			</div>
		
			<h2>Chapters</h2>
			<div class="s overflow-auto ">
				{#each chapters as chapter}
					<label class="flex items-center space-x-2">
						<input class="checkbox" type="checkbox" checked />
						<p>{chapter.name}</p>
					</label>
				{/each}
			</div>

			<h2>Options:</h2>
			<div class="s overflow-auto ">
				<label class="flex items-center space-x-2">
					<input class="checkbox" type="checkbox" bind:value={formData.quizes} checked />
					<p>With Quizes?</p>
				</label>
			</div>

			
			<div class="flex items-center space-x-2">
				<!-- button -->
				<button class="btn variant-filled-secondary [&>*]:pointer-events-none"  on:click={extractTopics} disabled={disableExtractTopics}>
					{#if state === status.InProgress}
						<Fa icon={faSpinner} class="animate-spin" />
					{:else}
						Extract Topics
					{/if}
				</button>

				<!-- checkbox -->
				<label class="flex items-center space-x-2">
					<input class="checkbox" type="checkbox" bind:checked={formData.extractTopics} />
					<p>I understand that current content will be deleted.</p>
				</label>
			</div>
		</form>
		<!-- prettier-ignore -->
		<footer class="modal-footer {parent.regionFooter}">
			{#if state !== status.Empty}
				<div class="flex items-center space-x-2">
					{#if state === status.Success }
						<Fa icon={faCheck} class="text-green-500" />
					{:else if state === status.InProgress }
						<Fa icon={faSpinner} class="animate-spin" />
					{:else if state === status.Error }
						<Fa icon={faCircleExclamation} class="text-red-500" />
					{/if}
					<p>{statusMessage}</p>
				</div>
			{/if}

			<!-- <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button> -->
			<!-- <button class="btn variant-filled-secondary" on:click={onFormSubmit}>Generate</button> -->
		</footer>
	</div>
{/if}