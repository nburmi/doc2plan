<script lang="ts">
    import { planStore } from "../stores/plan";
    import ChapterContent from './ChapterContent.svelte';

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
    <label class="label">
        <input class="input" type="text" placeholder="Name of the chapter" bind:value={chapter.name} on:change={updateChapter} required/>
    </label>
</div>

<ChapterContent chapter={chapter}></ChapterContent>
