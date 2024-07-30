<script lang="ts">
    import { base } from '$app/paths';
    import { goto } from '$app/navigation';

</script>



<div class="container max-w-5xl mx-auto p-4 rounded-lg mt-5 space-y-4">
    <div class="card bg-gradient-to-br variant-gradient-secondary-tertiary">
        <header class="card-header">
            <h3 class="h3">Creator</h3>
        </header>
        <section class="p-4">
            <p>Start by creating your personalized learning plan. 
                Use AI-powered tools to extract key content from documents or manually set up your topics and quizzes.
            </p>
        </section>
        <footer class="card-footer">
            <!-- redirect to creator -->
            <button class="btn variant-filled" on:click={() => goto(`${base}/creator`)}>Explore Creator</button>
        </footer>
    </div>


    <!-- Viewer -->
    <div class="card bg-gradient-to-br variant-gradient-success-warning text-white">
        <header class="card-header">
            <h3 class="h3">Viewer</h3>
        </header>
        <section class="p-4">
            <p>View your learning plan and track your progress.</p>
        </section>
        <footer class="card-footer">
            <!-- redirect to viewer -->
            <button class="btn variant-filled" on:click={() => goto(`${base}/viewer`)}>Explore Viewer</button>
        </footer>
    </div>


    <!-- Settings -->
    <div class="card bg-gradient-to-br variant-gradient-error-warning">
        <header class="card-header">
            <h3 class="h3">Settings</h3>
        </header>
        <section class="p-4">
            <p>Customize your learning experience by adjusting settings.</p>
        </section>
        <footer class="card-footer">
            <!-- redirect to settings -->
            <button class="btn variant-filled" on:click={() => goto(`${base}/settings`)}>Explore Settings</button>
        </footer>
    </div>
</div>