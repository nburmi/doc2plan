<script lang="ts">
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { isValidApiKey, clearOpenAI, clearEverything, createAssistant, uploadFile } from '$lib/openai';
	import { openaiStore } from '../stores/openai';
	import { planStore } from '../stores/plan';
	import { get } from 'svelte/store';

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
		window.location.href = '/chapters';
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

		await clearOpenAI();

		normalButton(e, text);

		// show the button
		data.createdOpenAI = false;
	}

	async function clearOpenAIEverything() {
		await clearEverything();
	}

	async function createOpenAI(e: Event) {
		const button = e.target as HTMLButtonElement;
		const text = button.innerHTML;
		loadingButton(e, 'File uploading');

		if (!files) {
			data.errorMsg = 'No files selected';
			normalButton(e, text);
			return;
		}

		await uploadFile(files[0])

		loadingButton(e, 'Creating assistant');

		await createAssistant();

		normalButton(e, text);

		data.createdOpenAI = true;
	}

	function validateToken() {
		if (data.token.length < 10) {
			data.errorMsg = 'Token is too short';
			return;
		}

		data.tokenInvalid = true;
		isValidApiKey(data.token).then((res) => {
			if (res) {
				console.log('API key is valid');
				data.tokenInvalid = false;
			} else {
				console.log('API key is invalid');
			}
		}).catch((err) => {
			data.errorMsg = err;
			console.log('API key is invalid');
		});
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
        if (data.planName.length < 3) {
            data.locked = true;
			data.errorMsg = 'Plan name is too short';
        } else if (data.withAI && ((data.tokenInvalid || !files) || !data.createdOpenAI)) {
            data.locked = true;
			if (data.tokenInvalid) {
				data.errorMsg = 'Token is invalid';
			} else if (!files) {
				data.errorMsg = 'No files selected';
			} else {
				data.errorMsg = 'OpenAI not created yet';
			}
        } else {
            data.locked = false;
        }

		data.canCreateOpenAI = !data.tokenInvalid && files != null && !data.createdOpenAI;
    }
</script>
	<label class="label">
		<span>Plan name</span>
        <input type="text" placeholder="Enter your plan name" bind:value={data.planName} class="input variant-form-material" />
	</label>

    <div class="space-y-2">
        <label class="flex items-center space-x-2">
            <input class="checkbox" type="checkbox" bind:checked={data.withAI} />
            <p>With OpenAI</p>
        </label>
    </div>

	<!-- error message -->
	{#if data.locked}
		<p class="text-red-500">{data.errorMsg}</p>
	{/if}

	{#if data.withAI}
		<label class="label">
			<span>OpenAI API token</span>
			<input id="token" bind:value={data.token} on:change={validateToken} class="input" type="text" placeholder="Enter your openAI token here" />
		</label>
		<Accordion>
			<AccordionItem>
				<svelte:fragment slot="lead">How to get OpenAI token</svelte:fragment>
				<svelte:fragment slot="summary">links</svelte:fragment>
				<svelte:fragment slot="content">
					<p>1. Go to <a class="text-blue-500 hover:text-blue-700 underline" href="https://platform.openai.com/signup" target="_blank">OpenAI</a> and sign up for an account.</p>
					<p>2. Go to <a class="text-blue-500 hover:text-blue-700 underline" href="https://platform.openai.com/account/api-keys" target="_blank">API keys</a> and create a new key.</p>
					<p>3. Copy the key and paste it in the input field above.</p>
				</svelte:fragment>
			</AccordionItem>
			<AccordionItem>
				<svelte:fragment slot="lead">How your OpenAI token will be used</svelte:fragment>
				<svelte:fragment slot="summary">technical details</svelte:fragment>
				<svelte:fragment slot="content">
					<h4>How your token will be used:</h4>
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
            <span>Document</span>
            <input class="input" type="file" bind:files={files}/>
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

        <button class="btn variant-filled-error {data.createdOpenAI ? '': 'hidden'}" on:click={clear}>Clear</button>
		<!-- button to create openAI  -->
		<button class="btn variant-filled {data.canCreateOpenAI ? '': 'hidden'}" on:click={createOpenAI}>Create OpenAI</button>

		<!-- button to clear everything -->
		<button class="btn variant-filled-error" on:click={clearOpenAIEverything}>Clear everything</button>
	{/if}

    <button class="btn variant-filled" disabled={data.locked} on:click={next}>Next</button>

