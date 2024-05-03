<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

	import { onMount } from 'svelte';
	import { autoModeWatcher } from '@skeletonlabs/skeleton';

	onMount(() => {										
		autoModeWatcher();
	});
</script>


<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<h3 class="h1">
					<span class="bg-gradient-to-br from-blue-500 to-cyan-300 bg-clip-text text-transparent box-decoration-clone">ihaveaplan</span>
				</h3>
			</svelte:fragment>
			<svelte:fragment slot="default">
				<div class="flex items-center space-x-4">
					<a href="/creator" class="btn variant-soft">Creator</a>
					<a href="/viewer" class="btn variant-soft">Viewer</a>
					<a href="/settings" class="btn variant-soft">Settings</a>
				</div>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<LightSwitch />
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<!-- Page Route Content -->
	<slot />
</AppShell>