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
    wachtrij: 'milou_mail_wachtrij'
  };
  const ONDERDELEN = { spelling: 'Spelling', lezen: 'Lezen', grammatica: 'Grammatica' };

  function lees(k, std) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : std; } catch (e) { return std; } }
  function schrijf(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function vandaag() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
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
  function hoogsteNiveau(o) { const b = voortgang()[o].behaald; return b.length ? Math.max.apply(null, b) : 0; }

  // ── Oefenlog (per dag) ──
  function logOefening(onderdeel, goed, totaal) {
    const log = lees(K.log, {});
    const d = vandaag();
    if (!log[d]) log[d] = { vragen: 0, goed: 0, onderdelen: {} };
    log[d].vragen += totaal || 0;
    log[d].goed += goed || 0;
    if (onderdeel) log[d].onderdelen[onderdeel] = (log[d].onderdelen[onderdeel] || 0) + (totaal || 0);
    schrijf(K.log, log);
  }
  function oefendagen() { return Object.keys(lees(K.log, {})).length; }

  // ── Beloningsladder ──
  // ✏️ Beloningsladder van papa (knop "Laad de beloningen van papa" in het ouderdashboard)
  const PAPA_LADDER = [
    { type: 'oefendagen', drempel: 3,  beloning: 'Komkommersushi halen bij de DekaMarkt 🍣' },
    { type: 'sterren',    drempel: 75, beloning: 'Een nagellakje uitzoeken bij de Kruidvat 💅' },
    { type: 'oefendagen', drempel: 6,  beloning: 'Jij kiest wat we eten, we halen het samen bij de supermarkt 🛒' },
    { type: 'sterren',    drempel: 175, beloning: 'Een ijsje bij Scoops (max. 3 bolletjes) of McDonald\'s 🍦' },
    { type: 'oefendagen', drempel: 10, beloning: 'Iets uitzoeken bij de Action (max. €5) 🛍️' },
    { type: 'sterren',    drempel: 300, beloning: 'Clickeez uitzoeken bij de Intertoys 🧩' },
    { type: 'oefendagen', drempel: 15, beloning: 'Jij kiest wat we bestellen (butter chicken, Sushi Point…) 🥡' },
    { type: 'niveau', onderdeel: 'lezen', drempel: 3, beloning: 'Een nieuw schetsboek ✏️' },
    { type: 'sterren',    drempel: 450, beloning: 'Robux voor €11,99 🎮' },
    { type: 'oefendagen', drempel: 20, beloning: '🏆 Een cadeautje uitzoeken bij de Intertoys (max. €15) 🎁' },
    { type: 'oefendagen', drempel: 30, beloning: '👑 Shoppen bij de Normal (max. €20) 🛍️💄' }
  ];
  function laadPapaLadder() {
    const basis = sterren(), nu = Date.now();
    const l = PAPA_LADDER.map((b, i) => Object.assign({ id: 'p' + nu + i, bereikt: false }, b, b.type === 'sterren' ? { basis: basis } : {}));
    bewaarLadder(l);
    return l;
  }
  function ladder() {
    let l = lees(K.ladder, null);
    if (!l) {
      // Sterren die ze al had tellen niet mee voor de eerste beloning
      l = laadPapaLadder();
    }
    return l;
  }
  function bewaarLadder(l) { schrijf(K.ladder, l); }
  function bonnen() { return lees(K.bonnen, []); }

  function stand(b) {
    if (b.type === 'sterren') return Math.max(0, sterren() - (b.basis || 0)); // telt vanaf het moment dat de beloning is aangemaakt
    if (b.type === 'oefendagen') return oefendagen();
    if (b.type === 'niveau') return hoogsteNiveau(b.onderdeel);
    return 0;
  }
  function omschrijf(b) {
    if (b.type === 'sterren') return b.drempel + ' sterren verdienen';
    if (b.type === 'oefendagen') return b.drempel + ' dagen geoefend';
    if (b.type === 'niveau') return (ONDERDELEN[b.onderdeel] || b.onderdeel) + ' niveau ' + b.drempel + ' halen';
    return '';
  }
  function eenheid(b) { return b.type === 'sterren' ? '⭐' : b.type === 'oefendagen' ? 'dagen' : 'niveau'; }

  function volgende() {
    const open = ladder().filter(b => !b.bereikt);
    if (!open.length) return null;
    open.sort((a, b) => (stand(b) / b.drempel) - (stand(a) / a.drempel));
    const b = open[0];
    return { b: b, stand: Math.min(stand(b), b.drempel), pct: Math.min(100, Math.round(stand(b) / b.drempel * 100)) };
  }

  function maakCode() {
    const t = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c = '';
    for (let i = 0; i < 4; i++) c += t[Math.floor(Math.random() * t.length)];
    return 'MW-' + c;
  }

  function check() {
    const l = ladder();
    const nieuw = [];
    l.forEach(b => {
      if (!b.bereikt && stand(b) >= b.drempel) {
        b.bereikt = true;
        b.datum = new Date().toISOString();
        b.code = maakCode();
        nieuw.push(b);
      }
    });
    if (!nieuw.length) return [];
    bewaarLadder(l);
    const bn = bonnen();
    nieuw.forEach(b => bn.unshift({ code: b.code, beloning: b.beloning, mijlpaal: omschrijf(b), datum: b.datum, ingewisseld: false }));
    schrijf(K.bonnen, bn);
    nieuw.forEach((b, i) => {
      setTimeout(() => toonBon({ code: b.code, beloning: b.beloning, mijlpaal: omschrijf(b), datum: b.datum }), 1200 + i * 400);
      mail('🏆 Milou heeft een beloning verdiend!',
        'Milou heeft net deze mijlpaal gehaald: ' + omschrijf(b) + '.\n\n' +
        'Haar beloning: ' + b.beloning + '\n' +
        'Boncode: ' + b.code + '\n\n' + samenvatting());
    });
    return nieuw;
  }

  function samenvatting() {
    const v = voortgang();
    const r = ['Stand van zaken:', '⭐ ' + sterren() + ' sterren in totaal', '📅 ' + oefendagen() + ' dagen geoefend'];
    Object.keys(ONDERDELEN).forEach(o => {
      const pct = v[o].totaal ? Math.round(v[o].goed / v[o].totaal * 100) : 0;
      r.push('• ' + ONDERDELEN[o] + ': niveau ' + (hoogsteNiveau(o) || '–') + ' behaald (' + pct + '% goed van ' + v[o].totaal + ' vragen)');
    });
    return r.join('\n');
  }

  function niveauGehaald(onderdeel, niveau, titel, score) {
    if (MAIL_BIJ_NIVEAU) {
      mail('⭐ Milou haalde ' + ONDERDELEN[onderdeel] + ' niveau ' + niveau,
        'Milou heeft ' + ONDERDELEN[onderdeel] + ' niveau ' + niveau + ' (' + titel + ') gehaald met ' + score + ' van de 10 goed.\n\n' + samenvatting());
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
@media (prefers-reduced-motion:reduce){.mb-bon,.mb-overlay{animation:none}.mb-confetti{display:none}}`;
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
  function toonBon(bon, alleenBekijken) {
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
    o.querySelector('.mb-knop').addEventListener('click', function () { o.remove(); });
    document.body.appendChild(o);
    if (!alleenBekijken) confetti();
  }

  window.MB = {
    ONDERDELEN, sterren, voortgang, bewaarVoortgang, hoogsteNiveau, logOefening, oefendagen,
    ladder, bewaarLadder, laadPapaLadder, bonnen, bewaarBonnen: b => schrijf(K.bonnen, b), stand, omschrijf, eenheid, volgende,
    check, niveauGehaald, mail, testMail, verwerkWachtrij, toonBon, samenvatting, datumNL,
    oefenlog: () => lees(K.log, {}), wachtrij: () => lees(K.wachtrij, [])
  };

  // Openstaande mails alsnog versturen zodra de pagina geladen is
  window.addEventListener('load', function () { setTimeout(verwerkWachtrij, 3000); });
})();
