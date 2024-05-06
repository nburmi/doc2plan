<script lang="ts">
    import QuizComponent from './QuizComponent.svelte';
    import { createEventDispatcher } from 'svelte';
    import { Fa } from 'svelte-fa';
    import { faPlus, faSpinner, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
    import { generateQuizes as aiGenerateQuizes } from '$lib/openai';

    export let quizzes: Quiz[] | undefined;
    export let chapterName: string;
    export let topicPath: string;
    export let topicContent: string | undefined;
    export let withAI: boolean;

    let loading = false;
    let show = true;

    const dispatch = createEventDispatcher();
    const addQuiz = () => {
        if (!quizzes) quizzes = [];

        // get biggest id from quizzes
        let max_id = 0;
        quizzes.forEach((q) => {
            if (q.id > max_id) max_id = q.id;
        });

        quizzes = [
            ...quizzes,
            {
                id: max_id + 1,
                question: '',
                answer: '',
                done: false
            }
        ];

        dispatch('updateQuizes', {quizzes});
    }

    const handleDelete = (event: CustomEvent) => {
        if (!quizzes) return;

        quizzes = quizzes.filter((q) => q.id !== event.detail.id);
        dispatch('updateQuizes', {quizzes});
    }

    const handleUpdate = (event: CustomEvent) => {
        if (!quizzes) return;

        const index = quizzes.findIndex((q) => q.id === event.detail.id);
        if (index === -1) return;

        quizzes[index] = event.detail.quiz;
        dispatch('updateQuizes', {quizzes});
    }

    async function generateQuizes () {
        loading = true;
        try {
            quizzes = await aiGenerateQuizes(chapterName, topicPath, topicContent || '');
            dispatch('updateQuizes', {quizzes});
        } catch (error) {
            console.error(error);
        } finally {
            loading = false;
        }
    }

    const hideShow = () => {
        show = !show;
    }
</script>


<!-- add quiz button -->
<div class="flex">
    <button class="btn btn-sm variant-filled" on:click={addQuiz} disabled={loading}>
        <Fa icon={faPlus} />
    </button>


    {#if quizzes && quizzes.length > 0}
        <button class="btn variant-filled" on:click={hideShow}>
            {#if show}
                <Fa icon={faEyeSlash} />
            {:else}
                <Fa icon={faEye} />
            {/if}
        </button>
    {/if}

    {#if withAI}
        <!-- button AI generate -->
        <button class="btn btn-sm variant-filled-secondary" on:click={generateQuizes} disabled={loading}>
            {#if loading}
                <Fa icon={faSpinner} class="animate-spin"/>
            {:else}
                Generate quizzes
            {/if}
        </button>
    {/if}
</div>




{#if quizzes && show}
    {#each quizzes as quiz}
        <QuizComponent {quiz} on:deleteQuiz={handleDelete} on:updateQuiz={handleUpdate}/>
    {/each}
{/if}