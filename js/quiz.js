/* ═══════════════════════════════════════════════════════════════════
   QUIZ PRACTICE PAGE  (quiz.html)
   ───────────────────────────────────────────────────────────────────
   Practice quizzes for the diocese quiz. The questions live in a PRIVATE Google Sheet and are served by
   the Quiz API (Apps Script, see QuizAPI.gs). The page never receives an answer until the child submits:
     1. ?action=quizzes               → the quiz tabs with their chapters / lessons
     2. ?action=questions&quiz=NAME   → the questions of one quiz, WITHOUT answers
     3. ?action=check&ids=A,B,C       → ONE call on submit: the correct answers, references and explanations
   Everything the child sees is written with textContent (nothing from the sheet is ever run as HTML).
   Nothing about the child is stored; only "best score on this device" is kept in this browser.
   Needs CONFIG.quizApiUrl (js/main.js).
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var root = document.getElementById("quizApp");
  if (!root) return;

  var API = (typeof CONFIG !== "undefined" && CONFIG.quizApiUrl) ? String(CONFIG.quizApiUrl) : "";
  var LIST_CACHE = "ola_quiz_list_v1";
  var BEST_KEY = "ola_quiz_best_v1";
  var LENGTHS = [10, 20];

  var elStatus = document.getElementById("qzStatus");
  var elSetup = document.getElementById("qzSetup");
  var elPlay = document.getElementById("qzPlay");
  var elResult = document.getElementById("qzResult");

  var quizzes = [];          // [{name, round, description, partWord, parts:[{name,count}]}]
  var questionsByQuiz = {};  // quiz name -> [question]
  var sel = { quiz: "", part: "", n: 10 };
  var run = null;            // the quiz being taken
  var loadToken = 0;

  /* ───────── small helpers ───────── */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function show(which) {
    elSetup.hidden = which !== "setup";
    elPlay.hidden = which !== "play";
    elResult.hidden = which !== "result";
  }
  function status(text, withRetry) {
    clear(elStatus);
    elStatus.hidden = !text;
    if (!text) return;
    elStatus.appendChild(el("p", "qz-msg", text));
    if (withRetry) {
      var b = el("button", "qz-btn qz-btn-alt", "Try again");
      b.type = "button";
      b.addEventListener("click", boot);
      elStatus.appendChild(b);
    }
  }
  function focusHeading(container) {
    var h = container.querySelector("[data-focus]");
    if (h) { h.setAttribute("tabindex", "-1"); try { h.focus({ preventScroll: false }); } catch (e) { h.focus(); } }
  }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function getJSON(url, ms) {
    var ctl = (typeof AbortController !== "undefined") ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, ms || 20000) : null;
    return fetch(url, ctl ? { signal: ctl.signal } : {}).then(function (r) {
      if (timer) clearTimeout(timer);
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }, function (e) { if (timer) clearTimeout(timer); throw e; });
  }
  function readLS(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function writeLS(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function findQuiz(name) {
    for (var i = 0; i < quizzes.length; i++) if (quizzes[i].name === name) return quizzes[i];
    return null;
  }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  /* ───────── best score on this device ───────── */
  function bestKey() { return [sel.quiz, sel.part || "*", sel.n].join("|"); }
  function readBest() {
    try { return JSON.parse(readLS(BEST_KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function saveBest(key, score, total) {
    var all = readBest(), old = all[key];
    var pct = total ? score / total : 0;
    if (!old || pct > old.s / old.t) { all[key] = { s: score, t: total }; writeLS(BEST_KEY, JSON.stringify(all)); }
  }

  /* ───────── boot ───────── */
  function boot() {
    show("none");
    if (!API) { status("Our practice quizzes will be available soon."); return; }
    status("Loading quizzes…");
    var cached = null;
    try { cached = JSON.parse(readLS(LIST_CACHE) || "null"); } catch (e) {}
    if (cached && cached.length) { quizzes = cached; status(""); startSetup(); }
    getJSON(API + "?action=quizzes").then(function (d) {
      if (!d || !d.ok || !d.quizzes) throw new Error("bad data");
      var fresh = JSON.stringify(d.quizzes);
      if (fresh !== JSON.stringify(quizzes)) {
        writeLS(LIST_CACHE, fresh);
        var wasSetup = !elSetup.hidden || !quizzes.length;
        quizzes = d.quizzes;
        if (wasSetup) startSetup();
      }
      if (!quizzes.length) { show("none"); status("No quizzes are open yet. Please check back soon."); }
      else status("");
    }).catch(function () {
      if (!quizzes.length) status("We could not load the quizzes right now. Please try again in a little while.", true);
    });
  }

  function startSetup() {
    if (!quizzes.length) return;
    if (!findQuiz(sel.quiz)) { sel.quiz = quizzes[0].name; sel.part = ""; }
    renderSetup();
    loadQuestions(sel.quiz);
  }

  /* ───────── setup screen ───────── */
  function renderSetup() {
    clear(elSetup);
    show("setup");
    var quiz = findQuiz(sel.quiz);

    var h = el("h3", "qz-h", "Choose your quiz");
    h.setAttribute("data-focus", "1");
    elSetup.appendChild(h);

    // 1. quiz tabs
    var c1 = el("div", "qz-card");
    c1.appendChild(el("p", "qz-lbl", "1. Quiz"));
    var tabs = el("div", "qz-tabs");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Quizzes");
    quizzes.forEach(function (z) {
      var b = el("button", "qz-tab" + (z.name === sel.quiz ? " is-on" : ""));
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", z.name === sel.quiz ? "true" : "false");
      b.appendChild(el("span", "qz-tab-name", z.name));
      var sub = [z.round, z.description].filter(Boolean).join(" · ");
      if (sub) b.appendChild(el("span", "qz-tab-sub", sub));
      b.addEventListener("click", function () {
        if (sel.quiz === z.name) return;
        sel.quiz = z.name; sel.part = "";
        renderSetup(); loadQuestions(z.name);
      });
      tabs.appendChild(b);
    });
    c1.appendChild(tabs);
    elSetup.appendChild(c1);

    // 2. part dropdown
    var word = (quiz && quiz.partWord) || "part";
    var c2 = el("div", "qz-card");
    var lab = el("label", "qz-lbl", "2. Which " + word + "?");
    lab.setAttribute("for", "qzPart");
    c2.appendChild(lab);
    var select = el("select", "qz-select");
    select.id = "qzPart";
    var total = 0;
    (quiz ? quiz.parts : []).forEach(function (p) { total += p.count; });
    var all = el("option", null, "All " + word + "s (mixed) – " + plural(total, "question"));
    all.value = "";
    select.appendChild(all);
    (quiz ? quiz.parts : []).forEach(function (p) {
      var o = el("option", null, p.name + " – " + plural(p.count, "question"));
      o.value = p.name;
      select.appendChild(o);
    });
    select.value = sel.part;
    if (select.value !== sel.part) { sel.part = ""; select.value = ""; }
    select.addEventListener("change", function () { sel.part = select.value; updateBest(); updatePoolNote(); });
    c2.appendChild(select);
    elSetup.appendChild(c2);

    // 3. length
    var c3 = el("div", "qz-card");
    c3.appendChild(el("p", "qz-lbl", "3. How many questions?"));
    var chips = el("div", "qz-chips");
    chips.setAttribute("role", "group");
    chips.setAttribute("aria-label", "Number of questions");
    LENGTHS.forEach(function (n) {
      var b = el("button", "qz-chip" + (sel.n === n ? " is-on" : ""), String(n));
      b.type = "button";
      b.setAttribute("aria-pressed", sel.n === n ? "true" : "false");
      b.addEventListener("click", function () {
        sel.n = n;
        chips.querySelectorAll(".qz-chip").forEach(function (x) {
          var on = x === b; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", on ? "true" : "false");
        });
        updateBest(); updatePoolNote();
      });
      chips.appendChild(b);
    });
    c3.appendChild(chips);
    var poolNote = el("p", "qz-note"); poolNote.id = "qzPoolNote";
    c3.appendChild(poolNote);
    var best = el("p", "qz-best"); best.id = "qzBest";
    c3.appendChild(best);
    elSetup.appendChild(c3);

    // start
    var row = el("div", "qz-center");
    var go = el("button", "qz-btn", "Loading questions…");
    go.type = "button"; go.id = "qzStart"; go.disabled = true;
    go.addEventListener("click", startQuiz);
    row.appendChild(go);
    elSetup.appendChild(row);
    elSetup.appendChild(el("p", "qz-note qz-center", "Questions come in a different order every time. Nothing about you is saved, and no sign-in is needed."));

    updatePoolNote(); updateBest(); updateStart();
  }

  function pool() {
    var qs = questionsByQuiz[sel.quiz];
    if (!qs) return null;
    return sel.part ? qs.filter(function (q) { return q.part === sel.part; }) : qs;
  }
  function updatePoolNote() {
    var n = document.getElementById("qzPoolNote"); if (!n) return;
    var p = pool();
    n.textContent = (p && p.length && p.length < sel.n) ? "This selection has " + plural(p.length, "question") + ", so the quiz will use all of them." : "";
    updateStart();
  }
  function updateBest() {
    var n = document.getElementById("qzBest"); if (!n) return;
    var b = readBest()[bestKey()];
    n.textContent = b ? "Your best on this device: " + b.s + " out of " + b.t : "";
  }
  function updateStart() {
    var b = document.getElementById("qzStart"); if (!b) return;
    var p = pool();
    if (p === null) { b.disabled = true; b.textContent = "Loading questions…"; return; }
    b.disabled = p.length === 0;
    b.textContent = p.length ? "Start quiz" : "No questions here yet";
  }

  function loadQuestions(name) {
    if (questionsByQuiz[name]) { updatePoolNote(); return; }
    var token = ++loadToken;
    getJSON(API + "?action=questions&quiz=" + encodeURIComponent(name)).then(function (d) {
      if (!d || !d.ok || !d.questions) throw new Error("bad data");
      questionsByQuiz[name] = d.questions;
      if (token === loadToken && sel.quiz === name) updatePoolNote();
    }).catch(function () {
      if (token !== loadToken || sel.quiz !== name) return;
      var b = document.getElementById("qzStart");
      if (b) { b.disabled = false; b.textContent = "Could not load – tap to retry"; b.onclick = function () { b.onclick = null; b.disabled = true; b.textContent = "Loading questions…"; loadQuestions(name); }; }
    });
  }

  /* ───────── taking the quiz ───────── */
  function prepare(list) {
    return shuffle(list).map(function (q) {
      return { id: q.id, part: q.part, type: q.type, difficulty: q.difficulty, question: q.question,
               options: q.type === "tf" ? q.options.slice() : shuffle(q.options) };
    });
  }
  function startQuiz() {
    var p = pool();
    if (!p || !p.length) return;
    var qs = prepare(p).slice(0, Math.min(sel.n, p.length));
    beginRun(qs, "");
  }
  function beginRun(qs, tag) {
    var quiz = findQuiz(sel.quiz);
    run = { qs: qs, answers: {}, i: 0, quizName: sel.quiz, partName: sel.part, n: sel.n,
            partWord: (quiz && quiz.partWord) || "part", tag: tag, checking: false };
    renderPlay();
  }

  function answeredCount() { var n = 0; run.qs.forEach(function (q) { if (run.answers[q.id] != null) n++; }); return n; }

  function renderPlay() {
    clear(elPlay);
    show("play");
    var q = run.qs[run.i], total = run.qs.length;
    var optBtns = [], dotBtns = [];

    var card = el("div", "qz-card");
    var prog = el("div", "qz-prog");
    prog.setAttribute("role", "progressbar");
    prog.setAttribute("aria-valuemin", "0"); prog.setAttribute("aria-valuemax", String(total));
    prog.setAttribute("aria-label", "Questions answered");
    var bar = el("i");
    prog.appendChild(bar);
    card.appendChild(prog);

    var meta = el("div", "qz-meta");
    var left = el("span", null, "Question ");
    left.appendChild(el("b", null, String(run.i + 1)));
    left.appendChild(document.createTextNode(" of " + total + (run.tag ? " \u00b7 " + run.tag : "")));
    meta.appendChild(left);
    var right = el("span", "qz-meta-r");
    right.appendChild(el("span", "qz-tag", q.part));
    if (q.difficulty) right.appendChild(el("span", "qz-diff", q.difficulty));
    meta.appendChild(right);
    card.appendChild(meta);

    var qh = el("h3", "qz-q", q.question);
    qh.setAttribute("data-focus", "1");
    card.appendChild(qh);

    var group = el("div", "qz-opts");
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", "Answer choices");
    q.options.forEach(function (text, idx) {
      var b = el("button", "qz-opt");
      b.type = "button";
      b.setAttribute("role", "radio");
      b.appendChild(el("span", "qz-k", "ABCD".charAt(idx)));
      b.appendChild(el("span", "qz-opt-t", text));
      b.addEventListener("click", function () { run.answers[q.id] = text; refresh(); });
      group.appendChild(b);
      optBtns.push({ b: b, text: text });
    });
    card.appendChild(group);

    var nav = el("div", "qz-nav");
    var back = el("button", "qz-btn qz-btn-alt", "\u2190 Back"); back.type = "button"; back.disabled = run.i === 0;
    back.addEventListener("click", function () { run.i--; renderPlay(); });
    var next = el("button", "qz-btn qz-btn-alt", "Next \u2192"); next.type = "button"; next.disabled = run.i === total - 1;
    next.addEventListener("click", function () { run.i++; renderPlay(); });
    nav.appendChild(back); nav.appendChild(next);
    card.appendChild(nav);
    elPlay.appendChild(card);

    var dots = el("div", "qz-dots");
    dots.setAttribute("role", "group"); dots.setAttribute("aria-label", "Jump to a question");
    run.qs.forEach(function (x, i) {
      var d = el("button", "qz-dot" + (i === run.i ? " is-cur" : ""), String(i + 1));
      d.type = "button";
      if (i === run.i) d.setAttribute("aria-current", "step");
      d.addEventListener("click", function () { run.i = i; renderPlay(); });
      dots.appendChild(d);
      dotBtns.push({ b: d, id: x.id, n: i + 1 });
    });
    elPlay.appendChild(dots);
    elPlay.appendChild(el("p", "qz-note qz-center", "Tap a number to jump to any question. You can change an answer until you submit."));

    var sub = el("div", "qz-center");
    var submit = el("button", "qz-btn", "Submit quiz");
    submit.type = "button"; submit.id = "qzSubmit";
    submit.addEventListener("click", submitQuiz);
    sub.appendChild(submit);
    elPlay.appendChild(sub);
    var msg = el("p", "qz-note qz-center"); msg.id = "qzPlayMsg"; msg.setAttribute("aria-live", "polite");
    msg.textContent = "The answers are shown after you submit.";
    elPlay.appendChild(msg);

    var leave = el("div", "qz-center");
    var lb = el("button", "qz-link", "Leave this quiz"); lb.type = "button";
    lb.addEventListener("click", function () {
      if (lb.getAttribute("data-sure")) { run = null; renderSetup(); loadQuestions(sel.quiz); return; }
      lb.setAttribute("data-sure", "1"); lb.textContent = "Tap again to leave (your answers will be lost)";
      setTimeout(function () { lb.removeAttribute("data-sure"); lb.textContent = "Leave this quiz"; }, 4000);
    });
    leave.appendChild(lb);
    elPlay.appendChild(leave);

    // Updates the screen in place (so keyboard focus is never lost when an answer is picked)
    function refresh() {
      var done = answeredCount();
      bar.style.width = Math.round(100 * done / total) + "%";
      prog.setAttribute("aria-valuenow", String(done));
      optBtns.forEach(function (o) {
        var on = run.answers[q.id] === o.text;
        o.b.classList.toggle("is-on", on);
        o.b.setAttribute("aria-checked", on ? "true" : "false");
      });
      dotBtns.forEach(function (d) {
        var ok = run.answers[d.id] != null;
        d.b.classList.toggle("is-done", ok);
        d.b.setAttribute("aria-label", "Question " + d.n + (ok ? ", answered" : ", not answered yet"));
      });
      var rest = total - done;
      submit.disabled = rest > 0 || run.checking;
      submit.textContent = run.checking ? "Checking your answers\u2026" : (rest ? "Submit quiz (" + rest + " left to answer)" : "Submit quiz");
    }
    refresh();
    focusHeading(elPlay);
  }

  function submitQuiz() {
    if (!run || run.checking || answeredCount() < run.qs.length) return;
    run.checking = true;
    var btn = document.getElementById("qzSubmit"), msg = document.getElementById("qzPlayMsg");
    if (btn) { btn.disabled = true; btn.textContent = "Checking your answers…"; }
    if (msg) msg.textContent = "";
    var ids = run.qs.map(function (q) { return q.id; }).join(",");
    getJSON(API + "?action=check&ids=" + encodeURIComponent(ids)).then(function (d) {
      if (!d || !d.ok || !d.answers) throw new Error(d && d.error === "busy" ? "busy" : "bad data");
      run.checking = false;
      renderResult(d.answers);
    }).catch(function (e) {
      run.checking = false;
      var busy = e && e.message === "busy";
      var b = document.getElementById("qzSubmit"), m = document.getElementById("qzPlayMsg");
      if (b) { b.disabled = false; b.textContent = "Submit quiz"; }
      if (m) m.textContent = busy ? "Lots of children are practicing right now. Your answers are safe, please wait a few seconds and submit again."
                                  : "We could not check your answers just now. Your answers are safe, please submit again.";
    });
  }

  /* ───────── results ───────── */
  function renderResult(answers) {
    clear(elResult);
    show("result");
    var total = run.qs.length, score = 0, wrong = [], right = [];
    run.qs.forEach(function (q, i) {
      var a = answers[q.id] || {};
      var chosen = run.answers[q.id];
      var ok = a.answer != null && String(chosen).trim() === String(a.answer).trim();
      var item = { q: q, n: i + 1, chosen: chosen, answer: a.answer, ref: a.reference || "", ex: a.explanation || "", ok: ok };
      if (ok) { score++; right.push(item); } else wrong.push(item);
    });
    var pct = total ? Math.round(100 * score / total) : 0;
    run.lastWrong = wrong.map(function (w) { return w.q; });

    sel.quiz = run.quizName; sel.part = run.partName;
    if (!run.tag) saveBest([run.quizName, run.partName || "*", run.n].join("|"), score, total);

    var card = el("div", "qz-card qz-center");
    card.appendChild(el("p", "qz-lbl", "Your result"));
    var ring = el("div", "qz-score");
    ring.style.setProperty("--p", String(pct));
    ring.setAttribute("role", "img");
    ring.setAttribute("aria-label", score + " out of " + total + ", " + pct + " percent");
    var inner = el("div");
    inner.appendChild(document.createTextNode(score + "/" + total));
    inner.appendChild(el("small", null, pct + "%"));
    ring.appendChild(inner);
    card.appendChild(ring);
    var msg = pct >= 90 ? "Excellent work!" : pct >= 70 ? "Well done!" : pct >= 50 ? "Good effort. Keep practicing!" : "Keep going. Every try helps!";
    var h = el("h3", "qz-h", msg); h.setAttribute("data-focus", "1");
    card.appendChild(h);
    var where = run.quizName + " · " + (run.partName || "All " + run.partWord + "s") + (run.tag ? " · " + run.tag : "");
    card.appendChild(el("p", "qz-note", where));

    var acts = el("div", "qz-actions");
    var again = el("button", "qz-btn", "Try again (new questions)"); again.type = "button";
    again.addEventListener("click", function () {
      var p = questionsByQuiz[run.quizName]; if (!p) { renderSetup(); return; }
      var list = run.partName ? p.filter(function (q) { return q.part === run.partName; }) : p;
      sel.n = run.n;
      beginRun(prepare(list).slice(0, Math.min(run.n, list.length)), "");
    });
    acts.appendChild(again);
    if (wrong.length) {
      var miss = el("button", "qz-btn qz-btn-alt", "Retry the " + wrong.length + " I missed"); miss.type = "button";
      miss.addEventListener("click", function () { beginRun(prepare(run.lastWrong), "Missed questions"); });
      acts.appendChild(miss);
    }
    var change = el("button", "qz-btn qz-btn-alt", "Change quiz or " + run.partWord); change.type = "button";
    change.addEventListener("click", function () { run = null; renderSetup(); loadQuestions(sel.quiz); });
    acts.appendChild(change);
    card.appendChild(acts);
    elResult.appendChild(card);

    elResult.appendChild(el("h3", "qz-h qz-h-rev", "Review your answers"));
    wrong.concat(right).forEach(function (it) {
      var box = el("div", "qz-rev " + (it.ok ? "is-ok" : "is-no"));
      box.appendChild(el("h4", null, it.n + ". " + it.q.question));
      var yours = el("p");
      yours.appendChild(document.createTextNode("Your answer: "));
      yours.appendChild(el("span", it.ok ? "qz-good" : "qz-bad", String(it.chosen) + (it.ok ? " ✓" : " ✗")));
      box.appendChild(yours);
      if (!it.ok) {
        var cor = el("p");
        cor.appendChild(document.createTextNode("Correct answer: "));
        cor.appendChild(el("span", "qz-good", String(it.answer == null ? "(not available)" : it.answer) + " ✓"));
        box.appendChild(cor);
      }
      if (it.ref || it.ex) {
        var ref = el("p", "qz-ref");
        if (it.ref) ref.appendChild(el("b", null, it.ref));
        if (it.ref && it.ex) ref.appendChild(document.createTextNode(" – "));
        if (it.ex) ref.appendChild(document.createTextNode(it.ex));
        box.appendChild(ref);
      }
      elResult.appendChild(box);
    });
    elResult.appendChild(el("p", "qz-note qz-center", "Wrong answers are listed first."));
    focusHeading(elResult);
  }

  boot();
})();
