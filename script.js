const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mix = (start, end, progress) => start + (end - start) * progress;
const range = (progress, start, end) => clamp((progress - start) / (end - start));
const smoothstep = (value) => {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
};

function createParticles() {
  const field = document.querySelector(".particles");
  if (!field) return;

  const count = window.innerWidth < 700 ? 16 : 28;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.opacity = `${0.08 + Math.random() * 0.2}`;
    particle.style.scale = `${0.6 + Math.random() * 1.4}`;
    fragment.appendChild(particle);
  }

  field.appendChild(fragment);
}

function initHeroScroll() {
  const hero = document.querySelector(".hero-scroll");
  const stage = document.querySelector(".hero-stage");
  const cameraFrame = document.querySelector(".camera-frame");
  const cameraLayer = document.querySelector(".camera-layer");
  const cameraImage = document.querySelector(".camera-img");
  const heroCopy = document.querySelector(".hero-copy");
  const scrollCue = document.querySelector(".scroll-cue");
  const aperture = document.querySelector(".aperture");
  const portal = document.querySelector(".lens-portal");
  const portalShots = [...document.querySelectorAll(".portal-shot")];

  if (!hero || !stage || !cameraFrame) return;

  if (prefersReducedMotion) {
    stage.style.setProperty("--iris", "1");
    document.querySelectorAll(".reveal, .portal-shot").forEach((item) => {
      item.style.opacity = "1";
      item.style.transform = "none";
      item.classList.add("in-view");
    });
    return;
  }

  function draw() {
    const rect = hero.getBoundingClientRect();
    const distance = Math.max(1, hero.offsetHeight - window.innerHeight);
    const progress = clamp(-rect.top / distance);
    const pIntro = smoothstep(range(progress, 0, 0.22));
    const pZoom = smoothstep(range(progress, 0.14, 0.64));
    const pPortal = smoothstep(range(progress, 0.28, 0.74));
    const pFade = smoothstep(range(progress, 0.76, 0.96));
    const scale = mix(1, 3.2, pZoom);

    stage.style.setProperty("--iris", `${mix(0, 1, pPortal)}`);
    stage.style.setProperty("--portal-opacity", `${pPortal}`);
    stage.style.setProperty("--portal-scale", `${mix(0.4, 7.2, pPortal)}`);
    stage.style.setProperty("--portal-blur", `${mix(10, 0, pPortal)}px`);
    stage.style.opacity = `${1 - pFade}`;
    stage.style.pointerEvents = progress > 0.96 ? "none" : "";

    cameraFrame.style.transform = [
      `translateY(${mix(0, -18, pZoom)}px)`,
      `rotateX(${mix(0, 3, pZoom)}deg)`,
      `rotateY(${mix(0, -7, pZoom)}deg)`,
      `rotateZ(${mix(0, 1, pZoom)}deg)`,
      `scale(${scale})`
    ].join(" ");

    if (cameraLayer) cameraLayer.style.opacity = `${1 - pFade}`;
    if (cameraImage) cameraImage.style.filter = `contrast(${mix(1.03, 1.08, pZoom)}) saturate(${mix(0.96, 1.02, pZoom)})`;
    if (heroCopy) {
      heroCopy.style.opacity = `${1 - smoothstep(range(progress, 0.04, 0.22))}`;
      heroCopy.style.transform = `translateY(${-70 * pIntro}px) scale(${mix(1, 0.97, pIntro)})`;
    }
    if (scrollCue) {
      scrollCue.style.opacity = `${1 - smoothstep(range(progress, 0.02, 0.12))}`;
      scrollCue.style.transform = `translateY(${24 * pIntro}px)`;
    }
    if (aperture) aperture.style.transform = `translate(-50%, -50%) rotate(${22 * pPortal}deg) scale(${mix(1, 1.08, pPortal)})`;
    if (portal) portal.style.opacity = `${pPortal}`;

    portalShots.forEach((shot, index) => {
      const shotProgress = smoothstep(range(progress, 0.34 + index * 0.035, 0.52 + index * 0.035));
      shot.style.opacity = `${shotProgress}`;
      shot.style.transform = `translateY(${mix(20, 0, shotProgress)}px) scale(${mix(1.08, 1, shotProgress)})`;
    });
  }

  let queued = false;
  function queueDraw() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      draw();
    });
  }

  window.addEventListener("scroll", queueDraw, { passive: true });
  window.addEventListener("resize", queueDraw, { passive: true });
  window.addEventListener("pageshow", queueDraw);
  draw();
  [80, 240, 600].forEach((delay) => window.setTimeout(queueDraw, delay));
}

function initReveals() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("in-view");
      });
    },
    { rootMargin: "0px 0px -14% 0px", threshold: 0.12 }
  );

  items.forEach((item) => observer.observe(item));
}

function initForm() {
  const form = document.querySelector(".booking-form");
  const status = document.querySelector(".form-status");
  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "Thank you. Your booking request is ready for the studio team.";
    form.reset();
  });
}

createParticles();
initHeroScroll();
initReveals();
initForm();
