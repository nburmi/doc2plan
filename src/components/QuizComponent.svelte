<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Fa } from 'svelte-fa';
    import { faTrash } from '@fortawesome/free-solid-svg-icons';

    export let quiz: Quiz;
    const dispatch = createEventDispatcher();


    const deleteQuiz = () => {
        dispatch('deleteQuiz', {id: quiz.id});
    }

    const updateQuiz = () => {
        dispatch('updateQuiz', {id: quiz.id, quiz: quiz});
    }
</script>

<div class="flex flex-col">
    <!-- textarea with label -->
    <label class="label" for="question">
        Question
        <textarea id="question" class="textarea" placeholder="Question" bind:value={quiz.question} on:change={updateQuiz} required></textarea>
    </label>

    <!-- textarea with label -->
    <label class="label" for="answer">
        Answer
        <textarea class="textarea" placeholder="Answer" bind:value={quiz.answer} on:change={updateQuiz} required></textarea>
    </label>

    <div class="flex">
        <div class="flex justify-end">
            <button class="btn btn-sm variant-filled-error" on:click={deleteQuiz}>
                <Fa icon={faTrash} />
            </button>
        </div>
    </div>
</div>