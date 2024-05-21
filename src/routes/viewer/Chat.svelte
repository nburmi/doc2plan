<script lang="ts">
    import { onDestroy } from 'svelte';
	import { chatWithAssistant, createThread, deleteThread } from '$lib/openai';
	import { faMicrophone, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
    import * as marked from 'marked';
    import DOMPurify from 'dompurify';



let elemChat: HTMLElement;

function markdownToHTML(md: string): string {
	return DOMPurify.sanitize(marked.parse(md));
}

function scrollChatBottom(behavior?: ScrollBehavior): void {
	elemChat.scrollTo({ top: elemChat.scrollHeight, behavior });
}
let recording = false;

export let topic: Topic;

let currentMessage = '';

type Message = {
    id: number;
    host: boolean;
    name: string;
    message: string;
    color: string;
};

let messageFeed: Message[] = [
];

let threadId: string;

async function addMessage(): Promise<void> {
    if (!currentMessage) {
        return;
    }

    const newMessage = {
        id: messageFeed.length,
        host: true,
        name: 'User',
        message: currentMessage,
        color: 'variant-soft-primary'
    };
    // Update the message feed
    messageFeed = [...messageFeed, newMessage];

    // Smooth scroll to bottom
    // Timeout prevents race condition
    setTimeout(() => {
        scrollChatBottom('smooth');
    }, 0);

    try {
        chatProcessing = true;

        if (!threadId) {
            threadId = await createThread();
        }

        const aiResponse = await chatWithAssistant(threadId, currentMessage);
        const newAiMessage = {
            id: messageFeed.length,
            host: false,
            name: 'AI Bot',
            message: aiResponse,
            color: 'variant-soft-primary'
        };

        // Update the message feed
        messageFeed = [...messageFeed, newAiMessage];
    } catch (error) {
        console.error(error);
    } finally {
        chatProcessing = false;
        // Clear prompt
        currentMessage = '';
    }

    // Smooth scroll to bottom
    // Timeout prevents race condition
    setTimeout(() => {
        scrollChatBottom('smooth');
    }, 0);
}

let chatProcessing = false;
async function onPromptKeydown(event: KeyboardEvent): Promise<void> {
    if (chatProcessing) {
        return;
    }

    if (['Enter'].includes(event.code)) {
        event.preventDefault();
        await addMessage();
    }
}

let scenarioChoosen = false;
enum Scenario {
    MyPrompt,
    CurrentTopic,
    Quizzes,
    Feynman
}
let currentScenario: Scenario;

function onMyPromptClick(): void {
    console.log('My Prompt');
    scenarioChoosen = true;
    currentScenario = Scenario.MyPrompt;
    addChoosenScenario();
}

function onCurrentTopicClick(): void {
    console.log('Current Topic');
    scenarioChoosen = true;
    currentScenario = Scenario.CurrentTopic;
    addChoosenScenario();
}

function onQuizzesClick(): void {
    console.log('Quizzes');
    scenarioChoosen = true;
    currentScenario = Scenario.Quizzes;
    addChoosenScenario();
}

function onFeynmanClick(): void {
    console.log('Feynman');
    scenarioChoosen = true;
    currentScenario = Scenario.Feynman;
    addChoosenScenario();
}

function addChoosenScenario(): void {
    switch (currentScenario) {
        case Scenario.MyPrompt:
            messageFeed = [...messageFeed, {
                id: messageFeed.length,
                host: false,
                name: 'AI Bot',
                message: 'You have choosen to start a custom conversation.',
                color: 'variant-soft-primary'
            }];
            break;
        case Scenario.CurrentTopic:
            messageFeed = [...messageFeed, {
                id: messageFeed.length,
                host: false,
                name: 'AI Bot',
                message: 'You have choosen to start a conversation about the current topic.',
                color: 'variant-soft-primary'
            }];
            break;
        case Scenario.Quizzes:
            messageFeed = [...messageFeed, {
                id: messageFeed.length,
                host: false,
                name: 'AI Bot',
                message: 'You have choosen to go through quizzes for the current topic.',
                color: 'variant-soft-primary'
            }];
            break;
        case Scenario.Feynman:
            messageFeed = [...messageFeed, {
                id: messageFeed.length,
                host: false,
                name: 'AI Bot',
                message: 'You have choosen to explain the current topic using the Feynman technique.',
                color: 'variant-soft-primary'
            }];
            break;
    }
}

function teardown(): void {
    if (threadId) {
        deleteThread(threadId);
    }
}

onDestroy(() => {
    teardown();
});
</script>

<!-- 
    purpose of chat

    prompt scenarios
    - my prompt
    - conversation about a current topic
    - go through quizzes. + feedback
    - feynman technique explain topic + feedback
 -->

<!-- Chat -->
<div class="grid grid-row-[1fr_auto]">
    <!-- Conversation -->
    <section bind:this={elemChat} class="max-h-[500px] p-4 overflow-y-auto space-y-4">
        <div class="grid">
            <div class="card p-4 variant-soft rounded-tl-none space-y-2">
                <header class="flex justify-between items-center">
                    <p class="font-bold">Greetings!</p>
                </header>
                <p>
                    Welcome to the chat! Here you can ask questions, discuss topics, and get feedback from your assistant.
                    Your topic is "{topic.title}".
                </p>
            </div>
        </div>
        <div class="grid">
            <div class="card p-4 variant-soft rounded-tl-none space-y-2" hidden={scenarioChoosen}>
                <header class="flex justify-between items-center">
                    <p class="font-bold">Choose scenario</p>
                </header>
                <div class="flex">
                    <div class="flex-grow card p-4">
                        <p>Custom Conversation</p>
                        <button class="btn btn-sm variant-filled-primary" on:click={onMyPromptClick}>Start</button>
                    </div>
                    <div class="flex-grow card p-4">
                        Conversation about a current topic "{topic.title}"
                        <button class="btn btn-sm variant-filled-primary" on:click={onCurrentTopicClick}>Start</button>
                    </div>
                    <div class="flex-grow card p-4">
                        Go through quizzes for topic "{topic.title}"
                        <button class="btn btn-sm variant-filled-primary" on:click={onQuizzesClick}>Start</button>
                    </div>
                    <div class="flex-grow card p-4">
                        <p>Explain topic "{topic.title}" using Feynman technique</p>
                        <button class="btn btn-sm variant-filled-primary" on:click={onFeynmanClick}>Start</button>
                    </div>
                </div>
            </div>
        </div>


        {#each messageFeed as bubble}
            {#if bubble.host === true}
                <div class="grid grid-cols-[auto_1fr] gap-2">
                    <div class="card p-4 variant-soft rounded-tl-none space-y-2">
                        <header class="flex justify-between items-center">
                            <p class="font-bold">{bubble.name}</p>
                        </header>
                        <p>{bubble.message}</p>
                    </div>
                </div>
            {:else}
                <div class="grid grid-cols-[1fr_auto] gap-2">
                    <div class="card p-4 rounded-tr-none space-y-2 {bubble.color}">
                        <header class="flex justify-between items-center">
                            <p class="font-bold">{bubble.name}</p>
                        </header>
                        {@html markdownToHTML(bubble.message)}
                    </div>
                </div>
            {/if}
        {/each}

        {#if chatProcessing}
            <p>Loading..</p>
        {/if}
    </section>
    <!-- Prompt -->
    <section class="border-t border-surface-500/30 p-4" hidden={!scenarioChoosen}>
        <div class="input-group input-group-divider grid-cols-[auto_1fr_auto] rounded-container-token">
            <button class="input-group-shim {recording ? 'variant-filled-error' : ''}" on:click={() => recording = !recording}>
                <Fa icon={faMicrophone}/>
            </button>
            
            <textarea
                bind:value={currentMessage}
                class="bg-transparent border-0 ring-0"
                name="prompt"
                id="prompt"
                placeholder="Write a message..."
                rows="1"
                minlength="1"
                on:keydown={onPromptKeydown}
            ></textarea>
            <button class={currentMessage ? 'variant-filled-primary' : 'input-group-shim'} on:click={addMessage} disabled={chatProcessing}>
                <Fa icon={faPaperPlane} />
            </button>
        </div>
    </section>
</div>

