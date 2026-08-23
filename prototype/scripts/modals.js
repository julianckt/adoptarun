/* Interactive Modals Controller for Adopt A Run */
document.addEventListener('DOMContentLoaded', () => {
  // Modal toggle helpers
  window.openModal = function(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
  };

  window.closeModal = function(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
  };

  // Close modals when clicking overlay background
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // 1. Strava OAuth & Log Flow (4 States)
  const stravaStateA = document.getElementById('strava-state-a');
  const stravaStateB = document.getElementById('strava-state-b');
  const stravaStateC = document.getElementById('strava-state-c');

  const btnStartStrava = document.getElementById('btn-start-strava-sync');
  if (btnStartStrava) {
    btnStartStrava.addEventListener('click', () => {
      // Transition State A -> State B (1.2s Pulsing Loader) -> State C (Results)
      if (stravaStateA) stravaStateA.style.display = 'none';
      if (stravaStateB) stravaStateB.style.display = 'block';

      setTimeout(() => {
        if (stravaStateB) stravaStateB.style.display = 'none';
        if (stravaStateC) stravaStateC.style.display = 'block';
      }, 1200);
    });
  }

  const toggleWalkin = document.getElementById('toggle-walkin-fields');
  const walkinFields = document.getElementById('walkin-fields');
  if (toggleWalkin && walkinFields) {
    toggleWalkin.addEventListener('click', (e) => {
      e.preventDefault();
      walkinFields.style.display = (walkinFields.style.display === 'none') ? 'block' : 'none';
    });
  }

  // 2. Social Share Canvas Generator (1:1 vs 9:16)
  const canvas = document.getElementById('share-card-canvas');
  let currentAspect = '1:1';

  window.renderShareCard = function(aspectRatio = '1:1') {
    if (!canvas) return;
    currentAspect = aspectRatio;
    const ctx = canvas.getContext('2d');

    const w = (aspectRatio === '1:1') ? 500 : 360;
    const h = (aspectRatio === '1:1') ? 500 : 640;
    canvas.width = w;
    canvas.height = h;

    // Background fill
    ctx.fillStyle = '#121412';
    ctx.fillRect(0, 0, w, h);

    // 1px Wireframe Border
    ctx.strokeStyle = '#384038';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Crosshairs
    ctx.fillStyle = '#6e7b6e';
    ctx.font = '12px monospace';
    ctx.fillText('+', 14, 24);
    ctx.fillText('+', w - 22, 24);
    ctx.fillText('+', 14, h - 14);
    ctx.fillText('+', w - 22, h - 14);

    // Header Title
    ctx.fillStyle = '#ccff00';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('ADOPT A RUN', 30, 48);

    ctx.fillStyle = '#f5f7f5';
    ctx.font = '13px monospace';
    ctx.fillText('ADOPTER ID: 0124-JC', 30, 72);

    // Draw GPS Polyline Trace
    ctx.strokeStyle = '#ccff00';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(40, h * 0.45);
    ctx.lineTo(w * 0.35, h * 0.3);
    ctx.lineTo(w * 0.65, h * 0.4);
    ctx.lineTo(w * 0.8, h * 0.55);
    ctx.lineTo(w * 0.5, h * 0.7);
    ctx.lineTo(40, h * 0.45);
    ctx.stroke();

    // Stats HUD Block
    ctx.fillStyle = '#1a1f1a';
    ctx.fillRect(30, h - 120, w - 60, 90);
    ctx.strokeStyle = '#384038';
    ctx.strokeRect(30, h - 120, w - 60, 90);

    ctx.fillStyle = '#00aaff';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('8.4 KM', 45, h - 85);
    ctx.fillText('5:24 /KM', 160, h - 85);

    ctx.fillStyle = '#6e7b6e';
    ctx.font = '11px monospace';
    ctx.fillText('DISTANCE', 45, h - 65);
    ctx.fillText('AVG PACE', 160, h - 65);

    ctx.fillStyle = '#ff4500';
    ctx.fillText('CHARITY: HK RESCUE PUPPIES', 45, h - 42);
  };

  const btnRatio1 = document.getElementById('btn-ratio-1-1');
  const btnRatio9 = document.getElementById('btn-ratio-9-16');

  if (btnRatio1) btnRatio1.addEventListener('click', () => renderShareCard('1:1'));
  if (btnRatio9) btnRatio9.addEventListener('click', () => renderShareCard('9:16'));

  // 3. Print Certificate Trigger
  const btnPrintCert = document.getElementById('btn-trigger-print');
  if (btnPrintCert) {
    btnPrintCert.addEventListener('click', () => {
      window.print();
    });
  }
});
