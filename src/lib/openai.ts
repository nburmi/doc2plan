import OpenAI from "openai";
import { openaiStore } from "../stores/openai";
import { get } from 'svelte/store'


// return true if the api key is valid
export async function isValidApiKey(apikey: string): Promise<boolean> {
    if (!apikey) {
        return false;
    }

    const openai = new OpenAI(
        {
            apiKey: apikey,
            dangerouslyAllowBrowser: true
        }
    );

    try {
        // wait for the response
        await openai.models.list();

        openaiStore.update(value => {
            value.apiKey = apikey;
            return value;
        });

        return true;
    } catch (error) {
        throw new Error("Invalid API Key");
    }
}

// create an assistant
export async function createAssistant() {
    const params = {
        name: 'ihaveaplan',
        description: 'Create a learning plan from your documents.',
        instructions: 'You are helpfull assistant that can generate learning plan based on user goals and options.',
        model: get(openaiStore).model,
        temperature: get(openaiStore).temperature,
        vector_store_id: get(openaiStore).vectorStoreId,
        file_id: get(openaiStore).fileId,
    }

    if (!params.file_id) {
        throw new Error("No file uploaded");
    }

    const openai = new OpenAI(
        {
            apiKey: get(openaiStore).apiKey,
            dangerouslyAllowBrowser: true
        }
    );

    console.log('creating assistant', get(openaiStore).model);

    try {
        const response = await openai.beta.assistants.create({
            model: params.model,
            description: params.description,
            instructions: params.instructions,
            name: params.name,
            temperature: params.temperature,
            tools: [{ type: 'file_search' }],
            tool_resources: {
                file_search: {
                    vector_store_ids: [params.vector_store_id],
                }
            },
        })
        if (response.id) {
            openaiStore.update(value => {
                value.assistantId = response.id;
                return value;
            });
        }
    } catch (error) {
        throw new Error(`Error creating assistant: ${error}`);
    }
}

export async function updateAssistant() {
    const params = {
        name: 'ihaveaplan',
        description: 'Create a learning plan from your documents.',
        instructions: 'You are helpfull assistant that can generate learning plan based on user goals and options.',
        model: get(openaiStore).model,
        temperature: get(openaiStore).temperature,
        vector_store_id: get(openaiStore).vectorStoreId,
        file_id: get(openaiStore).fileId,
        assistant_id: get(openaiStore).assistantId,
    }

    if (!params.assistant_id) {
        throw new Error("No assistant created");
    }

    if (!params.file_id) {
        throw new Error("No file uploaded");
    }

    const openai = new OpenAI(
        {
            apiKey: get(openaiStore).apiKey,
            dangerouslyAllowBrowser: true
        }
    );

    try {
        const response = await openai.beta.assistants.update(params.assistant_id, {
            model: params.model,
            description: params.description,
            instructions: params.instructions,
            name: params.name,
            temperature: params.temperature,
            tools: [{ type: 'file_search' }],
            tool_resources: {
                file_search: {
                    vector_store_ids: [params.vector_store_id],
                }
            },
        })
        if (response.id) {
            openaiStore.update(value => {
                value.assistantId = response.id;
                return value;
            });
        }
    } catch (error) {
        throw new Error(`Error updating assistant: ${error}`);
    }
}


// upload a file to the assistant
export async function uploadFile(file: File) {
    const openai = new OpenAI(
        {
            apiKey: get(openaiStore).apiKey,
            dangerouslyAllowBrowser: true
        }
    );

    try {
        // Upload the file to OpenAI
        const response = await openai.files.create({
            file: file,
            purpose: 'assistants',
        });

        // set to store fileId
        openaiStore.update(value => {
            value.fileId = response.id;
            return value;
        });

        // Create a vector store including our two files.
        let vectorStore = await openai.beta.vectorStores.create({
            name: "ihaveaplan",
            file_ids: [response.id],
            expires_after: {
                anchor: 'last_active_at',
                days: 1,
            }
        });

        // set to store vectorStoreId
        openaiStore.update(value => {
            value.vectorStoreId = vectorStore.id;
            return value;
        });
    } catch (error) {
        throw new Error(`Error uploading file: ${error}`);
    }
}

export async function clearOpenAI({ assistantId, fileId, vectorStoreId 
}: { assistantId?: string, fileId?: string, vectorStoreId?: string}
) {
    const openai = new OpenAI(
        {
            apiKey: get(openaiStore).apiKey,
            dangerouslyAllowBrowser: true
        }
    );

    try {
        if (assistantId) await openai.beta.assistants.del(assistantId);
        if (vectorStoreId) await openai.beta.vectorStores.del(vectorStoreId);
        if (fileId) await openai.files.del(fileId);

        openaiStore.update(value => {
            value.assistantId = '';
            value.fileId = '';
            value.vectorStoreId = '';
            return value;
        });
    } catch (error) {
        throw new Error(`Error clearing: ${error}`);
    }
}


export async function clearEverything() {
    const openai = new OpenAI(
        {
            apiKey: get(openaiStore).apiKey,
            dangerouslyAllowBrowser: true
        }
    );

    try {
        const assistants = await openai.beta.assistants.list();
        for (const assistant of assistants.data) {
            await openai.beta.assistants.del(assistant.id);
        }

        const files = await openai.files.list();
        for (const file of files.data) {
            await openai.files.del(file.id);
        }

        // todo delete threads
        // const threadID = get(openaiStore).threadId;
        // if (threadID) {
        //     await openai.beta.threads.del(threadID);
        //     openaiStore.update(value => {
        //         value.threadId = '';
        //         return value;
        //     });
        // }

        let done = false;

        let vectorStores = await openai.beta.vectorStores.list();
        console.log(vectorStores.data);


        while (vectorStores.data.length > 0 && !done) {
            console.log(`length: ${vectorStores.data.length}`)

            const last = vectorStores.data[vectorStores.data.length - 1];

            // except latest index
            for (let i = 0; i < vectorStores.data.length - 1; i++) {
                console.log(`deleting ${vectorStores.data[i].id}`);
                await openai.beta.vectorStores.del(vectorStores.data[i].id);
            }

            if (vectorStores.hasNextPage()) {
                console.log('getting next page');
                vectorStores = await vectorStores.getNextPage();

                // delete the last one
                console.log(`deleting ${last.id}`);
                await openai.beta.vectorStores.del(last.id);
            } else {
                done = true;
            }
        }
    } catch (error) {
        throw new Error(`Error clearing everything: ${error}`);
    }
}

const promptChaptersPlan = `Generate a lists all chapters of the book, including only the number and name of each chapter. The format should precisely follow these specifications:
1. [Name]
2. [Name]
// Continue with additional chapters as necessary

Ensure that every chapter of the book is represented, with the exact name as it appears in the book.
`;

export async function extractChapters(): Promise<Chapter[]> {
    const openai = new OpenAI(
        {
            apiKey: get(openaiStore).apiKey,
            dangerouslyAllowBrowser: true
        }
    );

    let threadId = '';
    try {
        const thread = await openai.beta.threads.create();
        threadId = thread.id;

        const message = await openai.beta.threads.messages.create(
            thread.id,
            {
                role: "user",
                content: promptChaptersPlan,
            });

        let run = await openai.beta.threads.runs.create(
            thread.id,
            {
                assistant_id: get(openaiStore).assistantId,
                instructions: "Generate a list of chapters from the book.",
            },
        );

        while (['queued', 'in_progress', 'cancelling'].includes(run.status)) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
            run = await openai.beta.threads.runs.retrieve(
                run.thread_id,
                run.id
            );
        }

        const messages = await openai.beta.threads.messages.list(
            run.thread_id,
            {
                limit: 1,
                order: "desc",
            },
        );

        if (messages.data.length === 0) {
            throw new Error("Error extracting chapters: No data returned");
        }

        const chapter = messages.data[0];
        let chaptersRaw = '';

        chapter.content.forEach((content) => {
            if (content.type === 'text') chaptersRaw += content.text.value + '\n';
        });

        return extractchaptersRaw(chaptersRaw);;
    } catch (error) {
        throw new Error(`Error creating assistant: ${error}`);
    } finally {
        if (threadId) await openai.beta.threads.del(threadId);
    }
}

function extractchaptersRaw(chaptersRaw: string): Chapter[] {
    // clear chapters
    let chapters: Chapter[] = [];

    // find find where number 1 is
    const start = chaptersRaw.indexOf('1.');

    // get the chapters
    const chaptersRawExtracted = chaptersRaw.substring(start, chaptersRaw.length);

    // split the chapters
    const chaptersArray = chaptersRawExtracted.split('\n');

    // remove empty strings
    const chaptersArrayFiltered = chaptersArray.filter((chapter) => chapter !== '');

    // create chapter objects
    for (let i = 0; i < chaptersArrayFiltered.length; i++) {
        const chapter = chaptersArrayFiltered[i];
        chapters.push(
            {
                id: i + 1,
                name: chapter,
                topics: [],
                done: false,
            },
        );
    }

    return chapters;
}

export async function extractKeyTopics(path: string) {
    const promptChapterTopicsToCover = `Generate a numbered list of topics to cover in the chapter '${path}'. 
            The list should include all major topics, subtopics, and key points that are covered in the chapter. 
            The format should precisely follow these specifications:
            1. [Topic 1]
                1.1. [Subtopic 1]
                1.1.1 [Key Point 1]
                1.1.2 [Key Point 2]
            2. [Topic 2]
            // Continue with additional topics as necessary
            Ensure that every topic in the chapter is represented, with the exact name as it appears in the chapter.`;

    const openai = new OpenAI(
        {
            apiKey: get(openaiStore).apiKey,
            dangerouslyAllowBrowser: true
        }
    );

    let threadId = '';
    try {
        const thread = await openai.beta.threads.create();
        threadId = thread.id;

        await openai.beta.threads.messages.create(
            threadId,
            {
                role: "user",
                content: promptChapterTopicsToCover,
            });

        let run = await openai.beta.threads.runs.create(
            threadId,
            {
                assistant_id: get(openaiStore).assistantId,
                instructions: `You are helpfull assistant that helps to create learning plan based on '${path}' context.`,
            },
        );

        while (['queued', 'in_progress', 'cancelling'].includes(run.status)) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
            run = await openai.beta.threads.runs.retrieve(
                run.thread_id,
                run.id
            );
        }

        const messages = await openai.beta.threads.messages.list(threadId, { limit: 1, order: "desc" });
        if (messages.data.length === 0) {
            throw new Error("Error extracting topics: No data returned");
        }

        const chapter = messages.data[0];
        let keyTopics = '';
        for (const content of chapter.content) {
            if (content.type === 'text') keyTopics += content.text.value + '\n';
        }

        return keyTopics
    } catch (error) {
        throw new Error(`Error creating assistant: ${error}`);
    } finally {
        if (threadId) await openai.beta.threads.del(threadId);
    }
}

// recursive function to find parent topic by id with children
function findParentTopic(topics: Topic[], parent_id: number): Topic | undefined {
    for (const topic of topics) {
        if (topic.id === parent_id) {
            return topic;
        }

        if (topic.children) {
            const parent = findParentTopic(topic.children, parent_id);
            if (parent) {
                return parent;
            }
        }
    }

    return undefined;
}

export function parseKeyTopics(keyTopics: string): Topic[] {
    const topics = parseNumberedList(keyTopics);
    // console.log(topics);

    // const format = (t: Topic) => {
    //     if (!t) {
    //         return '';
    //     }

    //     if (!t.parent_id) {
    //         return `${t.title}`;
    //     }

    //     let stack = [];
    //     let parent: number | undefined = t.parent_id;
    //     while (parent) {
    //         let p = findParentTopic(topics, parent);
    //         if (!p) {
    //             break;
    //         }

    //         stack.push(p.title);
    //         parent = p.parent_id;
    //     }

    //     return `${stack.reverse().join(' > ')} > ${t.title}`;
    // }

    // go through all topics and printTopic
    // for (let i = 0; i < topics.length; i++) {
    //     const topic = topics[i];
    //     // topic.path = format(topic);
    //     topics[i] = topic;
    // }

    return topics;
}


const parseNumberedList = (input: string): Topic[] => {
    const lines = input.split('\n');
    const topics: Topic[] = [];
    const stack: [Topic, number][] = [];  // To hold topics and their levels

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        // skip empty lines
        // skip first line if it does not start with 1.
        // skip last line if does not contain number 
        if (!trimmedLine
            || (index === 0 && !trimmedLine.startsWith('1.'))
            || index === lines.length - 1 && !trimmedLine.match(/\d/)) {
            return;
        }

        const level = line.length - trimmedLine.length;  // Determine depth by counting leading spaces
        const title = trimmedLine.replace(/^[\d.]+\s*/, '');  // Remove the numbering
        const topic: Topic = { id: index, title: title, path: "", done: false };

        // Find the correct place to add this topic in the hierarchy
        while (stack.length > 0 && stack[stack.length - 1][1] >= level) {
            stack.pop();  // Pop from stack until we find the parent level
        }

        if (stack.length > 0) {
            const parent = stack[stack.length - 1][0];
            if (!parent.children) {
                parent.children = [];
            }
            topic.parent_id = parent.id;

            let path = parent.path;
            topic.path = path + ' > ' + topic.title;
            parent.children.push(topic);
        } else {
            topic.path = topic.title;
            topics.push(topic);  // Add as a root topic if stack is empty
        }

        stack.push([topic, level]);  // Push the current topic with its level to the stack
    });

    return topics;
};

export async function generateTopicContent(chapter: string, path: string): Promise<string> {
    const prompt = `Teach me topic "${path}" from ${chapter}. Provide a detailed explanation of the topic.`;
    console.log(prompt);

    const openai = new OpenAI(
        {
            apiKey: get(openaiStore).apiKey,
            dangerouslyAllowBrowser: true
        }
    );

    let threadId = '';
    try {
        const thread = await openai.beta.threads.create();
        threadId = thread.id;

        await openai.beta.threads.messages.create(
            threadId,
            {
                role: "user",
                content: prompt,
            });

        let run = await openai.beta.threads.runs.create(
            threadId,
            {
                assistant_id: get(openaiStore).assistantId,
                instructions: `You are helpfull assistant that helps to create learning plan based on '${chapter}' context.`,
            },
        );

        while (['queued', 'in_progress', 'cancelling'].includes(run.status)) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
            run = await openai.beta.threads.runs.retrieve(
                run.thread_id,
                run.id
            );
        }

        const messages = await openai.beta.threads.messages.list(threadId, { limit: 1, order: "desc" });
        if (messages.data.length === 0) {
            throw new Error("Error extracting topics: No data returned");
        }

        const topic = messages.data[0];
        let content = '';
        for (const c of topic.content) {
            if (c.type === 'text') content += c.text.value + '\n';
        }

        return content;
    } catch (error) {
        throw new Error(`Error creating assistant: ${error}`);
    } finally {
        if (threadId) await openai.beta.threads.del(threadId);
    }
}

export async function generateQuizes(chapter: string, path: string, content: string): Promise<Quiz[]> {
    const prompt = `Generate a list of questions and answers for the topic "${path}" from ${chapter} based on the following content: "${content}"
    Based on the provided content, create a set of questions and answers that test the reader's understanding of the topic. 
    Format the questions and answers in the following way:
    Question: [Question 1]
    Answer: [Answer 1]
    Question: [Question 2]
    Answer: [Answer 2]
    // Continue with additional questions and answers as necessary`;

    console.log(prompt);

    const openai = new OpenAI(
        {
            apiKey: get(openaiStore).apiKey,
            dangerouslyAllowBrowser: true
        }
    );

    let threadId = '';
    try {
        const thread = await openai.beta.threads.create();
        threadId = thread.id;

        await openai.beta.threads.messages.create(
            threadId,
            {
                role: "user",
                content: prompt,
            });

        let run = await openai.beta.threads.runs.create(
            threadId,
            {
                assistant_id: get(openaiStore).assistantId,
                // instruction for particular chapter, topic and content
                instructions: `You are helpfull assistant that helps to create learning plan based on '${chapter}' context.`,
            },
        );

        while (['queued', 'in_progress', 'cancelling'].includes(run.status)) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
            run = await openai.beta.threads.runs.retrieve(
                run.thread_id,
                run.id
            );
        }

        const messages = await openai.beta.threads.messages.list(threadId, { limit: 1, order: "desc" });
        if (messages.data.length === 0) {
            throw new Error("Error extracting topics: No data returned");
        }

        const quiz = messages.data[0];
        let questions = '';
        for (const c of quiz.content) {
            if (c.type === 'text') questions += c.text.value + '\n';
        }

        return parseQuestions(questions);
    } catch (error) {
        throw new Error(`Error creating assistant: ${error}`);
    } finally {
        if (threadId) await openai.beta.threads.del(threadId);
    }
}

function parseQuestions(questions: string): Quiz[] {
    const lines = questions.split('\n');
    const quizes: Quiz[] = [];
    let question = '';
    let answer = '';
    let isQuestion = true;

    for (const line of lines) {
        if (line.startsWith('Question:')) {
            if (question) {
                quizes.push({
                    id: quizes.length + 1,
                    question: question,
                    answer: answer,
                    done: false,
                });
            }

            question = line.replace('Question:', '').trim();
            isQuestion = true;
        } else if (line.startsWith('Answer:')) {
            answer = line.replace('Answer:', '').trim();
            isQuestion = false;
        } else {
            if (isQuestion) {
                question += line;
            } else {
                answer += line;
            }
        }
    }

    if (question) {
        quizes.push({
            id: quizes.length + 1,
            question: question,
            answer: answer,
            done: false,
        });
    }

    return quizes;
}