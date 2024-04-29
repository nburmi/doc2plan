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

<div class="flex">
    <label class="label">
        <input class="input" type="text" placeholder="Question" bind:value={quiz.question} on:change={updateQuiz}  required/>
    </label>

    <label class="label">
        <input class="input" type="text" placeholder="Answer" bind:value={quiz.answer} on:change={updateQuiz} required/>
    </label>

    <button class="btn btn-sm variant-filled-error" on:click={deleteQuiz}>
        <Fa icon={faTrash} />
    </button>
</div>