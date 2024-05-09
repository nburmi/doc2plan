// svelte-app-env.d.ts
declare module '$app/stores' {
	import { Page } from '@sveltejs/kit';
	import { Readable } from 'svelte/store';

	export const page: Readable<Page>;
}
