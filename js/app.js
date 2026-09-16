// Shared data loader + renderers for the curated Marvel timeline site.
// All content lives in data/characters.json — edit that file to add
// characters, variants, timeline events, and stories. No build step needed.

const OVERLAY_SRC = "assets/overlay/shield-badge.png";

async function loadData() {
  const res = await fetch("data/characters.json");
  if (!res.ok) throw new Error("Could not load data/characters.json");
  return res.json();
}

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

// Returns the character's primary (hero-form) variant: primaryVariantId if
// set, else the first variant flagged isHeroForm, else just the first one.
function primaryVariant(c) {
  const variants = c.variants || [];
  if (c.primaryVariantId) {
    const match = variants.find((v) => v.id === c.primaryVariantId);
    if (match) return match;
  }
  const hero = variants.find((v) => v.isHeroForm);
  return hero || variants[0] || null;
}

// A portrait figure with the frame overlay stacked on top. Falls back to a
// placeholder well when no art exists yet for this character/variant.
function photoMarkup(imgSrc, alt) {
  const photo = imgSrc
    ? `<img class="portrait-img" src="${imgSrc}" alt="${alt}" loading="lazy" />`
    : `<div class="no-art"><span>No Art Yet</span></div>`;
  return `
    ${photo}
    <img class="overlay-frame" src="${OVERLAY_SRC}" alt="" aria-hidden="true" />
  `;
}

// Hero identity is primary (large, red, on top); civilian/real name is
// secondary underneath. Skipped when the two are the same (e.g. Ultron).
function nameBlockMarkup(c, heroClass, realClass) {
  const hero = c.codename || c.name;
  const showReal = c.name && c.name !== c.codename;
  return `
    <div class="${heroClass}">${hero}</div>
    ${showReal ? `<div class="${realClass}">${c.name}</div>` : ""}
  `;
}

// ---------- Nav ----------

function renderNav(activePage) {
  const mount = document.getElementById("site-nav");
  if (!mount) return;
  const tabs = [
    { key: "characters", label: "Characters", href: "index.html" },
    { key: "timeline", label: "Timeline", href: "timeline.html" },
    { key: "stories", label: "Stories", href: "stories.html" },
  ];
  mount.innerHTML = `
    <div class="site-nav-inner">
      <a class="brand" href="index.html">Marvel Universe: Concise Continuity</a>
      <div class="tabs">
        ${tabs
          .map(
            (t) =>
              `<a href="${t.href}" class="${t.key === activePage ? "active" : ""}">${t.label}</a>`
          )
          .join("")}
      </div>
    </div>
  `;
}

// ---------- Characters (roster) page ----------

async function renderCharacterGridPage() {
  const data = await loadData();
  const grid = document.getElementById("character-grid");
  if (!grid) return;
  grid.innerHTML = "";
  data.characters.forEach((c) => {
    const hero = primaryVariant(c);
    const card = el("a", "character-card");
    card.href = `character.html?id=${encodeURIComponent(c.id)}`;
    card.innerHTML = `
      <div class="card-photo">
        ${photoMarkup(hero ? hero.image : "", c.name)}
      </div>
      <div class="card-body">
        ${nameBlockMarkup(c, "hero-name", "real-name")}
        <div class="status-tag">${c.status || "Unknown"}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ---------- Horizontal timeline (used by timeline.html and character.html) ----------

// Groups events into one stop per year (or per raw date string, if it isn't
// year-like) so the timeline only ever shows one point per year, with every
// event that happened that year stacked inside its card.
function groupEventsByYear(events) {
  const yearOf = (d) => {
    const m = String(d).match(/^-?\d{3,4}/);
    return m ? m[0] : String(d);
  };
  const groups = [];
  const byYear = new Map();
  events.forEach((e) => {
    const y = yearOf(e.date);
    if (!byYear.has(y)) {
      const group = { year: y, events: [] };
      byYear.set(y, group);
      groups.push(group);
    }
    byYear.get(y).events.push(e);
  });
  return groups;
}

function buildTimelineTrack(mountEl, events) {
  mountEl.innerHTML = "";
  if (events.length === 0) {
    mountEl.appendChild(el("div", "empty-state", "No timeline events yet."));
    return;
  }
  const scroll = el("div", "timeline-scroll");
  const track = el("div", "timeline-track");
  const groups = groupEventsByYear(events);
  groups.forEach((group) => {
    const stop = el("div", "timeline-stop");
    const entriesHtml = group.events
      .map((e) => {
        const whoLink = e.characterId
          ? `<a class="who" href="character.html?id=${encodeURIComponent(e.characterId)}">${e.characterName || ""}</a>`
          : "";
        return `
          <div class="stop-entry">
            ${whoLink}
            <div class="title">${e.title}</div>
            <div class="summary${e.summary && e.summary.startsWith("PLACEHOLDER") ? " placeholder" : ""}">${e.summary || ""}</div>
          </div>
        `;
      })
      .join('<hr class="stop-divider" />');
    stop.innerHTML = `
      <div class="date">${group.year}</div>
      <div class="dot"></div>
      <div class="card">
        ${entriesHtml}
      </div>
    `;
    track.appendChild(stop);
  });
  scroll.appendChild(track);
  mountEl.appendChild(scroll);
}

async function renderTimelinePage() {
  const data = await loadData();
  const events = [];
  data.characters.forEach((c) => {
    (c.timelineEvents || []).forEach((e) => {
      events.push({ ...e, characterName: c.name, characterId: c.id });
    });
  });
  events.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const mount = document.getElementById("timeline");
  if (mount) buildTimelineTrack(mount, events);
}

// ---------- Stories page ----------

async function renderStoriesPage() {
  const data = await loadData();
  const mount = document.getElementById("stories-list");
  if (!mount) return;
  const stories = data.stories || [];
  mount.innerHTML = "";
  if (stories.length === 0) {
    mount.appendChild(
      el(
        "div",
        "empty-state",
        "No curated stories yet. Add entries to the <code>stories</code> array in data/characters.json — each with an id, title, date, involved characterIds, and a summary."
      )
    );
    return;
  }
  stories
    .slice()
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .forEach((s) => {
      const card = el("div", "story-card");
      const names = (s.characterIds || [])
        .map((id) => {
          const c = data.characters.find((x) => x.id === id);
          return c ? c.name : id;
        })
        .join(" · ");
      card.innerHTML = `
        <div class="story-title">${s.title}</div>
        <div class="story-meta">${s.date || ""}${names ? " — " + names : ""}</div>
        <div class="story-summary">${s.summary || ""}</div>
      `;
      mount.appendChild(card);
    });
}

// ---------- Character detail page ----------

async function renderCharacter() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const data = await loadData();
  const c = data.characters.find((x) => x.id === id);

  const root = document.getElementById("character-root");
  if (!root) return;

  if (!c) {
    root.innerHTML = `<p class="empty-state">Character not found.</p>`;
    return;
  }

  document.title = `${c.name} — ${data.universe.name}`;

  const hero = primaryVariant(c);
  const tags = (c.affiliations || []).map((a) => `<span class="tag">${a}</span>`).join("");

  root.innerHTML = `
    <div class="char-header">
      <div class="portrait-frame">
        ${photoMarkup(hero ? hero.image : "", c.name)}
      </div>
      <div class="meta">
        ${nameBlockMarkup(c, "hero-name", "real-name")}
        <div class="tags">${tags}<span class="tag">${c.status || "Unknown status"}</span></div>
        <p class="bio">${c.bioShort || ""}</p>
      </div>
    </div>

    <div class="section-title">Curated History</div>
    <p class="bio${c.bioLong && c.bioLong.startsWith("PLACEHOLDER") ? " placeholder" : ""}">${c.bioLong || ""}</p>

    <div class="section-title">Appearances / Eras</div>
    <div class="variant-grid" id="variant-grid"></div>

    <div class="section-title">Timeline</div>
    <div class="timeline" id="char-timeline"></div>
  `;

  const variantGrid = document.getElementById("variant-grid");
  // Hero forms first (primary), alter-ego / civilian forms after and visually secondary.
  const variants = (c.variants || []).slice().sort((a, b) => {
    const ah = a.isHeroForm ? 0 : 1;
    const bh = b.isHeroForm ? 0 : 1;
    return ah - bh;
  });
  if (variants.length === 0) {
    variantGrid.appendChild(el("div", "empty-state", "No art yet — drop images into assets/characters/" + c.id + "/ and add them to this character's variants[] in data/characters.json."));
  }
  variants.forEach((v) => {
    const isAlterEgo = v.isHeroForm === false;
    const card = el("div", "variant-card");
    card.innerHTML = `
      <div class="variant-photo">
        ${photoMarkup(v.image, v.label)}
      </div>
      <div class="variant-body">
        <div class="label">${v.label}</div>
        <div class="role-tag">${isAlterEgo ? "Alternate Form" : "Hero Form"}</div>
        <div class="year">${v.yearIntroduced || ""}</div>
        <div class="desc${v.description && v.description.startsWith("PLACEHOLDER") ? " placeholder" : ""}">${v.description || ""}</div>
      </div>
    `;
    variantGrid.appendChild(card);
  });

  const timelineEl = document.getElementById("char-timeline");
  const events = (c.timelineEvents || []).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
  buildTimelineTrack(timelineEl, events);
}
