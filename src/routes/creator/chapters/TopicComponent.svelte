<script lang="ts">
    import TopicComponent from './TopicComponent.svelte';
    import Quizzes from './Quizzes.svelte';
    import { createEventDispatcher } from 'svelte';
    import { Fa } from 'svelte-fa';
    import { faTrash, faPlus, faSpinner, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
    import { completion, generateTopicContent } from '$lib/openai';
    import { sendErrorToast } from '$lib/alertToast';


    export let topic: Topic;
    export let chapterName: string;
    export let withAI: aiOption;

    let loading = false;

    async function generateContent() {
        loading = true;
        try {
            topic.content = await generateTopicContent(chapterName, topic.path);
            updateTopic();
        } catch (error: unknown) {
            sendErrorToast(`generate content: ${error}`);
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
                path: `${topic.path} > NEW TOPIC`,
                title: 'NEW TOPIC',
                content: '',
                done: false,
                children: [],
                quizzes: []
            }
        ];
    };

    const handleUpdateQuizzes = (event: CustomEvent) => {
        topic.quizzes = event.detail.quizzes;
        updateTopic();
    };

    const dispatch = createEventDispatcher();
    const updateTopic = () => {
        dispatch('updateTopic', {id: topic.id, topic});
    };

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
    };

    const deleteSubtopic = (event: CustomEvent) => {
        if (!topic.children) {
            topic.children = [];
        }

        // find the subtopic and delete it
        topic.children = topic.children.filter((t) => t.id !== event.detail.id);

        // update the parent topic
        updateTopic();
    };

    function deleteSub(id: number) {
        return () => {
            if (!topic.children) return;

            topic.children = topic.children.filter((t) => t.id !== id);
            updateTopic();
        };
    }

    let contentPrompt = 'Rewrite this {content} to make it more engaging and informative.';
    let rewriteLoading = false;
    let rewriterOpen = false;

    async function rewriteContent() {
        rewriteLoading = true;
        const prompt = contentPrompt.replace('{content}', `content: "${topic.content || ''}"`) + 'Answer in markdown format.';

        try {
            const content = await completion(prompt);
            topic.content = content;
            updateTopic();
        } catch (error: unknown) {
            sendErrorToast(`rewrite content: ${error}`);
        } finally {
            rewriteLoading = false;
        }
    }
</script>


<div class="flex flex-col min-w-full border border-surface-500 rounded-container-token p-4 space-y-4 ">
    {#if withAI.assistant}
    <label class="label">
        Path
        <span class="text-sm text-gray-600">Path helps to find a particular topic in the book. Chapter -> Topic -> Subtopic. </span>
        <input class="input" type="text" placeholder="Example: Chapter 1 > Introduction to Svelte > Getting Started" bind:value={topic.path} on:change={updateTopic} required/>
    </label>
    {/if}

    <!-- title -->
    <label class="label">
        Title
        <span class="text-sm text-gray-600">The title of the topic. Used only in Viewer.</span>
        <input class="input" type="text" placeholder="Enter the topic title" bind:value={topic.title} on:change={updateTopic} required/>
    </label>

    <!-- content -->
    <label class="label">
        Content
        <span class="text-sm text-gray-600">
            <a class="underline" href="https://en.wikipedia.org/wiki/Markdown">Markdown format</a>
        </span>

        <textarea class="textarea" placeholder="Content in Markdown format" bind:value={topic.content} required on:change={updateTopic}></textarea>
    </label>

    <!-- if with AI then show button regenerate -->   
    <div class="flex">
        {#if withAI.api}
        <button class="btn btn-sm variant-filled" on:click={() => rewriterOpen = !rewriterOpen}>
            {#if rewriterOpen}
                <Fa icon={faEye} />
            {:else}
                <Fa icon={faEyeSlash} />
            {/if}

            <span class="ml-2">Rewriter</span>
        </button>
        {/if}

        {#if withAI.assistant}
            <button class="btn btn-sm variant-filled-secondary" on:click={generateContent} disabled={loading}>
                {#if loading}
                    <Fa icon={faSpinner} class="animate-spin"/>
                {:else}
                    Generate content
                {/if}
            </button>
        {/if}
    </div>

    {#if withAI.api}
        <!-- rewriter div -->
        {#if rewriterOpen}
            <div class="mb-4">
                <!-- this prompt can modify/add content of topic -->
                <label class="label">
                    <textarea class="textarea" placeholder="" bind:value={contentPrompt}></textarea>
                </label>

                <button class="btn btn-sm variant-filled-secondary" on:click={rewriteContent} disabled={rewriteLoading}>
                    {#if rewriteLoading}
                        <Fa icon={faSpinner} class="animate-spin"/>
                    {:else}
                        Rewrite
                    {/if}
                </button>
            </div>
        {/if}
    {/if}

    <!-- quizzes -->
    <h3>Quizzes:</h3>
    <Quizzes 
    topicContent={topic.content} 
    topicPath={topic.path} 
    chapterName={chapterName} 
    quizzes={topic.quizzes}
    withAI={withAI}
    on:updateQuizzes={handleUpdateQuizzes}/>

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