/* =====================================================
   PARISHIONERS PAGE — js/parishioners.js  (parishioners.html)

   "Sign in with Google" → month calendar of Mass / food / prayer offerings → request form.
   Everything private lives in the Apps Script (Parishioners-API/Code.gs). This page only shows what that
   script returns AFTER it has checked the Google sign-in against the approved parishioners list.

   Needs in js/main.js CONFIG:  googleClientId, parishionersApiUrl
   Safety notes:
     • All text from the server is written with textContent (never innerHTML).
     • The Google sign-in script is loaded only on this page, and only when nobody is signed in.
     • The session (a short signed token from our script) lives in sessionStorage: it ends when the tab closes.
   ===================================================== */
(function () {
  "use strict";

  var cfg = (typeof CONFIG !== "undefined") ? CONFIG : {};
  var API = cfg.parishionersApiUrl ? String(cfg.parishionersApiUrl) : "";
  var CLIENT_ID = cfg.googleClientId ? String(cfg.googleClientId) : "";
  var KEY = "ola_pz_session_v1";

  var root = document.getElementById("pzApp");
  if (!root) return;

  function $(id) { return document.getElementById(id); }
  var elLoading = $("pzLoading"), elSignin = $("pzSignin"), elMain = $("pzMain"), elMsg = $("pzMsg"), elBtn = $("pzGoogleBtn");

  var state = { sess: null, month: "", today: "", cache: {}, opener: null, dlgDate: "", formOpen: false, rid: "" };
  var gisLoaded = false, gisReady = false;

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var KIND_LABEL = { mass: "Holy Mass offering", food: "Food offering", prayer: "Prayer at a home", other: "Offering" };
  var KIND_LETTER = { mass: "M", food: "F", prayer: "P", other: "O" };

  // ── tiny helpers ──────────────────────────────────────────────
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function show(node, on) { if (node) node.hidden = !on; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function localToday() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parts(iso) { var p = String(iso).split("-"); return { y: +p[0], m: +p[1], d: +p[2] }; }
  function weekday(iso) { var p = parts(iso); return new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay(); }
  function daysIn(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
  function longDate(iso) { var p = parts(iso); return DAYS[weekday(iso)] + ", " + MONTHS[p.m - 1] + " " + p.d + ", " + p.y; }
  function shortDate(iso) { var p = parts(iso); return DAYS[weekday(iso)].slice(0, 3) + " " + MONTHS[p.m - 1].slice(0, 3) + " " + p.d; }
  function monthKey(y, m) { return y + "-" + pad(m); }
  function shiftMonth(key, delta) { var p = key.split("-"); var t = (+p[0]) * 12 + (+p[1] - 1) + delta; return monthKey(Math.floor(t / 12), (t % 12) + 1); }
  function todayStr() { return state.today || localToday(); }
  function newId() {
    try { var a = new Uint32Array(3); crypto.getRandomValues(a); return Array.prototype.map.call(a, function (x) { return x.toString(36); }).join(""); }
    catch (e) { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
  }

  // ── talking to the Apps Script ────────────────────────────────
  function api(body) {
    var ctl = (typeof AbortController !== "undefined") ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 30000) : 0;
    return fetch(API, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },   // a "simple" request: no pre-flight
      body: JSON.stringify(body),
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      return r.json();
    }).then(function (j) {
      clearTimeout(timer);
      return (j && typeof j === "object") ? j : { ok: false, code: "error", message: "Unexpected reply. Please try again." };
    }, function () {
      clearTimeout(timer);
      return { ok: false, code: "network", message: "We could not reach the server. Please check your connection and try again." };
    });
  }

  // ── session ───────────────────────────────────────────────────
  function saveSession(s) { try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode: stays in memory */ } }
  function loadSession() {
    try {
      var s = JSON.parse(sessionStorage.getItem(KEY) || "null");
      if (s && s.session && s.expires > Date.now()) return s;
    } catch (e) { /* ignore */ }
    return null;
  }
  function dropSession() { state.sess = null; state.cache = {}; try { sessionStorage.removeItem(KEY); } catch (e) { /* ignore */ } }

  // ── screens ───────────────────────────────────────────────────
  function showScreen(which) {
    show(elLoading, which === "loading");
    show(elSignin, which === "signin");
    show(elMain, which === "main");
  }
  function say(text, kind, withHelp) {
    clear(elMsg);
    elMsg.className = "pz-msg" + (kind ? " pz-msg--" + kind : "");
    if (!text) return;
    elMsg.appendChild(document.createTextNode(text));
    if (withHelp) {
      var em = (typeof CONFIG !== "undefined" && CONFIG.email) ? CONFIG.email : "";
      if (em) {
        elMsg.appendChild(document.createTextNode(" You can email "));
        var a = el("a", null, em); a.href = "mailto:" + em;
        elMsg.appendChild(a);
        elMsg.appendChild(document.createTextNode("."));
      }
    }
  }

  function notReady() {
    showScreen("signin");
    show(elBtn, false);
    say("This page is not switched on yet. Please check back soon.", "info");
  }

  // ── Google sign-in ────────────────────────────────────────────
  function loadGoogle(cb) {
    if (gisLoaded) { cb(); return; }
    var s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true; s.defer = true;
    s.onload = function () { gisLoaded = true; cb(); };
    s.onerror = function () {
      say("Google sign-in could not be loaded. Please check your connection, or try a different browser, then reload this page.", "error");
    };
    document.head.appendChild(s);
  }

  function startSignin(message, kind) {
    showScreen("signin");
    say(message || "", kind || "");
    show(elBtn, true);
    loadGoogle(function () {
      if (!(window.google && google.accounts && google.accounts.id)) { say("Google sign-in is not available in this browser.", "error"); return; }
      if (!gisReady) {
        google.accounts.id.initialize({ client_id: CLIENT_ID, callback: onCredential, auto_select: false, cancel_on_tap_outside: true, itp_support: true });
        gisReady = true;
      }
      clear(elBtn);
      var w = Math.min(300, Math.max(200, (elSignin.clientWidth || 300) - 48));
      google.accounts.id.renderButton(elBtn, { type: "standard", theme: "outline", size: "large", text: "signin_with", shape: "pill", logo_alignment: "left", width: w });
    });
  }

  function onCredential(resp) {
    if (!resp || !resp.credential) { say("Sign-in did not finish. Please try again.", "error"); return; }
    showScreen("loading");
    api({ action: "signin", idToken: resp.credential }).then(function (r) {
      if (r && r.ok) {
        state.sess = { session: r.session, expires: r.expires, family: r.family, today: r.today, limits: r.limits || {}, kinds: r.kinds || {}, maxDaysAhead: r.maxDaysAhead || 400 };
        saveSession(state.sess);
        enterMain();
        return;
      }
      var code = r && r.code;
      startSignin((r && r.message) || "Sign-in did not work. Please try again.", code === "not_listed" || code === "account_mismatch" ? "warn" : "error");
      if (code === "not_listed") say((r.message || "") + (r.email ? " (You signed in as " + r.email + ".)" : ""), "warn", true);
      if (code === "account_mismatch") say(r.message, "warn", true);
    });
  }

  function signOut() {
    dropSession();
    try { if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect(); } catch (e) { /* ignore */ }
    closeDialog(true);
    startSignin("You have signed out.", "info");
  }

  // ── main screen ───────────────────────────────────────────────
  function enterMain() {
    state.today = state.sess.today || localToday();
    $("pzFamily").textContent = state.sess.family;
    showScreen("main");
    var p = parts(todayStr());
    state.month = monthKey(p.y, p.m);
    loadMonth(state.month, false);
  }

  function sessionEnded(msg) {
    dropSession();
    closeDialog(true);
    startSignin(msg || "Your session has ended. Please sign in again.", "info");
  }

  function loadMonth(month, quiet) {
    var cached = state.cache[month];
    renderNav();
    if (cached) { render(); if (quiet !== "refresh") return; }
    else {
      $("pzGrid").setAttribute("aria-busy", "true");
      $("pzStatus").textContent = "Loading " + MONTHS[+month.slice(5) - 1] + "…";
    }
    api({ action: "month", session: state.sess.session, month: month }).then(function (r) {
      if (state.month !== month && quiet !== "refresh") { /* the user moved on; still keep the data */ }
      $("pzGrid").removeAttribute("aria-busy");
      if (r && r.ok) {
        if (r.today) state.today = r.today;
        state.cache[month] = r.items || [];
        $("pzStatus").textContent = "";
        if (state.month === month) render();
        if (state.dlgDate && state.dlgDate.slice(0, 7) === month && !state.formOpen) renderDialog();
        return;
      }
      if (r && (r.code === "session" || r.code === "not_listed")) { sessionEnded(r.message); if (r.code === "not_listed") say(r.message, "warn", true); return; }
      $("pzStatus").textContent = (r && r.message) || "Could not load the calendar.";
    });
  }

  function renderNav() {
    var p = month2(state.month);
    $("pzMonthTitle").textContent = MONTHS[p.m - 1] + " " + p.y;
    var t = parts(todayStr());
    var cur = monthKey(t.y, t.m);
    $("pzPrev").disabled = state.month <= shiftMonth(cur, -12);
    $("pzNext").disabled = state.month >= shiftMonth(cur, 13);
    $("pzTodayBtn").disabled = state.month === cur;
  }
  function month2(key) { var p = key.split("-"); return { y: +p[0], m: +p[1] }; }

  function itemsFor(date) { return (state.cache[date.slice(0, 7)] || []).filter(function (i) { return i.d === date; }); }

  // A pill: letter (M / F / P), solid = Confirmed, dashed = Requested
  function pill(kind, status, count, own) {
    var p = el("span", "pz-pill " + (status === "c" ? "pz-pill--c" : "pz-pill--p") + (own ? " pz-pill--own" : ""));
    p.setAttribute("aria-hidden", "true");
    p.textContent = (KIND_LETTER[kind] || "O") + (count > 1 ? count : "") + (status === "c" ? "" : "?");
    return p;
  }

  function render() {
    var grid = $("pzGrid");
    clear(grid);
    var mp = month2(state.month);
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(function (d, i) {
      var h = el("div", "pz-dow", d); h.setAttribute("aria-hidden", "true"); grid.appendChild(h);
    });
    var first = weekday(state.month + "-01");
    var n = daysIn(mp.y, mp.m);
    for (var b = 0; b < first; b++) grid.appendChild(el("div", "pz-blank"));
    var today = todayStr();
    for (var day = 1; day <= n; day++) {
      var date = state.month + "-" + pad(day);
      var its = itemsFor(date);
      var btn = el("button", "pz-day" + (date === today ? " is-today" : "") + (date < today ? " is-past" : "") + (its.length ? " has-items" : ""));
      btn.type = "button";
      btn.setAttribute("data-date", date);
      btn.appendChild(el("span", "pz-dnum", String(day)));
      var row = el("span", "pz-pills");
      var seen = {};
      its.forEach(function (i) { var k = i.k + "|" + i.s + "|" + (i.o ? 1 : 0); (seen[k] = seen[k] || { k: i.k, s: i.s, o: i.o, n: 0 }).n++; });
      Object.keys(seen).forEach(function (k) { var g = seen[k]; row.appendChild(pill(g.k, g.s, g.n, g.o)); });
      btn.appendChild(row);
      var label = longDate(date);
      if (its.length) label += ", " + its.length + (its.length === 1 ? " offering" : " offerings");
      else if (date >= today) label += ", open";
      if (date === today) label += ", today";
      btn.setAttribute("aria-label", label);
      btn.addEventListener("click", onDayClick);
      grid.appendChild(btn);
    }
    renderList();
  }

  function onDayClick(ev) {
    var b = ev.currentTarget;
    openDialog(b.getAttribute("data-date"), b);
  }

  function renderList() {
    var box = $("pzList");
    clear(box);
    var items = (state.cache[state.month] || []).slice();
    var head = $("pzListHead");
    head.textContent = "Offerings in " + MONTHS[month2(state.month).m - 1];
    if (!items.length) { box.appendChild(el("p", "pz-empty", "Nothing has been offered or requested this month yet. Every date is open.")); return; }
    var byDate = {};
    items.forEach(function (i) { (byDate[i.d] = byDate[i.d] || []).push(i); });
    Object.keys(byDate).sort().forEach(function (d) {
      var row = el("button", "pz-lrow"); row.type = "button"; row.setAttribute("data-date", d);
      row.appendChild(el("span", "pz-ldate", shortDate(d)));
      var ul = el("span", "pz-ltext");
      byDate[d].forEach(function (i) {
        var line = el("span", "pz-lline");
        line.appendChild(pillText(i));
        ul.appendChild(line);
      });
      row.appendChild(ul);
      row.addEventListener("click", onDayClick);
      box.appendChild(row);
    });
  }

  // "Holy Mass offering · Kallarackal Family  [Confirmed]"
  function pillText(i) {
    var wrap = el("span", "pz-ltxt");
    wrap.appendChild(el("span", "pz-lkind", KIND_LABEL[i.k] === "Prayer at a home" && i.t ? i.t : (KIND_LABEL[i.k] || "Offering")));
    wrap.appendChild(document.createTextNode(" · "));
    wrap.appendChild(el("span", "pz-lfam", i.f + (i.o ? " (your family)" : "")));
    wrap.appendChild(statusTag(i.s));
    return wrap;
  }
  function statusTag(s) {
    var t = el("span", "pz-tag " + (s === "c" ? "pz-tag--c" : "pz-tag--p"), s === "c" ? "✓ Confirmed" : "Requested");
    return t;
  }

  // ── date dialog ───────────────────────────────────────────────
  var dlg = $("pzDlg"), dlgBody = $("pzDlgBody"), dlgTitle = $("pzDlgTitle");

  function openDialog(date, opener) {
    state.opener = opener || null;
    state.dlgDate = date;
    state.formOpen = false;
    renderDialog();
    show(dlg, true);
    document.body.classList.add("pz-lock");
    dlgTitle.focus();
  }
  function closeDialog(silent) {
    if (dlg.hidden) return;
    show(dlg, false);
    document.body.classList.remove("pz-lock");
    state.dlgDate = ""; state.formOpen = false;
    if (!silent && state.opener && document.body.contains(state.opener)) { try { state.opener.focus(); } catch (e) { /* ignore */ } }
  }

  function renderDialog() {
    var date = state.dlgDate;
    if (!date) return;
    clear(dlgBody);
    dlgTitle.textContent = longDate(date);
    var its = itemsFor(date);
    var today = todayStr();
    var isPast = date < today;

    dlgBody.appendChild(el("h3", "pz-sub", "On this date"));
    if (!its.length) {
      dlgBody.appendChild(el("p", "pz-empty", isPast ? "Nothing was offered on this date." : "Nothing has been offered or requested yet. This date is open."));
    } else {
      var ul = el("ul", "pz-ilist");
      its.forEach(function (i) {
        var li = el("li", "pz-iitem" + (i.s === "c" ? " is-c" : " is-p"));
        var top = el("span", "pz-itop");
        top.appendChild(el("strong", null, (i.k === "prayer" && i.t) ? i.t : (KIND_LABEL[i.k] || "Offering")));
        top.appendChild(statusTag(i.s));
        li.appendChild(top);
        li.appendChild(el("span", "pz-ifam", i.f + (i.o ? " (your family)" : "")));
        if (i.s !== "c") li.appendChild(el("span", "pz-inote", "Waiting for the parish admins to approve."));
        ul.appendChild(li);
      });
      dlgBody.appendChild(ul);
    }

    if (isPast) return;
    dlgBody.appendChild(el("h3", "pz-sub", "Make a request"));
    var sess = state.sess;
    var lim = sess.limits || {};
    var kinds = ["mass", "food", "prayer"];
    var choose = el("div", "pz-choose");
    kinds.forEach(function (k) {
      var count = its.filter(function (i) { return i.k === k; }).length;
      var mine = its.some(function (i) { return i.k === k && i.o; });
      var full = lim[k] && count >= lim[k];
      var b = el("button", "pz-kind"); b.type = "button"; b.setAttribute("data-kind", k);
      b.appendChild(el("span", "pz-kind-t", (sess.kinds[k] && sess.kinds[k].label) || KIND_LABEL[k]));
      var why = mine ? "Your family has already requested this" : (full ? (k === "food" ? "Already taken for this date" : "Already taken for this date") : "");
      if (why) { b.disabled = true; b.appendChild(el("span", "pz-kind-w", why)); }
      else b.addEventListener("click", function () { openForm(k); });
      choose.appendChild(b);
    });
    dlgBody.appendChild(choose);
    var hint = el("p", "pz-fine", "Requests are shown as “Requested” until the parish admins approve them.");
    dlgBody.appendChild(hint);
  }

  function openForm(kind) {
    state.formOpen = true;
    state.rid = newId();
    var date = state.dlgDate;
    var sess = state.sess;
    var info = sess.kinds[kind] || { label: KIND_LABEL[kind], types: [] };
    clear(dlgBody);
    dlgTitle.textContent = info.label;
    dlgBody.appendChild(el("p", "pz-formdate", longDate(date)));

    var form = el("form", "pz-form");
    form.setAttribute("novalidate", "novalidate");
    var type = info.types[0] || "";

    if (info.types.length > 1) {
      var fs = el("fieldset", "pz-fs");
      fs.appendChild(el("legend", null, "Which prayer?"));
      info.types.forEach(function (t, i) {
        var lab = el("label", "pz-radio");
        var r = el("input"); r.type = "radio"; r.name = "pzType"; r.value = t; if (i === 0) r.checked = true;
        lab.appendChild(r); lab.appendChild(document.createTextNode(" " + t));
        fs.appendChild(lab);
      });
      form.appendChild(fs);
    }

    var tLab = el("label", "pz-lab", kind === "mass" ? "Intention (optional)" : "Notes for the admins (optional)");
    tLab.setAttribute("for", "pzText");
    var ta = el("textarea", "pz-in"); ta.id = "pzText"; ta.rows = 3; ta.maxLength = 300;
    ta.placeholder = kind === "mass" ? "For example: for our parents, thanksgiving, in memory of …" : (kind === "food" ? "For example: what you plan to bring" : "For example: preferred time");
    form.appendChild(tLab); form.appendChild(ta);

    var pLab = el("label", "pz-lab", "Phone (optional)");
    pLab.setAttribute("for", "pzPhone");
    var ph = el("input", "pz-in"); ph.id = "pzPhone"; ph.type = "tel"; ph.maxLength = 25; ph.autocomplete = "tel"; ph.inputMode = "tel";
    form.appendChild(pLab); form.appendChild(ph);

    form.appendChild(el("p", "pz-fine", "Your family name (" + sess.family + ") will be shown to other signed-in parishioners on the calendar. Your intention, notes and phone number are seen only by the parish admins."));

    var msg = el("p", "pz-formmsg"); msg.setAttribute("role", "alert"); form.appendChild(msg);

    var row = el("div", "pz-actions");
    var submit = el("button", "pz-btn pz-btn--primary", "Send request"); submit.type = "submit";
    var cancel = el("button", "pz-btn", "Back"); cancel.type = "button";
    cancel.addEventListener("click", function () { state.formOpen = false; renderDialog(); dlgTitle.focus(); });
    row.appendChild(submit); row.appendChild(cancel);
    form.appendChild(row);

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (submit.disabled) return;
      var chosen = type;
      var rad = form.querySelector('input[name="pzType"]:checked');
      if (rad) chosen = rad.value;
      submit.disabled = true; submit.textContent = "Sending…"; msg.textContent = "";
      api({ action: "submit", session: sess.session, kind: kind, type: chosen, date: date, text: ta.value, phone: ph.value, rid: state.rid }).then(function (r) {
        if (r && r.ok) { onSubmitted(r.item, kind, chosen); return; }
        submit.disabled = false; submit.textContent = "Send request";
        var code = r && r.code;
        if (code === "session" || code === "not_listed") { sessionEnded(r.message); return; }
        msg.textContent = (r && r.message) || "Your request could not be sent. Please try again.";
        if (code === "date_taken" || code === "duplicate") { delete state.cache[date.slice(0, 7)]; loadMonth(date.slice(0, 7), "refresh"); }
      });
    });

    dlgBody.appendChild(form);
    ta.focus();
  }

  function onSubmitted(item, kind, type) {
    state.formOpen = true;          // the "thank you" panel is showing: a calendar refresh must not redraw over it
    var mk = state.dlgDate.slice(0, 7);
    if (item) { state.cache[mk] = (state.cache[mk] || []).concat([item]); }
    if (state.month === mk) render();
    clear(dlgBody);
    dlgTitle.textContent = "Request sent";
    var ok = el("div", "pz-done");
    ok.appendChild(el("p", "pz-done-big", "Thank you. Your request was sent."));
    ok.appendChild(el("p", null, longDate(state.dlgDate) + " — " + type));
    ok.appendChild(el("p", "pz-fine", "It now shows as “Requested”. The parish admins will review it, and you will receive an email when it is decided."));
    var close = el("button", "pz-btn pz-btn--primary", "Done"); close.type = "button";
    close.addEventListener("click", function () { closeDialog(); });
    ok.appendChild(close);
    dlgBody.appendChild(ok);
    dlgTitle.focus();
    loadMonth(mk, "refresh");       // pick up anything others did meanwhile
  }

  // keyboard: Escape closes, Tab stays inside the dialog
  document.addEventListener("keydown", function (ev) {
    if (dlg.hidden) return;
    if (ev.key === "Escape") { ev.preventDefault(); closeDialog(); return; }
    if (ev.key !== "Tab") return;
    var f = dlg.querySelectorAll('button:not([disabled]), input, textarea, [tabindex="0"], #pzDlgTitle');
    var list = Array.prototype.filter.call(f, function (n) { return n.offsetParent !== null || n === dlgTitle; });
    if (!list.length) return;
    var first = list[0], last = list[list.length - 1];
    if (ev.shiftKey && (document.activeElement === first || !dlg.contains(document.activeElement))) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
  });
  dlg.addEventListener("click", function (ev) { if (ev.target === dlg) closeDialog(); });
  $("pzDlgClose").addEventListener("click", function () { closeDialog(); });

  // ── nav buttons ───────────────────────────────────────────────
  $("pzPrev").addEventListener("click", function () { state.month = shiftMonth(state.month, -1); loadMonth(state.month); });
  $("pzNext").addEventListener("click", function () { state.month = shiftMonth(state.month, 1); loadMonth(state.month); });
  $("pzTodayBtn").addEventListener("click", function () { var t = parts(todayStr()); state.month = monthKey(t.y, t.m); loadMonth(state.month); });
  $("pzSignOut").addEventListener("click", signOut);

  // ── start ─────────────────────────────────────────────────────
  if (!API || !CLIENT_ID) { notReady(); return; }
  var saved = loadSession();
  if (saved) { state.sess = saved; enterMain(); }
  else startSignin("", "");
})();
