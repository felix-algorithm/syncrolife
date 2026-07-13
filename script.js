const root = document.documentElement;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const syncDemo = document.querySelector("[data-sync-demo]");
const emailForm = document.querySelector("[data-email-form]");
const formMessage = document.querySelector("[data-form-message]");
const scrollProgress = document.querySelector("[data-scroll-progress]");
const cursorSpotlight = document.querySelector("[data-cursor-spotlight]");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const pointerFineQuery = window.matchMedia("(pointer: fine)");
const apkDownloadUrl = "https://github.com/felix-algorithm/syncrolife.com/releases/download/v1.0.0/app-release.apk";

const savedTheme = localStorage.getItem("syncro-theme");
if (savedTheme) {
  root.dataset.theme = savedTheme;
}

function setHeaderState() {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

function setScrollProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  scrollProgress.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
}

setScrollProgress();
window.addEventListener("scroll", setScrollProgress, { passive: true });
window.addEventListener("resize", setScrollProgress);

menuToggle?.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mobileNav?.addEventListener("click", (event) => {
  if (event.target.matches("a, button")) {
    mobileNav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }
});

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = nextTheme;
  localStorage.setItem("syncro-theme", nextTheme);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.8 }
);

document.querySelectorAll("[data-count-to]").forEach((element) => {
  countObserver.observe(element);
});

function animateCount(element) {
  const target = Number(element.dataset.countTo || 0);
  const prefix = element.dataset.countPrefix || "";
  const suffix = element.dataset.countSuffix || "";
  const duration = Number(element.dataset.countDuration || 1000);

  if (motionQuery.matches) {
    element.textContent = `${prefix}${target}${suffix}`;
    return;
  }

  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }
  requestAnimationFrame(tick);
}

const depthElements = [...document.querySelectorAll("[data-depth]")].map((element) => ({
  element,
  depth: Number(element.dataset.depth || 0)
}));

let pointerFrame = 0;
let lastPointerX = 0;
let lastPointerY = 0;

function updatePointerEffects() {
  pointerFrame = 0;
  cursorSpotlight.classList.add("is-visible");
  cursorSpotlight.style.transform = `translate3d(${lastPointerX - 220}px, ${lastPointerY - 220}px, 0)`;

  const normalizedX = lastPointerX / window.innerWidth - 0.5;
  const normalizedY = lastPointerY / window.innerHeight - 0.5;
  depthElements.forEach(({ element, depth }) => {
    const x = normalizedX * depth * 16;
    const y = normalizedY * depth * 16;
    element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
}

if (!motionQuery.matches && pointerFineQuery.matches) {
  window.addEventListener("pointermove", (event) => {
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    if (!pointerFrame) {
      pointerFrame = requestAnimationFrame(updatePointerEffects);
    }
  }, { passive: true });

  window.addEventListener("pointerleave", () => {
    cursorSpotlight.classList.remove("is-visible");
  });
}

document.querySelectorAll("[data-tilt-card]").forEach((card) => {
  let tiltFrame = 0;
  let pendingEvent;

  function updateTilt() {
    tiltFrame = 0;
    const rect = card.getBoundingClientRect();
    const x = pendingEvent.clientX - rect.left;
    const y = pendingEvent.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 6;
    const rotateX = (0.5 - y / rect.height) * 6;
    card.style.setProperty("--spotlight-x", `${x}px`);
    card.style.setProperty("--spotlight-y", `${y}px`);
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
  }

  card.addEventListener("pointermove", (event) => {
    if (motionQuery.matches || !pointerFineQuery.matches) return;
    pendingEvent = event;
    if (!tiltFrame) {
      tiltFrame = requestAnimationFrame(updateTilt);
    }
  });

  card.addEventListener("pointerleave", () => {
    if (tiltFrame) {
      cancelAnimationFrame(tiltFrame);
      tiltFrame = 0;
    }
    card.style.transform = "";
  });
});

function startFileDownload() {
  window.location.href = apkDownloadUrl;
}

document.querySelectorAll("[data-download-trigger]").forEach((button) => {
  button.addEventListener("click", startFileDownload);
});

syncDemo?.addEventListener("click", () => {
  syncDemo.classList.add("is-syncing");
  syncDemo.disabled = true;
  window.setTimeout(() => {
    syncDemo.classList.remove("is-syncing");
    syncDemo.disabled = false;
  }, 1200);
});

emailForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(emailForm);
  const email = formData.get("email")?.toString().trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
  const submitButton = emailForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton?.textContent || "";

  formMessage.classList.toggle("error", !isValid);
  if (!isValid) {
    formMessage.textContent = "Vui lòng nhập email hợp lệ để nhận bản beta.";
    emailForm.querySelector("input")?.focus();
    return;
  }

  formMessage.classList.remove("error");
  formMessage.textContent = "Đang gửi đăng ký...";
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Đang gửi...";
  }

  const actionUrl = emailForm.action.replace("https://formsubmit.co/", "https://formsubmit.co/ajax/");

  fetch(actionUrl, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json"
    }
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Registration request failed");
      }
      formMessage.textContent = "Đã gửi đăng ký. Bạn sẽ nhận thông báo beta sớm nhất.";
      emailForm.reset();
    })
    .catch(() => {
      formMessage.classList.add("error");
      formMessage.textContent = "Chưa gửi được đăng ký. Vui lòng thử lại sau ít phút.";
    })
    .finally(() => {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
});
