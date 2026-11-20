const heroChest = document.querySelector('.hero-chest');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (heroChest?.animate && !reduceMotion.matches) {
  heroChest.decode().then(() => {
    if (!reduceMotion.matches) {
      heroChest.animate([
        { opacity: 0, transform: 'translate3d(9%, 14%, 0) rotate(7deg) scale(.91)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0) rotate(0) scale(1)' },
      ], { duration: 1050, easing: 'cubic-bezier(.16, 1, .3, 1)' });
    }
  }).catch(() => {});
}

const toggle = document.querySelector('#cue-toggle');
const value = document.querySelector('#tracker-value');
const status = document.querySelector('#demo-status');
const phase = document.querySelector('#demo');
let cueVisible = false;
let demoVisible = true;
let timer = null;

function showNextValue() {
  const previous = Number.parseInt(value.textContent, 10);
  const candidate = 2 + Math.floor(Math.random() * (previous === 1 ? 36 : 35));
  value.textContent = `${previous !== 1 && candidate >= previous ? candidate + 1 : candidate}%`;
}

function syncDemo() {
  const running = cueVisible && demoVisible && !document.hidden;
  if (running && timer === null) {
    showNextValue();
    timer = window.setInterval(showNextValue, 500);
  }
  if (!running && timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
  phase.classList.toggle('in-view', demoVisible && !document.hidden);
}

toggle.disabled = false;
toggle.addEventListener('click', () => {
  cueVisible = !cueVisible;
  toggle.setAttribute('aria-pressed', String(cueVisible));
  toggle.firstChild.textContent = cueVisible ? 'Clear chest cue ' : 'Simulate chest cue ';
  if (!cueVisible) value.textContent = '1%';
  status.textContent = cueVisible ? 'Chest cue active · 2–37%' : 'Idle · 1%';
  syncDemo();
});

document.addEventListener('visibilitychange', syncDemo);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(([event]) => {
    demoVisible = event.isIntersecting;
    syncDemo();
  });
  observer.observe(phase);

  if (!reduceMotion.matches) {
    const entranceObserver = new IntersectionObserver((entries) => {
      for (const { isIntersecting, target } of entries) {
        if (!isIntersecting) continue;
        if (!reduceMotion.matches) {
          target.animate([
            { opacity: .4, transform: 'translateY(18px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ], { duration: 650, delay: Array.from(target.parentElement.children).indexOf(target) * 55, easing: 'cubic-bezier(.16, 1, .3, 1)' });
        }
        entranceObserver.unobserve(target);
      }
    }, { threshold: .15 });
    document.querySelectorAll('.concept, .steps li').forEach((entry) => entranceObserver.observe(entry));
  }
} else {
  syncDemo();
}
