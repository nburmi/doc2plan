<script lang="ts">
    import { planStore } from '../../../stores/plan';
    import { get } from 'svelte/store';
	import { clearOpenAI } from '$lib/openai';
    import { clearPlanStore } from '$lib/plan';

    let plan = get(planStore);

    // save as JSON
    const saveAsJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plan, null, 2));
        const downloadAnchorNode = document.createElement('a');
        const filename = prompt("Enter file name:", get(planStore).name + ".json");
        if (filename !== null) {
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", filename);
            document.body.appendChild(downloadAnchorNode); // required for Firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
    }

    function clear() {
        clearPlanStore();
    }
</script>

<h1>
    You are on the save page
</h1>

<h2>Clear</h2>
<!-- button to clear -->
<button class="btn variant-filled-error" on:click={clear}>Reset plan</button>

<div>
    <h2>{plan.name}</h2>
    <!-- total chapters -->
    <p>Total chapters: {plan.chapters.length}</p>
    
    <!-- save as JSON to file -->
    <button class="btn variant-filled-primary" on:click={saveAsJSON}>Save as JSON</button>
</div>
