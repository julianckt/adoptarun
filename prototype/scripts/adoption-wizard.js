/* Adoption Portal 4-Step Wizard Interactive Controller */
document.addEventListener('DOMContentLoaded', () => {
  let currentStep = 1;
  const state = {
    route: 'Hong Kong Dog Run',
    routeSlug: 'hong-kong-dog-run',
    distanceKm: 8.4,
    elevationGain: 320,
    charity: 'HK Rescue Puppies',
    charitySlug: 'hk-rescue-puppies',
    impactUnit: 'meals for shelter dogs',
    impactMultiplier: 0.1, // 1 HKD = 0.1 meals
    firstName: '',
    lastName: '',
    email: '',
    commitmentDays: 5,
    targetHkd: 500,
    animalName: ''
  };

  // URL Params check
  const urlParams = new URLSearchParams(window.location.search);
  const routeParam = urlParams.get('route');
  if (routeParam) {
    state.routeSlug = routeParam;
    if (routeParam === 'kowloon-cat-circuit') {
      state.route = 'Kowloon Cat Circuit';
      state.distanceKm = 12.1;
      state.elevationGain = 450;
    } else if (routeParam === 'lantau-boar-trail') {
      state.route = 'Lantau Boar Trail';
      state.distanceKm = 15.6;
      state.elevationGain = 780;
    }
    // Auto-advance to Step 2 if route is pre-selected
    currentStep = 2;
  }

  function updateStepperUI() {
    for (let i = 1; i <= 4; i++) {
      const stepEl = document.getElementById(`step-indicator-${i}`);
      const panelEl = document.getElementById(`wizard-step-${i}`);
      
      if (stepEl) {
        stepEl.classList.remove('active', 'completed');
        if (i < currentStep) stepEl.classList.add('completed');
        if (i === currentStep) stepEl.classList.add('active');
      }

      if (panelEl) {
        panelEl.style.display = (i === currentStep) ? 'block' : 'none';
      }
    }
    updateSummaryDrawer();
  }

  function updateSummaryDrawer() {
    const sumRoute = document.getElementById('summary-route');
    const sumCharity = document.getElementById('summary-charity');
    const sumDate = document.getElementById('summary-date');
    const sumTarget = document.getElementById('summary-target');
    const sumAnimal = document.getElementById('summary-animal');

    if (sumRoute) sumRoute.innerText = state.route;
    if (sumCharity) sumCharity.innerText = state.charity;
    
    // Calculate completion date
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + state.commitmentDays);
    const dateStr = targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (sumDate) sumDate.innerText = `${dateStr} (${state.commitmentDays} days)`;
    
    if (sumTarget) sumTarget.innerText = `HK$ ${state.targetHkd}`;
    if (sumAnimal) sumAnimal.innerText = state.animalName || '[ Unnamed ]';
  }

  // Step 1: Select Route Cards
  const routeCards = document.querySelectorAll('.route-select-card');
  routeCards.forEach(card => {
    card.addEventListener('click', () => {
      routeCards.forEach(c => c.classList.remove('pinned-volt'));
      card.classList.add('pinned-volt');
      state.route = card.getAttribute('data-name');
      state.routeSlug = card.getAttribute('data-slug');
      state.distanceKm = parseFloat(card.getAttribute('data-km') || '8.4');
      state.elevationGain = parseInt(card.getAttribute('data-m') || '320');
      
      // Advance to step 2
      currentStep = 2;
      updateStepperUI();
    });
  });

  // Step 2: Select Charity Cards
  const charityCards = document.querySelectorAll('.charity-select-card');
  charityCards.forEach(card => {
    card.addEventListener('click', () => {
      charityCards.forEach(c => {
        c.style.borderColor = 'var(--wireframe)';
        const cta = c.querySelector('.charity-confirm-cta');
        if (cta) cta.style.display = 'none';
      });

      card.style.borderColor = 'var(--orange)';
      const cta = card.querySelector('.charity-confirm-cta');
      if (cta) {
        cta.style.display = 'block';
        cta.onclick = (e) => {
          e.stopPropagation();
          state.charity = card.getAttribute('data-name');
          state.charitySlug = card.getAttribute('data-slug');
          currentStep = 3;
          updateStepperUI();
        };
      }
    });
  });

  // Step 3: Sliders & Form Details
  const daysSlider = document.getElementById('slider-days');
  const daysReadout = document.getElementById('readout-days');
  if (daysSlider) {
    daysSlider.addEventListener('input', (e) => {
      state.commitmentDays = parseInt(e.target.value);
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + state.commitmentDays);
      const dateStr = targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      if (daysReadout) daysReadout.innerText = `${state.commitmentDays} Days (by ${dateStr})`;
      updateSummaryDrawer();
    });
  }

  const hkdSlider = document.getElementById('slider-hkd');
  const hkdReadout = document.getElementById('readout-hkd');
  const impactReadout = document.getElementById('readout-impact');
  if (hkdSlider) {
    hkdSlider.addEventListener('input', (e) => {
      state.targetHkd = parseInt(e.target.value);
      if (hkdReadout) hkdReadout.innerText = `HK$ ${state.targetHkd}`;
      const meals = Math.floor(state.targetHkd * state.impactMultiplier);
      if (impactReadout) impactReadout.innerText = `Provides ~${meals} ${state.impactUnit}`;
      updateSummaryDrawer();
    });
  }

  const btnStep3Next = document.getElementById('btn-step-3-next');
  if (btnStep3Next) {
    btnStep3Next.addEventListener('click', () => {
      state.firstName = document.getElementById('input-first-name')?.value || 'Julian';
      state.lastName = document.getElementById('input-last-name')?.value || 'Chung';
      state.email = document.getElementById('input-email')?.value || 'julian@example.com';
      
      currentStep = 4;
      updateStepperUI();
    });
  }

  // Step 4: Animal Naming & Commit
  const inputAnimal = document.getElementById('input-animal-name');
  if (inputAnimal) {
    inputAnimal.addEventListener('input', (e) => {
      state.animalName = e.target.value;
      updateSummaryDrawer();
    });
  }

  const btnCommit = document.getElementById('btn-confirm-commit');
  if (btnCommit) {
    btnCommit.addEventListener('click', () => {
      // Form initials: e.g. Julian Chung -> JC
      const initials = ((state.firstName[0] || 'J') + (state.lastName[0] || 'C')).toUpperCase();
      const adopterId = `0124-${initials}`;

      // Store adoption record in localStorage for prototype state
      localStorage.setItem('currentAdoption', JSON.stringify({
        ...state,
        adopterId,
        animalName: state.animalName || 'Sparky'
      }));

      window.location.href = `confirmed.html?adopter_id=${adopterId}`;
    });
  }

  // Initialize UI
  updateStepperUI();
});
