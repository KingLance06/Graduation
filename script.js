const $ = (s) => document.querySelector(s);
const DURATION = 5500; // ms per photo (videos play to the end)

// ---------- Fill intro text from photos.js ----------
$("#siteDate").textContent = SITE.date;
$("#siteTitle").textContent = SITE.title;
$("#siteName").textContent = SITE.name;
const hero = $("#heroPhoto");
if (SITE.heroPhoto) {
  hero.src = SITE.heroPhoto;
  hero.onerror = () => (hero.parentElement.style.display = "none"); // hide if file missing
} else {
  hero.parentElement.style.display = "none";
}
$("#siteSub").textContent = SITE.subtitle;
$("#siteMsg").textContent = SITE.message;
$("#brand").textContent = `${SITE.name} · ${SITE.title}`;
document.title = `${SITE.name} — ${SITE.title}`;

let list = [...PHOTOS];
let idx = 0;
let playing = true;
let muted = false;

const slidesEl = $("#slides");
const bar = $("#bar");

// ---------- Background music ----------
const bgm = $("#bgm");
let musicOn = true;
if (SITE.music) {
  bgm.src = SITE.music;
  bgm.volume = 0.6;
} else {
  $("#music").style.display = "none";
}

// Music plays while the slideshow plays, and pauses while a video is playing with its own sound.
function updateMusic() {
  if (!SITE.music) return;
  const p = list[idx];
  const videoLoud = p && p.type === "video" && !muted;
  if (musicOn && playing && !videoLoud) bgm.play().catch(() => {});
  else bgm.pause();
}

const currentVideo = () => slidesEl.lastElementChild?.querySelector("video") || null;

// ---------- Build thumbnails ----------
function buildThumbs() {
  const el = $("#thumbs");
  el.innerHTML = "";
  list.forEach((p, i) => {
    const b = document.createElement("button");
    b.className = "thumb";
    b.setAttribute("aria-label", p.caption || `Item ${i + 1}`);
    if (p.type === "video") {
      const v = document.createElement("video");
      v.src = p.src + "#t=0.5";
      v.preload = "metadata";
      v.muted = true;
      v.playsInline = true;
      v.onerror = () => v.remove();
      b.appendChild(v);
      const tag = document.createElement("span");
      tag.className = "vtag";
      tag.textContent = "▶";
      b.appendChild(tag);
    } else {
      const img = new Image();
      img.src = p.src;
      img.alt = "";
      img.loading = "lazy";
      img.onerror = () => img.remove();
      b.appendChild(img);
    }
    b.onclick = () => go(i, true);
    el.appendChild(b);
  });
}

// ---------- Build one slide ----------
function placeholder(p) {
  const ph = document.createElement("div");
  ph.className = "placeholder";
  ph.innerHTML = `<div>${p.caption || "Your photo here"}<small>Add <b>${p.src}</b> to see it here</small></div>`;
  return ph;
}

function makeSlide(p) {
  const wrap = document.createElement("div");
  wrap.className = "slide";

  if (p.type === "video") {
    const v = document.createElement("video");
    v.src = p.src;
    v.playsInline = true;
    v.muted = muted;
    v.preload = "auto";
    v.onerror = () => {
      v.replaceWith(placeholder(p));
      if (slidesEl.lastElementChild === wrap) restartBar(); // show placeholder briefly, then move on
    };
    wrap.appendChild(v);
  } else {
    const img = new Image();
    img.alt = p.caption || "";
    img.src = p.src;
    img.onerror = () => img.replaceWith(placeholder(p));
    wrap.appendChild(img);
  }
  return wrap;
}

// ---------- Progress bar / timing ----------
function restartBar() {
  bar.className = "";
  bar.style.width = "";
  void bar.offsetWidth; // reflow to restart animation
  bar.style.setProperty("--dur", DURATION + "ms");
  bar.classList.add("run");
  if (!playing) bar.classList.add("paused");
}

function setMuteIcon() {
  $("#mute").textContent = muted ? "🔇" : "🔊";
}

function playVideo(v) {
  bar.className = "";
  bar.style.width = "0%";
  v.ontimeupdate = () => {
    if (v.duration) bar.style.width = (v.currentTime / v.duration) * 100 + "%";
  };
  v.onended = () => { if (playing) next(); };
  if (playing) {
    const pr = v.play();
    if (pr && pr.catch) {
      pr.catch(() => {
        // Browser blocked sound — fall back to muted playback
        muted = true;
        v.muted = true;
        setMuteIcon();
        updateMusic();
        v.play().catch(() => {});
      });
    }
  }
}

// ---------- Show a slide ----------
function go(i, manual = false) {
  if (!list.length) return;
  idx = (i + list.length) % list.length;
  const p = list[idx];

  const old = [...slidesEl.children];
  const slide = makeSlide(p);
  slidesEl.appendChild(slide);
  requestAnimationFrame(() => requestAnimationFrame(() => slide.classList.add("active")));
  old.forEach((o) => {
    o.classList.remove("active");
    o.querySelector("video")?.pause();
    setTimeout(() => o.remove(), 1200);
  });

  if (p.type !== "video") $("#bg").style.backgroundImage = `url("${p.src}")`;
  $("#caption").textContent = p.caption || "";
  $("#badge").textContent = p.category || "";
  $("#counter").textContent = `${idx + 1} / ${list.length}`;

  document.querySelectorAll(".thumb").forEach((t, n) => {
    t.classList.toggle("active", n === idx);
    if (n === idx) t.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  });

  if (p.type === "video") playVideo(slide.querySelector("video"));
  else restartBar();
  updateMusic();
}

const next = () => go(idx + 1);
const prev = () => go(idx - 1);

// Auto-advance for photos when the progress bar completes
bar.addEventListener("animationend", () => { if (playing) next(); });

// ---------- Controls ----------
$("#next").onclick = next;
$("#prev").onclick = prev;

function setPlaying(v) {
  playing = v;
  $("#play").textContent = v ? "⏸" : "▶";
  bar.classList.toggle("paused", !v);
  updateMusic();
  const vid = currentVideo();
  if (vid) {
    if (v) vid.play().catch(() => {});
    else vid.pause();
  }
}
$("#play").onclick = () => setPlaying(!playing);

$("#mute").onclick = () => {
  muted = !muted;
  document.querySelectorAll(".slide video").forEach((v) => (v.muted = muted));
  setMuteIcon();
  updateMusic();
};

$("#music").onclick = () => {
  musicOn = !musicOn;
  $("#music").textContent = musicOn ? "🎵" : "🔕";
  updateMusic();
};

$("#fs").onclick = () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
};

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") next();
  else if (e.key === "ArrowLeft") prev();
  else if (e.key === " ") { e.preventDefault(); setPlaying(!playing); }
  else if (e.key.toLowerCase() === "f") $("#fs").click();
  else if (e.key.toLowerCase() === "m") $("#mute").click();
});

// Swipe on mobile
let x0 = null;
$("#stage").addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
$("#stage").addEventListener("touchend", (e) => {
  if (x0 === null) return;
  const dx = e.changedTouches[0].clientX - x0;
  if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
  x0 = null;
});

// Filter tabs
document.querySelectorAll(".tab").forEach((t) => {
  t.onclick = () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
    t.classList.add("active");
    const f = t.dataset.filter;
    list = f === "all" ? [...PHOTOS] : PHOTOS.filter((p) => p.category === f);
    buildThumbs();
    slidesEl.querySelectorAll("video").forEach((v) => v.pause());
    slidesEl.innerHTML = "";
    go(0);
  };
});

// ---------- Confetti 🎓 ----------
function confetti() {
  const c = $("#confetti");
  const ctx = c.getContext("2d");
  const resize = () => { c.width = innerWidth; c.height = innerHeight; };
  resize();
  const colors = ["#e6c27a", "#f6e3b0", "#ffffff", "#8a6bff", "#ff7aa8"];
  const bits = Array.from({ length: 160 }, () => ({
    x: Math.random() * c.width,
    y: -20 - Math.random() * c.height * 0.5,
    r: 4 + Math.random() * 6,
    vy: 2 + Math.random() * 4,
    vx: -1.5 + Math.random() * 3,
    rot: Math.random() * 6,
    vr: -0.15 + Math.random() * 0.3,
    color: colors[(Math.random() * colors.length) | 0],
  }));
  let frames = 0;
  (function tick() {
    ctx.clearRect(0, 0, c.width, c.height);
    bits.forEach((b) => {
      b.x += b.vx; b.y += b.vy; b.rot += b.vr;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.fillStyle = b.color;
      ctx.fillRect(-b.r / 2, -b.r / 2, b.r, b.r * 0.6);
      ctx.restore();
    });
    if (++frames < 260) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, c.width, c.height);
  })();
}

// ---------- Start ----------
$("#startBtn").onclick = () => {
  $("#intro").classList.add("hide");
  confetti();
  setPlaying(true);
  go(0);
};

buildThumbs();
