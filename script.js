/* ============================================================
   The Gilded Envelope — Wedding Invitation behaviour
   All content comes from INVITE_CONFIG (config.js).
   ============================================================ */
(function () {
  "use strict";

  // Top-level `const` in config.js creates a global lexical binding, not a
  // window property — so read the binding directly and only fall back to window.
  var cfg = typeof INVITE_CONFIG !== "undefined" ? INVITE_CONFIG : window.INVITE_CONFIG;
  if (!cfg) return;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ============ 0. Language / i18n ============
     English is the default. First-time visitors whose browser language
     starts with "bn" get Bangla; the choice is remembered in localStorage.
     UI chrome strings live in UI below. Client content is localised via the
     optional "bn" block in config.js (missing keys fall back to English).
     With no "bn" block the toggle hides itself and the site stays English. */
  var LANG_KEY = "invite-lang";

  var UI = {
    en: {
      documentTitleSuffix: "Wedding Invitation",
      nameSep: "&",
      heroAmp: "&",
      eyebrowWedding: "The Wedding of",
      introHint: "Tap the seal to open",
      introSkip: "Skip",
      introCardEyebrow: "You are cordially invited to the wedding of",
      introSealAria: "Break the seal and open the invitation",
      scroll: "Scroll",
      saveTheDate: "Save the Date",
      countdownTitle: "Counting Down<br /><em>to Forever</em>",
      days: "Days",
      hours: "Hours",
      minutes: "Minutes",
      seconds: "Seconds",
      countdownAria: "Countdown to the wedding",
      whenWhere: "When & Where",
      eventsTitle: "The <em>Celebration</em>",
      theVenue: "The Venue",
      venueTitle: "Find Us <em>There</em>",
      mapTitle: "Map to the wedding venue",
      openInMaps: "Open in Google Maps \u2197",
      shareInvitation: "Share this Invitation",
      shareAria: "Share this invitation",
      share: "Share",
      viewOnMap: "View on Map \u2197",
      addToCalendar: "Add to Calendar \u2197",
      labelDate: "Date",
      labelTime: "Time",
      labelVenue: "Venue",
      labelAddress: "Address",
      linkCopied: "Link copied to clipboard",
      shareText: "You\u2019re invited \u2014 {names} \u00B7 {date} \u00B7 {city}",
      calendarDetails: "We would be honoured by your presence. {hashtag}",
      switchTo: "Switch to Bangla",
    },
    bn: {
      documentTitleSuffix: "বিয়ের আমন্ত্রণ",
      nameSep: "ও",
      heroAmp: "ও",
      eyebrowWedding: "বিবাহবন্ধনে",
      introHint: "খাম খুলতে সিলে চাপ দিন",
      introSkip: "এড়িয়ে যান",
      introCardEyebrow: "আপনাদের আন্তরিক আমন্ত্রণ — বিবাহবন্ধনে",
      introSealAria: "সিল ভেঙে আমন্ত্রণ খুলুন",
      scroll: "নিচে দেখুন",
      saveTheDate: "তারিখটি মনে রাখুন",
      countdownTitle: "মুহূর্ত গুনছি<br /><em>চিরকালের জন্য</em>",
      days: "দিন",
      hours: "ঘণ্টা",
      minutes: "মিনিট",
      seconds: "সেকেন্ড",
      countdownAria: "বিয়ের কাউন্টডাউন",
      whenWhere: "কখন ও কোথায়",
      eventsTitle: "<em>উদ্‌যাপন</em>",
      theVenue: "স্থান",
      venueTitle: "আমাদের খুঁজুন <em>এখানে</em>",
      mapTitle: "বিয়ের স্থানের মানচিত্র",
      openInMaps: "গুগল ম্যাপে খুলুন \u2197",
      shareInvitation: "এই আমন্ত্রণটি শেয়ার করুন",
      shareAria: "এই আমন্ত্রণটি শেয়ার করুন",
      share: "শেয়ার",
      viewOnMap: "মানচিত্রে দেখুন \u2197",
      addToCalendar: "ক্যালেন্ডারে যোগ করুন \u2197",
      labelDate: "তারিখ",
      labelTime: "সময়",
      labelVenue: "স্থান",
      labelAddress: "ঠিকানা",
      linkCopied: "লিংক কপি হয়েছে",
      shareText: "আপনি আমন্ত্রিত \u2014 {names} \u00B7 {date} \u00B7 {city}",
      calendarDetails: "আপনাদের উপস্থিতিই আমাদের সৌভাগ্য। {hashtag}",
      switchTo: "ইংরেজিতে পরিবর্তন করুন",
    },
  };

  var BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

  var bnAvailable = !!(cfg.bn && typeof cfg.bn === "object" && !Array.isArray(cfg.bn));
  var lang = "en";
  var t = UI.en;       // current UI strings
  var c = cfg;         // current content config (English, or merged with cfg.bn)
  var revealIO = null; // created lazily by observeReveal()

  function isPlainObject(o) {
    return !!o && typeof o === "object" && !Array.isArray(o);
  }

  // Merge the Bangla mirror over the English config. Plain objects merge
  // key by key (a bn block may localise only some fields); arrays replace.
  function deepMerge(base, over) {
    var out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    Object.keys(over).forEach(function (k) {
      out[k] = isPlainObject(base && base[k]) && isPlainObject(over[k])
        ? deepMerge(base[k], over[k])
        : over[k];
    });
    return out;
  }

  // Localise generated numerals (countdown, footer date) to Bangla digits.
  function L(value) {
    var s = String(value);
    if (lang !== "bn") return s;
    return s.replace(/[0-9]/g, function (d) { return BN_DIGITS[+d]; });
  }

  function initialLang() {
    if (!bnAvailable) return "en";
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved === "bn" || saved === "en") return saved;
    } catch (e) { /* storage unavailable (private mode etc.) */ }
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || "";
    return String(nav).toLowerCase().indexOf("bn") === 0 ? "bn" : "en";
  }

  function setLang(next, persist) {
    lang = UI[next] ? next : "en";
    t = UI[lang];
    c = (lang === "bn" && bnAvailable) ? deepMerge(cfg, cfg.bn) : cfg;
    if (persist) {
      try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ }
    }
    applyLanguage();
  }

  /* ============ 1. Hydrate content slots ============ */
  // Every slot is filled everywhere it appears (hero AND intro card share
  // some of them), so each attribute maps through $$.
  function hydrateContent() {
    var slots = {
      "data-initials": c.couple.initials,
      "data-intro-initials": c.couple.initials,
      "data-name1": c.couple.name1,
      "data-name2": c.couple.name2,
      "data-intro-name1": c.couple.name1,
      "data-intro-name2": c.couple.name2,
      "data-date-display": c.dateDisplay,
      "data-intro-date": c.dateDisplay,
      "data-city": c.city,
      "data-blessing": c.blessing,
      "data-welcome-eyebrow": c.welcome.eyebrow,
      "data-parents1": c.welcome.parents1,
      "data-parents2": c.welcome.parents2,
      "data-invite-line": c.welcome.inviteLine,
      "data-countdown-note": c.countdownNote,
      "data-venue-name": c.venue.name,
      "data-venue-address": (c.venue.address || ""),
      "data-closing": c.closing,
      "data-footer-names": c.couple.name1 + " " + t.nameSep + " " + c.couple.name2,
      "data-footer-date": L(formatDateShort()) + " \u00B7 " + c.city.replace(/,.*/, ""),
      "data-hashtag": c.couple.hashtag,
      "data-credit": c.credit,
    };

    Object.keys(slots).forEach(function (attr) {
      $$("[" + attr + "]").forEach(function (el) {
        el.textContent = slots[attr];
      });
    });

    // Document title & social meta follow the couple and the language.
    var title = c.couple.name1 + " " + t.nameSep + " " + c.couple.name2 + " \u2014 " + t.documentTitleSuffix;
    document.title = title;
    var ogTitle = $('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);
  }

  // Swap every language-dependent piece of the page in one pass.
  function applyLanguage() {
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach(function (el) {
      var v = t[el.getAttribute("data-i18n")];
      if (typeof v === "string") el.textContent = v;
    });
    $$("[data-i18n-html]").forEach(function (el) {
      var v = t[el.getAttribute("data-i18n-html")];
      if (typeof v === "string") el.innerHTML = v;
    });
    $$("[data-i18n-aria]").forEach(function (el) {
      var v = t[el.getAttribute("data-i18n-aria")];
      if (typeof v === "string") el.setAttribute("aria-label", v);
    });
    $$("[data-i18n-title]").forEach(function (el) {
      var v = t[el.getAttribute("data-i18n-title")];
      if (typeof v === "string") el.setAttribute("title", v);
    });
    var toastEl = $("#toast");
    if (toastEl) toastEl.textContent = t.linkCopied;
    hydrateContent();
    renderEvents();
    fitNames();
    updateToggleUI();
    // Re-render countdown digits immediately (e.g. ৪২ vs 42); no-op before
    // the countdown section has initialised.
    if (typeof refreshCountdown === "function") refreshCountdown();
  }

  /* Keep each name on a single line: shrink the script font until it fits.
     Below 18px, give up and allow wrapping (very long names). */
  function fitNames() {
    $$(".hero__name").forEach(function (el) {
      el.style.whiteSpace = "nowrap";
      el.style.fontSize = "";
      var max = el.parentElement.clientWidth;
      var size = parseFloat(window.getComputedStyle(el).fontSize);
      var guard = 30;
      while (size > 18 && el.scrollWidth > max && guard-- > 0) {
        size -= 1;
        el.style.fontSize = size + "px";
      }
      if (el.scrollWidth > max) el.style.whiteSpace = "";
    });
  }
  window.addEventListener("resize", fitNames);
  // Re-measure once webfonts are in — late-loading script faces change name
  // widths, and the fit must be computed against the real font.
  if (document.fonts && document.fonts.ready && document.fonts.ready.then) {
    document.fonts.ready.then(fitNames);
  }

  function formatDateShort() {
    // "12 · 02 · 2027" from weddingDateTime (manual parse, venue-local).
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(cfg.weddingDateTime);
    return m ? m[3] + " \u00B7 " + m[2] + " \u00B7 " + m[1] : "";
  }

  /* ============ 2. Event cards ============ */
  var ICONS = {
    date: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>',
    time: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 13.5"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  };

  var list = $("#eventList");

  function renderEvents() {
    if (!list) return;
    if (!c.events || !c.events.length) { list.innerHTML = ""; return; }
    // If the current cards were already revealed, re-rendered ones appear
    // instantly instead of animating in a second time.
    var cards = $$(".event-card");
    var alreadyIn = cards.length > 0 && cards.every(function (el) {
      return el.classList.contains("is-in");
    });
    list.innerHTML = c.events.map(renderEvent).join("");
    $$(".event-card").forEach(function (el) {
      if (alreadyIn) el.classList.add("is-in");
      else observeReveal(el);
    });
  }

  function renderEvent(ev) {
    var mapUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(ev.mapQuery || ev.venue || "");
    var calUrl = buildCalendarUrl(ev);
    return (
      '<article class="event-card reveal">' +
      '<p class="event-card__tag">' + esc(ev.tag) + "</p>" +
      '<h3 class="event-card__name">' + esc(ev.name) + "</h3>" +
      (ev.tagline ? '<p class="event-card__tagline">' + esc(ev.tagline) + "</p>" : "") +
      '<div class="event-card__divider" aria-hidden="true"></div>' +
      '<dl class="event-card__rows">' +
      row(ICONS.date, t.labelDate, ev.date) +
      row(ICONS.time, t.labelTime, ev.time) +
      row(ICONS.pin, t.labelVenue, ev.venue) +
      (ev.address ? row('<span class="row__dot" aria-hidden="true"></span>', t.labelAddress, ev.address) : "") +
      "</dl>" +
      '<div class="event-card__actions">' +
      '<a class="link-btn" href="' + mapUrl + '" target="_blank" rel="noopener">' + esc(t.viewOnMap) + "</a>" +
      (calUrl ? '<a class="link-btn link-btn--calendar" href="' + calUrl + '" target="_blank" rel="noopener">' + esc(t.addToCalendar) + "</a>" : "") +
      "</div></article>"
    );
  }

  function row(icon, label, value) {
    return '<div class="row"><dt>' + icon + "<span>" + label + "</span></dt><dd>" + esc(value) + "</dd></div>";
  }

  function buildCalendarUrl(ev) {
    if (!ev.calDate || !ev.calStart || !ev.calEnd) return "";
    var start = ev.calDate.replace(/-/g, "") + "T" + ev.calStart.replace(":", "") + "00";
    var end = ev.calDate.replace(/-/g, "") + "T" + ev.calEnd.replace(":", "") + "00";
    var params = {
      action: "TEMPLATE",
      text: c.couple.name1 + " " + t.nameSep + " " + c.couple.name2 + " \u2014 " + ev.name,
      dates: start + "/" + end,
      details: t.calendarDetails.replace("{hashtag}", c.couple.hashtag),
      location: [ev.venue, ev.address].filter(Boolean).join(", "),
    };
    if (ev.calTz) params.ctz = ev.calTz;
    return "https://calendar.google.com/calendar/render?" + Object.keys(params)
      .map(function (k) { return k + "=" + encodeURIComponent(params[k]); })
      .join("&");
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  /* ============ 3. Map ============ */
  var mapFrame = $("#venueMap");
  if (mapFrame && cfg.venue.mapQuery) {
    var zoom = cfg.venue.mapZoom || 15;
    mapFrame.src =
      "https://maps.google.com/maps?q=" + encodeURIComponent(cfg.venue.mapQuery) +
      "&z=" + zoom + "&output=embed";
  }
  $$("[data-directions]").forEach(function (a) {
    if (cfg.venue.mapQuery) {
      a.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(cfg.venue.mapQuery);
    }
  });

  /* ============ 4. Language init + EN/বাং toggle ============ */
  var langToggle = $("#langToggle");

  function updateToggleUI() {
    if (!langToggle) return;
    var enOpt = langToggle.querySelector("[data-lang-opt='en']");
    var bnOpt = langToggle.querySelector("[data-lang-opt='bn']");
    if (enOpt) enOpt.classList.toggle("is-active", lang === "en");
    if (bnOpt) bnOpt.classList.toggle("is-active", lang === "bn");
    langToggle.setAttribute("aria-label", t.switchTo);
  }

  if (langToggle) {
    if (bnAvailable) {
      langToggle.addEventListener("click", function () {
        setLang(lang === "bn" ? "en" : "bn", true);
      });
    } else {
      // No Bangla content configured — hide the toggle, English-only site.
      langToggle.hidden = true;
    }
  }

  setLang(initialLang(), false);

  /* ============ 5. The envelope intro ============
     Phases (classes land in this order; CSS keyframes do the acting):
       is-opening → seal cracks + sparkle burst, float stops
       is-flap    → flap rotates open in 3D (z-index drops at 90°)
       is-letter  → letter rises out of the pocket
       is-card    → title card unfolds over everything, envelope parks
       is-leaving → card fades, hero cascades in underneath
       is-done    → intro removed from the layout
     Anything the guest clicks mid-sequence fast-forwards to the card. */
  var intro = $("#intro");
  var envelope = $("#envelope");
  var sealBtn = $("#introSeal");
  var skipBtn = $("#introSkip");

  // The title card starts unfolding almost as soon as the letter finishes
  // rising, then remains full-screen long enough to read.
  var TIMING = { flap: 350, letter: 1300, card: 2500, leave: 4800, done: 5800 };
  var timers = [];
  var seqStarted = false;
  var seqFinished = false;

  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function revealHero() {
    document.body.classList.add("is-live");
  }

  function unlockAndReveal() {
    document.body.classList.remove("is-locked");
    revealHero();
    // Hand focus to the content so keyboard guests aren't stranded.
    var hero = $(".hero");
    if (hero) {
      hero.setAttribute("tabindex", "-1");
      hero.focus({ preventScroll: true });
    }
  }

  function finishIntro() {
    if (seqFinished) return;
    seqFinished = true;
    clearTimers();
    if (intro) {
      intro.classList.add("is-done");
      setTimeout(function () {
        if (intro.parentNode) intro.parentNode.removeChild(intro);
      }, 120);
    }
    try { sessionStorage.setItem("invite-opened", "1"); } catch (e) { /* ignore */ }
    unlockAndReveal();
  }

  function spawnSparkles() {
    var holder = $("#introSparkles");
    if (!holder) return;
    for (var i = 0; i < 14; i++) {
      var s = document.createElement("span");
      var ang = Math.random() * Math.PI * 2;
      var dist = 36 + Math.random() * 74;
      s.style.setProperty("--dx", (Math.cos(ang) * dist).toFixed(0) + "px");
      s.style.setProperty("--dy", (Math.sin(ang) * dist - 14).toFixed(0) + "px");
      s.style.setProperty("--t", (0.7 + Math.random() * 0.6).toFixed(2) + "s");
      s.style.setProperty("--dl", (Math.random() * 0.15).toFixed(2) + "s");
      holder.appendChild(s);
    }
    setTimeout(function () { holder.innerHTML = ""; }, 1900);
  }

  function startSequence() {
    if (seqStarted || seqFinished || !envelope) return;
    seqStarted = true;
    if (sealBtn) sealBtn.disabled = true;
    if (skipBtn) skipBtn.hidden = false;
    envelope.classList.add("is-opening");
    if (intro) intro.classList.add("is-opening");
    spawnSparkles();
    at(TIMING.flap, function () { envelope.classList.add("is-flap"); });
    at(TIMING.letter, function () { envelope.classList.add("is-letter"); });
    at(TIMING.card, function () {
      envelope.classList.add("is-parked");
      if (intro) intro.classList.add("is-card");
    });
    at(TIMING.leave, function () {
      revealHero();
      if (intro) intro.classList.add("is-leaving");
    });
    at(TIMING.done, finishIntro);
  }

  function fastForward() {
    if (!seqStarted || seqFinished) return;
    clearTimers();
    if (envelope) envelope.classList.add("is-flap", "is-letter", "is-parked");
    if (intro) {
      intro.classList.add("is-card");
      at(150, function () {
        revealHero();
        intro.classList.add("is-leaving");
      });
    }
    at(1000, finishIntro);
  }

  function skipStraightToSite() {
    seqFinished = true; // sequence can never start now
    if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
    unlockAndReveal();
  }

  (function initIntro() {
    var introEnabled = !(cfg.intro && cfg.intro.enabled === false);
    var openedBefore = false;
    try { openedBefore = sessionStorage.getItem("invite-opened") === "1"; } catch (e) { /* ignore */ }
    var oncePerSession = !!(cfg.intro && cfg.intro.oncePerSession);

    if (!introEnabled || (openedBefore && oncePerSession)) {
      skipStraightToSite();
      return;
    }
    // A session flag exists but oncePerSession is off — show the envelope.
    document.documentElement.classList.remove("no-intro");

    if (!intro || !envelope || !sealBtn) {
      skipStraightToSite();
      return;
    }

    if (sealBtn) {
      sealBtn.setAttribute("aria-label", t.introSealAria);
      sealBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (prefersReducedMotion()) {
          seqStarted = true;
          finishIntro();
          return;
        }
        startSequence();
      });
    }
    if (skipBtn) {
      skipBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (seqStarted) fastForward();
      });
    }
    // Click anywhere else mid-sequence fast-forwards too.
    intro.addEventListener("click", function () {
      if (seqStarted) fastForward();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && seqStarted && !seqFinished) fastForward();
    });
  })();

  /* ============ 6. Countdown ============ */
  var target = new Date(cfg.weddingDateTime).getTime();
  var elD = $("#cdDays"), elH = $("#cdHours"), elM = $("#cdMinutes"), elS = $("#cdSeconds");
  var refreshCountdown = null; // language swaps call this to re-render digits

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  // Swap a digit only when it changed, and let it settle in softly
  // instead of hard-swapping every second.
  function setNum(el, val) {
    if (!el || el.textContent === val) return;
    el.textContent = val;
    el.classList.remove("is-settling");
    void el.offsetWidth; // restart the settle animation
    el.classList.add("is-settling");
  }

  function tick() {
    var diff = target - Date.now();
    var done = diff <= 0;
    setNum(elD, done ? L("00") : L(pad(Math.floor(diff / 864e5))));
    setNum(elH, done ? L("00") : L(pad(Math.floor(diff / 36e5) % 24)));
    setNum(elM, done ? L("00") : L(pad(Math.floor(diff / 6e4) % 60)));
    setNum(elS, done ? L("00") : L(pad(Math.floor(diff / 1e3) % 60)));
  }
  if (!isNaN(target)) {
    refreshCountdown = tick;
    tick();
    setInterval(tick, 1000);
  }

  /* ============ 7. Share ============ */
  var toast = $("#toast");
  var toastTimer;

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, 2600);
  }

  function share() {
    var data = {
      title: document.title,
      text: t.shareText
        .replace("{names}", c.couple.name1 + " " + t.nameSep + " " + c.couple.name2)
        .replace("{date}", c.dateDisplay)
        .replace("{city}", c.city),
      url: location.origin === "null" || location.protocol === "file:"
        ? "https://your-invite-link.example"
        : location.href,
    };
    if (navigator.share) {
      navigator.share(data).catch(function () { /* user dismissed */ });
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(data.url).then(
        function () { showToast(t.linkCopied); },
        function () { fallbackCopy(data.url); }
      );
      return;
    }
    fallbackCopy(data.url);
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast(t.linkCopied);
    } catch (e) {
      showToast(text);
    }
    document.body.removeChild(ta);
  }

  ["#shareBtn", "#shareFab"].forEach(function (sel) {
    var btn = $(sel);
    if (btn) btn.addEventListener("click", share);
  });

  /* ============ 8. Floating share pill appears after hero ============ */
  var fab = $("#shareFab");
  var hero = $(".hero");
  if (fab && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        fab.classList.toggle("is-visible", !e.isIntersecting);
      });
    }, { rootMargin: "-72px 0px 0px 0px" }).observe(hero);
  } else if (fab) {
    fab.classList.add("is-visible");
  }

  /* ============ 9. Reveal on scroll ============ */
  function observeReveal(el) {
    if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
      el.classList.add("is-in");
      return;
    }
    if (!revealIO) {
      revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            revealIO.unobserve(e.target);
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    }
    revealIO.observe(el);
  }

  if ("IntersectionObserver" in window && !prefersReducedMotion()) {
    [".welcome", ".countdown__panel", ".event-card", ".venue__info", ".venue__frame"].forEach(function (sel) {
      $$(sel).forEach(function (el) { el.classList.add("reveal"); });
    });
    $$(".reveal").forEach(observeReveal);
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ============ 10. Ink-in the scroll ornaments ============
     The welcome ornament and footer sprig draw their strokes when they
     enter the viewport. Without IO or with reduced motion they simply
     render fully drawn. Hero artwork draws via body.is-live instead. */
  var drawers = $$(".welcome .ornament, .sprig--footer");
  if (drawers.length && "IntersectionObserver" in window && !prefersReducedMotion()) {
    var inkIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          inkIo.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    drawers.forEach(function (el) { inkIo.observe(el); });
  } else {
    drawers.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ============ 11. Drifting petals — decorative canvas ============
     A fixed, pointer-transparent canvas floats a handful of translucent
     gold petals down the viewport. Shapes echo the site's line-art
     botanicals in champagne and rose-gold tints. Everything is
     randomised per petal; a slow shared breeze keeps the field from ever
     looking like a looping cycle. */
  (function initPetals() {
    if (prefersReducedMotion()) return;

    var canvas = document.createElement("canvas");
    canvas.className = "petal-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    if (!ctx) { document.body.removeChild(canvas); return; }

    var W = 0, H = 0, MAX = 7;
    var petals = [];
    var rafId = 0, last = 0, nextSpawn = 0, windX = 0;

    function rand(a, b) { return a + Math.random() * (b - a); }

    /* ---- Sprites: pre-rendered once, drawn as images (cheap per frame) ---- */

    var TINTS = [
      { lite: "#efdcae", deep: "#d8b877", line: "rgba(168, 137, 79, 0.55)" },
      { lite: "#e2c48c", deep: "#c6a057", line: "rgba(150, 120, 64, 0.55)" },
      { lite: "#d9ad9a", deep: "#bd8a74", line: "rgba(150, 96, 76, 0.5)" }, // rose gold
    ];

    // Pointed-oval bud, base at (0,0), tip at (0,-len).
    function budPath(c, len, wid) {
      c.beginPath();
      c.moveTo(0, 0);
      c.bezierCurveTo(wid * 0.58, -len * 0.3, wid * 0.5, -len * 0.72, 0, -len);
      c.bezierCurveTo(-wid * 0.5, -len * 0.72, -wid * 0.58, -len * 0.3, 0, 0);
      c.closePath();
    }

    function paintBud(c, len, wid, tint, vein) {
      var g = c.createLinearGradient(0, 0, 0, -len);
      g.addColorStop(0, tint.deep);
      g.addColorStop(1, tint.lite);
      budPath(c, len, wid);
      c.fillStyle = g;
      c.fill();
      c.lineWidth = 0.7;
      c.strokeStyle = tint.line;
      c.stroke();
      if (vein) {
        c.beginPath();
        c.moveTo(0, -len * 0.12);
        c.quadraticCurveTo(wid * 0.1, -len * 0.5, 0, -len * 0.86);
        c.lineWidth = 0.55;
        c.stroke();
      }
    }

    function makeSprite(w, h, painter) {
      var PAD = 3, SS = 2; // padded, drawn at 2x for crisp rotation
      var cv = document.createElement("canvas");
      cv.width = Math.ceil((w + PAD * 2) * SS);
      cv.height = Math.ceil((h + PAD * 2) * SS);
      var c = cv.getContext("2d");
      c.scale(SS, SS);
      c.translate(PAD + w / 2, PAD + h / 2);
      painter(c);
      return { img: cv, w: w + PAD * 2, h: h + PAD * 2 };
    }

    var KINDS = [
      {
        w: 62, dw: 12, dh: 24,
        paint: function (c, tint) { c.translate(0, 11); paintBud(c, 22, 7, tint, true); },
      },
      {
        w: 24, dw: 30, dh: 26,
        paint: function (c, tint) {
          c.rotate(0.08);
          c.save(); c.rotate(0.52); paintBud(c, 19, 6.4, tint, false); c.restore();
          c.save(); c.rotate(-0.52); paintBud(c, 19, 6.4, tint, false); c.restore();
        },
      },
      {
        w: 14, dw: 22, dh: 20,
        paint: function (c, tint) {
          for (var i = 0; i < 5; i++) {
            c.save();
            c.rotate(i * Math.PI * 2 / 5 + 0.3);
            paintBud(c, 7.5, 3.6, tint, false);
            c.restore();
          }
          c.beginPath();
          c.arc(0, 0, 1.8, 0, Math.PI * 2);
          c.fillStyle = tint.deep;
          c.fill();
        },
      },
    ];

    var SPRITES = [];
    TINTS.forEach(function (tint, ti) {
      var tintWeight = [1.15, 1, 0.72][ti];
      KINDS.forEach(function (k) {
        SPRITES.push({ s: makeSprite(k.dw, k.dh, function (c) { k.paint(c, tint); }), w: k.w * tintWeight });
      });
    });

    function pickSprite() {
      var total = 0, i;
      for (i = 0; i < SPRITES.length; i++) total += SPRITES[i].w;
      var r = Math.random() * total;
      for (i = 0; i < SPRITES.length; i++) {
        r -= SPRITES[i].w;
        if (r <= 0) return SPRITES[i].s;
      }
      return SPRITES[0].s;
    }

    function spawnX() {
      if (W > 760 && Math.random() < 0.65) return W / 2 + rand(-340, 340);
      return rand(-30, W + 30);
    }

    function spawn(seeded) {
      var fromCorner = !seeded && Math.random() < 0.3;
      var side = Math.random() < 0.5 ? -1 : 1;
      var x, y, vx;

      if (seeded) {
        var band = Math.random() < 0.22 ? rand(0.3, 0.7)
          : (Math.random() < 0.5 ? rand(0.05, 0.28) : rand(0.72, 0.95));
        x = band * W;
        y = rand(0.06, 0.5) * H;
        vx = rand(-8, 8);
      } else if (fromCorner) {
        x = side < 0 ? rand(-30, W * 0.1) : rand(W * 0.9, W + 30);
        y = rand(-40, H * 0.12);
        vx = side < 0 ? rand(6, 22) : -rand(6, 22);
      } else {
        x = spawnX();
        y = -rand(30, 110);
        vx = rand(-8, 8);
      }

      petals.push({
        spr: pickSprite(),
        scale: rand(0.8, 1.35) * (W < 620 ? 0.9 : 1),
        x: x, y: y, vx: vx,
        vy: rand(20, 46),
        swayAmp: rand(12, 40),
        om: Math.PI * 2 * rand(0.16, 0.4),
        ph: rand(0, Math.PI * 2),
        rot0: rand(0, Math.PI * 2),
        rotV: rand(-0.16, 0.16),
        tilt: rand(0.05, 0.18),
        alpha: rand(0.3, 0.55),
        wf: rand(0.5, 1.4),
        age: 0,
      });
    }

    function scheduleNext(now) {
      nextSpawn = now + (W < 620 ? rand(3400, 7600) : rand(2400, 5600));
    }

    function frame(now) {
      rafId = requestAnimationFrame(frame);
      var dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      var tNow = now / 1000;

      // Slow shared breeze — two incommensurate sines, never quite repeats.
      windX = 6 * Math.sin(tNow * 0.1) + 3.5 * Math.sin(tNow * 0.047 + 2.3);

      if (now >= nextSpawn && petals.length < MAX) {
        spawn(false);
        scheduleNext(now);
      }

      ctx.clearRect(0, 0, W, H);
      for (var i = petals.length - 1; i >= 0; i--) {
        var p = petals[i];
        p.age += dt;
        p.y += p.vy * dt;
        p.x += p.vx * dt;
        if (p.y > H + 110) { petals.splice(i, 1); continue; }

        var sway = Math.sin(p.age * p.om + p.ph);
        var x = p.x + p.swayAmp * sway + windX * p.wf;
        var rot = p.rot0 + p.rotV * p.age + p.tilt * Math.cos(p.age * p.om + p.ph);

        var lifeA = Math.min(1, Math.max(0, p.y / 130)) * Math.max(0, Math.min(1, (H + 90 - p.y) / 190));

        ctx.save();
        ctx.globalAlpha = p.alpha * lifeA;
        ctx.translate(x, p.y);
        ctx.rotate(rot);
        ctx.drawImage(p.spr.img, -p.spr.w * p.scale / 2, -p.spr.h * p.scale / 2, p.spr.w * p.scale, p.spr.h * p.scale);
        ctx.restore();
      }
    }

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      MAX = W < 620 ? 4 : 7;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(W * dpr);
      canvas.height = Math.ceil(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });

    function start() {
      if (!rafId) {
        last = performance.now();
        rafId = requestAnimationFrame(frame);
      }
    }

    function stop() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });

    var mq = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    function onReduceChange() {
      if (mq.matches) {
        stop();
        ctx.clearRect(0, 0, W, H);
      } else {
        start();
      }
    }
    if (mq) {
      if (mq.addEventListener) mq.addEventListener("change", onReduceChange);
      else if (mq.addListener) mq.addListener(onReduceChange);
    }

    resize();
    var seed = W < 620 ? 3 : 4;
    for (var i = 0; i < seed; i++) spawn(true);
    nextSpawn = performance.now() + rand(1600, 3000);
    start();
  })();

  /* ============ 12. Hero parallax — barely-there depth on scroll ============ */
  (function initParallax() {
    if (prefersReducedMotion()) return;
    var heroEl = $(".hero");
    if (!heroEl || !window.requestAnimationFrame) return;

    var ticking = false;
    function apply() {
      ticking = false;
      var y = Math.min(window.scrollY || window.pageYOffset || 0, 900);
      heroEl.style.setProperty("--para-y", (y * 0.12).toFixed(1) + "px");
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(apply);
      }
    }, { passive: true });
    apply();
  })();
})();
