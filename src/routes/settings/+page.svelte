<script lang="ts">
    import { openaiStore } from '../../stores/openai';
    import { Fa } from 'svelte-fa';
    import { faEye, faEyeSlash, faFloppyDisk, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons';
    import { get } from 'svelte/store';
    import { popup } from '@skeletonlabs/skeleton';
    import type { PopupSettings } from '@skeletonlabs/skeleton';
    import { RangeSlider } from '@skeletonlabs/skeleton';
    import { clearOpenAI, updateAssistant, textToSpeech } from '$lib/openai';
    import { sendErrorToast } from '$lib/alertToast';
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';


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
                reset: value.reset,
                audioModel: value.audioModel,
                audioVoice: value.audioVoice,
                audioSpeed: value.audioSpeed
            };
            return ;
        } 

        data.apiKey = value.apiKey;
        data.model = value.model;
        data.fileId = value.fileId;
        data.vectorStoreId = value.vectorStoreId;
        data.assistantId = value.assistantId;
        data.temperature = value.temperature;
        data.audioModel = value.audioModel;
        data.audioVoice = value.audioVoice;
        data.audioSpeed = value.audioSpeed;
    });

    let show = false;

    // enum status
    enum Status {
        SAVED = 'Saved',
        UPDATE = 'Update',
        IN_PROGRESS = 'In progress'
    }
    let saved: Status = Status.SAVED;
    const keys: (keyof typeof data)[] = ['apiKey', 'model', 'temperature', 'fileId', 'vectorStoreId', 'assistantId', 'audioModel', 'audioVoice', 'audioSpeed'];

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

    const maxTemperature = 2;

    async function save() {
        openaiStore.update((value) => {
            value.apiKey = data.apiKey;
            value.model = data.model;
            value.temperature = data.temperature;
            value.audioModel = data.audioModel;
            value.audioVoice = data.audioVoice;
            value.audioSpeed = data.audioSpeed;
            return value;
        });

        if (data.assistantId === '') {
            return;
        }

        try {
            saved = Status.IN_PROGRESS;
            await updateAssistant();
        } catch (e: unknown) {
            sendErrorToast(`saving settings: ${e}`);
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
        } catch (e: unknown) {
            sendErrorToast(`deleting settings: ${e}`);
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

    const voices: string[] = [
        'alloy',
        'echo',
        'fable',
        'onyx',
        'nova',
        'shimmer'
    ];
    const voiceModels: string[] = [
        'tts-1',
        'tts-1-hd'
    ];


    async function listen() {
        let model = data.audioModel;
        let voice = data.audioVoice;

        // find the model in audios
        let found = audios.find((audio) => audio.model === model && audio.voice === voice && audio.speed === data.audioSpeed);
        if (found) {
            return;
        }

        try {
            const blob = await textToSpeech("Hello world, what a beautiful day", {
                model: data.audioModel,
                voice: data.audioVoice,
                speed: data.audioSpeed
            })

            // append to audios
            audios = [...audios, {
                model: model,
                voice: voice,
                speed: data.audioSpeed,
                sampleURL: URL.createObjectURL(blob)
            }];
        } catch (e: unknown) {
            sendErrorToast(`listening: ${e}`);
        }
    }

    type Audio = {
        model: string;
        voice: string;
        speed: number;
        sampleURL: string;
    }

    let audios = [] as Audio[];
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
            <RangeSlider name="range-slider" bind:value={data.temperature} max={maxTemperature} step={0.1} ticked={true}>
                <div class="flex justify-between items-center">
                    <div>Temperature: {data.temperature}</div>
                    <div class="text-xs">{data.temperature} / {maxTemperature}</div>
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

        <Accordion>
			<AccordionItem>
				<svelte:fragment slot="summary">Text to speech</svelte:fragment>
				<svelte:fragment slot="content">
					<label class="label">
                        <span>Select voice</span>
                        <select class="input" bind:value={data.audioVoice}>
                            {#each voices as v}
                                <option value={v}>{v}</option>
                            {/each}
                        </select>
                    </label>

                    <label class="label">
                        <span>Select model</span>
                        <select class="input" bind:value={data.audioModel}>
                            {#each voiceModels as v}
                                <option value={v}>{v}</option>
                            {/each}
                        </select>
                    </label>

                    <div class="flex flex-col p-4 w-full">
                        <RangeSlider name="range-slider" bind:value={data.audioSpeed} max={4} min={0.3} step={0.1} ticked={true}>
                            <div class="flex justify-between items-center">
                                <div>Speed: {data.audioSpeed}</div>
                                <div class="text-xs">{data.audioSpeed} / 1</div>
                            </div>
                        </RangeSlider>
                    </div>

                    <!-- listen -->
                    <button class="btn variant-filled-primary" on:click={listen}>
                        Listen
                    </button>

                    <div class="flex flex-col mt-5">
                        {#each audios as audio}
                            <p>{audio.model} - {audio.voice} - {audio.speed}</p>
                            <audio controls>
                                <source src={audio.sampleURL} type="audio/mpeg" />
                            </audio>
                        {/each}
                    </div>
				</svelte:fragment>
			</AccordionItem>
		</Accordion>


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

