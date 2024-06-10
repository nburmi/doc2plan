<script lang="ts">
    import { onDestroy } from 'svelte';
	import { chatWithAssistant, createThread, deleteThread, addMessageToThread, speechToText, textToSpeech } from '$lib/openai';
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
    audioURL?: string;
};

let messageFeed: Message[] = [];

let threadId: string;

async function addMessage(msg: string, host: boolean): Promise<void> {
    const newMessage = {
        id: messageFeed.length,
        host,
        name: host ? 'User' : 'AI Bot',
        message: msg,
        color: host ? 'variant-soft-primary' : 'variant-soft-primary'
    };

    // Update the message feed
    messageFeed = [...messageFeed, newMessage];

    const role = host ? 'user' : 'assistant';
    try {
        if (!threadId) {
            threadId = await createThread();
        }

        await addMessageToThread(threadId, role, msg);
    } catch (error) {
        console.error(error);
    }

    // Smooth scroll to bottom
    // Timeout
    setTimeout(() => {
        scrollChatBottom('smooth');
    }, 0);
}

async function chat(): Promise<void> {
    if (!currentMessage) {
        return;
    }

    const newMessage = {
        id: messageFeed.length,
        host: true,
        name: 'User',
        message: currentMessage,
    };
    // Update the message feed
    messageFeed = [...messageFeed, newMessage];

    const msg = currentMessage;

    // Clear prompt
    currentMessage = '';

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

        const aiResponse = await chatWithAssistant(threadId, msg);
        const newAiMessage = {
            id: messageFeed.length,
            host: false,
            name: 'AI Bot',
            message: aiResponse,
        };

        // Update the message feed
        messageFeed = [...messageFeed, newAiMessage];
    } catch (error) {
        console.error(error);
    } finally {
        chatProcessing = false;
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
        await chat();
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

async function onCurrentTopicClick(): Promise<void> {
    console.log('Current Topic');
    scenarioChoosen = true;
    currentScenario = Scenario.CurrentTopic;
    addChoosenScenario();

    // send topic information to the AI
    const msg = `Dear AI, I would like to discuss the topic "${topic.title}". Consider the following content: "${topic.content}".`;
    try {
        await addMessage(msg, true);
    } catch (error) {
        console.error(error);
    }
}

function onQuizzesClick(): void {
    console.log('Quizzes');
    scenarioChoosen = true;
    currentScenario = Scenario.Quizzes;
    addChoosenScenario();

    // init quizzes variable
}

async function onFeynmanClick(): Promise<void> {
    console.log('Feynman');
    scenarioChoosen = true;
    currentScenario = Scenario.Feynman;
    addChoosenScenario();

    const promptUser      = `ChatGPT, I want you to act as a curious person. I'll provide an original text on a concept, and then I'll try to explain it to you. Your job is to listen, ask questions, and provide feedback based on the explanation. However, never give me a straight answer; only give me clues or lead me to think deeper. Also, compare my explanation to the original text to see if I missed anything or made mistakes. If so, guide me subtly without directly pointing it out. Now, here's the original text: "${topic.content}". Let me start explaining, and remember, be curious and only give clues!`;
	const promptAssistant = "Understood. I will be a curious person and only give clues. I will also compare your explanation to the original text to see if you missed anything or made mistakes. If so, I will guide you subtly without directly pointing it out. Let's start!"

    try {
        await addMessage(promptUser, true);
        await addMessage(promptAssistant, false);
    } catch (error) {
        console.error(error);
    }
}

function addChoosenScenario(): void {
    switch (currentScenario) {
        case Scenario.MyPrompt:
            messageFeed = [...messageFeed, {
                id: messageFeed.length,
                host: false,
                name: 'AI Bot',
                message: 'You have choosen to start a custom conversation.',
            }];
            break;
        case Scenario.CurrentTopic:
            messageFeed = [...messageFeed, {
                id: messageFeed.length,
                host: false,
                name: 'AI Bot',
                message: 'You have choosen to start a conversation about the current topic.',
            }];
            break;
        case Scenario.Quizzes:
            messageFeed = [...messageFeed, {
                id: messageFeed.length,
                host: false,
                name: 'AI Bot',
                message: 'You have choosen to go through quizzes for the current topic.',
            }];
            break;
        case Scenario.Feynman:
            messageFeed = [...messageFeed, {
                id: messageFeed.length,
                host: false,
                name: 'AI Bot',
                message: 'You have choosen to explain the current topic using the Feynman technique.',
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

let mediaRecorder: MediaRecorder;
let chunks: Blob[] = [];


function startRecording() {
    recording = true;
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            mediaRecorder.ondataavailable = function(e) {
                chunks.push(e.data);
            }
        });
}

function stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
        if (mediaRecorder) {
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
                chunks = [];
                console.log("Recording stopped");
                resolve(blob);
            };
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            mediaRecorder.stop();
            recording = false;
        } else {
            resolve(null);
            recording = false;
        }
    });
}


async function handleRecording() {
    if (recording) {
        const audioBlob = await stopRecording();

        console.log("stopped recording");
        if (!audioBlob) {
            console.error("No audio blob found");
            return;
        }

        const text = await speechToText(audioBlob);
        if (text) {
            currentMessage = text;
            chat();
            
            const userURL = URL.createObjectURL(audioBlob);
            // find latest user message
            messageFeed[messageFeed.length - 1].audioURL = userURL;
        }
    } else {
        startRecording();
    }
}

let convertingToAudio = false;

async function assistantTextToSpeech(index: number): Promise<void> {
    try {
        if (convertingToAudio) {
            return;
        }

        const latestMessage = messageFeed[index];
        if (!latestMessage || latestMessage.host) {
            return;
        }

        convertingToAudio = true;
        const blob = await textToSpeech(latestMessage.message);
        messageFeed[index].audioURL = URL.createObjectURL(blob);
    } catch (error) {
        console.error(error);
    } finally {
        convertingToAudio = false;
    }
}
</script>

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

                <b>Chat will not be saved after you leave this page. </b>
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
                        Go through quizzes for topic "{topic.title}" (coming soon)
                        <button class="btn btn-sm variant-filled-primary" on:click={onQuizzesClick}>Start</button>
                    </div>
                    <div class="flex-grow card p-4">
                        <p>Explain topic "{topic.title}" using Feynman technique</p>
                        <button class="btn btn-sm variant-filled-primary" on:click={onFeynmanClick}>Start</button>
                    </div>
                </div>
            </div>
        </div>


        {#each messageFeed as msg, index}
            {#if msg.host === true}
                <div class="grid grid-cols-[auto_1fr] gap-2">
                    <div class="card p-4 variant-soft rounded-tl-none space-y-2">
                        <header class="flex justify-between items-center">
                            <p class="font-bold">{msg.name}</p>
                        </header>
                        <p>{msg.message}</p>
                        <footer>
                            {#if msg.audioURL}
                                <audio controls>
                                    <source src={msg.audioURL} type="audio/ogg" />
                                    Your browser does not support the audio element.
                                </audio>
                            {/if}
                        </footer>
                    </div>
                </div>
            {:else}
                <div class="grid grid-cols-[1fr_auto] gap-2">
                    <div class="card p-4 rounded-tr-none space-y-2 variant-soft-primary">
                        <header class="flex justify-between items-center">
                            <p class="font-bold">{msg.name}</p>
                        </header>
                        {@html markdownToHTML(msg.message)}
                        <footer>
                            {#if msg.audioURL}
                                <audio controls>
                                    <source src={msg.audioURL} type="audio/ogg" />
                                    Your browser does not support the audio element.
                                </audio>
                            {:else}
                                <button class="btn btn-sm variant-filled-primary" on:click={() => assistantTextToSpeech(index)} disabled={convertingToAudio}>
                                    Convert to audio
                                </button>
                            {/if}
                        </footer>
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
            <button class="input-group-shim {recording ? 'variant-filled-error' : ''}" on:click={handleRecording}>
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
            <button class={currentMessage ? 'variant-filled-primary' : 'input-group-shim'} on:click={chat} disabled={chatProcessing}>
                <Fa icon={faPaperPlane} />
            </button>
        </div>
    </section>
</div>

