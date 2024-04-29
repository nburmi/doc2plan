<script lang="ts">
    import { page } from '$app/stores';
    import { planStore } from '../../../stores/plan';
    import { openaiStore } from '../../../stores/openai';
    import { get } from 'svelte/store';
    import Topics from '../../../components/Topics.svelte';

    let keyMoments = '';
    const extractKeyMoments = () => {
        console.log(keyMoments);
    }

    let chapter_id = Number($page.params.id);    
    let chapter = get(planStore).chapters.find((c) => c.id === chapter_id);

    const getChapterName = () => {
        return chapter ? `: ${chapter.name}` : '';
    }
</script>

<header class="card-header flex justify-center items-center">
    <h1>Chapter { $page.params.id } {getChapterName()}</h1>
</header>
<section class="p-4">
    {#if get(openaiStore).assistantId !== ''}
    <button class="btn variant-filled-secondary" on:click={extractKeyMoments}>AI: Extract key moments</button>
    <textarea bind:value={keyMoments} class="textarea" placeholder="Key moments"></textarea>
    {/if}

    <!-- flex col -->
    <div class="flex">
        {#if chapter}
        <Topics topics={chapter.topics} chapter_id={chapter_id}/>
        {/if}
    </div>
</section>
<footer class="card-footer">
    <!-- button covered which redirects to chapters -->
    <button class="btn variant-filled-primary" on:click={() => window.location.href = '/chapters'}>Covered</button>
</footer>


