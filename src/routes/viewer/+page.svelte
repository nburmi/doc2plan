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
			items.push({
				id: `chapter-${chapter.id}`,
				content: chapter.name,
				children: topicsToTree(`chapter-${chapter.id}`, chapter.topics)
			});
		});


		return items;
	}

	function topicsToTree(parent: string, topics: Topic[]): TreeViewNode[] {
		let items: TreeViewNode[] = [];

		topics.forEach(topic => {
			items.push({
				id: `${parent}-topic-${topic.id}`,
				content: topic.title,
				children: topic.children ? topicsToTree(`${parent}-topic-${topic.id}`, topic.children) : []
			});
		});

		return items;
	}

	let checkedNodes : string[] = [];
	let indeterminateNodes : string[] = [];

</script>

<div class="container p-10 space-y-4">
	<h1>{plan.name}</h1>

	<RecursiveTreeView 
	selection 
	multiple 
	relational 
	nodes={chapters} 
	bind:checkedNodes={checkedNodes} 
	bind:indeterminateNodes={indeterminateNodes}/>
</div>