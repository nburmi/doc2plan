<script lang="ts">
    import { openaiStore } from '../../../stores/openai';
    import { get } from 'svelte/store';
    import { planStore } from '../../../stores/plan';
    import Chapter from '../../../components/creator/Chapter.svelte';
    import Fa from 'svelte-fa'
    import { faPlus, faTrash, faWandMagicSparkles, faSpinner, faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
    import { popup } from '@skeletonlabs/skeleton';
    import type { PopupSettings } from '@skeletonlabs/skeleton';
    import { extractChapters as aiExtractChapters } from '$lib/openai';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';


    const withAI = get(openaiStore).assistantId !== '';
    let chapters = get(planStore).chapters;
    let loading = false;

    planStore.subscribe((store) => {
        chapters = store.chapters;
    });

    const addChapter = () => {
        console.log(chapters);
        planStore.update((store) => {
            store.chapters.push({ id: store.chapters.length + 1, name: '', done: false, topics: []});
            return store;
        });
    };

    const deleteChapter = (id: number) => {
        return () => {
            planStore.update((store) => {
                store.chapters = store.chapters.filter((c) => c.id !== id);
                return store;
            });
        };
    };

    const extractChapters = async () => {
        loading = true;
        try {
            let extracted = await aiExtractChapters();
            planStore.update((store) => {
                store.chapters = extracted;
                return store;
            });
        } catch (e) {
            console.error(e);
        } finally {
            loading = false;
        }
    };

    const popupHover: PopupSettings = {
        event: 'hover',
        target: 'popupHover',
        placement: 'bottom'
    };
</script>


<div class="flex pb-4">
    <h1 class="text-2xl font-bold mr-1">Chapters to cover:</h1>
    <button type="button" class="btn btn-sm variant-filled" on:click={addChapter}>
        <Fa icon={faPlus} />
    </button>
    {#if withAI}
        <button class="btn btn-sm variant-filled-secondary [&>*]:pointer-events-none"  on:click={extractChapters} use:popup={popupHover} disabled={loading}>
            {#if loading}
                <Fa icon={faSpinner} class="animate-spin" />
            {:else}
                <Fa icon={faWandMagicSparkles} />
            {/if}
        </button>

        <div class="card p-4 variant-filled-secondary" data-popup="popupHover">
            <p>AI: extract and override chapters</p>
            <div class="arrow variant-filled-secondary" />
        </div>
    {/if}
</div>

<Accordion>
    {#each chapters as c}
    <AccordionItem>
        <svelte:fragment slot="lead">{c.name === '' ? 'name is empty' : c.name}</svelte:fragment>
        <svelte:fragment slot="summary">
            <div class="flex justify-end">
                <button class="btn btn-sm variant-filled-error" on:click={deleteChapter(c.id)}>
                    <Fa icon={faTrash} />
                </button> 
            </div>
        </svelte:fragment>
        <svelte:fragment slot="content">
            <div class="border border-surface-500 p-4 space-y-4 rounded-container-token"><Chapter chapter={c}></Chapter></div>
        </svelte:fragment>
    </AccordionItem>
    {/each}
</Accordion>

<div class="flex space-x-1 mt-4">
    <!-- button back -->
    <button type="button" class="btn variant-filled" on:click={() => goto(`${base}/creator`)}>
        <Fa icon={faArrowLeft} />
        <p class="ml-1px">Back</p>
    </button>

    <!-- finish button which redirects to save -->
    <button type="button" class="btn variant-filled-primary" on:click={() => goto(`${base}/creator/save`)}>
        <p class="mr-1px">Next</p>
        <Fa icon={faArrowRight}/>
    </button>
</div>

