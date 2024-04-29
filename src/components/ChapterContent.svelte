<script lang="ts">
    import { openaiStore } from '../stores/openai';
    import { get } from 'svelte/store';
    import Topics from './Topics.svelte';
    import { extractKeyTopics } from '$lib/openai';
    import Fa from 'svelte-fa'
    import { faSpinner } from '@fortawesome/free-solid-svg-icons';

    export let chapter: Chapter;

    let keyTopics = '';
    let loading = false;
    async function findKeyTopics() {
        loading = true;
        try {
            keyTopics = await extractKeyTopics(chapter.name);
        } catch (error) {
            console.error(error);
        } finally {
            loading = false;
        }
    }
</script>

<!-- <header class="card-header flex justify-center items-center">
</header> -->
<section class="">
    {#if get(openaiStore).assistantId !== ''}
    <textarea bind:value={keyTopics} class="textarea" placeholder="Key topics"></textarea>
    <button class="btn btn-sm variant-filled-secondary" on:click={findKeyTopics} disabled={loading}>
        {#if loading}
        <Fa icon={faSpinner} class="animate-spin"/>
        {:else}
        AI: Extract key moments
        {/if}
    </button>
    {/if}

    <!-- flex col -->
    <div class="flex">
        {#if chapter}
        <Topics topics={chapter.topics} chapter_id={chapter.id}/>
        {/if}
    </div>
</section>
