// svelte-app-env.d.ts
declare module '$app/stores' {
    import { Readable } from 'svelte/store';
    import { Page } from '@sveltejs/kit';
  
    export const page: Readable<Page>;
  }