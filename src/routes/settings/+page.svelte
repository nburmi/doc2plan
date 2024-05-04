<script lang="ts">
    import { openaiStore } from "../../stores/openai";

    let data: {
        apiKey: string;
        model: string;
        temperature: number;
        fileId: string;
        vectorStoreId: string;
        assistantId: string;
    }

    openaiStore.subscribe((value) => {
        if (!value) return;

        if (!data) {
            data = {
                apiKey: value.apiKey,
                model: value.model,
                temperature: value.temperature,
                fileId: value.fileId,
                vectorStoreId: value.vectorStoreId,
                assistantId: value.assistantId
            }
            return ;
        } 

        data.apiKey = value.apiKey;
        data.model = value.model;
        data.fileId = value.fileId;
        data.vectorStoreId = value.vectorStoreId;
        data.assistantId = value.assistantId;
        data.temperature = value.temperature;
    });

    $: {
        openaiStore.update((value) => {
            return {
                ...value,
                apiKey: data.apiKey,
                model: data.model,
                fileId: data.fileId,
                vectorStoreId: data.vectorStoreId,
                assistantId: data.assistantId,
                temperature: data.temperature
            }
        });
    }

    function clear() {
        data = {
            apiKey: "",
            model: "",
            temperature: 0,
            fileId: "",
            vectorStoreId: "",
            assistantId: ""
        }
    }
</script>


<div class="flex flex-col justify-center">
    <div class="flex flex-row justify-between">
        <h1 class="text-2xl font-bold">Settings</h1>
    </div>

    <div class="flex flex-col mt-5">
        <label class="label">
            <span>API Key</span>
            <input class="input" type="text" placeholder="OpenAI api key" bind:value={data.apiKey} />
        </label>

        <label class="label">
            <span>Model</span>
            <input class="input" type="text" placeholder="OpenAI model" bind:value={data.model} />
        </label>

        <label class="label">
            <span>Temperature</span>
            <input class="input" type="number" placeholder="OpenAI temperature" bind:value={data.temperature} />
        </label>

        <label class="label">
            <span>File ID</span>
            <input class="input" type="text" placeholder="OpenAI file id" bind:value={data.fileId} />
        </label>

        <label class="label">
            <span>Vector Store ID</span>
            <input class="input" type="text" placeholder="OpenAI vector store id" bind:value={data.vectorStoreId} />
        </label>

        <label class="label">
            <span>Assistant ID</span>
            <input class="input" type="text" placeholder="OpenAI assistant id" bind:value={data.assistantId} />
        </label>


        <!-- <button class="btn variant-filled-primary" on:click={clear}>Clear</button> -->
        <!-- <p>To create new values start from Creator.</p> -->
</div>
</div>

