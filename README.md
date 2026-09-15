# Marvel Universe: Concise Continuity

A curated, fixed-timeline Marvel site. Real-world present day = in-universe present day. No build step — static HTML/CSS/JS reading from one JSON file, same pattern as your other GitHub Pages sites.

## Structure

```
index.html              Characters tab — roster grid (site landing page)
timeline.html            Timeline tab — horizontal, site-wide chronological timeline
stories.html             Stories tab — curated arcs (empty until you add some)
character.html           Single character bio page (?id=tony-stark)
css/style.css            All styling — Marvel red / black / white
js/app.js                Reads data/characters.json and renders every page + the shared nav
data/characters.json     ALL content lives here — characters, bios, eras/variants, timeline events, stories
assets/characters/<id>/  Character art, one subfolder per character
assets/overlay/frame.png The portrait frame/badge overlay, stacked on every portrait
```

Nav is shared: every page has `<header class="site-nav" id="site-nav"></header>`, and `renderNav("characters"|"timeline"|"stories")` fills it in and highlights the active tab.

## Adding or editing a character

Everything is in `data/characters.json`. Each character object:

- `id` — url-safe slug, matches the folder in `assets/characters/`
- `primaryVariantId` — which variant is the default/hero portrait shown on the roster grid and bio header. Falls back to the first variant flagged `isHeroForm: true`.
- `bioShort` — one or two sentences, shown at the top of the bio page
- `bioLong` — the curated history paragraph(s). This is where you decide what counts as canon.
- `variants[]` — each look/suit/era, with its own image, year, and description.
  - `isHeroForm: true` → shown first, full styling ("Hero Form" tag, red accent border)
  - `isHeroForm: false` → civilian/alter-ego shot, shown after hero forms, dimmed with a "Civilian / Alter Ego" tag
- `timelineEvents[]` — dated entries that show up both on the character's own timeline and the site-wide timeline. `date` can be a year ("2024") or a more specific string ("2024-03") — sorting is lexicographic so keep the format consistent.

Any field still reading `PLACEHOLDER...` renders dimmed/italic so you can spot what's unwritten as you browse.

## Adding stories

Add objects to the top-level `stories` array:

```json
{
  "id": "some-slug",
  "title": "Story title",
  "date": "2025",
  "characterIds": ["tony-stark", "steve-rogers"],
  "summary": "What happens, and why it's canon here."
}
```

They'll render on the Stories tab automatically, newest last (sorted by `date`).

## Adding art

Drop new images into `assets/characters/<id>/` and reference them by relative path from the site root in the JSON. Portraits are shown uncropped (`object-fit: contain`) at a 2:3 frame to match `assets/overlay/frame.png` — keep new art close to that 2:3 ratio (current art is 848×1264) so the overlay frame lines up cleanly. The overlay is applied automatically to every portrait everywhere (roster cards, bio header, variant cards) via `js/app.js`'s `photoMarkup()` — swap `assets/overlay/frame.png` for a new design anytime without touching code.

## Open continuity questions (flagged in the data, worth resolving early)

- **Steve Rogers' origin year.** His WWII / Howling Commandos variants are dated 1945, but the premise is real-time = story-time — if he's still a WWII vet he'd be over 100 today. Decide whether that stays as deep backstory or gets reframed/cut.
- **Bruce Banner has five Hulk personas in the art** (classic, Doc Green, Planet Hulk, Immortal Hulk, Joe Fixit). All are in the data as hero-form variants for now — decide which eras are actually canon on your fixed timeline vs. which you're leaving as unused alternates.
- **Ant-Man and Wasp have no confirmed civilian identity yet.** Comics have used more than one person under each name (Hank Pym/Scott Lang; Janet/Hope van Dyne) — the data currently just says "Ant-Man" / "Wasp" with a placeholder bio flagging the decision.
- **Ultron** is in the roster as a hostile/villain entry, not an Avenger. If the roster grows more antagonists, you may want a separate section or a `role: "villain"` filter down the line — that's not built yet, easy to add.
- Exact years for every event are placeholders spread across a believable ~10-year "modern era" window — adjust `firstAppearanceYear` and `timelineEvents[].date` per character as you lock in backstory length.

## Running locally

No build tools needed. From this folder:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publishing to GitHub Pages

Copy everything in this folder into your existing repo (root, or a `/docs` folder if that's how the repo is configured), commit, and push. If Pages is already enabled on that repo it'll pick it up automatically.
