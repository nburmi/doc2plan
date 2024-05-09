<script lang="ts">
    import { planStore } from '../../../stores/plan';
    import { get } from 'svelte/store';
    import { clearPlanStore, isPlanEmpty } from '$lib/plan';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';

    let plan = get(planStore);

    // save as JSON
    const saveAsJSON = () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plan, null, 2));
        const downloadAnchorNode = document.createElement('a');
        const filename = prompt('Enter file name:', get(planStore).name + '.json');
        if (filename !== null) {
            downloadAnchorNode.setAttribute('href', dataStr);
            downloadAnchorNode.setAttribute('download', filename);
            document.body.appendChild(downloadAnchorNode); // required for Firefox
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
    };

    let resetted = isPlanEmpty();
    function clear() {
        clearPlanStore();
        resetted = isPlanEmpty();
    }
</script>

<div class="flex flex-col justify-between space-y-4">
    <h1>Finished plan "{plan.name}"</h1>
    <h2>
        Congratulations! You have finished creating your plan.
    </h2>
    
    <p>You can save your plan as a JSON file to load it later or just to keep a backup.</p>
    <div>
        <button class="btn variant-filled" on:click={saveAsJSON} disabled={resetted}>Save as JSON</button>
    </div>
    
    
    <h2>What's next?</h2>
    
    <p>Start learning now using Viewer mode.</p>
    <div>
        <button class="btn variant-filled-primary" on:click={() => goto(`${base}/viewer`)} disabled={resetted}>Start learning</button>
    </div>

    <p>
        Or you can reset the plan to create a new one.
        Do it only if you are sure you want to discard the current plan.
    </p>
    <div>
        <button class="btn variant-filled-error" on:click={clear} disabled={resetted}>Reset plan</button>
    </div>

    <div>
        <p>If you want to make changes to the plan, you can go back to the chapters page.</p>
        <p>You can also come back and edit the plan later.</p>
    </div>

    <div>
        <button class="btn variant-filled" on:click={() => goto(`${base}/creator/chapters`)}>Back</button>
    </div>
</div>

