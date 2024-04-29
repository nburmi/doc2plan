<script lang="ts">
    import { page } from '$app/stores';
    import { openaiStore } from '../stores/openai';
    import { get } from 'svelte/store';
    import Topics from './Topics.svelte';

    let keyMoments = '';
    const extractKeyMoments = () => {
        console.log(keyMoments);
    }

    export let chapter: Chapter;

    const getChapterName = () => {
        return chapter ? `: ${chapter.name}` : '';
    }
</script>

<!-- <header class="card-header flex justify-center items-center">
</header> -->
<section class="p-4">
    {#if get(openaiStore).assistantId !== ''}
    <button class="btn variant-filled-secondary" on:click={extractKeyMoments}>AI: Extract key moments</button>
    <textarea bind:value={keyMoments} class="textarea" placeholder="Key moments"></textarea>
    {/if}

    <!-- flex col -->
    <div class="flex">
        {#if chapter}
        <Topics topics={chapter.topics} chapter_id={chapter.id}/>
        {/if}
    </div>
</section>
