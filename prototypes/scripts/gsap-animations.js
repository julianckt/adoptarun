/* GSAP & ScrollTrigger Animations for Adopt A Run Prototype */
document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP plugins if available
  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // 1. Hero 3D Typography Hover Pop & Font Weight Expansion
    const heroTitle = document.querySelector('.hero-title-3d');
    if (heroTitle) {
      heroTitle.addEventListener('mouseenter', () => {
        gsap.to(heroTitle, {
          rotateX: 0,
          fontWeight: 900,
          color: '#000000',
          duration: 0.4,
          ease: 'power2.out'
        });
      });
      heroTitle.addEventListener('mouseleave', () => {
        gsap.to(heroTitle, {
          rotateX: 68,
          fontWeight: 600,
          color: 'oklch(0.16 0.0075 128)',
          duration: 0.4,
          ease: 'power2.out'
        });
      });
    }

    // 2. Telemetry Digit Matrix Scramble Effect
    const numElements = document.querySelectorAll('.telemetry-num');
    numElements.forEach(el => {
      const targetVal = parseInt(el.getAttribute('data-target') || el.innerText.replace(/\D/g, '')) || 120;
      const originalText = el.innerText;
      
      const scrambleTrigger = () => {
        let count = 0;
        const interval = setInterval(() => {
          el.innerText = Math.floor(Math.random() * targetVal * 1.5);
          count++;
          if (count > 12) {
            clearInterval(interval);
            el.innerText = originalText;
          }
        }, 30);
      };

      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          onEnter: scrambleTrigger
        });
      } else {
        el.addEventListener('mouseenter', scrambleTrigger);
      }
    });

    // 3. Scroll Theme Crossfade (Stark White Hero -> Dark Body)
    const heroWrapper = document.querySelector('.hero-wrapper');
    if (heroWrapper && typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.create({
        trigger: '.hero-wrapper',
        start: 'bottom 50%',
        onLeave: () => {
          gsap.to('body', { backgroundColor: 'oklch(0.16 0.0075 128)', duration: 0.5 });
        },
        onEnterBack: () => {
          gsap.to('body', { backgroundColor: 'oklch(0.16 0.0075 128)', duration: 0.5 });
        }
      });
    }
  }

  // Corner Crosshair Spin on Card Hover
  const bentoCards = document.querySelectorAll('.bento-card');
  bentoCards.forEach(card => {
    const crosshairs = card.querySelectorAll('.crosshair');
    card.addEventListener('mouseenter', () => {
      crosshairs.forEach(ch => ch.style.transform = 'rotate(90deg)');
    });
    card.addEventListener('mouseleave', () => {
      crosshairs.forEach(ch => ch.style.transform = 'rotate(0deg)');
    });
  });
});
