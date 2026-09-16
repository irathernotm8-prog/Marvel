# Marvel Universe: Concise Continuity

A curated, fixed-timeline Marvel site. Real-world present day = in-universe present day. No build step — static HTML/CSS/JS reading from one JSON file, same pattern as your other GitHub Pages sites.

**Canonicity rule:** everything in `data/characters.json` — every character, every costume/variant, every timeline event — is treated as something that actually happened in this universe. Nothing here is a hypothetical to choose between. The only way something leaves is an explicit retcon; otherwise this file only ever grows.

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
assets/overlay/shield-badge.png  Small S.H.I.E.L.D. badge watermark, stacked on every portrait
```

Nav is shared: every page has `<header class="site-nav" id="site-nav"></header>`, and `renderNav("characters"|"timeline"|"stories")` fills it in and highlights the active tab.

## Adding or editing a character

Everything is in `data/characters.json`. Each character object:

- `id` — url-safe slug, matches the folder in `assets/characters/`
- `primaryVariantId` — which variant is the default/hero portrait shown on the roster grid and bio header. Falls back to the first variant flagged `isHeroForm: true`.
- `bioShort` — one or two sentences, shown at the top of the bio page
- `bioLong` — the curated history paragraph(s). This is where you decide what counts as canon.
- `codename` — the hero identity (e.g. "Iron Man"). Shown large and red, on top, everywhere — roster cards and the bio header. `name` (the civilian/real name, e.g. "Tony Stark") shows smaller underneath. If the two are identical (Ultron, Loki, etc.) only one line is shown.
- `variants[]` — each look/suit/era, with its own image, year, and description.
  - `isHeroForm: true` → sorted first, tagged "Hero Form"
  - `isHeroForm: false` → civilian/alternate shot, sorted after hero forms, tagged "Alternate Form" — same full-color styling as hero forms, not dimmed
- `timelineEvents[]` — dated entries that show up both on the character's own timeline and the site-wide timeline. `date` can be a year ("2024") or a more specific string ("2024-03") — sorting is lexicographic so keep the format consistent. Both timeline pages group events by year, so if three characters all have something dated "2016," they show up stacked inside one point on the timeline instead of three separate points.
- A character with `"variants": []` (no art yet) is completely fine — the roster card, bio header, and variant grid all fall back to a "No Art Yet" placeholder automatically. Add art later by dropping images into `assets/characters/<id>/` and adding variant entries; nothing else needs to change.

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

Drop new images into `assets/characters/<id>/` and reference them by relative path from the site root in the JSON. Portraits are shown uncropped (`object-fit: contain`) at a 2:3 frame — keep new art close to that 2:3 ratio (current art is 848×1264) so the framing stays consistent. Every photo well (roster cards, bio header, variant cards) automatically gets a bottom vignette, a thin red top accent, and the `assets/overlay/shield-badge.png` watermark in the corner, all via CSS + `js/app.js`'s `photoMarkup()` — swap that PNG for a different mark anytime without touching code, or restyle the frame itself in `style.css` under "Portrait overlay treatment."

## Chronology logic

`universe.timelineAnchor.currentYear` (2026) is the anchor — real time = story time. Two rules drive the years already in the data:

- **The founding Avengers are well-established.** Iron Man, Captain America, Thor, Hawkeye, Black Widow, Hulk, Ant-Man, and Wasp all debut/found the team around 2009–2013, roughly 15+ years before the current year.
- **Peter Parker and Johnny Storm are both ~26 in the current year** and got their powers as teenagers, so both debut around 2016 — a full Avengers-generation later than Iron Man. The rest of the Fantastic Four (Sue Storm, Reed Richards, Ben Grimm) share that 2016 origin event.

Everything else (X-Men, solo heroes, villains) got reasonable placeholder years with no specific constraint from you yet — adjust `firstAppearanceYear` and `timelineEvents[].date` per character as you lock in backstory.

## Spider-Man's corner (first fully curated storyline)

Peter Parker's `bioLong` and `timelineEvents` now carry the actual story: bitten at 16 in 2016, tonally closer to the '90s animated series. A meteor crash in 2020 gives him the black suit; in 2021 he rejects it and it finds Eddie Brock, who bonds with it willingly and becomes Venom (2021). Cletus Kasady picks up a spawn of that same symbiote in 2023 and becomes Carnage. Separately, Norman Osborn (already the Green Goblin) clones Peter in 2019, producing Ben Reilly and Kaine — no Jackal, no life-takeover plot; Ben becomes a brotherly stand-in, Kaine's arc is rougher and unresolved. The rest of the classic rogues gallery (Doc Ock, Vulture, Mysterio, Sandman, Kraven, Rhino, Electro, the Lizard, Chameleon) and core supporting cast (MJ, Gwen Stacy, Aunt May, Harry Osborn, J. Jonah Jameson) are all in the roster as stubs — added because they're part of this story, most without art yet. Their `bioLong` fields are still `PLACEHOLDER`.

## Open continuity questions (flagged in the data, worth resolving early)

- **Steve Rogers' origin year.** His WWII / Howling Commandos variants are dated 1945, but the premise is real-time = story-time — if he's still a WWII vet he'd be over 100 today. Decide whether that stays as deep backstory or gets reframed.
- **Ant-Man and Wasp have no confirmed civilian identity yet.** Comics have used more than one person under each name (Hank Pym/Scott Lang; Janet/Hope van Dyne) — the data currently just says "Ant-Man" / "Wasp" with a placeholder bio flagging the decision.
- **Villains/anti-heroes** sit in the same roster grid as the heroes for now — the grid is growing fast on that side (Spider-Man's rogues gallery alone is a dozen entries). You may eventually want a separate section or filter — not built yet, easy to add.
- **Ghost Rider and Blade** assume the supernatural/street-level corner of Marvel is in play at all — flag if you want to cut that from this continuity.
- **Gwen Stacy's arc** is unwritten — the classic comics version is tragic; flag whether that beat happens here.
- **Harry Osborn** — unwritten whether he ever takes up a Goblin identity of his own, given his father already holds it.

To remove anything that gets **ret-conned out** later, just ask — deletion is explicit, never automatic.

## Running locally

No build tools needed. From this folder:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publishing to GitHub Pages

Copy everything in this folder into your existing repo (root, or a `/docs` folder if that's how the repo is configured), commit, and push. If Pages is already enabled on that repo it'll pick it up automatically.
