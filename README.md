# Our Lady Of Assumption Syro Malabar Catholic Mission — Website

Live site: **[olasyromalabarct.org](https://olasyromalabarct.org/)**

The website for Our Lady Of Assumption Syro Malabar Catholic Mission, Fairfield, CT (838 Kings Hwy E — the mission meets in rented space). A static, no-build, no-framework site: plain HTML/CSS/JavaScript, hosted on GitHub Pages, with most day-to-day content (announcements, calendar, mass times, contact info, posters, photos, videos, daily readings) driven by Google Sheets and Google Apps Script so non-technical volunteers can update it without touching code.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home page — hero, mass schedule, contact card, join-us links, upcoming events, today's reading, clergy & staff, announcements, posters, donate, photo/video teasers |
| `calendar.html` | Full month-grid parish calendar with a day-popup showing parish events and that day's Scripture readings |
| `religious-education.html` | Faith Formation → Religious Education: CCD program info, class schedule, photo gallery |
| `media.html` | Video playlist and photo albums |
| `about-church.html` | **About → Our Church** — parish story, milestones, past priests (placeholder text; `noindex` until filled in). `church-history.html` is only a redirect to it |
| `about-syro-malabar-church.html` | **About → The Syro Malabar Church** — origins, liturgy, communion with Rome |
| `faith-formation.html` | **Faith Formation** landing page (Religious Education, CML, Youth Faith Formation) |
| `cml.html`, `youth-faith-formation.html` | Faith Formation sub-pages — "coming soon" placeholders (`noindex`) |
| `prayer-books.html` | **Prayer Books** (single page, no sub-menu). Book cards are built automatically from a Google Drive "Prayer Books" folder: each sub-folder = a section, each file = a book (see Code.gs `?action=books`). Shows a "coming soon" note until the folder is connected; `noindex` until it has content |

## How content updates without a deploy

Several sections read live from published Google Sheets (as CSV) or a Google Apps Script web app, cached in `localStorage` and refreshed roughly every 5 minutes:

- **Announcements, Calendar Events, Mass Times, Settings (phone/email/registration links)** — a single Google Sheet, published per-tab as CSV.
- **Photos & videos** — a Google Apps Script web app backed by a YouTube playlist and category-organized Google Drive folders (see `Claude outputs/Code.gs`).
- **Posters** — served from a dedicated Google Drive folder via the same Apps Script (`?action=posters`).
- **Daily Scripture readings** (home page card + calendar day-popup) — a separate Google Sheet (built from the Syro-Malabar Liturgical Calendar / "Panchangam") queried through a standalone Apps Script, `ReadingsLookup.gs` (`?date=YYYY-MM-DD`).

Editing a sheet or re-deploying the relevant Apps Script is enough to change this content — no code changes or redeploys of the site itself are needed.

## Structure

```
index.html, calendar.html, media.html, religious-education.html, about-*.html,
faith-formation.html, cml.html, youth-faith-formation.html, prayer-books.html
tools/stamp_nav.py   — writes the shared menu + footer Quick Links into every page (see below)
css/style.css        — all site styles (navy/gold/cream theme, Playfair Display + Lato)
js/main.js           — CONFIG block, sheet/CSV loaders, mass times, settings, events,
                        calendar, upcoming events, daily-reading card
js/media.js          — video playlist + photo album/slideshow/lightbox logic
images/              — logo, hero photo (+ WebP variant), staff photos, QR code, icons
CNAME, .nojekyll     — GitHub Pages configuration
sitemap.xml, robots.txt
Claude outputs/      — Apps Script source (Code.gs), setup notes, backups (not served)
```

## Deployment

GitHub Pages serves this repository directly from the `main` branch at the custom domain in `CNAME`. Changes are pushed to a `dev` branch (via a local sync script) and merged into `main` through a pull request; `main` is what's live.

## Data sources & external services

- **Google Sheets** (published as CSV) for announcements, calendar events, mass times, and site settings.
- **Google Apps Script** web apps for photos/videos/posters and for daily Scripture readings.
- **Google Drive** for photo albums (one sub-folder per album) and poster images.
- **YouTube** for the video playlist.

None of these require secrets in the repo — all endpoints are public read-only URLs intended for client-side use.

## The site menu (two levels, always visible)

The top bar + menu are identical on every page and are **stamped into each page's HTML** by `tools/stamp_nav.py` (so search engines see real links). To add, rename or re-order a menu item: edit the `NAV` list at the top of `tools/stamp_nav.py`, then run `python3 tools/stamp_nav.py` from the website folder — it rewrites the menu (and the footer "Quick Links") in all pages. Behaviour/styling lives in `initNav()` (`js/main.js`) and the "MAIN MENU" section of `css/style.css`. To make a placeholder page public: remove its `<meta name="robots" content="noindex, follow">` line and add it to `sitemap.xml`.

## Notes for future edits

- Internal links use plain relative filenames (`page.html`), not root-relative paths, so the site works both on GitHub Pages and when opened directly from disk.
- Any new page should carry the standard SEO `<head>` block (canonical link, Open Graph tags including `og:site_name`, meta description) used on the existing pages, and be added to `sitemap.xml` (or excluded via `robots.txt` if it's meant to stay unlisted).
- Feast days and days of obligation come from the `SyroMalabarDates` tab of the WebAdmin sheet (published as CSV; `CONFIG.syroDatesSheetUrl` in `js/main.js`). Fixed feasts (e.g. "December 25") repeat every year automatically; movable feasts (rule text such as "Third Friday of Apostles") are worked out from the Easter date. An optional `Resolved Date` column overrides the computed date for a given year. The old hand-typed `IMPORTANT_DATES` list is gone.
