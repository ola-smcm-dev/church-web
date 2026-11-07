/**
 * Our Lady Of Assumption — Media API
 * ----------------------------------------------------------------------
 * A tiny Google Apps Script web app that feeds the church website:
 *
 *   ?action=videos   → videos in ONE YouTube playlist (via the official
 *                      YouTube Data API — see below for why)
 *   ?action=photos   → photos from your Drive PHOTO CATEGORY folders
 *   ?action=posters  → poster images from your Drive POSTERS folder
 *   ?action=books    → the PRAYER BOOKS page: every file in your Drive
 *                      "Prayer Books" folder (sub-folders = page sections)
 *   ?action=readings → daily Syro-Malabar Scripture readings for a given
 *                      date (?date=YYYY-MM-DD), proxied server-side from
 *                      syrocalendar.com — a direct browser fetch to that
 *                      site is blocked by CORS, so the website calls this
 *                      instead (see the "Readings" section further down).
 *
 * Photo structure: each "category" (Church Feast, Christmas & New Year, …)
 * is its OWN top-level Drive folder (they do not need to sit inside one
 * common parent). Inside each category folder, make one sub-folder per
 * year/activity — 2024, 2025, "PumpkinPainting 2024", … — and put those
 * photos straight into it. Every sub-folder becomes one album on the
 * website. By default an album is named "<category label> <sub-folder
 * name>", e.g. "Church Feast 2025" — but a category can set
 * childNameOnly: true to use just the sub-folder's own name instead
 * (see the Faith Formation entry below). A photo placed loose in a
 * category folder (not inside a sub-folder) becomes its own album named
 * just the category label.
 *
 * Each category also carries a "key" — a stable internal id (e.g. "ccd")
 * that gets sent to the website as each album's "category" field, so the
 * front-end can reliably pick out a specific category's albums (for
 * example, the Religious Education page's own photo gallery) no matter
 * what the human-readable label says or how it's later renamed. If a
 * category has no key, its label is used as the key instead.
 *
 * Posters: photos/PDFs placed in ONE Drive folder (POSTERS_FOLDER_ID)
 * are shown as the home page's poster carousel, newest first, capped at
 * MAX_POSTERS. There's no sub-folder structure for posters — just drop
 * files straight into that one folder.
 *
 * Videos: this uses the official YouTube Data API (playlistItems.list),
 * called through Apps Script's built-in "Advanced Service" for YouTube
 * — NOT YouTube's public RSS feed and NOT a pasted-in API key. The RSS
 * feed (feeds/videos.xml) has been unreliable platform-wide for over a
 * year — it randomly 404s for all kinds of channels regardless of
 * settings, with no fix from Google. The Advanced Service reads the
 * playlist using the identity of whichever account deployed this
 * script (via Apps Script's own authorization) — no API key to create,
 * store, or ever worry about leaking. You just need to turn the
 * service on once: in the Apps Script editor, click the "+" next to
 * "Services" in the left sidebar and add "YouTube Data API v3". Reading
 * a playlist costs 1 quota unit per call; the free daily quota is
 * 10,000 units, and this script only calls it once every 15 minutes
 * (via the cache below) no matter how many visitors hit the site.
 *
 * The website (js/media.js and js/main.js) calls this script and draws
 * the videos, photos, and posters. No login is needed by visitors — the
 * script runs as the account that deploys it.
 * ----------------------------------------------------------------------
 */

// ▼▼▼ 1. EDIT THESE ▼▼▼

// One entry per event category — add as many as you like.
// "id"    is the category folder's Drive ID (the part after /folders/ in its URL).
// "label" is what shows on the website in front of the sub-folder name, e.g. "Church Feast 2025".
// "key"   (optional) a stable internal id used for front-end matching (e.g. "ccd").
//         If left out, the label itself is used as the key.
// "childNameOnly" (optional) if true, sub-folder albums are named using ONLY the
//         sub-folder's own name (e.g. "PumpkinPainting 2024") instead of
//         "<label> <sub-folder name>".
var PHOTO_CATEGORIES = [
  { id: '1-kC-OzsHoV8rvVgdNJt5rvGWIDKv4z5h', label: 'Church Feast' },
  { id: '1T2ymK5Y6nowlahrzq65cEho-fXdhF6yU', label: 'Christmas & New Year' },
  { id: '1gJWGscPO4rV6IkJA370fXQIs764A_RRY', label: 'Onam' },
  { id: '1JArk3OTmxoYeAoC_9L9-MCJ9jLZyKErt', label: 'Faith Formation', key: 'ccd', childNameOnly: true }
  // Add more categories like this (don't forget the comma above this line):
  // , { id: 'PASTE_FOLDER_ID_HERE', label: 'Category Name' }
];

// The Drive folder that holds poster images/PDFs for the home page carousel.
// Just drop files straight into this one folder — no sub-folders needed.
var POSTERS_FOLDER_ID = '1pjr40k4dCbEwAM-JR8Tlj6LwfEZqmM3i';
var MAX_POSTERS        = 3;     // how many posters to show, newest first
// Posters uploaded through the WebAdmin "Notices" screen may carry a "Show until: YYYY-MM-DD"
// line in their Drive description. Once that day has passed the poster is skipped here.
var POSTER_TZ          = 'America/New_York';

// Prayer Books page (prayer-books.html): paste the id of your Drive "Prayer Books"
// folder. Each SUB-FOLDER becomes a section on the page (e.g. "Books Used in
// Church", "Books for Home Prayer"); files placed loose in the main folder are
// listed under "Prayer Books". Every file must be shared "Anyone with the link
// can view". File names become the book titles; an optional description is read
// from the file's Drive "Description" (right-click → File information → Details).
// Start a name with a number ("01 Holy Qurbana") to control the order — the number is hidden.
var BOOKS_FOLDER_ID = '11G0vjUdHHvKL2Zvwk_9DLnJ5YoZ-apKr';

var YOUTUBE_PLAYLIST_ID = 'PLLy3Gyf1Ivpw';      // the part after list= in the playlist URL
// ▲▲▲ that's all you must change ▲▲▲
// (You DO need to add the "YouTube Data API v3" Advanced Service once —
// in the Apps Script editor, click the + next to Services and add it —
// but there's no key or ID to paste in for it.)

// Optional settings
var MAX_VIDEOS           = 12;     // how many playlist videos to send to the site
var SORT_VIDEOS_BY_DATE  = false;  // false = keep the playlist order (first video is "featured")
                                   // true  = newest published first
var RECENT_COUNT         = 12;     // photos used for the home page mosaic
var CACHE_SECONDS        = 900;    // 15 min — new uploads show up within this time


/** Web app entry point */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || '';
  var out;
  try {
    if (action === 'videos')        out = cached_('videos', getVideos_);
    else if (action === 'photos')   out = cached_('photos', getPhotos_);
    else if (action === 'posters')  out = cached_('posters', getPosters_);
    else if (action === 'books')    out = cached_('books', getBooks_);
    else if (action === 'readings') {
      var rDate = (e && e.parameter && e.parameter.date) || '';
      out = cached_('readings_' + rDate, function () { return getReadings_(rDate); });
    }
    else out = { ok: false, error: 'Use ?action=videos, ?action=photos, ?action=posters, ?action=books, or ?action=readings&date=YYYY-MM-DD' };
  } catch (err) {
    out = { ok: false, error: String(err && err.message ? err.message : err) };
  }
  return ContentService
    .createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}


/* ───────────────────────── Videos ───────────────────────── */

function getVideos_() {
  if (!YOUTUBE_PLAYLIST_ID || YOUTUBE_PLAYLIST_ID.indexOf('PASTE_') === 0) {
    throw new Error('YOUTUBE_PLAYLIST_ID has not been set in the script.');
  }
  if (typeof YouTube === 'undefined') {
    throw new Error('The "YouTube Data API v3" service has not been added to this script. ' +
      'In the Apps Script editor, click the + next to Services (left sidebar) and add it.');
  }

  var resp;
  try {
    resp = YouTube.PlaylistItems.list('snippet,contentDetails', {
      playlistId: YOUTUBE_PLAYLIST_ID,
      maxResults: Math.min(Math.max(MAX_VIDEOS, 1), 50)
    });
  } catch (err) {
    throw new Error('YouTube API returned an error: ' + (err && err.message ? err.message : err) +
      '. Check the playlist ID and that the playlist is Public or Unlisted.');
  }

  var videos = ((resp && resp.items) || []).map(function (item) {
    var sn = item.snippet || {};
    var cd = item.contentDetails || {};
    return {
      id:        cd.videoId || (sn.resourceId && sn.resourceId.videoId),
      title:     sn.title,
      published: cd.videoPublishedAt || sn.publishedAt
    };
  }).filter(function (v) {
    // Skip playlist entries pointing at videos that were deleted or made private
    return v.id && v.title && v.title !== 'Deleted video' && v.title !== 'Private video';
  });

  if (SORT_VIDEOS_BY_DATE) {
    videos.sort(function (a, b) { return a.published < b.published ? 1 : -1; });
  }
  return { ok: true, videos: videos.slice(0, MAX_VIDEOS) };
}


/* ───────────────────────── Photos ───────────────────────── */

function getPhotos_() {
  if (!PHOTO_CATEGORIES || !PHOTO_CATEGORIES.length) {
    throw new Error('PHOTO_CATEGORIES has not been set in the script.');
  }

  var albums = [];

  PHOTO_CATEGORIES.forEach(function (cat) {
    if (!cat.id || cat.id.indexOf('PASTE_') === 0) {
      throw new Error('A folder ID in PHOTO_CATEGORIES has not been set (' + (cat.label || 'unnamed category') + ').');
    }
    var catKey = cat.key || cat.label;
    var folder = DriveApp.getFolderById(cat.id);

    // Photos placed directly in the category folder (not inside a sub-folder)
    var loose = collectImages_(folder);
    if (loose.length) albums.push(makeAlbum_(cat.id, cat.label, loose, catKey));

    // Each sub-folder = one album, named per childNameOnly above
    var subs = folder.getFolders();
    while (subs.hasNext()) {
      var sub  = subs.next();
      var imgs = collectImages_(sub);
      if (imgs.length) {
        var name = cat.childNameOnly ? sub.getName() : (cat.label + ' ' + sub.getName());
        albums.push(makeAlbum_(sub.getId(), name, imgs, catKey));
      }
    }
  });

  // Newest album first
  albums.sort(function (a, b) { return a._newest < b._newest ? 1 : -1; });

  // Most recent photos across all albums (for the home page)
  var everything = [];
  albums.forEach(function (a) {
    a._files.forEach(function (f) { everything.push({ id: f.id, name: f.name, album: a.name, t: f.t }); });
  });
  everything.sort(function (a, b) { return a.t < b.t ? 1 : -1; });
  var recent = everything.slice(0, RECENT_COUNT).map(function (p) {
    return { id: p.id, name: p.name, album: p.album };
  });

  // Strip internal fields before sending
  var total = 0;
  var clean = albums.map(function (a) {
    total += a.count;
    return { id: a.id, name: a.name, count: a.count, photos: a.photos, category: a.category };
  });

  return { ok: true, total: total, recent: recent, albums: clean };
}

function collectImages_(folder) {
  var out   = [];
  var files = folder.getFiles();
  while (files.hasNext()) {
    var f = files.next();
    if (String(f.getMimeType()).indexOf('image/') === 0) {
      out.push({ id: f.getId(), name: f.getName(), t: f.getDateCreated().toISOString() });
    }
  }
  return out;
}

function makeAlbum_(id, name, files, category) {
  var newest = files.reduce(function (m, f) { return f.t > m ? f.t : m; }, '');
  // Show photos in file-name order (camera numbering keeps them in shooting order)
  var byName = files.slice().sort(function (a, b) {
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });
  return {
    id: id, name: name, count: byName.length,
    photos: byName.map(function (f) { return { id: f.id, name: f.name }; }),
    category: category,
    _newest: newest, _files: files
  };
}


/* ───────────────────────── Posters ───────────────────────── */

function getPosters_() {
  if (!POSTERS_FOLDER_ID || POSTERS_FOLDER_ID.indexOf('PASTE_') === 0) {
    return { ok: true, posters: [] };
  }
  var folder = DriveApp.getFolderById(POSTERS_FOLDER_ID);
  var files  = folder.getFiles();
  var out    = [];
  var today  = Utilities.formatDate(new Date(), POSTER_TZ, 'yyyy-MM-dd');
  while (files.hasNext()) {
    var f    = files.next();
    var mime = String(f.getMimeType());
    if (mime.indexOf('image/') !== 0 && mime !== 'application/pdf') continue;
    var um = /Show until:\s*(\d{4}-\d{2}-\d{2})/.exec(String(f.getDescription() || ''));
    if (um && um[1] < today) continue;                       // expired notice: leave it off the website
    out.push({ id: f.getId(), name: f.getName(), t: f.getDateCreated().toISOString() });
  }
  out.sort(function (a, b) { return a.t < b.t ? 1 : -1; });   // newest first
  return { ok: true, posters: out.slice(0, MAX_POSTERS) };
}


/* ───────────────────────── Prayer Books ───────────────────────── */

function getBooks_() {
  if (!BOOKS_FOLDER_ID || BOOKS_FOLDER_ID.indexOf('PASTE_') === 0) {
    return { ok: true, sections: [] };
  }
  var root = DriveApp.getFolderById(BOOKS_FOLDER_ID);
  var sections = [];

  var loose = bookFiles_(root);
  if (loose.length) sections.push({ title: 'Prayer Books', sort: 'zzz', books: loose });

  var subs = root.getFolders();
  while (subs.hasNext()) {
    var sub = subs.next();
    var books = bookFiles_(sub);
    if (books.length) sections.push({ title: sub.getName(), sort: sub.getName().toLowerCase(), books: books });
  }
  sections.sort(function (a, b) { return a.sort < b.sort ? -1 : a.sort > b.sort ? 1 : 0; });
  sections.forEach(function (s) { delete s.sort; });
  return { ok: true, sections: sections };
}

function bookFiles_(folder) {
  var files = folder.getFiles();
  var out = [];
  while (files.hasNext()) {
    var f = files.next();
    out.push({
      id: f.getId(),
      name: f.getName(),
      mime: String(f.getMimeType()),
      desc: f.getDescription() || '',
      t: f.getLastUpdated().toISOString()
    });
  }
  out.sort(function (a, b) {
    var x = a.name.toLowerCase(), y = b.name.toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
  });
  return out;
}


/* ───────────────────────── Readings ───────────────────────── */

// dateStr is expected as YYYY-MM-DD (what the website's <input type="date">
// gives). Converts to syrocalendar.com's DD-MM-YYYY and proxies the call
// server-side, so the browser never hits syrocalendar.com directly (that
// direct call is blocked by CORS — this proxy is the fix).
function getReadings_(dateStr) {
  var parts = String(dateStr || '').split('-');
  if (parts.length !== 3) {
    throw new Error('Expected ?date=YYYY-MM-DD');
  }
  var apiDate = parts[2] + '-' + parts[1] + '-' + parts[0];   // DD-MM-YYYY
  var url = 'https://syrocalendar.com/SyroMalabarCalendar/?Mode=JSON&Type=DailyReadings&Date=' + apiDate;

  var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (resp.getResponseCode() !== 200) {
    throw new Error('SyroCalendar.com returned HTTP ' + resp.getResponseCode());
  }
  var data = JSON.parse(resp.getContentText());
  return { ok: true, reading: data };
}


/* ───────────────────────── Cache ───────────────────────── */

function cached_(key, builder) {
  var cache = CacheService.getScriptCache();
  var hit   = cache.get(key);
  if (hit) return JSON.parse(hit);
  var data = builder();
  var text = JSON.stringify(data);
  if (text.length < 90000) cache.put(key, text, CACHE_SECONDS);   // cache limit is 100 KB
  return data;
}


/**
 * Optional: run this from the editor (▶ Run) to test without deploying.
 * Open View → Logs (or Execution log) to see the result.
 */
function testRun() {
  Logger.log(JSON.stringify(getVideos_()).slice(0, 500));
  Logger.log(JSON.stringify(getPhotos_()).slice(0, 500));
  Logger.log(JSON.stringify(getPosters_()).slice(0, 500));
  Logger.log(JSON.stringify(getBooks_()).slice(0, 500));
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  Logger.log(JSON.stringify(getReadings_(today)).slice(0, 500));
}
