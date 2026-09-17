// Shared data loader + renderers for the curated Marvel wiki/timeline site.
// All content lives in data/characters.json — edit that file to add
// characters, looks, milestones, and stories. No build step needed.

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

// The character's main look — currently always the first (and usually only)
// entry in looks[]. Kept as an array/function pair so more looks can be
// added later under "Appearances" without changing how callers get the
// primary image.
function primaryLook(c) {
  const looks = c.looks || [];
  return looks[0] || null;
}

// A portrait figure with the frame overlay stacked on top. Falls back to a
// placeholder well when no art exists yet. Pass zoomable:true to add a
// magnifying-glass button that opens the image in a lightbox.
function photoMarkup(imgSrc, alt, zoomable) {
  const photo = imgSrc
    ? `<img class="portrait-img" src="${imgSrc}" alt="${alt}" loading="lazy" />`
    : `<div class="no-art"><span>No Art Yet</span></div>`;
  const zoomBtn =
    zoomable && imgSrc
      ? `<button type="button" class="zoom-btn" aria-label="Enlarge image" onclick="openLightbox('${imgSrc}', '${alt.replace(/'/g, "\\'")}')">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/><line x1="11" y1="8" x2="11" y2="14"/></svg>
        </button>`
      : "";
  return `
    ${photo}
    <img class="overlay-frame" src="${OVERLAY_SRC}" alt="" aria-hidden="true" />
    ${zoomBtn}
  `;
}

// ---------- Lightbox ----------

function ensureLightbox() {
  let lb = document.getElementById("lightbox");
  if (lb) return lb;
  lb = el("div", "lightbox");
  lb.id = "lightbox";
  lb.innerHTML = `
    <button type="button" class="lightbox-close" aria-label="Close" onclick="closeLightbox()">&times;</button>
    <img id="lightbox-img" src="" alt="" />
  `;
  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
  document.body.appendChild(lb);
  return lb;
}

function openLightbox(src, alt) {
  const lb = ensureLightbox();
  const img = document.getElementById("lightbox-img");
  img.src = src;
  img.alt = alt || "";
  lb.classList.add("open");
}

function closeLightbox() {
  const lb = document.getElementById("lightbox");
  if (lb) lb.classList.remove("open");
}

// Hero identity is primary (large, red, on top); real name is secondary
// underneath. Skipped when the two are the same (e.g. Ultron).
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
      <a class="brand" href="index.html">Marvel: Your Universe</a>
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
  data.characters
    .slice()
    .sort((a, b) => (a.codename || a.name).localeCompare(b.codename || b.name))
    .forEach((c) => {
      const look = primaryLook(c);
      const card = el("a", "character-card");
      card.href = `character.html?id=${encodeURIComponent(c.id)}`;
      const teams = (c.teams || []).slice(0, 2).join(" · ");
      card.innerHTML = `
      <div class="card-photo">
        ${photoMarkup(look ? look.image : "", c.name)}
      </div>
      <div class="card-body">
        ${nameBlockMarkup(c, "hero-name", "real-name")}
        ${teams ? `<div class="teams-line">${teams}</div>` : ""}
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

function buildTimelineTrack(mountEl, events, data) {
  mountEl.innerHTML = "";
  if (events.length === 0) {
    mountEl.appendChild(el("div", "empty-state", "No milestones yet."));
    return;
  }
  const scroll = el("div", "timeline-scroll");
  const track = el("div", "timeline-track");
  const groups = groupEventsByYear(events);
  groups.forEach((group) => {
    const stop = el("div", "timeline-stop");
    const entriesHtml = group.events
      .map((e) => {
        const who = (e.characterIds || [])
          .map((id) => {
            const c = data.characters.find((x) => x.id === id);
            if (!c) return "";
            return `<a class="who" href="character.html?id=${encodeURIComponent(id)}">${c.codename || c.name}</a>`;
          })
          .join("");
        return `
          <div class="stop-entry">
            <div class="title">${e.title}</div>
            ${who ? `<div class="who-line">${who}</div>` : ""}
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
  const events = (data.milestones || []).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const mount = document.getElementById("timeline");
  if (mount) buildTimelineTrack(mount, events, data);
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
          return c ? c.codename || c.name : id;
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

  document.title = `${c.codename || c.name} — ${data.universe.name}`;

  const look = primaryLook(c);
  const teamTags = (c.teams || []).map((a) => `<span class="tag">${a}</span>`).join("");
  const aliasLine =
    (c.aliases || []).length > 0
      ? `<div class="alias-line"><span class="alias-label">Also known as</span> ${c.aliases.join(", ")}</div>`
      : "";

  const linked = (c.linkedIdentities || [])
    .map((lid) => {
      const target = data.characters.find((x) => x.id === lid);
      if (!target) return "";
      return `<a class="identity-chip" href="character.html?id=${encodeURIComponent(lid)}">${target.codename || target.name}</a>`;
    })
    .join("");

  root.innerHTML = `
    <div class="char-header">
      <div class="portrait-frame">
        ${photoMarkup(look ? look.image : "", c.codename || c.name, true)}
      </div>
      <div class="meta">
        ${nameBlockMarkup(c, "hero-name", "real-name")}
        ${aliasLine}
        <div class="tags">${teamTags}</div>
        ${linked ? `<div class="identity-links"><span class="identity-label">Same person</span> ${linked}</div>` : ""}
        <p class="bio">${c.bioShort || ""}</p>
      </div>
    </div>

    <div class="section-title">Profile</div>
    <p class="bio${c.bioLong && c.bioLong.startsWith("PLACEHOLDER") ? " placeholder" : ""}">${c.bioLong || ""}</p>

    <div class="section-title">Appearances</div>
    <div class="variant-grid" id="variant-grid"></div>
  `;

  const variantGrid = document.getElementById("variant-grid");
  const looks = c.looks || [];
  if (looks.length === 0) {
    variantGrid.appendChild(
      el(
        "div",
        "empty-state",
        "No art yet — drop an image into assets/characters/" + c.id + "/ and add it to this character's looks[] in data/characters.json."
      )
    );
  }
  looks.forEach((v) => {
    const card = el("div", "variant-card");
    card.innerHTML = `
      <div class="variant-photo">
        ${photoMarkup(v.image, v.label || c.codename || c.name, true)}
      </div>
      <div class="variant-body">
        <div class="label">${v.label || "Main Look"}</div>
        ${v.description ? `<div class="desc${v.description.startsWith("PLACEHOLDER") ? " placeholder" : ""}">${v.description}</div>` : ""}
      </div>
    `;
    variantGrid.appendChild(card);
  });
}
