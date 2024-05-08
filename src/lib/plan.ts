import { get } from 'svelte/store';
import { planStore } from '../stores/plan';

export function toJSON() {
	const plan = get(planStore);
	return JSON.stringify(plan);
}

export function fromJSON(json: string) {
	const plan = JSON.parse(json);
	planStore.set(plan);
}

export function totalChapters() {
	const plan = get(planStore);
	return plan.chapters.length;
}

export function clearPlanStore() {
	planStore.set({
		name: '',
		chapters: []
	});
}

export function isPlanEmpty() {
	const plan = get(planStore);
	return plan.chapters.length === 0 && plan.name === '';
}
