# Marvel Universe: Concise Continuity

A curated, fixed-timeline Marvel site. Real-world present day = in-universe present day. No build step — static HTML/CSS/JS reading from one JSON file, same pattern as your other GitHub Pages sites.

## Structure

```
index.html            Roster grid + combined chronological timeline
character.html         Single character bio page (?id=tony-stark)
css/style.css          All styling
js/app.js              Reads data/characters.json and renders both pages
data/characters.json   ALL content lives here — characters, bios, eras/variants, timeline events
assets/characters/<id>/ Character art, one subfolder per character
```

## Adding or editing a character

Everything is in `data/characters.json`. Each character object:

- `id` — url-safe slug, matches the folder in `assets/characters/`
- `portrait` — default image shown on the roster grid and bio header
- `bioShort` — one or two sentences, shown at the top of the bio page
- `bioLong` — the curated history paragraph(s). This is where you decide what counts as canon.
- `variants[]` — each look/suit/era the character has had, with its own image, year, and description. These render as cards on the bio page.
- `timelineEvents[]` — dated entries that show up both on the character's own timeline and the combined site-wide timeline on the home page. `date` can be a year ("2024") or a more specific string ("2024-03") — sorting is lexicographic so keep the format consistent.

Any field still reading `PLACEHOLDER...` is flagged with a dim italic style on the page so you can spot what's unwritten as you browse.

## Adding art

Drop new images into `assets/characters/<id>/` and reference them by relative path from the site root (e.g. `assets/characters/tony-stark/mk4.png`) in the JSON.

## Open continuity questions (from this first pass)

- **Steve Rogers' origin year.** His WWII variant is in the data as `1945`, but the whole premise here is real-time = story-time. If he's still a WWII veteran he'd be over 100 today — decide whether to keep that as flavor/history, or move his origin forward (e.g. a modern super-soldier program) and cut or reframe the WWII art.
- Exact years for every event are placeholders (2016/2017/2022/2024/2025 etc.) — spread across a believable ~10-year "modern era" window. Adjust `firstAppearanceYear` and `timelineEvents[].date` to whatever backstory length you want per character.
- The `sorceress-...png` file (renamed to `stealth.png`) is actually a third Captain America look, not a separate character — flag if that mapping is wrong.

## Running locally

No build tools needed. From this folder:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publishing to GitHub Pages

Copy everything in this folder into your existing repo (root, or a `/docs` folder if that's how the repo is configured), commit, and push. If Pages is already enabled on that repo it'll pick it up automatically.
