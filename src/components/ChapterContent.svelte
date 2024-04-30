<script lang="ts">
    import { openaiStore } from '../stores/openai';
    import { get } from 'svelte/store';
    import Topics from './Topics.svelte';
    import { extractKeyTopics, parseKeyTopics as aiParseKeyTopics } from '$lib/openai';
    import Fa from 'svelte-fa'
    import { faSpinner } from '@fortawesome/free-solid-svg-icons';
    import { createEventDispatcher } from 'svelte';

    export let chapter: Chapter;
    let loading = false;
    async function findKeyTopics() {
        loading = true;
        try {
            chapter.keyTopics = await extractKeyTopics(chapter.name);
        } catch (error) {
            console.error(error);
        } finally {
            loading = false;
        }
    }

    function parseKeyTopics() {
        if (!chapter.keyTopics) {
            console.error('No key topics to parse');
            return;
        }

        const topics = aiParseKeyTopics(chapter.keyTopics);
        updateTopics(topics);
    }

    const dispatch = createEventDispatcher();
    function updateTopics(topics: Topic[]) {
        console.log('update topics', topics);

        dispatch('updateTopics', {id: chapter.id, topics});
    }
</script>

<!-- <header class="card-header flex justify-center items-center">
</header> -->
<section class="">
    {#if get(openaiStore).assistantId !== ''}
        <textarea bind:value={chapter.keyTopics} class="textarea" placeholder="Key topics"></textarea>
        <button class="btn btn-sm variant-filled-secondary" on:click={findKeyTopics} disabled={loading}>
            {#if loading}
            <Fa icon={faSpinner} class="animate-spin"/>
            {:else}
            Extract key moments
            {/if}
        </button>

        {#if chapter.keyTopics && chapter.keyTopics.length > 0}
            <!-- button parse to topics -->
            <button class="btn btn-sm variant-filled-secondary" on:click={parseKeyTopics} disabled={loading}>
                Create topics
            </button>
        {/if}
    {/if}

    <div class="flex">
        {#if chapter}
            <Topics topics={chapter.topics} chapter_id={chapter.id}/>
        {/if}
    </div>
</section>
