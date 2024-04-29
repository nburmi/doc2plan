<script lang="ts">
    import QuizComponent from './QuizComponent.svelte';
    import { createEventDispatcher } from 'svelte';
    import { Fa } from 'svelte-fa';
    import { faPlus } from '@fortawesome/free-solid-svg-icons';

    export let quizes: Quiz[];
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
        quizes = quizes.filter((q) => q.id !== event.detail.id);
        dispatch('updateQuizes', {quizes});
    }

    const handleUpdate = (event: CustomEvent) => {
        const index = quizes.findIndex((q) => q.id === event.detail.id);
        if (index === -1) return;

        quizes[index] = event.detail.quiz;
        dispatch('updateQuizes', {quizes});
    }
</script>


<!-- add quiz button -->
<div class="flex">
    <button class="btn btn-sm variant-filled" on:click={addQuiz}>
        <Fa icon={faPlus} />
    </button>
</div>


{#each quizes as quiz}
<div class="flex">
    <QuizComponent {quiz} on:deleteQuiz={handleDelete} on:updateQuiz={handleUpdate}/>
</div>
{/each}