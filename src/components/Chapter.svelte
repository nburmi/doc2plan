<script lang="ts">
    import { planStore } from "../stores/plan";
    import Fa from 'svelte-fa';
  	import { faArrowRight, faTrash } from '@fortawesome/free-solid-svg-icons';
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
    import ChapterNew from './ChapterNew.svelte';

    export let chapter: Chapter;

    // delete chapter
    const deleteChapter = () => {
        planStore.update((store) => {
            store.chapters = store.chapters.filter((c) => c.id !== chapter.id);
            return store;
        });
    };

    // update chapter
    const updateChapter = () => {
        planStore.update((store) => {
            const index = store.chapters.findIndex((c) => c.id === chapter.id);
            if (index === -1) return store;
            store.chapters[index].done = chapter.done;
            store.chapters[index].name = chapter.name;
            return store;
        });
    };
</script>

<div class="flex">
    <!-- button to redirect -->
    <label class="label">
        <input class="input" type="text" placeholder="Name of the chapter" bind:value={chapter.name} on:change={updateChapter} required/>
    </label>
    <!-- <input type="checkbox" bind:checked={chapter.done} class="checkbox" on:change={updateChapter}/> -->
    <button class="btn btn-sm variant-filled-error" on:click={deleteChapter}>
        <Fa icon={faTrash} />
    </button>



    <!-- <button class="btn btn-sm variant-filled-secondary" on:click={() => window.location.href = `/chapter/${chapter.id}`}>
        <Fa icon={faArrowRight} />
    </button> -->
</div>

<ChapterNew chapter={chapter}></ChapterNew>
