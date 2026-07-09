const root = document.documentElement;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const downloadModal = document.querySelector("[data-download-modal]");
const modalClose = document.querySelector("[data-modal-close]");
const loadingState = document.querySelector("[data-loading-state]");
const successState = document.querySelector("[data-success-state]");
const progressBar = document.querySelector("[data-progress-bar]");
const progressValue = document.querySelector("[data-progress-value]");
const downloadDescription = document.querySelector("[data-download-description]");
const syncDemo = document.querySelector("[data-sync-demo]");
const emailForm = document.querySelector("[data-email-form]");
const formMessage = document.querySelector("[data-form-message]");
const scrollProgress = document.querySelector("[data-scroll-progress]");
const cursorSpotlight = document.querySelector("[data-cursor-spotlight]");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const apkDownloadUrl = "https://drive.google.com/uc?export=download&id=1HWgKReoYHv40dddjOjeKRHyapXRec2ge";
let activeDownloadTimer;

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

if (!motionQuery.matches && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (event) => {
    cursorSpotlight.classList.add("is-visible");
    cursorSpotlight.style.transform = `translate3d(${event.clientX - 220}px, ${event.clientY - 220}px, 0)`;
    document.querySelectorAll("[data-depth]").forEach((element) => {
      const depth = Number(element.dataset.depth || 0);
      const x = (event.clientX / window.innerWidth - 0.5) * depth * 18;
      const y = (event.clientY / window.innerHeight - 0.5) * depth * 18;
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }, { passive: true });

  window.addEventListener("pointerleave", () => {
    cursorSpotlight.classList.remove("is-visible");
  });
}

document.querySelectorAll("[data-tilt-card]").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (motionQuery.matches || !window.matchMedia("(pointer: fine)").matches) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 8;
    const rotateX = ((0.5 - y / rect.height)) * 8;
    card.style.setProperty("--spotlight-x", `${x}px`);
    card.style.setProperty("--spotlight-y", `${y}px`);
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

function openDownloadModal() {
  document.body.classList.add("modal-open");
  downloadModal.classList.add("is-open");
  downloadModal.setAttribute("aria-hidden", "false");
  loadingState.hidden = false;
  successState.hidden = true;
  progressBar.style.width = "0%";
  progressValue.textContent = "0%";
  downloadDescription.textContent = "AI dang phan tich goi cai dat Syncro Life Beta.";
  modalClose.focus();
  runDownloadDemo();
}

function closeDownloadModal() {
  document.body.classList.remove("modal-open");
  downloadModal.classList.remove("is-open");
  downloadModal.setAttribute("aria-hidden", "true");
}

function startFileDownload() {
  let downloadFrame = document.querySelector("[data-download-frame]");
  if (!downloadFrame) {
    downloadFrame = document.createElement("iframe");
    downloadFrame.hidden = true;
    downloadFrame.setAttribute("aria-hidden", "true");
    downloadFrame.dataset.downloadFrame = "true";
    document.body.appendChild(downloadFrame);
  }
  downloadFrame.src = apkDownloadUrl;

  const retryDownload = document.querySelector("[data-retry-download]");
  if (retryDownload) {
    retryDownload.href = apkDownloadUrl;
  }
}

function runDownloadDemo() {
  window.clearInterval(activeDownloadTimer);
  let progress = 0;
  const messages = [
    "Kiem tra chu ky goi cai dat...",
    "Quet bao mat 0/100 CVE...",
    "Ket noi cong tai beta...",
    "Chuan bi file APK..."
  ];

  activeDownloadTimer = window.setInterval(() => {
    progress = Math.min(progress + Math.floor(Math.random() * 9) + 7, 100);
    progressBar.style.width = `${progress}%`;
    progressValue.textContent = `${progress}%`;
    downloadDescription.textContent = messages[Math.min(Math.floor(progress / 28), messages.length - 1)];

    if (progress >= 100) {
      window.clearInterval(activeDownloadTimer);
      window.setTimeout(() => {
        startFileDownload();
        loadingState.hidden = true;
        successState.hidden = false;
      }, 300);
    }
  }, 180);
}

document.querySelectorAll("[data-download-trigger]").forEach((button) => {
  button.addEventListener("click", openDownloadModal);
});

modalClose?.addEventListener("click", closeDownloadModal);

downloadModal?.addEventListener("click", (event) => {
  if (event.target === downloadModal) {
    closeDownloadModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && downloadModal.classList.contains("is-open")) {
    closeDownloadModal();
  }
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
  const email = new FormData(emailForm).get("email")?.toString().trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

  formMessage.classList.toggle("error", !isValid);
  if (!isValid) {
    formMessage.textContent = "Vui long nhap email hop le de nhan ban beta.";
    emailForm.querySelector("input")?.focus();
    return;
  }

  formMessage.textContent = "Da ghi nhan email. Ban se nhan thong bao beta som nhat.";
  emailForm.reset();
});
