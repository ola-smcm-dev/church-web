/* =====================================================
   MEDIA — YouTube playlist videos + Google Drive photos
   =====================================================
   Loaded after main.js (uses CONFIG and escapeHtml from it).

   Data comes from one small Google Apps Script web app
   (see CONFIG.mediaApiUrl in main.js):
     ?action=videos → { ok, videos:[{ id, title, published }] }
     ?action=photos → { ok, total, recent:[{ id, name, album }],
                        albums:[{ id, name, count, photos:[{ id, name }] }] }

   Works on:
     • index.html  — "Watch With Us" video band + "Parish Life in Pictures" mosaic
                     (both stay hidden until there is something to show)
     • media.html  — full video grid + photo albums
   ===================================================== */
(function () {
  "use strict";

  var API        = (typeof CONFIG !== "undefined" && CONFIG.mediaApiUrl) ? CONFIG.mediaApiUrl : "";
  var YT_CHANNEL = (typeof CONFIG !== "undefined" && CONFIG.youtubeChannelUrl) ? CONFIG.youtubeChannelUrl : "";

  /* ── Small helpers ─────────────────────────────── */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return escapeHtml(String(s == null ? "" : s)); }

  function driveThumb(id, w) {
    return "https://drive.google.com/thumbnail?id=" + encodeURIComponent(id) + "&sz=w" + w;
  }
  function ytThumb(id) {
    return "https://i.ytimg.com/vi/" + encodeURIComponent(id) + "/hqdefault.jpg";
  }
  function watchUrl(id) {
    return "https://www.youtube.com/watch?v=" + encodeURIComponent(id);
  }
  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }
  // Hide camera-style file names (IMG_1234.jpg) but keep meaningful ones
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

  /* ── HTML builders ─────────────────────────────── */
  function thumbHtml(v) {
    return '<span class="pl-thumb">' +
      '<img src="' + ytThumb(v.id) + '" alt="" loading="lazy">' +
      '<span class="pl-play" aria-hidden="true"></span>' +
    '</span>';
  }

  function videoLinkOpen(v, cls) {
    return '<a class="' + cls + '" href="' + watchUrl(v.id) + '" data-vid="' + esc(v.id) +
      '" data-title="' + esc(v.title) + '" aria-label="Play video: ' + esc(v.title) + '">';
  }

  function photoTileHtml(p, idx, w, extraClass) {
    return '<button type="button" class="pl-tile' + (extraClass ? " " + extraClass : "") +
      '" data-pidx="' + idx + '" aria-label="Open photo ' + (idx + 1) + '">' +
      '<img src="' + driveThumb(p.id, w) + '" alt="" loading="lazy">' +
    '</button>';
  }

  /* ═════════════════════════════════════════════════
     HOME PAGE — video band + photo mosaic
     ═════════════════════════════════════════════════ */
  function initHome() {
    var vSec = $("videos");
    var pSec = $("photos");
    var feat = $("plVideoFeature");
    var list = $("plVideoList");
    var mos  = $("plMosaic");

    if (vSec && feat && list) {
      load("videos", function (data) {
        var vids = (data && data.videos) || [];
        vSec.hidden = !vids.length;
        if (!vids.length) return;

        var f = vids[0];
        feat.innerHTML =
          videoLinkOpen(f, "pl-video-card") + thumbHtml(f) +
            '<span class="pl-video-title">' + esc(f.title) + '</span>' +
            (f.published ? '<span class="pl-video-date">' + fmtDate(f.published) + '</span>' : '') +
          '</a>';

        list.innerHTML = vids.slice(1, 4).map(function (v) {
          return videoLinkOpen(v, "pl-video-row") + thumbHtml(v) +
            '<span class="pl-video-meta">' +
              '<span class="pl-video-title">' + esc(v.title) + '</span>' +
              (v.published ? '<span class="pl-video-date">' + fmtDate(v.published) + '</span>' : '') +
            '</span></a>';
        }).join("");
      });
    }

    if (pSec && mos) {
      load("photos", function (data) {
        var recent = (data && data.recent) || [];
        var total  = (data && data.total) || recent.length;
        pSec.hidden = !recent.length;
        if (!recent.length) return;

        var shown = recent.slice(0, 5);
        var few   = shown.length < 5;
        mos.className = "pl-mosaic" + (few ? " pl-mosaic--few" : "");

        mos.innerHTML = shown.map(function (p, i) {
          var big = !few && i === 0;
          var isMore = !few && i === 4 && total > 5;
          if (isMore) {
            return '<a class="pl-tile" href="media.html#photos" aria-label="View all ' + total + ' photos">' +
              '<img src="' + driveThumb(p.id, 400) + '" alt="" loading="lazy">' +
              '<span class="pl-tile-more">+' + (total - 4) + '<small>more photos</small></span></a>';
          }
          return photoTileHtml(p, i, big ? 900 : 400, big ? "pl-tile--big" : "");
        }).join("");

        // Lightbox over the recent set
        mos.onclick = function (e) {
          var btn = e.target.closest ? e.target.closest("[data-pidx]") : null;
          if (!btn) return;
          openLightbox(recent, +btn.getAttribute("data-pidx"), "Parish Life");
        };
      });
    }
  }

  /* ═════════════════════════════════════════════════
     MEDIA PAGE — video grid + albums
     ═════════════════════════════════════════════════ */
  function initMediaPage() {
    var vGrid = $("mediaVideoGrid");
    var aGrid = $("albumGrid");
    if (!vGrid && !aGrid) return;

    var chBtn = $("ytChannelBtn");
    if (chBtn && YT_CHANNEL) chBtn.href = YT_CHANNEL;

    if (vGrid) {
      load("videos", function (data) {
        var vids = (data && data.videos) || [];
        if (!vids.length) {
          vGrid.innerHTML = '<p class="media-note">Videos will appear here soon. In the meantime, please visit our YouTube channel.</p>';
          return;
        }
        vGrid.innerHTML = vids.map(function (v) {
          return videoLinkOpen(v, "media-video-card") + thumbHtml(v) +
            '<span class="pl-video-body">' +
              '<span class="pl-video-title">' + esc(v.title) + '</span>' +
              (v.published ? '<span class="pl-video-date">' + fmtDate(v.published) + '</span>' : '') +
            '</span></a>';
        }).join("");
      });
    }

    if (aGrid) initAlbums(aGrid);
  }

  function initAlbums(aGrid) {
    var detail = $("albumDetail");
    var pGrid  = $("photoGrid");
    var backBtn = $("albumBack");
    var title  = $("albumTitle");
    var count  = $("albumCount");
    var albums = [];
    var openIdx = -1;

    function photoWord(n) { return n + (n === 1 ? " photo" : " photos"); }

    function showGrid() {
      openIdx = -1;
      detail.hidden = true;
      aGrid.hidden = false;
    }

    function showAlbum(i, fromBack) {
      var a = albums[i];
      if (!a) return;
      openIdx = i;
      title.textContent = a.name;
      count.textContent = photoWord(a.photos.length);
      pGrid.innerHTML = a.photos.map(function (p, n) { return photoTileHtml(p, n, 400, ""); }).join("");
      aGrid.hidden = true;
      detail.hidden = false;
      backBtn.hidden = albums.length < 2;   // single album → no "back"
      if (!fromBack) {
        var sec = $("photos");
        if (sec && sec.scrollIntoView) sec.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    load("photos", function (data) {
      albums = ((data && data.albums) || []).filter(function (a) { return a.photos && a.photos.length; });
      if (!albums.length) {
        aGrid.hidden = false; detail.hidden = true;
        aGrid.innerHTML = '<p class="media-note">Photo albums will appear here soon.</p>';
        return;
      }
      aGrid.innerHTML = albums.map(function (a, i) {
        return '<button type="button" class="album-card" data-album="' + i + '">' +
          '<span class="album-cover"><img src="' + driveThumb(a.photos[0].id, 600) + '" alt="" loading="lazy"></span>' +
          '<span class="album-info"><span class="album-name">' + esc(a.name) + '</span>' +
          '<span class="album-count">' + photoWord(a.photos.length) + '</span></span></button>';
      }).join("");

      if (albums.length === 1) showAlbum(0, true); else if (openIdx > -1) showAlbum(openIdx, true); else showGrid();
    });

    aGrid.addEventListener("click", function (e) {
      var card = e.target.closest ? e.target.closest("[data-album]") : null;
      if (card) showAlbum(+card.getAttribute("data-album"));
    });
    if (backBtn) backBtn.addEventListener("click", function () {
      showGrid();
      var sec = $("photos");
      if (sec && sec.scrollIntoView) sec.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    pGrid.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest("[data-pidx]") : null;
      if (btn && openIdx > -1) openLightbox(albums[openIdx].photos, +btn.getAttribute("data-pidx"), albums[openIdx].name);
    });
  }

  /* ═════════════════════════════════════════════════
     VIDEO MODAL (YouTube, privacy-enhanced embed)
     ═════════════════════════════════════════════════ */
  var vModal = null, vFrame = null, vTitle = null;

  function ensureVideoModal() {
    if (vModal) return;
    vModal = document.createElement("div");
    vModal.className = "pl-modal";
    vModal.hidden = true;
    vModal.setAttribute("role", "dialog");
    vModal.setAttribute("aria-modal", "true");
    vModal.setAttribute("aria-label", "Video player");
    vModal.innerHTML =
      '<div class="pl-modal-backdrop" data-close></div>' +
      '<div class="pl-modal-box">' +
        '<button type="button" class="pl-modal-close" data-close aria-label="Close video">&#x2715;</button>' +
        '<div class="pl-video-frame"></div>' +
        '<p class="pl-modal-title"></p>' +
        '<p class="pl-modal-yt"><a href="#" target="_blank" rel="noopener noreferrer">Watch on YouTube</a></p>' +
      '</div>';
    document.body.appendChild(vModal);
    vFrame = vModal.querySelector(".pl-video-frame");
    vTitle = vModal.querySelector(".pl-modal-title");
    vModal.addEventListener("click", function (e) {
      if (e.target.hasAttribute && e.target.hasAttribute("data-close")) closeVideo();
    });
  }

  var lastFocus = null;

  function openVideo(id, title) {
    ensureVideoModal();
    lastFocus = document.activeElement;
    vFrame.innerHTML =
      '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
      '?autoplay=1&rel=0&modestbranding=1" title="' + esc(title || "Video") + '" ' +
      'allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    vTitle.textContent = title || "";
    vModal.querySelector(".pl-modal-yt a").href = watchUrl(id);
    vModal.hidden = false;
    document.body.style.overflow = "hidden";
    vModal.querySelector(".pl-modal-close").focus();
  }

  function closeVideo() {
    if (!vModal || vModal.hidden) return;
    vFrame.innerHTML = "";            // stops playback
    vModal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

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
    // Any video link on the page opens the player
    document.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      var a = e.target.closest ? e.target.closest("a[data-vid]") : null;
      if (!a) return;
      e.preventDefault();
      openVideo(a.getAttribute("data-vid"), a.getAttribute("data-title"));
    });

    document.addEventListener("keydown", function (e) {
      if (lb && !lb.hidden) {
        if (e.key === "Escape")           closeLightbox();
        else if (e.key === "ArrowLeft")   stepPhoto(-1);
        else if (e.key === "ArrowRight")  stepPhoto(1);
        else if (e.key === "Tab")         trapTab(lb, e);
      } else if (vModal && !vModal.hidden) {
        if (e.key === "Escape")           closeVideo();
        else if (e.key === "Tab")         trapTab(vModal, e);
      }
    });
  }

  /* ── Boot ── */
  document.addEventListener("DOMContentLoaded", function () {
    bindGlobal();
    initHome();
    initMediaPage();
  });
})();
