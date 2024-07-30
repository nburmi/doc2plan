import { persisted } from 'svelte-persisted-store';

export const openaiStore = persisted<OpenAI>('openai', {
	apiKey: '',
	assistantId: '',
	fileId: '',
	vectorStoreId: '',
	model: 'gpt-3.5-turbo-0125',
	temperature: 0.2,
	reset() {
		this.apiKey = '';
		this.assistantId = '';
		this.fileId = '';
		this.vectorStoreId = '';
		this.model = 'gpt-3.5-turbo-0125';
		this.temperature = 0.2;
	},
	audioModel: 'tts-1',
	audioVoice: 'alloy',
	audioSpeed: 1,
	completionMaxTokens: 0
});
