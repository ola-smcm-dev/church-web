/**
 * Syro-Malabar Daily Readings — date lookup Apps Script.
 *
 * SETUP:
 * 1. Import "Syro-Malabar_Daily_Readings_2025-2026.xlsx" into Google Sheets
 *    (File > Import > Upload > Replace spreadsheet / Insert new sheet(s)).
 *    Make sure the tab is named "Readings" (it already is, if imported as-is).
 * 2. In that Google Sheet, open Extensions > Apps Script.
 * 3. Paste this whole file in (replacing the default Code.gs content, or as
 *    a new script file if you'd rather keep it separate from another project).
 * 4. Deploy > New deployment > Web app > Execute as: Me, Who has access:
 *    Anyone (or "Anyone with the link") > Deploy. Copy the web app URL.
 * 5. From your website's JS, fetch:
 *      https://YOUR-DEPLOYMENT-URL/exec?date=2026-04-19
 *    which returns JSON like:
 *      { "date": "2026-04-19", "weekday": "Sun", "season": "Resurrection",
 *        "important": false,
 *        "entries": [
 *          { "celebration": "Third Sunday of Resurrection",
 *            "important": false,
 *            "readings": [
 *              {"slot": "Law",     "ref": "Ex 3:1-12",    "title": "..."},
 *              {"slot": "Prophets","ref": "Ezek 34:20-26","title": "..."},
 *              {"slot": "Epistle", "ref": "Eph 4:7-16",   "title": "..."},
 *              {"slot": "Gospel",  "ref": "Jn 21:15-19",  "title": "..."}
 *            ],
 *            "notes": "" } ] }
 *    An unknown/out-of-range date returns { "date": "...", "entries": [] }.
 *    "important" (top-level: true if ANY entry that day is; per-entry: that
 *    entry's own flag) marks a day of obligation / major feast, derived from
 *    the sheet's "Important" column. The Notes column already has background
 *    trivia (death anniversaries, patron's days, episcopal ordinations)
 *    stripped out — see build_sheet.py's clean_notes() for how it's produced.
 *
 * CACHING (added 2026-09-30 — cuts the noticeable load delay):
 * Every doGet() call used to re-open the spreadsheet and re-scan all ~500
 * rows from scratch, every single time, for every visitor — that full
 * open-and-scan is the main source of the multi-second delay before a
 * reading card appears. Since the underlying data only changes when someone
 * edits the sheet (not on every page load), responses are now cached per
 * date via CacheService for up to 6 hours (CACHE_TTL_SECONDS — Apps
 * Script's own maximum). The first lookup for a given date in each cache
 * window still does the full scan and pays the normal latency; every other
 * visitor requesting that same date afterward (which in practice is almost
 * everyone, since most requests are for "today") gets an instant cache hit
 * instead.
 *
 * If you edit the Readings sheet (fix a typo, add a note, etc.) and want the
 * site to pick it up immediately instead of waiting up to 6 hours for the
 * cache to expire on its own, run bumpReadingsCacheVersion() once from this
 * editor (select it in the function dropdown, then Run). That invalidates
 * every cached response at once without needing to know which dates were
 * affected — no redeploy needed, it takes effect on the very next request.
 *
 * NOTES:
 * - The sheet only covers 2025-11-30 through 2026-12-31 (the current
 *   "Second Set" liturgical year). When the next year's Panchangam is
 *   published, re-run the extraction/validation process and re-import a
 *   fresh sheet for the new date range — this script itself doesn't change.
 * - Readings are English only for now (see project notes on Malayalam).
 * - This is written as a standalone script bound to its own sheet. If you'd
 *   rather fold it into the existing Code.gs (the one that already serves
 *   ?action=posters, ?action=photos, etc. for the main site), copy just the
 *   getReadingsByDate_()/getReadingsByDateCached_() functions and add a
 *   "readings2" (or similar) case to that file's doGet() dispatcher instead
 *   of using doGet() below.
 */

var SHEET_NAME = 'Readings';
var CACHE_TTL_SECONDS = 21600; // 6 hours — the max CacheService allows

function doGet(e) {
  var dateParam = (e && e.parameter && e.parameter.date) || '';
  var result = getReadingsByDateCached_(dateParam);
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Cache-wrapped version of getReadingsByDate_(). Returns a cached response
 * if one exists for this date at the current cache version; otherwise does
 * the real sheet lookup and caches the result for CACHE_TTL_SECONDS.
 */
function getReadingsByDateCached_(dateStr) {
  var cache = CacheService.getScriptCache();
  var cacheKey = 'reading_v' + getCacheVersion_() + '_' + dateStr;

  var cached = cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  var result = getReadingsByDate_(dateStr);
  // CacheService caps each value at 100KB — a single day's JSON here is at
  // most a few KB, so this always fits comfortably.
  cache.put(cacheKey, JSON.stringify(result), CACHE_TTL_SECONDS);
  return result;
}

/**
 * The current cache "generation". Bumping this (see
 * bumpReadingsCacheVersion() below) changes every cache key at once, so all
 * previously-cached responses are instantly orphaned/ignored — a cheap way
 * to invalidate the whole cache without enumerating every cached date.
 */
function getCacheVersion_() {
  var props = PropertiesService.getScriptProperties();
  var v = props.getProperty('READINGS_CACHE_VERSION');
  return v || '1';
}

/**
 * Run this manually from the Apps Script editor any time you edit the
 * Readings sheet and want the site to reflect the change immediately,
 * instead of waiting up to CACHE_TTL_SECONDS for stale cached responses to
 * expire on their own.
 */
function bumpReadingsCacheVersion() {
  var props = PropertiesService.getScriptProperties();
  var current = parseInt(getCacheVersion_(), 10) || 1;
  props.setProperty('READINGS_CACHE_VERSION', String(current + 1));
  Logger.log('Readings cache invalidated — new version: ' + (current + 1));
}

/**
 * Looks up all reading-entries for a given date. Does the real spreadsheet
 * read/scan every time it's called — call getReadingsByDateCached_() instead
 * unless you specifically need to bypass the cache.
 * @param {string} dateStr - "YYYY-MM-DD"
 * @return {Object} { date, weekday, entries: [...] }
 */
function getReadingsByDate_(dateStr) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var values = sheet.getDataRange().getValues();
  var header = values[0];
  var col = {};
  header.forEach(function (h, i) { col[h] = i; });

  var entries = [];
  var weekday = '';
  var season = '';
  var dayImportant = false;
  var target = dateStr; // expects "YYYY-MM-DD"

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var cellDate = row[col['Date']];
    if (!cellDate) continue;
    var rowDateStr = Utilities.formatDate(new Date(cellDate), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    if (rowDateStr !== target) continue;

    weekday = row[col['Weekday']];
    season = row[col['Season']];
    var readings = [];
    addSlot_(readings, 'Law', row[col['Reading 1 Ref (Law)']], row[col['Reading 1 Title (Law)']]);
    addSlot_(readings, 'Prophets', row[col['Reading 2 Ref (Prophets)']], row[col['Reading 2 Title (Prophets)']]);
    addSlot_(readings, 'Epistle', row[col['Reading 3 Ref (Epistle)']], row[col['Reading 3 Title (Epistle)']]);
    addSlot_(readings, 'Gospel', row[col['Reading 4 Ref (Gospel)']], row[col['Reading 4 Title (Gospel)']]);

    var entryImportant = !!String(row[col['Important']] || '').trim();
    if (entryImportant) dayImportant = true;

    entries.push({
      celebration: row[col['Celebration (English)']],
      important: entryImportant,
      readings: readings,
      notes: row[col['Notes']] || ''
    });
  }

  return { date: target, weekday: weekday, season: season, important: dayImportant, entries: entries };
}

function addSlot_(list, slotName, ref, title) {
  if (ref) {
    list.push({ slot: slotName, ref: ref, title: title || '' });
  }
}

/**
 * Quick manual test — run this from the Apps Script editor (Run > testLookup)
 * and check the log (View > Logs) instead of deploying first. Bypasses the
 * cache so it always reflects the live sheet.
 */
function testLookup() {
  Logger.log(JSON.stringify(getReadingsByDate_('2026-04-19'), null, 2));
  Logger.log(JSON.stringify(getReadingsByDate_('2025-12-18'), null, 2));
}
