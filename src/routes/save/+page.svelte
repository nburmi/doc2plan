<script lang="ts">
    import { openaiStore } from '../../stores/openai';
    import { planStore } from '../../stores/plan';
    import { get } from 'svelte/store';
	import { clearOpenAI } from '$lib/openai';
    import { clearPlanStore } from '$lib/plan';

    const plan = get(planStore);

    // save as JSON
    const saveAsJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plan, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", "plan.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    function clear() {
        clearOpenAI();
        clearPlanStore();
    }
</script>

<h1>
    You are on the save page
</h1>

<h2>Clear</h2>
<!-- button to clear -->
<button class="btn variant-filled-primary" on:click={clear}>Clear</button>

<div>
    <h2>{plan.name}</h2>
    <!-- total chapters -->
    <p>Total chapters: {plan.chapters.length}</p>
    
    <!-- save as JSON to file -->
    <button class="btn variant-filled-primary" on:click={saveAsJSON}>Save as JSON</button>
</div>
