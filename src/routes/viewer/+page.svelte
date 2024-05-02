<script lang="ts">
	import type { TreeViewNode } from '@skeletonlabs/skeleton';
	import { RecursiveTreeView } from '@skeletonlabs/skeleton';
	import { planStore } from '../../stores/plan';
	import { get } from 'svelte/store';


	const plan = get(planStore);
	const chapters = chaptersToTree(plan.chapters);

	function chaptersToTree(chapters: Chapter[]): TreeViewNode[] {
		let items: TreeViewNode[] = [];

		chapters.forEach(chapter => {
			const chapterID = makeChapterID(chapter);

			items.push({
				id: chapterID,
				content: chapter.name,
				children: topicsToTree(chapterID, chapter.topics)
			});
		});


		return items;
	}

	function makeChapterID (chapter: Chapter) {return `chapter-${chapter.id}`};
	function makeTopicID (parent: string, topic: Topic) { return `${parent}-topic-${topic.id}`};

	function topicsToTree(parent: string, topics: Topic[]): TreeViewNode[] {
		let items: TreeViewNode[] = [];

		topics.forEach(topic => {
			const topicID = makeTopicID(parent, topic);

			items.push({
				id: topicID,
				content: topic.title,
				children: topic.children ? topicsToTree(topicID, topic.children) : []
			});
		});

		return items;
	}

	let checkedNodes : string[] = [];

	let current: Topic | null = null;
	function clickHandler(event: CustomEvent) {
		const id = event.detail.id;
		// if doesn't have topic- in the id, it's a chapter
		if (!id.includes('topic-')) {
			console.log('chapter', id);
			return;
		}

		console.log('topic', id);
		current = findTopic(id);
	}

	function findTopic (id: string): Topic | null {
		for (let chapter of plan.chapters) {
			if (!id.startsWith(makeChapterID(chapter))) {
				// cur chapter
				continue;
			}

			current = recursiveFindTopic(id, makeChapterID(chapter), chapter.topics);
			if (current) {
				return current;
			}
		}

		return null;
	}

	function recursiveFindTopic(id: string, parent: string, topics: Topic[]): Topic | null {
		for (let topic of topics) {
			const topicID = makeTopicID(parent, topic);

			if (id === topicID) {
				return topic;
			}

			if (!id.startsWith(topicID)) {
				continue;
			}

			if (topic.children) {
				return recursiveFindTopic(id, topicID, topic.children);
			}
		}

		return null;
	}
</script>

<div class="flex">
	<div class="container space-y-4">
		<h1>{plan.name}</h1>
	
		<RecursiveTreeView 
		selection 
		multiple 
		relational 
		nodes={chapters} 
		bind:checkedNodes={checkedNodes}
		on:click={clickHandler}
		/>
	</div>
	<div class="container p-10 space-y-4">
		{#if current}
			<h1>{current.title}</h1>
			<p>{current.content}</p>

			{#if current.quizes}
				<h2>Quizes</h2>
				<ul>
					{#each current.quizes as quiz}
						<li>{quiz.question}: {quiz.answer}</li>
					{/each}
				</ul>
			{/if}
		{/if}


		<h1>Selected Nodes</h1>
		<ul>
			{#each checkedNodes as node}
				<li>{node}</li>
			{/each}
		</ul>
	</div>
</div>

