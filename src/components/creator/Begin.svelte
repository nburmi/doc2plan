<script lang="ts">
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { isValidApiKey, clearOpenAI, createAssistant, uploadFile } from '$lib/openai';
	import { openaiStore } from '../../stores/openai';
	import { planStore } from '../../stores/plan';
	import { get } from 'svelte/store';
	import { goto } from '$app/navigation';
	

	let data = {
		planName: get(planStore).name,
		withAI: get(openaiStore).assistantId !== '',
		token: get(openaiStore).apiKey,
		locked: false,
		tokenInvalid: true,
		errorMsg: '',
		createdOpenAI: false,
		canCreateOpenAI: false,
	};
    let files: FileList;
	validateToken();

	openaiStore.subscribe((store) => {
		data.token = store.apiKey;
		data.createdOpenAI = store.assistantId !== '';
	});

	const next = () => {
		planStore.update((store) => {
			store.name = data.planName;
			return store;
		});
		openaiStore.update((store) => {
			store.apiKey = data.token;
			store.assistantId = data.createdOpenAI ? store.assistantId : '';
			return store;
		});
		goto('/creator/chapters');
	};


	// function which changes text in button to loading with dots animation
	function loadingButton(e: Event, text: string = 'Loading') {
		const button = e.target as HTMLButtonElement;
		button.disabled = true;

		// fa icon spinner into HTML
		button.innerHTML = `${text}`;
	}

	// function which changes loadingButton back to normal
	function normalButton(e: Event, text: string) {
		const button = e.target as HTMLButtonElement;
		button.disabled = false;
		button.innerHTML = text;
	}

	async function clear(e: Event) {
		const button = e.target as HTMLButtonElement;
		const text = button.innerHTML;
		loadingButton(e, 'Clearing');

		await clearOpenAI(
			{
				assistantId: get(openaiStore).assistantId,
				fileId: get(openaiStore).fileId,
				vectorStoreId: get(openaiStore).vectorStoreId,
			}
		);

		normalButton(e, text);

		// show the button
		data.createdOpenAI = get(openaiStore).assistantId !== '';
	}

	async function createOpenAI(e: Event) {
		try {
			const button = e.target as HTMLButtonElement;
			const text = button.innerHTML;
			loadingButton(e, 'File uploading');

			if (!files) {
				data.errorMsg = 'No files selected';
				normalButton(e, text);
				return;
			}

			await uploadFile(files[0]);
			loadingButton(e, 'Creating assistant');
			await createAssistant();
			normalButton(e, text);
			data.createdOpenAI = true;
		} catch (err: any) {
			data.errorMsg = `${err}`;
		} finally {
			normalButton(e, 'Create OpenAI');
		}
	}

	async function validateToken() {
		if (data.token.length < 10) {
			data.errorMsg = 'Token is too short';
			return;
		}

		data.tokenInvalid = true;
		try {
			await isValidApiKey(data.token);
			data.tokenInvalid = false;
		} catch (err: any) {
			data.errorMsg = err;
		}
	}

    function readableFileSize(bytes: number): string {
        if (bytes < 1024) {
            return bytes + ' Bytes';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        } else {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }
    }

	$: {
		const isPlanNameTooShort = data.planName.length < 3;
		const isTokenInvalidOrNoFiles = data.withAI && (data.tokenInvalid || (!files && !data.createdOpenAI));
		const isNotCreatedOpenAI = data.withAI && !data.createdOpenAI;

		if (isPlanNameTooShort) {
			data.locked = true;
			data.errorMsg = 'Plan name is too short';
		} else if (isTokenInvalidOrNoFiles || isNotCreatedOpenAI) {
			data.locked = true;
			if (data.tokenInvalid) {
				data.errorMsg = 'Token is invalid';
			} else if (!files) {
				data.errorMsg = 'No files selected';
			} else if (data.errorMsg.startsWith('Error')) {
				data.errorMsg = data.errorMsg;
			} else {
				data.errorMsg = 'OpenAI not created yet';
			}
		} else {
			data.locked = false;
		}

		data.canCreateOpenAI = !data.tokenInvalid && files != null && !data.createdOpenAI;
	}

	let importedPlan: FileList;
	let imported: boolean = false;
	function handleImportedFile() {
		const file = importedPlan[0];
		const reader = new FileReader();
		reader.onload = async (e) => {
			if (!e.target || !e.target.result) {
				return;
			}

			const text = e.target.result as string;
			const plan: Plan = JSON.parse(text);
			data.planName = plan.name;
			planStore.update((store) => {
				store.name = plan.name;
				store.chapters = plan.chapters;
				return store;
			});

			imported = true;
		};

		reader.readAsText(file);
	}
</script>

<div class="flex justify-center mb-4">
	<h1 class="text-2xl font-bold">Create a new plan or import from json</h1>
</div>

<div class="flex flex-col space-y-4 mb-4">
	<label class="label">
		<span>Plan name</span>
		<input type="text" placeholder="Enter your plan name" bind:value={data.planName} class="input" />
	</label>

	<label class="label">
		<span class="">
			{#if imported}
				<p class="text-primary-500">
					Imported plan from JSON
				</p>
			{:else}
				Import plan from JSON
			{/if}
		</span>
		<input class="input" type="file" bind:files={importedPlan} accept=".json" on:change={handleImportedFile}/>
	</label>
</div>

<div class="flex flex-col space-y-4 justify-between">
	<label class="flex items-center space-x-2">
		<input class="checkbox" type="checkbox" bind:checked={data.withAI} />
		<p>With OpenAI</p>
	</label>

	<!-- error message -->
	{#if data.locked}
		<p class="text-red-500">{data.errorMsg}</p>
	{/if}

	{#if data.withAI}
		<h1>Create assistant in OpenAI. </h1>
		<h2>
			If button <span class="text-primary-500">Next</span> is active it means that you already have an assistant. 
		</h2>
		<h2>
			You can clear it and create a new one (assistant).
		</h2>
		<div>
			<button class="btn variant-filled-error" on:click={clear} disabled={!data.createdOpenAI}>
				Clear OpenAI
			</button>
		</div>

		<label class="label">
			<span>OpenAI API token</span>
			<input id="token" bind:value={data.token} on:change={validateToken} class="input" type="text" placeholder="Enter your openAI token here" />
		</label>
		<Accordion>
			<AccordionItem>
				<svelte:fragment slot="summary">How to get OpenAI token</svelte:fragment>
				<svelte:fragment slot="content">
					<p>1. Go to <a class="text-blue-500 hover:text-blue-700 underline" href="https://platform.openai.com/signup" target="_blank">OpenAI</a> and sign up for an account.</p>
					<p>2. Go to <a class="text-blue-500 hover:text-blue-700 underline" href="https://platform.openai.com/account/api-keys" target="_blank">API keys</a> and create a new key.</p>
					<p>3. Copy the key and paste it in the input field above.</p>
				</svelte:fragment>
			</AccordionItem>
			<AccordionItem>
				<svelte:fragment slot="summary">How your OpenAI token will be used</svelte:fragment>
				<svelte:fragment slot="content">
					<ul>
						<li>token stored in your browser</li>
						<li>token will be used to access the OpenAI api</li>
						<li>programm will create assistant in openAI</li>
						<li>Upload your documents to openAI</li>
						<li>Create learning plan from your documents using openAI</li>
						<li>You will see the progress and can edit the plan during the process</li>
					</ul>
				</svelte:fragment>
			</AccordionItem>
		</Accordion>


		<label class="label">
			<span>Document for assistant file search.</span>
			<input class="input" type="file" bind:files={files} accept=".pdf"/>
		</label>

		<ul>
			{#if files}
				{#each Array.from(files) as file}
					<li>Name: {file.name}</li>
					<li>Type: {file.type}</li>
					<li>Size: {readableFileSize(file.size)}</li>
				{/each}
			{:else}
				<li>No files selected</li>
			{/if}
		</ul>
			
		<div>
			<button class="btn variant-filled {data.canCreateOpenAI ? '': 'hidden'}" on:click={createOpenAI}>Create OpenAI</button>
		</div>
	{/if}
</div>

<button class="btn variant-filled-primary mt-4" disabled={data.locked} on:click={next}>Next</button>
	