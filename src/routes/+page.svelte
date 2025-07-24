<script>
  import Keyboard from "$lib/components/keyboard/Keyboard.svelte";
  
  let text = $state('');
  
  function toggleFullscreen() {
	  const cframe = document.getElementById("content-frame");
	  
    if (!document.fullscreenElement) {
      cframe.requestFullscreen();
    } else {
      document.exitFullscreen?.();
    }
  }
  
  $effect(() => {
    const gCanvas = document.getElementById('game-canvas');
    const gCtx= gCanvas.getContext('2d');
    
    gCtx.fillRect(0, 0, 512, 384);
  });
  
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