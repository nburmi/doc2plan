<script lang="ts">
    import TopicComponent from './TopicComponent.svelte';
    import Quizes from './Quizes.svelte';
    import { createEventDispatcher } from 'svelte';
    import { Fa } from 'svelte-fa';
    import { faTrash, faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
    import { generateTopicContent } from '$lib/openai';

    export let topic: Topic;
    export let chapterName: string;
    export let withAI: boolean;

    let loading = false;

    async function generateContent() {
        loading = true;
        try {
            topic.content = await generateTopicContent(chapterName, topic.path)
            updateTopic();
        } catch (error) {
            console.error(error);
        } finally {
            loading = false;
        }
    }

    const addSubtopic = () => {
        if (!topic.children) {
            topic.children = [];
        }

        let max_id = 0;
        topic.children.forEach((t) => {
            if (t.id > max_id) max_id = t.id;
        });

        topic.children = [
            ...topic.children,
            {
                id: max_id + 1,
                path: '',
                title: '',
                content: '',
                done: false,
                children: [],
                quizes: []
            }
        ];
    }

    const handleUpdateQuizes = (event: CustomEvent) => {
        topic.quizes = event.detail.quizes;
        updateTopic();
    }

    const dispatch = createEventDispatcher();
    const updateTopic = () => {
        dispatch('updateTopic', {id: topic.id, topic});
    }

    const updateSubtopic = (event: CustomEvent) => {
        if (!topic.children) {
            topic.children = [];
        }

        // find the subtopic and update it
        const index = topic.children.findIndex((t) => t.id === event.detail.id);
        if (index === -1) return;
        topic.children[index] = event.detail.topic;

        // update the parent topic
        updateTopic();
    }

    const deleteSubtopic = (event: CustomEvent) => {
        if (!topic.children) {
            topic.children = [];
        }

        // find the subtopic and delete it
        topic.children = topic.children.filter((t) => t.id !== event.detail.id);

        // update the parent topic
        updateTopic();
    }

    function deleteSub(id: number) {
        return () => {
            if (!topic.children) return;

            topic.children = topic.children.filter((t) => t.id !== id);
            updateTopic();
        }
    }
</script>


<div class="flex flex-col min-w-full border border-surface-500 rounded-container-token p-4 space-y-4 ">
    {#if withAI}
    <label class="label">
        <input class="input" type="text" placeholder="Path to content: Topic > Subtopic" bind:value={topic.path} on:change={updateTopic} required/>
    </label>
    {/if}

    <!-- title -->
    <label class="label">
        <input class="input" type="text" placeholder="Title" bind:value={topic.title} on:change={updateTopic} required/>
    </label>

    <!-- content -->
    <label class="label">
        <textarea class="textarea" placeholder="Content" bind:value={topic.content} required on:change={updateTopic}></textarea>
    </label>

    <!-- if with AI then show button regenerate -->
    {#if withAI}
        <div>
            <button class="btn btn-sm variant-filled-secondary" on:click={generateContent} disabled={loading}>
                {#if loading}
                    <Fa icon={faSpinner} class="animate-spin"/>
                {:else}
                    Generate content
                {/if}
            </button>
        </div>
    {/if}

    <!-- quizes -->
    <h3>Quizes:</h3>
    <Quizes 
    topicContent={topic.content} 
    topicPath={topic.path} 
    chapterName={chapterName} 
    quizes={topic.quizes}
    withAI={withAI}
    on:updateQuizes={handleUpdateQuizes}/>

    <h3>Subtopics: </h3>
    <div class="flex">
        <button class="btn btn-sm variant-filled" on:click={addSubtopic}>
            <Fa icon={faPlus} />
        </button>
    </div>

    {#if topic.children}
        <Accordion>
            {#each topic.children as subtopic}
                <AccordionItem>
                    <svelte:fragment slot="lead">{subtopic.title === '' ? 'NEW TOPIC' : subtopic.title}</svelte:fragment>
                    <svelte:fragment slot="summary">
                        <div class="flex justify-end">
                            <button class="btn btn-sm variant-filled-error" on:click={deleteSub(subtopic.id)}>
                                <Fa icon={faTrash} />
                            </button>    
                        </div>
                    </svelte:fragment>
                    <svelte:fragment slot="content">
                        <TopicComponent 
                        chapterName={chapterName} 
                        topic={subtopic} 
                        withAI={withAI}
                        on:deleteTopic={deleteSubtopic} 
                        on:updateTopic={updateSubtopic}/>
                    </svelte:fragment>
                </AccordionItem>
            {/each}
        </Accordion>
    {/if}
</div>