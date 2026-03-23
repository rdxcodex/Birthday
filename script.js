const manifestUrl = "images/manifest.json";
const slideshowTrack = document.getElementById("slideshow-track");
const slideDots = document.getElementById("slide-dots");
const sparkleBurst = document.getElementById("sparkle-burst");
const memoryBoard = document.getElementById("memory-board");
const heartsLayer = document.getElementById("hearts-layer");
const musicToggle = document.getElementById("music-toggle");
const musicLabel = document.getElementById("music-label");
const birthdayMusic = document.getElementById("birthday-music");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxBackdrop = document.getElementById("lightbox-backdrop");
const prevSlideButton = document.getElementById("prev-slide");
const nextSlideButton = document.getElementById("next-slide");
const revealItems = document.querySelectorAll(".reveal");

let slides = [];
let slideIndex = 0;
let slideTimer = null;
let musicEnabled = true;

const boardPositions = [
  { top: 2, left: 4, rotate: -7 },
  { top: 4, left: 33, rotate: 6 },
  { top: 7, left: 66, rotate: -5 },
  { top: 35, left: 10, rotate: 5 },
  { top: 37, left: 43, rotate: -8 },
  { top: 41, left: 72, rotate: 7 },
  { top: 69, left: 20, rotate: -4 },
  { top: 68, left: 56, rotate: 6 }
];

const memoryThemes = [
  {
    title: "Sparkler Princess",
    subtitle: "A glowing festive moment",
    note: "Soft light, closed eyes, and a whole sky of wishes."
  },
  {
    title: "Sisters Together",
    subtitle: "One warm candid frame",
    note: "A cozy little memory full of comfort and togetherness."
  },
  {
    title: "Goofy Rooftop Mood",
    subtitle: "Khushu Didi being adorable",
    note: "That playful side deserves a special place too."
  },
  {
    title: "Sacred Glow",
    subtitle: "A calm and graceful ritual moment",
    note: "Quiet strength, kindness, and grace all in one frame."
  },
  {
    title: "Rangoli Artist",
    subtitle: "Coloring beauty by hand",
    note: "Bright colors and brighter memories."
  },
  {
    title: "Festival Family Scene",
    subtitle: "Joy shared with everyone",
    note: "A beautiful memory of togetherness and celebration."
  },
  {
    title: "Cake And Smile",
    subtitle: "A sweet celebration moment",
    note: "The kind of smile that makes a room softer."
  },
  {
    title: "Birthday Glow-Up",
    subtitle: "Another lovely cake memory",
    note: "Sweet, simple, and impossible not to smile at."
  },
  {
    title: "Khushboo And Cake",
    subtitle: "Pure birthday warmth",
    note: "A precious photo for a precious Didi."
  },
  {
    title: "Tiny Childhood Steps",
    subtitle: "An old little gem",
    note: "One of those memories that instantly melts the heart."
  },
  {
    title: "Little School Star",
    subtitle: "A childhood birthday frame",
    note: "Small Khushu Didi, already unforgettable."
  },
  {
    title: "Childhood Bonds",
    subtitle: "Growing up with family",
    note: "Those early memories always feel extra magical."
  }
];

document.addEventListener("DOMContentLoaded", async () => {
  setupRevealObserver();
  startHearts();
  startConfetti();
  setupMusic();
  setupLightbox();
  setupSlideButtons();
  const images = await loadImages();
  renderSlides(images);
  renderGallery(images);
});

async function loadImages() {
  try {
    const response = await fetch(manifestUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Manifest request failed");
    }

    const data = await response.json();
    const files = Array.isArray(data.images) ? data.images : [];

    return files.map((src, index) => {
      const theme = memoryThemes[index] || fallbackTheme(src, index);
      return {
        src,
        alt: `Khushu Didi memory ${index + 1}`,
        title: theme.title,
        subtitle: theme.subtitle,
        note: theme.note
      };
    });
  } catch (error) {
    return [];
  }
}

function fallbackTheme(path, index) {
  const fileName = path.split("/").pop() || `Photo ${index + 1}`;
  const title = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();
  return {
    title: title ? toTitleCase(title) : `Photo ${index + 1}`,
    subtitle: "A lovely memory",
    note: "One more beautiful moment with Khushu Didi."
  };
}

function toTitleCase(value) {
  return value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

function renderSlides(images) {
  if (!images.length) {
    return;
  }

  slideshowTrack.innerHTML = "";
  slideDots.innerHTML = "";

  slides = images.map((image, index) => {
    const slide = document.createElement("article");
    slide.className = `slide${index === 0 ? " is-active" : ""}`;
    slide.innerHTML = `
      <div class="slide-image">
        <img src="${image.src}" alt="${image.alt}" loading="${index === 0 ? "eager" : "lazy"}">
      </div>
      <div class="slide-caption">
        <strong>${image.title}</strong>
        <span>${image.subtitle}</span>
      </div>
    `;
    slideshowTrack.appendChild(slide);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = `slide-dot${index === 0 ? " is-active" : ""}`;
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    dot.addEventListener("click", () => showSlide(index));
    slideDots.appendChild(dot);

    return slide;
  });

  slideIndex = 0;
  resetSlideTimer();
}

function renderGallery(images) {
  if (!images.length) {
    return;
  }

  memoryBoard.innerHTML = "";

  images.forEach((image, index) => {
    const card = document.createElement("article");
    const position = boardPositions[index % boardPositions.length];
    const offset = Math.floor(index / boardPositions.length) * 28;
    const top = Math.min(position.top + offset, 78);
    const left = position.left + (index % 2 === 0 ? 0 : 2);
    const rotation = position.rotate + ((index % 3) - 1) * 1.5;

    card.className = "memory-card";
    card.tabIndex = 0;
    card.style.top = `${top}%`;
    card.style.left = `${left}%`;
    card.style.transform = `rotate(${rotation}deg)`;
    card.innerHTML = `
      <div class="memory-photo">
        <img src="${image.src}" alt="${image.alt}" loading="lazy">
      </div>
      <div class="memory-note">
        <strong>${image.title}</strong>
        <p>${image.note}</p>
      </div>
      <span class="sticker sticker-star"></span>
      <span class="sticker sticker-heart"></span>
    `;

    const open = () => openLightbox(image);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });

    memoryBoard.appendChild(card);
  });
}

function showSlide(index) {
  if (!slides.length || index === slideIndex) {
    return;
  }

  const currentSlide = slides[slideIndex];
  const nextSlide = slides[index];
  const dots = slideDots.querySelectorAll(".slide-dot");

  currentSlide.classList.remove("is-active");
  currentSlide.classList.add("is-leaving");
  dots[slideIndex]?.classList.remove("is-active");

  nextSlide.classList.add("is-active");
  dots[index]?.classList.add("is-active");

  sparkleBurst.classList.remove("is-bursting");
  void sparkleBurst.offsetWidth;
  sparkleBurst.classList.add("is-bursting");

  window.setTimeout(() => {
    currentSlide.classList.remove("is-leaving");
  }, 820);

  slideIndex = index;
  resetSlideTimer();
}

function setupSlideButtons() {
  prevSlideButton.addEventListener("click", () => {
    if (!slides.length) {
      return;
    }
    showSlide((slideIndex - 1 + slides.length) % slides.length);
  });

  nextSlideButton.addEventListener("click", () => {
    if (!slides.length) {
      return;
    }
    showSlide((slideIndex + 1) % slides.length);
  });
}

function resetSlideTimer() {
  window.clearInterval(slideTimer);
  if (slides.length <= 1) {
    return;
  }
  slideTimer = window.setInterval(() => {
    showSlide((slideIndex + 1) % slides.length);
  }, 4200);
}

function setupRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function startHearts() {
  createHeart();
  window.setInterval(createHeart, 1200);
}

function createHeart() {
  const heart = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const size = 22 + Math.random() * 28;
  const left = Math.random() * 100;
  const duration = 13 + Math.random() * 10;
  const drift = -50 + Math.random() * 100;
  const gradientId = `heart-gradient-${Date.now()}-${Math.floor(Math.random() * 99999)}`;
  const startColor = Math.random() > 0.5 ? "rgba(255, 185, 220, 0.92)" : "rgba(217, 196, 255, 0.9)";
  const endColor = "rgba(255,255,255,0.96)";

  heart.setAttribute("viewBox", "0 0 64 58");
  heart.setAttribute("class", "heart");
  heart.style.left = `${left}%`;
  heart.style.setProperty("--size", `${size}px`);
  heart.style.setProperty("--duration", `${duration}s`);
  heart.style.setProperty("--drift", `${drift}px`);
  heart.innerHTML = `
    <defs>
      <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${startColor}" />
        <stop offset="100%" stop-color="${endColor}" />
      </linearGradient>
    </defs>
    <path
      d="M32 56C31 56 30 55.6 29.2 54.8L8.6 35.2C3 29.8 0 24.6 0 18.5C0 8.2 8.2 0 18.2 0C24.1 0 29.7 2.8 32.9 7.3C36.2 2.8 41.7 0 47.7 0C57.7 0 65.9 8.2 65.9 18.5C65.9 24.6 62.8 29.8 57.3 35.2L35 54.8C34.1 55.6 33.1 56 32 56Z"
      fill="url(#${gradientId})"
      fill-opacity="0.94"
    />
  `;

  heartsLayer.appendChild(heart);

  window.setTimeout(() => {
    heart.remove();
  }, duration * 1000);
}

function setupMusic() {
  birthdayMusic.volume = 0.45;
  attemptMusicPlayback();

  musicToggle.addEventListener("click", async () => {
    musicEnabled = !musicEnabled;
    birthdayMusic.muted = !musicEnabled;

    if (musicEnabled) {
      await attemptMusicPlayback();
    } else {
      birthdayMusic.pause();
    }

    updateMusicUi();
  });

  ["click", "touchstart", "keydown"].forEach((eventName) => {
    window.addEventListener(
      eventName,
      () => {
        if (musicEnabled && birthdayMusic.paused) {
          attemptMusicPlayback();
        }
      },
      { once: true }
    );
  });
}

async function attemptMusicPlayback() {
  try {
    await birthdayMusic.play();
  } catch (error) {
    musicEnabled = false;
    birthdayMusic.muted = true;
  }
  updateMusicUi();
}

function updateMusicUi() {
  musicToggle.setAttribute("aria-pressed", String(musicEnabled));
  musicLabel.textContent = musicEnabled ? "Music On" : "Music Off";
}

function setupLightbox() {
  const close = () => {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  };

  lightboxClose.addEventListener("click", close);
  lightboxBackdrop.addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      close();
    }
  });
}

function openLightbox(image) {
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = image.title;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
}

function startConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  const context = canvas.getContext("2d");
  const pieces = [];
  const palette = ["#ff8dc8", "#ffc7e4", "#dfcbff", "#fff3fb", "#ffd96d"];
  let animationFrame = null;
  const endAt = performance.now() + 4600;

  const resize = () => {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  };

  resize();
  window.addEventListener("resize", resize);

  for (let index = 0; index < 160; index += 1) {
    pieces.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * -window.innerHeight,
      size: 5 + Math.random() * 9,
      color: palette[index % palette.length],
      speedY: 2 + Math.random() * 4,
      speedX: -2 + Math.random() * 4,
      rotation: Math.random() * Math.PI,
      spin: -0.12 + Math.random() * 0.24
    });
  }

  function tick(now) {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    pieces.forEach((piece) => {
      piece.x += piece.speedX;
      piece.y += piece.speedY;
      piece.rotation += piece.spin;

      if (piece.y > window.innerHeight + 30) {
        piece.y = -20;
        piece.x = Math.random() * window.innerWidth;
      }

      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.66);
      context.restore();
    });

    if (now < endAt) {
      animationFrame = window.requestAnimationFrame(tick);
    } else {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      window.cancelAnimationFrame(animationFrame);
    }
  }

  animationFrame = window.requestAnimationFrame(tick);
}
