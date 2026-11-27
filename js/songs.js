/* =====================================================
   SONGS (songs.html) — A–Z index, search, Malayalam / Manglish lyrics
   =====================================================
   Data (built by tools/build_songs.py into the songs/ folder, plain static files):
     songs/index.json    { v, songs:[[id, title, chunk], ...] }   sorted by title
     songs/search.json   { mg:[...], ml:[...] }  first 4 lines of every song (same order as index.json) — loaded on first search
     songs/c/NNN.json    { "<id>": [malayalamBlocks, manglishBlocks] }, block = [role, [lines]] — loaded when a song is opened
   Everything typed or loaded is written with textContent / text nodes (no HTML is ever built from the data).
   Page address states:   songs.html            browse / search
                          songs.html#letter=A   songs starting with A
                          songs.html#song=123   one song (shareable link)
   Remembered on this device only: language (ola_songs_lang_v1) and text size (ola_songs_size_v1).
   ===================================================== */
(function () {
  "use strict";

  var DIR = "songs/";
  var PAGE = 60;            // list rows shown at a time
  var MAX_RESULTS = 400;    // search results kept (shown PAGE at a time)

  var $ = function (id) { return document.getElementById(id); };
  var elQ = $("sgQ"), elClear = $("sgClear"), elAZ = $("sgAZ"), elList = $("sgList"), elListHead = $("sgListHead"),
      elMore = $("sgMore"), elStatus = $("sgStatus"), elBrowse = $("sgBrowse"), elSong = $("sgSong"),
      elTitle = $("sgTitle"), elLyrics = $("sgLyrics"), elLangML = $("sgLangML"), elLangMG = $("sgLangMG"),
      elSmaller = $("sgSmaller"), elBigger = $("sgBigger"), elBack = $("sgBack"), elSongMsg = $("sgSongMsg");
  if (!elQ || !elList || !elSong) return;

  var songs = [];           // [id, title, chunk]
  var byId = {};            // id -> position in songs
  var ver = "";
  var letters = {};         // "A" -> [positions]
  var searchData = null;    // { mg:[normalised...], ml:[normalised...], rawMg:[], rawMl:[] }
  var searchLoading = null;
  var chunkCache = {};      // chunk number -> Promise(obj)
  var shown = [];           // current list: [{pos, snip, snipML}]
  var shownCount = 0;
  var curLetter = "";
  var savedScroll = 0;
  var curSong = null;       // { id, title, ml, mg }
  var lang = store("ola_songs_lang_v1") === "mg" ? "mg" : "ml";
  var size = parseInt(store("ola_songs_size_v1"), 10); if (!(size >= 0 && size <= 4)) size = 2;

  /* ── tiny helpers ── */
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {}
    return null;
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function say(msg) { elStatus.textContent = msg || ""; }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function getJSON(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  /* ── text normalisation for searching ──
     Manglish is spelt in many ways (Kaanum / Kanum, Yeshu / Yesu, Dhaivam / Daivam): both the typed words and the
     song text are reduced the same way, so those spellings find each other. */
  var ML_RE = /[ഀ-ൿ]/;
  var LEGACY = { "ണ": "ൺ", "ന": "ൻ", "ര": "ർ", "ല": "ൽ", "ള": "ൾ", "ക": "ൿ" };
  function normMG(s) {
    return String(s).toLowerCase()
      .replace(/aa+/g, "a").replace(/ee+/g, "i").replace(/ii+/g, "i").replace(/oo+/g, "u").replace(/uu+/g, "u")
      .replace(/h/g, "").replace(/w/g, "v").replace(/c/g, "k").replace(/[^a-z]+/g, " ")
      .replace(/([a-z])\1+/g, "$1").replace(/\s+/g, " ").trim();
  }
  function normML(s) {
    return String(s)
      .replace(/([ണനരലളക])്‍/g, function (m, c) { return LEGACY[c]; })
      .replace(/[‌‍]/g, "")
      .replace(/[^ഀ-ൿ]+/g, " ").replace(/\s+/g, " ").trim();
  }

  /* ── boot ── */
  function boot() {
    say("Loading songs…");
    getJSON(DIR + "index.json").then(function (d) {
      songs = d.songs || [];
      ver = d.v || "";
      songs.forEach(function (s, i) {
        byId[s[0]] = i;
        var c = s[1].charAt(0).toUpperCase();
        if (!/[A-Z]/.test(c)) c = "#";
        (letters[c] = letters[c] || []).push(i);
      });
      renderAZ();
      say("");
      $("sgTotal").textContent = fmt(songs.length) + " songs";
      route();
    }).catch(function () {
      clear(elStatus);
      elStatus.appendChild(document.createTextNode("Could not load the songs. Please check your connection and "));
      var b = el("button", "sg-link-btn", "try again");
      b.type = "button";
      b.addEventListener("click", boot);
      elStatus.appendChild(b);
      elStatus.appendChild(document.createTextNode("."));
    });
  }

  /* ── A–Z index ── */
  function renderAZ() {
    clear(elAZ);
    var keys = Object.keys(letters).sort();
    keys.forEach(function (k) {
      var a = el("a", "sg-az-btn");
      a.href = "#letter=" + encodeURIComponent(k);
      a.setAttribute("data-letter", k);
      a.appendChild(el("span", "sg-az-l", k));
      a.appendChild(el("span", "sg-az-n", fmt(letters[k].length)));
      a.setAttribute("aria-label", "Songs starting with " + k + ", " + letters[k].length);
      elAZ.appendChild(a);
    });
  }
  function markLetter(k) {
    var items = elAZ.querySelectorAll(".sg-az-btn");
    for (var i = 0; i < items.length; i++) {
      var on = items[i].getAttribute("data-letter") === k;
      items[i].classList.toggle("is-on", on);
      if (on) items[i].setAttribute("aria-current", "true"); else items[i].removeAttribute("aria-current");
    }
  }

  /* ── list rendering (letters and search results share it) ── */
  function setList(headText, rows) {
    shown = rows; shownCount = 0;
    elListHead.textContent = headText;
    clear(elList);
    elMore.hidden = true;
    if (!rows.length) {
      elList.appendChild(el("li", "sg-empty", "No songs found. Try fewer words or a different spelling."));
      return;
    }
    renderMore();
  }
  function renderMore() {
    var end = Math.min(shown.length, shownCount + PAGE);
    for (var i = shownCount; i < end; i++) {
      var r = shown[i], s = songs[r.pos];
      var li = el("li", "sg-row");
      var a = el("a", "sg-item");
      a.href = "#song=" + s[0];
      a.appendChild(el("span", "sg-it", s[1]));
      if (r.snip) {
        var sn = el("span", "sg-snip", r.snip);
        if (r.snipML) sn.setAttribute("lang", "ml");
        a.appendChild(sn);
      }
      li.appendChild(a);
      elList.appendChild(li);
    }
    shownCount = end;
    var left = shown.length - shownCount;
    elMore.hidden = left <= 0;
    if (left > 0) elMore.textContent = "Show " + Math.min(PAGE, left) + " more (" + fmt(left) + " left)";
  }
  elMore.addEventListener("click", renderMore);

  function showLetter(k) {
    curLetter = k;
    markLetter(k);
    elQ.value = ""; elClear.hidden = true;
    var pos = letters[k] || [];
    setList("Songs starting with " + k + " (" + fmt(pos.length) + ")", pos.map(function (p) { return { pos: p }; }));
    say("");
  }

  /* ── search ── */
  function loadSearch() {
    if (searchData) return Promise.resolve(searchData);
    if (searchLoading) return searchLoading;
    searchLoading = getJSON(DIR + "search.json" + (ver ? "?v=" + ver : "")).then(function (d) {
      var n = songs.length;
      var sd = { mg: new Array(n), ml: new Array(n), rawMg: d.mg, rawMl: d.ml, title: new Array(n) };
      for (var i = 0; i < n; i++) {
        sd.title[i] = normMG(songs[i][1]);
        sd.mg[i] = normMG(d.mg[i] || "");
        sd.ml[i] = normML(d.ml[i] || "");
      }
      searchData = sd;
      return sd;
    }).catch(function (e) { searchLoading = null; throw e; });
    return searchLoading;
  }

  function matchLine(raw, norm, tokens) {
    var lines = String(raw || "").split("\n");
    for (var i = 0; i < lines.length; i++) {
      var n = norm(lines[i]);
      for (var t = 0; t < tokens.length; t++) if (n.indexOf(tokens[t]) > -1) return lines[i].replace(/\s+/g, " ").trim();
    }
    return lines[0] || "";
  }

  var searchSeq = 0;
  function runSearch(q) {
    var seq = ++searchSeq;
    var isML = ML_RE.test(q);
    var tokens = (isML ? normML(q) : normMG(q)).split(" ").filter(Boolean);
    if (!tokens.length || (tokens.join("").length < 2)) {
      if (!q.trim()) { clearSearch(); }
      else say("Type at least two letters.");
      return;
    }
    say("Searching…");
    loadSearch().then(function (sd) {
      if (seq !== searchSeq) return;
      var phrase = tokens.join(" ");
      var res = [];
      for (var i = 0; i < songs.length; i++) {
        var rank = 9, text;
        if (isML) {
          text = sd.ml[i];
          if (text.indexOf(phrase) > -1) rank = 2;
          else if (tokens.every(function (t) { return text.indexOf(t) > -1; })) rank = 3;
        } else {
          var tt = sd.title[i];
          text = tt + " " + sd.mg[i];
          if (tt.indexOf(phrase) === 0) rank = 0;
          else if (tokens.every(function (t) { return tt.indexOf(t) > -1; })) rank = 1;
          else if (sd.mg[i].indexOf(phrase) > -1) rank = 2;
          else if (tokens.every(function (t) { return text.indexOf(t) > -1; })) rank = 3;
        }
        if (rank < 9) res.push({ pos: i, rank: rank });
      }
      res.sort(function (a, b) { return a.rank - b.rank || a.pos - b.pos; });
      var total = res.length;
      res = res.slice(0, MAX_RESULTS);
      res.forEach(function (r) {
        if (isML) { r.snip = matchLine(sd.rawMl[r.pos], normML, tokens); r.snipML = true; }
        else if (r.rank >= 2) { r.snip = matchLine(sd.rawMg[r.pos], normMG, tokens); }
      });
      curLetter = ""; markLetter("");
      setList(total ? fmt(total) + (total === 1 ? " song" : " songs") + " found for “" + q.trim() + "”" +
                      (total > MAX_RESULTS ? " (showing the first " + MAX_RESULTS + ")" : "")
                    : "No results for “" + q.trim() + "”", res);
      say("");   // the list heading (a live region) announces the result count
    }).catch(function () {
      if (seq !== searchSeq) return;
      say("Could not load the search list. Please check your connection and try again.");
    });
  }
  function clearSearch() {
    searchSeq++;
    elQ.value = ""; elClear.hidden = true;
    elListHead.textContent = "";
    clear(elList); elMore.hidden = true; shown = []; shownCount = 0;
    curLetter = ""; markLetter("");
    say("");
    if (location.hash) { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} }
  }
  var timer = 0;
  elQ.addEventListener("input", function () {
    elClear.hidden = !elQ.value;
    clearTimeout(timer);
    timer = setTimeout(function () { runSearch(elQ.value); }, 150);
  });
  elQ.addEventListener("focus", function () { if (songs.length) loadSearch().catch(function () {}); });
  elClear.addEventListener("click", function () { clearSearch(); elQ.focus(); });
  $("sgSearchForm").addEventListener("submit", function (e) { e.preventDefault(); clearTimeout(timer); runSearch(elQ.value); });

  /* ── one song ── */
  function chunk(n) {
    if (!chunkCache[n]) {
      var name = ("00" + n).slice(-3);
      chunkCache[n] = getJSON(DIR + "c/" + name + ".json" + (ver ? "?v=" + ver : "")).catch(function (e) { delete chunkCache[n]; throw e; });
    }
    return chunkCache[n];
  }
  var SEP_RE = /^[\s\-‐-―_=~.*]+$/;

  function renderLyrics() {
    clear(elLyrics);
    elLyrics.className = "sg-lyrics sg-s" + size;
    elLyrics.setAttribute("lang", lang === "ml" ? "ml" : "en");
    elLangML.setAttribute("aria-pressed", lang === "ml");
    elLangMG.setAttribute("aria-pressed", lang === "mg");
    elLangML.classList.toggle("is-on", lang === "ml");
    elLangMG.classList.toggle("is-on", lang === "mg");
    elSmaller.disabled = size <= 0;
    elBigger.disabled = size >= 4;
    if (!curSong) return;
    var data = lang === "ml" ? curSong.ml : curSong.mg;
    if (!data || !data.length) {
      elLyrics.appendChild(el("p", "sg-msg", lang === "ml" ? "Malayalam lyrics are not available for this song." : "Manglish lyrics are not available for this song."));
      return;
    }
    var anyRole = data.some(function (b) { return !!b[0]; });
    if (!anyRole) elLyrics.className += " sg-norole";    // no singer markers in this text: no empty column
    data.forEach(function (b) {
      var role = b[0], lines = b[1];
      if (lines.length === 1 && SEP_RE.test(lines[0])) { elLyrics.appendChild(el("hr", "sg-sep")); return; }
      var blk = el("div", "sg-blk");
      blk.appendChild(el("span", "sg-role", role || ""));
      var p = el("p", "sg-lines");
      lines.forEach(function (l, i) {
        if (i) p.appendChild(document.createElement("br"));
        p.appendChild(document.createTextNode(l));
      });
      blk.appendChild(p);
      elLyrics.appendChild(blk);
    });
  }

  function openSong(id) {
    var pos = byId[id];
    elBrowse.hidden = true; elSong.hidden = false;
    clear(elLyrics); elSongMsg.textContent = "";
    if (pos === undefined) {
      curSong = null;
      elTitle.textContent = "Song not found";
      elSongMsg.textContent = "That song is not in the list. Please go back and choose another.";
      document.title = "Songs — Our Lady Of Assumption";
      window.scrollTo(0, 0);
      return;
    }
    var s = songs[pos];
    elTitle.textContent = s[1];
    document.title = s[1] + " — Songs — Our Lady Of Assumption";
    curSong = null;
    elLyrics.appendChild(el("p", "sg-msg", "Loading…"));
    window.scrollTo(0, 0);
    chunk(s[2]).then(function (obj) {
      if (location.hash !== "#song=" + id) return;
      var rec = obj[String(id)];
      curSong = { id: id, title: s[1], ml: rec ? rec[0] : [], mg: rec ? rec[1] : [] };
      renderLyrics();
      try { elTitle.focus({ preventScroll: true }); } catch (e) {}
    }).catch(function () {
      if (location.hash !== "#song=" + id) return;
      clear(elLyrics);
      var p = el("p", "sg-msg", "Could not load this song. ");
      var b = el("button", "sg-link-btn", "Try again");
      b.type = "button";
      b.addEventListener("click", function () { openSong(id); });
      p.appendChild(b);
      elLyrics.appendChild(p);
    });
  }

  elLangML.addEventListener("click", function () { lang = "ml"; store("ola_songs_lang_v1", lang); renderLyrics(); });
  elLangMG.addEventListener("click", function () { lang = "mg"; store("ola_songs_lang_v1", lang); renderLyrics(); });
  elSmaller.addEventListener("click", function () { if (size > 0) { size--; store("ola_songs_size_v1", size); renderLyrics(); } });
  elBigger.addEventListener("click", function () { if (size < 4) { size++; store("ola_songs_size_v1", size); renderLyrics(); } });
  var inPage = false;       // true once a song was opened from the list on this page (so Back can use the browser history)
  elBack.addEventListener("click", function (e) {
    e.preventDefault();
    if (inPage) { history.back(); return; }
    try { history.replaceState(null, "", location.pathname + location.search); } catch (err) { location.hash = ""; }
    route();
  });

  /* ── routing on the page address ── */
  function showBrowse() {
    var wasSong = !elSong.hidden;
    elSong.hidden = true; elBrowse.hidden = false;
    document.title = "Songs — Our Lady Of Assumption Syro Malabar Mission, Fairfield CT";
    if (wasSong) window.scrollTo(0, savedScroll);
  }
  var firstRoute = true;
  function route() {
    if (!songs.length) return;
    var h = location.hash.replace(/^#/, ""), m;
    if ((m = /^song=(\d+)$/.exec(h))) {
      if (elSong.hidden) { savedScroll = window.pageYOffset || 0; if (!elBrowse.hidden && !firstRoute) inPage = true; }
      firstRoute = false;
      openSong(parseInt(m[1], 10));
      return;
    }
    showBrowse();
    firstRoute = false;
    if ((m = /^letter=(.+)$/.exec(h))) {
      var k = decodeURIComponent(m[1]).toUpperCase();
      if (letters[k] && k !== curLetter) showLetter(k);
      else if (letters[k]) markLetter(k);
    } else if (!h && curLetter) {
      // address cleared (e.g. Back): keep whatever list is showing
    }
  }
  window.addEventListener("hashchange", route);

  renderLyrics();
  boot();
})();
