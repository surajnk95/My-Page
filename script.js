const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function createParticles() {
  const field = document.querySelector(".particles");
  if (!field) return;

  const count = window.innerWidth < 700 ? 46 : 86;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.opacity = `${0.08 + Math.random() * 0.26}`;
    particle.style.scale = `${0.5 + Math.random() * 1.9}`;
    fragment.appendChild(particle);
  }

  field.appendChild(fragment);
}

function initScrollStory() {
  if (prefersReducedMotion) {
    document.querySelectorAll(".reveal, .portal-shot").forEach((item) => {
      item.style.opacity = "1";
      item.style.transform = "none";
    });
    document.documentElement.style.setProperty("--iris", "1");
    return;
  }

  if (!window.gsap || !window.ScrollTrigger) {
    initNativeScrollStory();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const stage = document.querySelector(".hero-stage");
  const cameraFrame = document.querySelector(".camera-frame");
  const cameraLayer = document.querySelector(".camera-layer");
  const cameraImage = document.querySelector(".camera-img");
  const heroCopy = document.querySelector(".hero-copy");
  const scrollCue = document.querySelector(".scroll-cue");
  const aperture = document.querySelector(".aperture");
  const portal = document.querySelector(".lens-portal");

  gsap.set(".portal-shot", { opacity: 0, y: 24, scale: 1.12 });
  gsap.set(cameraFrame, { transformOrigin: "51.1% 57.3%" });
  gsap.set(cameraLayer, { transformPerspective: 1400 });

  const story = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: ".hero-scroll",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.45
    }
  });

  story
    .to(cameraFrame, { scale: 1.18, rotateY: -2, rotateZ: 0.25, y: -8, duration: 0.16 }, 0)
    .to(cameraImage, { filter: "contrast(1.08) saturate(1.03)", duration: 0.16 }, 0)
    .to(heroCopy, { opacity: 0, y: -80, scale: 0.96, duration: 0.18 }, 0.04)
    .to(scrollCue, { opacity: 0, y: 28, duration: 0.08 }, 0.02)
    .to(stage, { "--iris": 0.38, duration: 0.18 }, 0.1)
    .to(cameraFrame, { scale: 1.85, rotateY: -6, rotateX: 2, rotateZ: 0.7, y: -14, duration: 0.26 }, 0.16)
    .to(stage, { "--iris": 0.82, "--portal-opacity": 0.64, "--portal-scale": 1.1, "--portal-blur": "4px", duration: 0.22 }, 0.24)
    .to(aperture, { rotate: 22, scale: 1.08, duration: 0.28 }, 0.24)
    .to(".portal-shot", { opacity: 1, y: 0, scale: 1, stagger: 0.045, duration: 0.2 }, 0.34)
    .to(cameraFrame, { scale: 3.7, rotateY: -9, rotateX: 4, rotateZ: 1.2, y: -18, duration: 0.32 }, 0.42)
    .to(stage, { "--iris": 1, "--portal-opacity": 1, "--portal-scale": 7.6, "--portal-blur": "0px", duration: 0.28 }, 0.46)
    .to(portal, { boxShadow: "0 0 0 1px rgba(241,211,145,.1), 0 0 180px rgba(202,164,93,.34)", duration: 0.22 }, 0.48)
    .to(cameraLayer, { opacity: 0, scale: 1.06, duration: 0.16 }, 0.78)
    .to(portal, { opacity: 0, duration: 0.12 }, 0.9)
    .to(stage, { opacity: 0, duration: 0.06 }, 0.94);

  gsap.to(".light-leak-a", {
    yPercent: 46,
    xPercent: 14,
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 2
    }
  });

  gsap.to(".light-leak-b", {
    yPercent: -38,
    xPercent: -16,
    scrollTrigger: {
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      scrub: 2.4
    }
  });

  gsap.utils.toArray(".reveal").forEach((item) => {
    gsap.to(item, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 84%",
        toggleActions: "play none none reverse"
      }
    });
  });

  gsap.utils.toArray(".gallery-card img, .category-card img, .bts-media img").forEach((image) => {
    gsap.fromTo(
      image,
      { yPercent: -4 },
      {
        yPercent: 5,
        ease: "none",
        scrollTrigger: {
          trigger: image,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2
        }
      }
    );
  });
}

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(value) {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
}

function range(progress, start, end) {
  return clamp((progress - start) / (end - start));
}

function mix(start, end, progress) {
  return start + (end - start) * progress;
}

function initNativeScrollStory() {
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
  const parallaxImages = [...document.querySelectorAll(".gallery-card img, .category-card img, .bts-media img")];

  let target = 0;
  let frameRequested = false;
  let lastScrollY = -1;

  function render(progress) {
    const p1 = smoothstep(range(progress, 0, 0.2));
    const p2 = smoothstep(range(progress, 0.16, 0.46));
    const p3 = smoothstep(range(progress, 0.42, 0.78));
    const p4 = smoothstep(range(progress, 0.72, 0.94));
    const portalIntro = smoothstep(range(progress, 0.24, 0.48));
    const portalFill = smoothstep(range(progress, 0.46, 0.78));
    const fadeOut = smoothstep(range(progress, 0.78, 0.93));

    const scale = mix(1, 1.18, p1) + mix(0, 0.67, p2) + mix(0, 1.85, p3);
    const rotateY = mix(0, -2, p1) + mix(0, -4, p2) + mix(0, -3, p3);
    const rotateX = mix(0, 2, p2) + mix(0, 2, p3);
    const rotateZ = mix(0, 0.25, p1) + mix(0, 0.45, p2) + mix(0, 0.5, p3);
    const y = mix(0, -8, p1) + mix(0, -6, p2) + mix(0, -4, p3);

    cameraFrame.style.transform = `translateY(${y}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`;
    cameraImage.style.filter = `contrast(${mix(1.04, 1.08, p2)}) saturate(${mix(0.98, 1.03, p2)})`;
    heroCopy.style.opacity = `${1 - smoothstep(range(progress, 0.04, 0.22))}`;
    heroCopy.style.transform = `translateY(${-80 * p1}px) scale(${mix(1, 0.96, p1)})`;
    scrollCue.style.opacity = `${1 - smoothstep(range(progress, 0.02, 0.12))}`;
    scrollCue.style.transform = `translateY(${28 * p1}px)`;

    stage.style.setProperty("--iris", `${mix(0, 0.38, p1) + mix(0, 0.44, p2) + mix(0, 0.18, p3)}`);
    const portalAmount = Math.max(portalIntro * 0.64, portalFill);
    stage.style.setProperty("--portal-opacity", `${portalAmount}`);
    stage.style.setProperty("--portal-scale", `${mix(0.4, 1.1, portalIntro) + mix(0, 6.5, portalFill)}`);
    stage.style.setProperty("--portal-blur", `${mix(10, 0, portalFill)}px`);

    aperture.style.transform = `translate(-50%, -50%) rotate(${22 * p2}deg) scale(${mix(1, 1.08, p2)})`;
    cameraLayer.style.opacity = `${1 - fadeOut}`;
    cameraLayer.style.transform = `scale(${mix(1, 1.06, p4)})`;
    portal.style.opacity = `${portalAmount}`;
    stage.style.opacity = `${1 - smoothstep(range(progress, 0.94, 1))}`;
    stage.style.pointerEvents = progress > 0.98 ? "none" : "";

    portalShots.forEach((shot, index) => {
      const shotProgress = smoothstep(range(progress, 0.34 + index * 0.035, 0.52 + index * 0.035));
      shot.style.opacity = `${shotProgress}`;
      shot.style.transform = `translateY(${mix(24, 0, shotProgress)}px) scale(${mix(1.12, 1, shotProgress)})`;
    });

    parallaxImages.forEach((image) => {
      const rect = image.getBoundingClientRect();
      const local = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
      image.style.transform = `translateY(${mix(-4, 5, local)}%)`;
    });
  }

  function updateTarget() {
    const rect = hero.getBoundingClientRect();
    const distance = hero.offsetHeight - window.innerHeight;
    target = distance > 0 ? clamp(-rect.top / distance) : 0;
  }

  function renderFromScroll() {
    updateTarget();
    render(target);
  }

  function requestRender() {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(() => {
      frameRequested = false;
      renderFromScroll();
    });
  }

  function renderBurst() {
    [0, 80, 180, 360, 700].forEach((delay) => {
      window.setTimeout(requestRender, delay);
    });
  }

  function start() {
    renderFromScroll();
    renderBurst();
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("in-view", entry.isIntersecting);
      });
    },
    { rootMargin: "0px 0px -16% 0px", threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", requestRender, { passive: true });
  window.addEventListener("pageshow", renderBurst);
  window.addEventListener("load", renderBurst);
  window.setInterval(() => {
    const nextScrollY = Math.round(window.scrollY);
    if (nextScrollY !== lastScrollY) {
      lastScrollY = nextScrollY;
      renderFromScroll();
    }
  }, 120);
  start();
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

function initHeroSafetyRenderer() {
  if (prefersReducedMotion) return;

  const hero = document.querySelector(".hero-scroll");
  const stage = document.querySelector(".hero-stage");
  const cameraFrame = document.querySelector(".camera-frame");
  const cameraLayer = document.querySelector(".camera-layer");
  const cameraImage = document.querySelector(".camera-img");
  const heroCopy = document.querySelector(".hero-copy");
  const scrollCue = document.querySelector(".scroll-cue");
  const aperture = document.querySelector(".aperture");
  const portal = document.querySelector(".lens-portal");
  const shots = [...document.querySelectorAll(".portal-shot")];

  if (!hero || !stage || !cameraFrame) return;

  function draw() {
    const rect = hero.getBoundingClientRect();
    const distance = Math.max(1, hero.offsetHeight - window.innerHeight);
    const progress = clamp(-rect.top / distance);
    const p1 = smoothstep(range(progress, 0, 0.2));
    const p2 = smoothstep(range(progress, 0.16, 0.46));
    const p3 = smoothstep(range(progress, 0.42, 0.78));
    const fadeOut = smoothstep(range(progress, 0.72, 0.94));
    const portalIntro = smoothstep(range(progress, 0.24, 0.48));
    const portalFill = smoothstep(range(progress, 0.46, 0.78));
    const portalAmount = Math.max(portalIntro * 0.64, portalFill);
    const scale = mix(1, 1.18, p1) + mix(0, 0.67, p2) + mix(0, 1.85, p3);

    stage.style.setProperty("--iris", `${mix(0, 0.38, p1) + mix(0, 0.44, p2) + mix(0, 0.18, p3)}`);
    stage.style.setProperty("--portal-opacity", `${portalAmount}`);
    stage.style.setProperty("--portal-scale", `${mix(0.4, 1.1, portalIntro) + mix(0, 6.5, portalFill)}`);
    stage.style.setProperty("--portal-blur", `${mix(10, 0, portalFill)}px`);
    stage.style.opacity = `${1 - smoothstep(range(progress, 0.94, 1))}`;

    cameraFrame.style.transform = `translateY(${mix(0, -18, p3)}px) rotateX(${mix(0, 4, p3)}deg) rotateY(${mix(0, -9, p3)}deg) rotateZ(${mix(0, 1.2, p3)}deg) scale(${scale})`;
    if (cameraImage) cameraImage.style.filter = `contrast(${mix(1.03, 1.08, p2)}) saturate(${mix(0.96, 1.03, p2)})`;
    if (cameraLayer) cameraLayer.style.opacity = `${1 - fadeOut}`;
    if (heroCopy) {
      heroCopy.style.opacity = `${1 - smoothstep(range(progress, 0.04, 0.22))}`;
      heroCopy.style.transform = `translateY(${-80 * p1}px) scale(${mix(1, 0.96, p1)})`;
    }
    if (scrollCue) {
      scrollCue.style.opacity = `${1 - smoothstep(range(progress, 0.02, 0.12))}`;
      scrollCue.style.transform = `translateY(${28 * p1}px)`;
    }
    if (aperture) aperture.style.transform = `translate(-50%, -50%) rotate(${22 * p2}deg) scale(${mix(1, 1.08, p2)})`;
    if (portal) portal.style.opacity = `${portalAmount}`;

    shots.forEach((shot, index) => {
      const shotProgress = smoothstep(range(progress, 0.34 + index * 0.035, 0.52 + index * 0.035));
      shot.style.opacity = `${shotProgress}`;
      shot.style.transform = `translateY(${mix(24, 0, shotProgress)}px) scale(${mix(1.12, 1, shotProgress)})`;
    });
  }

  let lastY = -1;
  function queueDraw() {
    lastY = Math.round(window.scrollY);
    draw();
  }

  window.addEventListener("scroll", queueDraw, { passive: true });
  window.addEventListener("resize", queueDraw, { passive: true });
  window.setInterval(() => {
    const nextY = Math.round(window.scrollY);
    if (nextY !== lastY) queueDraw();
  }, 160);
  draw();
}

createParticles();
initScrollStory();
initForm();
initHeroSafetyRenderer();
