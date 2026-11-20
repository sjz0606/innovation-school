/* Innovation English School: harakatlar (GSAP + ScrollTrigger + SplitText + Lenis).
   Mantiq app.js'da; bu fayl faqat ko'rinish. Kutubxona yuklanmasa yoki
   "kamroq harakat" yoqilgan bo'lsa, sayt harakatsiz to'liq ishlaydi. */
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
}), {rootMargin:"120px"});
$$("video[autoplay]").forEach(v => vio.observe(v));

if (reduce || !window.gsap || !window.ScrollTrigger || !window.SplitText){ ready(); return; }
gsap.registerPlugin(ScrollTrigger, SplitText);
gsap.defaults({ease:"expo.out", duration:1.1});
const mm = gsap.matchMedia();

const start = () => {
/* ---------- Silliq scroll ---------- */
let lenis = null;
if (window.Lenis){
  lenis = new Lenis({lerp:.095, anchors:{offset:-80}, autoRaf:false});
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

/* ---------- Sarlavhalar: qator-qator niqobdan ko'tariladi ---------- */
const splits = new Map();
function splitHead(el, opts = {}){
  const split = SplitText.create(el, {type:"lines", mask:"lines", linesClass:"ln"});
  const st = {split, stale:false};
  const vars = {yPercent:112, duration:1.35, stagger:.1, ease:"expo.out",
    onComplete(){ if (!st.stale) split.revert(); }};
  if (opts.now) vars.paused = false;
  else vars.scrollTrigger = {trigger:el, start:"top 88%", once:true};
  st.tween = gsap.from(split.lines, vars);
  splits.set(el, st);
  return st.tween;
}

/* ---------- So'zlar: scroll bilan "yonadi" ---------- */
const wordTweens = new Map();
function wordScrub(el, trigger, start = "top 80%", end = "bottom 45%"){
  const old = wordTweens.get(el); if (old){ old.scrollTrigger && old.scrollTrigger.kill(); old.kill(); }
  const split = SplitText.create(el, {type:"words", wordsClass:"w"});
  const tw = gsap.fromTo(split.words, {opacity:.14}, {opacity:1, ease:"none", stagger:.08, duration:1,
    scrollTrigger:{trigger: trigger || el, start, end, scrub:.6}});
  wordTweens.set(el, tw);
  return tw;
}

/* ---------- HERO: yuklanganda bir marta (loader yo'q) ---------- */
const h1 = $(".hero__h1");
const frame = $(".hero__frame");
const intro = gsap.timeline({defaults:{ease:"expo.out"}});
intro
  .from(".hero__kicker", {y:20, opacity:0, duration:1}, .1)
  .add(splitHead(h1, {now:true}), .15)
  .from(frame, {clipPath:"inset(100% 0% 0% 0%)", duration:1.6, ease:"expo.inOut"}, .1)
  .from(".hero__frame video", {scale:1.35, duration:2.2}, .3)
  .from([".hero__lead", ".hero__cta > *"], {y:28, opacity:0, stagger:.08, duration:1.2}, .75)
  .from(".hero__cap", {opacity:0, duration:1}, 1.2)
  .from(".hero__bar > *", {y:14, opacity:0, stagger:.06, duration:1}, 1.1);
ready();

const heroST = {trigger:".hero", start:"top top", end:"bottom top", scrub:true};
gsap.to(".hero__copy", {yPercent:-14, opacity:.25, ease:"none", scrollTrigger:heroST});
gsap.to(".hero__media", {yPercent:18, ease:"none", scrollTrigger:{...heroST}});

/* ---------- Boshqa sarlavhalar ---------- */
$$("[data-split]").forEach(el => { if (el !== h1) splitHead(el); });

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
rise(".how__side .kicker, .how__count, .how__video", ".how__side");
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
  gsap.to(o, {v:n, duration:2.2, ease:"power3.out",
    scrollTrigger:{trigger:b, start:"top 90%", once:true},
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
// TRF varag'i kursor ortidan suzadi
if (fine){
  const peek = $(".peek"), pimg = $(".peek img"), body = $("#resBody");
  gsap.set(peek, {scale:.85, transformOrigin:"0% 50%"});
  const px = gsap.quickTo(peek, "x", {duration:.6, ease:"power3"});
  const py = gsap.quickTo(peek, "y", {duration:.6, ease:"power3"});
  const pr = gsap.quickTo(peek, "rotation", {duration:.8, ease:"power3"});
  let lx = 0;
  body.addEventListener("mousemove", e => {
    px(e.clientX + 28); py(e.clientY - 150); pr(gsap.utils.clamp(-8, 8, (e.clientX - lx) * .6)); lx = e.clientX;
  });
  body.addEventListener("mouseover", e => {
    const tr = e.target.closest("tr"), b = tr && tr.querySelector(".sname"); if (!b) return;
    if (pimg.getAttribute("src") !== b.dataset.img) pimg.src = b.dataset.img;
    gsap.to(peek, {autoAlpha:1, scale:1, duration:.5, ease:"power3.out"});
  });
  body.addEventListener("mouseleave", () => gsap.to(peek, {autoAlpha:0, scale:.85, duration:.4, ease:"power2.out"}));
  addEventListener("scroll", () => gsap.to(peek, {autoAlpha:0, duration:.3}), {passive:true});
}

/* ---------- Ikki ustoz: pin + so'zlar ---------- */
const bandBig = $(".band__big");
mm.add("(min-width: 761px)", () => {
  const split = SplitText.create(bandBig, {type:"words", wordsClass:"w"});
  const tl = gsap.timeline({scrollTrigger:{trigger:".band", start:"top top", end:"+=140%", pin:".band__pin", scrub:.8, anticipatePin:1}});
  tl.fromTo(".band__vid--a", {yPercent:60, rotation:-4}, {yPercent:-40, rotation:2, ease:"none", duration:1}, 0)
    .fromTo(".band__vid--b", {yPercent:-50, rotation:4}, {yPercent:40, rotation:-2, ease:"none", duration:1}, 0)
    .fromTo(".band__vid video", {scale:1.25}, {scale:1, ease:"none", duration:1}, 0)
    .from(".band__text .kicker", {opacity:0, y:20, duration:.15}, 0)
    .fromTo(split.words, {opacity:.12, yPercent:20}, {opacity:1, yPercent:0, stagger:.08, duration:.25, ease:"power2.out"}, .05)
    .from(".band__small", {opacity:0, y:30, duration:.2}, .5);
  return () => split.revert();
});
mm.add("(max-width: 760px)", () => { wordScrub(bandBig, ".band", "top 70%", "center 50%"); });

/* ---------- Qanday o'qitamiz: faol band va hisoblagich ---------- */
const items = $$(".how__item"), cur = $(".how__cur");
mm.add("(min-width: 861px)", () => {
  gsap.set(items, {opacity:.25});
  let active = -1;
  const setActive = i => {
    if (i === active) return; const dir = i > active ? 1 : -1; active = i;
    items.forEach((it, k) => gsap.to(it, {opacity:k === i ? 1 : .25, duration:.6, ease:"power2.out", overwrite:true}));
    gsap.timeline()
      .to(cur, {yPercent:-60 * dir, opacity:0, duration:.25, ease:"power2.in"})
      .add(() => { cur.textContent = String(i + 1).padStart(2, "0"); })
      .fromTo(cur, {yPercent:60 * dir, opacity:0}, {yPercent:0, opacity:1, duration:.6, ease:"expo.out"});
  };
  items.forEach((it, i) => ScrollTrigger.create({trigger:it, start:"top 62%", end:"bottom 62%",
    onToggle:s => s.isActive && setActive(i)}));
  setActive(0);
  return () => gsap.set(items, {clearProps:"opacity"});
});
mm.add("(max-width: 860px)", () => { rise(items, ".how__list", {stagger:.1}); });

/* ---------- Reja: natija paneli jonli o'zgaradi ---------- */
rise(".plan__form fieldset", ".plan__form", {stagger:.1});
gsap.from(".plan__out", {y:90, opacity:0, duration:1.5, scrollTrigger:{trigger:".plan__grid", start:"top 82%", once:true}});
const pTotal = $("#pTotal");
let lastTotal = parseInt(pTotal.textContent.replace(/\D/g, "")) || 0;
let totalTw = null;
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

/* ---------- Ustozlar: gorizontal scroll (desktop) ---------- */
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

/* ---------- Media: niqob ochilishi + parallaks ---------- */
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

/* ---------- FAQ: silliq ochilish ---------- */
$$(".faq__list details").forEach(d => {
  const sum = d.querySelector("summary"), body = d.querySelector(".faq__a");
  let busy = false;
  sum.addEventListener("click", e => {
    e.preventDefault(); if (busy) return; busy = true;
    const done = () => { gsap.set(body, {clearProps:"height,opacity"}); busy = false; ScrollTrigger.refresh(); };
    if (d.open){
      gsap.to(body, {height:0, opacity:0, duration:.55, ease:"power3.inOut", onComplete(){ d.open = false; done(); }});
    } else {
      d.open = true;
      gsap.fromTo(body, {height:0, opacity:0}, {height:"auto", opacity:1, duration:.75, ease:"expo.out", onComplete:done});
    }
  });
});

/* ---------- Footer: ulkan so'z harfma-harf ---------- */
const word = $(".foot__word span");
word.innerHTML = [...word.textContent].map(c => `<span class="ch">${c}</span>`).join("");
gsap.from(".foot__word .ch", {yPercent:105, stagger:.045, ease:"none",
  scrollTrigger:{trigger:".foot", start:"top 90%", end:"bottom bottom", scrub:.8}});
gsap.from(".foot__grid > *", {y:30, opacity:0, stagger:.08, duration:1.1, scrollTrigger:{trigger:".foot", start:"top 88%", once:true}});

/* ---------- Magnit tugmalar va kursor (faqat sichqoncha) ---------- */
if (fine){
  $$("[data-magnetic]").forEach(el => {
    const xT = gsap.quickTo(el, "x", {duration:.6, ease:"power3"}), yT = gsap.quickTo(el, "y", {duration:.6, ease:"power3"});
    el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect();
      xT((e.clientX - r.left - r.width / 2) * .28); yT((e.clientY - r.top - r.height / 2) * .38);
    });
    el.addEventListener("mouseleave", () => { gsap.to(el, {x:0, y:0, duration:1.1, ease:"elastic.out(1,.4)", overwrite:true}); });
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
  $$("dialog").forEach(d => new MutationObserver(() => { c.style.visibility = d.open ? "hidden" : ""; })
    .observe(d, {attributes:true, attributeFilter:["open"]}));
}

/* ---------- Til almashganda (app.js qayta chizadi) ---------- */
document.addEventListener("ies:render", () => {
  splits.forEach(st => {   // matn almashdi: eski bo'linishni qaytarmaymiz, darhol ko'rsatamiz
    if (st.tween && st.tween.progress() < 1){ st.stale = true; st.tween.scrollTrigger && st.tween.scrollTrigger.kill(); st.tween.progress(1).kill(); }
  });
  splits.clear();
  wordScrub(man, man, "top 82%", "bottom 50%");
  if (innerWidth <= 760) wordScrub(bandBig, ".band", "top 70%", "center 50%");
  if (!resultsPlayed) gsap.set("#resBody tr", {clearProps:"all"});
  lastTotal = parseInt(pTotal.textContent.replace(/\D/g, "")) || 0;
  ScrollTrigger.refresh();
});

/* shrift va rasmlar yuklangach o'lchamlarni yangilash */
document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
addEventListener("load", () => ScrollTrigger.refresh());
if (new URLSearchParams(location.search).has("shot")) intro.progress(1);
};
// shriftlar yuklangach bo'lamiz (qatorlar to'g'ri chiqsin), ko'pi bilan 1.5 s kutamiz
Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 1500))]).then(start);
})();
