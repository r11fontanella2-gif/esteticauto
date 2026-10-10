const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");
const menuLinks = menu ? [...menu.querySelectorAll("a")] : [];

const updateHeader = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

const closeMenu = () => {
  if (!menuButton || !menu) return;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.querySelector(".sr-only").textContent = "Abrir menu";
  menu.classList.remove("is-open");
  document.body.style.removeProperty("overflow");
};

const openMenu = () => {
  if (!menuButton || !menu) return;
  menuButton.setAttribute("aria-expanded", "true");
  menuButton.querySelector(".sr-only").textContent = "Fechar menu";
  menu.classList.add("is-open");
  document.body.style.overflow = "hidden";
};

menuButton?.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  isOpen ? closeMenu() : openMenu();
});

menuLinks.forEach((link) => link.addEventListener("click", closeMenu));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu?.classList.contains("is-open")) {
    closeMenu();
    menuButton?.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 980) closeMenu();
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

document.querySelectorAll("[data-comparison]").forEach((comparison) => {
  const input = comparison.querySelector(".comparison__range");
  if (!input) return;

  const updateComparison = () => {
    const value = Number(input.value);
    comparison.style.setProperty("--position", `${value}%`);
    input.setAttribute("aria-valuetext", `${value}% da imagem depois visível`);
  };

  input.addEventListener("input", updateComparison);
  input.addEventListener("change", updateComparison);
  updateComparison();
});

const motionSections = document.querySelectorAll("[data-motion-section]");
const parallaxMedia = document.querySelectorAll("[data-parallax]");
const visibleParallax = new Set();

if ("IntersectionObserver" in window) {
  const motionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-active", entry.isIntersecting);
      });
    },
    { rootMargin: "12% 0px", threshold: 0.05 },
  );

  motionSections.forEach((section) => motionObserver.observe(section));

  const parallaxObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleParallax.add(entry.target);
        else visibleParallax.delete(entry.target);
      });
    },
    { rootMargin: "20% 0px" },
  );

  parallaxMedia.forEach((media) => parallaxObserver.observe(media));
} else {
  motionSections.forEach((section) => section.classList.add("is-active"));
  parallaxMedia.forEach((media) => visibleParallax.add(media));
}

let parallaxFrame = null;

const renderParallax = () => {
  parallaxFrame = null;
  if (prefersReducedMotion.matches) {
    visibleParallax.forEach((media) => media.style.removeProperty("--parallax-y"));
    return;
  }

  visibleParallax.forEach((media) => {
    const rect = media.getBoundingClientRect();
    const speed = Number(media.dataset.parallax || 0.05);
    const viewportCenter = window.innerHeight / 2;
    const mediaCenter = rect.top + rect.height / 2;
    const offset = Math.max(-42, Math.min(42, (mediaCenter - viewportCenter) * speed));
    media.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
  });
};

const requestParallax = () => {
  if (parallaxFrame === null) parallaxFrame = requestAnimationFrame(renderParallax);
};

window.addEventListener("scroll", requestParallax, { passive: true });
window.addEventListener("resize", requestParallax);
prefersReducedMotion.addEventListener?.("change", requestParallax);
requestParallax();

document.querySelectorAll(".whatsapp-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href") || "";
    if (href.includes("[LINK DO WHATSAPP]")) {
      event.preventDefault();
      window.alert("Configure o [LINK DO WHATSAPP] antes de publicar a página.");
    }
  });
});

const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();
