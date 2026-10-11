import { useState, useEffect, useRef } from "react";


// ── Sound Effects (Web Audio API) ─────────────────────────────
// Persistent unlocked audio context
let _audioCtx = null;
const getAudioCtx = () => {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_audioCtx.state === 'suspended') {
    _audioCtx.resume();
  }
  return _audioCtx;
};

// Unlock audio on first user interaction
const unlockAudio = () => {
  const ctx = getAudioCtx();
  // Play silent buffer to unlock
  const buf = ctx.createBuffer(1, 1, 22050);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(ctx.destination);
  src.start(0);
  document.removeEventListener('touchstart', unlockAudio);
  document.removeEventListener('click', unlockAudio);
};
document.addEventListener('touchstart', unlockAudio);
document.addEventListener('click', unlockAudio);

const fa = (n) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
const LETTERS = ["الف","ب","ج","د"];

const playSound = (type, mutedRef) => {
  if(mutedRef && mutedRef.current) return;
  try {
    const ctx = getAudioCtx();

    if (type === "correct") {
      [523, 659].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq; osc.type = "sine";
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.3);
      });
    }

    if (type === "wrong") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
    }

    if (type === "alarm") {
      [0, 0.3, 0.6].forEach((t) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "square";
        osc.frequency.setValueAtTime(880, ctx.currentTime + t);
        osc.frequency.setValueAtTime(440, ctx.currentTime + t + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + t + 0.28);
        osc.start(ctx.currentTime + t); osc.stop(ctx.currentTime + t + 0.3);
      });
    }

    if (type === "hazard") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine"; osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15);
    }

    if (type === "win") {
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq; osc.type = "sine";
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.3);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.3);
      });
    }

    if (type === "footstep") {
      // Soft boot tap on concrete
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine"; osc.frequency.value = 120;
      filter.type = "lowpass"; filter.frequency.value = 200;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.08);
    }

    if (type === "machine") {
      // Industrial machine hum - low rumble
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
      osc.type = "sawtooth"; osc.frequency.value = 60;
      osc2.type = "square"; osc2.frequency.value = 63;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.5);
      osc2.start(ctx.currentTime); osc2.stop(ctx.currentTime + 0.5);
    }

    if (type === "conveyor") {
      // Belt hum - mid frequency mechanical drone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      osc.type = "sawtooth"; osc.frequency.value = 90;
      filter.type = "bandpass"; filter.frequency.value = 150;
      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6);
    }

    if (type === "clank") {
      // Metal clank - tire station
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "triangle"; osc.frequency.value = 320;
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
    }

    if (type === "weld") {
      // Welding crackle - white noise burst
      const bufferSize = ctx.sampleRate * 0.3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      source.buffer = buffer;
      source.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      filter.type = "highpass"; filter.frequency.value = 2000;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      source.start(ctx.currentTime);
    }

  } catch(e) {}
};

// ── Pixel palette ─────────────────────────────────────────────
const PAL = {
  wall:"#1a1f2e", wallHL:"#252d42",
  floor:"#2a2a2a", floorLine:"#1e1e1e",
  belt:"#111", beltStripe:"#2a2a2a", beltRail:"#555",
  robot:"#0f2035", robotGlow:"#60a5fa",
  paint:"#1a0a2e", paintMist:"#c084fc",
  elec:"#1a1200", elecGlow:"#fbbf24",
  fire:"#1a0000",
  chem:"#0a1a0a", chemGreen:"#4ade80",
  weld:"#1a0f00", weldOrange:"#f97316",
  tire:"#0f0f1a", tireBlue:"#38bdf8",
  body:"#1a1000", bodyYellow:"#eab308",
  lift:"#001a0a", liftGreen:"#86efac",
  exit:"#052e16", fork:"#1a1a00", forkYellow:"#facc15",
  yellow:"#fbbf24", green:"#22c55e", red:"#ef4444",
  blue:"#3b82f6", purple:"#c084fc",
};

const TILE = 36;
const COLS = 14;
const ROWS = 12;

const W=1,F=0,C=2,M=3,P=4,E=5,R=6,X=7,S=8,CH=9,WE=10,TI=11,BO=12,LI=13,FK=14;

// Expanded map with 3 new zones
const MAP = [
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W],
  [W,F,F,F,FK,F,F,F,F,F,FK,F,F,W],
  [W,F,M,F,F,S,C,C,C,S,F,WE,F,W],
  [W,F,F,F,F,C,F,F,F,C,F,F,F,W],
  [W,F,P,F,F,C,F,F,F,C,F,CH,F,W],
  [W,F,F,F,F,C,F,F,F,C,F,F,F,W],
  [W,F,TI,F,F,C,F,F,F,C,F,E,F,W],
  [W,F,F,F,F,C,F,F,F,C,F,F,F,W],
  [W,F,R,F,F,C,F,F,F,C,F,BO,F,W],
  [W,F,F,F,F,S,C,C,C,S,F,F,F,W],
  [W,F,LI,F,F,F,F,X,F,F,F,F,F,W],
  [W,W,W,W,W,W,W,W,W,W,W,W,W,W],
];

const HAZARDS = {
  [M]:{ label:"ناحیه بازوی رباتیک",   color:PAL.robotGlow,  icon:"⚙️",
        q:"یک بازوی رباتیک در حال کار است و یکی از حفاظ‌ها برداشته شده. چه می‌کنی؟",
        opts:["با احتیاط دورش کار می‌کنم","توقف اضطراری (E-stop) می‌زنم و گزارش می‌دهم","ادامه می‌دهم، کار سریعی است","از کسی می‌خواهم مراقب باشد"],
        ans:1, lesson:"هرگز بدون حفاظ وارد سلول رباتیک نشوید. E-stop بزنید، قفل و برچسب (LOTO) کنید و فوراً گزارش دهید." },
  [P]:{ label:"کابین رنگ",      color:PAL.purple,     icon:"🎨",
        q:"وارد کابین رنگ می‌شوی. کدام تجهیزات حفاظت فردی الزامی است؟",
        opts:["فقط عینک ایمنی","ماسک تنفسی، دستکش و لباس کار یکسره","فقط گوش‌گیر","اگر سریع باشم هیچ‌کدام"],
        ans:1, lesson:"کابین رنگ بخارات قابل اشتعال و دود سمی دارد. ماسک تنفسی کامل، دستکش شیمیایی و لباس کار یکسره الزامی است." },
  [E]:{ label:"تابلوی برق", color:PAL.elecGlow,   icon:"⚡",
        q:"چه کسی مجاز است تابلوی برق را باز کند و داخل آن کار کند؟",
        opts:["هر کسی که دستکش لاستیکی داشته باشد","سرپرست شیفت","فقط برقکاران دارای گواهی","هر کسی در شرایط اضطراری"],
        ans:2, lesson:"فقط برقکاران دارای گواهی داخل تابلو کار می‌کنند. دمای قوس الکتریکی از سطح خورشید هم بالاتر می‌رود." },
  [R]:{ label:"ایستگاه آتش‌نشانی",     color:"#f87171",      icon:"🧯",
        q:"در یک ایستگاه کاری آتش‌سوزی شروع شده. اولین اقدام تو چیست؟",
        opts:["کپسول آتش‌نشانی را برمی‌دارم","به دیگران خبر می‌دهم، آلارم را می‌زنم و تخلیه می‌کنم","روی آتش آب می‌ریزم","اول به مدیرم زنگ می‌زنم"],
        ans:1, lesson:"اول هشدار، آلارم و تخلیه. فقط وقتی با آتش مقابله کنید که کوچک باشد، آموزش دیده باشید و راه خروج پشت سرتان باشد." },
  [CH]:{ label:"ناحیه مواد شیمیایی",   color:PAL.chemGreen,  icon:"🧪",
         q:"قبل از کار با یک ماده شیمیایی ناشناس حتماً باید:",
         opts:["آن را بو کنم تا بفهمم چیست","برگه اطلاعات ایمنی (SDS) را بخوانم","دستکش بپوشم و سریع کار کنم","از همکارم بپرسم"],
         ans:1, lesson:"همیشه اول SDS را بخوانید. خطرات، تجهیزات حفاظتی لازم و روش‌های اضطراری در آن آمده است." },
  [WE]:{ label:"ایستگاه جوشکاری", color:PAL.weldOrange, icon:"🔥",
         q:"کنار دستگاه جوش، تو چه محافظ چشمی لازم داری؟",
         opts:["هیچ، فقط تماشا می‌کنم","عینک ایمنی معمولی","عدسی فیلتر شماره ۵ به بالا یا نقاب جوشکاری","عینک آفتابی"],
         ans:2, lesson:"درخشش قوس جوشکاری حتی از دور می‌تواند به چشم آسیب دائمی بزند. همیشه از عدسی با شماره فیلتر مناسب استفاده کنید." },
  [C]: { label:"نوار نقاله مونتاژ",color:PAL.green,     icon:"🏭",
         q:"ابزاری روی نوار نقاله در حال حرکت افتاده است. باید:",
         opts:["سریع دست ببرم و بردارم","کنارش راه بروم و آخر خط بردارم","اول E-stop بزنم، بعد بردارم","رهایش کنم و ابزار دیگری بردارم"],
         ans:2, lesson:"قبل از دراز کردن دست روی هر نوار نقاله، همیشه E-stop بزنید. گیرکردن دست در ماشین باعث قطع عضو می‌شود." },
  [TI]:{ label:"ایستگاه نصب لاستیک", color:PAL.tireBlue, icon:"🔩",
         q:"در خط تولید مهره‌های چرخ را سفت می‌کنی و تفنگ بادی حس درستی ندارد. چه می‌کنی؟",
         opts:["ادامه می‌دهم، احتمالاً مشکلی نیست","کار را تمام می‌کنم و بعداً گزارش می‌دهم","توقف می‌کنم، روی خودرو برچسب می‌زنم و ایراد ابزار را گزارش می‌دهم","از ایستگاه بعدی می‌خواهم بررسی کند"],
         ans:2, lesson:"چرخی که گشتاور اشتباه دارد می‌تواند در سرعت جاده جدا شود. فوراً توقف کنید، خودرو را برچسب بزنید و گزارش دهید. هرگز نقص شناخته‌شده را به ایستگاه بعد منتقل نکنید." },
  [BO]:{ label:"بدنه‌سازی",       color:PAL.bodyYellow, icon:"🚗",
         q:"در بدنه‌سازی فلز را سنگ می‌زنی و جرقه می‌پرد. چه چیزی باید برقرار باشد؟",
         opts:["فقط نقاب صورت","پتوی ضدآتش دور محل کار، نقاب صورت و تجهیزات حفاظتی مناسب","فقط عینک ایمنی","اگر سریع باشم هیچ"],
         ans:1, lesson:"جرقه‌های سنگ‌زنی تا حدود ۱۰ متر پرتاب می‌شوند و مواد قابل اشتعال را آتش می‌زنند. پتوی ضدآتش، نقاب صورت، دستکش و محافظ شنوایی همگی الزامی‌اند." },
  [FK]:{ label:"منطقه لیفتراک / عابر پیاده", color:"#facc15", icon:"🚜",
         q:"در انبار راه می‌روی و یک لیفتراک نزدیک می‌شود. چه می‌کنی؟",
         opts:["به راهم ادامه می‌دهم، راننده مرا می‌بیند","تماس چشمی می‌گیرم و از پشت آن رد می‌شوم","می‌ایستم، با راننده تماس چشمی می‌گیرم و منتظر علامت عبور می‌مانم","سریع می‌دوم و رد می‌شوم"],
         ans:2, lesson:"هرگز فرض نکنید راننده لیفتراک شما را می‌بیند. همیشه بایستید، تماس چشمی بگیرید و قبل از عبور علامت واضح بگیرید. لیفتراک نقطه کور زیادی دارد و وزنش می‌تواند بیش از ۴ تن باشد." },
  [LI]:{ label:"ارگونومی / بلند کردن بار", color:PAL.liftGreen, icon:"📦",
         q:"باید قطعه‌ای حدود ۱۴ کیلوگرمی را از روی زمین بلند کنی. روش درست کدام است؟",
         opts:["از کمر خم شوم و سریع بکشم","بدنم را بچرخانم تا شتاب بگیرم","زانوها را خم کنم، کمر را صاف نگه دارم و با پاها بلند کنم","فقط روی زمین بکشمش"],
         ans:2, lesson:"آسیب کمر شایع‌ترین آسیب در صنعت تولید است. زانو خم، کمر صاف، بلند کردن با پاها. برای بارهای بیش از ۲۳ کیلوگرم از کمک‌بالابر یا همکار استفاده کنید." },
};

const HAZARD_SET = new Set([M,P,E,R,CH,WE,TI,BO,LI,FK]);
const TOTAL_HAZARDS = 10;
const START = {x:1,y:10};

// ── Cutscene ──────────────────────────────────────────────────
const CUTSCENE = [
  { speaker:"سرپرست", avatar:"👷", text:"به سالن تولید خوش آمدی. قبل از دست زدن به هر چیز، باید این خط را قدم بزنی و تک‌تک مناطق خطر را یاد بگیری." },
  { speaker:"سرپرست", avatar:"👷", text:"بازوهای رباتیک، کابین رنگ، تابلوهای برق، مواد شیمیایی، جوشکاری، نصب لاستیک، بدنه‌سازی — همه‌شان فعال‌اند." },
  { speaker:"کارمند جدید",   avatar:"🧑", text:"متوجه شدم. چه کاری باید انجام بدهم؟" },
  { speaker:"سرپرست", avatar:"👷", text:"در سالن راه برو. به همه مناطق خطر سر بزن. برای پاک‌کردن هر منطقه به سؤال ایمنی درست جواب بده. وقتی همه را تمام کنی، آزمون نهایی گواهی‌نامه باز می‌شود." },
  { speaker:"کارمند جدید",   avatar:"🧑", text:"فهمیدم. آماده‌ام." },
  { speaker:"سرپرست", avatar:"👷", text:"حواست به خط تولید باشد؛ هر چند ثانیه یک خودرو از آن عبور می‌کند. به همه مناطق احتیاط احترام بگذار. حالا برو — ایمن باش!" },
];

// ── Boss quiz ─────────────────────────────────────────────────
const BOSS_QUESTIONS = [
  { q:"LOTO مخفف چیست؟",
    opts:["قفل و برچسب (Lockout/Tagout)","روشن کن، خاموش کن","چراغ خاموش، ابزار خاموش","خط خاموش، برچسب خارج"],
    ans:0, lesson:"قفل و برچسب (LOTO) تضمین می‌کند ماشین‌ها هنگام تعمیر و نگهداری به‌طور ناخواسته روشن نشوند." },
  { q:"تابلوهای «هشدار» برای خطر احتمالی چه رنگی هستند؟",
    opts:["قرمز","نارنجی","زرد","سبز"],
    ans:2, lesson:"زرد = هشدار. نارنجی = خطر (خطر فوری). قرمز = تجهیزات آتش‌نشانی یا اضطراری." },
  { q:"در سلسله‌مراتب کنترل خطر، چه چیزی اولویت اول است؟",
    opts:["تجهیزات حفاظت فردی","کنترل‌های اداری","کنترل‌های مهندسی","حذف خطر"],
    ans:3, lesson:"سلسله‌مراتب: حذف ← جایگزینی ← کنترل مهندسی ← کنترل اداری ← تجهیزات حفاظت فردی. همیشه اول خطر را حذف کنید." },
  { q:"می‌بینی همکارت یک مرحله ایمنی را در خط رد می‌کند. باید:",
    opts:["به کار خودم برسم","بعداً آرام بهش بگویم","فوراً به سرپرست گزارش بدهم","در شبکه‌های اجتماعی پستش کنم"],
    ans:2, lesson:"ایمنی مسئولیت همه است. حادثه گیرکردن یا برق‌گرفتگی در چند ثانیه می‌تواند کشنده باشد. فوراً اعتراض کنید." },
  { q:"هر چند وقت یک بار باید تجهیزات حفاظت فردی را بازرسی کنید؟",
    opts:["سالی یک بار","قبل از هر استفاده","ماهی یک بار","هیچ‌وقت — نو است"],
    ans:1, lesson:"تجهیزات حفاظت فردی را قبل از هر استفاده بازرسی کنید. تجهیزات آسیب‌دیده درست وقتی لازمشان دارید از کار می‌افتند." },
  { q:"ماده شیمیایی به چشم همکارت پاشیده شده. اولین اقدام؟",
    opts:["اول به پرستار زنگ بزنم","چشم را ۱۵ تا ۲۰ دقیقه در ایستگاه چشم‌شویی بشویم","با پارچه پاکش کنم","صبر کنم ببینم می‌سوزد یا نه"],
    ans:1, lesson:"ایستگاه چشم‌شویی باید فوراً استفاده شود. حداقل ۱۵ تا ۲۰ دقیقه شستشو دهید. در تماس شیمیایی با چشم هر ثانیه مهم است." },
  { q:"روش درست گزارش‌دادن شبه‌حادثه (near-miss) چیست؟",
    opts:["گزارش نمی‌دهم — اتفاقی نیفتاد","فقط به یک همکار می‌گویم","فوراً به سرپرست گزارش می‌دهم","صبر می‌کنم ببینم دوباره اتفاق می‌افتد"],
    ans:2, lesson:"شبه‌حادثه‌ها هشدار هستند. گزارش آن‌ها جلوی تبدیل حادثه بعدی به آسیب را می‌گیرد. همیشه فوراً گزارش دهید." },
];

// ── Workers ───────────────────────────────────────────────────
const INIT_WORKERS = [
  {id:0,x:3,y:2,dx:1,dy:0,color:"#065f46"},
  {id:1,x:11,y:5,dx:0,dy:1,color:"#1e3a5f"},
  {id:2,x:7,y:9,dx:-1,dy:0,color:"#7c3aed"},
];

// ── Pixel Sprites ─────────────────────────────────────────────
function PixelPlayer() {
  return (
    <svg width={TILE-4} height={TILE-2} viewBox="0 0 20 26" style={{imageRendering:"pixelated"}}>
      <rect x="3" y="5" width="14" height="2" fill="#b45309"/>
      <rect x="5" y="1" width="10" height="6" fill="#f59e0b"/>
      <rect x="6" y="7" width="8" height="7" fill="#fde68a"/>
      <rect x="7" y="9" width="2" height="2" fill="#1a1a1a"/>
      <rect x="11" y="9" width="2" height="2" fill="#1a1a1a"/>
      <rect x="5" y="14" width="10" height="7" fill="#1d4ed8"/>
      <rect x="2" y="14" width="3" height="6" fill="#1d4ed8"/>
      <rect x="15" y="14" width="3" height="6" fill="#1d4ed8"/>
      <rect x="2" y="20" width="3" height="2" fill="#fde68a"/>
      <rect x="15" y="20" width="3" height="2" fill="#fde68a"/>
      <rect x="6" y="21" width="3" height="4" fill="#1e40af"/>
      <rect x="11" y="21" width="3" height="4" fill="#1e40af"/>
      <rect x="5" y="24" width="5" height="2" fill="#111"/>
      <rect x="10" y="24" width="5" height="2" fill="#111"/>
    </svg>
  );
}

function PixelWorker({color}) {
  return (
    <svg width={TILE-8} height={TILE-4} viewBox="0 0 18 24" style={{imageRendering:"pixelated"}}>
      <rect x="4" y="2" width="10" height="2" fill="#991b1b"/>
      <rect x="5" y="0" width="8" height="5" fill="#dc2626"/>
      <rect x="5" y="5" width="8" height="7" fill="#fde68a"/>
      <rect x="6" y="7" width="2" height="2" fill="#1a1a1a"/>
      <rect x="10" y="7" width="2" height="2" fill="#1a1a1a"/>
      <rect x="4" y="12" width="10" height="6" fill={color}/>
      <rect x="1" y="12" width="3" height="5" fill={color}/>
      <rect x="14" y="12" width="3" height="5" fill={color}/>
      <rect x="5" y="18" width="3" height="4" fill={color}/>
      <rect x="10" y="18" width="3" height="4" fill={color}/>
      <rect x="4" y="21" width="4" height="2" fill="#111"/>
      <rect x="10" y="21" width="4" height="2" fill="#111"/>
    </svg>
  );
}

function PixelCar({color="#c0392b"}) {
  return (
    <svg width="28" height="36" viewBox="0 0 14 18" style={{imageRendering:"pixelated"}}>
      <rect x="1" y="0" width="12" height="18" fill={color} rx="1"/>
      <rect x="2" y="0" width="10" height="1" fill="#7b241c"/>
      <rect x="2" y="17" width="10" height="1" fill="#7b241c"/>
      <rect x="2" y="2" width="10" height="5" fill="#1e3a5c"/>
      <rect x="2" y="11" width="10" height="4" fill="#1e3a5c"/>
      <rect x="0" y="2" width="2" height="4" fill="#111"/>
      <rect x="12" y="2" width="2" height="4" fill="#111"/>
      <rect x="0" y="12" width="2" height="4" fill="#111"/>
      <rect x="12" y="12" width="2" height="4" fill="#111"/>
      <rect x="4" y="8" width="6" height="2" fill="#7b241c"/>
    </svg>
  );
}

// ── Tile ──────────────────────────────────────────────────────
function Tile({tile, cleared, tick}) {
  const T = TILE;
  const base = {width:T,height:T,display:"flex",alignItems:"center",justifyContent:"center",
    position:"relative",flexShrink:0,boxSizing:"border-box",imageRendering:"pixelated"};

  if(tile===W) return(
    <div style={{...base,
      background:`repeating-linear-gradient(90deg,${PAL.wall} 0,${PAL.wall} ${T/2-1}px,${PAL.wallHL} ${T/2-1}px,${PAL.wallHL} ${T/2}px),repeating-linear-gradient(180deg,${PAL.wall} 0,${PAL.wall} ${T/2-1}px,${PAL.wallHL} ${T/2-1}px,${PAL.wallHL} ${T/2}px)`,
      backgroundColor:PAL.wall}}/>
  );

  if(tile===F) return(
    <div style={{...base,
      background:`repeating-linear-gradient(90deg,${PAL.floor} 0,${PAL.floor} ${T-1}px,${PAL.floorLine} ${T-1}px,${PAL.floorLine} ${T}px),repeating-linear-gradient(180deg,${PAL.floor} 0,${PAL.floor} ${T-1}px,${PAL.floorLine} ${T-1}px,${PAL.floorLine} ${T}px)`,
      backgroundColor:PAL.floor}}/>
  );

  if(tile===C||tile===S) {
    const off=(tick*3)%T;
    return(
      <div style={{...base,backgroundColor:PAL.belt,overflow:"hidden",
        borderLeft:`3px solid ${PAL.beltRail}`,borderRight:`3px solid ${PAL.beltRail}`}}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{position:"absolute",left:4,right:4,height:2,backgroundColor:PAL.beltStripe,
            top:((i*(T/3)+off)%(T+4))-2,borderRadius:1}}/>
        ))}
        {tile===S&&<div style={{position:"relative",zIndex:2}}><PixelCar/></div>}
      </div>
    );
  }

  const pulse=0.45+0.3*Math.sin(tick*0.12);
  const flash=Math.sin(tick*0.18)>0.5;

  const hazardStyles={
    [M]: {bg:PAL.robot,  border:`2px solid rgba(96,165,250,${pulse})`,   shadow:`0 0 ${8+pulse*6}px rgba(96,165,250,0.5)`},
    [P]: {bg:PAL.paint,  border:`2px solid rgba(192,132,252,${pulse})`,  shadow:`0 0 ${8+pulse*6}px rgba(192,132,252,0.5)`},
    [E]: {bg:flash&&!cleared?PAL.elec+"cc":PAL.elec, border:`2px solid rgba(251,191,36,${pulse})`, shadow:`0 0 ${8+pulse*6}px rgba(251,191,36,0.5)`},
    [R]: {bg:PAL.fire,   border:`2px solid rgba(248,113,113,${pulse})`,  shadow:`0 0 ${8+pulse*6}px rgba(248,113,113,0.5)`},
    [CH]:{bg:PAL.chem,   border:`2px solid rgba(74,222,128,${pulse})`,   shadow:`0 0 ${8+pulse*6}px rgba(74,222,128,0.5)`},
    [WE]:{bg:PAL.weld,   border:`2px solid rgba(249,115,22,${pulse})`,   shadow:`0 0 ${8+pulse*6}px rgba(249,115,22,0.5)`},
    [TI]:{bg:PAL.tire,   border:`2px solid rgba(56,189,248,${pulse})`,   shadow:`0 0 ${8+pulse*6}px rgba(56,189,248,0.5)`},
    [BO]:{bg:PAL.body,   border:`2px solid rgba(234,179,8,${pulse})`,    shadow:`0 0 ${8+pulse*6}px rgba(234,179,8,0.5)`},
    [FK]:{bg:PAL.fork,  border:`2px solid rgba(250,204,21,${pulse})`,   shadow:`0 0 ${8+pulse*6}px rgba(250,204,21,0.5)`},
    [LI]:{bg:PAL.lift,   border:`2px solid rgba(134,239,172,${pulse})`, shadow:`0 0 ${8+pulse*6}px rgba(134,239,172,0.5)`},
  };

  if(hazardStyles[tile]){
    const s=hazardStyles[tile];
    return(
      <div style={{...base,backgroundColor:s.bg,
        border:cleared?"2px solid #333":s.border,
        boxShadow:cleared?"none":s.shadow}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
          <span style={{fontSize:18,opacity:cleared?0.25:1,filter:cleared?"grayscale(1)":"none"}}>
            {HAZARDS[tile].icon}
          </span>
          {cleared&&<span style={{color:PAL.green,fontSize:10,fontWeight:"bold",fontFamily:"monospace"}}>✓ تأیید</span>}
        </div>
      </div>
    );
  }

  if(tile===X) return(
    <div style={{...base,backgroundColor:PAL.exit,border:"2px solid #22c55e",boxShadow:"0 0 12px rgba(34,197,94,0.6)"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:14}}>✅</div>
        <div style={{color:PAL.green,fontSize:9,fontWeight:"bold",fontFamily:"monospace"}}>خروج</div>
      </div>
    </div>
  );

  return <div style={{...base,backgroundColor:PAL.floor}}/>;
}

// ── App ───────────────────────────────────────────────────────
export default function App() {
  const [screen,    setScreen]    = useState("register");
  const [player,    setPlayer]    = useState({name:"",badge:""});
  const [cutIdx,    setCutIdx]    = useState(0);
  const [pos,       setPos]       = useState(START);
  const [cleared,   setCleared]   = useState(new Set());
  const [popup,     setPopup]     = useState(null);
  const [chosen,    setChosen]    = useState(null);
  const [lives,     setLives]     = useState(3);
  const [score,     setScore]     = useState(0);
  const [workers,   setWorkers]   = useState(INIT_WORKERS);
  const [tick,      setTick]      = useState(0);
  const [carPos,    setCarPos]    = useState(0);
  const [bossIdx,   setBossIdx]   = useState(0);
  const [bossChosen,setBossChosen]= useState(null);
  const [bossScore, setBossScore] = useState(0);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const [nameErr,   setNameErr]   = useState("");

  const popupRef = useRef(null);
  const screenRef= useRef("register");
  useEffect(()=>{ popupRef.current=popup; },[popup]);
  useEffect(()=>{ screenRef.current=screen; },[screen]);

  useEffect(()=>{ const id=setInterval(()=>setTick(t=>t+1),60); return()=>clearInterval(id); },[]);

  useEffect(()=>{
    if(screen!=="game") return;
    const id=setInterval(()=>setCarPos(p=>(p+1)%16),550);
    return()=>clearInterval(id);
  },[screen]);

  useEffect(()=>{
    if(screen!=="game") return;
    const id=setInterval(()=>{
      setWorkers(prev=>prev.map(w=>{
        let nx=w.x+w.dx,ny=w.y+w.dy;
        const t=MAP[ny]?.[nx];
        if(t===W||t===undefined||t===C||t===S||t===X) return{...w,dx:-w.dx,dy:-w.dy};
        return{...w,x:nx,y:ny};
      }));
    },500);
    return()=>clearInterval(id);
  },[screen]);

  const solid=(x,y)=>{ const t=MAP[y]?.[x]; return t===W||t===undefined; };

  const move=(dx,dy)=>{
    if(popupRef.current||screenRef.current!=="game") return;
    setPos(prev=>{
      const nx=prev.x+dx,ny=prev.y+dy;
      if(solid(nx,ny)) return prev;
      const tile=MAP[ny][nx];
      if(tile===X){
        setCleared(c=>{
          setTimeout(()=>setScreen(c.size>=TOTAL_HAZARDS?"boss":"win"),50);
          return c;
        });
        return prev;
      }
      // Line violation — block stepping on conveyor
      if(tile===C||tile===S){
        playSound("alarm", mutedRef);
        setTimeout(()=>{ setPopup({tile:"LINE_VIOLATION"}); setChosen(null); },10);
        setLives(l=>{ const nl=l-1; if(nl<=0) setTimeout(()=>setScreen("lose"),900); return nl; });
        return prev;
      }
      if(HAZARD_SET.has(tile)){
        setCleared(c=>{
          if(!c.has(tile)){ playSound("hazard", mutedRef); setTimeout(()=>{ setPopup({tile}); setChosen(null); },10); }
          return c;
        });
      }
      playSound("footstep", mutedRef);
      return{x:nx,y:ny};
    });
  };

  useEffect(()=>{
    const dn=e=>{
      if(e.key==="ArrowUp"   ||e.key==="w") move(0,-1);
      if(e.key==="ArrowDown" ||e.key==="s") move(0,1);
      if(e.key==="ArrowLeft" ||e.key==="a") move(-1,0);
      if(e.key==="ArrowRight"||e.key==="d") move(1,0);
    };
    window.addEventListener("keydown",dn);
    return()=>window.removeEventListener("keydown",dn);
  },[]);

  const handleAnswer=(i)=>{
    if(chosen!==null||!popup) return;
    setChosen(i);
    const h=HAZARDS[popup.tile];
    if(i===h.ans){ playSound("correct", mutedRef); setScore(s=>s+25); setCleared(c=>new Set([...c,popup.tile])); }
    else{ playSound("wrong", mutedRef); setLives(l=>{ const nl=l-1; if(nl<=0) setTimeout(()=>setScreen("lose"),900); return nl; }); }
  };

  const handleBossAnswer=(i)=>{
    if(bossChosen!==null) return;
    setBossChosen(i);
    const q=BOSS_QUESTIONS[bossIdx];
    if(i===q.ans) setBossScore(s=>s+50);
    else setLives(l=>Math.max(0,l-1));
  };

  const nextBoss=()=>{
    if(bossIdx+1>=BOSS_QUESTIONS.length){
      setScreen(lives>0?"certified":"lose");
    } else { setBossIdx(b=>b+1); setBossChosen(null); }
  };

  const restart=()=>{
    setPos(START); setCleared(new Set()); setLives(3); setScore(0);
    setPopup(null); setChosen(null); setWorkers(INIT_WORKERS.map(w=>({...w})));
    setBossIdx(0); setBossChosen(null); setBossScore(0); setCarPos(0);
    setCutIdx(0); setScreen("register");
    setPlayer({name:"",badge:""});
  };

  const closePopup=()=>{ setPopup(null); setChosen(null); };

  const beltPath=[
    {x:5,y:2},{x:5,y:3},{x:5,y:4},{x:5,y:5},{x:5,y:6},{x:5,y:7},{x:5,y:8},{x:5,y:9},
    {x:9,y:9},{x:9,y:8},{x:9,y:7},{x:9,y:6},{x:9,y:5},{x:9,y:4},{x:9,y:3},{x:9,y:2},
  ];
  const carCell=beltPath[carPos%beltPath.length];

  // ── REGISTER SCREEN ───────────────────────────────────────
  if(screen==="register") return(
    <div style={css.page}>
      <div style={{...css.card,maxWidth:360}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:42}}>🏭</div>
          <div style={{fontSize:11,color:"#60a5fa",letterSpacing:0,fontFamily:"monospace",marginTop:6}}>آموزش کارخانه خودروسازی</div>
          <div style={{fontSize:22,color:"#fff",fontWeight:"bold",margin:"6px 0 2px"}}>ماجراجویی ایمنی</div>
          <div style={{color:"#555",fontSize:12}}>برای شروع اطلاعات خود را وارد کنید</div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
          <div>
            <div style={{color:"#888",fontSize:11,marginBottom:5,letterSpacing:0,fontFamily:"monospace"}}>نام و نام خانوادگی</div>
            <input
              value={player.name}
              onChange={e=>{ setPlayer(p=>({...p,name:e.target.value})); setNameErr(""); }}
              placeholder="مثلاً علی رضایی"
              style={css.input}
            />
          </div>
          <div>
            <div style={{color:"#888",fontSize:11,marginBottom:5,letterSpacing:0,fontFamily:"monospace"}}>شماره کارت / کد پرسنلی</div>
            <input
              value={player.badge}
              onChange={e=>{ setPlayer(p=>({...p,badge:e.target.value})); setNameErr(""); }}
              placeholder="مثلاً EMP-4821 (اختیاری)"
              dir="ltr"
              style={{...css.input,textAlign:"start"}}
            />
          </div>
          {nameErr&&<div style={{color:"#ef4444",fontSize:12}}>{nameErr}</div>}
        </div>

        <button onClick={()=>{
          if(!player.name.trim()){ setNameErr("برای ادامه نام خود را وارد کنید."); return; }
          setScreen("cutscene");
        }} style={css.btnBlue}>شروع آموزش ←</button>

        <div style={{textAlign:"center",marginTop:12,color:"#333",fontSize:11}}>
          شماره کارتتان را نمی‌دانید؟ فقط نام را وارد کنید و برای شماره کارت «N/A» بنویسید. این اطلاعات فقط برای ثبت تکمیل آموزش استفاده می‌شود.
        </div>
      </div>
    </div>
  );

  // ── CUTSCENE ──────────────────────────────────────────────
  if(screen==="cutscene"){
    const scene=CUTSCENE[cutIdx];
    return(
      <div style={css.page}>
        <div style={{...css.card,maxWidth:380}}>
          <div style={{fontSize:11,color:"#555",letterSpacing:0,marginBottom:12,fontFamily:"monospace"}}>
            ◆ توجیه کارمند جدید — {player.name}
          </div>
          <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:16}}>
            <div style={{fontSize:36,flexShrink:0}}>{scene.avatar}</div>
            <div>
              <div style={{fontSize:11,color:"#555",fontFamily:"monospace",marginBottom:4,letterSpacing:0}}>{scene.speaker}</div>
              <div style={{background:"#0f0f0f",border:"1px solid #2a2a2a",borderRadius:8,padding:12,
                color:"#e5e5e5",fontSize:14,lineHeight:1.65}}>
                «{scene.text}»
              </div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",gap:4}}>
              {CUTSCENE.map((_,i)=>(
                <div key={i} style={{width:6,height:6,borderRadius:"50%",background:i===cutIdx?"#60a5fa":"#333"}}/>
              ))}
            </div>
            <button onClick={()=>{ if(cutIdx+1>=CUTSCENE.length) setScreen("game"); else setCutIdx(i=>i+1); }}
              style={css.btnBlue}>
              {cutIdx+1>=CUTSCENE.length?"ورود به سالن ←":"بعدی ←"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── BOSS QUIZ ─────────────────────────────────────────────
  if(screen==="boss"){
    const bq=BOSS_QUESTIONS[bossIdx];
    return(
      <div style={css.page}>
        <div style={{...css.card,maxWidth:400}}>
          <div style={{textAlign:"center",marginBottom:12}}>
            <div style={{fontSize:11,color:PAL.red,letterSpacing:0,fontFamily:"monospace"}}>◆ آزمون نهایی گواهی‌نامه</div>
            <div style={{fontSize:18,color:"#fff",fontWeight:"bold",margin:"6px 0"}}>آزمون مرحله آخر ایمنی</div>
            <div style={{fontSize:12,color:"#555"}}>سؤال {fa(bossIdx+1)} از {fa(BOSS_QUESTIONS.length)} · ★ {fa(score+bossScore)} امتیاز · {"❤️".repeat(lives)}</div>
          </div>
          <div style={{color:"#fff",fontSize:14,marginBottom:14,lineHeight:1.6,padding:10,background:"#0f0f0f",borderRadius:6,border:"1px solid #2a2a2a"}}>
            {bq.q}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
            {bq.opts.map((opt,i)=>{
              let bg="#1e1e1e",border="#333",col="#ccc";
              if(bossChosen!==null){
                if(i===bq.ans){bg="#052e16";border="#22c55e";col="#fff";}
                else if(i===bossChosen){bg="#3f0000";border="#ef4444";col="#fff";}
              }
              return(
                <button key={i} onClick={()=>handleBossAnswer(i)}
                  style={{background:bg,border:`1px solid ${border}`,color:col,borderRadius:6,
                    padding:"10px 12px",cursor:bossChosen!==null?"default":"pointer",
                    fontFamily:"inherit",fontSize:13,textAlign:"start"}}>
                  <span style={{color:"#555",marginInlineStart:0,marginInlineEnd:8}}>{LETTERS[i]}.</span>{opt}
                </button>
              );
            })}
          </div>
          {bossChosen!==null&&(
            <>
              <div style={{background:"#0f0f0f",border:`1px solid ${bossChosen===bq.ans?"#22c55e":"#ef4444"}`,borderRadius:6,padding:10,marginBottom:10}}>
                <div style={{color:bossChosen===bq.ans?"#22c55e":"#ef4444",fontWeight:"bold",fontSize:13,marginBottom:4}}>
                  {bossChosen===bq.ans?"✅ درست! +۵۰ امتیاز":"❌ اشتباه! −۱ جان"}
                </div>
                <div style={{color:"#bbb",fontSize:12,lineHeight:1.5}}>{bq.lesson}</div>
              </div>
              <button onClick={nextBoss} style={css.btnGreen}>
                {bossIdx+1>=BOSS_QUESTIONS.length?"مشاهده نتیجه ←":"سؤال بعدی ←"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── CERTIFIED ─────────────────────────────────────────────
  if(screen==="certified"){ setTimeout(()=>playSound("win", mutedRef),300); return(
    <div style={css.page}>
      <div style={{...css.card,textAlign:"center"}}>
        <div style={{fontSize:52}}>🏆</div>
        <div style={{fontSize:22,color:"#22c55e",fontWeight:"bold",margin:"8px 0"}}>گواهی صادر شد!</div>
        <div style={{color:"#aaa",fontSize:13,marginBottom:4}}>
          {player.name} پیمایش سالن و آزمون نهایی را با موفقیت گذراند.
        </div>
        <div style={{border:"1px solid #22c55e",borderRadius:8,padding:16,margin:"16px 0",background:"#052e16"}}>
          <div style={{fontSize:11,color:"#22c55e",letterSpacing:0,fontFamily:"monospace",marginBottom:6}}>گواهی‌نامه ایمنی</div>
          <div style={{color:"#fff",fontSize:15,fontWeight:"bold"}}>{player.name}</div>
          <div style={{color:"#555",fontSize:12,marginBottom:4}}>شماره کارت: {player.badge}</div>
          <div style={{color:"#fff",fontSize:13}}>ایمنی سالن تولید — قبول ✓</div>
          <div style={{color:"#aaa",fontSize:11,marginTop:4}}>{new Date().toLocaleDateString("fa-IR")}</div>
          <div style={{fontSize:26,color:"#fbbf24",marginTop:8}}>★ {fa(score+bossScore)} امتیاز کل</div>
        </div>
        <button onClick={restart} style={css.btnGreen}>بازی دوباره</button>
      </div>
    </div>
  ); }

  if(screen==="win") return(
    <div style={css.page}>
      <div style={{...css.card,textAlign:"center"}}>
        <div style={{fontSize:52}}>✅</div>
        <div style={{fontSize:20,color:"#22c55e",fontWeight:"bold",margin:"8px 0"}}>پیمایش سالن کامل شد!</div>
        <div style={{color:"#aaa",fontSize:13,marginBottom:16}}>برای باز شدن آزمون نهایی گواهی‌نامه، همه {fa(TOTAL_HAZARDS)} منطقه خطر را پاک کنید.</div>
        <div style={{fontSize:22,color:"#fbbf24",marginBottom:16}}>★ {fa(score)} امتیاز</div>
        <button onClick={restart} style={css.btnGreen}>تلاش دوباره</button>
      </div>
    </div>
  );

  if(screen==="lose") return(
    <div style={css.page}>
      <div style={{...css.card,textAlign:"center"}}>
        <div style={{fontSize:52}}>⚠️</div>
        <div style={{fontSize:20,color:"#ef4444",fontWeight:"bold",margin:"8px 0"}}>حادثه ایمنی</div>
        <div style={{color:"#aaa",fontSize:13,marginBottom:20}}>پاسخ‌های اشتباه زیاد بود. آموزش را مرور کنید و دوباره تلاش کنید.</div>
        <button onClick={restart} style={css.btnRed}>تلاش دوباره</button>
      </div>
    </div>
  );

  const h=popup&&popup.tile!=='LINE_VIOLATION'?HAZARDS[popup.tile]:null;

  return(
    <div style={css.page}>
      {/* HUD */}
      <div style={{display:"flex",gap:14,marginBottom:6,fontSize:13,alignItems:"center",fontFamily:"monospace",flexWrap:"wrap",justifyContent:"center"}}>
        <span style={{color:"#60a5fa",fontSize:11}}>{player.name} · {player.badge}</span>
        <span>{"❤️".repeat(lives)}{"🖤".repeat(3-lives)}</span>
        <span style={{color:"#fbbf24"}}>★ {fa(score)}</span>
        <span style={{color:"#22c55e"}}>✓ {fa(cleared.size)}/{fa(TOTAL_HAZARDS)}</span>
        <button onClick={()=>setMuted(m=>!m)}
          style={{background:"none",border:"1px solid #333",borderRadius:6,
            color:muted?"#ef4444":"#888",fontSize:14,padding:"2px 8px",cursor:"pointer",
            fontFamily:"inherit"}}>
          {muted?"🔇":"🔊"}
        </button>
      </div>

      {/* MAP */}
      <div style={{position:"relative",overflow:"hidden",borderRadius:6,border:"2px solid #333",flexShrink:0,direction:"ltr"}}>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${COLS},${TILE}px)`,gridTemplateRows:`repeat(${ROWS},${TILE}px)`}}>
          {MAP.map((row,ry)=>row.map((tile,cx)=>(
            <Tile key={`${ry}-${cx}`} tile={tile} cleared={cleared.has(tile)} tick={tick}/>
          )))}
        </div>

        {/* Caution stripes */}
        {[4,10].map(col=>(
          <div key={col} style={{position:"absolute",top:TILE,bottom:TILE,left:col*TILE,width:2,
            background:"repeating-linear-gradient(to bottom,#fbbf24 0,#fbbf24 7px,transparent 7px,transparent 14px)",
            pointerEvents:"none"}}/>
        ))}

        {/* Moving car */}
        <div style={{position:"absolute",
          left:carCell.x*TILE+(TILE-28)/2,top:carCell.y*TILE+(TILE-36)/2,
          transition:"left 0.4s linear,top 0.4s linear",zIndex:4,pointerEvents:"none"}}>
          <PixelCar color="#e74c3c"/>
        </div>

        {/* Workers */}
        {workers.map(w=>(
          <div key={w.id} style={{position:"absolute",left:w.x*TILE,top:w.y*TILE,width:TILE,height:TILE,
            display:"flex",alignItems:"center",justifyContent:"center",
            transition:"left 0.25s,top 0.25s",zIndex:3}}>
            <PixelWorker color={w.color}/>
          </div>
        ))}

        {/* Player */}
        <div style={{position:"absolute",left:pos.x*TILE,top:pos.y*TILE,width:TILE,height:TILE,
          display:"flex",alignItems:"center",justifyContent:"center",
          transition:"left 0.09s,top 0.09s",zIndex:5}}>
          <PixelPlayer/>
        </div>

        {/* Line Violation Popup */}
        {popup&&popup.tile==="LINE_VIOLATION"&&(
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.92)",direction:"rtl",display:"flex",
            alignItems:"center",justifyContent:"center",zIndex:20,borderRadius:4}}>
            <div style={{background:"#1a0000",border:"2px solid #ef4444",borderRadius:10,
              padding:24,maxWidth:300,width:"92%",textAlign:"center",
              boxShadow:"0 0 40px rgba(239,68,68,0.6)"}}>
              {/* Flashing stop sign */}
              <div style={{fontSize:52,marginBottom:8,animation:"pulse 0.5s infinite alternate"}}>🚫</div>
              <div style={{fontSize:16,color:"#ef4444",fontWeight:"bold",marginBottom:6,letterSpacing:0}}>
                تخطی از خط
              </div>
              <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:12}}>
                <div style={{width:14,height:14,borderRadius:"50%",background:"#ef4444",
                  boxShadow:"0 0 10px #ef4444"}}/>
                <div style={{width:14,height:14,borderRadius:"50%",background:"#ef4444",
                  boxShadow:"0 0 10px #ef4444"}}/>
                <div style={{width:14,height:14,borderRadius:"50%",background:"#ef4444",
                  boxShadow:"0 0 10px #ef4444"}}/>
              </div>
              <div style={{color:"#fff",fontSize:14,lineHeight:1.6,marginBottom:16}}>
                ⛔ شما روی خط مونتاژ قدم گذاشتید. کارکنان <strong>مجاز نیستند</strong> روی نوار نقاله بروند؛ فقط برای دسترسی تعمیرات. این یک تخلف ایمنی ثبت‌شدنی است.
              </div>
              <div style={{color:"#ef4444",fontWeight:"bold",fontSize:13,marginBottom:16}}>−۱ جان</div>
              <button onClick={closePopup} style={{display:"block",width:"100%",padding:12,
                background:"#7f1d1d",color:"#fff",border:"2px solid #ef4444",
                borderRadius:8,fontSize:14,fontWeight:"bold",cursor:"pointer",fontFamily:"inherit"}}>
                متوجه شدم — عقب می‌روم
              </button>
            </div>
          </div>
        )}

        {/* Hazard Popup */}
        {popup&&h&&(
          <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.88)",direction:"rtl",display:"flex",
            alignItems:"flex-start",justifyContent:"center",zIndex:20,borderRadius:4,
            overflowY:"auto",paddingTop:10,paddingBottom:10}}>
            <div style={{background:"#141414",border:`1px solid ${h.color}`,borderRadius:10,
              padding:20,maxWidth:310,width:"92%",boxShadow:`0 0 20px ${h.color}44`,flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span style={{fontSize:20}}>{h.icon}</span>
                <span style={{color:h.color,fontWeight:"bold",fontSize:14}}>{h.label}</span>
              </div>
              <div style={{color:"#fff",fontSize:14,marginBottom:14,lineHeight:1.6}}>{h.q}</div>
              <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:12}}>
                {h.opts.map((opt,i)=>{
                  let bg="#1e1e1e",border="#333",col="#ccc";
                  if(chosen!==null){
                    if(i===h.ans){bg="#052e16";border="#22c55e";col="#fff";}
                    else if(i===chosen){bg="#3f0000";border="#ef4444";col="#fff";}
                  }
                  return(
                    <button key={i} onClick={()=>handleAnswer(i)}
                      style={{background:bg,border:`1px solid ${border}`,color:col,borderRadius:6,
                        padding:"9px 11px",cursor:chosen!==null?"default":"pointer",
                        fontFamily:"inherit",fontSize:13,textAlign:"start"}}>
                      <span style={{color:"#555",marginInlineStart:0,marginInlineEnd:7}}>{LETTERS[i]}.</span>{opt}
                    </button>
                  );
                })}
              </div>
              {chosen!==null&&(
                <>
                  <div style={{background:"#0f0f0f",border:`1px solid ${chosen===h.ans?"#22c55e":"#ef4444"}`,
                    borderRadius:6,padding:10,marginBottom:10}}>
                    <div style={{color:chosen===h.ans?"#22c55e":"#ef4444",fontWeight:"bold",fontSize:13,marginBottom:4}}>
                      {chosen===h.ans?"✅ درست! +۲۵ امتیاز":"❌ اشتباه! −۱ جان"}
                    </div>
                    <div style={{color:"#bbb",fontSize:12,lineHeight:1.5}}>{h.lesson}</div>
                  </div>
                  <button onClick={closePopup} style={css.btnGreen}>بازگشت به سالن ←</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* D-Pad */}
      <div style={{display:"grid",direction:"ltr",gridTemplateColumns:"52px 52px 52px",gap:6,margin:"12px 0 4px"}}>
        <div/><Dp label="▲" fn={()=>move(0,-1)}/><div/>
        <Dp label="◀" fn={()=>move(-1,0)}/>
        <div style={{width:52,height:52,background:"#1a1a1a",borderRadius:8}}/>
        <Dp label="▶" fn={()=>move(1,0)}/>
        <div/><Dp label="▼" fn={()=>move(0,1)}/><div/>
      </div>
      <div style={{color:"#444",fontSize:11,marginTop:2}}>وارد مناطق درخشان شوید · با پاک‌کردن همه {fa(TOTAL_HAZARDS)} منطقه آزمون نهایی باز می‌شود</div>

      {/* Footer */}
      <div style={{marginTop:20,paddingTop:14,borderTop:"1px solid #1e1e1e",textAlign:"center",fontSize:12,color:"#444"}}>
        ساخته‌شده توسط <bdi>BG</bdi> &nbsp;·&nbsp;
        <a href="https://assetsystemsco.com" target="_blank"
          style={{color:"#555",textDecoration:"none"}}>
          <bdi>Asset Systems Co.</bdi>
        </a>
      </div>
    </div>
  );
}

function Dp({label,fn}){
  return(
    <button onPointerDown={fn}
      style={{width:52,height:52,background:"#1e1e1e",border:"1px solid #3a3a3a",color:"#bbb",
        borderRadius:8,fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",
        justifyContent:"center",touchAction:"none",userSelect:"none",WebkitUserSelect:"none"}}>
      {label}
    </button>
  );
}

const css={
  page:{minHeight:"100vh",background:"#0a0a0a",display:"flex",flexDirection:"column",
    alignItems:"center",justifyContent:"center",fontFamily:"Vazirmatn,Tahoma,'Segoe UI',sans-serif",padding:"10px 6px",color:"#fff"},
  card:{background:"#141414",border:"1px solid #2a2a2a",borderRadius:12,padding:22,width:"100%"},
  input:{width:"100%",padding:"10px 12px",background:"#0f0f0f",border:"1px solid #333",
    borderRadius:6,color:"#fff",fontSize:14,fontFamily:"inherit",boxSizing:"border-box",outline:"none"},
  btnGreen:{display:"block",width:"100%",padding:13,background:"#16a34a",color:"#fff",border:"none",
    borderRadius:8,fontSize:15,fontWeight:"bold",cursor:"pointer",fontFamily:"inherit"},
  btnRed:{display:"block",width:"100%",padding:13,background:"#dc2626",color:"#fff",border:"none",
    borderRadius:8,fontSize:15,fontWeight:"bold",cursor:"pointer",fontFamily:"inherit"},
  btnBlue:{padding:"10px 20px",background:"#1d4ed8",color:"#fff",border:"none",
    borderRadius:8,fontSize:14,fontWeight:"bold",cursor:"pointer",fontFamily:"inherit"},
};
