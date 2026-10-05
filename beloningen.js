// ════════════════════════════════════════════════════════════
//  🏆 MILOU'S BELONINGEN — gedeeld door index.html, leren.html en taal.html
//  Houdt voortgang bij, controleert de beloningsladder, toont een
//  beloningsbon en stuurt papa automatisch een mailtje.
// ════════════════════════════════════════════════════════════
(function () {
  // ✏️ INSTELLINGEN
  const MAIL_NAAR       = 'frankburrei@gmail.com';
  const EMAILJS_KEY     = 'WTRRhFmease4280Ro';
  const EMAILJS_SERVICE = 'service_po4zbha';
  const EMAILJS_TEMPLATE = 'template_beloning'; // ✏️ ID van de nieuwe EmailJS-template
  const MAIL_BIJ_NIVEAU = true;                  // ook een mailtje als ze een niveau haalt

  const K = {
    sterren: 'milou_leer_sterren',
    voortgang: 'milou_taal_voortgang',
    log: 'milou_oefenlog',
    ladder: 'milou_beloningen',
    bonnen: 'milou_bonnen',
    wachtrij: 'milou_mail_wachtrij',
    dagdoel: 'milou_dagdoel',
    versie: 'milou_ladder_versie',
    taken: 'milou_taken',
    basis: 'milou_taken_basis'
  };
  const ONDERDELEN = { spelling: 'Spelling', lezen: 'Lezen', grammatica: 'Grammatica' };
  // Alles waarvoor een niveau-beloning kan gelden (klokkijken zit in het Leerboek)
  const NAMEN = Object.assign({}, ONDERDELEN, { klokkijken: 'Klokkijken' });
  const AANTAL = { spelling: 10, lezen: 5, grammatica: 8, klokkijken: 5 };

  function lees(k, std) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : std; } catch (e) { return std; } }
  function schrijf(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function vandaag() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function esc(t) { return String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function datumNL(iso) { try { return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return iso; } }

  // ── Sterren ──
  function sterren() { try { return parseInt(localStorage.getItem(K.sterren) || '0', 10) || 0; } catch (e) { return 0; } }

  // ── Voortgang per onderdeel ──
  function voortgang() {
    const v = lees(K.voortgang, {});
    Object.keys(ONDERDELEN).forEach(o => {
      if (!v[o]) v[o] = { start: 1, behaald: [], goed: 0, totaal: 0, fouten: [], instap: false, laatst: null };
    });
    return v;
  }
  function bewaarVoortgang(v) { schrijf(K.voortgang, v); }
  function hoogsteNiveau(o) {
    if (o === 'klokkijken') { const k = lees('milou_klok_niveaus', []).filter(n => n > 0); return k.length ? Math.max.apply(null, k) : 0; }
    const v = voortgang()[o]; if (!v) return 0;
    return v.behaald.length ? Math.max.apply(null, v.behaald) : 0;
  }

  // ════════════════════════════════════════════════════════════
  //  🎁 PAKKETTEN — idee van Milou zelf!
  //  Elke beloning heeft een pakket met taken: altijd een mix van
  //  spelling, grammatica, lezen, rekenen en klokkijken.
  //  Wat ze extra doet, telt meteen mee voor het volgende pakket.
  //  Daarnaast: extra beloningen voor volhouden (oefendagen) en
  //  voor het halen van een niveau.
  // ════════════════════════════════════════════════════════════
  const TAKEN = {
    spelling:   { naam: 'Spelling',    emoji: '✏️', een: 'spellingronde',   meer: 'spellingrondes',   link: 'taal.html?open=spelling' },
    grammatica: { naam: 'Grammatica',  emoji: '🧩', een: 'grammaticaronde', meer: 'grammaticarondes', link: 'taal.html?open=grammatica' },
    lezen:      { naam: 'Lezen',       emoji: '📖', een: 'leesronde',       meer: 'leesrondes',       link: 'taal.html?open=lezen' },
    rekenen:    { naam: 'Rekenen',     emoji: '➕', een: 'som goed',        meer: 'sommen goed',      link: 'leren.html' },
    klok:       { naam: 'Klokkijken',  emoji: '🕐', een: 'klokvraag goed',  meer: 'klokvragen goed',  link: 'leren.html?open=klok' }
  };
  const VOLGORDE = ['spelling', 'grammatica', 'lezen', 'rekenen', 'klok'];
  const MATEN = {
    klein:  { naam: 'Klein',       pakket: { spelling: 1, lezen: 1, rekenen: 10, klok: 5 } },
    middel: { naam: 'Middel',      pakket: { spelling: 2, grammatica: 1, lezen: 1, rekenen: 20, klok: 10 } },
    groot:  { naam: 'Groot',       pakket: { spelling: 3, grammatica: 2, lezen: 2, rekenen: 30, klok: 15 } },
    extra:  { naam: 'Extra groot', pakket: { spelling: 4, grammatica: 3, lezen: 3, rekenen: 40, klok: 20 } }
  };

  function taken() { const t = lees(K.taken, {}); VOLGORDE.forEach(k => { t[k] = t[k] || 0; }); return t; }
  function basis() { const b = lees(K.basis, {}); VOLGORDE.forEach(k => { b[k] = b[k] || 0; }); return b; }
  function telTaak(soort, n) {
    if (!TAKEN[soort]) return;
    const nu = volgende(), voor = nu && nu.b.type === 'pakket' ? pakketStand(nu.b) : null;
    const t = taken(); t[soort] += (n || 1); schrijf(K.taken, t);
    // Klein feestje als een taak in het huidige pakket net af is
    if (voor) {
      const na = pakketStand(nu.b), vr = voor.taken.find(x => x.soort === soort), nr = na.taken.find(x => x.soort === soort);
      if (vr && nr && vr.gedaan < vr.nodig && nr.gedaan >= nr.nodig && !na.klaar) toast('✅ ' + TAKEN[soort].naam + ' is klaar voor je pakket!');
    }
  }

  // ── Oefendagen: een dag telt als ze haar dagdoel aan sterren haalt ──
  const STANDAARD_DAGDOEL = 10;
  function dagdoel() { const d = parseInt(lees(K.dagdoel, STANDAARD_DAGDOEL), 10); return d > 0 ? d : STANDAARD_DAGDOEL; }
  function zetDagdoel(n) { schrijf(K.dagdoel, n); }
  function sleutel(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function vanSleutel(k) { const p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function weekVan(k) { const d = vanSleutel(k); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return sleutel(d); }
  function dagRegel(log, d) {
    if (!log[d]) log[d] = { vragen: 0, goed: 0, sterren: 0, onderdelen: {} };
    if (log[d].sterren == null) log[d].sterren = 0;
    return log[d];
  }
  function logOefening(onderdeel, goed, totaal) {
    const log = lees(K.log, {}), e = dagRegel(log, vandaag());
    e.vragen += totaal || 0; e.goed += goed || 0;
    if (onderdeel) e.onderdelen[onderdeel] = (e.onderdelen[onderdeel] || 0) + (totaal || 0);
    schrijf(K.log, log);
  }
  function logSterren(n) {
    const log = lees(K.log, {}), d = vandaag(), e = dagRegel(log, d);
    e.sterren += n;
    let nieuw = false;
    if (!e.stempel && e.sterren >= dagdoel()) { e.stempel = true; nieuw = true; }
    schrijf(K.log, log);
    if (nieuw) toast('📅 Oefendag binnen! Je hebt er nu ' + oefendagen() + '.');
    return nieuw;
  }
  function oefenDagLijst() { const log = lees(K.log, {}); return Object.keys(log).filter(k => log[k].stempel).sort(); }
  function oefendagen() { return oefenDagLijst().length; }

  function vandaagStatus() {
    const log = lees(K.log, {}), d = vandaag(), e = log[d] || {}, doel = dagdoel();
    const st = e.sterren || 0;
    const maandag = vanSleutel(weekVan(d)), week = [];
    for (let i = 0; i < 7; i++) {
      const dd = new Date(maandag); dd.setDate(maandag.getDate() + i);
      const k = sleutel(dd);
      week.push({ label: ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'][i], aan: !!(log[k] && log[k].stempel), vandaag: k === d, toekomst: k > d });
    }
    const g = new Date(); g.setDate(g.getDate() - 1);
    const gk = sleutel(g);
    const gemist = !(log[gk] && log[gk].stempel) && oefenDagLijst().some(k => k < gk);
    return { sterren: st, doel: doel, rest: Math.max(0, doel - st), gehaald: !!e.stempel, week: week, gemist: gemist, uur: new Date().getHours() };
  }
  function statusTekst(s) {
    s = s || vandaagStatus();
    if (s.gehaald) return '✅ Je oefendag van vandaag is binnen! Alles wat je nu nog doet, telt mee voor je pakket.';
    const klok = s.uur >= 18 ? '⏰ ' : '';
    if (s.sterren === 0 && s.gemist) return klok + '🌸 We hebben je gemist! Zullen we vandaag weer verder gaan met je pakket?';
    if (s.sterren === 0) return klok + 'Verdien vandaag ' + s.doel + ' ⭐ voor een oefendag, en werk aan je pakket!';
    return klok + 'Nog ' + s.rest + ' ⭐ en je oefendag van vandaag is binnen!';
  }

  // ── Beloningsladder ──
  //   'pakket' : beloning voor een pakket met taken (op volgorde)
  //   'dagen'  : extra beloning voor volhouden (aantal oefendagen)
  //   'niveau' : extra beloning voor het halen van een niveau
  const LADDER_VERSIE = 3;
  const PAPA_LADDER = [
    { type: 'pakket', pakket: { spelling: 1, lezen: 1, rekenen: 10, klok: 5 },                          beloning: 'Komkommersushi halen bij de DekaMarkt 🍣' },
    { type: 'pakket', pakket: { spelling: 1, grammatica: 1, rekenen: 15, klok: 5 },                     beloning: 'Een nagellakje uitzoeken bij de Kruidvat 💅' },
    { type: 'pakket', pakket: { spelling: 2, grammatica: 1, lezen: 1, rekenen: 20, klok: 10 },          beloning: 'Iets uitzoeken bij de Action (max. €5) 🛍️' },
    { type: 'pakket', pakket: { spelling: 2, grammatica: 2, lezen: 1, rekenen: 20, klok: 10 },          beloning: 'Clickeez uitzoeken bij de Intertoys 🧩' },
    { type: 'pakket', pakket: { spelling: 3, grammatica: 2, lezen: 2, rekenen: 30, klok: 15 },          beloning: 'Robux voor €11,99 🎮' },
    { type: 'pakket', pakket: { spelling: 4, grammatica: 2, lezen: 2, rekenen: 35, klok: 15 },          beloning: '🏆 Een cadeautje uitzoeken bij de Intertoys (max. €15) 🎁' },
    { type: 'pakket', pakket: { spelling: 4, grammatica: 3, lezen: 3, rekenen: 40, klok: 20 },          beloning: '👑 Shoppen bij de Normal (max. €20) 🛍️💄' },
    { type: 'dagen', drempel: 7,  beloning: 'Jij kiest wat we eten, we halen het samen bij de supermarkt 🛒' },
    { type: 'dagen', drempel: 14, beloning: 'Een ijsje bij Scoops (max. 3 bolletjes) of McDonald\'s 🍦' },
    { type: 'dagen', drempel: 21, beloning: 'Jij kiest wat we bestellen (butter chicken, Sushi Point…) 🥡' },
    { type: 'niveau', onderdeel: 'lezen', drempel: 3, beloning: 'Een nieuw schetsboek ✏️' }
  ];
  function laadPapaLadder(oud) {
    const nu = Date.now();
    const l = PAPA_LADDER.map((b, i) => {
      const n = JSON.parse(JSON.stringify(Object.assign({ id: 'p' + nu + i, bereikt: false }, b)));
      const was = (oud || []).find(o => o.bereikt && o.beloning === b.beloning);
      if (was) { n.bereikt = true; n.datum = was.datum; n.code = was.code; n.vooraf = true; }
      return n;
    });
    schrijf(K.basis, taken());   // vanaf nu telt het werk mee
    bewaarLadder(l);
    schrijf(K.versie, LADDER_VERSIE);
    return l;
  }
  function ladder() {
    let l = lees(K.ladder, null);
    if (!l) return laadPapaLadder();
    if ((lees(K.versie, 1) || 1) < LADDER_VERSIE) {
      const eigen = l.filter(b => !/^p\d/.test(b.id) && ['b1', 'b2', 'b3'].indexOf(b.id) < 0)
        .map(b => (b.type === 'stempels' || b.type === 'oefendagen') ? Object.assign({}, b, { type: 'dagen' }) : b)
        .filter(b => b.type === 'dagen' || b.type === 'niveau' || b.type === 'pakket');
      const nieuw = laadPapaLadder(l).concat(eigen);
      bewaarLadder(nieuw);
      return nieuw;
    }
    return l;
  }
  function bewaarLadder(l) { schrijf(K.ladder, l); }
  function bonnen() { return lees(K.bonnen, []); }
  function isBonus(b) { return b.type !== 'pakket'; }
  function pakketten(l) { return (l || ladder()).filter(b => b.type === 'pakket'); }

  // Hoeveel van het pakket is af? Eerdere (niet vooraf verdiende) pakketten gaan voor.
  function pakketStand(b, l) {
    l = l || ladder();
    const t = taken(), ba = basis(), lijst = pakketten(l).filter(x => !x.vooraf);
    const idx = lijst.findIndex(x => x.id === b.id);
    const eerder = {};
    VOLGORDE.forEach(k => { eerder[k] = 0; });
    for (let i = 0; i < idx; i++) VOLGORDE.forEach(k => { eerder[k] += (lijst[i].pakket[k] || 0); });
    const rij = VOLGORDE.filter(k => b.pakket[k]).map(k => {
      const nodig = b.pakket[k], gedaan = Math.max(0, Math.min(nodig, t[k] - ba[k] - eerder[k]));
      return { soort: k, nodig: nodig, gedaan: gedaan, klaar: gedaan >= nodig };
    });
    const pct = rij.length ? Math.round(rij.reduce((s, x) => s + x.gedaan / x.nodig, 0) / rij.length * 100) : 0;
    return { taken: rij, klaar: b.vooraf || rij.every(x => x.klaar), pct: b.bereikt ? 100 : pct, nogTaken: rij.filter(x => !x.klaar).length };
  }
  // Alles wat ze in totaal nog moet doen tot deze beloning (inclusief pakketten die eerst komen)
  function nogTeDoen(b, l) {
    l = l || ladder();
    if (b.type !== 'pakket' || b.bereikt) return [];
    const t = taken(), ba = basis(), lijst = pakketten(l).filter(x => !x.vooraf);
    const idx = lijst.findIndex(x => x.id === b.id), tot = {};
    VOLGORDE.forEach(k => { tot[k] = 0; });
    for (let i = 0; i <= idx; i++) VOLGORDE.forEach(k => { tot[k] += (lijst[i].pakket[k] || 0); });
    return VOLGORDE.map(k => ({ soort: k, nog: Math.max(0, tot[k] - (t[k] - ba[k])) })).filter(x => x.nog > 0);
  }
  function nogTekst(rest) {
    const delen = rest.map(x => x.nog + ' ' + (x.nog === 1 ? TAKEN[x.soort].een : TAKEN[x.soort].meer));
    return delen.length > 1 ? delen.slice(0, -1).join(', ') + ' en ' + delen[delen.length - 1] : (delen[0] || '');
  }
  function stand(b) {
    if (b.type === 'pakket') return pakketStand(b).pct;
    if (b.type === 'dagen') return oefendagen();
    if (b.type === 'niveau') return hoogsteNiveau(b.onderdeel);
    return 0;
  }
  function gehaald(b) {
    if (b.type === 'pakket') return pakketStand(b).klaar;
    if (b.type === 'dagen') return oefendagen() >= b.drempel;
    if (b.type === 'niveau') return hoogsteNiveau(b.onderdeel) >= b.drempel;
    return false;
  }
  function pakketTekst(p) { return VOLGORDE.filter(k => p[k]).map(k => p[k] + ' ' + (p[k] === 1 ? TAKEN[k].een : TAKEN[k].meer)).join(', '); }
  function omschrijf(b) {
    if (b.type === 'pakket') return 'Pakket af: ' + pakketTekst(b.pakket);
    if (b.type === 'dagen') return b.drempel + ' oefendagen volgehouden';
    if (b.type === 'niveau') return (NAMEN[b.onderdeel] || b.onderdeel) + ' niveau ' + b.drempel + ' gehaald';
    return '';
  }
  function nogNodig(b) {
    if (b.type === 'pakket') { const ps = pakketStand(b); return ps.klaar ? 'pakket af!' : ps.taken.length - ps.nogTaken + ' van de ' + ps.taken.length + ' taken klaar'; }
    if (b.type === 'dagen') { const r = Math.max(0, b.drempel - oefendagen()); return 'nog ' + r + (r === 1 ? ' oefendag' : ' oefendagen'); }
    if (b.type === 'niveau') return 'haal ' + NAMEN[b.onderdeel] + ' niveau ' + b.drempel + ' (nu ' + (hoogsteNiveau(b.onderdeel) || 0) + ')';
    return '';
  }
  function volgende() {
    const l = ladder(), b = pakketten(l).find(x => !x.bereikt);
    if (!b) return null;
    const ps = pakketStand(b, l);
    return { b: b, pct: ps.pct, stand: ps, nog: nogNodig(b) };
  }
  function volgendeDagen() {
    return ladder().filter(b => b.type === 'dagen' && !b.bereikt).sort((a, b) => a.drempel - b.drempel)[0] || null;
  }

  function maakCode() {
    const t = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c = '';
    for (let i = 0; i < 4; i++) c += t[Math.floor(Math.random() * t.length)];
    return 'MW-' + c;
  }

  const rij = []; let rijOpen = false;
  function inRij(fn) { rij.push(fn); if (!rijOpen) volgendeInRij(); }
  function volgendeInRij() { const f = rij.shift(); if (!f) { rijOpen = false; return; } rijOpen = true; f(function () { setTimeout(volgendeInRij, 300); }); }

  function check() {
    const l = ladder();
    const nieuw = [];
    l.forEach(b => {
      if (!b.bereikt && gehaald(b)) { b.bereikt = true; b.datum = new Date().toISOString(); b.code = maakCode(); nieuw.push(b); }
    });
    if (!nieuw.length) return [];
    bewaarLadder(l);
    const bn = bonnen();
    nieuw.forEach(b => bn.unshift({ code: b.code, beloning: b.beloning, mijlpaal: (isBonus(b) ? 'Extra: ' : '') + omschrijf(b), datum: b.datum, ingewisseld: false }));
    schrijf(K.bonnen, bn);
    nieuw.forEach(b => {
      inRij(k => toonBon({ code: b.code, beloning: b.beloning, mijlpaal: (isBonus(b) ? 'Extra: ' : '') + omschrijf(b), datum: b.datum }, false, k));
      mail('🏆 Milou heeft een beloning verdiend!',
        'Milou heeft net dit gehaald: ' + omschrijf(b) + '.\n\n' +
        'Haar beloning: ' + b.beloning + '\n' +
        'Boncode: ' + b.code + '\n\n' + samenvatting());
    });
    return nieuw;
  }

  // ── "Ik wil een nagellakje, wat moet ik doen?" — zoek de beloning bij een vraag ──
  const BELONING_WOORDEN = [
    [/nagellak/, ['nagellak', 'nagellakje', 'nagels', 'kruidvat']],
    [/ijsje|scoops/, ['ijs', 'ijsje', 'ijsjes', 'scoops', 'mcdonalds', 'mac', 'mcflurry']],
    [/komkommersushi/, ['komkommersushi', 'dekamarkt', 'deka']],
    [/robux/, ['robux', 'roblox']],
    [/action/, ['action']],
    [/clickeez/, ['clickeez', 'clickies', 'klickies', 'clickie']],
    [/intertoys/, ['intertoys', 'cadeautje', 'cadeau', 'speelgoed']],
    [/normal/, ['normal', 'shoppen', 'winkelen', 'makeup', 'make up']],
    [/bestellen/, ['bestellen', 'bestel', 'butter', 'chicken', 'afhalen', 'point']],
    [/supermarkt/, ['supermarkt', 'avondeten', 'eten kiezen', 'kiezen wat we eten']],
    [/schetsboek/, ['schetsboek', 'tekenboek', 'schetsboekje']]
  ];
  const STOP = ['een', 'het', 'de', 'bij', 'wat', 'jij', 'kiest', 'we', 'max', 'halen', 'uitzoeken', 'samen', 'voor', 'nieuw', 'nieuwe', 'naar', 'met', 'van'];
  function norm(t) { return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function afstand(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    const d = []; for (let i = 0; i <= a.length; i++) d[i] = [i];
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function zoekBeloning(vraag) {
    const tekst = ' ' + norm(vraag) + ' ', woorden = tekst.trim().split(' ');
    let beste = null, top = 0;
    ladder().forEach(b => {
      const bt = norm(b.beloning);
      let sleutels = bt.split(' ').filter(w => w.length >= 4 && STOP.indexOf(w) < 0);
      BELONING_WOORDEN.forEach(g => { if (g[0].test(bt)) sleutels = sleutels.concat(g[1]); });
      let score = 0;
      sleutels.forEach(k => {
        if (tekst.indexOf(' ' + k + ' ') >= 0 || (k.length >= 6 && tekst.indexOf(k) >= 0)) score += k.length * 2;
        else if (k.length >= 5) woorden.forEach(w => { if (w.length >= 4 && afstand(w, k) <= (k.length >= 8 ? 2 : 1)) score += k.length; });
      });
      if (score > top) { top = score; beste = b; }
    });
    return beste;
  }

  // Klein meldingetje onderin beeld (stoort niet tijdens het oefenen)
  function toast(tekst) {
    stijl();
    const t = document.createElement('div');
    t.className = 'mb-toast'; t.textContent = tekst;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('weg'), 2600);
    setTimeout(() => t.remove(), 3200);
  }

  function samenvatting() {
    const v = voortgang(), t = taken(), nu = new Date();
    const tijd = nu.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    const datum = nu.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
    function nw(aantal, enkel, meer) { return aantal + ' ' + (aantal === 1 ? enkel : meer); }
    const r = ['Stand van zaken (' + datum + ', ' + tijd + '):',
      '📅 ' + nw(oefendagen(), 'oefendag', 'oefendagen') + ' · ⭐ ' + sterren() + ' sterren in totaal',
      '',
      'Wat ze in totaal gedaan heeft:',
      '✏️ ' + nw(t.spelling, 'spellingronde', 'spellingrondes') + ' · 🧩 ' + nw(t.grammatica, 'grammaticaronde', 'grammaticarondes') + ' · 📖 ' + nw(t.lezen, 'leesronde', 'leesrondes'),
      '➕ ' + nw(t.rekenen, 'som goed', 'sommen goed') + ' · 🕐 ' + nw(t.klok, 'klokvraag goed', 'klokvragen goed'),
      ''];
    const nv = volgende();
    if (nv) {
      r.push('🎁 Ze werkt nu aan: ' + nv.b.beloning + ' (' + nv.pct + '% af)');
      const rest = nogTeDoen(nv.b);
      if (rest.length) r.push('   Nog te doen: ' + nogTekst(rest));
      r.push('');
    }
    r.push('Niveaus:');
    Object.keys(ONDERDELEN).forEach(o => {
      const h = hoogsteNiveau(o), pct = v[o].totaal ? Math.round(v[o].goed / v[o].totaal * 100) : 0;
      r.push('• ' + ONDERDELEN[o] + ': ' + (h ? 'niveau ' + h + ' van ' + AANTAL[o] + ' gehaald' : 'nog geen niveau gehaald')
        + (v[o].totaal ? ' (' + pct + '% goed van ' + v[o].totaal + ' vragen)' : ''));
    });
    const hk = hoogsteNiveau('klokkijken');
    r.push('• Klokkijken: ' + (hk ? 'niveau ' + hk + ' van 5 gehaald' : 'nog geen niveau gehaald'));
    return r.join('\n');
  }

  function niveauGehaald(onderdeel, niveau, titel, score) {
    if (MAIL_BIJ_NIVEAU) {
      mail('⭐ Milou haalde ' + NAMEN[onderdeel] + ' niveau ' + niveau,
        'Milou heeft ' + NAMEN[onderdeel] + ' niveau ' + niveau + ' (' + titel + ') gehaald: ' + score + '.\n\n' + samenvatting());
    }
    check();
  }

  // ── Mail via EmailJS (met wachtrij als het even niet lukt) ──
  function laadEmailJS(klaar) {
    if (typeof emailjs !== 'undefined') { try { emailjs.init(EMAILJS_KEY); } catch (e) {} klaar(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.async = true;
    s.onload = function () { try { emailjs.init(EMAILJS_KEY); } catch (e) {} klaar(); };
    s.onerror = function () {};
    document.head.appendChild(s);
  }
  function verstuur(item) {
    return emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
      to_email: MAIL_NAAR, onderwerp: item.onderwerp, bericht: item.bericht, datum: datumNL(item.tijd)
    });
  }
  function mail(onderwerp, bericht) {
    const q = lees(K.wachtrij, []);
    q.push({ onderwerp: onderwerp, bericht: bericht, tijd: new Date().toISOString() });
    schrijf(K.wachtrij, q.slice(-20));
    verwerkWachtrij();
  }
  let bezig = false;
  function verwerkWachtrij(cb) {
    if (bezig) return;
    const q = lees(K.wachtrij, []);
    if (!q.length) { if (cb) cb(true); return; }
    bezig = true;
    laadEmailJS(function () {
      const item = q[0];
      verstuur(item).then(function () {
        const rest = lees(K.wachtrij, []); rest.shift(); schrijf(K.wachtrij, rest);
        bezig = false;
        if (rest.length) verwerkWachtrij(cb); else if (cb) cb(true);
      }).catch(function (err) { bezig = false; console.log('Mail nog niet verstuurd:', err); if (cb) cb(false, err); });
    });
  }
  function testMail(cb) {
    const q = lees(K.wachtrij, []);
    q.push({ onderwerp: '✅ Testmail Milou\'s Wereld', bericht: 'De beloningsmails werken!\n\n' + samenvatting(), tijd: new Date().toISOString() });
    schrijf(K.wachtrij, q);
    verwerkWachtrij(cb);
  }

  // ── Beloningsbon tonen ──
  function stijl() {
    if (document.getElementById('mb-stijl')) return;
    const s = document.createElement('style');
    s.id = 'mb-stijl';
    s.textContent = `
.mb-overlay{position:fixed;inset:0;z-index:9999;background:rgba(58,42,58,.55);display:flex;align-items:center;justify-content:center;padding:20px;animation:mbIn .3s ease}
@keyframes mbIn{from{opacity:0}to{opacity:1}}
.mb-bon{width:100%;max-width:360px;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);font-family:'Nunito',sans-serif;color:#3a2a3a;animation:mbPop .5s cubic-bezier(.2,1.4,.4,1)}
@keyframes mbPop{from{transform:scale(.6) rotate(-6deg)}to{transform:scale(1) rotate(0)}}
.mb-top{background:linear-gradient(135deg,#ff6eb4,#ffb347);color:#fff;text-align:center;padding:22px 18px 26px}
.mb-top .mb-em{font-size:3rem;line-height:1}
.mb-top h2{font-family:'Pacifico',cursive;font-weight:400;font-size:1.5rem;margin-top:6px}
.mb-top p{font-weight:800;font-size:.85rem;opacity:.95;margin-top:2px}
.mb-perf{height:0;border-top:3px dashed #ffd6ec;margin:0 18px;position:relative}
.mb-perf:before,.mb-perf:after{content:'';position:absolute;top:-14px;width:26px;height:26px;border-radius:50%;background:rgba(58,42,58,.55)}
.mb-perf:before{left:-31px}.mb-perf:after{right:-31px}
.mb-mid{padding:20px 22px 8px;text-align:center}
.mb-label{font-size:.75rem;font-weight:800;color:#9a8a9a}
.mb-beloning{font-size:1.35rem;font-weight:900;margin:4px 0 14px;line-height:1.3}
.mb-mijlpaal{font-size:.88rem;font-weight:700;background:#fff4fa;border-radius:12px;padding:8px 10px}
.mb-code{display:flex;justify-content:space-between;align-items:center;padding:14px 22px 20px;font-size:.78rem;color:#9a8a9a;font-weight:700}
.mb-code b{font-size:1rem;color:#3a2a3a;letter-spacing:2px}
.mb-tip{text-align:center;font-size:.8rem;font-weight:700;color:#fff;margin-top:12px}
.mb-knop{display:block;margin:14px auto 0;background:#fff;border:none;border-radius:999px;padding:11px 28px;font-family:'Nunito',sans-serif;font-weight:900;color:#ff6eb4;font-size:.95rem;cursor:pointer}
.mb-wrap{width:100%;max-width:360px}
.mb-confetti{position:fixed;width:9px;height:14px;border-radius:2px;z-index:10000;top:-20px;animation:mbVal linear forwards;pointer-events:none}
@keyframes mbVal{to{transform:translateY(110vh) rotate(720deg)}}
.mb-toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:9998;background:#3a2a3a;color:#fff;font-family:'Nunito',sans-serif;font-weight:800;font-size:.92rem;padding:12px 18px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.25);max-width:90vw;text-align:center;animation:mbToast .35s ease;transition:opacity .5s}
.mb-toast.weg{opacity:0}
@keyframes mbToast{from{transform:translate(-50%,20px);opacity:0}to{transform:translate(-50%,0);opacity:1}}
.mbp-kaart{width:100%;max-width:420px;max-height:88vh;overflow:auto;background:#fff;border-radius:24px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.3);font-family:'Nunito',sans-serif;color:#3a2a3a;animation:mbPop .4s cubic-bezier(.2,1.4,.4,1)}
.mbp-kop{text-align:center;margin-bottom:10px}
.mbp-label{font-size:.78rem;font-weight:800;color:#9a8a9a}
.mbp-titel{font-size:1.25rem;font-weight:900;line-height:1.3;margin-top:2px}
.mbp-info{font-size:.88rem;font-weight:700;background:#fff4fa;border-radius:14px;padding:10px 12px;line-height:1.45;margin-bottom:12px}
.mbp-lijst{display:grid;gap:8px}
.mbp-taak{display:flex;align-items:center;gap:12px;border:2px solid #f3e4ec;border-radius:16px;padding:10px 12px}
.mbp-taak.klaar{background:#effaf0;border-color:#bfe6c3}
.mbp-em{font-size:1.6rem;width:34px;text-align:center}
.mbp-mid{flex:1;min-width:0}
.mbp-naam{font-weight:900;font-size:.95rem}
.mbp-balk{height:8px;background:#ffe3f1;border-radius:8px;overflow:hidden;margin:5px 0 3px}
.mbp-balk>div{height:100%;background:linear-gradient(90deg,#ff6eb4,#ffb347);border-radius:8px}
.mbp-taak.klaar .mbp-balk>div{background:#43a047}
.mbp-stand{font-size:.76rem;font-weight:800;color:#9a8a9a}
.mbp-doe{background:#ff6eb4;color:#fff;text-decoration:none;font-weight:900;font-size:.8rem;border-radius:999px;padding:8px 12px;white-space:nowrap}
.mbp-sluit{background:#ff6eb4;color:#fff}
.mbc{display:block;text-decoration:none;color:#3a2a3a;background:#fff;border-radius:16px;padding:11px 14px;box-shadow:0 2px 12px rgba(200,100,160,.12);border:2px solid #ffd6ec;font-family:'Nunito',sans-serif}
.mbc-boven{display:flex;align-items:center;gap:8px}
.mbc-em{font-size:1.2rem}
.mbc-naam{flex:1;min-width:0;font-weight:900;font-size:.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mbc-pct{font-weight:900;font-size:.8rem;color:#ff6eb4}
.mbc-balk{height:7px;background:#ffe3f1;border-radius:7px;overflow:hidden;margin:7px 0 6px}
.mbc-balk>div{height:100%;background:linear-gradient(90deg,#ff6eb4,#ffb347);border-radius:7px}
.mbc-chips{display:flex;flex-wrap:wrap;gap:4px;align-items:center}
.mbc-chip{background:#fff4fa;border-radius:999px;padding:3px 8px;font-size:.72rem;font-weight:800}
.mbc-chip.klaar{background:#effaf0;color:#23632a}
.mbc-dag{margin-left:auto;font-size:.72rem;font-weight:900;color:#8a7a8a}
.mbw{display:block;text-decoration:none;color:#3a2a3a;background:#fff;border-radius:22px;padding:16px;box-shadow:0 4px 20px rgba(200,100,160,.14);border:2px solid #ffd6ec;font-family:'Nunito',sans-serif}
.mbw-label{font-size:.76rem;font-weight:800;color:#9a8a9a}
.mbw-naam{font-weight:900;font-size:1.08rem;line-height:1.3;margin:2px 0 8px}
.mbw-balk{height:10px;background:#ffe3f1;border-radius:10px;overflow:hidden}
.mbw-balk>div{height:100%;background:linear-gradient(90deg,#ff6eb4,#ffb347);border-radius:10px;transition:width .6s}
.mbw-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.mbw-chip{display:flex;align-items:center;gap:5px;background:#fff4fa;border-radius:999px;padding:5px 10px;font-size:.82rem}
.mbw-chip b{font-weight:900}
.mbw-chip.klaar{background:#effaf0;color:#23632a}
.mbw-dagdeel{border-top:2px dashed #ffe3f1;margin-top:12px;padding-top:10px}
.mbw-vandaag{font-size:.84rem;line-height:1.4}
.mbw-vandaag b{display:block;font-weight:900;font-size:.9rem}
.mbw-msg{color:#6a5a6a;font-weight:700}
.mbw-week{display:flex;gap:6px;margin:10px 0 2px;justify-content:space-between}
.mbw-dag{flex:1;max-width:46px;text-align:center;background:#fff4fa;border-radius:12px;padding:5px 0 3px;border:2px solid transparent}
.mbw-dag span{display:block;height:20px;font-size:.95rem;line-height:20px;color:#d8c8d2}
.mbw-dag small{font-size:.66rem;font-weight:800;color:#9a8a9a}
.mbw-dag.aan{background:#effaf0}
.mbw-dag.nu{border-color:#ff6eb4}
.mbw-extra{font-size:.8rem;font-weight:800;color:#7a5a00;background:#fff8d6;border-radius:12px;padding:8px 10px;margin-top:8px;line-height:1.35}
.mbw-voet{text-align:right;font-size:.8rem;font-weight:900;color:#ff6eb4;margin-top:10px}
@media (prefers-reduced-motion:reduce){.mb-bon,.mb-overlay,.mbp-kaart,.mb-toast{animation:none}.mb-confetti{display:none}}`;
    document.head.appendChild(s);
  }
  function confetti() {
    const kl = ['#ff6eb4', '#ffe066', '#64b5f6', '#4caf50', '#b39ddb', '#ffb347'];
    for (let i = 0; i < 60; i++) {
      const c = document.createElement('div');
      c.className = 'mb-confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = kl[i % kl.length];
      c.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
      c.style.animationDelay = Math.random() * .6 + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3800);
    }
  }
  function toonBon(bon, alleenBekijken, klaar) {
    stijl();
    const o = document.createElement('div');
    o.className = 'mb-overlay';
    o.innerHTML = `<div class="mb-wrap">
      <div class="mb-bon">
        <div class="mb-top"><div class="mb-em">🏆</div><h2>Beloningsbon</h2><p>${alleenBekijken ? 'Verdiend op ' + datumNL(bon.datum) : 'Wat knap van je, Milou!'}</p></div>
        <div class="mb-perf"></div>
        <div class="mb-mid">
          <div class="mb-label">Deze bon is goed voor</div>
          <div class="mb-beloning"></div>
          <div class="mb-mijlpaal"></div>
        </div>
        <div class="mb-code"><span>${datumNL(bon.datum)}</span><b>${bon.code}</b></div>
      </div>
      ${alleenBekijken ? '' : '<div class="mb-tip">📸 Maak een screenshot en stuur hem naar papa!</div>'}
      <button class="mb-knop">${alleenBekijken ? 'Sluiten' : 'Joepie! 🎉'}</button>
    </div>`;
    o.querySelector('.mb-beloning').textContent = bon.beloning;
    o.querySelector('.mb-mijlpaal').textContent = (bon.ingewisseld ? '✅ Ingewisseld · ' : '✔️ ') + bon.mijlpaal;
    o.querySelector('.mb-knop').addEventListener('click', function () { o.remove(); if (klaar) klaar(); });
    document.body.appendChild(o);
    if (!alleenBekijken) confetti();
  }

  // ── 🎁 Pakketvenster: wat moet ik doen voor deze beloning? ──
  function takenHTML(ps, metKnoppen) {
    stijl();
    return ps.taken.map(x => {
      const T = TAKEN[x.soort], pct = Math.round(x.gedaan / x.nodig * 100);
      return `<div class="mbp-taak${x.klaar ? ' klaar' : ''}">
        <div class="mbp-em">${x.klaar ? '✅' : T.emoji}</div>
        <div class="mbp-mid"><div class="mbp-naam">${x.nodig} ${x.nodig === 1 ? T.een : T.meer}</div>
          <div class="mbp-balk"><div style="width:${pct}%"></div></div>
          <div class="mbp-stand">${x.gedaan} van ${x.nodig}${x.klaar ? ' · klaar!' : ''}</div></div>
        ${metKnoppen && !x.klaar ? `<a class="mbp-doe" href="${T.link}">Doe nu ›</a>` : ''}
      </div>`;
    }).join('');
  }
  function toonPakket(b) {
    stijl();
    const l = ladder(), nv = volgende(), ps = b.type === 'pakket' ? pakketStand(b, l) : null;
    const o = document.createElement('div');
    o.className = 'mb-overlay';
    let inhoud = '';
    if (b.type === 'pakket') {
      const later = nv && nv.b.id !== b.id && !b.bereikt;
      inhoud = (b.bereikt ? '<p class="mbp-info">✅ Dit pakket heb je al af. Knap gedaan!</p>'
        : later ? '<p class="mbp-info">Je werkt eerst aan het pakket voor <b></b>. Alles wat je extra doet, telt al mee voor dit pakket!</p>'
        : '<p class="mbp-info">👉 Hier werk je nu aan! Maak alle taken af en de beloning is van jou.</p>')
        + '<div class="mbp-lijst">' + takenHTML(ps, !b.bereikt) + '</div>';
    } else {
      const huidig = Math.min(stand(b), b.drempel);
      inhoud = '<p class="mbp-info">' + (b.type === 'dagen'
        ? 'Dit is een <b>extra beloning voor volhouden</b>. Haal op ' + b.drempel + ' dagen je dagdoel van ' + dagdoel() + ' ⭐.'
        : 'Dit is een <b>extra beloning</b>. Haal ' + esc(NAMEN[b.onderdeel]) + ' niveau ' + b.drempel + '.') + '</p>'
        + `<div class="mbp-lijst"><div class="mbp-taak${b.bereikt ? ' klaar' : ''}"><div class="mbp-em">${b.bereikt ? '✅' : (b.type === 'dagen' ? '📅' : '🏅')}</div>
           <div class="mbp-mid"><div class="mbp-naam">${b.type === 'dagen' ? b.drempel + ' oefendagen' : esc(NAMEN[b.onderdeel]) + ' niveau ' + b.drempel}</div>
           <div class="mbp-balk"><div style="width:${Math.round(huidig / b.drempel * 100)}%"></div></div>
           <div class="mbp-stand">${b.type === 'dagen' ? huidig + ' van ' + b.drempel + ' dagen' : 'nu niveau ' + huidig}</div></div></div></div>`;
    }
    o.innerHTML = `<div class="mbp-kaart">
      <div class="mbp-kop"><div class="mbp-label">${b.type === 'pakket' ? '🎁 Pakket voor' : b.type === 'dagen' ? '📅 Extra voor volhouden' : '🏅 Extra voor een niveau'}</div><div class="mbp-titel"></div></div>
      ${inhoud}
      <button class="mb-knop mbp-sluit">Sluiten</button></div>`;
    o.querySelector('.mbp-titel').textContent = b.beloning;
    const bb = o.querySelector('.mbp-info b'); if (bb && b.type === 'pakket' && nv) bb.textContent = nv.b.beloning;
    o.querySelector('.mbp-sluit').addEventListener('click', () => o.remove());
    o.addEventListener('click', e => { if (e.target === o) o.remove(); });
    document.body.appendChild(o);
  }

  // ── Kaart "Je pakket": dezelfde op home, leerboek en taalboek ──
  // Compacte balk voor leerboek en taalboek: klein, niet in de weg
  function widgetCompact(el, opties) {
    const st = vandaagStatus(), nv = volgende();
    const chips = nv ? nv.stand.taken.map(function (x) {
      return '<span class="mbc-chip' + (x.klaar ? ' klaar' : '') + '">' + (x.klaar ? '\u2705' : TAKEN[x.soort].emoji) + ' ' + x.gedaan + '/' + x.nodig + '</span>';
    }).join('') : '';
    el.innerHTML = '<a class="mbc" href="' + (opties.link || 'spaarkaart.html') + '">'
      + '<div class="mbc-boven"><span class="mbc-em">\uD83C\uDF81</span><span class="mbc-naam"></span><span class="mbc-pct">' + (nv ? nv.pct + '%' : '') + '</span></div>'
      + (nv ? '<div class="mbc-balk"><div style="width:' + nv.pct + '%"></div></div><div class="mbc-chips">' + chips
        + '<span class="mbc-dag">' + (st.gehaald ? '\u2705 oefendag' : Math.min(st.sterren, st.doel) + '/' + st.doel + ' \u2B50') + '</span></div>' : '')
      + '</a>';
    el.querySelector('.mbc-naam').textContent = nv ? nv.b.beloning : 'Alle pakketten af! \uD83C\uDF89';
  }

  function widget(el, opties) {
    if (!el) return;
    stijl();
    opties = opties || {};
    if (opties.compact) return widgetCompact(el, opties);
    const s = vandaagStatus(), nv = volgende(), vd = volgendeDagen();
    const dagen = s.week.map(w => `<div class="mbw-dag${w.aan ? ' aan' : ''}${w.vandaag ? ' nu' : ''}"><span>${w.aan ? '✅' : (w.toekomst ? '' : '·')}</span><small>${w.label}</small></div>`).join('');
    const chips = nv ? nv.stand.taken.map(x => `<div class="mbw-chip${x.klaar ? ' klaar' : ''}"><span>${x.klaar ? '✅' : TAKEN[x.soort].emoji}</span><b>${x.gedaan}/${x.nodig}</b></div>`).join('') : '';
    const dagRest = vd ? Math.max(0, vd.drempel - oefendagen()) : 0;
    el.innerHTML = `<a class="mbw" href="${opties.link || 'spaarkaart.html'}">
      ${nv ? `<div class="mbw-boven"><div class="mbw-label">🎁 Je werkt aan je pakket voor</div><div class="mbw-naam"></div>
        <div class="mbw-balk"><div style="width:${nv.pct}%"></div></div></div>
        <div class="mbw-chips">${chips}</div>` : '<div class="mbw-naam">🎉 Alle pakketten zijn af! Papa bedenkt vast iets nieuws.</div>'}
      <div class="mbw-dagdeel">
        <div class="mbw-vandaag"><b>Vandaag: ${s.gehaald ? '✅ oefendag binnen' : Math.min(s.sterren, s.doel) + ' / ' + s.doel + ' ⭐'}</b><span class="mbw-msg"></span></div>
        <div class="mbw-week">${dagen}</div>
        ${vd ? `<div class="mbw-extra">📅 Nog ${dagRest} ${dagRest === 1 ? 'oefendag' : 'oefendagen'} voor je extra beloning: <span></span></div>` : ''}
      </div>
      <div class="mbw-voet">Alle beloningen bekijken ›</div>
    </a>`;
    if (nv) el.querySelector('.mbw-naam').textContent = nv.b.beloning;
    el.querySelector('.mbw-msg').textContent = statusTekst(s);
    if (vd) el.querySelector('.mbw-extra span').textContent = vd.beloning;
  }

  window.MB = {
    ONDERDELEN, NAMEN, AANTAL, TAKEN, VOLGORDE, MATEN, sterren, voortgang, bewaarVoortgang, hoogsteNiveau, logOefening, logSterren, oefendagen,
    dagdoel, zetDagdoel, taken, telTaak, pakketStand, pakketTekst, gehaald, volgendeDagen, vandaagStatus, statusTekst, widget, toonPakket, takenHTML, toast, isBonus, nogNodig,
    zoekBeloning, nogTeDoen, nogTekst, ladder, bewaarLadder, laadPapaLadder: () => laadPapaLadder(lees(K.ladder, [])), bonnen, bewaarBonnen: b => schrijf(K.bonnen, b), stand, omschrijf, volgende,
    check, niveauGehaald, mail, testMail, verwerkWachtrij, toonBon, samenvatting, datumNL,
    oefenlog: () => lees(K.log, {}), wachtrij: () => lees(K.wachtrij, [])
  };

  // Openstaande mails alsnog versturen zodra de pagina geladen is
  window.addEventListener('load', function () { setTimeout(verwerkWachtrij, 3000); });
  // Nieuwe vensters krijgen meteen de omgezette ladder
  try { ladder(); } catch (e) {}
})();
