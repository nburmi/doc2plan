import { persisted } from 'svelte-persisted-store'

export const openaiStore = persisted<OpenAI>('openai', {
    apiKey: '',
    assistantId: '',
    fileId: '',
    threadId: '',
    vectorStoreId: '',
});