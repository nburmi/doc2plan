<script lang="ts">
    import { openaiStore } from '../../stores/openai';
    import { get } from 'svelte/store';
    import { planStore } from '../../stores/plan';
    import Chapter from '../../components/Chapter.svelte';
    import Fa from 'svelte-fa'
    import { faPlus, faTrash, faWandMagicSparkles, faSpinner } from '@fortawesome/free-solid-svg-icons'
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
    import { popup } from '@skeletonlabs/skeleton';
    import type { PopupSettings } from '@skeletonlabs/skeleton';
    import { extractChapters as aiExtractChapters } from '$lib/openai';


    $: openAI = get(openaiStore).assistantId !== '';
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

    const printChapters = () => {
        console.log(chapters);
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
            loading = false;
        } catch (e) {
            loading = false;
            console.error(e);
        }
    };

    const popupHover: PopupSettings = {
        event: 'hover',
        target: 'popupHover',
        placement: 'bottom'
    };
</script>


<div class="flex">
    <h1 class="text-2xl font-bold">Chapters to cover:</h1>
    <button type="button" class="btn btn-sm variant-filled" on:click={addChapter}>
        <Fa icon={faPlus} />
    </button>
    {#if openAI}
        <button class="btn btn-sm variant-filled-secondary [&>*]:pointer-events-none"  on:click={extractChapters} use:popup={popupHover} disabled={loading}>
            {#if loading}
                <Fa icon={faSpinner} class="animate-spin" />
            {:else}
                <Fa icon={faWandMagicSparkles} />
            {/if}
        </button>

        <div class="card p-4 variant-filled-secondary" data-popup="popupHover">
            <p>AI: extract chapters</p>
            <div class="arrow variant-filled-secondary" />
        </div>
    {/if}
</div>

<Accordion>
    {#each chapters as c}
    <AccordionItem>
        <svelte:fragment slot="lead">{c.name === '' ? 'name is empty' : c.name}</svelte:fragment>
        <svelte:fragment slot="summary">
            <button class="btn btn-sm variant-filled-error" on:click={deleteChapter(c.id)}>
                <Fa icon={faTrash} />
            </button>
        </svelte:fragment>
        <svelte:fragment slot="content">
            <Chapter chapter={c}></Chapter>
        </svelte:fragment>
    </AccordionItem>
    {/each}
</Accordion>


<!-- finish button which redirects to save -->
<button type="button" class="btn variant-filled-primary" on:click={() => window.location.href = '/save'}>Finish</button>

<!-- print chapters button -->
<button type="button" class="btn variant-filled-primary" on:click={printChapters}>Print</button>

