<script lang="ts">
    import type { LayoutData } from './$types';
    
    export let data: LayoutData;
</script>

<div class="container max-w-5xl mx-auto p-4 rounded-lg mt-5 card">
    <slot />
</div>