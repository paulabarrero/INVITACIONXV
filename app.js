const invitation = document.querySelector(".invitation");
const progressBar = document.querySelector("#progress");
const menu = document.querySelector(".section-menu");
const musicButton = document.querySelector("#music-toggle");
const music = document.querySelector("#background-music");
const musicNote = document.querySelector("#music-note");
const form = document.querySelector("#rsvp-form");
const guestName = document.querySelector("#guest-name");
const recipientSelect = document.querySelector("#recipient");
const surveyNote = document.querySelector("#survey-note");
const surveySteps = [...document.querySelectorAll(".survey-step")];
const progressSteps = [...document.querySelectorAll("[data-progress-step]")];
const partySize = document.querySelector("#party-size");
const attendanceRadios = [...document.querySelectorAll('input[name="attendance"]')];
const welcomeScreen = document.querySelector("#welcome-screen");
const openInvitationButton = document.querySelector("#open-invitation");

const floatingMusicBar = document.querySelector("#floating-music-bar");
const floatingMusicToggle = document.querySelector("#floating-music-toggle");
const floatingPlayIcon = document.querySelector(".floating-play-icon");
const magicCanvas = document.querySelector("#magic-canvas");
const toastEl = document.querySelector("#toast");

const eventDate = new Date("2026-12-19T18:00:00-05:00");
const musicPath = "audio/musica-xv.mp3";
let activeStep = 0;
let suggestedSong = "";
let toastTimer = null;

/* ========================================================
   SISTEMA DE PARTÍCULAS DORADAS Y CONFETI (CANVAS)
   ======================================================== */
let particles = [];
let confettiPieces = [];
let canvasCtx = null;
let animFrameId = null;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initCanvas() {
  if (!magicCanvas || prefersReducedMotion) return;
  canvasCtx = magicCanvas.getContext("2d");
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas, { passive: true });

  const count = window.innerWidth < 600 ? 25 : 45;
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(createParticle());
  }

  startParticleLoop();
}

function resizeCanvas() {
  if (!magicCanvas) return;
  magicCanvas.width = window.innerWidth;
  magicCanvas.height = window.innerHeight;
}

function createParticle() {
  return {
    x: Math.random() * (magicCanvas ? magicCanvas.width : window.innerWidth),
    y: Math.random() * (magicCanvas ? magicCanvas.height : window.innerHeight),
    radius: Math.random() * 2 + 0.8,
    vx: (Math.random() - 0.5) * 0.35,
    vy: -(Math.random() * 0.45 + 0.15),
    alpha: Math.random() * 0.7 + 0.1,
    maxAlpha: Math.random() * 0.6 + 0.3,
    twinkleSpeed: Math.random() * 0.02 + 0.008,
    color: Math.random() > 0.3 ? "#d4af37" : "#f5deb3",
  };
}

function triggerConfetti(originX, originY, count = 55) {
  if (!magicCanvas || prefersReducedMotion) return;
  const colors = ["#d4af37", "#f3dfb2", "#8e681f", "#b87b74", "#fffaf0", "#e9c99d"];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 6 + 2.5;
    confettiPieces.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.5,
      size: Math.random() * 6 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      gravity: 0.18,
      decay: Math.random() * 0.012 + 0.008,
    });
  }
}

function startParticleLoop() {
  if (!canvasCtx || animFrameId) return;

  function render() {
    canvasCtx.clearRect(0, 0, magicCanvas.width, magicCanvas.height);

    // Partículas doradas
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha += p.twinkleSpeed;
      if (p.alpha > p.maxAlpha || p.alpha < 0.1) {
        p.twinkleSpeed = -p.twinkleSpeed;
      }

      if (p.y < -10) {
        p.y = magicCanvas.height + 10;
        p.x = Math.random() * magicCanvas.width;
      }
      if (p.x < -10) p.x = magicCanvas.width + 10;
      if (p.x > magicCanvas.width + 10) p.x = -10;

      canvasCtx.beginPath();
      canvasCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      canvasCtx.fillStyle = p.color;
      canvasCtx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      canvasCtx.shadowBlur = 6;
      canvasCtx.shadowColor = "#d4af37";
      canvasCtx.fill();
    }

    // Confeti
    for (let j = confettiPieces.length - 1; j >= 0; j--) {
      const c = confettiPieces[j];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += c.gravity;
      c.rotation += c.rotationSpeed;
      c.alpha -= c.decay;

      if (c.alpha <= 0 || c.y > magicCanvas.height + 20) {
        confettiPieces.splice(j, 1);
        continue;
      }

      canvasCtx.save();
      canvasCtx.translate(c.x, c.y);
      canvasCtx.rotate((c.rotation * Math.PI) / 180);
      canvasCtx.fillStyle = c.color;
      canvasCtx.globalAlpha = c.alpha;
      canvasCtx.shadowBlur = 0;
      canvasCtx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.6);
      canvasCtx.restore();
    }

    canvasCtx.globalAlpha = 1;
    animFrameId = requestAnimationFrame(render);
  }

  animFrameId = requestAnimationFrame(render);
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  } else {
    startParticleLoop();
  }
});

/* ========================================================
   CONTROL SINCRONIZADO DE MÚSICA
   ======================================================== */
function setMusicUiState(isPlaying) {
  if (isPlaying) {
    musicButton.setAttribute("aria-pressed", "true");
    musicButton.setAttribute("aria-label", "Pausar música de fondo");
    document.querySelector(".music-label").textContent = "Pausar música";

    if (floatingMusicBar) {
      floatingMusicBar.classList.add("playing");
      floatingMusicBar.hidden = false;
      if (floatingPlayIcon) floatingPlayIcon.textContent = "❚❚";
      floatingMusicToggle?.setAttribute("aria-label", "Pausar música");
    }
    musicNote.textContent = "";
    musicNote.hidden = true;
  } else {
    musicButton.setAttribute("aria-pressed", "false");
    musicButton.setAttribute("aria-label", "Reproducir música de fondo");
    document.querySelector(".music-label").textContent = "Reproducir música";

    if (floatingMusicBar) {
      floatingMusicBar.classList.remove("playing");
      if (floatingPlayIcon) floatingPlayIcon.textContent = "▶";
      floatingMusicToggle?.setAttribute("aria-label", "Reproducir música");
    }
  }
}

async function toggleMusic() {
  if (!music.src) music.src = new URL(musicPath, document.baseURI).href;
  if (music.paused) {
    try {
      await music.play();
      setMusicUiState(true);
    } catch {
      musicNote.textContent = `Añade tu canción en ${musicPath} para activar la música.`;
      musicNote.hidden = false;
      setMusicUiState(false);
    }
  } else {
    music.pause();
    setMusicUiState(false);
  }
}

/* ========================================================
   APERTURA DEL SOBRE DE INVITACIÓN
   ======================================================== */
function openInvitation() {
  if (welcomeScreen.classList.contains("opening")) return;
  welcomeScreen.classList.add("opening");
  document.body.classList.remove("invitation-locked");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const rect = openInvitationButton.getBoundingClientRect();
  triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 70);

  window.setTimeout(() => {
    welcomeScreen.classList.add("leaving");
  }, reducedMotion ? 30 : 2200);
  window.setTimeout(() => {
    welcomeScreen.remove();
    if (floatingMusicBar) floatingMusicBar.hidden = false;
  }, reducedMotion ? 100 : 2900);

  music.src = new URL(musicPath, document.baseURI).href;
  music.play().then(() => {
    setMusicUiState(true);
  }).catch(() => {
    setMusicUiState(false);
  });
}

document.body.classList.add("invitation-locked");
openInvitationButton.addEventListener("click", openInvitation);
musicButton.addEventListener("click", toggleMusic);
floatingMusicToggle?.addEventListener("click", toggleMusic);

music.addEventListener("error", () => {
  setMusicUiState(false);
  musicNote.textContent = `Añade tu canción en ${musicPath} para activar la música.`;
  musicNote.hidden = false;
});

/* ========================================================
   CARGA DE IMÁGENES Y CALENDARIO
   ======================================================== */
function loadImageSlots() {
  document.querySelectorAll(".media-slot[data-image]").forEach((slot) => {
    const img = new Image();
    img.className = "media-art";
    img.alt = slot.dataset.alt || "";
    img.addEventListener("load", () => {
      slot.classList.add("has-image");
      slot.prepend(img);
    }, { once: true });
    img.addEventListener("error", () => img.remove(), { once: true });
    img.src = slot.dataset.image;
  });
}

function updateReadingProgress() {
  const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollRange > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollRange)) : 0;
  progressBar.style.transform = `scaleX(${amount})`;
}

function updateCountdown() {
  const remaining = eventDate.getTime() - Date.now();
  const output = document.querySelector("#countdown");
  const finished = document.querySelector("#countdown-finished");
  if (remaining <= 0) {
    if (output) output.hidden = true;
    if (finished) finished.hidden = false;
    return;
  }
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  const d = document.querySelector("#count-days");
  const h = document.querySelector("#count-hours");
  const m = document.querySelector("#count-minutes");
  const s = document.querySelector("#count-seconds");
  if (d) d.textContent = String(days).padStart(3, "0");
  if (h) h.textContent = String(hours).padStart(2, "0");
  if (m) m.textContent = String(minutes).padStart(2, "0");
  if (s) s.textContent = String(seconds).padStart(2, "0");
}

function buildCalendar() {
  const grid = document.querySelector("#calendar-grid");
  if (!grid) return;
  const weekdays = ["L", "M", "M", "J", "V", "S", "D"];
  weekdays.forEach((day) => {
    const cell = document.createElement("span");
    cell.className = "calendar-cell weekday";
    cell.textContent = day;
    grid.append(cell);
  });
  const firstDay = (new Date(2026, 11, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(2026, 12, 0).getDate();
  for (let blank = 0; blank < firstDay; blank += 1) {
    const cell = document.createElement("span");
    cell.className = "calendar-cell blank";
    cell.setAttribute("aria-hidden", "true");
    grid.append(cell);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const cell = document.createElement("span");
    cell.className = `calendar-cell${day === 19 ? " event-day" : ""}`;
    cell.textContent = String(day);
    grid.append(cell);
  }
}

/* ========================================================
   INTEGRACIÓN CON CALENDARIO (GOOGLE & APPLE .ICS)
   ======================================================== */
function setupCalendarButtons() {
  const btnGcal = document.querySelector("#btn-gcal");
  const btnIcal = document.querySelector("#btn-ical");

  if (btnGcal) {
    btnGcal.addEventListener("click", () => {
      const title = encodeURIComponent("XV Años de Maria Paula Barrero Murillo");
      const details = encodeURIComponent("Celebración de los quince años de Maria Paula Barrero Murillo.\nCódigo de vestimenta: Formal.\nLugar: Barrio Santa Ana, Guamo, Tolima.\n¡Te esperamos con alegría!");
      const location = encodeURIComponent("Barrio Santa Ana, Guamo, Tolima, Colombia");
      const dates = "20261219T230000Z/20261220T080000Z";
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
      window.open(gcalUrl, "_blank", "noopener,noreferrer");
    });
  }

  if (btnIcal) {
    btnIcal.addEventListener("click", () => {
      const icsData = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//XV Maria Paula Barrero//ES",
        "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        "SUMMARY:XV Años de Maria Paula Barrero Murillo",
        "DESCRIPTION:Celebración de los quince años de Maria Paula Barrero Murillo. Código de vestimenta: Formal.",
        "LOCATION:Barrio Santa Ana, Guamo, Tolima, Colombia",
        "DTSTART:20261219T230000Z",
        "DTEND:20261220T080000Z",
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");

      const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "xv-maria-paula.ics";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("✓ Recordatorio (.ics) descargado");
    });
  }
}

/* ========================================================
   UTILIDAD DE COPIADO AL PORTAPAPELES Y TOAST
   ======================================================== */
function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.hidden = true;
  }, 2800);
}

function setupClipboardActions() {
  const copyAddressBtn = document.querySelector("#btn-copy-address");
  if (copyAddressBtn) {
    copyAddressBtn.addEventListener("click", () => {
      const address = copyAddressBtn.dataset.address || "Barrio Santa Ana, Guamo, Tolima, Colombia";
      navigator.clipboard.writeText(address).then(() => {
        showToast("✓ Dirección copiada al portapapeles");
      }).catch(() => {
        showToast("✓ Barrio Santa Ana, Guamo, Tolima");
      });
    });
  }
}

/* ========================================================
   SUGERENCIA DE CANCIONES PARA EL DJ
   ======================================================== */
function setupSongSuggestion() {
  const songInput = document.querySelector("#song-input");
  const suggestBtn = document.querySelector("#btn-suggest-song");
  const feedback = document.querySelector("#song-feedback");

  if (!suggestBtn || !songInput) return;

  suggestBtn.addEventListener("click", () => {
    const value = songInput.value.trim();
    if (!value) {
      if (feedback) feedback.textContent = "Por favor escribe el nombre de una canción o artista.";
      songInput.focus();
      return;
    }
    suggestedSong = value;
    if (feedback) {
      feedback.textContent = `¡Excelente elección! "${value}" se incluirá en tu confirmación 🎶`;
    }
    showToast("✓ Canción guardada para la fiesta");
    triggerConfetti(window.innerWidth / 2, window.innerHeight * 0.7, 30);
  });
}

/* ========================================================
   ANIMACIONES SCROLL REVEAL (INTERSECTION OBSERVER)
   ======================================================== */
function setupScrollReveal() {
  if (prefersReducedMotion) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -30px 0px"
  });

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

/* ========================================================
   ENCUESTA RSVP
   ======================================================== */
function selectedAttendance() {
  return attendanceRadios.find((radio) => radio.checked)?.value || "";
}

function updateSummary() {
  const attending = selectedAttendance() === "Sí, allí estaré";
  const nameEl = document.querySelector("#summary-name");
  const attendanceEl = document.querySelector("#summary-attendance");
  const guestsEl = document.querySelector("#summary-guests");
  const guestsRow = document.querySelector("#summary-guests-row");

  if (nameEl) nameEl.textContent = guestName.value.trim() || "—";
  if (attendanceEl) attendanceEl.textContent = selectedAttendance() || "—";
  if (guestsEl) guestsEl.textContent = attending ? partySize.value : "No aplica";
  if (guestsRow) guestsRow.hidden = !attending;
}

function setStep(stepNumber) {
  activeStep = stepNumber;
  surveySteps.forEach((step, index) => {
    const isActive = index === activeStep;
    step.hidden = !isActive;
    step.classList.toggle("active", isActive);
    step.setAttribute("aria-hidden", String(!isActive));
  });
  const declined = selectedAttendance() === "No podré asistir";
  progressSteps.forEach((step, index) => {
    const skipped = declined && index === 2;
    step.classList.toggle("active", index === activeStep);
    step.classList.toggle("done", index < activeStep && !skipped);
    step.classList.toggle("skipped", skipped);
    if (index === activeStep) step.setAttribute("aria-current", "step");
    else step.removeAttribute("aria-current");
  });
  const fill = document.querySelector("#survey-progress-fill");
  if (fill) fill.style.transform = `scaleX(${activeStep / (surveySteps.length - 1)})`;
  if (activeStep === 3) updateSummary();
  const heading = surveySteps[activeStep].querySelector("h3");
  heading?.focus({ preventScroll: true });
}

function validateCurrentStep() {
  if (activeStep === 0) {
    const field = guestName;
    const error = document.querySelector('[data-error-for="name"]');
    if (!field.value.trim()) {
      if (error) error.textContent = "Escribe tu nombre para continuar.";
      field.focus();
      return false;
    }
    if (error) error.textContent = "";
  }
  if (activeStep === 1) {
    const error = document.querySelector('[data-error-for="attendance"]');
    if (!selectedAttendance()) {
      if (error) error.textContent = "Elige si podrás acompañarnos.";
      attendanceRadios[0]?.focus();
      return false;
    }
    if (error) error.textContent = "";
  }
  if (activeStep === 2) {
    const error = document.querySelector('[data-error-for="partySize"]');
    const count = Number(partySize.value);
    if (!Number.isInteger(count) || count < 1) {
      if (error) error.textContent = "Indica al menos una persona (tú).";
      partySize.focus();
      return false;
    }
    if (error) error.textContent = "";
  }
  return true;
}

document.querySelectorAll(".next-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (!validateCurrentStep()) return;
    if (activeStep === 1 && selectedAttendance() === "No podré asistir") setStep(3);
    else setStep(Math.min(3, activeStep + 1));
  });
});

document.querySelectorAll(".back-button").forEach((button) => {
  button.addEventListener("click", () => {
    if (activeStep === 3 && selectedAttendance() === "No podré asistir") setStep(1);
    else setStep(Math.max(0, activeStep - 1));
  });
});

document.querySelectorAll(".counter-button").forEach((button) => {
  button.addEventListener("click", () => {
    const delta = button.dataset.count === "up" ? 1 : -1;
    partySize.value = String(Math.max(1, Number(partySize.value || 1) + delta));
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (activeStep < 3) {
    if (validateCurrentStep()) {
      if (activeStep === 1 && selectedAttendance() === "No podré asistir") setStep(3);
      else setStep(Math.min(3, activeStep + 1));
    }
    return;
  }
  if (!validateCurrentStep()) return;
  updateSummary();
  const attendance = selectedAttendance();
  const attending = attendance === "Sí, allí estaré";
  const messageParts = [
    "Hola, quiero confirmar mi respuesta a la invitación de los XV años de Maria Paula Barrero Murillo.",
    `Nombre: ${guestName.value.trim()}`,
    `Asistencia: ${attendance}`,
    ...(attending ? [`Personas que asistirán: ${partySize.value}`] : []),
    ...(suggestedSong ? [`Canción sugerida para la fiesta: ${suggestedSong}`] : []),
  ];
  const message = messageParts.join("\n");
  const recipient = recipientSelect.value;
  const whatsappUrl = `https://wa.me/${recipient}?text=${encodeURIComponent(message)}`;
  
  triggerConfetti(window.innerWidth / 2, window.innerHeight / 2, 75);

  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  surveyNote.textContent = "Se abrió WhatsApp. Revisa la respuesta y pulsa Enviar para confirmarla.";
});

/* ========================================================
   INICIALIZACIÓN GENERAL
   ======================================================== */
initCanvas();
loadImageSlots();
buildCalendar();
updateReadingProgress();
updateCountdown();
setupCalendarButtons();
setupClipboardActions();
setupSongSuggestion();
setupScrollReveal();

window.addEventListener("scroll", updateReadingProgress, { passive: true });
window.addEventListener("resize", updateReadingProgress, { passive: true });
window.setInterval(updateCountdown, 1000);

menu?.querySelectorAll("nav a").forEach((link) => {
  link.addEventListener("click", () => { if (menu) menu.open = false; });
});
