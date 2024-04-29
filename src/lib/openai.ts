import OpenAI from "openai";
import { openaiStore } from "../stores/openai";
import { get } from 'svelte/store'


// return true if the api key is valid
export async function isValidApiKey(apikey: string) : Promise<boolean> {
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

const params = {
    name: 'I have a plan',
    model: 'gpt-3.5-turbo-0125',
    description: 'Create a learning plan from your documents.',
    instructions: 'You are helpfull assistant that can generate learning plan based on user goals and options.',
    temperature: 0.2,
}


// create an assistant
export async function createAssistant() {
    const openai = new OpenAI(
        {
            apiKey: get(openaiStore).apiKey,
            dangerouslyAllowBrowser: true
        }
    );

    if (!get(openaiStore).fileId) {
        throw new Error("No file uploaded");
    }

    try {
        const response = await openai.beta.assistants.create({
            model: params.model,
            description: params.description,
            instructions: params.instructions,
            name: params.name,
            temperature: params.temperature,
            tools: [{type: 'file_search'}],
            tool_resources: {
                file_search: {
                    vector_store_ids: [get(openaiStore).vectorStoreId],
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

export async function clearOpenAI() {
    const openai = new OpenAI(
        {
            apiKey: get(openaiStore).apiKey,
            dangerouslyAllowBrowser: true
        }
    );

    try {
        if (get(openaiStore).threadId) {
            await openai.beta.threads.del(get(openaiStore).threadId);
        }

        if (get(openaiStore).assistantId) {
            await openai.beta.assistants.del(get(openaiStore).assistantId);
        }

        if (get(openaiStore).vectorStoreId) {
            await openai.beta.vectorStores.del(get(openaiStore).vectorStoreId);
        }

        if (get(openaiStore).fileId) {
            await openai.files.del(get(openaiStore).fileId);
        }

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

    try{
        const assistants = await openai.beta.assistants.list();
        for (const assistant of assistants.data) {
            await openai.beta.assistants.del(assistant.id);
        }

        const files = await openai.files.list();
        for (const file of files.data) {
            await openai.files.del(file.id);
        }
        
        // todo delete threads
        // const threads = await openai.beta.threads.list();

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