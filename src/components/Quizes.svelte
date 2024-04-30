<script lang="ts">
    import QuizComponent from './QuizComponent.svelte';
    import { createEventDispatcher } from 'svelte';
    import { Fa } from 'svelte-fa';
    import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
    import { generateQuizes as aiGenerateQuizes } from '$lib/openai';

    export let quizes: Quiz[] | undefined;
    export let chapterName: string;
    export let topicPath: string;
    export let topicContent: string | undefined;

    let loading = false;

    const dispatch = createEventDispatcher();
    const addQuiz = () => {
        if (!quizes) quizes = [];

        quizes = [
            ...quizes,
            {
                id: quizes.length + 1,
                question: '',
                answer: '',
                done: false
            }
        ];

        dispatch('updateQuizes', {quizes});
    }

    const handleDelete = (event: CustomEvent) => {
        if (!quizes) return;

        quizes = quizes.filter((q) => q.id !== event.detail.id);
        dispatch('updateQuizes', {quizes});
    }

    const handleUpdate = (event: CustomEvent) => {
        if (!quizes) return;

        const index = quizes.findIndex((q) => q.id === event.detail.id);
        if (index === -1) return;

        quizes[index] = event.detail.quiz;
        dispatch('updateQuizes', {quizes});
    }

    async function generateQuizes () {
        loading = true;
        try {
            quizes = await aiGenerateQuizes(chapterName, topicPath, topicContent || '');
            dispatch('updateQuizes', {quizes});
        } catch (error) {
            console.error(error);
        } finally {
            loading = false;
        }
    }
</script>


<!-- add quiz button -->
<div class="flex">
    <button class="btn btn-sm variant-filled" on:click={addQuiz} disabled={loading}>
        <Fa icon={faPlus} />
    </button>
    <!-- button AI generate -->
    <button class="btn btn-sm variant-filled-secondary" on:click={generateQuizes} disabled={loading}>
        {#if loading}
            <Fa icon={faSpinner} class="animate-spin"/>
        {:else}
            Generate quizes
        {/if}
    </button>
</div>

{#if quizes}
    {#each quizes as quiz}
        <QuizComponent {quiz} on:deleteQuiz={handleDelete} on:updateQuiz={handleUpdate}/>
    {/each}
{/if}