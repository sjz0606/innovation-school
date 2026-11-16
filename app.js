(() => {
"use strict";

/* ---------- Sozlama ---------- */
// Arizalar serveri (tg-lead) manzili index.html dagi <meta name="lead-endpoint"> da. Bo'sh bo'lsa, ariza faqat ekranda ko'rsatiladi.
const FORM_ENDPOINT = document.querySelector('meta[name="lead-endpoint"]')?.content
  || (location.hostname === "127.0.0.1" && new URLSearchParams(location.search).get("api")) || "";

/* ---------- Ma'lumotlar (innovationschool.uz va Instagram'dan) ---------- */
const LEVELS = ["Beginner","Elementary","Pre-Intermediate","Intermediate","Upper-Intermediate"];
const PRICE = { ge:820000, ielts:850000, int:1300000, ind:3000000 };
const MONTHS = { ge:3, int:1.5, ielts:5 };

const RESULTS = [
  {id:"shahnoza", n:"Umarova Shahnoza",        b:[9.0,8.0,7.0,7.0]},
  {id:"dilnoza",  n:"Muhammadova Dilnoza",     b:[9.0,8.5,6.5,7.0]},
  {id:"sarvinoz", n:"Saidakmedova Sarvinoz",   b:[9.0,8.5,7.0,7.5]},
  {id:"soliha",   n:"Ibragimova Soliha",       b:[9.0,8.0,7.0,7.5]},
  {id:"donyorbek",n:"Urodullyev Donyorbek",    b:[8.5,7.0,6.5,7.5]},
  {id:"madinaxon",n:"Yuldasheva Madinaxon",    b:[9.0,8.5,6.0,7.0]},
  {id:"sevinch",  n:"Khudoyberganova Sevinch", b:[8.0,7.5,7.5,7.0]},
  {id:"diyora",   n:"Omonjonova Diyora",       b:[8.0,8.5,7.0,6.5]},
  {id:"dildora",  n:"Nasrullaeva Dildora",     b:[8.0,7.0,7.0,7.0]},
  {id:"qobiljon", n:"Bobojonov Qobiljon",      b:[8.5,8.5,6.5,7.0]}
];

const TEACHERS = [
  {id:"abdulvoris", n:"Mr. Abdulvoris", exp:10, stu:1000, tr:{uz:"Mas'uliyatli",ru:"Ответственный"}},
  {id:"abdulvadud", n:"Abdulvadud Abdualiev", exp:9, stu:1000, tr:{uz:"Talabchan",ru:"Требовательный"}, cert:"CELTA"},
  {id:"ezoza",      n:"Miss Ezoza", exp:7, stu:1000, tr:{uz:"Intizomli",ru:"Дисциплинированная"}, cert:"C1 CEFR"},
  {id:"dildora",    n:"Miss Dildora", exp:6, stu:1500, tr:{uz:"Xushchaqchaq",ru:"Жизнерадостная"}},
  {id:"jamshid",    n:"Mr. Jamshid", exp:5, stu:600, tr:{uz:"Perfeksionist",ru:"Перфекционист"}},
  {id:"abbos",      n:"Mr. Abbos", exp:5, stu:500, tr:{uz:"Xarizmatik",ru:"Харизматичный"}, cert:"UzSWLU"},
  {id:"sanjar",     n:"Mr. Sanjar", exp:4, stu:1000, tr:{uz:"Moslashuvchan",ru:"Гибкий"}},
  {id:"dilshod",    n:"Mr. Dilshod", exp:4, stu:800, tr:{uz:"Sabr-toqatli",ru:"Терпеливый"}},
  {id:"marjona",    n:"Miss Marjona", exp:4, stu:650, tr:{uz:"Mehribon",ru:"Заботливая"}},
  {id:"faridun",    n:"Mr. Faridun", exp:3, stu:600, tr:{uz:"Talabchan",ru:"Требовательный"}}
];

const BRANCHES = [
  {n:"Chilonzor", img:"media/img/branch-chilonzor.webp",
   addr:{uz:"Toshkent, Chilonzor tumani, metro yonida",ru:"Ташкент, Чиланзарский район, у метро"},
   gq:"https://www.google.com/maps/search/?api=1&query=41.2712352,69.2017562",
   y:"https://yandex.uz/maps/org/innovation_english_school/194217131792/"},
  {n:"Qoraqamish", img:"media/img/branch-qoraqamish.webp",
   addr:{uz:"Toshkent, Olmazor tumani, Qoraqamish 2/4, Tansiqboyev bozori oldi",ru:"Ташкент, Алмазарский район, Каракамыш 2/4, у рынка Тансыкбаева"},
   gq:"https://maps.app.goo.gl/zZd58nZMKf3rwGmL6",
   y:"https://yandex.uz/maps/-/CTRUnBoQ"}
];
// 2GIS: innovationschool.uz'da ikkala filialga bir xil havola qo'yilgan, shuning uchun qo'shilmadi.

const VIDEOS = ["dars","muhit","savol-javob","ustozlar","dastur","speaking"];

const TEST = [
  {q:"She ___ a student.", o:["am","is","are","be"], a:1},
  {q:"I ___ coffee every morning.", o:["drink","drinks","drinking","am drink"], a:0},
  {q:"There ___ two books on the table.", o:["is","be","are","am"], a:2},
  {q:"We ___ to the cinema yesterday.", o:["go","went","gone","goes"], a:1},
  {q:"My brother is ___ than me.", o:["tall","tallest","more tall","taller"], a:3},
  {q:"I have lived in Tashkent ___ 2019.", o:["since","for","from","at"], a:0},
  {q:"If it rains tomorrow, we ___ at home.", o:["stay","would stay","will stay","stayed"], a:2},
  {q:"The letter ___ by my grandmother last week.", o:["wrote","was written","has written","is writing"], a:1},
  {q:"I'm not used to ___ up so early.", o:["get","got","be getting","getting"], a:3},
  {q:"If I ___ you, I would accept the offer.", o:["am","were","will be","be"], a:1},
  {q:"Hardly ___ the station when the train left.", o:["I had reached","I reached","had I reached","did I reached"], a:2},
  {q:"The new policy had a significant ___ on sales.", o:["affect","effort","afford","effect"], a:3}
];

/* ---------- Yordamchilar ---------- */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
let lang = localStorage.getItem("ies_lang") || "uz";
const D = () => window.DYN[lang];
const fmt = n => Math.round(n).toLocaleString("ru-RU").replace(/ |,/g, " ");
const sum = n => `${fmt(n)} ${D().som}`;
const bandStr = x => x.toFixed(1);
// Rasmiy IELTS yaxlitlash: .25 -> .5, .75 -> keyingi butun
function overall(b){
  const avg = b.reduce((a,c)=>a+c,0)/4;
  const f = avg - Math.floor(avg);
  const r = f < .25 ? Math.floor(avg) : f < .75 ? Math.floor(avg)+.5 : Math.ceil(avg);
  return {avg, r};
}

/* ---------- Til ---------- */
const UZ = {};
$$("[data-i18n]").forEach(el => UZ[el.dataset.i18n] = el.innerHTML);
function applyLang(){
  document.documentElement.lang = lang;
  const dict = lang === "ru" ? window.I18N_RU : UZ;
  $$("[data-i18n]").forEach(el => { const v = dict[el.dataset.i18n]; if (v) el.innerHTML = v; });
  $$(".lang button").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang));
  renderAll();
}
$$(".lang button").forEach(b => b.addEventListener("click", () => {
  lang = b.dataset.lang; localStorage.setItem("ies_lang", lang); applyLang();
}));

/* ---------- Reja (asosiy mantiq) ---------- */
let planText = "";
function addMonths(m){
  const d = new Date(); const whole = Math.floor(m);
  d.setMonth(d.getMonth() + whole); if (m % 1) d.setDate(d.getDate() + 15);
  return D().finishFmt(D().months[d.getMonth()], d.getFullYear());
}
function renderPlan(){
  const f = $("#planForm");
  const goal = f.goal.value, level = +f.level.value, pace = f.pace.value;
  const d = D(), steps = [];
  $("#paceSet").disabled = goal === "individual" || (goal === "ielts" && level >= 3);

  if (goal === "individual"){
    $("#pMonths").textContent = d.indMonths;
    $("#pTotal").textContent = `${fmt(PRICE.ind)} / ${d.mo}`;
    $("#pFinish").textContent = "—";
    $("#pRoute").innerHTML = `<li class="is-goal"><div><b>${d.stepIND}</b><small>${d.indStep}</small></div><div class="amt">${sum(PRICE.ind)}<small> · ${d.perMo}</small></div></li>`;
    $("#pNote").textContent = d.indNote;
    planText = `${d.stepIND}, ${LEVELS[level]}`;
    return;
  }
  const fast = pace === "fast";
  const key = fast ? "int" : "ge";
  const lastLevel = goal === "ielts" ? 2 : 4;
  for (let l = level; l <= lastLevel; l++){
    steps.push({ name: `${LEVELS[l]}${d.lvl ? " " + d.lvl : ""}`, course: fast ? d.stepINT : d.stepGE,
      m: MONTHS[key], price: PRICE[key], lessons: fast ? 25 : 13.5 });
  }
  if (goal === "ielts") steps.push({ name: d.stepIELTS, course: d.goalReach, m: MONTHS.ielts, price: PRICE.ielts, lessons: 13.5, goal:true });
  if (goal === "general" && steps.length) steps[steps.length-1].goal = true;

  const months = steps.reduce((a,s)=>a+s.m,0);
  const total = steps.reduce((a,s)=>a+s.m*s.price,0);
  const lessons = steps.reduce((a,s)=>a+s.m*s.lessons,0);
  $("#pMonths").textContent = `${String(months).replace(".", ",")} ${d.mo}`;
  $("#pTotal").textContent = `${(total/1e6).toFixed(2).replace(/\.?0+$/,"").replace(".", ",")} ${d.mln}`;
  $("#pFinish").textContent = addMonths(months);
  $("#pRoute").innerHTML = steps.map(s => `<li class="${s.goal?"is-goal":""}">
      <div><b>${s.name}</b><small>${s.course} · ${String(s.m).replace(".", ",")} ${d.mo} · ≈${Math.round(s.m*s.lessons)} ${d.lessons}</small></div>
      <div class="amt">${sum(s.m*s.price)}<small><br>${fmt(s.price)} / ${d.mo}</small></div></li>`).join("");
  $("#pNote").textContent = (goal === "ielts" ? d.noteIelts : d.noteGen) + ` ≈${Math.round(lessons)} ${d.lessons}.`;
  const paceTxt = steps.some(x=>!x.goal || goal==="general") ? `, ${fast ? d.paceF : d.paceN}` : "";
  planText = `${goal === "ielts" ? "IELTS 7.0+" : "General English"}, ${LEVELS[level]}${paceTxt}: ${String(months).replace(".", ",")} ${d.mo}, ≈${sum(total)}`;
  planCourse = goal === "ielts" ? "IELTS" : (fast ? "Intensive" : "General English");
}
let planCourse = "IELTS";
$("#planForm").addEventListener("change", renderPlan);
$("#pCta").addEventListener("click", () => attachPlan());

/* ---------- Daraja testi ---------- */
const testDlg = $("#testDlg");
let tI = 0, tScore = 0;
function testIntro(){
  const d = D();
  $("#testBody").innerHTML = `<h3>${d.testTitle}</h3>
    <p style="margin:12px 0 22px;color:var(--muted)">${d.testIntro}</p>
    <button class="btn btn--yellow" type="button" id="tStart">${d.testStart}</button>`;
  $("#tStart").onclick = () => { tI = 0; tScore = 0; testQ(); };
}
function testQ(){
  const d = D(), q = TEST[tI];
  $("#testBody").innerHTML = `<div class="qhead"><span>${d.testOf(tI+1, TEST.length)}</span></div>
    <div class="qbar"><i style="width:${tI/TEST.length*100}%"></i></div>
    <p class="qtext">${q.q.replace("___","<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u>")}</p>
    <div class="qopts">${q.o.map((o,i)=>`<button type="button" data-i="${i}">${o}</button>`).join("")}</div>`;
  $$(".qopts button", testDlg).forEach(b => b.onclick = () => {
    if (+b.dataset.i === q.a) tScore++;
    tI++; tI < TEST.length ? testQ() : testRes();
  });
  $(".qopts button", testDlg).focus();
}
function testRes(){
  const d = D();
  const lvl = tScore <= 3 ? 0 : tScore <= 5 ? 1 : tScore <= 7 ? 2 : tScore <= 9 ? 3 : 4;
  $("#testBody").innerHTML = `<div class="qres"><p>${d.testRes}</p><h3>${LEVELS[lvl]}</h3>
    <p>${d.testScore(tScore, TEST.length)} ${d.testNote}</p>
    <button class="btn btn--yellow" type="button" id="tUse">${d.testUse}</button></div>`;
  $("#tUse").onclick = () => {
    $(`#levelChips input[value="${lvl}"]`).checked = true;
    renderPlan(); testDlg.close();
    $("#planOut").scrollIntoView({behavior:"smooth", block:"center"});
  };
}
$("#openTest").addEventListener("click", () => { testIntro(); testDlg.showModal(); });

/* ---------- Narxlar ---------- */
function renderPrices(){
  const d = D();
  const rows = [
    {t:"IELTS", note:d.pnIELTS, dur:d.durIELTS, les:"13–14", p:PRICE.ielts, total:PRICE.ielts*5, tl:d.fullCourse, main:true, c:"IELTS"},
    {t:"General English", note:d.pnGE, dur:d.durGE, les:"13–14", p:PRICE.ge, total:PRICE.ge*3, tl:d.perLevel, c:"General English"},
    {t:"Intensive", note:d.pnINT, dur:d.durINT, les:"24–26", p:PRICE.int, total:PRICE.int*1.5, tl:d.perLevel, c:"Intensive"},
    {t:"Individual", note:d.pnIND, dur:d.durIND, les:"13–14", p:PRICE.ind, total:0, c:"Individual"}
  ];
  $("#priceList").innerHTML = `<div class="prow prow--head"><span>${d.thCourse}</span><span>${d.thDur}</span><span>${d.thLes}</span><span>${d.thMonth}</span><span></span></div>` +
  rows.map(r => `<div class="prow ${r.main?"prow--main":""}">
    <div><h3>${r.t}</h3><p>${r.note}</p></div>
    <div class="pv"><span class="k">${d.thDur}</span>${r.dur}</div>
    <div class="pv"><span class="k">${d.thLes}</span>${r.les}</div>
    <div class="pm"><span class="k">${d.thMonth}</span>${fmt(r.p)} ${d.som}${r.total?`<small>${r.tl}: ${sum(r.total)}</small>`:""}</div>
    <a class="btn ${r.main?"btn--yellow":"btn--line"} btn--sm" href="#ariza" data-course="${r.c}">${d.choose}</a>
  </div>`).join("");
  $$("#priceList [data-course]").forEach(a => a.addEventListener("click", () => { $("#fCourse").value = a.dataset.course; }));
}

/* ---------- Natijalar: ball varag'i ---------- */
function renderResults(){
  const d = D();
  $("#resBody").innerHTML = RESULTS.map(r => {
    const o = overall(r.b); const [fam, first] = r.n.split(" ");
    return `<tr><th scope="row" class="sheet__name"><button type="button" class="sname" data-img="media/r/${r.id}.webp" aria-label="${r.n}: ${d.seeCert}"><span>${first}</span><small>${fam}</small></button></th>
      ${r.b.map(x=>`<td>${bandStr(x)}</td>`).join("")}<td class="sheet__ov">${bandStr(o.r)}</td></tr>`;
  }).join("");
  const avg = i => (RESULTS.reduce((a,r)=>a+r.b[i],0)/RESULTS.length).toFixed(1);
  const ovAvg = (RESULTS.reduce((a,r)=>a+overall(r.b).r,0)/RESULTS.length).toFixed(2);
  $("#resAvg").innerHTML = `<th scope="row" class="sheet__name">${d.resAvg}</th>${[0,1,2,3].map(i=>`<td>${avg(i)}</td>`).join("")}<td class="sheet__ov">${ovAvg}</td>`;
  $$("#resBody .sname").forEach(b => b.addEventListener("click", () => openMedia(`<img src="${b.dataset.img}" alt="IELTS Test Report Form">`)));
}

/* ---------- IELTS kalkulyator (jadvalning oxirgi qatori) ---------- */
const calcVals = [7.0, 7.0, 6.5, 7.0];
function buildCalc(){
  const opts = []; for (let v = 9; v >= 3; v -= .5) opts.push(v);
  const names = ["Listening","Reading","Writing","Speaking"];
  $("#kalkulyator").insertAdjacentHTML("beforeend", names.map((k,i)=>
    `<td><select data-i="${i}" aria-label="${k}">${opts.map(v=>`<option ${v===calcVals[i]?"selected":""}>${bandStr(v)}</option>`).join("")}</select></td>`).join("") +
    `<td class="sheet__ov" id="calcOverall" aria-live="polite">7.0</td>`);
  $$("#kalkulyator select").forEach(s => s.addEventListener("change", () => { calcVals[+s.dataset.i] = +s.value; renderCalc(); }));
}
function renderCalc(){
  const d = D(), o = overall(calcVals);
  $("#calcOverall").textContent = bandStr(o.r);
  $("#calcMsg").textContent = `${d.avg} ${o.avg.toFixed(2)}. ` + (o.r >= 7 ? d.calcOk : d.calcLeft(bandStr(7 - o.r)));
}

/* ---------- Ustozlar ---------- */
function renderTeachers(){
  const d = D();
  $("#tList").innerHTML = TEACHERS.map(t => `<button type="button" class="tcard" data-id="${t.id}">
    <span class="tcard__ph"><img src="media/tp/${t.id}.webp" alt="${t.n}" loading="lazy" width="520" height="520"></span>
    <h3>${t.n}</h3>
    <p>${t.exp} ${d.exp}, ${fmt(t.stu)}+ ${d.stu}${t.cert?`<br>${t.cert}`:""}</p>
  </button>`).join("");
  $$("#tList .tcard").forEach(b => b.addEventListener("click", () => openMedia(`<img src="media/t/${b.dataset.id}.webp" alt="">`)));
}

/* ---------- Videolar ---------- */
function renderVideos(){
  const d = D();
  $("#vRow").innerHTML = VIDEOS.map(v => `<button type="button" class="vthumb" data-video="${v}">
    <img src="media/v/${v}.jpg" alt="" loading="lazy"><span>${d.vids[v]}</span></button>`).join("");
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-video]"); if (!b) return;
  openMedia(`<video src="media/v/${b.dataset.video}.mp4" controls autoplay playsinline></video>`);
});

/* ---------- Filiallar: jonli holat (Toshkent vaqti) ---------- */
function tashkentNow(){
  const p = new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Tashkent",weekday:"short",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(new Date());
  const g = t => p.find(x=>x.type===t).value;
  const wd = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(g("weekday"));
  return {wd, min: (+g("hour"))%24*60 + (+g("minute"))};
}
function branchStatus(){
  const d = D(), {wd, min} = tashkentNow();
  const work = wd >= 1 && wd <= 6;
  if (work && min >= 540 && min < 1230) return {open:true, txt:d.open("20:30")};
  let when;
  if (work && min < 540) when = d.today;
  else if (wd === 6 || wd === 0) when = wd === 0 ? d.tomorrow : d.monday;
  else when = d.tomorrow;
  return {open:false, txt:d.closedTil(when)};
}
function renderBranches(){
  const d = D(), s = branchStatus();
  $("#brList").innerHTML = BRANCHES.map(b => `<article class="bcard">
    <img src="${b.img}" alt="${b.n}" loading="lazy">
    <div class="bcard__body">
      <h3>${b.n}</h3>
      <span class="status ${s.open?"is-open":""}">${s.txt}</span>
      <p class="bcard__addr">${b.addr[lang]}</p>
      <p class="bcard__am">${d.days}<br>${d.amen}</p>
      <div class="bcard__maps">
        <a href="${b.gq}" target="_blank" rel="noopener">Google Maps</a>
        <a href="${b.y}" target="_blank" rel="noopener">Yandex</a>
        ${b.t?`<a href="${b.t}" target="_blank" rel="noopener">2GIS</a>`:""}
      </div>
    </div></article>`).join("");
}
setInterval(renderBranches, 60000);

/* ---------- Ariza ---------- */
function attachPlan(){
  $("#fCourse").value = planCourse;
  if ($("#planForm").goal.value === "individual") $("#fCourse").value = "Individual";
  const v = $("#fPlanView"); v.hidden = false;
  v.textContent = `${D().planAttached} ${planText}`;
  v.dataset.plan = planText;
}
const form = $("#leadForm");
form.phone.addEventListener("input", e => {
  const x = e.target.value.replace(/\D/g,"").replace(/^998/,"").slice(0,9);
  e.target.value = [x.slice(0,2),x.slice(2,5),x.slice(5,7),x.slice(7,9)].filter(Boolean).join(" ");
});
form.addEventListener("submit", async e => {
  e.preventDefault();
  const d = D(), err = $("#fErr");
  const name = form.name.value.trim(), phone = form.phone.value.replace(/\D/g,"");
  err.hidden = true;
  if (name.length < 2){ err.textContent = d.errName; err.hidden = false; form.name.focus(); return; }
  if (phone.length !== 9){ err.textContent = d.errPhone; err.hidden = false; form.phone.focus(); return; }
  const username = form.username.value.trim().replace(/^@/, "");
  if (username && !/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(username)){ err.textContent = d.errUser; err.hidden = false; form.username.focus(); return; }
  if (!form.consent.checked){ err.textContent = d.errConsent; err.hidden = false; form.consent.focus(); return; }
  const lead = { name, phone:"+998"+phone, username, course:form.course.value, branch:form.branch.value,
    time:form.time.value, plan:$("#fPlanView").dataset.plan || "", lang, consent:true,
    website: form.website.value, ts:new Date().toISOString() };
  try { localStorage.setItem("ies_lead", JSON.stringify(lead)); } catch {}

  // Serverga yuborish. Yuborilmasa "qabul qilindi" demaymiz, qo'ng'iroq qilishni so'raymiz.
  let state = "local";
  if (FORM_ENDPOINT){
    const btn = form.querySelector("[type=submit]"), label = btn.textContent;
    btn.disabled = true; btn.textContent = d.sending;
    try {
      const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), 12000);
      const r = await fetch(FORM_ENDPOINT, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(lead), signal:ctrl.signal});
      clearTimeout(tm);
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) state = j.telegram ? "tg" : "sent";
      else if (r.status === 429) state = "rate";
      else if (j.error === "phone"){ err.textContent = d.errPhone; err.hidden = false; return; }
      else state = "fail";
    } catch { state = "fail"; }
    finally { btn.disabled = false; btn.textContent = label; }
  }
  $("#doneTitle").textContent = d.doneTitle[state];
  $("#doneText").textContent = d.doneText[state];
  const courseLabel = form.course.selectedOptions[0].textContent;
  const msg = [d.msgHead, `${d.mName}: ${name}`, `${d.mPhone}: +998 ${form.phone.value}`, `${d.mCourse}: ${courseLabel}`,
    `${d.mBranch}: ${form.branch.selectedOptions[0].textContent}`, `${d.mTime}: ${d.times[lead.time]}`,
    lead.plan ? `${d.mPlan}: ${lead.plan}` : ""].filter(Boolean).join("\n");
  $("#doneMsg").textContent = msg;
  form.hidden = true; $("#leadDone").hidden = false;
  $("#leadDone").focus();
});
$("#copyMsg").addEventListener("click", async e => {
  try { await navigator.clipboard.writeText($("#doneMsg").textContent); e.target.textContent = D().copied; } catch {}
});
$("#newLead").addEventListener("click", () => { form.reset(); form.hidden = false; $("#leadDone").hidden = true; $("#fPlanView").hidden = true; delete $("#fPlanView").dataset.plan; });

/* ---------- Media oynasi ---------- */
const mediaDlg = $("#mediaDlg");
function openMedia(html){ $("#mediaBody").innerHTML = html; mediaDlg.showModal(); }
mediaDlg.addEventListener("close", () => { $("#mediaBody").innerHTML = ""; });
$$("dialog").forEach(dl => {
  dl.addEventListener("click", e => { if (e.target === dl || e.target.closest("[data-close]")) dl.close(); });
});

/* ---------- Ishga tushirish ---------- */
function renderAll(){
  renderPlan(); renderPrices(); renderResults(); renderCalc(); renderTeachers(); renderVideos(); renderBranches();
}
buildCalc();
applyLang();

/* ---------- Navigatsiya ---------- */
const nav = $("#nav"), mbar = $(".mbar");
function isInView(el){ const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }
function onScroll(){
  nav.classList.toggle("is-solid", scrollY > $(".hero").offsetHeight - 80);
  mbar.classList.toggle("is-on", scrollY > 520 && !isInView($("#ariza")));
}
addEventListener("scroll", onScroll, {passive:true}); onScroll();
const links = $$(".top__links a");
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
}), {rootMargin:"-45% 0px -50% 0px"});
links.forEach(a => { const s = $(a.getAttribute("href")); if (s) io.observe(s); });

if (new URLSearchParams(location.search).has("shot")) { $$("video").forEach(v => v.pause()); }
})();
