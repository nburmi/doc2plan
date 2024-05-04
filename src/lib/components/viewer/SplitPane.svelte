<script lang="ts">
	export let leftInitialSize = '20%';

	let left: HTMLDivElement;
	let isDragging = false;

	function dragstart() {
		isDragging = true;
	}

	function drag(e: MouseEvent) {
		if (!isDragging) return;

		const elementLeft = left.getBoundingClientRect().left;
		left.style.flexBasis = e.clientX - elementLeft + 'px';
	}

	function dragend() {
		if (!isDragging) return;

		isDragging = false;
	}
</script>

<div class="split-pane" on:mousemove={drag} on:mouseup={dragend}>
    <div bind:this={left} class="left" style="flex-basis: {leftInitialSize}">
        <slot name="left" />
    </div>
    <div class="splitter" on:mousedown={dragstart} role="separator" />
    <div class="right">
        <slot name="right" />
    </div>
</div>

<style>
	.splitter {
		flex-grow: 0;
		flex-shrink: 0;
		width: 4px;
		/* background-color: rgba(var(--color-surface-500) / 1); */
		cursor: col-resize;
	}

	.split-pane {
		display: flex;
		align-items: stretch;
		width: 100%;
		max-width: 100%;
	}

	.split-pane > div {
		display: block;
	}

	.left {
		flex-grow: 0;
		flex-shrink: 0;
	}

	.right {
		flex-grow: 1;
		flex-shrink: 1;
		overflow-x: auto;
	}
</style>
