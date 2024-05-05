<script lang="ts">
    import { planStore } from '../stores/plan';
    import { get } from 'svelte/store';
    import TopicComponent from './TopicComponent.svelte';
    import { Fa } from 'svelte-fa';
    import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
    import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';

    export let topics: Topic[];
    export let chapter_id: number;

    const addTopic = () => {
        let max_id = 0;
        topics.forEach((t) => {
            if (t.id > max_id) max_id = t.id;
        });

        topics = [
            ...topics,
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

        planStore.update((store) => {
            const index = store.chapters.findIndex((c) => c.id === chapter_id);
            if (index === -1) return store;
            store.chapters[index].topics = topics;
            return store;
        });
    }

    const handleDelete = (event: CustomEvent) => {
        const id = Number(event.detail.id);

        topics = topics.filter((t) => t.id !== id);
        planStore.update((store) => {
            const index = store.chapters.findIndex((c) => c.id === chapter_id);
            if (index === -1) return store;
            store.chapters[index].topics = topics;
            return store;
        });
    }

    function deleteTopic(id: number) {
        return () => {
            topics = topics.filter((t) => t.id !== id);
            planStore.update((store) => {
                const index = store.chapters.findIndex((c) => c.id === chapter_id);
                if (index === -1) return store;
                store.chapters[index].topics = topics;
                return store;
            });
        }
    }

    const getChapterName = () => {
        const chapter = get(planStore).chapters.find((c) => c.id === chapter_id);
        return chapter ? chapter.name : '';
    }

    const handleUpdate = (event: CustomEvent) => {      
        const id = Number(event.detail.id);
        const topic = event.detail.topic;

        topics = topics.map((t) => {
            if (t.id === id) {
                return topic;
            }
            return t;
        });

        planStore.update((store) => {
            const index = store.chapters.findIndex((c) => c.id === chapter_id);
            if (index === -1) return store;
            store.chapters[index].topics = topics;
            return store;
        });
    }
</script>

<div class="flex flex-col items-start min-w-full">
    <div class="flex">
        <h2 class="text-xl font-bold">Topics:</h2>

        <button class="btn btn-sm variant-filled" on:click={addTopic}>
            <Fa icon={faPlus} />
        </button>
    </div>


    <div class="flex flex-col items-start min-w-full">
        <Accordion>
            {#each topics as topic}
            <AccordionItem>
                <svelte:fragment slot="lead">{topic.title === '' ? 'NEW TOPIC' : topic.title}</svelte:fragment>
                <svelte:fragment slot="summary">
                    <div class="flex justify-end">
                        <button class="btn btn-sm variant-filled-error" on:click={deleteTopic(topic.id)}>
                            <Fa icon={faTrash} />
                        </button>
                    </div>
                </svelte:fragment>
                <svelte:fragment slot="content">
                    <TopicComponent topic={topic} chapterName={getChapterName()} on:deleteTopic={handleDelete} on:updateTopic={handleUpdate}/>
                </svelte:fragment>
            </AccordionItem>
            {/each}
        </Accordion>
    </div>
</div>

