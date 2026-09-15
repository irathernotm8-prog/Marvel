// Shared data loader for the curated Marvel timeline site.
// All content lives in data/characters.json — edit that file to add
// characters, variants, bios, and timeline events. No build step needed.

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

// ---------- Home page: character grid + combined timeline ----------

async function renderHome() {
  const data = await loadData();
  renderCharacterGrid(data.characters);
  renderCombinedTimeline(data.characters);
}

function renderCharacterGrid(characters) {
  const grid = document.getElementById("character-grid");
  if (!grid) return;
  grid.innerHTML = "";
  characters.forEach((c) => {
    const card = el("a", "character-card");
    card.href = `character.html?id=${encodeURIComponent(c.id)}`;
    card.innerHTML = `
      <img src="${c.portrait}" alt="${c.name}" loading="lazy" />
      <div class="card-body">
        <div class="name">${c.name}</div>
        <div class="codename">${c.codename || ""}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderCombinedTimeline(characters) {
  const container = document.getElementById("timeline");
  if (!container) return;

  // Flatten every character's timeline events into one chronological feed.
  const events = [];
  characters.forEach((c) => {
    (c.timelineEvents || []).forEach((e) => {
      events.push({ ...e, characterName: c.name, characterId: c.id });
    });
  });

  events.sort((a, b) => String(a.date).localeCompare(String(b.date)));

  container.innerHTML = "";
  if (events.length === 0) {
    container.appendChild(el("div", "empty-state", "No timeline events yet."));
    return;
  }

  events.forEach((e) => {
    const item = el("div", "timeline-item");
    item.innerHTML = `
      <div class="date">${e.date}</div>
      <div class="title">${e.title}</div>
      <div class="who"><a href="character.html?id=${encodeURIComponent(e.characterId)}" style="color:inherit;text-decoration:none;">${e.characterName}</a></div>
      <div class="summary${e.summary && e.summary.startsWith("PLACEHOLDER") ? " placeholder" : ""}">${e.summary || ""}</div>
    `;
    container.appendChild(item);
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

  const tags = (c.affiliations || []).map((a) => `<span class="tag">${a}</span>`).join("");

  root.innerHTML = `
    <div class="char-header">
      <img class="portrait" src="${c.portrait}" alt="${c.name}" />
      <div class="meta">
        <h1>${c.name}</h1>
        <div class="codename">${c.codename || ""}</div>
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
  (c.variants || []).forEach((v) => {
    const card = el("div", "variant-card");
    card.innerHTML = `
      <img src="${v.image}" alt="${v.label}" loading="lazy" />
      <div class="variant-body">
        <div class="label">${v.label}</div>
        <div class="year">${v.yearIntroduced || ""}</div>
        <div class="desc${v.description && v.description.startsWith("PLACEHOLDER") ? " placeholder" : ""}">${v.description || ""}</div>
      </div>
    `;
    variantGrid.appendChild(card);
  });

  const timelineEl = document.getElementById("char-timeline");
  const events = (c.timelineEvents || []).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
  if (events.length === 0) {
    timelineEl.appendChild(el("div", "empty-state", "No timeline events yet."));
  }
  events.forEach((e) => {
    const item = el("div", "timeline-item");
    item.innerHTML = `
      <div class="date">${e.date}</div>
      <div class="title">${e.title}</div>
      <div class="summary${e.summary && e.summary.startsWith("PLACEHOLDER") ? " placeholder" : ""}">${e.summary || ""}</div>
    `;
    timelineEl.appendChild(item);
  });
}
