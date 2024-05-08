<script lang="ts">
    export let content: string;
    export let empty: boolean;
</script>

{#if empty}
    {content}
{:else}
    <p class="underline decoration-1 underline-offset-4">{content}</p>
{/if}