<script lang="ts">
    import { openaiStore } from '../stores/openai';
    import { get } from 'svelte/store';
    import Topics from './Topics.svelte';

    let keyMoments = '';
    const extractKeyMoments = () => {
        console.log('extracting key moments');
    }

    export let chapter: Chapter;
</script>

<!-- <header class="card-header flex justify-center items-center">
</header> -->
<section class="">
    {#if get(openaiStore).assistantId !== ''}
    <textarea bind:value={keyMoments} class="textarea" placeholder="Key moments"></textarea>
    <button class="btn btn-sm variant-filled-secondary" on:click={extractKeyMoments}>AI: Extract key moments</button>
    {/if}

    <!-- flex col -->
    <div class="flex">
        {#if chapter}
        <Topics topics={chapter.topics} chapter_id={chapter.id}/>
        {/if}
    </div>
</section>
