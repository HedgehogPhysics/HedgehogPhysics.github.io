// Year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// --- Lightweight particle-field background (canvas) ---
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d", { alpha: true });

let w, h, dpr;
function resize(){
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = Math.floor(window.innerWidth);
  h = Math.floor(window.innerHeight);
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Particles
const N = reducedMotion ? 40 : 110;
const pts = [];
function rand(a,b){ return a + Math.random()*(b-a); }

for(let i=0;i<N;i++){
  pts.push({
    x: rand(0,w), y: rand(0,h),
    vx: rand(-0.25, 0.25), vy: rand(-0.25, 0.25),
    r: rand(1.0, 2.2),
    k: Math.random()
  });
}

// Mouse / touch subtle parallax
let mx = w*0.5, my = h*0.35;
window.addEventListener("mousemove", (e)=>{ mx = e.clientX; my = e.clientY; }, { passive: true });
window.addEventListener("touchmove", (e)=>{
  if(e.touches && e.touches[0]){
    mx = e.touches[0].clientX; my = e.touches[0].clientY;
  }
}, { passive: true });

function step(){
  ctx.clearRect(0,0,w,h);

  // Very light paper-like wash
  const g = ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0, "rgba(42,109,245,0.035)");
  g.addColorStop(1, "rgba(124,58,237,0.028)");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);

  // Particle motion
  const px = (mx / w - 0.5) * 18;
  const py = (my / h - 0.5) * 18;

  for(const p of pts){
    if(!reducedMotion){
      p.x += p.vx; p.y += p.vy;
      if(p.x < -40) p.x = w + 40;
      if(p.x > w + 40) p.x = -40;
      if(p.y < -40) p.y = h + 40;
      if(p.y > h + 40) p.y = -40;
    }

    // soft dot
    ctx.beginPath();
    ctx.arc(p.x + px*p.k, p.y + py*p.k, p.r, 0, Math.PI*2);
    ctx.fillStyle = "rgba(16,17,20,0.10)";
    ctx.fill();
  }

  // Connect nearby points (subtle network)
  for(let i=0;i<pts.length;i++){
    for(let j=i+1;j<pts.length;j++){
      const a = pts[i], b = pts[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist2 = dx*dx + dy*dy;
      if(dist2 < 110*110){
        const t = 1 - dist2/(110*110);
        ctx.strokeStyle = `rgba(16,17,20,${0.08*t})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x + px*a.k, a.y + py*a.k);
        ctx.lineTo(b.x + px*b.k, b.y + py*b.k);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(step);
}
step();

const spotlight = document.getElementById("artSpotlight");
const spotlightBackdrop = spotlight.querySelector(".art-spotlight-backdrop");
const spotlightStage = spotlight.querySelector(".art-spotlight-stage");
const spotlightImg = document.getElementById("artSpotlightImg");
const spotlightTitle = document.getElementById("artSpotlightTitle");
const spotlightDesc = document.getElementById("artSpotlightDesc");
const spotlightClose = document.getElementById("artSpotlightClose");
const spotlightPanel = spotlight.querySelector(".art-spotlight-panel");

let lastThumbRect = null;

function setImgRect(rect){
  spotlightImg.style.left = rect.left + "px";
  spotlightImg.style.top = rect.top + "px";
  spotlightImg.style.width = rect.width + "px";
  spotlightImg.style.height = rect.height + "px";
}

function getTargetRect(){
  const stageRect = spotlightStage.getBoundingClientRect();
  const isMobile = window.matchMedia("(max-width: 900px)").matches;

  let imgW, imgH, imgLeft, imgTop;

  if (!isMobile){
    const panelW = Math.min(360, stageRect.width * 0.42);
    const gap = 24;

    const availW = stageRect.width - panelW - gap;
    imgW = Math.min(availW, stageRect.width * 0.62);
    imgH = stageRect.height * 0.86;

    const blockW = imgW + gap + panelW;
    const blockLeft = stageRect.left + (stageRect.width - blockW) / 2;

    imgLeft = blockLeft;
    imgTop  = stageRect.top + (stageRect.height - imgH) / 2;
  } else {
    imgW = stageRect.width * 0.92;
    imgH = stageRect.height * 0.6;

    imgLeft = stageRect.left + (stageRect.width - imgW) / 2;
    imgTop = stageRect.top + stageRect.height * 0.05;
  }

  return { left: imgLeft, top: imgTop, width: imgW, height: imgH };
}

// Get the full-screen centred rect (no panel offset) — uses viewport for true centering
function getFullRect(){
  const isMobile = window.matchMedia("(max-width: 900px)").matches;

  let imgW, imgH, imgLeft, imgTop;

  if (!isMobile){
    imgW = Math.min(window.innerWidth * 0.72, window.innerHeight * 0.88);
    imgH = window.innerHeight * 0.88;
    imgLeft = (window.innerWidth - imgW) / 2;
    imgTop  = (window.innerHeight - imgH) / 2;
  } else {
    imgW = window.innerWidth * 0.92;
    imgH = window.innerHeight * 0.75;
    imgLeft = (window.innerWidth - imgW) / 2;
    imgTop  = (window.innerHeight - imgH) / 2;
  }

  return { left: imgLeft, top: imgTop, width: imgW, height: imgH };
}

function openSpotlight(fromImg){
  spotlightImg.src = fromImg.src;
  spotlightImg.alt = fromImg.alt || "";
  spotlightTitle.textContent = fromImg.dataset.title || fromImg.alt || "Artwork";
  spotlightDesc.textContent = fromImg.dataset.desc || "";

  spotlight.classList.add("is-open");
  spotlight.setAttribute("aria-hidden", "false");
  document.body.classList.add("art-spotlight-open");
  document.body.style.overflow = "hidden";

  // Start panel hidden; fade it in after image starts moving
  spotlightPanel.classList.remove("is-visible");

  // Start at thumbnail rect
  const r = fromImg.getBoundingClientRect();
  lastThumbRect = r;
  setImgRect({ left: r.left, top: r.top, width: r.width, height: r.height });

  // Force layout so transitions kick in
  spotlightImg.getBoundingClientRect();

  // Animate to target (with panel visible alongside)
  const t = getTargetRect();
  requestAnimationFrame(() => {
    setImgRect(t);
  });

  // Fade in panel
  setTimeout(() => {
    spotlightPanel.classList.add("is-visible");
  }, 180);
}

// Hides just the panel and expands image to fill the stage
function hidePanel(){
  spotlightPanel.classList.remove("is-visible");
  // Expand image to full centre now panel is gone
  const t = getFullRect();
  requestAnimationFrame(() => {
    setImgRect(t);
  });
}

// Fully closes the spotlight and animates image back to thumbnail
function closeSpotlight(){
  spotlightPanel.classList.remove("is-visible");

  if (lastThumbRect){
    setImgRect({ left: lastThumbRect.left, top: lastThumbRect.top, width: lastThumbRect.width, height: lastThumbRect.height });
  }

  setTimeout(() => {
    spotlight.classList.remove("is-open");
    spotlight.setAttribute("aria-hidden", "true");
    document.body.classList.remove("art-spotlight-open");
    document.body.style.overflow = "";
    spotlightImg.src = "";
    lastThumbRect = null;
  }, 430);
}

// Click handlers
document.addEventListener("click", (e) => {
  // Open spotlight on artwork click
  const img = e.target.closest(".art-item img");
  if (img) {
    openSpotlight(img);
    return;
  }

  // X button — hide panel only, expand image
  if (e.target.closest("#artSpotlightClose")) {
    hidePanel();
    return;
  }

  // Click backdrop — close everything
  if (e.target === spotlightBackdrop) {
    closeSpotlight();
  }
});

// ESC closes everything
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && spotlight.classList.contains("is-open")) {
    closeSpotlight();
  }
});

// Resize while open: keep spotlight aligned
window.addEventListener("resize", () => {
  if (!spotlight.classList.contains("is-open")) return;
  const isPanelVisible = spotlightPanel.classList.contains("is-visible");
  const t = isPanelVisible ? getTargetRect() : getFullRect();
  setImgRect(t);
});
