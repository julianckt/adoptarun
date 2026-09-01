/* Adopt A Run Prototype — Global Main Controller */
document.addEventListener('DOMContentLoaded', () => {
  // Highlight active nav link based on current path
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href'))) {
      link.classList.add('active');
    }
  });

  // Ticker Banner Click Handler -> redirect to signup
  const ticker = document.querySelector('.ticker-banner');
  if (ticker) {
    ticker.addEventListener('click', () => {
      window.location.href = 'signup.html';
    });
  }
});
