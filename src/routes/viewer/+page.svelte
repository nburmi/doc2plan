<script lang="ts">
	import type { TreeViewNode } from '@skeletonlabs/skeleton';
	import { RecursiveTreeView } from '@skeletonlabs/skeleton';
	import { planStore } from '../../stores/plan';
	import { get } from 'svelte/store';
    import * as marked from 'marked';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import TreeViewNodeContent from './TreeViewNodeContent.svelte';
	import SplitPane from './SplitPane.svelte';
	import DOMPurify from 'dompurify';

	const plan = get(planStore);
	let checkedNodes : string[] = [];
	let indeterminateNodes: string[] = [];
	let chapters = chaptersToTree(plan.chapters);
	
	function chaptersToTree(chapters: Chapter[]): TreeViewNode[] {
		let items: TreeViewNode[] = [];

		chapters.forEach(chapter => {
			const chapterID = makeChapterID(chapter);
			if (chapter.done) {
				insertChecked(chapterID);
			}

			const result = topicsToTree(chapterID, chapter.topics);
			if (result.indeterminateParent) {
				insertParent(chapterID);
			}

			items.push({
				id: chapterID,
				content: TreeViewNodeContent,
				contentProps: {
					empty: chapter.keyTopics ? false : true,
					content: chapter.name,
				},
				children: result.nodes,
			});
		});

		return items;
	}

	function makeChapterID (chapter: Chapter) {return `chapter-${chapter.id}`;};
	function makeTopicID (parent: string, topic: Topic) { return `${parent}-topic-${topic.id}`;};


	function insertParent(parent: string): boolean {
		// isert into intermediate nodes if parent is not checked
		if (!checkedNodes.includes(parent) && !indeterminateNodes.includes(parent)) {
			indeterminateNodes.push(parent);
			return true;
		}

		return false;
	}

	function insertChecked(id: string) {
		// remove from intermediate nodes
		// if not exist in checked nodes
		if (!checkedNodes.includes(id)) {
			const index = indeterminateNodes.indexOf(id);
			if (index > -1) {
				indeterminateNodes.splice(index, 1);
			}

			checkedNodes.push(id);
		}
	}

	function topicsToTree(parent: string, topics: Topic[]): { nodes: TreeViewNode[], indeterminateParent: boolean } {
		let items: TreeViewNode[] = [];

		let indeterminateParent = false;
		topics.forEach(topic => {
			const topicID = makeTopicID(parent, topic);
			if (topic.done) {
				insertParent(parent);
				insertChecked(topicID);
				indeterminateParent = true;
			};

			const result = topicsToTree(topicID, topic.children ? topic.children : []);
			items.push({
				id: topicID,
				children: result.nodes,
				content: TreeViewNodeContent,
				contentProps: {
					empty: topic.content ? false : true,
					content: topic.title,
				},
			});
			indeterminateParent = result.indeterminateParent || indeterminateParent;
		});

		if (indeterminateParent) {
			insertParent(parent);
		}

		return { nodes: items, indeterminateParent: indeterminateParent };
	}

	$: {
		get(planStore).chapters.forEach(chapter => {
			chapter.done = false;

			chapter.topics.forEach(topic => {
				topic.done = false;

				const queue = [];
				if (topic.children) {
					queue.push(...topic.children);
				}

				while (queue.length > 0) {
					const current = queue.shift();
					if (!current) {
						continue;
					}

					current.done = false;
					if (current.children) {
						queue.push(...current.children);
					}
				}
			});
		});

		checkedNodes.forEach(id => {
			const chapter = findChapter(id);
			if (chapter) {
				chapter.done = true;
				return;
			}

			const topic = findTopic(id);
			if (topic) {
				topic.done = true;
				return;
			}
		});

		// update plan store
		planStore.set(plan);
	}

	let currentTopic: Topic | null = null;
	let currentChapter: Chapter | null = null;

	function clickHandler(event: CustomEvent) {
		const id = event.detail.id;
		// if doesn't have topic- in the id, it's a chapter
		if (!id.includes('topic-')) {
			currentChapter = findChapter(id);
			currentTopic = null;
			return;
		}

		currentTopic = findTopic(id);
		currentChapter = null;
	}

	function findTopic(id: string): Topic | null {
		for (let chapter of plan.chapters) {
			if (!id.startsWith(makeChapterID(chapter))) {
				// cur chapter
				continue;
			}

			currentTopic = recursiveFindTopic(id, makeChapterID(chapter), chapter.topics);
			if (currentTopic) {
				return currentTopic;
			}
		}

		return null;
	}

	function findChapter(id: string): Chapter | null {
		for (const chapter of plan.chapters) {
			if (id === makeChapterID(chapter)) {
				return chapter;
			}
		}

		return null;
	}

	function recursiveFindTopic(id: string, parent: string, topics: Topic[]): Topic | null {
		for (const topic of topics) {
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

	function markdownToHTML(md: string): string {
		return DOMPurify.sanitize(marked.parse(md));
	}
</script>


<SplitPane>
	<div slot="left">
		<div class="space-y-4">
			<h1 class="card-header text-center">Plan: {plan.name}</h1>			
			<RecursiveTreeView 
			selection 
			multiple 
			relational 
			nodes={chapters} 
			bind:checkedNodes={checkedNodes}
			bind:indeterminateNodes={indeterminateNodes}
			on:click={clickHandler}
			width="w-fit"
			/>
		</div>
	</div>
	<div slot="right">
		<div class="container space-y-4 p-4">
			{#if currentChapter && !currentTopic}
				<h1>{currentChapter.name}</h1>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html markdownToHTML(currentChapter.keyTopics ? currentChapter.keyTopics : '')}
			{/if}
	
			{#if currentTopic}
				<h1>{currentTopic.title}</h1>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html markdownToHTML(currentTopic.content ? currentTopic.content : '')}
	
				{#if currentTopic.quizzes}
					<h2>Quizes</h2>
					<Accordion>
						{#each currentTopic.quizzes as quiz}
							<AccordionItem>
								<svelte:fragment slot="summary">{quiz.question}</svelte:fragment>
								<svelte:fragment slot="content">
									<!-- eslint-disable-next-line svelte/no-at-html-tags -->
  									{@html markdownToHTML(quiz.answer)}
								</svelte:fragment>
							</AccordionItem>
						{/each}
					</Accordion>
				{/if}
			{/if}
		</div>
	</div>
</SplitPane>


