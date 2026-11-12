/* ═══════════════════════════════════════════════════════════════════════
   seasonal.js — Christmas countdown banner + home-page popup
   Our Lady Of Assumption Syro Malabar Catholic Mission

   WHAT IT DOES
   • A slim banner above the top bar on every page (countdown, then
     "Merry Christmas" through Jan 1). Snow in the banner; fireworks while
     it says Merry Christmas.
   • On the HOME page only, a popup on every visit (no "seen" memory)
     with the countdown over the picture. Closes with Close, Esc or a tap outside.
   • Christmas Eve, last 60 seconds: the countdown switches to seconds, the popup
     opens by itself, and at midnight the picture changes to the Holy Family with
     60 seconds of full-screen fireworks.
   • Uses each visitor's own device clock/time zone. No location is asked for.
   • Starts on the Syro-Malabar Annunciation Sunday (first Sunday on/after
     Nov 27) and disappears by itself after Jan 1. Nothing to switch on or off.

   TEST IT (nobody else sees this):
     open  any page with  ?xmas=test   e.g. https://olasyromalabarct.org/?xmas=test
     or    ?xmas=2026-12-24T23:58:30    (jump to a date/time, local)
     and   ?xmas=off  to leave test mode. A red panel appears bottom-left.

   Wording is in the TXT block below. Everything else is automatic.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── EDIT THE WORDING HERE ─────────────────────────────────────────── */
  var TXT = {
    day: "Day", days: "Days", second: "Second", seconds: "Seconds",
    toXmas: " to Christmas",
    merryEn: "Merry Christmas",
    merryMl: "ക്രിസ്തുമസ് ആശംസകൾ",
    /* One short prayer per day before Christmas — English only, to keep the pop-up small.
       Listed in date order, and the LAST line is always Christmas Eve. The lines below are
       dated for 2026 (the season starts Sun Nov 29 = 26 days to go). In a year when the
       season starts a few days earlier the first prayer is simply shown for those extra
       days. Edit, replace or reword any line freely; keep each to about 25 words so it
       fits. Keep the quotes and the commas. */
    prayers: [
      "Lord Jesus, as this season of waiting begins, open our hearts to listen for You each day. Amen.", // Nov 29  (26 days to Christmas)
      "Heavenly Father, quiet the noise within us, so that we may hear Your gentle voice calling us closer to You. Amen.", // Nov 30  (25 days to Christmas)
      "Lord Jesus, teach us to wait with hope, trusting that You are always near. Amen.", // Dec 1  (24 days to Christmas)
      "Holy Spirit, prepare a place in our hearts where Jesus can be born again this Christmas. Amen.", // Dec 2  (23 days to Christmas)
      "Lord, make us humble, so that we welcome You with open hearts and empty hands, as the shepherds did. Amen.", // Dec 3  (22 days to Christmas)
      "Father, forgive what keeps us from You. Cleanse our hearts, so that we may receive Your Son with joy. Amen.", // Dec 4  (21 days to Christmas)
      "Jesus, Light of the World, shine into the dark corners of our hearts and homes. Amen.", // Dec 5  (20 days to Christmas)
      "Mary, our Mother, teach us to say yes to God as you did, with a trusting heart. Amen.", // Dec 6  (19 days to Christmas)
      "Lord, help us to pray every day, even when we are busy, so that our hearts are ready for You. Amen.", // Dec 7  (18 days to Christmas)
      "Father, give us courage to be faithful in small things, as Mary was faithful to Your word. Amen.", // Dec 8  (17 days to Christmas)
      "Jesus, free us from worry and hurry. Fill our families with Your peace this Christmas season. Amen.", // Dec 9  (16 days to Christmas)
      "Lord, make our hearts grateful. Thank You for the many gifts we receive each day. Amen.", // Dec 10  (15 days to Christmas)
      "Holy Spirit, help us to listen to our children, our parents and one another with patience and love. Amen.", // Dec 11  (14 days to Christmas)
      "Father, bless every family preparing for Christmas, and be close to those who feel alone. Amen.", // Dec 12  (13 days to Christmas)
      "Lord Jesus, give us the joy of Mary, who hurried to serve others. Make us quick to help. Amen.", // Dec 13  (12 days to Christmas)
      "Jesus, teach us to forgive as You forgive. Heal what is broken between us before Christmas. Amen.", // Dec 14  (11 days to Christmas)
      "Father, open our eyes to the needs around us, and make us generous with our time and our gifts. Amen.", // Dec 15  (10 days to Christmas)
      "Lord, bless our parish family. Make us one heart as we prepare to welcome Your Son. Amen.", // Dec 16  (9 days to Christmas)
      "Jesus, You came for the poor and the lost. Make our hearts as simple and welcoming as Your manger. Amen.", // Dec 17  (8 days to Christmas)
      "Holy Spirit, fill us with the joy that no gift can give: the joy of knowing that God is with us. Amen.", // Dec 18  (7 days to Christmas)
      "Father, we bring You our worries and our hopes. Help us to trust Your plan, as Saint Joseph did. Amen.", // Dec 19  (6 days to Christmas)
      "Saint Joseph, quiet and faithful guardian, pray for us to listen to God and obey with a peaceful heart. Amen.", // Dec 20  (5 days to Christmas)
      "Lord Jesus, only a few days remain. Come into our hearts, our homes and our world. Amen.", // Dec 21  (4 days to Christmas)
      "Prince of Peace, bring peace to every home, to every nation and to every troubled heart. Amen.", // Dec 22  (3 days to Christmas)
      "Come, Lord Jesus. We are ready to welcome You with love, with gratitude and with joy. Amen.", // Dec 23  (2 days to Christmas)
      "Tonight Heaven comes down to earth. Lord Jesus, be born in our hearts, and stay with us always. Amen."  // Dec 24  (1 day to Christmas)
    ],
    // Shown under the picture from Dec 25 (PLACEHOLDERS — replace with the parish's own message)
    xmasEn: "Glory to God in the Highest!",
    xmasMl: "അത്യുന്നതങ്ങളിൽ ദൈവത്തിനു മഹത്വം",
    altA: "An empty manger under a starry night sky",
    altB: "Mary and Joseph watching over the infant Jesus in the manger"
  };
  var IMG_A = "images/xmas-prepare", IMG_B = "images/xmas-christmas";
  var FIREWORKS_SECONDS = 60;      // full-screen show at midnight
  var ARRIVAL_BURST_SECONDS = 10;  // small burst when someone arrives later in Christmas week
  var SPARKLE_EVERY_MS = 5000;     // a small burst every few seconds after that

  var SS_TEST = "ola_season_test_v1", SS_HIDE = "ola_season_bar_hidden_v1";
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var lowEnd = (navigator.hardwareConcurrency || 4) <= 2;

  function ssGet(k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { if (v == null) window.sessionStorage.removeItem(k); else window.sessionStorage.setItem(k, v); } catch (e) {} }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* ── Test mode state (clock offset, reduced-motion pretend) ────────── */
  var test = { on: false, offset: 0, rm: null };

  function parseLocal(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(v || "");
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)).getTime();
  }
  function realYear() { return new Date().getFullYear(); }
  function presetMs(mo, d, h, mi, s) { return new Date(realYear(), mo - 1, d, h || 0, mi || 0, s || 0).getTime(); }
  function saveTest() { ssSet(SS_TEST, test.on ? JSON.stringify({ on: true, offset: test.offset, rm: test.rm }) : null); }

  (function readTest() {
    var m = /[?&]xmas=([^&#]*)/.exec(window.location.search || "");
    var v = m ? decodeURIComponent(m[1]) : "";
    if (v === "off") { ssSet(SS_TEST, null); ssSet(SS_HIDE, null); return; }
    if (v) {
      var t = v === "test" ? presetMs(12, 15, 10, 0, 0) : parseLocal(v);
      if (t != null) { test.on = true; test.offset = t - Date.now(); ssSet(SS_HIDE, null); saveTest(); }
      return;
    }
    var s = ssGet(SS_TEST);
    if (s) { try { var o = JSON.parse(s); if (o && o.on) { test.on = true; test.offset = +o.offset || 0; test.rm = o.rm == null ? null : !!o.rm; } } catch (e) {} }
  })();

  function nowMs() { return Date.now() + (test.on ? test.offset : 0); }
  function reduced() { return test.on && test.rm != null ? test.rm : !!(mq && mq.matches); }

  /* ── The calendar: when does the season run? ───────────────────────── */
  function seasonFor(ms) {
    var d = new Date(ms), y = d.getFullYear();
    if (d.getMonth() === 0 && d.getDate() <= 1) y--;            // Jan 1 still belongs to last year's season
    var a = new Date(y, 10, 27);                                  // Annunciation Sunday = first Sunday on/after Nov 27
    a.setDate(27 + ((7 - a.getDay()) % 7));
    return { start: a.getTime(), xmas: new Date(y, 11, 25).getTime(), end: new Date(y + 1, 0, 2).getTime() };
  }
  /* → {p:"off"} | {p:"count",days} | {p:"last",secs} | {p:"xmas",since} */
  function phaseAt(ms) {
    var s = seasonFor(ms);
    if (ms < s.start || ms >= s.end) return { p: "off" };
    if (ms >= s.xmas) return { p: "xmas", since: (ms - s.xmas) / 1000 };
    var left = s.xmas - ms;
    if (left <= 60000) return { p: "last", secs: Math.ceil(left / 1000) };
    var d = new Date(ms), d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    return { p: "count", days: Math.round((s.xmas - d0) / 86400000) };
  }

  /* Reserve the banner's space straight away so the page does not jump when it appears */
  (function early() {
    try { if (phaseAt(nowMs()).p !== "off" && ssGet(SS_HIDE) !== "1") root.classList.add("season-on"); } catch (e) {}
  })();

  /* ═════════ shared animation loop ═════════ */
  var Loop = {
    subs: [], raf: 0, last: 0,
    add: function (f) { if (this.subs.indexOf(f) < 0) this.subs.push(f); this.start(); },
    remove: function (f) { var i = this.subs.indexOf(f); if (i >= 0) this.subs.splice(i, 1); },
    start: function () {
      if (this.raf) return;
      var self = this;
      this.last = performance.now();
      function frame(t) {
        var dt = Math.min(0.05, (t - self.last) / 1000);
        self.last = t;
        var list = self.subs.slice();
        for (var i = 0; i < list.length; i++) list[i](dt);
        self.raf = self.subs.length ? requestAnimationFrame(frame) : 0;
      }
      this.raf = requestAnimationFrame(frame);
    }
  };

  /* ═════════ snow (one small canvas) ═════════ */
  function Snow(canvas, o) {
    var ctx = canvas.getContext("2d"), w = 0, h = 0, flakes = [], on = false, dpr = 1, ro = null;
    function size() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(o.max, Math.round(w * h / o.density));
      if (lowEnd) n = Math.round(n / 2);
      while (flakes.length < n) flakes.push(make(true));
      flakes.length = Math.min(flakes.length, n);
    }
    function make(anywhere) {
      return { x: Math.random() * w, y: anywhere ? Math.random() * h : -4, r: rnd(o.r0, o.r1), v: rnd(o.v0, o.v1),
               p: Math.random() * 6.28, s: rnd(0.6, 1.6), sw: rnd(4, 14), a: rnd(0.5, 0.95) };
    }
    function step(dt) {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.y += f.v * dt; f.p += f.s * dt; f.x += Math.sin(f.p) * f.sw * dt;
        if (f.y - f.r > h) { f.y = -f.r; f.x = Math.random() * w; }
        if (f.x < -4) f.x = w + 4; else if (f.x > w + 4) f.x = -4;
        ctx.globalAlpha = f.a;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    return {
      start: function () {
        if (on || reduced()) return;
        on = true; size(); Loop.add(step);
        if (window.ResizeObserver) { ro = new ResizeObserver(size); ro.observe(canvas); } else window.addEventListener("resize", size);
      },
      stop: function () {
        if (!on) return; on = false; Loop.remove(step);
        if (ro) { ro.disconnect(); ro = null; } else window.removeEventListener("resize", size);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }

  /* ═════════ fireworks (one full-screen transparent canvas, only while needed) ═════════ */
  var Fx = (function () {
    var cv = null, ctx = null, W = 0, H = 0, dpr = 1, parts = [], rockets = [];
    var mode = null, t = 0, spawnT = 0, endAt = 0, volley = false, small = false, cap = 500, lastSparkle = 0;
    var COLORS = ["#ffd76a", "#fff4d6", "#ff6b6b", "#7bed9f", "#74b9ff", "#ff9ff3", "#ffb86b"];

    function resize() {
      if (!cv) return;
      W = window.innerWidth; H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function ensure() {
      if (cv) return;
      small = window.innerWidth < 700;
      cap = (small ? 260 : 520) / (lowEnd ? 2 : 1);
      cv = document.createElement("canvas"); cv.id = "olaFx"; cv.setAttribute("aria-hidden", "true");
      document.body.appendChild(cv); ctx = cv.getContext("2d");
      resize(); window.addEventListener("resize", resize);
      Loop.add(step);
    }
    function release() {
      if (!cv) return;
      Loop.remove(step); window.removeEventListener("resize", resize);
      if (cv.parentNode) cv.parentNode.removeChild(cv);
      cv = ctx = null; parts.length = 0; rockets.length = 0; mode = null;
    }
    function color() { return COLORS[(Math.random() * COLORS.length) | 0]; }
    function burst(x, y, big) {
      if (parts.length > cap) return;
      var n = big ? (small ? 38 : 66) : (small ? 16 : 26), c1 = color(), c2 = color(), sp = big ? rnd(150, 250) : rnd(75, 115);
      for (var i = 0; i < n; i++) {
        var a = (i / n) * 6.2832 + rnd(-0.08, 0.08), s = sp * rnd(0.55, 1);
        parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: 0, m: big ? rnd(1.1, 1.9) : rnd(0.8, 1.3),
                     c: i % 4 === 0 ? c2 : c1, z: big ? 2.2 : 1.7 });
      }
    }
    function rocket() {
      if (rockets.length > 10) return;
      var ty = rnd(0.12, 0.5) * H;
      rockets.push({ x: rnd(0.1, 0.9) * W, y: H, ty: ty, vx: rnd(-20, 20), vy: -(H - ty) / rnd(0.75, 1.1), c: color() });
    }
    function bannerBurst() { burst(rnd(0.05, 0.95) * W, rnd(8, 52), false); }

    function schedule(dt) {
      if (mode === "full") {
        t += dt;
        if (t >= FIREWORKS_SECONDS) { mode = null; return; }
        spawnT -= dt;
        while (spawnT <= 0) {
          if (t < 20)      { rocket(); if (!small || Math.random() < 0.5) rocket(); spawnT += small ? 0.42 : 0.3; }
          else if (t < 50) { rocket(); spawnT += 0.8; }
          else             { rocket(); if (Math.random() < 0.7) rocket(); spawnT += 0.24; }
        }
        if (!volley && t >= FIREWORKS_SECONDS - 3) {      // grand finale
          volley = true;
          for (var i = 0; i < (small ? 5 : 8); i++) rocket();
        }
      } else if (mode === "banner") {
        t += dt;
        if (t >= endAt) { mode = null; return; }
        spawnT -= dt;
        while (spawnT <= 0) { bannerBurst(); spawnT += rnd(0.35, 0.7); }
      }
    }
    function step(dt) {
      if (!cv) return;
      schedule(dt);
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      var i, p;
      for (i = rockets.length - 1; i >= 0; i--) {
        p = rockets[i];
        p.x += p.vx * dt; p.y += p.vy * dt;
        ctx.globalAlpha = 1; ctx.fillStyle = "#fff3c4"; ctx.fillRect(p.x - 1, p.y - 1, 2.4, 6);
        if (p.y <= p.ty) { burst(p.x, p.y, true); rockets.splice(i, 1); }
      }
      var fr = Math.max(0, 1 - 1.5 * dt);
      for (i = parts.length - 1; i >= 0; i--) {
        p = parts[i]; p.l += dt;
        if (p.l >= p.m) { parts.splice(i, 1); continue; }
        p.vx *= fr; p.vy = p.vy * fr + 70 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        var k = p.l / p.m;
        ctx.globalAlpha = 1 - k * k; ctx.fillStyle = p.c; ctx.fillRect(p.x - p.z / 2, p.y - p.z / 2, p.z, p.z);
      }
      ctx.globalAlpha = 1;
      if (!mode && !parts.length && !rockets.length) release();
    }
    return {
      /* the 60-second show; skip = seconds already gone (late arrivals join in the middle) */
      full: function (skip) {
        if (reduced()) return;
        ensure(); mode = "full"; t = Math.max(0, skip || 0); spawnT = 0; volley = t >= FIREWORKS_SECONDS - 3;
      },
      banner: function (secs) {
        if (reduced()) return;
        ensure(); if (mode !== "full") { mode = "banner"; t = 0; endAt = secs || ARRIVAL_BURST_SECONDS; spawnT = 0; }
      },
      sparkle: function () { if (reduced()) return; ensure(); bannerBurst(); lastSparkle = Date.now(); },
      stop: function () { mode = null; release(); },
      busy: function () { return !!mode || parts.length > 0; }
    };
  })();

  /* ═════════ banner (every page) ═════════ */
  var bar = null, barTxt = null, barSnow = null, barTextNow = "";
  function barHidden() { return ssGet(SS_HIDE) === "1"; }
  function buildBar() {
    if (bar || !document.body) return;
    bar = document.createElement("div");
    bar.id = "olaSeasonBar"; bar.className = "season-bar";
    bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "Christmas season");
    bar.innerHTML = '<canvas class="season-snow" aria-hidden="true"></canvas>' +
      '<div class="season-msg"><span class="season-ico" aria-hidden="true">🎄</span><span class="season-txt"></span></div>' +
      '<button type="button" class="season-x" aria-label="Hide this banner">✕</button>';
    var skip = document.querySelector(".skip-link");
    if (skip && skip.parentNode === document.body) document.body.insertBefore(bar, skip.nextSibling);
    else document.body.insertBefore(bar, document.body.firstChild);
    barTxt = bar.querySelector(".season-txt");
    bar.querySelector(".season-x").addEventListener("click", function () { ssSet(SS_HIDE, "1"); destroyBar(); });
    root.classList.add("season-on");
    barSnow = Snow(bar.querySelector(".season-snow"), { max: 60, density: 900, r0: 0.7, r1: 1.9, v0: 10, v1: 26 });
    barSnow.start();
    barTextNow = "";
  }
  function destroyBar() {
    if (barSnow) { barSnow.stop(); barSnow = null; }
    if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
    bar = barTxt = null; barTextNow = "";
    root.classList.remove("season-on");
  }
  function unit(n, one, many) { return n + " " + (n === 1 ? one : many); }
  function barText(ph) {
    if (ph.p === "xmas") return TXT.merryEn + " • " + TXT.merryMl;
    if (ph.p === "last") return unit(ph.secs, TXT.second, TXT.seconds) + TXT.toXmas;
    return unit(ph.days, TXT.day, TXT.days) + TXT.toXmas;
  }

  /* ═════════ popup (home page only) ═════════ */
  var pop = null;   // {dim, wrap, card, num, lab, snow, hasB, ...}
  var isHome = false;

  function picture(base, alt, cls) {
    return '<picture class="xs-pic ' + cls + '"><source srcset="' + base + '.webp" type="image/webp">' +
           '<img src="' + base + '.jpg" width="1280" height="720" alt="' + alt + '" decoding="async"></picture>';
  }
  function popLayerB() {
    if (!pop || pop.hasB) return;
    pop.hasB = true;
    var tmp = document.createElement("div");
    tmp.innerHTML = picture(IMG_B, TXT.altB, "xs-pic-b");
    pop.art.insertBefore(tmp.firstChild, pop.art.querySelector(".xs-scrim"));
  }
  function wantsLayerB(ph) { return ph.p === "xmas" || ph.p === "last" || (ph.p === "count" && ph.days <= 1); }

  /* today's prayer: counted back from Christmas Eve, so the last prayer is always Dec 24 */
  function prayerFor(ph) {
    var list = TXT.prayers, n = list.length;
    if (!n) return "";
    var days = ph.p === "count" ? ph.days : 1;                  // last minute of Dec 24 / Christmas = the final prayer
    var i = n - days;
    return list[i < 0 ? 0 : i > n - 1 ? n - 1 : i];
  }

  function openPop(ph) {
    if (!isHome || pop || !document.body) return;
    var wrap = document.createElement("div"), dim = document.createElement("div");
    dim.className = "xs-dim"; dim.id = "olaXmasDim";
    wrap.className = "xs-wrap"; wrap.id = "olaXmasPop";
    wrap.setAttribute("role", "dialog"); wrap.setAttribute("aria-modal", "true"); wrap.setAttribute("aria-label", "Christmas countdown");
    wrap.innerHTML =
      '<div class="xs-card" tabindex="-1">' +
        '<div class="xs-art">' + picture(IMG_A, TXT.altA, "xs-pic-a") +
          '<div class="xs-scrim"></div><canvas class="xs-snow" aria-hidden="true"></canvas>' +
          '<div class="xs-top">' +
            '<div class="xs-count"><span class="xs-num"></span><span class="xs-lab"></span></div>' +
            '<div class="xs-merry"><span class="xs-m1">' + TXT.merryEn + '</span><span class="xs-m2" lang="ml">' + TXT.merryMl + '</span></div>' +
          '</div>' +
          '<button type="button" class="xs-close" aria-label="Close"><span class="xs-x"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></span></button>' +
        '</div>' +
        '<div class="xs-body">' +
          '<div class="xs-msg xs-msg-a"><p class="xs-pr"></p></div>' +
          '<div class="xs-msg xs-msg-b"><p class="xs-en">' + TXT.xmasEn + '</p><p class="xs-ml" lang="ml">' + TXT.xmasMl + '</p></div>' +
        '</div>' +
      '</div>';
    pop = { dim: dim, wrap: wrap, card: wrap.querySelector(".xs-card"), art: wrap.querySelector(".xs-art"),
            num: wrap.querySelector(".xs-num"), lab: wrap.querySelector(".xs-lab"), hasB: false,
            prevFocus: document.activeElement, snow: null, closing: false };
    pop.closeBtn = wrap.querySelector(".xs-close");
    pop.closeBtn.addEventListener("click", closePop);
    wrap.addEventListener("click", function (e) { if (e.target === wrap) closePop(); });
    function stopScroll(e) { e.preventDefault(); }
    wrap.addEventListener("wheel", stopScroll, { passive: false });
    wrap.addEventListener("touchmove", stopScroll, { passive: false });
    document.body.appendChild(dim); document.body.appendChild(wrap);
    updatePop(ph);

    var shown = false;
    function show() {
      if (shown || !pop) return; shown = true;
      void wrap.offsetWidth;
      dim.classList.add("xs-open"); wrap.classList.add("xs-open");
      pop.snow = Snow(wrap.querySelector(".xs-snow"), { max: small() ? 40 : 70, density: 2600, r0: 1, r1: 3, v0: 18, v1: 48 });
      pop.snow.start();
      try { pop.card.focus({ preventScroll: true }); } catch (e) {}   // the card, not the × — so no focus ring shows on every visit; Tab still reaches the ×
    }
    var img = wrap.querySelector(".xs-pic-a img");
    if (img.complete) show(); else { img.addEventListener("load", show); img.addEventListener("error", show); setTimeout(show, 1500); }
  }
  function small() { return window.innerWidth < 700; }

  function closePop() {
    if (!pop || pop.closing) return;
    var p = pop; p.closing = true; pop = null;
    if (p.snow) p.snow.stop();
    p.dim.classList.remove("xs-open"); p.wrap.classList.remove("xs-open");
    setTimeout(function () {
      if (p.dim.parentNode) p.dim.parentNode.removeChild(p.dim);
      if (p.wrap.parentNode) p.wrap.parentNode.removeChild(p.wrap);
    }, 300);
    try { if (p.prevFocus && p.prevFocus.focus) p.prevFocus.focus({ preventScroll: true }); } catch (e) {}
  }

  function updatePop(ph) {
    if (!pop) return;
    var x = ph.p === "xmas";
    if (wantsLayerB(ph)) popLayerB();
    pop.wrap.classList.toggle("xs-is-xmas", x);
    if (!x) {
      var pr = pop.wrap.querySelector(".xs-pr"), t = prayerFor(ph);
      if (pr && pr.textContent !== t) pr.textContent = t;
    }
    var a = pop.wrap.querySelector(".xs-pic-a"), b = pop.wrap.querySelector(".xs-pic-b");
    if (a) a.setAttribute("aria-hidden", x ? "true" : "false");
    if (b) b.setAttribute("aria-hidden", x ? "false" : "true");
    if (ph.p === "count") { pop.num.textContent = ph.days; pop.lab.textContent = (ph.days === 1 ? TXT.day : TXT.days) + TXT.toXmas; }
    else if (ph.p === "last") { pop.num.textContent = ph.secs; pop.lab.textContent = (ph.secs === 1 ? TXT.second : TXT.seconds) + TXT.toXmas; }
    pop.wrap.classList.toggle("xs-last", ph.p === "last");
  }

  document.addEventListener("keydown", function (e) {
    if (!pop) return;
    if (e.key === "Escape" || e.key === "Esc") { closePop(); }
    else if (e.key === "Tab" && !(e.target && e.target.closest && e.target.closest(".xs-test"))) { e.preventDefault(); try { pop.closeBtn.focus(); } catch (er) {} }
  });

  /* ═════════ the clock: decides what to show, once per quarter-second ═════════ */
  var cur = null;                // last phase object
  var started = false;
  var reopenedForLast = false;
  var lastSparkleAt = 0;
  var testUI = null;

  function resetAll() {          // used when the test clock is changed
    Fx.stop(); closePopNow(); destroyBar();
    cur = null; reopenedForLast = false; lastSparkleAt = Date.now();
  }
  function closePopNow() {
    if (!pop) return;
    var p = pop; pop = null;
    if (p.snow) p.snow.stop();
    if (p.dim.parentNode) p.dim.parentNode.removeChild(p.dim);
    if (p.wrap.parentNode) p.wrap.parentNode.removeChild(p.wrap);
  }

  function tick() {
    var ph = phaseAt(nowMs()), prev = cur, first = !prev;
    var kind = ph.p, pkind = prev ? prev.p : null;
    cur = ph;

    if (kind === "off") {
      if (pkind !== "off") { Fx.stop(); closePopNow(); destroyBar(); }
      updateTestUI(ph); return;
    }
    if (!bar && !barHidden()) buildBar();
    if (bar) {
      var txt = barText(ph);
      if (txt !== barTextNow) { barTextNow = txt; barTxt.textContent = txt; }
    }
    if (first || pkind === "off") {
      if (isHome) openPop(ph);
      if (kind === "last" && isHome) reopenedForLast = true;
    }
    if (kind !== pkind) {
      if (kind === "last" && pkind === "count" && isHome && !pop && !reopenedForLast) { reopenedForLast = true; openPop(ph); }
      if (kind === "xmas") {
        if (ph.since < FIREWORKS_SECONDS) Fx.full(ph.since);
        else if (first || pkind === "off") Fx.banner(ARRIVAL_BURST_SECONDS);
        lastSparkleAt = Date.now();
      }
    }
    if (kind === "xmas" && !Fx.busy() && Date.now() - lastSparkleAt > SPARKLE_EVERY_MS && bar && !document.hidden) {
      Fx.sparkle(); lastSparkleAt = Date.now();
    }
    if (pop) updatePop(ph);
    updateTestUI(ph);
  }

  /* ═════════ test panel (only when ?xmas=test) ═════════ */
  function fmtSim(ms) {
    var d = new Date(ms), D = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var h = d.getHours(), ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
    return D[d.getDay()] + " " + M[d.getMonth()] + " " + d.getDate() + ", " + h + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()) + " " + ap;
  }
  function inputVal(ms) {
    var d = new Date(ms);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "T" + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }
  function phaseLabel(ph) {
    if (ph.p === "off") return "season OFF (no banner, no popup)";
    if (ph.p === "count") return "countdown: " + ph.days + (ph.days === 1 ? " day" : " days");
    if (ph.p === "last") return "LAST MINUTE: " + ph.secs + " s";
    return "Merry Christmas period";
  }
  function setSim(ms, label) {
    test.on = true; test.offset = ms == null ? 0 : ms - Date.now(); saveTest();
    resetAll(); tick();
    if (testUI) { testUI.note.textContent = label || ""; testUI.inp.value = inputVal(nowMs()); }
  }
  function updateTestUI(ph) {
    if (!testUI) return;
    var s = fmtSim(nowMs()) + " — " + phaseLabel(ph || phaseAt(nowMs()));
    if (s !== testUI.lastTxt) { testUI.lastTxt = s; testUI.sim.textContent = s; }
  }
  function buildTestUI() {
    if (testUI || !test.on || !document.body) return;
    var el = document.createElement("div");
    el.className = "xs-test"; el.id = "olaXmasTest";
    el.innerHTML =
      '<button type="button" class="xs-test-head" aria-expanded="true"><b>Christmas test mode</b><span class="xs-test-tog">▾</span></button>' +
      '<div class="xs-test-sim"></div>' +
      '<div class="xs-test-body">' +
        '<div class="xs-test-lbl">Jump the clock to</div>' +
        '<div class="xs-test-grid" data-g="presets"></div>' +
        '<div class="xs-test-row"><input type="datetime-local" step="1" aria-label="Pick a date and time"><button type="button" data-a="go">Go</button></div>' +
        '<div class="xs-test-lbl">Try it</div>' +
        '<div class="xs-test-grid" data-g="acts"></div>' +
        '<label class="xs-test-chk"><input type="checkbox" data-a="rm"> Pretend this device asks for reduced motion</label>' +
        '<p class="xs-test-note" aria-live="polite"></p>' +
        '<button type="button" class="xs-test-exit" data-a="exit">Exit test mode</button>' +
      '</div>';
    document.body.appendChild(el);
    var presets = [
      ["Nov 28 • before start", presetMs(11, 28, 12), "Nothing should show: the season has not started."],
      ["Nov 29 • first day", presetMs(11, 29, 9), "Annunciation Sunday: banner + popup, 26 days."],
      ["Dec 15", presetMs(12, 15, 10), ""],
      ["Dec 24 • 3 PM", presetMs(12, 24, 15), "1 Day to Christmas. The Holy Family picture is preloaded."],
      ["Dec 24 • 11:58:50 PM", presetMs(12, 24, 23, 58, 50), "Watch: popup re-opens by itself at 60 s, then midnight."],
      ["Dec 25 • 12:00:30 AM", presetMs(12, 25, 0, 0, 30), "Arrived 30 s after midnight: joins the fireworks in the middle."],
      ["Dec 25 • 9 AM", presetMs(12, 25, 9), "Arrived after the show: Merry Christmas + a short burst."],
      ["Dec 31", presetMs(12, 31, 18), ""],
      ["Jan 2 • ended", new Date(realYear() + 1, 0, 2, 9).getTime(), "Season over: everything disappears."],
      ["Real time", null, "Back to the real clock."]
    ];
    var pg = el.querySelector('[data-g="presets"]');
    presets.forEach(function (p) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = p[0];
      b.addEventListener("click", function () { setSim(p[1], p[2]); });
      pg.appendChild(b);
    });
    var acts = [
      ["Show popup", function () {
        var ph = phaseAt(nowMs());
        if (!isHome) { testUI.note.textContent = "The popup lives on the home page only."; return; }
        if (ph.p === "off") { testUI.note.textContent = "The season is off at this clock time — jump to a date inside it first."; return; }
        closePopNow(); openPop(ph); testUI.note.textContent = "";
      }],
      ["Show banner", function () { ssSet(SS_HIDE, null); tick(); testUI.note.textContent = ""; }],
      ["Fireworks 60 s", function () { Fx.full(0); testUI.note.textContent = reduced() ? "Reduced motion is ON, so nothing animates (as a visitor with that setting would see)." : ""; }],
      ["Banner fireworks", function () { Fx.banner(ARRIVAL_BURST_SECONDS); testUI.note.textContent = reduced() ? "Reduced motion is ON." : ""; }],
      ["Stop fireworks", function () { Fx.stop(); }]
    ];
    var ag = el.querySelector('[data-g="acts"]');
    acts.forEach(function (a) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = a[0]; b.addEventListener("click", a[1]); ag.appendChild(b);
    });
    var inp = el.querySelector('input[type="datetime-local"]');
    inp.value = inputVal(nowMs());
    el.querySelector('[data-a="go"]').addEventListener("click", function () {
      var t = parseLocal(inp.value); if (t == null) { testUI.note.textContent = "Pick a date and time first."; return; }
      setSim(t, "");
    });
    var chk = el.querySelector('[data-a="rm"]');
    chk.checked = reduced();
    chk.addEventListener("change", function () { test.rm = chk.checked; saveTest(); resetAll(); tick(); });
    el.querySelector('[data-a="exit"]').addEventListener("click", function () {
      ssSet(SS_TEST, null); ssSet(SS_HIDE, null);
      window.location.href = window.location.pathname;   // back to the normal page, real clock
    });
    var head = el.querySelector(".xs-test-head");
    function collapse(c) { el.classList.toggle("xs-test-min", c); head.setAttribute("aria-expanded", c ? "false" : "true"); }
    head.addEventListener("click", function () { collapse(!el.classList.contains("xs-test-min")); });
    if (window.innerWidth < 700) collapse(true);
    testUI = { el: el, inp: inp, sim: el.querySelector(".xs-test-sim"), note: el.querySelector(".xs-test-note"), lastTxt: "" };
    if (!isHome) testUI.note.textContent = "Tip: the popup shows on the home page only.";
  }

  /* ═════════ start ═════════ */
  function init() {
    if (started) return; started = true;
    isHome = document.body.classList.contains("has-nav");
    buildTestUI();
    lastSparkleAt = Date.now();
    tick();
    window.setInterval(function () { try { tick(); } catch (e) { if (window.console) console.error("seasonal.js", e); } }, 250);
  }
  function boot() { try { init(); } catch (e) { if (window.console) console.error("seasonal.js", e); } }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
