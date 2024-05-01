<script lang="ts">
	import type { SvelteComponent } from 'svelte';

	// Stores
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { planStore } from '../../stores/plan';
	import { get } from 'svelte/store';

	import Fa from 'svelte-fa'
    import { faSpinner, faCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons'

	import { extractChapters as aiExtractChapters, extractKeyTopics as aiExtractKeyTopics, parseKeyTopics, generateTopicContent, generateQuizes } 
	from '$lib/openai';
   

	// Props
	/** Exposes parent props to this component. */
	export let parent: SvelteComponent;

	const modalStore = getModalStore();
	let duration = 0;
	function inSeconds(duration: number) {
		return (duration / 1000).toFixed(2);
	}
	function inMinutes(duration: number) {
		return (duration / 60000).toFixed(2);
	}

	// Form Data
	const formData = {
		extractChapters: false,
		extractTopics: false,
		quizes: true,
		subtopics: false,
		stop: false,
		stopMessage: 'Stop',
	};

	let chaptersMap = new Map();
	let chapters = get(planStore).chapters;

	let chaptersSelected = chapters.map(chapter => ({ ...chapter, selected: true }));
	function getSelectedChapters() {
        return chaptersSelected.filter(chapter => chapter.selected);
    }

	planStore.subscribe((store) => {
		chapters = store.chapters;
	});

	// Add chapters to map
	chapters.forEach((chapter) => {
		chaptersMap.set(chapter.id, chapter);
	});

	// We've created a custom submit function to pass the response and close the modal.
	function onFormSubmit(): void {
		if ($modalStore[0].response) $modalStore[0].response(formData);
		modalStore.close();
	}

	function onStop(e: Event) {
		formData.stop = true;
		formData.stopMessage = 'Stopping...';
	}

	async function extractChapters() {
		const startTime = new Date().getTime();
		statusMessage = 'Extracting chapters';
		state = status.InProgress;

		try {
			await aiExtractChapters();
			chapters = await aiExtractChapters();
			if (formData.stop) {
				statusMessage = 'Extraction stopped';
				state = status.Error;
				formData.stop = false;
				return;
			}

			chaptersSelected = chapters.map(chapter => ({ ...chapter, selected: true }));
			state = status.Success;
			statusMessage = 'Chapters extracted';

			// update the store
			planStore.update((store) => {
				const ordered = Array.from(chapters.values()).sort((a, b) => a.id - b.id);
				store.chapters = ordered;
				return store;
			});
		} catch (error) {
			statusMessage = 'Error extracting chapters';
			state = status.Error;
		} finally {
			duration = new Date().getTime() - startTime;
		}
	}

	async function extractTopics() {
		const startTime = new Date().getTime();
		statusMessage = 'Extracting topics';
		state = status.InProgress;

		try {
			const selected = getSelectedChapters();
			if (selected.length === 0) {
				statusMessage = 'No chapters selected';
				state = status.Error;
				return;
			}

			// extract key moments for each chapter
			statusMessage = 'Extracting key topics for each chapter';

			// extract key moments for each chapter
			await Promise.all(selected.map(async (chapter) => {
				if (formData.stop) {return;}

				const keyTopics = await aiExtractKeyTopics(chapter.name);
				chapter.keyTopics = keyTopics;

				// update the map
				chaptersMap.set(chapter.id, chapter);

				console.log("key topics for chapter: ", chapter.name, keyTopics);
			}));
			
			// create topics from key moments
			statusMessage = 'Creating topics for each chapter';
			selected.map((chapter) => {
				if (formData.stop) {return;}
				console.log("creating topics for chapter: ", chapter.name);

				if (!chapter.keyTopics) {
					console.error("no key topics for chapter: ", chapter.name);
					return;
				}

				const topics = parseKeyTopics(chapter.keyTopics);
				chapter.topics = topics;

				// update the map
				chaptersMap.set(chapter.id, chapter);
			});


			statusMessage = 'Generating content for each topic';
			// generate content for each topic
			await Promise.all(selected.map(async (chapter) => {
				if (formData.stop) {return;}

				console.log("generating content for chapter: ", chapter.name);

				if (!chapter.topics) {
					console.error("no topics for chapter: ", chapter.name);
					return;
				}

				for (let i = 0; i < chapter.topics.length; i++) {
					const topic = chapter.topics[i];
					console.log("generating content for topic: ", topic.path);

					// generate content for each topic
					const content = await generateTopicContent(chapter.name, topic.path);
					topic.content = content;
					if (formData.stop) {return;}


					let queue: Topic[] = [];
					topic.children?.forEach((child) => {
						queue.push(child);
					});

					while (queue.length > 0) {
						if (formData.stop) {return;}

						const child = queue.shift();
						if (!child) {
							continue;
						}

						const content = await generateTopicContent(chapter.name, child.path);
						child.content = content;

						child.children?.forEach((child) => {
							queue.push(child);
						});
					}

					// update the map
					selected[chapter.id] = chapter;
				}
			}));

			// generate quiz for each topic
			if (formData.quizes) {
				statusMessage = 'Generating quiz for each topic';
				await Promise.all(selected.map(async (chapter) => {
					if (formData.stop) {return;}
					console.log("generating quiz for chapter: ", chapter.name);

					if (!chapter.topics) {
						console.error("no topics for chapter: ", chapter.name);
						return;
					}

					for (let i = 0; i < chapter.topics.length; i++) {
						if (formData.stop) {return;}

						const topic = chapter.topics[i];
						console.log("generating quiz for topic: ", topic.title);

						if (!topic.content) {
							console.error("no content for topic: ", topic.title);
							return;
						}

						// generate quiz for each topic
						const quiz = await generateQuizes(chapter.name, topic.path, topic.content);
						topic.quizes = quiz;

						let queue: Topic[] = [];
						topic.children?.forEach((child) => {
							queue.push(child);
						});

						while (queue.length > 0) {
							if (formData.stop) {return;}

							const child = queue.shift();
							if (!child || !child.content) {
								continue;
							}

							const quiz = await generateQuizes(chapter.name, child.path, child.content);
							child.quizes = quiz;

							child.children?.forEach((child) => {
								queue.push(child);
							});
						}
					}

					selected[chapter.id] = chapter;
				}));
			}

			// update the store
			planStore.update((store) => {
				const ordered = Array.from(chaptersMap.values()).sort((a, b) => a.id - b.id);
				store.chapters = ordered;
				return store;
			});

			if (formData.stop) {
				statusMessage = 'Extraction stopped';
				state = status.Error;
				formData.stop = false;
				return;
			}

			state = status.Success;
			statusMessage = 'Topics extracted';
		} catch (error) {
			statusMessage = 'Error extracting topics';
			state = status.Error;
		} finally {
			duration = new Date().getTime() - startTime;
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
				{#each chaptersSelected as chapter}
					<label class="flex items-center space-x-2">
						<input class="checkbox" type="checkbox" bind:checked={chapter.selected} />
						<p>{chapter.name}</p>
					</label>
				{/each}
			</div>

			<h2>Options:</h2>
			<div class="s overflow-auto ">
				<label class="flex items-center space-x-2">
					<input class="checkbox" type="checkbox" bind:value={formData.subtopics} checked={formData.subtopics} />
					<p>Generate content for all subtopics</p>
				</label>

				<label class="flex items-center space-x-2">
					<input class="checkbox" type="checkbox" bind:value={formData.quizes} checked={formData.quizes} />
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
					{#if duration > 0 && state !== status.InProgress}
						{#if duration > 60000}
							<p>Duration: {inMinutes(duration)}m</p>
						{:else}
							<p>Duration: {inSeconds(duration)}s</p>
						{/if}
					{/if}
				</div>
			{/if}

			{#if state === status.InProgress}
				<button class="btn variant-filled-error" on:click={onStop} disabled={formData.stop}>{formData.stopMessage}</button>
			{/if}

			<!-- <button class="btn {parent.buttonNeutral}" on:click={parent.onClose}>{parent.buttonTextCancel}</button> -->
			<!-- <button class="btn variant-filled-secondary" on:click={onFormSubmit}>Generate</button> -->
		</footer>
	</div>
{/if}