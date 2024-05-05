<script lang="ts">
    import { openaiStore } from "../../stores/openai";
    import { Fa } from 'svelte-fa';
    import { faEye, faEyeSlash, faFloppyDisk, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons';
    import { get } from 'svelte/store';
    import { popup } from '@skeletonlabs/skeleton';
    import type { PopupSettings } from '@skeletonlabs/skeleton';
    import { RangeSlider } from '@skeletonlabs/skeleton';
    import { clearOpenAI, updateAssistant } from "$lib/openai";


    let data: OpenAI;

    openaiStore.subscribe((value) => {
        if (!value) return;

        if (!data) {
            data = {
                apiKey: value.apiKey,
                model: value.model,
                temperature: value.temperature,
                fileId: value.fileId,
                vectorStoreId: value.vectorStoreId,
                assistantId: value.assistantId,
                reset: value.reset
            }
            return ;
        } 

        data.apiKey = value.apiKey;
        data.model = value.model;
        data.fileId = value.fileId;
        data.vectorStoreId = value.vectorStoreId;
        data.assistantId = value.assistantId;
        data.temperature = value.temperature;
    });

    let show = false;

    // enum status
    enum Status {
        SAVED = 'Saved',
        UPDATE = 'Update',
        IN_PROGRESS = 'In progress'
    }
    let saved: Status = Status.SAVED;
    const keys: (keyof typeof data)[] = ['apiKey', 'model', 'temperature', 'fileId', 'vectorStoreId', 'assistantId'];

    function objectsAreEqual(a: typeof data, b: typeof data, keys: (keyof typeof data)[]) {
        return keys.every(key => a[key] === b[key]);
    }

    $: {
        let original = get(openaiStore);
        saved = objectsAreEqual(data, original, keys) ? Status.SAVED : Status.UPDATE;
    }

    const popupHover: PopupSettings = {
        event: 'hover',
        target: 'popupHover',
        placement: 'bottom'
    };

    const max = 2;

    async function save() {
        openaiStore.update((value) => {
            value.apiKey = data.apiKey;
            value.model = data.model;
            value.temperature = data.temperature;
            return value;
        });

        if (data.assistantId === '') {
            return;
        }

        try {
            saved = Status.IN_PROGRESS;
            await updateAssistant()
        } catch (e) {
            console.error(e);
        } finally {
            saved = Status.SAVED;
        }
    }

    let deleting = false;
    let createdOpenAI: boolean = get(openaiStore).assistantId !== '';
    async function deleteAndReset() {
        try {
            deleting = true;
            await clearOpenAI(
            {
                assistantId: data.assistantId,
                fileId: data.fileId,
                vectorStoreId: data.vectorStoreId
            });
        } catch (e) {
            console.error(e);
        } finally {
            deleting = false;
        }
    }

    let models: string[] = [
        'gpt-4-turbo-preview',
        'gpt-4-turbo',
        'gpt-3.5-turbo-1106',
        'gpt-3.5-turbo-0613',
        'gpt-3.5-turbo-0125',
        'gpt-3.5-turbo'
    ];
</script>


<div class="flex flex-col justify-center">
    <div class="flex flex-row justify-between">
        <h1 class="text-2xl font-bold">Settings</h1>
    </div>

    <div class="flex flex-col mt-5">
        <span>API Key</span>

        <div class="input-group input-group-divider grid-cols-[1fr_auto]">
            <input type="text" placeholder="OpenAI api key" bind:value={data.apiKey} class="{show ? '' : 'hidden'}" />
            <input type="password" placeholder="OpenAI api key" bind:value={data.apiKey} class="{show ? 'hidden' : ''}" />
            <button class="variant-filled-secondary" on:click={() => show = !show}>
                <Fa icon={show ? faEyeSlash : faEye} />
            </button>
        </div>

        <label class="label">
            <span>Select model</span>
            <select class="input" bind:value={data.model}>
                {#each models as model}
                    <option value={model}>{model}</option>
                {/each}
        </label>

        <label class="label">
            <span>Or write it manually (model should support file search)</span>
            <input class="input" type="text" placeholder="OpenAI model" bind:value={data.model} />
        </label>

        <div class="flex flex-col p-4 w-full">
            <RangeSlider name="range-slider" bind:value={data.temperature} max={max} step={0.1} ticked={true}>
                <div class="flex justify-between items-center">
                    <div>Temperature: {data.temperature}</div>
                    <div class="text-xs">{data.temperature} / {max}</div>
                </div>
            </RangeSlider>
        </div>


        <label class="label">
            <span>File ID</span>
            <input class="input" type="text" placeholder="OpenAI file id" bind:value={data.fileId} disabled/>
        </label>

        <label class="label">
            <span>Vector Store ID</span>
            <input class="input" type="text" placeholder="OpenAI vector store id" bind:value={data.vectorStoreId} disabled/>
        </label>

        <label class="label">
            <span>Assistant ID</span>
            <input class="input" type="text" placeholder="OpenAI assistant id" bind:value={data.assistantId} disabled/>
        </label>


        <div class="flex flex-row mt-5">
            <button class="btn {saved ? 'variant-filled': 'variant-filled-primary'}" disabled={saved === Status.SAVED} on:click={save}>
                {#if saved === Status.IN_PROGRESS}
                    <Fa icon={faSpinner} class="animate-spin" />
                    <p class="ml-2">Saving...</p>
                {:else}
                    <Fa icon={faFloppyDisk} />
                    <p class="ml-2">{saved}</p>
                {/if}
            </button>

            <button class="btn variant-filled-error ml-2" use:popup={popupHover} on:click={deleteAndReset} disabled={deleting || !createdOpenAI}>
                {#if deleting}
                    <Fa icon={faSpinner} class="animate-spin" />
                    <p class="ml-2">Deleting...</p>
                {:else}
                    <Fa icon={faTrash} />
                    <p class="ml-2">Delete</p>
                {/if}
            </button>

            <div class="card p-4 variant-filled-error" data-popup="popupHover">
                <p>Deletes assistant, file and vector store from OpenAI.</p>
                <div class="arrow variant-filled-error" />
            </div>
        </div>
</div>
</div>

