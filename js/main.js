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
  // Phone, email and the two registration links below are only the FALLBACK:
  // once the "Settings" sheet is connected (settingsSheetUrl, further down),
  // whatever is typed there (via the Web Admin page) replaces them.
  address:           "838 Kings Hwy E, Fairfield, CT 06825",
  phone:             "(203) 274-2702",
  phoneTel:          "+12032742702",     // E.164 format for tel: links
  email:             "smcc.norwalk@gmail.com",

  // ── Parish registration (Join Us section) ────────
  // Address of the parish (family) registration form. Clear it ("") to hide
  // the "Register with the Parish" button again.
  parishRegistrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeyXe5v_BJsyQDZ6amwpj7f4E9pCdGgM6g-wqr6n0bJBarB9Q/viewform",

  // ── Religious Education (CCD) registration (Join Us section) ──
  // Address of the CCD registration form. Clear it ("") to hide that button.
  ccdRegistrationUrl: "https://docs.google.com/forms/d/e/1FAIpQLSf0CmzCS2RXgI70863tB-Y9HohepDLqB0kAj3N6m1TzhTF5Gg/viewform",

  // ── Contact / WhatsApp requests → Google Sheet + email ──
  // Web app address (ends in /exec) of the Apps Script inside the WebAdmin sheet
  // that saves each request to the "WhatsApp Requests" tab and emails the parish.
  // Leave blank to fall back to opening the visitor's email app instead.
  formsScriptUrl: "https://script.google.com/macros/s/AKfycbzts7DEdylQz72HWe8Zi6r2iUL7k5_TtDmnVTrwJFLGymWizmcBkqZaF2tQwbfR8JdD_A/exec",

  // ── Google Maps ──────────────────────────────────
  // Pins the street address only (no business name). To change it, edit the address after q= (use + for spaces).
  googleMapsEmbedUrl: "https://www.google.com/maps?q=838+Kings+Hwy+E,+Fairfield,+CT+06825&output=embed",

  // ── Facebook ─────────────────────────────────────
  // Your Facebook Page URL (e.g. "https://www.facebook.com/StMaryParish")
  facebookPageUrl:   "https://www.facebook.com/ourladyofassumptionsmcc",

  // ── YouTube ──────────────────────────────────────
  // Channel link (footer, Contact, and the Videos & Photos page).
  // The videos themselves come from a playlist — see mediaApiUrl below.
  youtubeChannelUrl: "https://www.youtube.com/@OurLadyOfAssumptionSyroMalabar",

  // ── Instagram ────────────────────────────────────
  instagramUrl:      "https://www.instagram.com/syro_connecticut",

  // ── Announcements (Google Sheets) ────────────────
  // Sheet columns: Text | Active (Yes/No) | Popup (optional, Yes = also show as a one-time pop-up)
  // File → Share → Publish to web → (this tab) → CSV → Publish
  // The Announcements box only appears while at least one row has Active = Yes.
  // Links: type a full web address (https://…) or use [link text](https://…) in the Text cell.
  announcementsSheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSluQ2kZE_gDTLtpDOkBMlSUBLH9hroTEw3sm3g4AMwYAcyH1FHImxiTXldXHqttzvFnL7JG6K6dlIg/pub?gid=0&single=true&output=csv",

  // ── Upcoming Events (Google Sheets) ──────────────
  // Sheet columns: Date (YYYY-MM-DD) | Title | Time | Description | Active (Yes/No)
  // File → Share → Publish to web → (this tab) → CSV → Publish
  eventsSheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSluQ2kZE_gDTLtpDOkBMlSUBLH9hroTEw3sm3g4AMwYAcyH1FHImxiTXldXHqttzvFnL7JG6K6dlIg/pub?gid=1327592415&single=true&output=csv",

  // ── Parish Posters ─────────────────────────────
  // No longer a Sheet — posters now come straight from a "Posters" folder
  // in Drive via the Media API (mediaApiUrl below, ?action=posters). Just
  // drop image/PDF files in that Drive folder; the newest ones (up to
  // MAX_POSTERS in Code.gs) show here automatically. This old published-
  // Sheet URL is kept only as a historical reference and is unused.
  postersSheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSluQ2kZE_gDTLtpDOkBMlSUBLH9hroTEw3sm3g4AMwYAcyH1FHImxiTXldXHqttzvFnL7JG6K6dlIg/pub?gid=2077561181&single=true&output=csv",

  // ── Mass Times (Google Sheets, tab "Mass Times") ─
  // Sheet columns: Day | Label | Time | Note | Active (Yes/No)
  // File → Share → Publish to web → (the "Mass Times" tab) → CSV → Publish, then paste the link here.
  // Edit it from the Web Admin page. While this is blank, or the sheet cannot be
  // reached, the Mass Schedule already written in index.html is shown.
  massTimesSheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSluQ2kZE_gDTLtpDOkBMlSUBLH9hroTEw3sm3g4AMwYAcyH1FHImxiTXldXHqttzvFnL7JG6K6dlIg/pub?gid=16634834&single=true&output=csv",

  // ── Site settings (Google Sheets, tab "Settings") ─
  // Sheet columns: Setting | Value  (Phone, Email, Parish Registration Link,
  // Religious Education Registration Link). Publish the "Settings" tab as CSV and paste the link here.
  // Anything missing or blank there falls back to the values above.
  settingsSheetUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSluQ2kZE_gDTLtpDOkBMlSUBLH9hroTEw3sm3g4AMwYAcyH1FHImxiTXldXHqttzvFnL7JG6K6dlIg/pub?gid=882312338&single=true&output=csv",

  // ── Videos & Photos (YouTube playlist + Google Drive folder) ──
  // Paste the /exec URL of your Google Apps Script web app here.
  // (See the setup guide — one script serves both the videos and the photos.)
  // Leave blank to keep the video/photo sections hidden.
  mediaApiUrl: "https://script.google.com/macros/s/AKfycbzJL--PN1ecKEqLkEin0l7adW1Xj9kubVjMxJnnoqY_QURFtd_C2mUzlWf8XQ6nhMRpdQ/exec",
};

/* ═════════════════════════════════════════════════════
   BOOTSTRAP — runs when DOM is ready
   ═════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", function () {
  applyConfig();
  initSettings();
  initMassTimes();
  initNav();
  initSmoothScroll();
  initHashFallback();
  initScrollAnimations();
  initBackToTop();
  initMapEmbed();
  setFooterYear();
  initAnnouncements();
  initUpcoming();
  initReading();
  initEvents();
  initPosters();
  initWhatsAppModal();
});

/* ─────────────────────────────────────────────────────
   Apply CONFIG values to DOM elements
   ───────────────────────────────────────────────────── */
function applyConfig() {
  // Join Us — registration buttons (each hidden until its link is set) and matching intro text
  var regBtn = document.getElementById("joinRegisterBtn");
  var ccdBtn = document.getElementById("joinCcdBtn");
  var joinParts = ["join our WhatsApp group for parish updates and announcements"];
  if (regBtn) {
    if (CONFIG.parishRegistrationUrl) {
      regBtn.href   = CONFIG.parishRegistrationUrl;
      regBtn.hidden = false;
      joinParts.push("register as a member of our parish");
    } else regBtn.hidden = true;
  }
  if (ccdBtn) {
    if (CONFIG.ccdRegistrationUrl) {
      ccdBtn.href   = CONFIG.ccdRegistrationUrl;
      ccdBtn.hidden = false;
      joinParts.push("sign up your child for Religious Education");
    } else ccdBtn.hidden = true;
  }
  // Any other button that points at the Religious Education form (e.g. the hero button on that page)
  document.querySelectorAll("[data-cfg-link='ccd']").forEach(function (a) {
    if (CONFIG.ccdRegistrationUrl) { a.href = CONFIG.ccdRegistrationUrl; a.hidden = false; }
    else a.hidden = true;
  });
  var joinText = document.getElementById("joinText");
  if (joinText) {
    var list = joinParts.length === 1 ? joinParts[0]
             : joinParts.length === 2 ? joinParts[0] + " or " + joinParts[1]
             : joinParts.slice(0, -1).join(", ") + ", or " + joinParts[joinParts.length - 1];
    joinText.textContent = "Be part of our parish family. " + list.charAt(0).toUpperCase() + list.slice(1) + ".";
  }

  // Facebook links
  var fbLinks = [
    document.getElementById("topbarFacebook"),
    document.getElementById("contactFacebook"),
    document.getElementById("footerFacebook"),
  ];
  fbLinks.forEach(function (el) {
    if (el) el.href = CONFIG.facebookPageUrl;
  });

  // YouTube links
  var ytLinks = [
    document.getElementById("topbarYoutube"),
    document.getElementById("contactYoutube"),
    document.getElementById("footerYoutube"),
  ];
  ytLinks.forEach(function (el) {
    if (el) el.href = CONFIG.youtubeChannelUrl;
  });

  // Instagram links
  var igLinks = [
    document.getElementById("topbarInstagram"),
    document.getElementById("contactInstagram"),
    document.getElementById("footerInstagram"),
  ];
  igLinks.forEach(function (el) {
    if (el) el.href = CONFIG.instagramUrl;
  });

  // Phone and email — every place marked data-cfg="phone" / data-cfg="email"
  // (top bar, the Contact Us card, footers). Text lives in a child span
  // (.topbar-text or .hg-contact-text) when the link also has an icon
  // inside it, so only that span's text is replaced — the icon stays put.
  document.querySelectorAll("[data-cfg='phone']").forEach(function (a) {
    var t = a.querySelector(".topbar-text, .hg-contact-text") || a;
    t.textContent = CONFIG.phone;
    a.href = "tel:" + CONFIG.phoneTel;
  });
  document.querySelectorAll("[data-cfg='email']").forEach(function (a) {
    var t = a.querySelector(".topbar-text, .hg-contact-text") || a;
    t.textContent = CONFIG.email;
    a.href = "mailto:" + CONFIG.email;
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
   Arriving with a #hash (e.g. index.html#donate from another page):
   on phones some targets are desktop-only and hidden, so jump to the
   mobile version of that section instead of staying at the top.
   ───────────────────────────────────────────────────── */
function initHashFallback() {
  var id = window.location.hash ? window.location.hash.slice(1) : "";
  if (!id) return;
  window.addEventListener("load", function () {
    var target = document.getElementById(id);
    if (!target || target.offsetParent !== null) return; // visible: browser already handled it
    var fallbackId = target.getAttribute("data-mobile-fallback");
    var fallback = fallbackId && document.getElementById(fallbackId);
    if (!fallback) return;
    var topbar    = document.querySelector(".topbar");
    var stickyBar = document.getElementById("stickyBar");
    var offset    = (topbar ? topbar.offsetHeight : 0) +
                    (stickyBar && stickyBar.classList.contains("visible") ? stickyBar.offsetHeight : 0) + 8;
    window.scrollTo({ top: fallback.getBoundingClientRect().top + window.pageYOffset - offset, behavior: "auto" });
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
     Column C: Popup   (optional — "Yes" also opens it as a pop-up
                        the first time each visitor opens the site)

   The whole Announcements box stays hidden unless at least one
   row is Active = Yes.

   Each announcement is shown as a card. Links inside the text become
   gold buttons (open in a new tab):
     • a bare address:      https://forms.gle/abc   → "Open link →"
     • or a labelled link:  [Sign up here](https://forms.gle/abc)
     • also [Email us](mailto:name@example.org) and [Call](tel:+12035551234)

   Pop-up: only the first row with Popup = Yes is used. A visitor sees
   it once (remembered in localStorage); change the wording and it
   shows again.

   Load order:
     1. Show localStorage cache immediately (instant)
     2. Fetch fresh CSV from Google Sheets in background
     3. On success  → update display (or hide the box if nothing is active)
                      and open the pop-up if there is a new one
     4. On failure  → whatever is on screen stays as it is
   ───────────────────────────────────────────────────── */
function initAnnouncements() {
  var box   = document.getElementById("announcements");
  var track = box && box.querySelector(".hg-announce-track");
  if (!box || !track) return;

  var CACHE_KEY = "ola_announcements_v2";
  var SEEN_KEY  = "ola_announcement_popup_seen";

  var BELL = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 22a2.5 2.5 0 0 0 2.4-2h-4.8A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 0 0-5.5-6.8V3a1.5 1.5 0 0 0-3 0v1.2A7 7 0 0 0 5 11v5l-2 2v1h18v-1z"/></svg>';

  // Text → safe HTML with clickable link buttons (only http/https/mailto/tel are linked)
  var LINK_RE = /\[([^\]]+)\]\(((?:https?:\/\/|mailto:|tel:)[^\s)]+)\)|((?:https?:\/\/|www\.)[^\s<>"']+)/gi;

  function linkify(text) {
    var out = "", last = 0, m;
    LINK_RE.lastIndex = 0;
    while ((m = LINK_RE.exec(text)) !== null) {
      out += escapeHtml(text.slice(last, m.index));
      var label, url, trail = "";
      if (m[1]) {                       // [label](url)
        label = m[1];
        url   = m[2];
      } else {                          // bare address
        url = m[3];
        // keep sentence punctuation (and an unmatched closing bracket) outside the link
        while (/[.,;:!?'")\]]$/.test(url)) {
          var end = url.charAt(url.length - 1);
          if (end === ")" && url.split("(").length >= url.split(")").length) break;   // part of the address, e.g. …/page_(2)
          trail = end + trail;
          url   = url.slice(0, -1);
        }
        if (/^www\./i.test(url)) url = "https://" + url;
        label = "Open link";
      }
      out += '<a class="ann-link" href="' + escapeHtml(url) + '" title="' + escapeHtml(url) +
             '" target="_blank" rel="noopener noreferrer">' + escapeHtml(label) + '</a>' + escapeHtml(trail);
      last = m.index + m[0].length;
    }
    return out + escapeHtml(text.slice(last));
  }

  // ── Show the cards, or hide the whole box when there are none ──
  function render(items) {
    if (!items || !items.length) {
      track.innerHTML = "";
      box.hidden = true;
      return;
    }
    track.innerHTML = items.map(function (it) {
      return '<div class="hg-announce-item">' +
               '<span class="hg-announce-ico">' + BELL + '</span>' +
               '<div class="hg-announce-body">' + linkify(it.text) + '</div>' +
             '</div>';
    }).join("");
    box.hidden = false;
  }

  // ── localStorage helpers ──
  function loadCache() {
    try {
      var c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (!c) return null;
      return c.map(function (x) { return typeof x === "string" ? { text: x, popup: false } : x; });
    } catch (e) { return null; }
  }

  function saveCache(items) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(items)); } catch (e) {}
  }

  function parseCSV(csv) {
    var rows  = parseCSVRows(csv);
    var items = [];
    for (var i = 1; i < rows.length; i++) {   // skip header row
      var text   = (rows[i][0] || "").trim();
      var active = (rows[i][1] || "").trim().toLowerCase();
      var popup  = (rows[i][2] || "").trim().toLowerCase() === "yes";
      if (text && active === "yes") items.push({ text: text, popup: popup });
    }
    return items;
  }

  // ── Pop-up for urgent news (once per visitor per wording) ──
  var popupShown = false;

  function hashText(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return String(h);
  }

  function readSeen() {
    try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"); } catch (e) { return []; }
  }

  function markSeen(id) {
    var seen = readSeen();
    if (seen.indexOf(id) === -1) seen.push(id);
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(seen.slice(-20))); } catch (e) {}
  }

  function maybePopup(items) {
    var modal = document.getElementById("annModal");
    var textEl = document.getElementById("annModalText");
    if (!modal || !textEl || popupShown) return;

    var urgent = null;
    for (var i = 0; i < items.length; i++) { if (items[i].popup) { urgent = items[i]; break; } }
    if (!urgent) return;

    var id = hashText(urgent.text);
    if (readSeen().indexOf(id) !== -1) return;
    popupShown = true;

    var opener = null;

    function focusables() {
      return Array.prototype.slice.call(modal.querySelectorAll("a[href], button"))
        .filter(function (el) { return !el.hidden && el.offsetParent !== null; });
    }
    function close() {
      modal.hidden = true;
      document.body.classList.remove("ann-modal-open");
      document.removeEventListener("keydown", onKey);
      markSeen(id);
      if (opener && opener.focus) { try { opener.focus(); } catch (e) {} }
    }
    function onKey(e) {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab") return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], lastEl = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
    }

    setTimeout(function () {
      opener = document.activeElement;
      textEl.innerHTML = linkify(urgent.text);
      modal.hidden = false;
      document.body.classList.add("ann-modal-open");
      modal.querySelectorAll("[data-close]").forEach(function (el) { el.addEventListener("click", close); });
      document.addEventListener("keydown", onKey);
      var ok = modal.querySelector(".ann-modal-ok");
      if (ok) ok.focus();
    }, 700);
  }

  // ── Main flow ──
  if (!CONFIG.announcementsSheetUrl) return;   // nothing configured → stays hidden

  // Step 1: show cache immediately so there's no blank flash
  var cached = loadCache();
  if (cached && cached.length) render(cached);

  // Step 2: fetch fresh data in background
  fetch(CONFIG.announcementsSheetUrl)
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then(function (csv) {
      var fresh = parseCSV(csv);
      saveCache(fresh);   // an empty list is saved too, so the box stays hidden
      render(fresh);
      maybePopup(fresh);
    })
    .catch(function () {
      // Network/Google failure — leave whatever is showing (cache or hidden)
    });
}

/* ─────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────── */
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

  var CACHE_KEY   = "ola_posters_v3";
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
    // Posters now come from the Drive API as a full ISO timestamp
    // (e.g. "2026-09-20T18:03:11.000Z"); the old Sheet-based format was a
    // plain "YYYY-MM-DD" date, which needs "T00:00:00" appended so it's
    // parsed in local time rather than shifting a day on UTC-negative
    // timezones. Handle both.
    var d = /T/.test(dateStr) ? new Date(dateStr) : new Date(dateStr + "T00:00:00");
    if (isNaN(d)) return dateStr;
    return MONTH_NAMES[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  }

  // Hide camera-style file names (IMG_1234.jpg) but keep meaningful ones —
  // same rule as niceName() in js/media.js, since posters now come straight
  // from Drive file names instead of a "Title" column in a Sheet.
  function niceName(name) {
    if (!name) return "";
    var n = String(name).replace(/\.[a-z0-9]{2,5}$/i, "").replace(/[_]+/g, " ").trim();
    if (/^(img|dsc|dscn|pxl|mvimg|photo|image|screenshot|whatsapp|signal)[\s._-]*[\d\s._-]*$/i.test(n)) return "";
    if (/^[\d\s._-]+$/.test(n)) return "";
    return n;
  }

  // Map the Media API's ?action=posters response ({id, name, t}) into the
  // {title, date, imageId, desc} shape the carousel/lightbox below expect
  // (unchanged from the old Sheet-based posters, minus a description column
  // — Drive files don't carry one).
  function mapApiPosters(list) {
    var mapped = (list || []).map(function (p) {
      return {
        title:   niceName(p.name),
        date:    p.t || "",
        imageId: p.id,
        desc:    ""
      };
    });
    mapped.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    return mapped;
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
        escapeHtml(p.title || "poster") + ' detail" data-idx="' + i + '">' +
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
  // Posters now come straight from a Drive folder via the same Media API
  // that already serves videos/photos (see Code.gs, ?action=posters),
  // instead of a separate published Sheet.
  if (!CONFIG.mediaApiUrl) return;

  var cached = loadCache();
  if (cached) renderCarousel(cached);

  fetch(CONFIG.mediaApiUrl + "?action=posters")
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      if (!data || !data.ok) throw new Error((data && data.error) || "Bad response");
      var fresh = mapApiPosters(data.posters);
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
  var statusEl  = document.getElementById("waStatus");
  var submitBtn = document.getElementById("waSubmit");
  var thanks    = document.getElementById("waThanks");
  var thanksBtn = document.getElementById("waThanksClose");
  var honeypot  = document.getElementById("waWebsite");

  if (thanksBtn) thanksBtn.addEventListener("click", closeModal);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;

    var name   = nameInput.value.trim();
    var mobile = mobileInput.value.trim();
    var info   = infoInput.value.trim();

    // No web app configured: open the visitor's email app instead.
    if (!CONFIG.formsScriptUrl) {
      window.location.href = mailtoLink(name, mobile, info);
      closeModal();
      form.reset();
      return;
    }

    // Spam trap filled in: pretend it worked, send nothing.
    if (honeypot && honeypot.value) { showThanks(); return; }

    setSending(true);
    postToScript({ type: "whatsapp", name: name, mobile: mobile, about: info })
      .then(function () {
        form.reset();
        showThanks();
      })
      .catch(function () {
        showStatus(
          "Sorry, we couldn't send your request just now. Please try again, or ",
          { href: mailtoLink(name, mobile, info), text: "email us instead" }
        );
      })
      .then(function () { setSending(false); });
  });

  function mailtoLink(name, mobile, info) {
    return "mailto:" + CONFIG.email +
      "?subject=" + encodeURIComponent("WhatsApp Group Join Request — " + name) +
      "&body=" + encodeURIComponent(
        "Name: " + name + "\n" +
        "Mobile: " + mobile + "\n\n" +
        "About me & my family:\n" + info
      );
  }

  function postToScript(payload) {
    // Google's web apps don't send the headers a browser needs to let a web page READ
    // the reply, so this is a fire-and-forget POST ("no-cors"): the request is delivered
    // and saved by the script (row in the sheet + email to the parish), but the page can't
    // see the reply. Network failures and timeouts still show the error message.
    // text/plain keeps it a "simple" request (Apps Script can't answer CORS preflights).
    var ctl = ("AbortController" in window) ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, 20000) : null;
    return fetch(CONFIG.formsScriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      signal: ctl ? ctl.signal : undefined
    }).then(function () {
      if (timer) clearTimeout(timer);
    }, function (err) {
      if (timer) clearTimeout(timer);
      throw err;
    });
  }

  function setSending(on) {
    submitBtn.disabled = on;
    submitBtn.textContent = on ? "Sending…" : "Send Request";
    if (on) hideStatus();
  }
  function showStatus(text, link) {
    statusEl.textContent = text;
    if (link) {
      var a = document.createElement("a");
      a.href = link.href; a.textContent = link.text;
      statusEl.appendChild(a);
      statusEl.appendChild(document.createTextNode("."));
    }
    statusEl.hidden = false;
  }
  function hideStatus() { statusEl.hidden = true; statusEl.textContent = ""; }
  function showThanks() {
    form.hidden = true;
    var head = modal.querySelector(".wa-modal-header");
    if (head) head.hidden = true;
    thanks.hidden = false;
    thanks.focus();
  }
  function resetModalView() {
    form.hidden = false;
    var head = modal.querySelector(".wa-modal-header");
    if (head) head.hidden = false;
    thanks.hidden = true;
    hideStatus();
    setSending(false);
  }

  // ── Helpers ──
  function openModal() {
    resetModalView();
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
   SHARED CSV PARSER (whole file)
   Handles quoted fields with commas, "" escaped quotes and
   line breaks inside a cell. Returns an array of rows.
   ───────────────────────────────────────────────────── */
function parseCSVRows(text) {
  var rows = [], row = [], cur = "", inQuote = false;
  text = String(text).replace(/^﻿/, "");
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    if (inQuote) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else inQuote = false;
      } else cur += ch;
    } else if (ch === '"') {
      inQuote = true;
    } else if (ch === ",") {
      row.push(cur); cur = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cur); rows.push(row); row = []; cur = "";
    } else cur += ch;
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows;
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
   CALENDAR EVENTS — shared fetch/cache, used by the home
   page's Upcoming Events list (initUpcoming, below) and the
   full month-grid calendar on calendar.html (initEvents).
   ─────────────────────────────────────────────────────
   Sheet format (row 1 = header, ignored):
     Column A: Date        (YYYY-MM-DD)
     Column B: Title
     Column C: Time        (e.g. "4:00 PM")
     Column D: Description
     Column E: Active      (Yes / No)
   ───────────────────────────────────────────────────── */
var EVENTS_CACHE_KEY = "ola_events_cal_v2";

function loadEventsCache() { try { var c = localStorage.getItem(EVENTS_CACHE_KEY); return c ? JSON.parse(c) : null; } catch (e) { return null; } }
function saveEventsCache(d) { try { localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(d)); } catch (e) {} }

function parseEventsCSV(csv) {
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

// onData(list) is called once with the cached copy (if any) and again once
// fresh data arrives — same cache-then-network pattern used elsewhere on
// this site (announcements, posters, mass times).
function loadEventsList(onData) {
  if (!CONFIG.eventsSheetUrl) return;
  var cached = loadEventsCache();
  if (cached) onData(cached);
  fetch(CONFIG.eventsSheetUrl)
    .then(function (res) { return res.text(); })
    .then(function (csv) { var fresh = parseEventsCSV(csv); saveEventsCache(fresh); onData(fresh); })
    .catch(function () {});
}

/* ─────────────────────────────────────────────────────
   SYRO MALABAR DAILY READINGS — Today's Reading (home page).

   Uses SyroCalendar's own official client-side widget (script
   tag loaded in index.html's <head> + GetLiturgicalReadingsJSON(),
   per https://syrocalendar.com/api/liturgical-bible-readings/ —
   registered for olasyromalabarct.org). This widget only ever
   covers TODAY — there's no documented arbitrary-date lookup —
   which is why there's no date picker here (see calendar.html's
   day-detail popup, which links out to SyroCalendar.com instead
   for other dates).

   A day can have more than one reading set (e.g. a weekday plus
   an overlapping feast), so GetLiturgicalReadingsJSON() always
   returns an array; render() below handles one item or several.
   ───────────────────────────────────────────────────── */
function readingFieldRows(item, skipGospel) {
  return [
    ["Reading1_Eng",      "Reading1_Title_Eng",      "First Reading"],
    ["Reading2_Eng",      "Reading2_Title_Eng",      "Second Reading"],
    ["Reading3_Eng",      "Reading3_Title_Eng",      "Third Reading"],
    ["ReadingGospal_Eng", "ReadingGospal_Title_Eng", "Gospel"]
  ].filter(function (f) { return !(skipGospel && f[2] === "Gospel"); })
   .map(function (f) { return { label: f[2], ref: item[f[0]], title: item[f[1]] }; })
   .filter(function (r) { return r.ref; });
}

/* ─────────────────────────────────────────────────────
   HOME PAGE — Upcoming Events (next 5 events, any category)
   ───────────────────────────────────────────────────── */
function initUpcoming() {
  var list  = document.getElementById("upList");
  var empty = document.getElementById("upEmpty");
  if (!list) return;

  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function render(all) {
    var today    = new Date();
    var todayStr = today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());
    var upcoming = all
      .filter(function (ev) { return ev.date >= todayStr; })
      .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; })
      .slice(0, 5);

    if (!upcoming.length) {
      list.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    list.innerHTML = upcoming.map(function (ev) {
      var d = new Date(ev.date + "T00:00:00");
      return '<li class="up-item">' +
        '<div class="up-date"><span class="mon">' + MON[d.getMonth()] + '</span><span class="day">' + pad(d.getDate()) + '</span></div>' +
        '<div><div class="up-title">' + escapeHtml(ev.title) + '</div>' +
        (ev.time ? '<div class="up-sub">' + escapeHtml(ev.time) + '</div>' : '') +
        '</div></li>';
    }).join("");
  }

  loadEventsList(render);
}

/* ─────────────────────────────────────────────────────
   HOME PAGE — Today's Reading (SyroCalendar widget driven)
   ───────────────────────────────────────────────────── */
function initReading() {
  var dayLabel  = document.getElementById("rdDayLabel");
  var gospelBox = document.getElementById("rdGospelBox");
  var gospelRef = document.getElementById("rdGospelRef");
  var status    = document.getElementById("rdStatus");
  var expand    = document.getElementById("rdExpand");
  var more      = document.getElementById("rdMore");
  if (!dayLabel) return;

  function fail() {
    status.innerHTML = 'Could not load readings. <a href="https://syrocalendar.com" target="_blank" rel="noopener">Visit SyroCalendar.com &#8594;</a>';
  }

  if (typeof GetLiturgicalReadingsJSON !== "function") { fail(); return; }

  function render(items) {
    status.textContent = "";
    if (!items || !items.length) { status.textContent = "No reading data available for today."; return; }

    dayLabel.textContent = items[0].DayDescription_Eng || items[0].SeasonName_Eng_Full || "";

    var gospel = readingFieldRows(items[0], false).filter(function (r) { return r.label === "Gospel"; })[0];
    if (gospel) {
      gospelRef.textContent = gospel.ref + (gospel.title ? " (" + gospel.title + ")" : "");
      gospelBox.hidden = false;
    }

    var rows = [];
    items.forEach(function (item, i) {
      if (items.length > 1) {
        rows.push('<div class="rd-row rd-row-heading">' + escapeHtml(item.DayDescription_Eng || item.SeasonName_Eng_Full || "") + '</div>');
      }
      readingFieldRows(item, i === 0).forEach(function (r) {
        rows.push('<div class="rd-row"><span class="rd-row-label">' + escapeHtml(r.label) + '</span><span>' + escapeHtml(r.ref) + (r.title ? " (" + escapeHtml(r.title) + ")" : "") + '</span></div>');
      });
    });
    if (rows.length) { more.innerHTML = rows.join(""); expand.hidden = false; }
  }

  // The widget script populates its data asynchronously; poll using
  // SyroCalendar's own documented readiness check until today's data
  // has actually landed (their recommended pattern), then read it.
  var tries = 0;
  (function poll() {
    var ready = typeof getLoadedDateSyroCalendar === "function" &&
                typeof getTodaysDateSyroCalendar === "function" &&
                getLoadedDateSyroCalendar() === getTodaysDateSyroCalendar();
    if (!ready) {
      if (++tries > 80) { fail(); return; } // ~20s
      setTimeout(poll, 250);
      return;
    }
    render(GetLiturgicalReadingsJSON());
  })();
}

/* ─────────────────────────────────────────────────────
   CALENDAR PAGE — full month grid + day-detail popup
   (calendar.html only; a plain `if (!grid) return` keeps
   this a no-op on every other page)
   ───────────────────────────────────────────────────── */
function initEvents() {
  var grid       = document.getElementById("calGrid");
  var monthLabel = document.getElementById("calMonthLabel");
  var prevBtn    = document.getElementById("calPrev");
  var nextBtn    = document.getElementById("calNext");
  var detail     = document.getElementById("calDetail");
  var detailDate = document.getElementById("calDetailDate");
  var detailEvts = document.getElementById("calDetailEvents");
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

    detail.hidden = false;
    detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
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

  function buildMap(list) {
    eventsMap = {};
    list.forEach(function (ev) {
      if (!eventsMap[ev.date]) eventsMap[ev.date] = [];
      eventsMap[ev.date].push(ev);
    });
    renderCalendar();
  }

  // Initial render (no events yet)
  renderCalendar();
  loadEventsList(buildMap);
}

/* ─────────────────────────────────────────────────────
   SHEET → OBJECTS
   Turns a published CSV into a list of objects keyed by the
   header text (lower-case, letters and digits only), so the
   order of the columns in the sheet does not matter.
   ───────────────────────────────────────────────────── */
function sheetKey(s) {
  return String(s == null ? "" : s).toLowerCase().replace(/[^a-z0-9]/g, "");
}
function parseSheetObjects(text) {
  var rows = parseCSVRows(text);
  if (!rows.length) return [];
  var head = rows[0].map(sheetKey), out = [];
  for (var i = 1; i < rows.length; i++) {
    var obj = {}, any = false;
    for (var c = 0; c < head.length; c++) {
      var v = rows[i][c] == null ? "" : String(rows[i][c]);
      if (head[c]) obj[head[c]] = v;
      if (v.trim() !== "") any = true;
    }
    if (any) out.push(obj);
  }
  return out;
}

/* ─────────────────────────────────────────────────────
   SITE SETTINGS — phone, email and registration links
   from the "Settings" tab of the WebAdmin sheet
   ─────────────────────────────────────────────────────
   Whatever is in CONFIG stays as the fallback. A value in the
   sheet replaces it everywhere on the page. A registration link
   that is present but blank hides its button.
   ───────────────────────────────────────────────────── */
function initSettings() {
  if (!CONFIG.settingsSheetUrl) return;
  var CACHE_KEY = "olaSettings1";
  var KEYS = {
    phone: "phone",
    email: "email",
    parishregistrationlink: "parishRegistrationUrl",
    religiouseducationregistrationlink: "ccdRegistrationUrl"
  };

  function telFor(p) {
    var d = String(p).replace(/\D/g, "");
    if (d.length === 10) return "+1" + d;
    if (d.length === 11 && d.charAt(0) === "1") return "+" + d;
    return (String(p).trim().charAt(0) === "+" ? "+" : "") + d;
  }

  function parse(csv) {
    var out = {};
    parseSheetObjects(csv).forEach(function (r) {
      var k = KEYS[sheetKey(r.setting)];
      if (k) out[k] = String(r.value || "").trim();
    });
    return out;
  }

  function apply(o) {
    var changed = false;
    if (o.phone !== undefined && o.phone.replace(/\D/g, "").length >= 7) {
      CONFIG.phone = o.phone; CONFIG.phoneTel = telFor(o.phone); changed = true;
    }
    if (o.email !== undefined && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.email)) {
      CONFIG.email = o.email; changed = true;
    }
    ["parishRegistrationUrl", "ccdRegistrationUrl"].forEach(function (k) {
      if (o[k] === undefined) return;
      if (o[k] === "") { CONFIG[k] = ""; changed = true; }
      else if (/^https?:\/\//i.test(o[k])) { CONFIG[k] = o[k]; changed = true; }
    });
    if (changed) applyConfig();
  }

  try {
    var c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (c && typeof c === "object") apply(c);
  } catch (e) {}

  fetch(CONFIG.settingsSheetUrl)
    .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.text(); })
    .then(function (csv) {
      var fresh = parse(csv);
      if (!Object.keys(fresh).length) return;      // wrong or empty tab → keep what we have
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(fresh)); } catch (e) {}
      apply(fresh);
    })
    .catch(function () { /* Google unreachable — the built-in values stay */ });
}

/* ─────────────────────────────────────────────────────
   MASS TIMES — from the "Mass Times" tab of the WebAdmin sheet
   ─────────────────────────────────────────────────────
   Sheet columns: Day | Label | Time | Note | Active (Yes/No)
   Shown in the Mass Schedule box on the home page, ordered by day
   (Saturday before Sunday) and then by time. The Religious Education
   page takes its day and time from the row whose Label contains
   "Religious Education". If the sheet cannot be reached, or has no rows
   at all, the schedule already written in the page is left alone.
   ───────────────────────────────────────────────────── */
function initMassTimes() {
  if (!CONFIG.massTimesSheetUrl) return;
  var box    = document.getElementById("massScheduleBox");
  var reDay  = document.querySelector("[data-cfg='reDay']");
  var reTime = document.querySelector("[data-cfg='reTime']");
  if (!box && !reDay && !reTime) return;          // this page shows no schedule
  var CACHE_KEY = "olaMassTimes1";

  var DAY_RANK = { everyday: 0, daily: 0, weekdays: 1, weekday: 1, monday: 2, tuesday: 3, wednesday: 4, thursday: 5, friday: 6, saturday: 7, sunday: 8 };
  var DAY_NAME = { monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday" };

  function timeMinutes(t) {
    var m = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i.exec(t || "");
    if (!m) return 9999;
    var h = (+m[1]) % 12;
    if (/pm/i.test(m[3])) h += 12;
    return h * 60 + (+m[2] || 0);
  }
  function classDay(dk) {
    if (DAY_NAME[dk]) return "Every " + DAY_NAME[dk];
    if (dk === "everyday" || dk === "daily") return "Every day";
    if (dk === "weekdays" || dk === "weekday") return "Weekdays";
    return "";
  }

  function parse(csv) {
    var rows = parseSheetObjects(csv), total = 0, items = [];
    rows.forEach(function (r, i) {
      var label = String(r.label || "").trim(), time = String(r.time || "").trim();
      if (!label || !time) return;
      total++;
      if (String(r.active || "").trim().toLowerCase() !== "yes") return;
      items.push({ day: sheetKey(r.day), label: label, time: time, note: String(r.note || "").trim(), i: i });
    });
    items.sort(function (a, b) {
      var ra = a.day in DAY_RANK ? DAY_RANK[a.day] : 99, rb = b.day in DAY_RANK ? DAY_RANK[b.day] : 99;
      return ra - rb || timeMinutes(a.time) - timeMinutes(b.time) || a.i - b.i;
    });
    return { total: total, items: items };
  }

  function render(data) {
    if (!data || !data.total) return;              // empty sheet → keep the built-in schedule
    if (box) {
      box.textContent = "";
      if (!data.items.length) {
        var none = document.createElement("div");
        none.className = "hg-row";
        var msg = document.createElement("span");
        msg.className = "hg-row-label";
        msg.textContent = "Please contact the parish for the current Mass schedule.";
        none.appendChild(msg);
        box.appendChild(none);
      }
      data.items.forEach(function (x) {
        var row = document.createElement("div");
        row.className = "hg-row";

        // Label + optional italic sub-line (e.g. "Holy Mass" / "in Malayalam") —
        // matches the hand-written fallback markup already in index.html.
        var lab = document.createElement("span");
        lab.className = "hg-row-label";
        lab.appendChild(document.createTextNode(x.label));
        if (x.note) {
          lab.appendChild(document.createElement("br"));
          var em = document.createElement("em");
          em.textContent = x.note.replace(/^\(\s*|\s*\)$/g, "");
          lab.appendChild(em);
        }

        // Frequency badge ("EVERY SUNDAY" etc., uppercased via CSS) stacked
        // above the time — the Day column drives this badge instead of
        // prefixing the label, again matching the fallback markup.
        var wrap = document.createElement("span");
        wrap.className = "hg-row-time-wrap";
        var freqText = classDay(x.day);
        if (freqText) {
          var freq = document.createElement("span");
          freq.className = "hg-row-freq";
          freq.textContent = freqText;
          wrap.appendChild(freq);
        }
        var tm = document.createElement("span");
        tm.className = "hg-row-time";
        tm.textContent = x.time;
        wrap.appendChild(tm);

        row.appendChild(lab);
        row.appendChild(wrap);
        box.appendChild(row);
      });
    }
    var re = null;
    data.items.some(function (x) { if (/religious\s*education|ccd/i.test(x.label)) { re = x; return true; } return false; });
    if (re) {
      if (reDay && classDay(re.day)) reDay.textContent = classDay(re.day);
      if (reTime) reTime.textContent = re.time;
    }
  }

  try {
    var c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (c && c.items) render(c);
  } catch (e) {}

  fetch(CONFIG.massTimesSheetUrl)
    .then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); return res.text(); })
    .then(function (csv) {
      var fresh = parse(csv);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(fresh)); } catch (e) {}
      render(fresh);
    })
    .catch(function () { /* Google unreachable — the built-in schedule stays */ });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
