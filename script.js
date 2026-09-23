const USERNAME = "rizkyramadhani10";
const WHATSAPP_NUMBER = "6289602160689";

// Intro screen duration in milliseconds.
// Keep the entrance brief enough to feel immediate, with time for the exit to read.
const LOADER_DURATION = 350;

const projectsEl = document.getElementById("projects");
const repoCountEl = document.getElementById("repoCount");
const yearEl = document.getElementById("year");
const menuToggle = document.getElementById("menuToggle");
const header = document.querySelector(".header");
const scrollProgress = document.querySelector(".scroll-progress");
const backToTop = document.getElementById("backToTop");
const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".nav a")];

document.body.classList.add("is-loading");
yearEl.textContent = new Date().getFullYear();

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Add your own project images here.
// Example: "home-service": "assets/projects/home-service.png"
const PROJECT_IMAGES = {
    "home-service": "assets/projects/homeservice.png",
    "airquality": "assets/projects/aqi.png",
    "absorbed-the-lost-lab": "assets/projects/absorbedthelostlab.png",
    "orion-bot": "assets/projects/orion.png",
    "waktu-adzan": "assets/projects/waktu_adzan.png",
};

const PROJECT_ORDER = [
    "home-service",
    "airquality",
    "waktu-adzan",
    "orion-bot",
    "absorbed-the-lost-lab",
];

function getProjectImage(repo) {
  const key = String(repo.name || "").toLowerCase().replaceAll("_", "-").replaceAll(" ", "-");

  return PROJECT_IMAGES[key] || "";
}

function getProjectImageMarkup(repo, number) {
  const image = getProjectImage(repo);

  if (image) {
    return `
      <img
        src="${escapeHTML(image)}"
        alt="${escapeHTML(repo.name.replaceAll("-", " "))} project preview"
        loading="lazy"
        onerror="this.style.display='none'; this.nextElementSibling?.classList.add('is-visible')"
      >
    `;
  }

  return `
    <div class="project-placeholder" aria-label="Placeholder for project image">
      <span class="placeholder-number">${number}</span>
      <div class="placeholder-copy">
        <strong>PROJECT<br>IMAGE</strong>
        <span>Add your screenshot later</span>
      </div>
    </div>
  `;
}

function projectMarkup(repo, index) {
  const number = String(index + 1).padStart(2, "0");
  const title = repo.name.replaceAll("-", " ");
  const description =
    repo.description || "Personal project and development experiment.";
  const language = repo.language || "Various";
  const topics = (repo.topics || []).slice(0, 7);

  return `
    <article class="project reveal">
      <a
        class="project-image"
        href="${escapeHTML(repo.html_url)}"
        target="_blank"
        rel="noreferrer"
        aria-label="Open ${escapeHTML(title)} on GitHub"
      >
        ${getProjectImageMarkup(repo, number)}
        <span class="project-overlay"><span>↗</span></span>
      </a>

      <div class="project-info">
        <span class="project-number">${number} / SELECTED PROJECT</span>

        <div>
          <h3>${escapeHTML(title)}</h3>
          <p class="project-description">${escapeHTML(description)}</p>
        </div>

        <span class="project-tech">
          ${escapeHTML(language)}
          ${topics.length ? "<br>" + topics.map(escapeHTML).join(" · ") : ""}
        </span>
      </div>
    </article>
  `;
}

async function loadProjects() {
  try {
    const response = await fetch(
      `https://api.github.com/users/${USERNAME}/repos?sort=updated&direction=desc&per_page=100`
    );

    if (!response.ok) throw new Error("GitHub request failed.");

    const repos = await response.json();
    repoCountEl.textContent = `${repos.length} repositories`;

    // Keep only non-forks and non-archived repositories.
    // Show up to 6 most recently updated projects.
    const projects = repos
      .filter((repo) => !repo.fork && !repo.archived)
      .sort((a, b) => {
        const keyA = String(a.name || "").toLowerCase().replaceAll("_", "-").replaceAll(" ", "-");
        const keyB = String(b.name || "").toLowerCase().replaceAll("_", "-").replaceAll(" ", "-");
        const indexA = PROJECT_ORDER.indexOf(keyA);
        const indexB = PROJECT_ORDER.indexOf(keyB);
        
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return new Date(b.updated_at) - new Date(a.updated_at);
      })
      .slice(0, 5);

    if (!projects.length) throw new Error("No projects found.");

    projectsEl.innerHTML = projects.map(projectMarkup).join("");

    // Observe the newly-created project cards.
    observeRevealElements();
  } catch (error) {
    console.error(error);

    repoCountEl.textContent = "GitHub profile";

    projectsEl.innerHTML = `
      <div class="loading">
        Couldn't load the projects automatically.
        <a class="all-work" href="https://github.com/${USERNAME}?tab=repositories" target="_blank" rel="noreferrer">
          Open GitHub ↗
        </a>
      </div>
    `;
  }
}

/* -------------------------
   Page entrance
------------------------- */
window.addEventListener("load", () => {
  window.setTimeout(() => {
    requestAnimationFrame(() => {
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-ready");
    });
  }, LOADER_DURATION);
});

/* -------------------------
   Scroll state
------------------------- */
function updateScrollUI() {
  const scrollTop = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;

  header.classList.toggle("scrolled", scrollTop > 30);
  scrollProgress.style.setProperty("--scroll-progress", progress / 100);
}

/* -------------------------
   Reveal-on-scroll
------------------------- */
let revealObserver;

function observeRevealElements() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      }
    );
  }

  document.querySelectorAll(".reveal:not(.is-visible)").forEach((element) => {
    revealObserver.observe(element);
  });
}

observeRevealElements();

/* -------------------------
   Active nav section
------------------------- */
function setActiveNav(sectionId = "") {
  navLinks.forEach((link) => {
    link.classList.toggle(
      "is-active",
      Boolean(sectionId) && link.getAttribute("href") === `#${sectionId}`
    );
  });
}

function updateActiveNav() {
  // Use a fixed point in the viewport instead of intersection ratios.
  // This prevents a previous section from staying active while another
  // section is already the destination of a navbar click.
  const marker = Math.min(window.innerHeight * 0.34, 360);
  let activeSection = null;

  for (const section of sections) {
    const rect = section.getBoundingClientRect();

    if (rect.top <= marker && rect.bottom > marker) {
      activeSection = section;
      break;
    }
  }

  if (!activeSection) {
    // Before the first section marker, clear the nav state.
    // After the last section, keep the last visible section active.
    const firstRect = sections[0]?.getBoundingClientRect();
    if (firstRect && firstRect.top > marker) {
      setActiveNav("");
      return;
    }

    activeSection = sections[sections.length - 1] || null;
  }

  setActiveNav(activeSection?.id || "");
}

function updateBackToTop() {
  backToTop.classList.toggle("is-visible", window.scrollY > 520);
}

let scrollFrame = null;

function queueScrollUpdate() {
  if (scrollFrame) return;

  scrollFrame = window.requestAnimationFrame(() => {
    updateScrollUI();
    updateActiveNav();
    updateBackToTop();
    scrollFrame = null;
  });
}

window.addEventListener("scroll", queueScrollUpdate, { passive: true });

window.addEventListener("resize", queueScrollUpdate, { passive: true });
queueScrollUpdate();

/* -------------------------
   Mobile menu
------------------------- */
menuToggle.addEventListener("click", () => {
  const open = header.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => {
    const targetId = link.getAttribute("href")?.replace("#", "");

    // Update the underline immediately. The scroll handler will keep it
    // correct while the smooth-scroll animation is travelling to the target.
    setActiveNav(targetId || "");

    header.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

/* -------------------------
   Gentle hero parallax
------------------------- */
const hero = document.querySelector(".hero");
const heroPhoto = document.querySelector(".hero-photo");

if (
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  let parallaxFrame = null;
  let pointerX = 0;
  let pointerY = 0;

  window.addEventListener(
    "pointermove",
    (event) => {
      if (parallaxFrame) return;

      pointerX = event.clientX;
      pointerY = event.clientY;

      parallaxFrame = window.requestAnimationFrame(() => {
        const x = (pointerX / window.innerWidth - 0.5) * 12;
        const y = (pointerY / window.innerHeight - 0.5) * 8;

        hero.style.setProperty("--hero-shift-x", `${x * 2}px`);
        hero.style.setProperty("--hero-shift-y", `${y * 2}px`);

        if (heroPhoto) {
          heroPhoto.style.transform =
            `translate3d(${x * 0.45}px, ${y * 0.45}px, 0)`;
        }

        parallaxFrame = null;
      });
    },
    { passive: true }
  );

  window.addEventListener(
    "mouseleave",
    () => {
      hero.style.setProperty("--hero-shift-x", "0px");
      hero.style.setProperty("--hero-shift-y", "0px");

      if (heroPhoto) {
        heroPhoto.style.transform = "translate3d(0, 0, 0)";
      }
    },
    { passive: true }
  );
}

/* -------------------------
   Gentle image tilt
------------------------- */
if (
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  const tiltTargets = document.querySelectorAll(".project-image, .journal-image, .about-photo");

  tiltTargets.forEach((element) => {
    let tiltFrame = null;
    let tiltX = 0;
    let tiltY = 0;

    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      tiltX = (event.clientX - rect.left) / rect.width - 0.5;
      tiltY = (event.clientY - rect.top) / rect.height - 0.5;

      if (tiltFrame) return;

      tiltFrame = window.requestAnimationFrame(() => {
        element.style.setProperty("--tilt-x", `${(tiltX * 2.2).toFixed(2)}deg`);
        element.style.setProperty("--tilt-y", `${(-tiltY * 2.2).toFixed(2)}deg`);
        tiltFrame = null;
      });
    });

    element.addEventListener("pointerleave", () => {
      element.style.setProperty("--tilt-x", "0deg");
      element.style.setProperty("--tilt-y", "0deg");
    });
  });
}

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* -------------------------
   Magnetic micro-interaction
------------------------- */
if (
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  document.querySelectorAll(".magnetic").forEach((element) => {
    let magneticFrame = null;
    let offsetX = 0;
    let offsetY = 0;

    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      offsetX = event.clientX - rect.left - rect.width / 2;
      offsetY = event.clientY - rect.top - rect.height / 2;

      if (magneticFrame) return;

      magneticFrame = window.requestAnimationFrame(() => {
        element.style.transform =
          `translate3d(${offsetX * 0.08}px, ${offsetY * 0.08}px, 0)`;
        magneticFrame = null;
      });
    });

    element.addEventListener("pointerleave", () => {
      element.style.transform = "";
    });
  });
}

/* -------------------------
   WhatsApp link
------------------------- */
const whatsappLink = document.getElementById("whatsappLink");

whatsappLink.href =
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Halo Rizky, saya ingin berdiskusi tentang sebuah project."
  )}`;

/* -------------------------
   Start content loading
------------------------- */
function initJournalImages() {
  document.querySelectorAll(".journal-image").forEach((frame) => {
    const image = frame.querySelector("img");
    const placeholder = frame.querySelector(".journal-placeholder");

    if (!image || !placeholder) return;

    const showPlaceholder = () => {
      image.classList.add("is-hidden");
      placeholder.classList.add("is-visible");
    };

    image.addEventListener("error", showPlaceholder, { once: true });

    if (image.complete && image.naturalWidth === 0) {
      showPlaceholder();
    }
  });
}

loadProjects();
initJournalImages();
