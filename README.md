# Marvel: Your Universe

A curated, fixed-timeline Marvel site. Real-world present day = in-universe present day. No build step — static HTML/CSS/JS reading from one JSON file, same pattern as your other GitHub Pages sites.

**Canonicity rule:** everything in `data/characters.json` — every character, every costume/variant, every milestone — is treated as something that actually happened in this universe. Nothing here is a hypothetical to choose between. The only way something leaves is an explicit retcon; otherwise this file only ever grows.

**Format:** this is a wiki/S.H.I.E.L.D.-file-style character index first. Every character gets a baseline bio (identity, aliases, teams, one main portrait) whether or not a story has been written for them yet. Stories get layered in later, character by character.

## Structure

```
index.html              Characters tab — roster grid (site landing page)
timeline.html            Timeline tab — horizontal, big-moments-only chronological timeline
stories.html             Stories tab — curated arcs (empty until you add some)
character.html           Single character file page (?id=tony-stark)
css/style.css            All styling — Marvel red / black / white
js/app.js                Reads data/characters.json and renders every page + the shared nav
data/characters.json     ALL content lives here — characters, bios, looks, milestones, stories
assets/characters/<id>/  Character art, one subfolder per character (currently just main.jpg)
assets/overlay/shield-badge.png  Small S.H.I.E.L.D. badge watermark, stacked on every portrait
```

Nav is shared: every page has `<header class="site-nav" id="site-nav"></header>`, and `renderNav("characters"|"timeline"|"stories")` fills it in and highlights the active tab. The nav brand reads "Marvel: Your Universe".

## Adding or editing a character

Everything is in `data/characters.json`. Each character object:

- `id` — url-safe slug, matches the folder in `assets/characters/`
- `name` — the person's real/civilian name (e.g. "Tony Stark")
- `codename` — the hero/villain identity (e.g. "Iron Man"). Shown large and red on top, everywhere — roster cards and the file header. `name` shows smaller underneath. If the two are identical, only one line is shown.
- `aliases[]` — other names/handles this identity has gone by. Shown as an "Also known as" line.
- `teams[]` — affiliations (Avengers, X-Men, S.H.I.E.L.D., Oscorp, etc.). Shown as tag chips on the file page, and the first two show under the codename on roster cards.
- `linkedIdentities[]` — ids of OTHER character entries that are the same real person under a different costumed identity. For example Norman Osborn, Green Goblin, and Iron Patriot are three separate entries, each linking to the other two via `linkedIdentities`, rendered as clickable "Same person" chips. Keep these symmetric (if A links to B, B should link back to A).
- `bioShort` — one or two sentences, shown at the top of the file page
- `bioLong` — the curated profile paragraph(s). This is where you decide what counts as canon.
- `looks[]` — currently kept to **one main look per character** (an array so alternate looks can be added later without a schema change). Each look has an `id`, `label` (e.g. "Main Look"), and `image` path. A character with `"looks": []` (no art yet) is completely fine — the roster card, file header, and appearances section all fall back to a "No Art Yet" placeholder automatically. Add art later by dropping an image into `assets/characters/<id>/` and adding a look entry; nothing else needs to change.
- No `status`/active/hero-or-villain field — deliberately omitted. This is a file index, not a scoreboard.

Any field still reading `PLACEHOLDER...` renders dimmed/italic so you can spot what's unwritten as you browse.

## The timeline

`data/characters.json` has a top-level `milestones[]` array — this is the ONLY thing that drives the Timeline tab. Individual characters no longer carry their own timeline events. Only big, universe-level moments belong here: team foundings, origin events, and (later) major story beats — not every character's personal history.

Each milestone:

```json
{
  "id": "avengers-assemble",
  "date": "2011",
  "title": "The Avengers Assemble",
  "description": "...",
  "characterIds": ["tony-stark", "steve-rogers", "..."]
}
```

`characterIds` can list as many characters as were involved — they all render as linked chips under the milestone title. `date` can be a year ("2011") or a more specific string — sorting is lexicographic, so keep the format consistent. The timeline groups milestones by year, so if two milestones share a year (e.g. Spider-Man's origin and the Fantastic Four's origin both in 2016) they stack under one point on the timeline instead of spreading out.

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

They'll render on the Stories tab automatically, newest last (sorted by `date`). Nothing here yet — the plan is to build these out character by character, starting with Spider-Man's corner.

## Adding art

Drop a new image into `assets/characters/<id>/` and reference it by relative path from the site root in a `looks[]` entry. Portraits are shown uncropped (`object-fit: contain`) at a 2:3 frame — keep new art close to that ratio for consistent framing. Every photo well (roster cards, file header, appearances section) automatically gets a bottom vignette, a thin red top accent, and the `assets/overlay/shield-badge.png` watermark in the corner, via CSS + `js/app.js`'s `photoMarkup()` — swap that PNG for a different mark anytime without touching code, or restyle the frame itself in `style.css` under "Portrait overlay treatment."

Every portrait (roster cards, file header, appearances grid) also gets a small magnifying-glass button in the corner. Clicking it opens the full image in a lightbox overlay (`#lightbox` in `character.html`/`index.html`, driven by `openLightbox()`/`closeLightbox()` in `js/app.js`) — click the backdrop or the × to close.

**Current policy:** one main art per character. Alternate looks/suits/eras can be added to a character's `looks[]` array later without any code changes — the appearances section already renders as a grid and will just show more cards.

## Chronology logic

`universe.timelineAnchor.currentYear` (2026) is the anchor — real time = story time. Two rules drive the years already in the data:

- **The founding Avengers are well-established.** Iron Man, Captain America, Thor, Hawkeye, Black Widow, Hulk, Ant-Man, and Wasp all debut/found the team around 2009–2011, well over a decade before the current year.
- **Peter Parker and Johnny Storm are both ~26 in the current year** and got their powers as teenagers, so both debut around 2016 — a full Avengers-generation later than Iron Man. The rest of the Fantastic Four (Sue Storm, Reed Richards, Ben Grimm) share that 2016 origin event.

## Spider-Man's corner (first fully curated storyline)

Peter Parker's `bioLong` carries the actual story: bitten at 16 in 2016, tonally closer to the '90s animated series. A meteor crash gives him the black suit (not Secret Wars); he eventually takes it off and it finds a disgruntled Eddie Brock, who bonds with it willingly and becomes Venom. Cletus Kasady later picks up a spawn of that same symbiote and becomes Carnage. Separately, Norman Osborn (already the Green Goblin, later also Iron Patriot) clones Peter in 2019, producing Ben Reilly and Kaine — no Jackal, no life-takeover plot; Ben becomes a brotherly stand-in who fills in for Peter occasionally, Kaine's arc is rougher and unresolved. The rest of the classic rogues gallery (Doc Ock, Vulture, Mysterio, Sandman, Kraven, Rhino, Electro, the Lizard, Chameleon, Shocker) and core supporting cast (MJ, Gwen Stacy, Aunt May, Harry Osborn, J. Jonah Jameson) are all in the roster as baseline entries, most without art yet.

## Linked secret identities

A few characters are the same person as another entry in the roster, under a different costumed identity. Currently: **Norman Osborn** links to **Green Goblin** and **Iron Patriot** (all three are separate entries with their own bios, cross-linked via `linkedIdentities`). Use this pattern for any future character who operates under more than one identity, rather than cramming multiple costumes into one entry.

## Open continuity questions (flagged in the data, worth resolving early)

- **Steve Rogers' origin year.** His WWII / Howling Commandos backstory implies he'd be over 100 today under real-time = story-time. Decide whether that stays as deep backstory or gets reframed.
- **Ant-Man and Wasp have no confirmed civilian identity locked in yet.** Comics have used more than one person under each name (Hank Pym/Scott Lang; Janet/Hope van Dyne) — flagged as a placeholder bio decision.
- **Iron Patriot's origin** (when/why Norman took up that identity instead of/alongside the Goblin) is still a placeholder.
- **Ultron's creator** is still a placeholder — decide who built him in this continuity.
- **Gwen Stacy's arc** is unwritten — the classic comics version is tragic; flag whether that beat happens here.
- **Harry Osborn** — unwritten whether he ever takes up a Goblin identity of his own, given his father already holds it (in two forms).
- **Villains sit in the same roster grid as everyone else** — deliberate, since we no longer tag hero/villain status, but flag if you'd rather split them out later.

To remove anything that gets **ret-conned out** later, just ask — deletion is explicit, never automatic.

## Running locally

No build tools needed. From this folder:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Publishing to GitHub Pages

Copy everything in this folder into your existing repo (root, or a `/docs` folder if that's how the repo is configured), commit, and push. If Pages is already enabled on that repo it'll pick it up automatically.
