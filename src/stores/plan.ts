import { persisted } from 'svelte-persisted-store';

export const planStore = persisted<Plan>('plan', {
	name: '',
	chapters: []
});
