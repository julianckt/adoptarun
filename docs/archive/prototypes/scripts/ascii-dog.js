/* HTML5 Canvas ASCII Generative Matrix Dog Engine */
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('ascii-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = canvas.parentElement.clientWidth;
    height = canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const chars = ['☉', 'O', '■', 'X', '+', '::', '.', '★', 'RUN', 'HKG', '01'];
  let frame = 0;

  // Running dog 2D polygon frame sequence points
  function getDogPolygon(t) {
    const legPhase = Math.sin(t * 0.15);
    const bodyBounce = Math.abs(Math.sin(t * 0.3)) * 8;

    return [
      { x: 0.45, y: 0.45 - bodyBounce/100 }, // Snout
      { x: 0.48, y: 0.42 - bodyBounce/100 }, // Head
      { x: 0.52, y: 0.44 }, // Neck
      { x: 0.60, y: 0.45 }, // Back
      { x: 0.66, y: 0.48 }, // Tail base
      { x: 0.70, y: 0.42 }, // Tail tip
      { x: 0.64, y: 0.54 + legPhase * 0.04 }, // Back leg 1
      { x: 0.61, y: 0.52 - legPhase * 0.04 }, // Back leg 2
      { x: 0.52, y: 0.54 - legPhase * 0.04 }, // Front leg 1
      { x: 0.49, y: 0.52 + legPhase * 0.04 }, // Front leg 2
    ];
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(110, 123, 110, 0.45)'; // Muted HUD token opacity

    const cols = Math.floor(width / 16);
    const rows = Math.floor(height / 16);
    const poly = getDogPolygon(frame);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const xPct = c / cols;
        const yPct = r / rows;

        // Determine distance to dog polygon shape
        let inside = false;
        for (let p of poly) {
          const dx = (xPct - p.x);
          const dy = (yPct - p.y);
          if (dx * dx + dy * dy < 0.008) {
            inside = true;
            break;
          }
        }

        if (inside) {
          const char = chars[(c + r + frame) % chars.length];
          ctx.fillStyle = (frame % 10 < 5) ? 'rgba(204, 255, 0, 0.85)' : 'rgba(255, 69, 0, 0.85)';
          ctx.fillText(char, c * 16, r * 16);
        } else if ((c + r) % 7 === 0) {
          ctx.fillStyle = 'rgba(56, 64, 56, 0.25)';
          ctx.fillText('+', c * 16, r * 16);
        }
      }
    }

    frame++;
    requestAnimationFrame(render);
  }

  render();
});
