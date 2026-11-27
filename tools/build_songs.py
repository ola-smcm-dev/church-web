#!/usr/bin/env python3
"""
build_songs.py — turns the big lyrics JSON into small static files for songs.html.

Usage (from the website folder):
    python3 tools/build_songs.py "Claude outputs/qurbana_songs_lyrics.json"            -> writes ./songs/
    python3 tools/build_songs.py SOURCE.json OUTDIR

Source: a list of songs { id, title, url, malayalam:[{role, lines[]}], manglish:[{role, lines[]}] }.
Output (all plain JSON, UTF-8, served gzipped by GitHub Pages):
    songs/index.json      { v, songs:[[id, title, chunk], ...] }   sorted by title (A-Z), small
    songs/search.json     { mg:[...], ml:[...] }  first 4 text lines of each song (same order as index.json)
    songs/c/NNN.json      { "<id>": [malayalamBlocks, manglishBlocks] }  100 songs per file (neighbours in A-Z order)
                          block = [role, [lines...]]
The source "url" is NOT copied (no credits are shown for now).
Only change made to the text: old-style Malayalam chillu letters (letter + virama + ZWJ) are
converted to the modern single-character chillus so that search and display work with phone keyboards.
Re-run this script whenever songs are added or corrected, then upload the songs/ folder.
"""
import json, os, re, sys, hashlib, shutil

CHUNK = 100
CHILLU = {  # consonant + virama + ZWJ  ->  atomic chillu
    'ണ': 'ൺ', 'ന': 'ൻ', 'ര': 'ർ',
    'ല': 'ൽ', 'ള': 'ൾ', 'ക': 'ൿ',
}
CHILLU_RE = re.compile('([ണനരലളക])്‍')
LETTER_RE = re.compile(r'[A-Za-zഀ-ൿ]')


def fix_ml(s):
    return CHILLU_RE.sub(lambda m: CHILLU[m.group(1)], s)


def blocks(raw, ml):
    out = []
    for b in raw:
        lines = [(fix_ml(l) if ml else l) for l in b.get('lines', [])]
        if lines:
            out.append([b.get('role', '') or '', lines])
    return out


def first_lines(bl, n=4):
    res = []
    for _, lines in bl:
        for l in lines:
            if LETTER_RE.search(l):
                res.append(l.strip())
                if len(res) == n:
                    return res
    return res


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    src = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else 'songs'
    data = json.load(open(src, encoding='utf-8'))
    songs = []
    seen = set()
    for s in data:
        sid = int(s['id'])
        if sid in seen:
            raise SystemExit('duplicate id %d' % sid)
        seen.add(sid)
        title = ' '.join(str(s.get('title', '')).split())
        ml = blocks(s.get('malayalam', []), True)
        mg = blocks(s.get('manglish', []), False)
        if not title or (not ml and not mg):
            print('skipping empty song', sid)
            continue
        songs.append((sid, title, ml, mg))
    songs.sort(key=lambda x: (x[1].lower(), x[0]))

    if os.path.isdir(out):
        shutil.rmtree(out)
    os.makedirs(os.path.join(out, 'c'))

    index, smg, sml = [], [], []
    for ci in range(0, len(songs), CHUNK):
        part = songs[ci:ci + CHUNK]
        cn = ci // CHUNK
        obj = {}
        for sid, title, ml, mg in part:
            obj[str(sid)] = [ml, mg]
            index.append([sid, title, cn])
            smg.append('\n'.join(first_lines(mg)))
            sml.append('\n'.join(first_lines(ml)))
        with open(os.path.join(out, 'c', '%03d.json' % cn), 'w', encoding='utf-8', newline='\n') as f:
            json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))

    body = json.dumps(index, ensure_ascii=False, separators=(',', ':'))
    ver = hashlib.md5(body.encode('utf-8')).hexdigest()[:8]
    with open(os.path.join(out, 'index.json'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('{"v":"%s","songs":%s}' % (ver, body))
    with open(os.path.join(out, 'search.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump({'mg': smg, 'ml': sml}, f, ensure_ascii=False, separators=(',', ':'))

    n_chunks = (len(songs) + CHUNK - 1) // CHUNK
    print('songs: %d   chunk files: %d   index version: %s' % (len(songs), n_chunks, ver))
    tot = 0
    for root, _, files in os.walk(out):
        for fn in files:
            tot += os.path.getsize(os.path.join(root, fn))
    print('total size: %.1f MB' % (tot / 1e6))


if __name__ == '__main__':
    main()
