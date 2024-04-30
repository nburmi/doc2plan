<script lang="ts">
    import { openaiStore } from "../stores/openai";
    import { get } from 'svelte/store';
    import { planStore } from "../stores/plan";;
    import Chapter from './Chapter.svelte';
    import Fa from 'svelte-fa'
    import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';

    $: openAI = get(openaiStore).assistantId !== '';
    let chapters = get(planStore).chapters;

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
</script>


<div class="flex">
    <h1 class="text-2xl font-bold">Chapters to cover:</h1>
    <button type="button" class="btn btn-sm variant-ringed" on:click={addChapter}>
        <Fa icon={faPlus} />
    </button>
    {#if openAI}
        <button class="btn btn-sm variant-filled-secondary">AI: extract chapters</button>
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
            <Chapter chapter={c}></Chapter>
        </svelte:fragment>
    </AccordionItem>
    {/each}
</Accordion>


<!-- finish button which redirects to save -->
<button type="button" class="btn variant-filled-primary" on:click={() => window.location.href = '/save'}>Finish</button>


<!-- print chapters button -->
<button type="button" class="btn variant-filled-primary" on:click={printChapters}>Print</button>

