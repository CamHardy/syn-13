<script>
  import Keyboard from "$lib/components/keyboard/Keyboard.svelte";
  
  let text = $state('');
  
  function toggleFullscreen() {
	  const cframe = document.getElementById("content-frame");

    if (!cframe) {
      console.error("Could not find content frame");
      return;
    }
	  
    if (!document.fullscreenElement) {
      cframe.requestFullscreen();
    } else {
      document.exitFullscreen?.();
    }
  }
  
  $effect(() => {
    const gCanvas = /** @type { HTMLCanvasElement } */ (document.getElementById('game-canvas'));

    if (!gCanvas) {
      console.error("Could not find game canvas");
      return;
    }

    const gCtx= gCanvas.getContext('2d');

    if (!gCtx) {
      console.error("Could not get game canvas context");
      return;
    }
    
    gCtx.fillRect(0, 0, 512, 384);
  });
  
  /** @param { string } value */
  function trigger(value) {
    text += value;
  }
</script>

<div id="content-frame" class="bg-green-500 overflow-hidden">
  <button id="fullscreen-trigger" class="m-4 p-4 bg-slate-500 rounded text-white" onclick={toggleFullscreen}>
    Toggle Fullscreen
  </button>
  
  <canvas id="game-canvas" class="w-full" width="512" height="384"></canvas>
  
  <h1>TEXT: {text}</h1>

  <Keyboard {trigger} />
</div>