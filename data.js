// ============================================================
//  🌸 MILOU'S WERELD — DATA.JS
//  Dit bestand bevat alles wat je regelmatig wilt bijwerken.
//  Je hoeft de grote index.html NIET meer aan te passen!
//
//  HOE BIJWERKEN?
//  1. Ga naar GitHub → klik op data.js → klik het potloodje ✏️
//  2. Pas de gegevens aan
//  3. Klik "Commit changes" — klaar! De app werkt meteen bij.
// ============================================================


// ────────────────────────────────────────────────────────────
//  🎮 ROBLOX PROMO CODES
//  Bijwerken als codes verlopen of nieuwe beschikbaar zijn.
//  Zet actief: false als een code niet meer werkt.
//  Inwisselen op: roblox.com/promocodes
// ────────────────────────────────────────────────────────────
const PROMO_CODES = [
  { code: 'SPIDERCOLA',     reward: '🕷️ Spider Cola item',         actief: true  },
  { code: 'TWEETROBLOX',    reward: '🐦 Gratis Tweet item',         actief: true  },
  { code: 'AMAZONFRIEND22', reward: '🤝 Amazon Friend avatar item', actief: true  },
  { code: 'ROBLOXEDU2021',  reward: '🎓 Educatie item',             actief: false },
  // ➕ Voeg hier nieuwe codes toe:
  // { code: 'NIEUWECODE', reward: '🎁 Omschrijving', actief: true },
];


// ────────────────────────────────────────────────────────────
//  🌟 ROBLOX EVENTS & UPDATES
//  Bijwerken als er nieuwe events zijn.
//  badge opties: 'actief' | 'nieuw' | 'binnenkort' | 'verlopen'
// ────────────────────────────────────────────────────────────
const ROBLOX_EVENTS = [
  {
    emoji: '🌸',
    naam: 'Egg Hunt 2025',
    info: 'Verzamel paaseieren door heel Roblox — gratis prijzen!',
    badge: 'actief',
  },
  {
    emoji: '🎨',
    naam: 'Dress to Impress update',
    info: 'Nieuwe kleding en accessories toegevoegd — check de game!',
    badge: 'nieuw',
  },
  {
    emoji: '🌲',
    naam: '99 Nights update',
    info: 'Nieuwe wapens en kaarten toegevoegd in de laatste update!',
    badge: 'nieuw',
  },
  {
    emoji: '🏠',
    naam: 'Brookhaven 🌸 Kersenbloesem update',
    info: 'Nieuw: kersenbloesem estate, schooldecoraties en nieuwe props!',
    badge: 'actief',
  },
  {
    emoji: '🌟',
    naam: 'Roblox Birthday Event',
    info: 'Elk jaar in september — gratis items voor iedereen!',
    badge: 'binnenkort',
  },
  // ➕ Voeg hier nieuwe events toe:
  // { emoji: '🎃', naam: 'Halloween Event', info: 'Spookachtige items!', badge: 'binnenkort' },
];


// ────────────────────────────────────────────────────────────
//  👗 Y2K OUTFIT CODES — BROOKHAVEN
//  Tik de code in bij Brookhaven → Avatar → Shirt/Pants ID
//  Zet actief: false als een code niet meer werkt.
// ────────────────────────────────────────────────────────────
const Y2K_CODES = [
  { code: '6969788928', omschrijving: '👗 Y2K crop top roze',        actief: true },
  { code: '7082803949', omschrijving: '👖 Y2K baggy jeans blauw',    actief: true },
  { code: '6256525985', omschrijving: '✨ Y2K glitter shirt zilver',  actief: true },
  { code: '5627819740', omschrijving: '🎀 Y2K butterfly top',         actief: true },
  { code: '7085704912', omschrijving: '🖤 Y2K zwart wit outfit',      actief: true },
  // ➕ Voeg hier nieuwe Y2K codes toe:
  // { code: '1234567890', omschrijving: '💫 Nieuwe Y2K outfit', actief: true },
];


// ────────────────────────────────────────────────────────────
//  💌 POSITIEVE BERICHTEN (rust-pagina)
//  Voeg gerust nieuwe toe! Milou ziet ze willekeurig.
// ────────────────────────────────────────────────────────────
const BERICHTEN = [
  { tekst: "Jij bent moediger dan je denkt, sterker dan je voelt, en slimmer dan je gelooft.", sub: "En dat is echt zo 💚" },
  { tekst: "Het is oké om soms niet lekker in je vel te zitten. Dat hoort bij het leven.", sub: "Je hoeft niet altijd sterk te zijn 🌸" },
  { tekst: "Je mag fouten maken. Zo leer je. Fouten zijn geen mislukkingen.", sub: "Ze zijn gewoon stappen 🌱" },
  { tekst: "Jouw creativiteit is een gave. Blijf tekenen, bakken en zingen!", sub: "De wereld heeft jou nodig 🎨" },
  { tekst: "Zorgen voelen groot, maar ze gaan ook weer weg. Altijd.", sub: "En er zijn mensen die van je houden 💕" },
  { tekst: "Jij doet het heel goed. Echt.", sub: "Vergeet dat niet 🌟" },
  { tekst: "Elke dag naar school gaan is dapper. Zeker als het moeilijk voelt.", sub: "Trots op je 💪" },
  { tekst: "Als je rustdag nodig hebt, neem die dan. Rust is geen zwakte.", sub: "Donderdag is er voor jou 🌿" },
  { tekst: "Je bent lief, grappig en slim. Vergeet dat nooit.", sub: "Mama en papa zijn zo trots op je! 💕" },
  { tekst: "Ademen helpt. Probeer het maar.", sub: "In... en uit... alles komt goed 🌬️" },
  // ➕ Voeg hier nieuwe berichtjes toe:
  // { tekst: "Jouw bericht hier.", sub: "Ondertitel hier 🌸" },
];


// ────────────────────────────────────────────────────────────
//  ✨ HOME QUOTES (dagelijkse quote op de startpagina)
//  Er wordt automatisch één per dag getoond.
// ────────────────────────────────────────────────────────────
const DAGQUOTES = [
  "Jij bent een ster — zelfs als je dat zelf niet voelt. 🌟",
  "Vandaag is een nieuwe dag vol mogelijkheden! 🌸",
  "Je mag zijn wie je bent. Dat is meer dan genoeg. 💕",
  "Kleine stappen tellen ook. Trots op jou! 🌱",
  "Jouw lach maakt de wereld mooier. 😊",
  "Doe vandaag iets wat je blij maakt. 🎨",
  "Fouten zijn bewijs dat je het hebt geprobeerd. 💪",
  "Jij bent sterker dan je denkt. Echt! 🦋",
  "BLACKPINK in your area en jij ook! 🖤💗",
  "Elke dag is een kans om iets leuks te ontdekken. ✨",
  "Rustig ademen. Jij redt het. 💚",
  "Vandaag ga jij er helemaal voor! 🎵",
  "Je hoeft niet perfect te zijn. Je bent al geweldig. 🌈",
  "Koken, tekenen, zingen — jij kunt alles! 🍳🎨🎤",
  // ➕ Voeg hier nieuwe quotes toe:
  // "Nieuwe quote hier. 🌸",
];


// ════════════════════════════════════════════════════════════
//  ⚙️  RENDER-FUNCTIES — NIET AANPASSEN
//  Deze stukken zorgen dat de data op de juiste plek verschijnt.
// ════════════════════════════════════════════════════════════

function renderPromoCode(c, container) {
  const div = document.createElement('div');
  div.className = 'promo-item' + (c.actief ? '' : ' promo-verlopen');
  div.innerHTML = `
    <div style="flex:1">
      <div class="promo-code">${c.code}</div>
      <div class="promo-reward">${c.reward || c.omschrijving}</div>
    </div>
    <span class="promo-copy">${c.actief ? '📋 Kopieer' : '❌ Verlopen'}</span>
  `;
  if (c.actief) {
    div.onclick = () => {
      navigator.clipboard.writeText(c.code).catch(() => {});
      div.querySelector('.promo-copy').textContent = '✅ Gekopieerd!';
      setTimeout(() => div.querySelector('.promo-copy').textContent = '📋 Kopieer', 2000);
    };
  }
  container.appendChild(div);
}

const BADGE_KLASSEN = {
  actief:     'badge-actief',
  nieuw:      'badge-nieuw',
  binnenkort: 'badge-binnenkort',
  verlopen:   '',
};

function renderEvent(e, container) {
  const div = document.createElement('div');
  div.className = 'event-item';
  const badgeClass = BADGE_KLASSEN[e.badge] || '';
  div.innerHTML = `
    <div class="event-emoji">${e.emoji}</div>
    <div style="flex:1">
      <div class="event-naam">${e.naam}</div>
      <div class="event-info">${e.info}</div>
    </div>
    ${badgeClass ? `<span class="event-badge ${badgeClass}">${e.badge}</span>` : ''}
  `;
  container.appendChild(div);
}

// Initialiseer alle secties zodra de pagina klaar is
document.addEventListener('DOMContentLoaded', () => {

  // Promo codes
  const promoEl = document.getElementById('promoCodes');
  if (promoEl) PROMO_CODES.forEach(c => renderPromoCode(c, promoEl));

  // Y2K codes
  const y2kEl = document.getElementById('y2kCodes');
  if (y2kEl) Y2K_CODES.forEach(c => renderPromoCode(c, y2kEl));

  // Events
  const eventsEl = document.getElementById('robloxEvents');
  if (eventsEl) ROBLOX_EVENTS.forEach(e => renderEvent(e, eventsEl));

  // Positieve berichten (rust-pagina)
  if (typeof nieuwBericht === 'function') nieuwBericht();

  // Home dagquote
  const quoteEl = document.getElementById('dagquote');
  if (quoteEl) {
    const dagNr = new Date().getDay();
    quoteEl.textContent = DAGQUOTES[dagNr % DAGQUOTES.length];
  }
});
