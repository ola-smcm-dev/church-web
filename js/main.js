/* =====================================================
   CHURCH WEBSITE — MAIN JAVASCRIPT
   =====================================================

   HOW TO CONFIGURE THIS WEBSITE
   ══════════════════════════════
   Edit the CONFIG object below with your church's
   actual information. That's all you need to update
   in this file — all other content is in index.html.

   ===================================================== */

const CONFIG = {
  // ── Church Info ──────────────────────────────────
  churchName:        "Our Lady Of Assumption",

  // ── Contact Details ──────────────────────────────
  // These update the contact section and footer automatically.
  address:           "838 Kings Hwy E, Fairfield, CT 06825",
  phone:             "(203) 274-2702",
  phoneTel:          "+12032742702",     // E.164 format for tel: links
  email:             "smcc.norwalk@gmail.com",

  // ── Donation ─────────────────────────────────────
  // Replace with your PayPal, Tithe.ly, WeShare, or similar link
  donationUrl:       "#",

  // ── Google Maps ──────────────────────────────────
  // Get your embed URL: maps.google.com → Share → Embed a map → copy src="..."
  googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2475.5015716394296!2d-73.23512512395138!3d41.168304471328476!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e80fcd0abfff0f%3A0x20c233854ccd6f00!2sSt%20Emery's%20RC%20Church!5e1!3m2!1sen!2sus!4v1773586609674!5m2!1sen!2sus",

  // ── Facebook ─────────────────────────────────────
  // Your Facebook Page URL (e.g. "https://www.facebook.com/StMaryParish")
  facebookPageUrl:   "https://www.facebook.com/ourladyofassumptionsmcc",

  // ── YouTube ──────────────────────────────────────
  // Get Channel ID: YouTube channel → About → Share channel → Copy channel ID
  // Looks like: UC... or @yourchurchhandle
  youtubeChannelId:  "",                 // e.g. "UCxxxxxxxxxxxxxxxxxx"
  youtubeChannelUrl: "https://www.youtube.com/@ourladyofassumptionsyromal2115",

  // ── Instagram ────────────────────────────────────
  instagramHandle:   "@syro_connecticut",
  instagramUrl:      "https://www.instagram.com/syro_connecticut",

  // ── Announcements (Google Sheets) ────────────────
  // Sheet columns: Text | Active (Yes/No)
  // File → Share → Publish to web → Sheet1 → CSV → Publish
  // Leave blank to use the hardcoded items in index.html.
  announcementsSheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSluQ2kZE_gDTLtpDOkBMlSUBLH9hroTEw3sm3g4AMwYAcyH1FHImxiTXldXHqttzvFnL7JG6K6dlIg/pub?gid=0&single=true&output=csv",

  // ── Upcoming Events (Google Sheets) ──────────────
  // Sheet columns: Date (YYYY-MM-DD) | Title | Time | Description | Active (Yes/No)
  // File → Share → Publish to web → Sheet1 → CSV → Publish
  // Leave blank to use the hardcoded items in index.html.
  eventsSheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSluQ2kZE_gDTLtpDOkBMlSUBLH9hroTEw3sm3g4AMwYAcyH1FHImxiTXldXHqttzvFnL7JG6K6dlIg/pub?gid=1327592415&single=true&output=csv",

  // ── Parish Posters (Google Sheets) ───────────────
  // Sheet columns: Title | Date (YYYY-MM-DD) | ImageFileId | Description | Active (Yes/No)
  // ImageFileId: the ID from the Google Drive share link
  //   Share link:  https://drive.google.com/file/d/FILE_ID_HERE/view
  //   Just copy the FILE_ID_HERE part into the sheet.
  // File → Share → Publish to web → Sheet1 → CSV → Publish
  // Section is hidden automatically when no active posters exist.
  postersSheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSluQ2kZE_gDTLtpDOkBMlSUBLH9hroTEw3sm3g4AMwYAcyH1FHImxiTXldXHqttzvFnL7JG6K6dlIg/pub?gid=2077561181&single=true&output=csv",

  // ── WhatsApp Join Request (Google Apps Script) ────
  // Submits join requests to Google Sheets and triggers email notification.
  // Deploy your Apps Script as a Web App (Execute as: Me, Access: Anyone)
  whatsappFormUrl: "https://script.google.com/macros/s/AKfycbzts7DEdylQz72HWe8Zi6r2iUL7k5_TtDmnVTrwJFLGymWizmcBkqZaF2tQwbfR8JdD_A/exec",
};

/* ═════════════════════════════════════════════════════
   BOOTSTRAP — runs when DOM is ready
   ═════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", function () {
  applyConfig();
  initNav();
  initSmoothScroll();
  initScrollAnimations();
  initBackToTop();
  initFacebookEmbed();
  initYouTubeFeed();
  initMapEmbed();
  setFooterYear();
  initAnnouncements();
  initEvents();
  initPosters();
  initWhatsAppModal();
});

/* ─────────────────────────────────────────────────────
   Apply CONFIG values to DOM elements
   ───────────────────────────────────────────────────── */
function applyConfig() {
  // Donation button
  var donateBtn = document.getElementById("donateOnlineBtn");
  if (donateBtn) donateBtn.href = CONFIG.donationUrl;

  // Facebook links
  var fbLinks = [
    document.getElementById("facebookPageLink"),
    document.getElementById("contactFacebook"),
  ];
  fbLinks.forEach(function (el) {
    if (el) el.href = CONFIG.facebookPageUrl;
  });

  // YouTube links
  var ytLinks = [
    document.getElementById("youtubeChannelLink"),
    document.getElementById("contactYoutube"),
  ];
  ytLinks.forEach(function (el) {
    if (el) el.href = CONFIG.youtubeChannelUrl;
  });

  // Instagram links
  var igLinks = [
    document.getElementById("instagramLink"),
    document.getElementById("instagramVisitLink"),
    document.getElementById("contactInstagram"),
  ];
  igLinks.forEach(function (el) {
    if (el) el.href = CONFIG.instagramUrl;
  });

  var igHandle = document.getElementById("instagramHandle");
  if (igHandle) igHandle.textContent = CONFIG.instagramHandle;

  // Topbar
  var tbPhone = document.getElementById("topbarPhone");
  if (tbPhone) {
    tbPhone.href = "tel:" + CONFIG.phoneTel;
    var tbPhoneText = tbPhone.querySelector(".topbar-text");
    if (tbPhoneText) tbPhoneText.textContent = CONFIG.phone;
  }
  var tbEmail = document.getElementById("topbarEmail");
  if (tbEmail) {
    tbEmail.href = "mailto:" + CONFIG.email;
    var tbEmailText = tbEmail.querySelector(".topbar-text");
    if (tbEmailText) tbEmailText.textContent = CONFIG.email;
  }

  // Contact info
  var phoneEls = [
    document.getElementById("contactPhone"),
    document.getElementById("footerPhone"),
  ];
  phoneEls.forEach(function (el) {
    if (el) {
      el.textContent = CONFIG.phone;
      el.href = "tel:" + CONFIG.phoneTel;
    }
  });

  var emailEls = [
    document.getElementById("contactEmail"),
    document.getElementById("footerEmail"),
  ];
  emailEls.forEach(function (el) {
    if (el) {
      el.textContent = CONFIG.email;
      el.href = "mailto:" + CONFIG.email;
    }
  });
}

/* ─────────────────────────────────────────────────────
   NAVIGATION — topbar hamburger toggles sticky bar
   ───────────────────────────────────────────────────── */
function initNav() {
  var topbarBtn    = document.getElementById("topbarHamburger");
  var stickyBar    = document.getElementById("stickyBar");
  var photo        = document.querySelector(".hg-photo");
  var scrolledPast = false;
  var menuOpen     = false;

  function update() {
    if (!stickyBar) return;
    var visible = scrolledPast || menuOpen;
    stickyBar.classList.toggle("visible", visible);
    stickyBar.classList.toggle("sticky-bar--menu-open", menuOpen);
    stickyBar.setAttribute("aria-hidden", visible ? "false" : "true");
    document.body.classList.toggle("sticky-visible", visible);
    if (topbarBtn) topbarBtn.setAttribute("aria-expanded", menuOpen ? "true" : "false");
  }

  // Hamburger always toggles the expanded menu
  if (topbarBtn) {
    topbarBtn.addEventListener("click", function () {
      menuOpen = !menuOpen;
      update();
    });
  }

  // Close menu when any sticky nav link is clicked
  if (stickyBar) {
    stickyBar.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menuOpen = false;
        update();
      });
    });
  }

  // Scroll: controls visibility; closes menu when scroll takes over
  var heroHeight = photo ? photo.offsetHeight : 300;
  window.addEventListener("scroll", function () {
    var wasPast = scrolledPast;
    scrolledPast = window.scrollY > heroHeight * 0.6;
    if (scrolledPast && !wasPast) menuOpen = false; // hand off to scroll, close menu
    update();
  }, { passive: true });
}

/* ─────────────────────────────────────────────────────
   SMOOTH SCROLL for anchor links
   ───────────────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var targetId = this.getAttribute("href");
      if (targetId === "#") return;
      var target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      // If target is hidden (e.g. desktop-only element on mobile), use fallback
      if (target.offsetParent === null) {
        var fallbackId = target.getAttribute("data-mobile-fallback");
        if (fallbackId) target = document.getElementById(fallbackId) || target;
      }
      // Offset by topbar + sticky bar height so content isn't hidden beneath them
      var topbar    = document.querySelector(".topbar");
      var stickyBar = document.getElementById("stickyBar");
      var offset    = (topbar ? topbar.offsetHeight : 0) +
                      (stickyBar && stickyBar.classList.contains("visible") ? stickyBar.offsetHeight : 0) +
                      8;
      var offsetTop = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: offsetTop, behavior: "smooth" });
    });
  });
}

/* ─────────────────────────────────────────────────────
   SCROLL ANIMATIONS (fade-in on scroll)
   ───────────────────────────────────────────────────── */
function initScrollAnimations() {
  var items = document.querySelectorAll(".animate-on-scroll");
  if (!items.length) return;

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    items.forEach(function (el) { observer.observe(el); });
  } else {
    // Fallback: show all immediately for browsers without IntersectionObserver
    items.forEach(function (el) { el.classList.add("visible"); });
  }
}

/* ─────────────────────────────────────────────────────
   BACK TO TOP BUTTON
   ───────────────────────────────────────────────────── */
function initBackToTop() {
  var btn = document.getElementById("backToTop");
  if (!btn) return;

  window.addEventListener("scroll", function () {
    if (window.scrollY > 400) {
      btn.classList.add("visible");
    } else {
      btn.classList.remove("visible");
    }
  }, { passive: true });
}

/* ─────────────────────────────────────────────────────
   YOUTUBE FEED via RSS2JSON
   ───────────────────────────────────────────────────── */
function initYouTubeFeed() {
  var grid = document.getElementById("youtubeGrid");
  if (!grid) return;

  if (!CONFIG.youtubeChannelId) {
    grid.innerHTML = renderYouTubeFallback();
    return;
  }

  var rssUrl   = "https://www.youtube.com/feeds/videos.xml?channel_id=" + encodeURIComponent(CONFIG.youtubeChannelId);
  var apiUrl   = "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(rssUrl) + "&count=2";

  fetch(apiUrl)
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      if (data.status !== "ok" || !data.items || !data.items.length) {
        throw new Error("No videos returned");
      }
      grid.innerHTML = data.items
        .slice(0, 2)
        .map(renderYouTubeCard)
        .join("");
    })
    .catch(function () {
      grid.innerHTML = renderYouTubeFallback();
    });
}

function renderYouTubeCard(item) {
  var videoId = extractYouTubeId(item.link);
  var thumb   = videoId
    ? "https://img.youtube.com/vi/" + videoId + "/mqdefault.jpg"
    : "";
  var videoUrl = item.link || CONFIG.youtubeChannelUrl;
  var pubDate  = item.pubDate ? formatDate(item.pubDate) : "";
  var title    = escapeHtml(item.title || "Watch on YouTube");

  return (
    '<a class="yt-card" href="' + videoUrl + '" target="_blank" rel="noopener noreferrer" aria-label="Watch: ' + title + '">' +
    '  <div class="yt-thumb-wrap">' +
    (thumb ? '<img class="yt-thumb" src="' + thumb + '" alt="' + title + '" loading="lazy">' : '') +
    '    <div class="yt-play-btn"><div class="yt-play-icon"></div></div>' +
    '  </div>' +
    '  <div class="yt-meta">' +
    '    <p class="yt-title">' + title + '</p>' +
    (pubDate ? '<p class="yt-date">' + pubDate + '</p>' : '') +
    '  </div>' +
    '</a>'
  );
}

function renderYouTubeFallback() {
  return (
    '<div class="social-fallback">' +
    '<p>Visit our YouTube channel for the latest Mass recordings and parish videos.</p>' +
    '<br><a href="' + CONFIG.youtubeChannelUrl + '" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Visit Our YouTube Channel</a>' +
    '</div>'
  );
}

function extractYouTubeId(url) {
  if (!url) return null;
  var match = url.match(/[?&]v=([^&#]+)/) || url.match(/youtu\.be\/([^?&]+)/);
  return match ? match[1] : null;
}

/* ─────────────────────────────────────────────────────
   FACEBOOK PAGE PLUGIN
   ───────────────────────────────────────────────────── */
function initFacebookEmbed() {
  var container = document.getElementById("facebookEmbed");
  if (!container) return;

  if (!CONFIG.facebookPageUrl || CONFIG.facebookPageUrl === "#") {
    container.innerHTML = renderFacebookFallback();
    return;
  }

  // Inject Facebook SDK asynchronously (after page load for performance)
  (function (d, s, id) {
    if (d.getElementById(id)) return;
    var js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0";
    js.async = true;
    js.defer = true;
    js.crossOrigin = "anonymous";
    d.head.appendChild(js);
  })(document, "script", "facebook-jssdk");

  container.innerHTML =
    '<div class="fb-page" ' +
    '  data-href="' + CONFIG.facebookPageUrl + '" ' +
    '  data-tabs="timeline" ' +
    '  data-width="500" ' +
    '  data-height="400" ' +
    '  data-small-header="false" ' +
    '  data-adapt-container-width="true" ' +
    '  data-hide-cover="false" ' +
    '  data-show-facepile="true">' +
    '  <blockquote cite="' + CONFIG.facebookPageUrl + '" class="fb-xfbml-parse-ignore">' +
    '    <a href="' + CONFIG.facebookPageUrl + '" target="_blank" rel="noopener noreferrer">Visit us on Facebook</a>' +
    '  </blockquote>' +
    '</div>';

  // Fallback: if FB SDK doesn't load in 5 seconds, show link
  setTimeout(function () {
    var fbPage = container.querySelector(".fb-page");
    if (fbPage && !fbPage.querySelector("iframe")) {
      container.innerHTML = renderFacebookFallback();
    }
  }, 5000);
}

function renderFacebookFallback() {
  return (
    '<div class="social-fallback">' +
    '<p>Follow our parish on Facebook for news, events, and community updates.</p><br>' +
    '<a href="' + CONFIG.facebookPageUrl + '" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Visit Our Facebook Page</a>' +
    '</div>'
  );
}

/* ─────────────────────────────────────────────────────
   GOOGLE MAPS EMBED
   ───────────────────────────────────────────────────── */
function initMapEmbed() {
  var wrap = document.getElementById("mapEmbed");
  if (!wrap) return;
  if (!CONFIG.googleMapsEmbedUrl) return; // keeps the placeholder visible

  wrap.innerHTML =
    '<iframe ' +
    '  src="' + CONFIG.googleMapsEmbedUrl + '" ' +
    '  width="100%" height="400" ' +
    '  style="border:0;" ' +
    '  allowfullscreen="" ' +
    '  loading="lazy" ' +
    '  referrerpolicy="no-referrer-when-downgrade" ' +
    '  title="Church location map">' +
    '</iframe>';
}

/* ─────────────────────────────────────────────────────
   FOOTER YEAR
   ───────────────────────────────────────────────────── */
function setFooterYear() {
  var el = document.getElementById("footerYear");
  if (el) el.textContent = new Date().getFullYear();
}

/* ─────────────────────────────────────────────────────
   ANNOUNCEMENTS — Google Sheets CSV + localStorage cache
   ─────────────────────────────────────────────────────
   Sheet format (row 1 = header, ignored):
     Column A: Announcement text
     Column B: Active  (type "Yes" to show, anything else hides it)

   Load order:
     1. Show localStorage cache immediately (instant)
     2. Fetch fresh CSV from Google Sheets in background
     3. On success  → update display + save to cache
     4. On failure  → cached version stays (no visible change)
     5. No sheet URL set → use hardcoded items in index.html
   ───────────────────────────────────────────────────── */
function initAnnouncements() {
  var track    = document.querySelector(".hg-announce-track");
  if (!track) return;

  var CACHE_KEY = "ola_announcements";
  var timer, scrollEl;

  // ── Render items into the track ──
  function renderItems(items) {
    if (!items || !items.length) return;
    track.style.transition = "none";
    track.style.transform  = "translateY(0)";
    track.innerHTML = items.map(function (text) {
      return '<p class="hg-announce-item">' + escapeHtml(text) + '</p>';
    }).join("");
  }

  // ── Start auto-scroll (safe to call multiple times) ──
  function startScroll() {
    clearInterval(timer);
    var items = track.querySelectorAll(".hg-announce-item");
    if (items.length <= 5) return;

    var offset    = 0;
    var maxOffset = items.length - 5;

    track.style.transition = "none";
    track.style.transform  = "translateY(0)";

    function scrollNext() {
      var liveItems = track.querySelectorAll(".hg-announce-item");
      maxOffset = liveItems.length - 5;
      if (offset >= maxOffset) {
        track.style.transition = "none";
        track.style.transform  = "translateY(0)";
        offset = 0;
        return;
      }
      offset++;
      var itemH = liveItems[0].getBoundingClientRect().height;
      track.style.transition = "transform 0.7s ease";
      track.style.transform  = "translateY(-" + (offset * itemH) + "px)";
    }

    timer = setInterval(scrollNext, 4000);

    if (!scrollEl) {
      scrollEl = track.parentElement;
      scrollEl.addEventListener("mouseenter", function () { clearInterval(timer); });
      scrollEl.addEventListener("mouseleave", function () {
        timer = setInterval(scrollNext, 4000);
      });
    }
  }

  // ── localStorage helpers ──
  function loadCache() {
    try {
      var c = localStorage.getItem(CACHE_KEY);
      return c ? JSON.parse(c) : null;
    } catch (e) { return null; }
  }

  function saveCache(items) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(items)); } catch (e) {}
  }

  function parseCSV(csv) {
    var lines = csv.trim().split("\n");
    var items = [];
    for (var i = 1; i < lines.length; i++) {   // skip header row
      var cols   = parseCSVLine(lines[i].trim());
      var text   = (cols[0] || "").trim();
      var active = (cols[1] || "").trim().toLowerCase();
      if (text && active === "yes") items.push(text);
    }
    return items;
  }

  // ── Main flow ──
  if (!CONFIG.announcementsSheetUrl) {
    // No sheet configured — use hardcoded items already in the DOM
    startScroll();
    return;
  }

  // Step 1: show cache immediately so there's no blank flash
  var cached = loadCache();
  if (cached && cached.length) {
    renderItems(cached);
  }
  startScroll();

  // Step 2: fetch fresh data in background
  fetch(CONFIG.announcementsSheetUrl)
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then(function (csv) {
      var fresh = parseCSV(csv);
      if (fresh.length) {
        saveCache(fresh);      // update cache with latest
        renderItems(fresh);    // update display
        startScroll();         // restart scroll for new item count
      }
    })
    .catch(function () {
      // Network/Google failure — cached items already visible, nothing to do
    });
}

/* ─────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────── */
function formatDate(dateStr) {
  try {
    var d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch (e) {
    return "";
  }
}

/* ─────────────────────────────────────────────────────
   PARISH POSTERS — carousel + lightbox
   Grid cell col-2, row 3 in home grid.
   Hidden automatically when no active posters.
   CSV columns: Title | Date (YYYY-MM-DD) | ImageFileId | Description | Active (Yes/No)
   ImageFileId: the ID from a Google Drive share link.
   ───────────────────────────────────────────────────── */
function initPosters() {
  var cell    = document.getElementById("hg-posters-cell");
  var track   = document.getElementById("posterCarouselTrack");
  var prevBtn = document.getElementById("posterPrev");
  var nextBtn = document.getElementById("posterNext");
  var dotsEl  = document.getElementById("posterDots");

  // Lightbox elements
  var lightbox = document.getElementById("posterLightbox");
  var lbBackdrop = document.getElementById("posterLightboxBackdrop");
  var lbClose    = document.getElementById("posterLightboxClose");
  var lbImg      = document.getElementById("posterLightboxImg");
  var lbDate     = document.getElementById("posterLightboxDate");
  var lbTitle    = document.getElementById("posterLightboxTitle");
  var lbDesc     = document.getElementById("posterLightboxDesc");

  if (!cell || !track) return;

  var CACHE_KEY   = "ola_posters";
  var MONTH_NAMES = ["January","February","March","April","May","June",
                     "July","August","September","October","November","December"];
  var posters     = [];
  var currentIdx  = 0;
  var autoTimer   = null;

  // ── Helpers ──
  function driveImg(fileId) {
    return "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w800";
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    var d = new Date(dateStr + "T00:00:00");
    if (isNaN(d)) return dateStr;
    return MONTH_NAMES[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  }

  function parseRow(cols) {
    return {
      title:   (cols[0] || "").trim(),
      date:    (cols[1] || "").trim(),
      imageId: (cols[2] || "").trim(),
      desc:    (cols[3] || "").trim(),
      active:  (cols[4] || "").trim().toLowerCase()
    };
  }

  function parseCSV(csv) {
    var lines = csv.trim().split("\n");
    var list  = [];
    for (var i = 1; i < lines.length; i++) {
      var cols = parseCSVLine(lines[i].trim());
      var p    = parseRow(cols);
      if (p.title && p.active === "yes") list.push(p);
    }
    list.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    return list;
  }

  // ── Carousel navigation ──
  function goTo(idx) {
    currentIdx = (idx + posters.length) % posters.length;
    track.style.transform = "translateX(-" + (currentIdx * 100) + "%)";
    dotsEl.querySelectorAll(".poster-dot").forEach(function (d, i) {
      d.classList.toggle("active", i === currentIdx);
    });
  }

  function startAuto() {
    if (posters.length < 2) return;
    autoTimer = setInterval(function () { goTo(currentIdx + 1); }, 5000);
  }

  function stopAuto() { clearInterval(autoTimer); }

  // ── Lightbox ──
  function openLightbox(idx) {
    var p = posters[idx];
    lbImg.src       = p.imageId ? driveImg(p.imageId) : "";
    lbImg.alt       = p.title;
    lbDate.textContent  = formatDate(p.date);
    lbTitle.textContent = p.title;
    lbDesc.textContent  = p.desc || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    stopAuto();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    startAuto();
  }

  // ── Wire up lightbox controls ──
  if (lbClose)    lbClose.addEventListener("click", closeLightbox);
  if (lbBackdrop) lbBackdrop.addEventListener("click", closeLightbox);
  document.addEventListener("keydown", function (e) {
    if (!lightbox.hidden && e.key === "Escape") closeLightbox();
  });

  // ── Render carousel ──
  function renderCarousel(list) {
    stopAuto();
    if (!list || !list.length) { cell.hidden = true; return; }
    posters = list.slice(0, 3);

    // Slides
    track.innerHTML = posters.map(function (p, i) {
      return '<div class="poster-slide" role="button" tabindex="0" aria-label="View ' +
        escapeHtml(p.title) + ' detail" data-idx="' + i + '">' +
        (p.imageId ? '<img src="' + driveImg(p.imageId) + '" alt="' + escapeHtml(p.title) + '" loading="lazy">' : '') +
        '</div>';
    }).join("");

    // Dots
    dotsEl.innerHTML = posters.map(function (_, i) {
      return '<button class="poster-dot' + (i === 0 ? " active" : "") +
        '" data-idx="' + i + '" aria-label="Poster ' + (i + 1) + '"></button>';
    }).join("");

    // Slide click → lightbox
    track.querySelectorAll(".poster-slide").forEach(function (slide) {
      slide.addEventListener("click", function () { openLightbox(+slide.dataset.idx); });
      slide.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") openLightbox(+slide.dataset.idx);
      });
    });

    // Dot clicks
    dotsEl.querySelectorAll(".poster-dot").forEach(function (dot) {
      dot.addEventListener("click", function () { stopAuto(); goTo(+dot.dataset.idx); startAuto(); });
    });

    goTo(0);
    cell.hidden = false;
    startAuto();
  }

  // ── Prev / Next buttons ──
  if (prevBtn) prevBtn.addEventListener("click", function () { stopAuto(); goTo(currentIdx - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener("click", function () { stopAuto(); goTo(currentIdx + 1); startAuto(); });

  // ── Cache helpers ──
  function loadCache() {
    try { var c = localStorage.getItem(CACHE_KEY); return c ? JSON.parse(c) : null; } catch (e) { return null; }
  }
  function saveCache(list) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(list)); } catch (e) {}
  }

  // ── Main flow ──
  if (!CONFIG.postersSheetUrl) return;

  var cached = loadCache();
  if (cached) renderCarousel(cached);

  fetch(CONFIG.postersSheetUrl)
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then(function (csv) {
      var fresh = parseCSV(csv);
      saveCache(fresh);
      renderCarousel(fresh);
    })
    .catch(function () {});
}

/* ─────────────────────────────────────────────────────
   WHATSAPP JOIN REQUEST MODAL
   Intercepts the "WhatsApp group" link, shows a form,
   and submits the request as an email to the admin.
   ───────────────────────────────────────────────────── */
function initWhatsAppModal() {
  var trigger  = document.getElementById("waJoinLink");
  var modal    = document.getElementById("waModal");
  var backdrop = document.getElementById("waModalBackdrop");
  var closeBtn = document.getElementById("waModalClose");
  var form     = document.getElementById("waJoinForm");

  if (!trigger || !modal) return;

  var nameInput   = document.getElementById("waName");
  var mobileInput = document.getElementById("waMobile");
  var infoInput   = document.getElementById("waInfo");
  var nameErr     = document.getElementById("waNameErr");
  var mobileErr   = document.getElementById("waMobileErr");
  var infoErr     = document.getElementById("waInfoErr");

  // ── Open ──
  trigger.addEventListener("click", function (e) {
    e.preventDefault();
    openModal();
  });

  // ── Close ──
  closeBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  // ── Submit ──
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;

    var name   = nameInput.value.trim();
    var mobile = mobileInput.value.trim();
    var info   = infoInput.value.trim();

    var submitBtn = form.querySelector("button[type=submit]");
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }

    fetch(CONFIG.whatsappFormUrl, {
      method: "POST",
      body:   JSON.stringify({ name: name, mobile: mobile, about: info })
    })
    .then(function () {
      closeModal();
      form.reset();
      alert("Thank you, " + name + "! Your request has been received. We will add you to the WhatsApp group shortly.");
    })
    .catch(function () {
      alert("Something went wrong. Please try again or contact us directly.");
    })
    .finally(function () {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Send Request"; }
    });
  });

  // ── Helpers ──
  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    setTimeout(function () { nameInput.focus(); }, 50);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    clearErrors();
    trigger.focus();
  }

  function validate() {
    var ok = true;
    if (!nameInput.value.trim()) {
      setError(nameInput, nameErr, true); ok = false;
    } else { setError(nameInput, nameErr, false); }

    if (!mobileInput.value.trim()) {
      setError(mobileInput, mobileErr, true); ok = false;
    } else { setError(mobileInput, mobileErr, false); }

    if (!infoInput.value.trim()) {
      setError(infoInput, infoErr, true); ok = false;
    } else { setError(infoInput, infoErr, false); }

    return ok;
  }

  function setError(field, errEl, show) {
    field.classList.toggle("invalid", show);
    errEl.classList.toggle("visible", show);
  }

  function clearErrors() {
    [nameInput, mobileInput, infoInput].forEach(function (f) {
      f.classList.remove("invalid");
    });
    [nameErr, mobileErr, infoErr].forEach(function (e) {
      e.classList.remove("visible");
    });
  }
}

/* ─────────────────────────────────────────────────────
   SHARED CSV LINE PARSER
   Handles quoted fields that contain commas.
   ───────────────────────────────────────────────────── */
function parseCSVLine(line) {
  var cols = [], cur = "", inQuote = false;
  for (var i = 0; i < line.length; i++) {
    var ch = line[i];
    if (ch === '"')                  { inQuote = !inQuote; }
    else if (ch === ',' && !inQuote) { cols.push(cur); cur = ""; }
    else                             { cur += ch; }
  }
  cols.push(cur);
  return cols;
}

/* ─────────────────────────────────────────────────────
   PARISH CALENDAR — monthly grid + Syro Malabar readings
   ─────────────────────────────────────────────────────
   Sheet format (row 1 = header, ignored):
     Column A: Date        (YYYY-MM-DD)
     Column B: Title
     Column C: Time        (e.g. "4:00 PM")
     Column D: Description
     Column E: Active      (Yes / No)

   On day click: shows parish events + fetches daily readings
   from syrocalendar.com API (DD-MM-YYYY format).
   Falls back gracefully if API is blocked by CORS.
   ───────────────────────────────────────────────────── */
function initEvents() {
  var grid       = document.getElementById("calGrid");
  var monthLabel = document.getElementById("calMonthLabel");
  var prevBtn    = document.getElementById("calPrev");
  var nextBtn    = document.getElementById("calNext");
  var detail     = document.getElementById("calDetail");
  var detailDate = document.getElementById("calDetailDate");
  var detailEvts = document.getElementById("calDetailEvents");
  var rdgStatus  = document.getElementById("calReadingsStatus");
  var rdgContent = document.getElementById("calReadingsContent");
  var closeBtn   = document.getElementById("calDetailClose");

  if (!grid) return;

  var today     = new Date();
  var viewYear  = today.getFullYear();
  var viewMonth = today.getMonth();
  var eventsMap = {};

  var DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  var MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  // ── Render calendar grid ──
  function renderCalendar() {
    var firstDay    = new Date(viewYear, viewMonth, 1).getDay();
    var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    monthLabel.textContent = MONTHS[viewMonth] + " " + viewYear;

    var html = "";
    DAYS.forEach(function (d) {
      html += '<div class="cal-day-header">' + d + '</div>';
    });
    for (var i = 0; i < firstDay; i++) {
      html += '<div class="cal-day cal-day--empty"></div>';
    }
    for (var day = 1; day <= daysInMonth; day++) {
      var dateStr = viewYear + "-" + pad(viewMonth + 1) + "-" + pad(day);
      var isToday = viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();
      var evts    = eventsMap[dateStr] || [];
      var cls     = "cal-day" + (isToday ? " cal-day--today" : "") + (evts.length ? " cal-day--has-events" : "");
      var ariaLbl = MONTHS[viewMonth] + " " + day + (evts.length ? ", " + evts.length + " event" + (evts.length > 1 ? "s" : "") : "");

      html += '<div class="' + cls + '" data-date="' + dateStr + '" role="button" tabindex="0" aria-label="' + ariaLbl + '">';
      html += '<span class="cal-day-num">' + day + '</span>';
      evts.slice(0, 2).forEach(function (ev) {
        html += '<span class="cal-event-pill">' + escapeHtml(ev.title) + '</span>';
      });
      if (evts.length > 2) html += '<span class="cal-event-more">+' + (evts.length - 2) + '</span>';
      html += '</div>';
    }

    grid.innerHTML = html;
    grid.querySelectorAll(".cal-day[data-date]").forEach(function (cell) {
      cell.addEventListener("click", function () { openDay(cell.dataset.date); });
      cell.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDay(cell.dataset.date); }
      });
    });
  }

  // ── Extract readable text from a reading field (string or object) ──
  function readingText(r) {
    if (!r) return null;
    if (typeof r === "string") return r;
    var ref   = r.Ref   || r.ref   || r.Reference || "";
    var title = r.Title || r.title || r.Name      || "";
    return [title, ref ? "(" + ref + ")" : ""].filter(Boolean).join(" ") || null;
  }

  // ── Open day detail panel ──
  function openDay(dateStr) {
    var d     = new Date(dateStr + "T00:00:00");
    detailDate.textContent = MONTHS[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();

    // Parish events
    var evts = eventsMap[dateStr] || [];
    if (evts.length) {
      detailEvts.innerHTML = evts.map(function (ev) {
        return '<div class="cal-detail-event">' +
          (ev.time ? '<span class="cal-detail-event-time">' + escapeHtml(ev.time) + '</span>' : '') +
          '<span class="cal-detail-event-title">' + escapeHtml(ev.title) + '</span>' +
          (ev.desc ? '<p class="cal-detail-event-desc">' + escapeHtml(ev.desc) + '</p>' : '') +
          '</div>';
      }).join("");
    } else {
      detailEvts.innerHTML = '<p class="cal-detail-none">No parish events scheduled.</p>';
    }

    // Reset readings panel
    rdgContent.hidden  = true;
    rdgContent.innerHTML = "";
    rdgStatus.textContent = "Loading readings\u2026";
    detail.hidden = false;
    detail.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Fetch Syro Malabar daily readings
    var parts   = dateStr.split("-");
    var apiDate = parts[2] + "-" + parts[1] + "-" + parts[0]; // DD-MM-YYYY
    fetch("https://syrocalendar.com/SyroMalabarCalendar/?Mode=JSON&Type=DailyReadings&Date=" + apiDate)
      .then(function (res) {
        if (!res.ok) throw new Error(res.status);
        return res.json();
      })
      .then(function (data) {
        rdgStatus.textContent = "";
        var html = "";

        var dayDesc = data.DayDescription;
        if (dayDesc) {
          var descText = typeof dayDesc === "string" ? dayDesc : (dayDesc.English || dayDesc.Eng || "");
          if (descText) html += '<p class="cal-readings-day">' + escapeHtml(descText) + '</p>';
        }

        [
          { key: "Reading1",      label: "First Reading"  },
          { key: "Reading2",      label: "Second Reading" },
          { key: "Reading3",      label: "Third Reading"  },
          { key: "ReadingGospel", label: "Gospel"         }
        ].forEach(function (r) {
          var text = readingText(data[r.key]);
          if (!text) return;
          html += '<div class="cal-reading">' +
            '<span class="cal-reading-label">' + r.label + '</span>' +
            '<span class="cal-reading-ref">' + escapeHtml(text) + '</span>' +
            '</div>';
        });

        rdgContent.innerHTML = html || '<p class="cal-detail-none">No reading data available.</p>';
        rdgContent.hidden = false;
      })
      .catch(function () {
        rdgStatus.innerHTML = 'Could not load readings. <a href="https://syrocalendar.com" target="_blank" rel="noopener">Visit SyroCalendar.com &#8594;</a>';
      });
  }

  // ── Controls ──
  if (closeBtn) closeBtn.addEventListener("click", function () { detail.hidden = true; });

  if (prevBtn) prevBtn.addEventListener("click", function () {
    if (--viewMonth < 0) { viewMonth = 11; viewYear--; }
    detail.hidden = true; renderCalendar();
  });
  if (nextBtn) nextBtn.addEventListener("click", function () {
    if (++viewMonth > 11) { viewMonth = 0; viewYear++; }
    detail.hidden = true; renderCalendar();
  });

  // ── CSV parsing ──
  function parseCSV(csv) {
    var lines = csv.trim().split("\n");
    var list  = [];
    for (var i = 1; i < lines.length; i++) {
      var cols   = parseCSVLine(lines[i].trim());
      var date   = (cols[0] || "").trim();
      var title  = (cols[1] || "").trim();
      var time   = (cols[2] || "").trim();
      var desc   = (cols[3] || "").trim();
      var active = (cols[4] || "").trim().toLowerCase();
      if (date && title && active === "yes") list.push({ date: date, title: title, time: time, desc: desc });
    }
    return list;
  }

  function buildMap(list) {
    eventsMap = {};
    list.forEach(function (ev) {
      if (!eventsMap[ev.date]) eventsMap[ev.date] = [];
      eventsMap[ev.date].push(ev);
    });
    renderCalendar();
  }

  // ── localStorage cache ──
  var CACHE_KEY = "ola_events_cal";
  function loadCache() { try { var c = localStorage.getItem(CACHE_KEY); return c ? JSON.parse(c) : null; } catch (e) { return null; } }
  function saveCache(d) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch (e) {} }

  // Initial render (no events yet)
  renderCalendar();
  if (!CONFIG.eventsSheetUrl) return;

  var cached = loadCache();
  if (cached) buildMap(cached);

  fetch(CONFIG.eventsSheetUrl)
    .then(function (res) { return res.text(); })
    .then(function (csv) { var fresh = parseCSV(csv); saveCache(fresh); buildMap(fresh); })
    .catch(function () {});
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
