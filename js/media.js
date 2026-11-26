/* =====================================================
   MEDIA — Parish Life page (event cards, photo lightbox)
   =====================================================
   Loaded after main.js (uses CONFIG, escapeHtml and the sheet helpers from it).

   2026-11-26: the parish removed the public photo galleries and YouTube video sections
   (home page, Religious Education page, media page). Only parish-life.html is left here:
   ?action=highlights (people-free photos, one folder per event) plus the "Parish Life" sheet tab.
   The Media API also keeps its SHOW_PEOPLE_MEDIA = false switch as a safety net.
   ===================================================== */
(function () {
  "use strict";

  var API        = (typeof CONFIG !== "undefined" && CONFIG.mediaApiUrl) ? CONFIG.mediaApiUrl : "";
  /* ── Small helpers ─────────────────────────────── */
  function $(id) { return document.getElementById(id); }

  function driveThumb(id, w) {
    return "https://drive.google.com/thumbnail?id=" + encodeURIComponent(id) + "&sz=w" + w;
  }
  function niceName(name) {
    if (!name) return "";
    var n = String(name).replace(/\.[a-z0-9]{2,5}$/i, "").replace(/[_]+/g, " ").trim();
    if (/^(img|dsc|dscn|pxl|mvimg|photo|image|screenshot|whatsapp|signal)[\s._-]*[\d\s._-]*$/i.test(n)) return "";
    if (/^[\d\s._-]+$/.test(n)) return "";
    return n;
  }

  /* ── Data loading: show cache first, then refresh ── */
  function readCache(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function writeCache(key, txt) {
    try { localStorage.setItem(key, txt); } catch (e) {}
  }
  function parse(txt) {
    try {
      var d = JSON.parse(txt);
      return d && d.ok ? d : null;
    } catch (e) { return null; }
  }

  // cb(data | null) — may be called twice (cache, then fresh)
  function load(action, cb) {
    var key    = "ola_media_" + action;
    var cached = readCache(key);
    var shown  = false;

    if (cached) {
      var cd = parse(cached);
      if (cd) { cb(cd); shown = true; }
    }
    if (!API) { if (!shown) cb(null); return; }

    fetch(API + (API.indexOf("?") > -1 ? "&" : "?") + "action=" + action)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (txt) {
        var data = parse(txt);
        if (!data) throw new Error("Bad response");
        if (txt !== cached) {
          writeCache(key, txt);
          cb(data);
        }
      })
      .catch(function () { if (!shown) cb(null); });
  }

  /* ═════════════════════════════════════════════════
     PARISH LIFE PAGE (parish-life.html)
     One card per EVENT (Onam, Church Feast, ...): a standard description plus the
     newest photos of that event. There is no year-by-year archive, so nothing has
     to be written again every year.
       Words  — the "Parish Life" tab of the WebAdmin sheet (published as CSV, see
                CONFIG.parishLifeSheetUrl). It lists every APPROVED submission
                (Event, When, Description, Photo folder, Order, Updated). For each
                event the NEWEST approved text wins, so approving a new text
                replaces the old one.
       Photos — the public "Website Highlights" Drive folder through the Media API
                (?action=highlights): one folder per event, newest 6 photos. A photo
                folder only shows when an approved text points at it (Photo folder,
                which defaults to the Event name).
     Every piece of text is written with textContent / text nodes — nothing typed in
     the sheet is ever run as HTML. Only **bold** and blank-line paragraph breaks are
     understood.
     ═════════════════════════════════════════════════ */
  function initParishLife() {
    var root = $("parishLife");
    if (!root) return;
    var bodyEl = $("plfBody");
    var SHEET = (typeof CONFIG !== "undefined" && CONFIG.parishLifeSheetUrl) ? CONFIG.parishLifeSheetUrl : "";
    var CACHE_KEY = "ola_parishlife_csv_v2";
    var MAX_PHOTOS = 6;
    var entries = null;         // null = still loading; [] = loaded, nothing to show
    var folders = {};           // norm(folder name) -> [{ id, name, t }, ...]
    var photoSets = [];         // photo lists of the cards on screen (for the lightbox)
    var scrolled = false;

    function norm(s) { return String(s == null ? "" : s).toLowerCase().replace(/[^a-z0-9]/g, ""); }
    function sheetCsvUrl(u) {
      u = String(u).replace("/pubhtml", "/pub");
      return /output=csv/.test(u) ? u : u + (u.indexOf("?") > -1 ? "&" : "?") + "output=csv";
    }

    // One entry per event: the newest approved text. Events are listed by Order, then by name.
    function parseEntries(text) {
      var best = {};
      parseSheetObjects(text).forEach(function (r) {
        var event = String(r.event || "").trim().slice(0, 60);
        var desc  = String(r.description || "").trim().slice(0, 1600);
        var key   = norm(event);
        if (!key || !desc) return;
        var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(r.updated || "").trim());
        var upd = (m && +m[1] >= 2000) ? (+m[1]) * 10000 + (+m[2]) * 100 + (+m[3]) : 0;
        var o = parseFloat(r.order);
        var cur = best[key];
        if (cur && upd < cur.upd) return;            // an older text never replaces a newer one
        best[key] = {
          key: key, event: event, desc: desc, upd: upd,
          when: String(r.when || "").trim().slice(0, 60),
          folder: String(r.photofolder || "").trim() || event,
          order: isFinite(o) ? o : 999
        };
      });
      return Object.keys(best).map(function (k) { return best[k]; }).sort(function (a, b) {
        return (a.order - b.order) || a.event.localeCompare(b.event);
      });
    }

    // Plain text with **bold** and blank-line paragraphs, built from DOM nodes.
    function addRich(parent, text) {
      String(text).replace(/\r\n?/g, "\n").split(/\n\s*\n/).forEach(function (para) {
        para = para.trim();
        if (!para) return;
        var p = document.createElement("p");
        para.split(/(\*\*[^*\n]+\*\*)/).forEach(function (part) {
          if (!part) return;
          var m = /^\*\*([^*\n]+)\*\*$/.exec(part);
          if (m) {
            var b = document.createElement("strong");
            b.textContent = m[1];
            p.appendChild(b);
          } else {
            part.split("\n").forEach(function (line, i) {
              if (i) p.appendChild(document.createElement("br"));
              p.appendChild(document.createTextNode(line));
            });
          }
        });
        parent.appendChild(p);
      });
    }

    function el(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    }

    // "Photos from September 2026" from the newest photo's upload date
    function photoCaption(list) {
      var newest = "";
      list.forEach(function (p) { if (p.t && p.t > newest) newest = p.t; });
      var d = newest ? new Date(newest) : null;
      if (!d || isNaN(d)) return "Recent photos";
      return "Photos from " + d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }

    function cardFor(e) {
      var art = el("article", "plf-card");
      art.id = e.key;
      art.appendChild(el("h3", "plf-title", e.event));
      if (e.when) art.appendChild(el("p", "plf-when", e.when));
      var txt = el("div", "plf-text");
      addRich(txt, e.desc);
      art.appendChild(txt);

      var list = (folders[norm(e.folder)] || []).slice(0, MAX_PHOTOS);
      if (list.length) {
        var setIdx = photoSets.push({ list: list, title: e.event }) - 1;
        var grid = el("div", "plf-photos plf-n" + (list.length >= 5 ? 3 : list.length));
        list.forEach(function (p, i) {
          var b = el("button", "plf-photo");
          b.type = "button";
          b.setAttribute("data-set", setIdx);
          b.setAttribute("data-pidx", i);
          b.setAttribute("aria-label", "Open photo " + (i + 1) + " of " + list.length + ": " + e.event);
          var img = document.createElement("img");
          img.src = driveThumb(p.id, 700);
          img.alt = niceName(p.name) || "";
          img.loading = "lazy";
          b.appendChild(img);
          grid.appendChild(b);
        });
        art.appendChild(grid);
        art.appendChild(el("p", "plf-caption", photoCaption(list)));
      }
      return art;
    }

    function say(text) {
      bodyEl.textContent = "";
      bodyEl.appendChild(el("p", "media-note", text));
    }

    function render() {
      bodyEl.textContent = "";
      photoSets = [];
      if (entries === null) return say("Loading…");
      if (!entries.length) return say("Our parish stories and highlights will appear here soon.");
      entries.forEach(function (e) { bodyEl.appendChild(cardFor(e)); });
      if (!scrolled) {                                   // /parish-life.html#onam jumps to that event
        scrolled = true;
        var h = (location.hash || "").replace("#", "");
        var t = /^[a-z0-9]+$/.test(h) ? document.getElementById(h) : null;
        if (t && root.contains(t) && t.scrollIntoView) t.scrollIntoView({ block: "start" });
      }
    }

    bodyEl.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-set]") : null;
      if (!b) return;
      var s = photoSets[+b.getAttribute("data-set")];
      if (s) openLightbox(s.list, +b.getAttribute("data-pidx"), s.title);
    });

    // Photos (Media API) — re-draw when they arrive
    load("highlights", function (data) {
      folders = {};
      ((data && data.events) || []).forEach(function (ev) {
        if (ev && ev.photos && ev.photos.length) folders[norm(ev.name)] = ev.photos;
      });
      render();
    });

    // Words (published sheet tab) — cached copy first, then fresh
    var cached = readCache(CACHE_KEY);
    if (cached) { entries = parseEntries(cached); render(); }
    if (!SHEET) { if (entries === null) { entries = []; render(); } return; }
    fetch(sheetCsvUrl(SHEET))
      .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.text(); })
      .then(function (txt) {
        if (txt === cached) return;
        writeCache(CACHE_KEY, txt);
        entries = parseEntries(txt);
        render();
      })
      .catch(function () { if (entries === null) { entries = []; render(); } });
  }

  var lastFocus = null;

  /* ═════════════════════════════════════════════════
     PHOTO LIGHTBOX (prev / next, keyboard, swipe)
     ═════════════════════════════════════════════════ */
  var lb = null, lbImg = null, lbCap = null;
  var lbList = [], lbIdx = 0, lbAlbum = "";

  function ensureLightbox() {
    if (lb) return;
    lb = document.createElement("div");
    lb.className = "pl-modal pl-lightbox";
    lb.hidden = true;
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Photo viewer");
    lb.innerHTML =
      '<div class="pl-modal-backdrop" data-close></div>' +
      '<button type="button" class="pl-modal-close" data-close aria-label="Close photo">&#x2715;</button>' +
      '<button type="button" class="pl-nav-btn pl-nav-prev" data-step="-1" aria-label="Previous photo">&#8249;</button>' +
      '<button type="button" class="pl-nav-btn pl-nav-next" data-step="1" aria-label="Next photo">&#8250;</button>' +
      '<figure class="pl-lightbox-figure">' +
        '<img class="pl-lightbox-img" alt="">' +
        '<figcaption class="pl-lightbox-cap" aria-live="polite"></figcaption>' +
      '</figure>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector(".pl-lightbox-img");
    lbCap = lb.querySelector(".pl-lightbox-cap");

    lb.addEventListener("click", function (e) {
      var t = e.target;
      if (t.hasAttribute && t.hasAttribute("data-close")) return closeLightbox();
      var step = t.getAttribute && t.getAttribute("data-step");
      if (step) stepPhoto(+step);
    });

    // Swipe on touch screens
    var sx = null;
    lb.addEventListener("touchstart", function (e) { sx = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      sx = null;
      if (Math.abs(dx) > 50) stepPhoto(dx < 0 ? 1 : -1);
    }, { passive: true });

    lbImg.addEventListener("load",  function () { lbImg.style.opacity = "1"; });
    lbImg.addEventListener("error", function () {
      lbImg.style.opacity = "1";
      lbCap.textContent = "Sorry, this photo could not be loaded.";
    });
  }

  function showPhoto(i) {
    var n = lbList.length;
    lbIdx = (i + n) % n;
    var p = lbList[lbIdx];
    var name = niceName(p.name) || lbAlbum;
    lbImg.style.opacity = "0.35";
    lbImg.alt = name || "Parish photo";
    lbImg.src = driveThumb(p.id, 1600);
    lbCap.textContent = (name ? name + "  ·  " : "") + (lbIdx + 1) + " / " + n;
    lb.querySelector(".pl-nav-prev").hidden = n < 2;
    lb.querySelector(".pl-nav-next").hidden = n < 2;
    // Preload neighbours
    if (n > 1) {
      [lbIdx + 1, lbIdx - 1].forEach(function (k) {
        var q = lbList[(k + n) % n];
        if (q) { var im = new Image(); im.src = driveThumb(q.id, 1600); }
      });
    }
  }

  function stepPhoto(d) { if (lbList.length > 1) showPhoto(lbIdx + d); }

  function openLightbox(list, idx, albumName) {
    if (!list || !list.length) return;
    ensureLightbox();
    lastFocus = document.activeElement;
    lbList = list;
    lbAlbum = albumName || "";
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    showPhoto(idx || 0);
    lb.querySelector(".pl-modal-close").focus();
  }

  function closeLightbox() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    lbImg.removeAttribute("src");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ═════════════════════════════════════════════════
     GLOBAL EVENTS
     ═════════════════════════════════════════════════ */
  function trapTab(modal, e) {
    var f = modal.querySelectorAll("button:not([hidden]), a[href]");
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function bindGlobal() {
    document.addEventListener("keydown", function (e) {
      if (lb && !lb.hidden) {
        if (e.key === "Escape")           closeLightbox();
        else if (e.key === "ArrowLeft")   stepPhoto(-1);
        else if (e.key === "ArrowRight")  stepPhoto(1);
        else if (e.key === "Tab")         trapTab(lb, e);
      }
    });
  }

  /* ── Boot ── */
  document.addEventListener("DOMContentLoaded", function () {
    // Visitors' browsers may still hold the old photo/video lists from before 2026-11-22: drop them
    // (the fresh API answer is stored again straight away).
    try { localStorage.removeItem("ola_media_photos"); localStorage.removeItem("ola_media_videos"); } catch (e) {}
    bindGlobal();
    initParishLife();
  });
})();
