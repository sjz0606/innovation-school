/* Innovation English School v6: kino uslubidagi harakatlar
   (GSAP + ScrollTrigger + SplitText + Lenis). Mantiq app.js'da; bu fayl faqat ko'rinish.
   Kutubxona yuklanmasa yoki "kamroq harakat" yoqilgan bo'lsa, sayt harakatsiz to'liq ishlaydi. */
(() => {
"use strict";
const root = document.documentElement;
const ready = () => root.classList.add("mo-ready");
setTimeout(ready, 2500);

const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
const L = () => root.lang === "ru" ? "ru" : "uz";
const LABEL = { play:{uz:"Ko'rish",ru:"Смотреть"}, view:{uz:"Ochish",ru:"Открыть"} };

/* ekrandan tashqaridagi videolarni to'xtatib turish (har doim) */
const vio = new IntersectionObserver(es => es.forEach(e => {
  const v = e.target; if (e.isIntersecting) v.play().catch(()=>{}); else v.pause();
}), {rootMargin:"160px"});
$$("video[autoplay]").forEach(v => vio.observe(v));

/* kitob kadrlari (harakatsiz rejimda ham birinchi kadr chiziladi) */
const FRAMES = 132;
const cv = $(".books__cv"), ctx = cv && cv.getContext("2d");
const imgs = [];
const frameSrc = i => `media/seq/b${String(i + 1).padStart(3, "0")}.webp`;
let curFrame = -1;
function drawFrame(i){
  i = Math.max(0, Math.min(FRAMES - 1, Math.round(i)));
  const im = imgs[i];
  if (!im || !im.complete || !im.naturalWidth){ // hali yuklanmagan: eng yaqin tayyor kadr
    for (let d = 1; d < FRAMES; d++){
      const a = imgs[i - d], b = imgs[i + d];
      if (a && a.complete && a.naturalWidth){ i = i - d; break; }
      if (b && b.complete && b.naturalWidth){ i = i + d; break; }
    }
  }
  const pic = imgs[i]; if (!pic || !pic.naturalWidth || i === curFrame) return;
  curFrame = i;
  // canvas'ni ekran nisbatiga moslab "cover" chizish
  const W = cv.clientWidth, H = cv.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
  if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)){ cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  const s = Math.max(cv.width / pic.naturalWidth, cv.height / pic.naturalHeight);
  const w = pic.naturalWidth * s, h = pic.naturalHeight * s;
  ctx.drawImage(pic, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
}
function loadFrames(){
  if (!cv || imgs.length) return;
  for (let i = 0; i < FRAMES; i++){
    const im = new Image(); im.decoding = "async"; im.src = frameSrc(i); imgs.push(im);
    if (i === 0) im.onload = () => { curFrame = -1; drawFrame(0); };
  }
}
if (cv){
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting){ loadFrames(); o.disconnect(); } }, {rootMargin:"1200px"}).observe(cv);
  addEventListener("resize", () => { const f = curFrame; curFrame = -1; drawFrame(f < 0 ? 0 : f); });
}

if (reduce || !window.gsap || !window.ScrollTrigger || !window.SplitText){ root.classList.add("no-mo"); ready(); return; }
gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.defaults({ease:"expo.out", duration:1.1});
const mm = gsap.matchMedia();

const start = () => {
/* ---------- Silliq scroll ---------- */
let lenis = null;
if (window.Lenis){
  lenis = new Lenis({lerp:.09, anchors:{offset:-80}, autoRaf:false});
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  $$("dialog").forEach(d => {
    d.setAttribute("data-lenis-prevent", "");
    new MutationObserver(() => d.open ? lenis.stop() : lenis.start()).observe(d, {attributes:true, attributeFilter:["open"]});
  });
}

/* ---------- Progress va navigatsiya ---------- */
gsap.to(".progress i", {scaleX:1, ease:"none", scrollTrigger:{start:0, end:"max", scrub:.3}});
const nav = $("#nav");
let lastY = scrollY;
addEventListener("scroll", () => {
  const y = scrollY;
  if (y > lastY + 2 && y > innerHeight * .8) nav.classList.add("is-hidden");
  else if (y < lastY - 2 || y < 120) nav.classList.remove("is-hidden");
  lastY = y;
}, {passive:true});
nav.addEventListener("focusin", () => nav.classList.remove("is-hidden"));

/* ---------- Sarlavhalar: qator-qator niqobdan ---------- */
const splits = new Map();
function splitHead(el, opts = {}){
  const split = SplitText.create(el, {type:"lines", mask:"lines", linesClass:"ln"});
  const st = {split, stale:false};
  const vars = {yPercent:112, duration:1.35, stagger:.1, ease:"expo.out", onComplete(){ if (!st.stale) split.revert(); }};
  if (!opts.now) vars.scrollTrigger = {trigger:el, start:"top 88%", once:true};
  st.tween = gsap.from(split.lines, vars);
  splits.set(el, st);
  return st.tween;
}

/* ---------- So'zlar scroll bilan yonadi ---------- */
const wordTweens = new Map();
function wordScrub(el, trigger, start = "top 80%", end = "bottom 45%"){
  const old = wordTweens.get(el); if (old){ old.scrollTrigger && old.scrollTrigger.kill(); old.kill(); }
  const split = SplitText.create(el, {type:"words", wordsClass:"w"});
  const tw = gsap.fromTo(split.words, {opacity:.14}, {opacity:1, ease:"none", stagger:.08, duration:1,
    scrollTrigger:{trigger: trigger || el, start, end, scrub:.6}});
  wordTweens.set(el, tw);
  return tw;
}

/* ================= HERO: uch kadr -> bitta katta ekran ================= */
const intro = gsap.timeline({defaults:{ease:"expo.out"}});
intro
  .from(".tri__c", {clipPath:"inset(100% 0% 0% 0%)", duration:1.7, stagger:.12, ease:"expo.inOut"}, 0)
  .from(".tri__c video", {scale:1.35, duration:2.4, stagger:.12}, .1)
  .from(".hero__kicker", {y:20, opacity:0, duration:1}, .7)
  .from([".hero__l1", ".hero__l2"], {yPercent:105, opacity:0, duration:1.4, stagger:.12}, .8)
  .from([".hero__lead", ".hero__cta > *"], {y:26, opacity:0, stagger:.08, duration:1.2}, 1.15)
  .from(".hero__bar > *", {y:12, opacity:0, stagger:.06, duration:1}, 1.3);
ready();

mm.add("(min-width: 901px)", () => {
  const tl = gsap.timeline({defaults:{ease:"none"},
    scrollTrigger:{trigger:".hero", start:"top top", end:"+=170%", pin:".hero__stage", scrub:1, anticipatePin:1}});
  tl.to(".tri__c--a, .tri__c--c", {flexBasis:"0%", opacity:.15, duration:1}, 0)
    .to(".tri__c--b", {flexBasis:"100%", duration:1}, 0)
    .to(".tri", {gap:0, duration:.6}, 0)
    .to(".tri__c--b video", {scale:1.08, duration:1.6}, 0)
    .to(".hero__copy", {yPercent:-30, opacity:0, duration:.55}, 0)
    .to(".hero__bar", {opacity:0, duration:.3}, 0)
    .to(".tri__c--b video", {filter:"brightness(.42) saturate(.85)", duration:.5}, .45)
    .fromTo(".hero__promise", {autoAlpha:0, scale:.94}, {autoAlpha:1, scale:1, duration:.5, ease:"power2.out"}, .75)
    .to({}, {duration:.35});
  return () => gsap.set(".tri__c, .tri__c video, .hero__copy, .hero__bar, .hero__promise, .tri", {clearProps:"all"});
});
mm.add("(max-width: 900px)", () => {
  gsap.to(".tri__c--b video", {yPercent:8, scale:1.1, ease:"none", scrollTrigger:{trigger:".hero", start:"top top", end:"bottom top", scrub:true}});
});

/* ---------- Boshqa sarlavhalar ---------- */
$$("[data-split]").forEach(el => splitHead(el));

/* ---------- Umumiy paydo bo'lish ---------- */
function rise(targets, trigger, extra = {}){
  const els = typeof targets === "string" ? $$(targets) : targets;
  if (!els.length) return;
  gsap.from(els, Object.assign({y:46, opacity:0, duration:1.25, stagger:.08,
    scrollTrigger:{trigger: trigger || els[0], start:"top 88%", once:true}}, extra));
}
$$(".sec__head").forEach(h => rise([...h.querySelectorAll(".kicker, .sec__lead")], h));
$$(".sec .note").forEach(n => rise([n]));
rise(".manifest .kicker");
rise(".facts > div", ".facts", {stagger:.12});
rise(".chaps__head .kicker", ".chaps__head");
rise(".faq__list details", ".faq__list", {stagger:.06, y:30});
rise(".faq__grid header .kicker, .faq__grid header .sec__lead, .faq__grid header .bigtel", ".faq__grid header");
rise(".lead__text .kicker, .lead__text .sec__lead, .lead__or, .lead .bigtel, .lead__soc", ".lead__text");
rise(".lead__box", ".lead__box", {y:80, duration:1.5});
rise(".teachers__head .kicker, .teachers__head .sec__lead", ".teachers__head");

/* ---------- Manifest: so'zlar + raqamlar ---------- */
const man = $(".manifest__text");
wordScrub(man, man, "top 82%", "bottom 50%");
$$(".facts b[data-count]").forEach(b => {
  const n = +b.dataset.count, dec = +(b.dataset.dec || 0), suf = b.dataset.suffix || "";
  const o = {v:0};
  gsap.to(o, {v:n, duration:2.2, ease:"power3.out", scrollTrigger:{trigger:b, start:"top 90%", once:true},
    onUpdate(){ b.textContent = (dec ? o.v.toFixed(dec) : String(Math.round(o.v))) + suf; }});
});

/* ---------- Natijalar: qatorlar + ball sanog'i ---------- */
let resultsPlayed = false;
ScrollTrigger.create({trigger:".sheet-wrap", start:"top 80%", once:true, onEnter(){
  resultsPlayed = true;
  gsap.from($$("#resBody tr, #resAvg, #kalkulyator"), {y:34, opacity:0, duration:1.1, stagger:.055});
  $$("#resBody td").forEach((td, i) => {
    const end = parseFloat(td.textContent); if (isNaN(end)) return;
    const o = {v: Math.max(0, end - 3)};
    gsap.to(o, {v:end, duration:1.4, delay:.15 + Math.floor(i / 5) * .055, ease:"power3.out",
      onUpdate(){ td.textContent = (Math.round(o.v * 2) / 2).toFixed(1); },
      onComplete(){ td.textContent = end.toFixed(1); }});
  });
}});
if (fine){
  const peek = $(".peek"), pimg = $(".peek img"), body = $("#resBody");
  gsap.set(peek, {scale:.85, transformOrigin:"0% 50%"});
  const px = gsap.quickTo(peek, "x", {duration:.6, ease:"power3"});
  const py = gsap.quickTo(peek, "y", {duration:.6, ease:"power3"});
  const pr = gsap.quickTo(peek, "rotation", {duration:.8, ease:"power3"});
  let lx = 0;
  body.addEventListener("mousemove", e => { px(e.clientX + 28); py(e.clientY - 150); pr(gsap.utils.clamp(-8, 8, (e.clientX - lx) * .6)); lx = e.clientX; });
  body.addEventListener("mouseover", e => {
    const tr = e.target.closest("tr"), b = tr && tr.querySelector(".sname"); if (!b) return;
    if (pimg.getAttribute("src") !== b.dataset.img) pimg.src = b.dataset.img;
    gsap.to(peek, {autoAlpha:1, scale:1, duration:.5, ease:"power3.out"});
  });
  body.addEventListener("mouseleave", () => gsap.to(peek, {autoAlpha:0, scale:.85, duration:.4, ease:"power2.out"}));
  addEventListener("scroll", () => gsap.to(peek, {autoAlpha:0, duration:.3}), {passive:true});
}

/* ================= KITOB: scroll bilan varaqlanadi ================= */
if (cv){
  const caps = $$(".books__cap");
  gsap.set(caps, {autoAlpha:0, y:40});
  gsap.set(caps[0], {autoAlpha:1, y:0});
  const fr = {f:0};
  const tl = gsap.timeline({defaults:{ease:"none"},
    scrollTrigger:{trigger:".books", start:"top top", end:"+=260%", pin:".books__pin", scrub:.5, anticipatePin:1,
      onEnter: loadFrames, onEnterBack: loadFrames}});
  tl.to(fr, {f:FRAMES - 1, duration:4, onUpdate(){ drawFrame(fr.f); }}, 0)
    .to(".books__prog i", {scaleX:1, duration:4}, 0);
  caps.forEach((c, i) => {
    if (i === 0) return;
    const at = i * .95;
    tl.to(caps[i - 1], {autoAlpha:0, y:-40, duration:.22, ease:"power2.in"}, at - .12)
      .to(c, {autoAlpha:1, y:0, duration:.3, ease:"power2.out"}, at + .08);
  });
  gsap.from(".books__in .kicker", {opacity:0, y:20, duration:1, scrollTrigger:{trigger:".books", start:"top 70%", once:true}});
}

/* ================= BOBLAR: ustma-ust siljish ================= */
const chaps = $$(".chap");
mm.add("(min-width: 861px)", () => {
  chaps.forEach((c, i) => {
    ScrollTrigger.create({trigger:c, start:"top top", end: i === chaps.length - 1 ? "+=60%" : "bottom top", pin:true, pinSpacing: i === chaps.length - 1});
    if (i < chaps.length - 1){
      gsap.to(c.querySelector(".chap__in"), {scale:.9, opacity:.25, yPercent:-6, ease:"none",
        scrollTrigger:{trigger:chaps[i + 1], start:"top bottom", end:"top top", scrub:true}});
    }
    const t = c.querySelector(".chap__text"), m = c.querySelector(".chap__media");
    gsap.timeline({scrollTrigger:{trigger:c, start:"top 65%", once:true}})
      .from(t.children, {y:60, opacity:0, duration:1.3, stagger:.1})
      .from(m, {clipPath:"inset(100% 0% 0% 0%)", duration:1.5, ease:"expo.inOut"}, 0)
      .from(m.querySelector("video"), {scale:1.3, duration:2}, .2);
  });
});
mm.add("(max-width: 860px)", () => {
  chaps.forEach(c => rise([...c.querySelector(".chap__text").children, c.querySelector(".chap__media")], c, {stagger:.1}));
});

/* ---------- Reja ---------- */
rise(".plan__form fieldset", ".plan__form", {stagger:.1});
gsap.from(".plan__out", {y:90, opacity:0, duration:1.5, scrollTrigger:{trigger:".plan__grid", start:"top 82%", once:true}});
const pTotal = $("#pTotal");
let lastTotal = parseInt(pTotal.textContent.replace(/\D/g, "")) || 0, totalTw = null;
function animatePlan(){
  gsap.fromTo("#pRoute li", {x:-18, opacity:0}, {x:0, opacity:1, duration:.8, stagger:.06, ease:"expo.out", overwrite:true});
  gsap.fromTo(["#pMonths", "#pFinish"], {yPercent:40, opacity:0}, {yPercent:0, opacity:1, duration:.7, stagger:.05, overwrite:true});
  const txt = pTotal.textContent, to = parseInt(txt.replace(/\D/g, "")) || 0;
  const suf = txt.replace(/^[\d\s  ]+/, "");
  const o = {v:lastTotal}; lastTotal = to;
  if (totalTw) totalTw.kill();
  totalTw = gsap.to(o, {v:to, duration:1, ease:"power3.out",
    onUpdate(){ pTotal.textContent = `${(Math.round(o.v / 1000) * 1000).toLocaleString("ru-RU").replace(/[\s,  ]/g, " ")} ${suf}`; },
    onComplete(){ pTotal.textContent = txt; }});
}
$("#planForm").addEventListener("change", () => requestAnimationFrame(animatePlan));

/* ---------- Narxlar ---------- */
ScrollTrigger.create({trigger:"#priceList", start:"top 85%", once:true, onEnter(){
  gsap.from("#priceList .prow", {y:50, opacity:0, duration:1.2, stagger:.09});
}});

/* ---------- Ustozlar: gorizontal scroll ---------- */
const tgrid = $("#tList"), tbar = $(".teachers__bar i");
mm.add("(min-width: 861px)", () => {
  const dist = () => Math.max(0, tgrid.scrollWidth - innerWidth);
  const skew = gsap.quickTo(tgrid, "skewX", {duration:.5, ease:"power3"});
  const tw = gsap.to(tgrid, {x:() => -dist(), ease:"none",
    scrollTrigger:{trigger:".teachers", start:"top top", end:() => "+=" + dist(), pin:".teachers__pin", scrub:.9,
      invalidateOnRefresh:true, anticipatePin:1,
      onUpdate(s){ tbar.style.setProperty("--p", s.progress.toFixed(3)); skew(gsap.utils.clamp(-5, 5, s.getVelocity() / -450)); },
      onScrubComplete(){ skew(0); }}});
  return () => { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); gsap.set(tgrid, {clearProps:"all"}); };
});
gsap.from("#tList .tcard", {y:80, opacity:0, duration:1.4, stagger:.07, scrollTrigger:{trigger:".teachers", start:"top 65%", once:true}});

/* ---------- Kinoteka va filiallar: niqob ochilishi ---------- */
function maskReveal(boxSel){
  $$(boxSel).forEach((box, i) => {
    const img = box.querySelector("img");
    gsap.timeline({scrollTrigger:{trigger:box, start:"top 90%", once:true}})
      .from(box, {clipPath:"inset(100% 0% 0% 0%)", duration:1.5, ease:"expo.inOut", delay:(i % 3) * .08})
      .from(img, {scale:1.3, duration:2, ease:"expo.out"}, "<.2");
  });
}
maskReveal("#vRow .vthumb__m");
maskReveal("#brList .bcard__m");
rise("#brList .bcard__body", "#brList", {stagger:.12});
mm.add("(min-width: 761px)", () => {
  gsap.to("#vRow .vthumb:nth-child(3n+2)", {y:-70, ease:"none", scrollTrigger:{trigger:"#vRow", start:"top bottom", end:"bottom top", scrub:true}});
  gsap.to("#brList .bcard:nth-child(2)", {y:-60, ease:"none", scrollTrigger:{trigger:"#brList", start:"top bottom", end:"bottom top", scrub:true}});
});
// sichqoncha ustiga kelganda video ovozsiz o'ynaydi
if (fine){
  $("#vRow").addEventListener("mouseover", e => {
    const t = e.target.closest(".vthumb"); if (!t || t.classList.contains("is-playing")) return;
    let v = t.querySelector("video");
    if (!v){ v = document.createElement("video"); v.muted = true; v.loop = true; v.playsInline = true; v.preload = "auto";
      v.src = `media/v/${t.dataset.video}.mp4`; t.querySelector(".vthumb__m").appendChild(v); }
    t.classList.add("is-playing"); v.play().catch(()=>{});
  });
  $("#vRow").addEventListener("mouseout", e => {
    const t = e.target.closest(".vthumb"); if (!t || t.contains(e.relatedTarget)) return;
    t.classList.remove("is-playing"); const v = t.querySelector("video"); if (v) setTimeout(() => v.pause(), 600);
  });
}

/* ---------- FAQ: silliq ochilish ---------- */
$$(".faq__list details").forEach(d => {
  const sum = d.querySelector("summary"), body = d.querySelector(".faq__a");
  let busy = false;
  sum.addEventListener("click", e => {
    e.preventDefault(); if (busy) return; busy = true;
    const done = () => { gsap.set(body, {clearProps:"height,opacity"}); busy = false; ScrollTrigger.refresh(); };
    if (d.open) gsap.to(body, {height:0, opacity:0, duration:.55, ease:"power3.inOut", onComplete(){ d.open = false; done(); }});
    else { d.open = true; gsap.fromTo(body, {height:0, opacity:0}, {height:"auto", opacity:1, duration:.75, ease:"expo.out", onComplete:done}); }
  });
});

/* ---------- Footer: ulkan so'z ---------- */
const word = $(".foot__word span");
word.innerHTML = [...word.textContent].map(c => `<span class="ch">${c}</span>`).join("");
gsap.from(".foot__word .ch", {yPercent:105, stagger:.045, ease:"none", scrollTrigger:{trigger:".foot", start:"top 90%", end:"bottom bottom", scrub:.8}});
gsap.from(".foot__grid > *", {y:30, opacity:0, stagger:.08, duration:1.1, scrollTrigger:{trigger:".foot", start:"top 88%", once:true}});

/* ---------- Magnit tugmalar va kursor ---------- */
if (fine){
  $$("[data-magnetic]").forEach(el => {
    const xT = gsap.quickTo(el, "x", {duration:.6, ease:"power3"}), yT = gsap.quickTo(el, "y", {duration:.6, ease:"power3"});
    el.addEventListener("mousemove", e => { const r = el.getBoundingClientRect(); xT((e.clientX - r.left - r.width / 2) * .28); yT((e.clientY - r.top - r.height / 2) * .38); });
    el.addEventListener("mouseleave", () => gsap.to(el, {x:0, y:0, duration:1.1, ease:"elastic.out(1,.4)", overwrite:true}));
  });
  const c = $(".cursor"), lbl = $(".cursor__label");
  const cx = gsap.quickTo(c, "x", {duration:.45, ease:"power3"}), cy = gsap.quickTo(c, "y", {duration:.45, ease:"power3"});
  addEventListener("mousemove", e => { cx(e.clientX); cy(e.clientY); c.classList.add("is-on"); }, {passive:true});
  document.addEventListener("mouseleave", () => c.classList.remove("is-on"));
  document.addEventListener("mouseover", e => {
    const t = e.target.closest("[data-cursor]");
    if (t){ lbl.textContent = (LABEL[t.dataset.cursor] || LABEL.view)[L()]; c.classList.add("is-big"); c.classList.remove("is-link"); return; }
    c.classList.remove("is-big");
    c.classList.toggle("is-link", !!e.target.closest("a, button, label, select, summary, input"));
  });
  $$("dialog").forEach(d => new MutationObserver(() => { c.style.visibility = d.open ? "hidden" : ""; }).observe(d, {attributes:true, attributeFilter:["open"]}));
}

/* ---------- Til almashganda ---------- */
document.addEventListener("ies:render", () => {
  splits.forEach(st => { if (st.tween && st.tween.progress() < 1){ st.stale = true; st.tween.scrollTrigger && st.tween.scrollTrigger.kill(); st.tween.progress(1).kill(); } });
  splits.clear();
  wordScrub(man, man, "top 82%", "bottom 50%");
  if (!resultsPlayed) gsap.set("#resBody tr", {clearProps:"all"});
  lastTotal = parseInt(pTotal.textContent.replace(/\D/g, "")) || 0;
  ScrollTrigger.refresh();
});

addEventListener("load", () => ScrollTrigger.refresh());
if (new URLSearchParams(location.search).has("shot")) intro.progress(1);
};
Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 1500))]).then(start);
})();
