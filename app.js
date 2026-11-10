/* ASIA 27 | FANVERSE — application. */
(() => {
  "use strict";
  const D = window.FV_DATA, I = window.FV_I18N, P = window.FV_PLAN;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- State ---------------- */
  const KEY = "fanverse27-v1";
  const DEFAULT = {
    lang: null, team: null, nationality: null, name: "", homeCity: "riyadh",
    points: 0, badges: [], seen: [], missionsDone: 0, quizzesDone: 0,
    plan: { form: { city: "riyadh", stadium: "king-fahd", kickoff: "20:00", dayStart: "10:00", start: "", budget: 350, buffer: 90, interests: ["heritage", "food"], food: "", transport: ["metro", "taxi"] }, result: null, chat: [] },
    budget: null, summary: "", quiz: null, mission: null,
  };
  let S;
  try { S = Object.assign({}, DEFAULT, JSON.parse(localStorage.getItem(KEY) || "{}")); S.plan = Object.assign({}, DEFAULT.plan, S.plan); S.plan.form = Object.assign({}, DEFAULT.plan.form, S.plan.form); }
  catch (e) { S = JSON.parse(JSON.stringify(DEFAULT)); }
  if (!S.lang) {
    const nav = (navigator.language || "en").slice(0, 2);
    S.lang = D.SUPPORTED.includes(nav) ? nav : "en";
  }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } };

  /* ---------------- i18n ---------------- */
  const meta = () => I.meta[S.lang];
  const loc = () => meta().locale;
  function t(key, v) {
    let s = (I[S.lang] && I[S.lang][key]) ?? I.en[key] ?? key;
    if (v) s = s.replace(/\{(\w+)\}/g, (_, k) => (v[k] != null ? v[k] : ""));
    return s;
  }
  const L = obj => (obj ? obj[S.lang] || obj.en : "");
  const nf = n => new Intl.NumberFormat(loc()).format(n);
  const sar = n => new Intl.NumberFormat(loc(), { style: "currency", currency: "SAR", maximumFractionDigits: 0 }).format(n);
  const fdate = iso => new Intl.DateTimeFormat(loc(), { dateStyle: "long", timeZone: "Asia/Riyadh" }).format(new Date(iso + "T12:00:00+03:00"));
  const flag = cc => String.fromCodePoint(...cc.split("").map(c => 0x1f1e6 + c.charCodeAt(0) - 65));
  const dnCache = {};
  function displayName(cc, lang) {
    try { const k = lang; dnCache[k] = dnCache[k] || new Intl.DisplayNames([lang], { type: "region" }); return dnCache[k].of(cc); } catch (e) { return null; }
  }
  function teamName(cc, lang = S.lang) {
    const o = D.NAME_OVERRIDE[cc];
    if (o && o[lang]) return o[lang];
    return displayName(cc, I.meta[lang] ? I.meta[lang].locale : lang) || displayName(cc, "en") || cc;
  }
  function nativeName(cc) {
    const o = D.NAME_OVERRIDE[cc];
    if (o && o.native) return o.native;
    return displayName(cc, D.NATIVE[cc] || "en") || teamName(cc, "en");
  }
  const langName = code => { try { return new Intl.DisplayNames([loc()], { type: "language" }).of(code); } catch (e) { return code; } };
  const isFinalist = cc => !!D.FINALISTS[cc];
  const stadium = id => D.STADIUMS.find(s => s.id === id);

  /* ---------------- Theme ---------------- */
  function applyTeamTheme() {
    const c = D.COLORS[S.team];
    const root = document.documentElement.style;
    if (c) { root.setProperty("--team", c[0]); root.setProperty("--team-2", c[1]); }
    else { root.removeProperty("--team"); root.removeProperty("--team-2"); }
  }
  function applyLang() {
    const m = meta();
    document.documentElement.lang = S.lang === "en" ? "en" : m.locale.split("-u-")[0];
    document.documentElement.dir = m.dir;
    document.title = "ASIA 27 | FANVERSE";
  }

  /* ---------------- AI (Claude sample capability) ---------------- */
  let samplePromise = null;
  const getSample = () => (samplePromise = samplePromise || (window.claude && window.claude.use ? window.claude.use("sample") : Promise.resolve(null)));
  function aiError(e) {
    const code = e && e.code;
    if (code === "unavailable") return t("ai.unavailable");
    if (code === "not_granted") return t("ai.denied");
    if (code === "rate_limited") return t("ai.rate");
    if (code === "bad_json") return t("ai.bad");
    return t("ai.fail", { m: (e && e.message) || String(e) });
  }
  function parseJSON(text) {
    if (!text) throw { code: "bad_json" };
    const a = text.indexOf("{"), b = text.lastIndexOf("}");
    if (a < 0 || b <= a) throw { code: "bad_json" };
    try { return JSON.parse(text.slice(a, b + 1)); } catch (e) { throw { code: "bad_json" }; }
  }
  // Outside claude.ai (e.g. a Vercel deploy) the same prompts go to a server route that holds the
  // provider key (see api/ai.js). Keys never reach the browser.
  async function serverAI(input) {
    let res;
    try {
      const messages = typeof input === "string" ? [{ role: "user", content: input }] : input;
      res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages }) });
    } catch (e) { throw { code: "unavailable" }; }
    if (res.status === 404) throw { code: "unavailable" };
    if (res.status === 429) throw { code: "rate_limited" };
    const j = await res.json().catch(() => null);
    if (!res.ok || !j || typeof j.text !== "string") throw { code: "fail", message: (j && j.error) || "HTTP " + res.status };
    return j.text;
  }
  function langRule() {
    return `\n\nLANGUAGE (most important rule): the fan's app is set to ${meta().ai}. Write EVERY human-readable text value (titles, places, venue descriptions, notes, steps, reply, headline, message) in ${meta().ai} only, even if the fan typed in another language, even if earlier messages or the current plan are in another language, and even for Saudi place names (write them the way a ${meta().name} reader would, with the Arabic name in brackets only when it helps). Keep JSON keys and "maps" search phrases in English.`;
  }
  function withLang(input) {
    if (typeof input === "string") return input + langRule();
    if (Array.isArray(input) && input.length) { const c = input.slice(); const last = c[c.length - 1]; c[c.length - 1] = Object.assign({}, last, { content: String(last.content || "") + langRule() }); return c; }
    return input;
  }
  const SCRIPT = { ar: /[\u0600-\u06FF]/g, ja: /[\u3040-\u30FF\u4E00-\u9FFF]/g, ko: /[\uAC00-\uD7AF\u1100-\u11FF]/g, en: /[A-Za-z]/g };
  function langOK(text) {
    const str = String(text || ""); const count = re => (str.match(re) || []).length;
    const total = count(SCRIPT.ar) + count(SCRIPT.ja) + count(SCRIPT.ko) + count(SCRIPT.en);
    if (total < 12) return true;
    const mine = count(SCRIPT[S.lang] || SCRIPT.en);
    if (S.lang === "ja" || S.lang === "ko") return mine / total > 0.35;
    if (S.lang === "en") return count(SCRIPT.ar) + count(SCRIPT.ja) + count(SCRIPT.ko) < total * 0.25;
    return mine / total > 0.5;
  }
  function textValues(o, out = []) {
    if (typeof o === "string") out.push(o);
    else if (Array.isArray(o)) o.forEach(x => textValues(x, out));
    else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) if (k !== "maps" && k !== "type" && k !== "id" && k !== "kind") textValues(v, out);
    return out;
  }
  async function rawAI(prompt, opts) {
    const s = await getSample();
    if (!s) return serverAI(prompt);
    const r = await s(prompt, Object.assign({ cache: false }, opts));
    return (r && r.text) || "";
  }
  async function aiJSON(prompt, opts = {}) {
    let json = parseJSON(await rawAI(withLang(prompt), opts));
    if (json && !langOK(textValues(json).join(" "))) {
      try {
        const fixed = parseJSON(await rawAI(`Translate every human-readable string value in this JSON into ${meta().ai}. Keep the same keys, structure, numbers, times and ids. Keep any "maps" values in English. Return JSON only.\n${JSON.stringify(json)}`, opts));
        if (fixed && langOK(textValues(fixed).join(" "))) json = fixed;
      } catch (e) {}
    }
    return json;
  }
  async function aiText(input, onText, opts = {}) {
    const guard = !opts.noLangGuard; opts = Object.assign({}, opts); delete opts.noLangGuard;
    input = withLang(input);
    const s = await getSample();
    let txt;
    if (!s) { txt = await serverAI(input); if (onText) onText(txt); }
    else { const r = await s(input, Object.assign({ cache: false, onText: onText ? (u => onText(u.text)) : undefined }, opts)); txt = (r && r.text) || ""; }
    if (guard && txt && !langOK(txt)) {
      try { const fx = await rawAI(`Translate this text into ${meta().ai}. Keep formatting, numbers and any Arabic phrase that is being taught (with its meaning). Return only the translation.\n\n${txt}`, opts); if (fx && langOK(fx)) { txt = fx; if (onText) onText(txt); } } catch (e) {}
    }
    return txt;
  }
  function fanContext() {
    const team = S.team ? teamName(S.team, "en") : "no team chosen yet";
    return `Context: unofficial fan app "ASIA 27 | FANVERSE" for the AFC Asian Cup Saudi Arabia 2027 (revised dates 23 Dec 2027 – 21 Jan 2028, pending FIFA approval; match dates/kickoffs/venues for the new window are NOT yet confirmed). The user supports: ${team}. Write every human-readable sentence in ${meta().ai}. Never claim official AFC affiliation. Never invent places, opening hours, exact prices, live travel times, statistics or win percentages; label any cost or duration as an estimate.`;
  }

  /* ---------------- Points & badges ---------------- */
  function award(p) { S.points += p; save(); }
  function badge(id) {
    if (S.badges.includes(id)) return;
    S.badges.push(id); save(); toast(t("toast.badge", { b: t("b." + id) }));
  }
  let toastTimer;
  function toast(msg) {
    $(".toast") && $(".toast").remove();
    const el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); el.textContent = msg;
    document.body.appendChild(el); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.remove(), 2800);
  }

  /* ---------------- Graphics ---------------- */
  let uid = 0;
  function stadiumSVG(s, big) {
    const id = "g" + (++uid), hue = D.CITIES[s.city].hue;
    const W = 600, H = big ? 300 : 340, cy = H * 0.7;
    const shapes = {
      ring: { rx: 250, ry: 62, roof: 46 }, bowl: { rx: 220, ry: 58, roof: 34 }, arena: { rx: 200, ry: 54, roof: 62 },
      compact: { rx: 170, ry: 46, roof: 28 }, jewel: { rx: 240, ry: 60, roof: 58 }, wave: { rx: 245, ry: 60, roof: 70 },
    };
    const sh = shapes[s.shape] || shapes.ring;
    let stars = "";
    for (let i = 0; i < 40; i++) { const x = (i * 137.5 + s.id.length * 31) % W, y = (i * 59.3) % (H * 0.45); stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(i % 3) * 0.4 + 0.4}" fill="#fff" opacity="${0.2 + (i % 5) * 0.1}"/>`; }
    const beams = [0.18, 0.82].map(f => `<polygon points="${W * f},${cy - sh.ry - sh.roof - 40} ${W * f - 120},${H} ${W * f + 120},${H}" fill="url(#${id}b)" opacity=".55"/>`).join("");
    const towers = [0.18, 0.82].map(f => `<rect x="${W * f - 2}" y="${cy - sh.ry - sh.roof - 40}" width="4" height="${sh.roof + 40}" fill="#1b2d48"/><rect x="${W * f - 16}" y="${cy - sh.ry - sh.roof - 50}" width="32" height="12" rx="2" fill="#fff8e1"/>`).join("");
    let roof;
    if (s.shape === "wave") roof = `<path d="M${300 - sh.rx},${cy - 6} C ${300 - sh.rx / 2},${cy - sh.ry - sh.roof - 20} ${300 + sh.rx / 2},${cy - sh.ry - sh.roof + 30} ${300 + sh.rx},${cy - 10} L ${300 + sh.rx},${cy + 6} L ${300 - sh.rx},${cy + 6}Z" fill="url(#${id}r)"/>`;
    else if (s.shape === "jewel") { roof = ""; for (let i = 0; i < 14; i++) { const x0 = 300 - sh.rx + i * (sh.rx * 2 / 14); roof += `<polygon points="${x0},${cy} ${x0 + sh.rx / 14},${cy - sh.ry - sh.roof * (0.6 + 0.4 * Math.sin(i / 2))} ${x0 + sh.rx / 7},${cy}" fill="hsl(${hue} 70% ${45 + (i % 3) * 8}%)" opacity=".75"/>`; } }
    else if (s.shape === "arena") roof = `<path d="M${300 - sh.rx},${cy} Q 300,${cy - sh.ry - sh.roof * 1.6} ${300 + sh.rx},${cy} Z" fill="url(#${id}r)"/>`;
    else roof = `<ellipse cx="300" cy="${cy - 8}" rx="${sh.rx}" ry="${sh.ry + sh.roof * 0.5}" fill="url(#${id}r)"/>`;
    let tiers = "";
    for (let i = 0; i < 4; i++) tiers += `<ellipse cx="300" cy="${cy + 4 + i * 4}" rx="${sh.rx - 8 - i * 14}" ry="${sh.ry - 8 - i * 6}" fill="none" stroke="hsl(${hue} 60% ${70 - i * 8}% / .45)" stroke-width="1.2"/>`;
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(L(s.name))}">
      <defs>
        <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050c18"/><stop offset=".7" stop-color="hsl(${hue} 45% 14%)"/><stop offset="1" stop-color="hsl(${hue} 50% 20%)"/></linearGradient>
        <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6d8" stop-opacity=".55"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></linearGradient>
        <linearGradient id="${id}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue} 55% 62%)"/><stop offset="1" stop-color="hsl(${hue} 50% 22%)"/></linearGradient>
        <radialGradient id="${id}p" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#2bd38f"/><stop offset="1" stop-color="#0b6a45"/></radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#${id}s)"/>${stars}${beams}${towers}${roof}
      <ellipse cx="300" cy="${cy + 6}" rx="${sh.rx}" ry="${sh.ry}" fill="hsl(${hue} 35% 12%)" stroke="hsl(${hue} 60% 60% / .6)"/>${tiers}
      <ellipse cx="300" cy="${cy + 16}" rx="${sh.rx * 0.46}" ry="${sh.ry * 0.42}" fill="url(#${id}p)"/>
      <ellipse cx="300" cy="${cy + 16}" rx="${sh.rx * 0.12}" ry="${sh.ry * 0.12}" fill="none" stroke="#fff" stroke-opacity=".6"/>
      <line x1="300" y1="${cy + 16 - sh.ry * 0.42}" x2="300" y2="${cy + 16 + sh.ry * 0.42}" stroke="#fff" stroke-opacity=".5"/>
      <rect x="0" y="${H - 4}" width="${W}" height="4" fill="var(--team, #d6b262)" opacity=".8"/>
    </svg>`;
  }
  function cityArt(id) {
    const keys = GAL.city[id];
    if (keys) return `<div class="ph">${imgTag(keys[0], "", true)}</div><span class="photo-credit">${creditLine(keys[0], false)}</span>`;
    const g = "c" + (++uid);
    if (id === "riyadh") return `<svg class="art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1230"/><stop offset=".6" stop-color="#6b3b2a"/><stop offset="1" stop-color="#d08a4a"/></linearGradient></defs><rect width="400" height="300" fill="url(#${g})"/><circle cx="300" cy="150" r="44" fill="#f4c27a" opacity=".85"/><g fill="#1a1426"><rect x="60" y="120" width="22" height="130"/><rect x="92" y="90" width="18" height="160"/><path d="M150 250 L150 70 L168 40 L186 70 L186 250Z"/><rect x="200" y="140" width="30" height="110"/><rect x="240" y="110" width="16" height="140"/></g><path d="M0 240 Q 100 210 200 240 T 400 236 V300 H0Z" fill="#3b2318"/><path d="M0 262 Q 120 240 240 262 T 400 258 V300 H0Z" fill="#2a180f"/></svg>`;
    if (id === "jeddah") return `<svg class="art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#071a33"/><stop offset=".55" stop-color="#145a7a"/><stop offset="1" stop-color="#0a3a52"/></linearGradient></defs><rect width="400" height="300" fill="url(#${g})"/><path d="M290 210 C 288 120 296 70 300 20 C 304 70 312 120 310 210Z" fill="#cfeefa" opacity=".55"/><g fill="#0c2236"><rect x="30" y="150" width="60" height="70"/><rect x="40" y="135" width="40" height="15"/><rect x="100" y="165" width="50" height="55"/><rect x="160" y="140" width="45" height="80"/></g><g fill="#d6b262" opacity=".7"><rect x="44" y="165" width="10" height="16"/><rect x="66" y="165" width="10" height="16"/><rect x="112" y="178" width="9" height="14"/><rect x="172" y="155" width="9" height="14"/><rect x="188" y="155" width="9" height="14"/></g><path d="M0 220 Q 50 210 100 220 T 200 220 T 300 220 T 400 220 V300 H0Z" fill="#0b3550"/><path d="M0 245 Q 50 235 100 245 T 200 245 T 300 245 T 400 245 V300 H0Z" fill="#082a40"/></svg>`;
    return `<svg class="art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#06202a"/><stop offset=".6" stop-color="#0f5a58"/><stop offset="1" stop-color="#1c8c7a"/></linearGradient></defs><rect width="400" height="300" fill="url(#${g})"/><path d="M90 205 C 150 120 260 130 320 205Z" fill="#0b2a30" stroke="#5fd6c0" stroke-opacity=".6"/><path d="M110 205 C 160 150 250 155 300 205" fill="none" stroke="#d6b262" stroke-opacity=".7" stroke-width="2"/><g stroke="#07161a" stroke-width="4" fill="none"><path d="M40 230 Q 46 180 44 150"/><path d="M360 230 Q 354 185 356 160"/></g><g fill="#07161a"><path d="M44 150 l-24 10 l24 -4 l-18 16 l20 -12 l4 22 l4 -22 l20 12 l-18 -16 l24 4z"/><path d="M356 160 l-24 10 l24 -4 l-18 16 l20 -12 l4 22 l4 -22 l20 12 l-18 -16 l24 4z"/></g><path d="M0 225 H400 V300 H0Z" fill="#083c40"/><path d="M0 240 Q 100 232 200 240 T 400 240 V300 H0Z" fill="#062c30"/></svg>`;
  }
  const dishIcon = k => ({
    rice: `<svg class="ic" viewBox="0 0 52 52" aria-hidden="true"><ellipse cx="26" cy="34" rx="20" ry="8" fill="none" stroke="#d6b262" stroke-width="2"/><path d="M8 32 Q 26 6 44 32" fill="#f0dca6" opacity=".8"/><circle cx="20" cy="22" r="2" fill="#8a5a2b"/><circle cx="30" cy="19" r="2" fill="#8a5a2b"/><circle cx="26" cy="26" r="2" fill="#13a877"/></svg>`,
    bowl: `<svg class="ic" viewBox="0 0 52 52" aria-hidden="true"><path d="M6 24 H46 Q 44 44 26 44 Q 8 44 6 24Z" fill="none" stroke="#d6b262" stroke-width="2"/><path d="M10 24 Q 26 16 42 24" fill="#f0dca6" opacity=".7"/><path d="M20 14 q 3 -5 0 -9 M28 14 q 3 -5 0 -9" stroke="#9db0c6" fill="none" stroke-width="1.5"/></svg>`,
    bread: `<svg class="ic" viewBox="0 0 52 52" aria-hidden="true"><path d="M8 30 Q 8 16 26 16 Q 44 16 44 30 Z" fill="#f0dca6" opacity=".75"/><path d="M8 30 H44 V36 Q 26 42 8 36Z" fill="none" stroke="#d6b262" stroke-width="2"/><path d="M18 22 l4 4 M26 21 l4 4 M34 22 l3 3" stroke="#8a5a2b" stroke-width="2"/></svg>`,
  }[k]);
  /* Original fan emblem (not the AFC logo): Saudi green roundel, 24 nation dots, palm over a ball, Sadu band. */
  function emblemSVG(cls, small) {
    const id = small ? "s" : "l";
    return `<svg class="${cls}" viewBox="0 0 400 400" role="img" aria-label="ASIA 27 FANVERSE">
      <defs><linearGradient id="em-g${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b7a43"/><stop offset="1" stop-color="#033d22"/></linearGradient>
      <linearGradient id="em-au${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e7bd"/><stop offset="1" stop-color="#c99a45"/></linearGradient></defs>
      <circle cx="200" cy="200" r="188" fill="url(#em-g${id})"/>
      <circle cx="200" cy="200" r="188" fill="none" stroke="url(#em-au${id})" stroke-width="${small ? 14 : 6}"/>
      ${small ? "" : `<g class="ring"><circle cx="200" cy="200" r="170" fill="none" stroke="#f1dfae" stroke-opacity=".45" stroke-width="2" stroke-dasharray="1 14" stroke-linecap="round"/></g>`}
      <g transform="translate(200 ${small ? 120 : 112})">
        <circle r="${small ? 34 : 30}" fill="none" stroke="url(#em-au${id})" stroke-width="${small ? 10 : 6}"/>
        <path d="M0 -12 L11.4 -3.7 L7 9.7 H-7 L-11.4 -3.7Z" fill="url(#em-au${id})" transform="scale(${small ? 1.25 : 1.1})"/>
      </g>
      <text x="200" y="${small ? 318 : 268}" text-anchor="middle" font-family="Alexandria, sans-serif" font-weight="900" font-size="${small ? 190 : 150}" letter-spacing="-6" fill="url(#em-au${id})">27</text>
      ${small ? "" : `<text x="200" y="318" text-anchor="middle" font-family="Alexandria, sans-serif" font-weight="700" font-size="22" letter-spacing="9" fill="#f1dfae">ASIA · SAUDI</text>`}
    </svg>`;
  }
  const BRAND_SVG = emblemSVG("brand-mark", true);
  const PH = window.FV_PHOTOS, GAL = window.FV_GALLERY;
  const imgTag = (k, cls = "", eager) => `<img src="img/${k}.jpg" alt="" ${eager ? "" : 'loading="lazy"'} decoding="async" class="${cls}">`;
  const creditLine = (k, link = true) => { const p = PH[k]; if (!p) return ""; if (p.user || p.free) return p.render ? `<span class="credit">${t("s.render")}</span>` : p.illus ? `<span class="credit">${t("s.illus")}</span>` : ""; const by = link ? `<a href="${p.src}" target="_blank" rel="noopener">${esc(p.by)}</a>` : esc(p.by); return `<span class="credit">© ${by} · ${p.lic}</span>`; };
  function fadeStack(keys, dur) { const D_ = dur || keys.length * 5; return `<div class="fade" style="--dur:${D_}s">${keys.map((k, i) => imgTag(k, "", i === 0).replace("<img ", `<img style="animation-delay:${i ? (i - 1) * D_ / Math.max(1, keys.length - 1) + D_ * 0.3 : 0}s" `)).join("")}</div>`; }

  /* ---------------- Hero canvas ---------------- */
  let heroRAF = 0, heroCleanup = null;
  function startHero(canvas) {
    if (heroCleanup) heroCleanup();
    const ctx = canvas.getContext("2d");
    let w, h, dpr, mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5;
    const parts = Array.from({ length: 80 }, (_, i) => ({ x: Math.random(), y: Math.random(), z: 0.3 + Math.random() * 0.7, s: Math.random() * 1.8 + 0.5, c: i % 3, r: Math.random() * 6.28 }));
    function size() { dpr = Math.min(2, devicePixelRatio || 1); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function draw(time) {
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      const team = getComputedStyle(document.documentElement).getPropertyValue("--team").trim() || "#d4b06a";
      ctx.clearRect(0, 0, w, h);
      // Floodlight glow that follows the pointer gently
      const g = ctx.createRadialGradient(w * mx, h * my * 0.6, 0, w * mx, h * my * 0.6, Math.max(w, h) * 0.45);
      g.addColorStop(0, "rgba(255,240,200,.10)"); g.addColorStop(1, "rgba(255,240,200,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const cols = ["#d4b06a", "#00a35b", team];
      parts.forEach(p => {
        if (!reduced) { p.y -= 0.0007 * p.z; p.r += 0.02; p.x += Math.sin(time / 2600 + p.s * 9) * 0.00025; if (p.y < -0.03) { p.y = 1.03; p.x = Math.random(); } }
        const x = p.x * w + (mx - 0.5) * 60 * p.z, y = p.y * h + (my - 0.5) * 36 * p.z;
        ctx.save(); ctx.translate(x, y); ctx.rotate(p.r); ctx.globalAlpha = 0.35 + 0.55 * p.z; ctx.fillStyle = cols[p.c];
        ctx.fillRect(-p.s * 1.6, -p.s * 0.6, p.s * 3.2, p.s * 1.2); ctx.restore();
      });
      ctx.globalAlpha = 1;
      if (!reduced) heroRAF = requestAnimationFrame(draw);
    }
    const onMove = e => { const r = canvas.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; };
    size(); addEventListener("resize", size); addEventListener("pointermove", onMove, { passive: true });
    cancelAnimationFrame(heroRAF); heroRAF = requestAnimationFrame(draw);
    heroCleanup = () => { cancelAnimationFrame(heroRAF); removeEventListener("resize", size); removeEventListener("pointermove", onMove); heroCleanup = null; };
  }

  /* ---------------- Shell ---------------- */
  const NAV = ["home", "teams", "matches", "stadiums", "matchday", "discover", "challenges", "passport"];
  function routeBase(r) { if (r.startsWith("team-")) return "teams"; if (r.startsWith("stadium-") || r.startsWith("city-")) return "stadiums"; return r; }
  function header() {
    const r = routeBase(route());
    const team = S.team ? `<span class="flag" aria-hidden="true">${flag(S.team)}</span><span class="lbl">${esc(teamName(S.team))}</span>` : `<span class="flag" aria-hidden="true">⚽</span><span class="lbl">${t("team.choose")}</span>`;
    return `<a class="skip" href="#main" data-skip>${t("skip")}</a>
    <div class="top-in">
      <a class="brand" href="#home" aria-label="ASIA 27 FANVERSE">${BRAND_SVG}<span class="brand-word">ASIA <b>27</b><small>FANVERSE</small></span></a>
      <nav class="nav" id="nav" aria-label="Main">${NAV.map(k => `<a href="#${k}" ${r === k ? 'aria-current="page"' : ""}>${t("nav." + k)}</a>`).join("")}</nav>
      <div class="top-tools">
        <button class="chip-team" data-open-settings aria-label="${t("team.choose")}">${team}</button>
        <label class="sr" for="lang">${t("lang.label")}</label>
        <select id="lang" class="lang-sel">${D.SUPPORTED.map(l => `<option value="${l}" ${l === S.lang ? "selected" : ""}>${I.meta[l].name}</option>`).join("")}</select>
        <button class="menu-btn" aria-controls="nav" aria-expanded="false" aria-label="${t("menu")}"><span></span><span></span><span></span></button>
      </div>
    </div>`;
  }
  function footer() {
    return `<div class="wrap"><div class="f">
      <div style="max-width:52ch"><div class="tagline">ASIA 27 | FANVERSE</div><p style="margin-top:6px">${t("tagline")}</p><p style="margin-top:12px">${t("info.unofficial")}</p></div>
    </div></div>`;
  }
  const route = () => (location.hash || "#home").slice(1) || "home";

  /* ---------------- Reusable bits ---------------- */
  const srcChip = key => ""; const _srcChipOld = key => { const s = D.SOURCES[key]; return s ? `<span class="src">${t("source")}: <a href="${s.url}" target="_blank" rel="noopener">${esc(s.title.split(" — ")[0])}</a> · ${fdate(s.date)}</span>` : ""; };
  const statusPill = st => `<span class="pill ${st === "operational" ? "q" : st === "unknown" ? "" : "pend"}"><span class="dot"></span>${t("st." + st)}</span>`;
  function teamTile(cc) {
    const f = D.FINALISTS[cc];
    return `<button class="tp" data-pick="${cc}" aria-pressed="${S.team === cc}"><span class="flag" aria-hidden="true">${flag(cc)}</span><span class="nm">${esc(teamName(cc))}</span>${f ? `<span class="gp">${t("group", { g: f.g })}</span>` : ""}</button>`;
  }
  function fixtureCard(a, b, g) {
    const me = S.team === a || S.team === b;
    return `<div class="fx ${me ? "me" : ""}">
      <a class="t" href="#team-${a.toLowerCase()}"><span class="flag" aria-hidden="true">${flag(a)}</span><span>${esc(teamName(a))}</span></a>
      <span class="vs">VS</span>
      <a class="t b" href="#team-${b.toLowerCase()}"><span>${esc(teamName(b))}</span><span class="flag" aria-hidden="true">${flag(b)}</span></a>
      <div class="meta"><span class="pill">${t("m.round")} · ${t("group", { g })}</span><span class="pill pend"><span class="dot"></span>${t("m.tbc")}</span></div>
    </div>`;
  }
  const pairings = g => { const [a, b, c, d] = D.GROUP_ORDER[g]; return [[a, b], [c, d], [a, c], [b, d], [d, a], [b, c]]; };
  function aiBox(inner) { return `<div class="msg a"><span class="pill ai tag">${t("aiGen")}</span>${inner}</div>`; }
  function loadingDots() { return `<span class="typing" aria-label="${t("loading")}"><i></i><i></i><i></i></span>`; }
  // Minimal safe formatting for AI prose: escape, then bold **x** and line breaks.
  const prose = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/^#+\s*/gm, "");

  /* ---------------- Views ---------------- */
  function vHome() {
    const fin = Object.keys(D.FINALISTS);
    const kfsc = stadium("king-fahd");
    const tName = S.team ? teamName(S.team) : "";
    return `
    <section class="hero2" aria-labelledby="hero-t">
      <div class="slides" aria-hidden="true">${GAL.hero.map((k, i) => imgTag(k, "", i === 0)).join("")}</div>
      <canvas id="hero-canvas" aria-hidden="true"></canvas>
      <div class="wrap hero2-in">
        <div>
          <div class="kicker reveal"><span class="pill"><span class="flag">${flag("SA")}</span> ${t("hero.eyebrow")}</span><span class="pill">${S.lang === "ar" ? "أهلاً آسيا · Ahlan Asia" : t("info.slogan") + " · أهلاً آسيا"}</span></div>
          <h1 id="hero-t" class="reveal d1">${t("hero.t1")}<span class="l2">${t("hero.t2")}</span></h1>
          <p class="sub reveal d2">${t("hero.sub")}</p>
          <p class="welcome reveal d2">${S.team ? t("hero.welcomeTeam", { team: esc(tName) }) : t("hero.welcome")}</p>
          <div class="ctas reveal d3">
            <a class="btn btn-gold" href="#teams">${t("cta.start")} <span class="arrow">→</span></a>
            <a class="btn btn-ghost" href="#stadiums">${t("cta.stadiums")}</a>
          </div>
        </div>
        <div class="emblem-wrap reveal d4">
          ${emblemSVG("emblem")}
          <aside class="board" aria-labelledby="cd-t" style="width:100%">
            <h3 id="cd-t">${t("count.title")}</h3>
            <div class="count" id="countdown" aria-live="off">${["d", "h", "m", "s"].map(k => `<div><b data-c="${k}">--</b><span>${t("count." + k)}</span></div>`).join("")}</div>
            <p class="note">${t("count.note")}</p>
          </aside>
        </div>
      </div>
      <div class="flagbar" aria-label="${t("stats.teams")}"><div class="track">${(() => { const l = Object.keys(D.FINALISTS).map(cc => `<a href="#team-${cc.toLowerCase()}"><span class="flag" aria-hidden="true">${flag(cc)}</span>${esc(teamName(cc))}</a>`).join(""); return l + l; })()}</div></div>
      <div class="sadu" aria-hidden="true"></div>
    </section>
    <section class="wrap" style="padding-top:28px"><div class="info-grid">${[["teams", 24], ["matches", 51], ["stadiums", 8], ["cities", 3]].map(([k, n]) => `<div class="info"><b>${nf(n)}</b><span>${t("stats." + k)}</span></div>`).join("")}</div></section>

    <section class="section"><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">01</span><h2>${t("home.teams.t")}</h2><p>${t("home.teams.p")}</p></div><a class="btn btn-ghost btn-sm" href="#teams">${t("home.teams.all")} <span class="arrow">→</span></a></div>
      <div class="tp-strip">${fin.map(teamTile).join("")}</div>
    </div></section>

    <section class="section"><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">02</span><h2>${t("home.cities.t")}</h2><p>${t("home.cities.p")}</p></div></div>
      <div class="cities">${Object.entries(D.CITIES).map(([id, c]) => `<a class="city photo" href="#city-${id}">${cityArt(id)}<span class="n">${t("s.n", { n: nf(D.STADIUMS.filter(s => s.city === id).length) })}</span><h3>${esc(L(c.name))}</h3><p>${esc(L(c.intro))}</p></a>`).join("")}</div>
    </div></section>

    <section class="section"><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">03</span><h2>${t("home.st.t")}</h2><p>${t("home.st.p")}</p></div><a class="btn btn-ghost btn-sm" href="#stadiums">${t("home.st.all")} <span class="arrow">→</span></a></div>
      <div class="st-grid">${D.STADIUMS.map(stadiumCard).join("")}</div>
    </div></section>

    <section class="section"><div class="wrap band">
      <a class="teaser big" href="#matchday"><span class="eyebrow">04 · AI</span><h3>${t("home.cp.t")}</h3><p>${t("home.cp.p")}</p>
        <div class="mini-tl"><span><b>13:00</b>${esc(L(D.DISHES[0].name))}</span><span><b>15:30</b>${esc(L(D.CITIES.riyadh.sights[0].n))}</span><span><b>18:10</b>${esc(L(kfsc.name))}</span><span class="pill pend">${t("hypo")}</span></div>
        <span class="go">${t("home.cp.cta")} <span class="arrow">→</span></span></a>
      <a class="teaser" href="#challenges"><span class="eyebrow">05</span><h3>${t("home.ch.t")}</h3><p>${t("home.ch.p")}</p><span class="go">${t("ch.quiz")} <span class="arrow">→</span></span></a>
      <a class="teaser" href="#discover"><span class="eyebrow">06</span><h3>${t("home.cu.t")}</h3><p>${t("home.cu.p")}</p><span class="go">${t("d.t")} <span class="arrow">→</span></span></a>
      <a class="teaser big" href="#passport" style="min-height:200px"><span class="eyebrow">07</span><h3>${t("home.pp.t")}</h3><p>${t("home.pp.p")}</p><span class="go">${t("nav.passport")} · ${nf(S.points)} ${t("pp.points")} <span class="arrow">→</span></span></a>
    </div></section>

    <section class="section"><div class="wrap">
      <div class="sec-head"><div><span class="eyebrow">08</span><h2>${t("info.t")}</h2></div></div>
      <div class="info-grid">
        <div class="info"><b>${t("info.dates")}</b><span>${t("info.datesL")}</span><div style="margin-top:8px">${srcChip("dates")}</div></div>
        <div class="info"><b>${t("info.format")}</b><span>${t("info.formatL")}</span></div>
        <div class="info"><b>${t("info.draw")}</b><span>${t("info.drawL")}</span><div style="margin-top:8px">${srcChip("draw")}</div></div>
        <div class="info"><b>${t("info.slogan")}</b><span>${t("info.sloganL")}</span></div>
      </div>
    </div></section>`;
  }

  function stadiumCard(s) {
    const keys = GAL.stadium[s.id];
    return `<a class="st" href="#stadium-${s.id}"><div class="art">${keys ? fadeStack(keys) : stadiumSVG(s) + `<span class="pill noph">${t("s.noPhoto")}</span>`}</div><div class="body">
      <span class="src">${esc(L(D.CITIES[s.city].name))}</span>
      <h3>${esc(L(s.name))}</h3>
      <div class="cap">${nf(s.capacity)}<small>${t("s.seats")}</small></div>
      <div class="row">${statusPill(s.status)}</div></div></a>`;
  }

  let teamFilter = "finalists", teamQuery = "";
  function vTeams() {
    return `<div class="wrap fade-page"><header class="page-head"><span class="eyebrow">${t("hero.eyebrow")}</span><h1>${t("nav.teams")}</h1><p>${t("home.teams.p")}</p></header>
      <div class="toolbar">
        <div class="field search"><label for="tq" class="sr">${t("search")}</label><input id="tq" class="input" type="search" placeholder="${t("search")}" value="${esc(teamQuery)}" autocomplete="off"></div>
        <div class="seg" role="group" aria-label="${t("nav.teams")}"><button data-tf="finalists" aria-pressed="${teamFilter === "finalists"}">${t("f.finalists")}</button><button data-tf="all" aria-pressed="${teamFilter === "all"}">${t("f.all")}</button></div>
      </div>
      <div class="team-grid" id="tgrid">${teamCards()}</div></div>`;
  }
  function teamCards() {
    const q = teamQuery.trim().toLowerCase();
    let list = teamFilter === "all" ? D.AFC.slice() : Object.keys(D.FINALISTS);
    list = list.filter(cc => !q || [teamName(cc), teamName(cc, "en"), nativeName(cc), cc].some(n => String(n).toLowerCase().includes(q)));
    list.sort((a, b) => (isFinalist(b) - isFinalist(a)) || teamName(a).localeCompare(teamName(b), loc()));
    if (!list.length) return `<p class="notice info">—</p>`;
    return list.map(cc => {
      const f = D.FINALISTS[cc], c = D.COLORS[cc] || [];
      return `<article class="tc" style="--c1:${c[0] || "var(--gold)"};--c2:${c[1] || "var(--emerald)"}">
        <div class="tc-top"><span class="flag" aria-hidden="true">${flag(cc)}</span><div><h3>${esc(teamName(cc))}</h3><div class="native">${esc(nativeName(cc))}</div></div></div>
        <div class="tc-meta">${f ? `<span class="pill q"><span class="dot"></span>${t("qualified")}</span><span class="pill">${t("group", { g: f.g })}</span>${f.route === "host" ? `<span class="pill host">${t("host")}</span>` : ""}` : `<span class="pill">${t("notq")}</span>`}</div>
        <div class="tc-act"><a class="btn btn-ghost btn-sm" href="#team-${cc.toLowerCase()}">${t("profile")}</a><button class="btn btn-sm ${S.team === cc ? "btn-em" : "btn-ghost"}" data-pick="${cc}">${S.team === cc ? "✓ " + t("mine") : t("makeMine")}</button></div>
      </article>`;
    }).join("");
  }

  function vTeam(cc) {
    if (!D.AFC.includes(cc)) return vNotFound();
    const f = D.FINALISTS[cc], c = D.COLORS[cc] || [];
    const head = `<div class="panel panel-gold" style="margin-top:28px;--c1:${c[0] || "var(--gold)"};background:radial-gradient(80% 120% at 100% 0%, ${c[0] || "#d6b262"}33, transparent 60%), var(--panel)">
      <div style="display:flex;gap:22px;align-items:center;flex-wrap:wrap">
        <span class="flag" style="font-size:96px" aria-hidden="true">${flag(cc)}</span>
        <div style="flex:1;min-width:240px"><span class="eyebrow">${f ? t("qualified") : t("team.afc")}</span>
          <h1 style="font-size:clamp(36px,6vw,72px);font-weight:900;margin-top:8px">${esc(teamName(cc))}</h1>
          <p style="color:var(--muted);margin-top:6px">${t("team.native")}: ${esc(nativeName(cc))}</p>
          <div class="tc-meta" style="margin-top:12px">${f ? `<span class="pill">${t("group", { g: f.g })}</span>${f.route === "host" ? `<span class="pill host">${t("host")}</span>` : ""}` : `<span class="pill">${t("notq")}</span>`}</div></div>
        <button class="btn ${S.team === cc ? "btn-em" : "btn-gold"}" data-pick="${cc}">${S.team === cc ? "✓ " + t("mine") : t("makeMine")}</button>
      </div></div>`;
    if (!f) return `<div class="wrap fade-page"><a class="btn btn-ghost btn-sm" style="margin-top:24px" href="#teams"><span class="arrow">←</span> ${t("back")}</a>${head}<p class="notice info" style="margin-top:16px">${t("team.out", { team: esc(teamName(cc)) })}</p></div>`;
    const titles = (f.years || []).length;
    const yrs = f.years || f.bestYears || [];
    const mates = D.GROUP_ORDER[f.g].filter(x => x !== cc);
    const fx = pairings(f.g).filter(p => p.includes(cc));
    return `<div class="wrap fade-page"><a class="btn btn-ghost btn-sm" style="margin-top:24px" href="#teams"><span class="arrow">←</span> ${t("back")}</a>${head}
      <div class="sd-cols">
        <div class="panel"><h2>${t("profile")}</h2><dl class="facts">
          <div class="fact"><dt>${t("team.titles")}</dt><dd><b class="num" style="font-size:28px;font-family:var(--num)">${nf(titles)}</b>${titles ? ` <span class="src">(${yrs.join(", ")})</span>` : ""}</dd></div>
          <div class="fact"><dt>${t("team.best")}</dt><dd>${t("fin." + f.best)}${!titles && yrs.length ? ` <span class="src">(${yrs.join(", ")})</span>` : ""}</dd></div>
          <div class="fact"><dt>${t("team.route")}</dt><dd>${t("route." + f.route)}</dd></div>
          <div class="fact"><dt>${t("m.group")}</dt><dd>${t("group", { g: f.g })}<span class="src">${srcChip("draw")}</span></dd></div>
        </dl><div style="margin-top:10px">${srcChip("wiki")}</div></div>
        <div class="panel"><h2>${t("team.rivals")}</h2><div class="grp-teams">${mates.map(m => `<a href="#team-${m.toLowerCase()}"><span class="flag">${flag(m)}</span>${esc(teamName(m))}</a>`).join("")}</div>
          <div class="stack"><a class="btn btn-gold" href="#challenges" data-quiz-team="${cc}">${t("team.quiz", { team: esc(teamName(cc)) })}</a><a class="btn btn-ghost" href="#challenges" data-pred="${cc}">${t("ch.pred")}</a></div></div>
      </div>
      <section class="panel" style="margin-top:18px"><h2>${t("team.fixtures")}</h2><div class="notice" style="margin-bottom:14px"><b>${t("m.pending")}</b></div>${fx.map(p => fixtureCard(p[0], p[1], f.g)).join("")}</section></div>`;
  }

  let mGroup = "all", mTeam = "", mMine = false;
  function vMatches() {
    const groups = Object.keys(D.GROUP_ORDER);
    return `<div class="wrap fade-page"><header class="page-head"><span class="eyebrow">${t("hero.eyebrow")}</span><h1>${t("m.t")}</h1><p>${t("m.p")}</p></header>
      <div class="notice" style="margin-bottom:18px"><div><b>${t("m.pending")}</b><div style="margin-top:6px">${srcChip("dates")}</div></div></div>
      <div class="toolbar">
        <div class="seg" role="group" aria-label="${t("m.group")}"><button data-mg="all" aria-pressed="${mGroup === "all"}">${t("m.all")}</button>${groups.map(g => `<button data-mg="${g}" aria-pressed="${mGroup === g}">${g}</button>`).join("")}</div>
        <div class="field" style="min-width:200px"><label for="mteam" class="sr">${t("m.team")}</label><select id="mteam" class="select input"><option value="">${t("m.team")}: ${t("m.all")}</option>${Object.keys(D.FINALISTS).sort((a, b) => teamName(a).localeCompare(teamName(b), loc())).map(cc => `<option value="${cc}" ${mTeam === cc ? "selected" : ""}>${flag(cc)} ${esc(teamName(cc))}</option>`).join("")}</select></div>
        <div class="field" style="min-width:180px"><label for="mst" class="sr">${t("f.stadium")}</label><select id="mst" class="select input" disabled title="${t("m.tbc")}"><option>${t("f.stadium")}: ${t("m.tbc")}</option></select></div>
        ${S.team && isFinalist(S.team) ? `<label class="checks"><label><input type="checkbox" id="mmine" ${mMine ? "checked" : ""}> ${t("m.mine")}</label></label>` : ""}
      </div>
      <div class="groups">${groups.filter(g => mGroup === "all" || mGroup === g).map(g => {
        let fx = pairings(g);
        const who = mMine && S.team ? S.team : mTeam;
        if (who) fx = fx.filter(p => p.includes(who));
        if (who && !D.GROUP_ORDER[g].includes(who)) return "";
        return `<section class="panel grp"><h3><span class="g">${g}</span>${t("group", { g })}</h3>
          <div class="grp-teams">${D.GROUP_ORDER[g].map(cc => `<a href="#team-${cc.toLowerCase()}" class="${S.team === cc ? "me" : ""}"><span class="flag">${flag(cc)}</span>${esc(teamName(cc))}</a>`).join("")}</div>
          ${fx.map(p => fixtureCard(p[0], p[1], g)).join("")}</section>`;
      }).join("")}</div>
      <p style="margin-top:14px">${srcChip("draw")}</p></div>`;
  }

  function vStadiums() {
    const max = Math.max(...D.STADIUMS.map(s => s.capacity));
    return `<div class="wrap fade-page"><header class="page-head"><span class="eyebrow">${t("hero.eyebrow")}</span><h1>${t("s.t")}</h1><p>${t("s.p")}</p></header>
      ${Object.entries(D.CITIES).map(([id, c]) => `<section class="city-block"><h3 class="cb"><a href="#city-${id}" style="text-decoration:none">${esc(L(c.name))}</a><span>${t("s.n", { n: nf(D.STADIUMS.filter(s => s.city === id).length) })}</span></h3><div class="st-grid">${D.STADIUMS.filter(s => s.city === id).map(stadiumCard).join("")}</div></section>`).join("")}
      <section class="section" id="compare"><div class="sec-head"><div><span class="eyebrow">8</span><h2>${t("s.compare")}</h2></div></div>
        <div class="cmp-wrap"><table class="cmp"><thead><tr><th scope="col">${t("nav.stadiums")}</th><th scope="col">${t("s.city")}</th><th scope="col">${t("s.capacity")}</th><th scope="col">${t("s.opened")}</th><th scope="col">${t("s.status")}</th><th scope="col">${t("c.transport")}</th><th scope="col">${t("s.matches")}</th></tr></thead>
        <tbody>${D.STADIUMS.map(s => `<tr><th scope="row"><a href="#stadium-${s.id}">${esc(L(s.name))}</a></th><td>${esc(L(D.CITIES[s.city].name))}</td><td class="n">${nf(s.capacity)}${s.capAlt ? `<div class="src">${t("s.alt")}: ${nf(s.capAlt.value)}</div>` : ""}<div class="bar"><i style="width:${(s.capacity / max * 100).toFixed(1)}%"></i></div></td><td class="n">${s.opened.value ? s.opened.value : `<span class="src">${t("notConfirmed")}</span>`}</td><td>${statusPill(s.status)}</td><td>${s.city === "riyadh" ? t("tr.metro") + " · " : ""}${t("tr.taxi")}</td><td><span class="pill pend">${t("pending")}</span></td></tr>`).join("")}</tbody></table></div>
        <p style="margin-top:10px">${srcChip("wiki")} · ${srcChip("ministry")}</p></section></div>`;
  }

  function vStadium(id) {
    const s = stadium(id); if (!s) return vNotFound();
    if (!S.seen.includes(id)) { S.seen.push(id); save(); if (S.seen.length >= 8) setTimeout(() => badge("explorer"), 400); }
    const city = D.CITIES[s.city];
    const q = encodeURIComponent(`${s.name.en}, ${city.name.en}, Saudi Arabia`);
    return `<div class="wrap fade-page"><a class="btn btn-ghost btn-sm" style="margin:24px 0 16px" href="#stadiums"><span class="arrow">←</span> ${t("back")}</a>
      <section class="sd-hero ${GAL.stadium[id] ? "photo" : ""}"><div class="art">${GAL.stadium[id] ? fadeStack(GAL.stadium[id].filter(k => !PH[k].user).length ? GAL.stadium[id].filter(k => !PH[k].user) : GAL.stadium[id], 15) : stadiumSVG(s, true)}</div><div class="in">
        <div><span class="eyebrow">${esc(L(city.name))}</span><h1 style="margin-top:8px">${esc(L(s.name))}</h1>${s.aka ? `<p style="color:var(--muted);margin-top:6px">${t("s.aka")}: ${esc(L(s.aka))}</p>` : ""}</div>
        <dl class="sd-card"><dt>${t("s.capacity")}</dt><dd class="num">${nf(s.capacity)}</dd><dt>${t("s.city")}</dt><dd>${esc(L(city.name))}</dd><dt>${t("s.status")}</dt><dd>${t("st." + s.status)}</dd></dl>
      </div></section>
      ${GAL.stadium[id] ? `<section class="panel" style="margin-top:18px"><h2>${t("s.gallery")}</h2><div class="gallery">${GAL.stadium[id].map(k => `<button data-lb="${k}" aria-label="${t("s.gallery")}">${imgTag(k)}<span class="cap">${creditLine(k, false)}</span></button>`).join("")}</div></section>` : `<p class="notice info" style="margin-top:10px">${t("s.noPhotoLong")}</p>`}
      <div class="sd-cols">
        <section class="panel"><h2>${t("s.facts")}</h2><dl class="facts">
          <div class="fact"><dt>${t("s.name")}</dt><dd>${esc(L(s.name))}${S.lang !== "en" ? `<span class="src">${esc(s.name.en)}</span>` : ""}</dd></div>
          ${s.aka ? `<div class="fact"><dt>${t("s.aka")}</dt><dd>${esc(L(s.aka))}</dd></div>` : ""}
          <div class="fact"><dt>${t("s.city")}</dt><dd>${esc(L(city.name))}</dd></div>
          <div class="fact"><dt>${t("s.capacity")}</dt><dd><b class="num">${nf(s.capacity)}</b>${srcChip(s.capSrc)}${s.capAlt ? `<div style="margin-top:6px">${t("s.alt")}: <b class="num">${nf(s.capAlt.value)}</b>${srcChip(s.capAlt.src)}</div>` : ""}</dd></div>
          <div class="fact"><dt>${t("s.opened")}</dt><dd>${s.opened.value ? `<b class="num">${s.opened.value}</b> <span class="pill" style="margin-inline-start:6px">${t("historical")}</span>` : `<span class="pill">${t("notConfirmed")}</span>`}</dd></div>
          <div class="fact"><dt>${t("s.status")}</dt><dd>${statusPill(s.status)}${s.statusSrc ? srcChip(s.statusSrc) : ""}</dd></div>
          <div class="fact"><dt>${t("s.notes")}</dt><dd>${esc(L(s.notes))}</dd></div>
        </dl><p class="src" style="margin-top:8px">${t("verified", { date: fdate(D.VERIFIED) })}</p></section>
        <div class="stack">
          <section class="panel"><h2>${t("s.getThere")}</h2><p style="color:var(--muted);font-size:14.5px">${esc(L(city.transport))}</p>
            
            <div class="stack"><a class="btn btn-gold" href="https://www.google.com/maps/dir/?api=1&destination=${q}" target="_blank" rel="noopener">${t("s.navigate")} <span class="arrow">→</span></a>
            <a class="btn btn-ghost" href="https://www.google.com/maps/search/?api=1&query=${q}" target="_blank" rel="noopener">${t("s.map")}</a>
            <button class="btn btn-em" data-plan-stadium="${s.id}">${t("s.plan")}</button></div></section>
          <section class="panel"><h2>${t("s.matches")}</h2><div class="notice"><div><b>${t("m.pending")}</b></div></div>
            ${s.prev ? `<div class="fact" style="border:0;margin-top:10px"><dt>${t("s.prev")}</dt><dd>${esc(L(s.prev))}${srcChip("sched")}</dd></div>` : ""}
            <a class="btn btn-ghost btn-sm" style="margin-top:12px" href="#matches">${t("m.t")} <span class="arrow">→</span></a></section>
        </div>
      </div></div>`;
  }

  let cityCat = "all";
  const hasPhoto = k => !!(k && PH[k]);
  function placeCard(p) {
    return `<article class="place">${hasPhoto(p.img) ? `<button class="pimg" data-lb="${p.img}" aria-label="${esc(L(p.n))}">${imgTag(p.img)}</button>` : `<div class="pimg noimg"><svg class="ic" viewBox="0 0 52 52" aria-hidden="true"><path d="M26 6c-8 0-14 6-14 14 0 10 14 26 14 26s14-16 14-26c0-8-6-14-14-14z" fill="none" stroke="#d6b262" stroke-width="2"/><circle cx="26" cy="20" r="5" fill="#f0dca6" opacity=".8"/></svg></div>`}
      <div class="pbody"><span class="pill cat-${p.cat}">${t("cat." + p.cat)}</span><h3>${esc(L(p.n))}</h3><p>${esc(L(p.d))}</p>${hasPhoto(p.img) ? creditLine(p.img) : ""}</div></article>`;
  }
  function splitIng(s) { const out = []; let depth = 0, cur = ""; for (const ch of s) { if ("(（".includes(ch)) depth++; if (")）".includes(ch)) depth--; if (!depth && ",،、".includes(ch)) { out.push(cur.trim()); cur = ""; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; }
  function dishCard(d) {
    return `<article class="dish2">${hasPhoto(d.img) ? `<button class="pimg" data-lb="${d.img}" aria-label="${esc(L(d.name))}">${imgTag(d.img)}${d.similar ? `<span class="pill sim">${t("c.similar")}</span>` : ""}</button>` : `<div class="pimg noimg">${dishIcon(d.icon)}</div>`}
      <div class="pbody"><div class="dh"><h3>${esc(L(d.name))}</h3>${S.lang !== "ar" ? `<span class="ar">${d.ar}</span>` : ""}</div><p>${esc(L(d.d))}</p>
      ${d.ing ? `<div class="ing"><b>${t("c.ing")}</b><ul>${splitIng(L(d.ing)).map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}${hasPhoto(d.img) ? creditLine(d.img) : ""}</div></article>`;
  }
  function vCity(id) {
    const c = D.CITIES[id]; if (!c) return vNotFound();
    const places = (window.FV_PLACES || {})[id] || [];
    const cats = ["all", "fun", "shop", "heritage", "nature", "culture"].filter(k => k === "all" || places.some(p => p.cat === k));
    if (!cats.includes(cityCat)) cityCat = "all";
    return `<div class="wrap fade-page">
      <section class="city photo" style="margin-top:28px;min-height:480px;cursor:default">${cityArt(id)}<span class="eyebrow">${t("hero.eyebrow")}</span><h3 style="font-size:clamp(48px,8vw,104px)">${esc(L(c.name))}</h3><p style="font-size:17px;max-width:60ch;color:var(--ivory)">${esc(L(c.intro))}</p></section>
      <section class="section" style="padding-bottom:0"><div class="sec-head"><div><span class="eyebrow">${esc(L(c.name))}</span><h2>${t("c.places")}</h2></div>
        <div class="seg" role="group" aria-label="${t("c.places")}">${cats.map(k => `<button data-ccat="${k}" aria-pressed="${cityCat === k}">${t("cat." + k)}</button>`).join("")}</div></div>
        <div class="places" id="places">${places.filter(p => cityCat === "all" || p.cat === cityCat).map(placeCard).join("")}</div></section>
      <section class="section" style="padding-bottom:0"><div class="sec-head"><div><span class="eyebrow">${t("d.taste")}</span><h2>${t("c.food", { city: esc(L(c.name)) })}</h2></div></div>
        <div class="dishes2">${c.food.map(k => D.DISHES.find(x => x.id === k)).filter(Boolean).map(dishCard).join("")}</div></section>
      <div class="sd-cols" style="margin-top:28px">
        <section class="panel"><h2>${t("c.transport")}</h2><p style="color:var(--muted)">${esc(L(c.transport))}</p></section>
        <section class="panel"><h2>${t("md.t")}</h2><p style="color:var(--muted);margin-bottom:14px">${t("home.cp.p")}</p><button class="btn btn-gold" data-plan-city="${id}">${t("c.plan", { city: esc(L(c.name)) })} <span class="arrow">→</span></button></section>
      </div>
      <section class="section"><div class="sec-head"><div><h2>${t("c.stadiums", { city: esc(L(c.name)) })}</h2></div></div><div class="st-grid">${D.STADIUMS.filter(s => s.city === id).map(stadiumCard).join("")}</div></section></div>`;
  }

  /* ---------- AI Matchday ---------- */
  let mdTab = "plan";
  function vMatchday() {
    return `<div class="wrap fade-page"><header class="page-head"><span class="eyebrow">AI · ${t("hero.eyebrow")}</span><h1>${t("md.t")}</h1><p>${t("md.p")}</p></header>
      <div class="tabs" role="tablist">${["plan", "budget", "rescue"].map(k => `<button role="tab" data-mdtab="${k}" aria-selected="${mdTab === k}">${t(k === "plan" ? "md.tPlan" : k === "budget" ? "md.tBudget" : "md.tRescue")}</button>`).join("")}</div>
      <div id="mdpanel">${mdTab === "plan" ? vPlan() : mdTab === "budget" ? vBudget() : vRescue()}</div></div>`;
  }
  function planForm(extra = "") {
    const f = S.plan.form;
    const sts = D.STADIUMS.filter(s => s.city === f.city);
    return `<form class="panel" id="planform" novalidate><div class="form-grid">
      <div class="field"><label for="p-city">${t("f.city")}</label><select id="p-city" class="input">${Object.entries(D.CITIES).map(([id, c]) => `<option value="${id}" ${f.city === id ? "selected" : ""}>${esc(L(c.name))}</option>`).join("")}</select></div>
      <div class="field"><label for="p-st">${t("f.stadium")}</label><select id="p-st" class="input">${sts.map(s => `<option value="${s.id}" ${f.stadium === s.id ? "selected" : ""}>${esc(L(s.name))}</option>`).join("")}</select></div>
      <div class="field"><label for="p-ko">${t("f.kickoff")} <span class="pill pend">${t("hypo")}</span></label><input id="p-ko" type="time" class="input" value="${f.kickoff}" required></div>
      <div class="field"><label for="p-ds">${t("f.dayStart")}</label><input id="p-ds" type="time" class="input" value="${f.dayStart}" required></div>
      <div class="field full"><label for="p-start">${t("f.start")}</label><div class="geo-row"><input id="p-start" class="input" value="${esc(f.start)}" placeholder="${t("f.startPh")}" maxlength="120"><button type="button" class="btn btn-ghost btn-sm" id="p-geo" aria-pressed="${f.geo ? "true" : "false"}">📍 ${f.geo ? t("geo.on") : t("geo.use")}</button></div>${f.geo ? `<p class="src" style="margin-top:6px">${t("geo.set")}</p>` : ""}</div>
      <div class="field"><label for="p-b">${t("f.budget")}</label><input id="p-b" type="number" min="0" max="10000" step="10" class="input num" value="${f.budget}" required></div>
      <div class="field"><label for="p-buf">${t("f.buffer")}: <b id="buf-v">${t("f.min", { n: nf(f.buffer) })}</b></label><input id="p-buf" type="range" min="30" max="240" step="15" value="${f.buffer}"></div>
      <div class="field full"><span class="lbl-sm">${t("f.interests")}</span><div class="checks">${["heritage", "food", "shopping", "art", "outdoors"].map(k => `<label><input type="checkbox" name="int" value="${k}" ${f.interests.includes(k) ? "checked" : ""}>${t("in." + k)}</label>`).join("")}</div></div>
      <div class="field full"><label for="p-food">${t("f.food")}</label><input id="p-food" class="input" value="${esc(f.food)}" placeholder="${t("f.foodPh")}" maxlength="120"></div>
      <div class="field full"><span class="lbl-sm">${t("f.transport")}</span><div class="checks">${["metro", "taxi", "walk", "car"].map(k => `<label><input type="checkbox" name="tr" value="${k}" ${f.transport.includes(k) ? "checked" : ""}>${t("tr." + k)}</label>`).join("")}</div></div>
      </div><p class="src" style="margin:12px 0">${t("md.hypoNote")}</p>${extra}</form>`;
  }
  function readForm() {
    const f = S.plan.form, v = id => $("#" + id) && $("#" + id).value;
    f.city = v("p-city") || f.city; f.stadium = v("p-st") || f.stadium;
    if (!D.STADIUMS.find(s => s.id === f.stadium && s.city === f.city)) f.stadium = D.STADIUMS.find(s => s.city === f.city).id;
    f.kickoff = P.toMin(v("p-ko")) != null ? v("p-ko") : f.kickoff; f.dayStart = P.toMin(v("p-ds")) != null ? v("p-ds") : f.dayStart;
    f.start = (v("p-start") || "").slice(0, 120); f.food = (v("p-food") || "").slice(0, 120);
    const b = Number(v("p-b")); f.budget = Number.isFinite(b) && b >= 0 ? Math.min(10000, Math.round(b)) : f.budget;
    f.buffer = Number(v("p-buf")) || f.buffer;
    f.interests = $$('input[name="int"]:checked').map(x => x.value); f.transport = $$('input[name="tr"]:checked').map(x => x.value);
    save(); return f;
  }
  function vPlan() {
    return `<div class="md-grid">${planForm(`<button class="btn btn-gold" type="submit" style="width:100%">${t("md.go")} <span class="arrow">→</span></button>`)}
      <div class="stack"><section class="panel" id="plan-out">${planOut()}</section>
      <section class="panel"><h2>${t("md.chat")}</h2><p class="src" style="margin-bottom:10px">${t("md.chatHint")}</p>
        <div class="chat"><div class="msgs" id="plan-msgs" aria-live="polite">${S.plan.chat.filter(m => !m.lang || m.lang === S.lang).map(m => m.role === "user" ? `<div class="msg u">${esc(m.text)}</div>` : aiBox(prose(m.text) + (m.n != null ? `<p><b>${t("md.updated", { n: nf(m.n), cost: sar(m.cost) })}</b></p>` : ""))).join("")}</div>
        <div class="sugs">${["md.s1", "md.s2", "md.s3", "md.s4", "md.s5"].map(k => `<button type="button" data-sug="${esc(t(k))}">${t(k)}</button>`).join("")}</div>
        <form class="chat-in" id="plan-chat"><label for="pc" class="sr">${t("md.chat")}</label><input id="pc" class="input" placeholder="${t("md.chatPh")}" maxlength="300" autocomplete="off"><button class="btn btn-gold" ${S.plan.result ? "" : "disabled"}>${t("send")}</button></form></div></section></div></div>`;
  }
  function planOut(loading) {
    if (loading) return `<h2>${t("md.timeline")}</h2><div class="shimmer"></div><div class="shimmer"></div><div class="shimmer"></div>`;
    const r = S.plan.result;
    if (!r) return `<h2>${t("md.timeline")}</h2><p class="notice info">${t("md.empty")}</p>`;
    const st = stadium(r.stadium) || stadium(S.plan.form.stadium);
    const pct = Math.min(100, r.total / Math.max(1, r.budget) * 100);
    const warn = r.warnings.map(w => `<li class="notice ${w.info ? "info" : ""}">${t(w.k, { a: esc(w.a), t: w.t, b: sar(w.b || r.budget) })}</li>`).join("");
    return `<div class="tl-h" style="margin-bottom:14px"><h2 style="margin:0">${t("md.timeline")}</h2><span class="pill ai">${t("aiGen")} · ${t("hypo")}</span></div>
      ${r.lang && r.lang !== S.lang ? `<div class="notice info" style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px">${t("md.otherLang")}<button type="button" class="btn btn-gold btn-sm" data-trplan>${t("md.trPlan")}</button></div>` : ""}
      <div class="summary">
        <div class="sum ${r.total <= r.budget ? "ok" : "bad"}"><span>${t("md.spend")}</span><b>${sar(r.total)}</b><span>${t("md.of", { b: sar(r.budget) })} · ${t("estimate")}</span><div class="meter"><i class="${r.total > r.budget ? "over" : ""}" style="width:${pct}%"></i></div></div>
        <div class="sum ${r.arrive != null && r.arrive <= r.target ? "ok" : "bad"}"><span>${t("md.arrive")}</span><b>${r.arrive != null ? P.fmt(r.arrive) : "—"}</b><span>${t("md.target", { t: P.fmt(r.target) })} · ${t("md.kick")} ${P.fmt(r.kickoff)}</span></div>
        <div class="sum ${r.feasible ? "ok" : "bad"}"><span>${t("md.check")}</span><b style="font-size:22px">${r.feasible ? "✓ " + t("md.ok") : "! " + t("md.bad")}</b><span>${esc(st ? L(st.name) : "")}</span></div>
      </div>
      ${warn ? `<ul class="warns" style="padding:0;margin:0 0 14px">${warn}</ul>` : ""}
      <div class="tl">${r.items.map(it => `<div class="tl-item ${it.done ? "done" : ""}">
        <div class="tl-h"><span class="tl-time">${P.fmt(it.start)}–${P.fmt(it.end)}</span><span class="pill ${it.cost ? "est" : ""}">${it.cost ? sar(it.cost) + " · " + t("estimate") : sar(0)}</span></div>
        <div class="tl-title">${esc(it.title)}</div>${it.place ? `<div class="src">${esc(it.place)}</div>` : ""}${it.venue ? `<div class="tl-venue">🍽 ${esc(it.venue)} <span class="pill pend">${t("md.verify")}</span></div>` : ""}${it.note ? `<div class="tl-note">${esc(it.note)}</div>` : ""}
        <div class="tl-foot"><label><input type="checkbox" data-done="${it.id}" ${it.done ? "checked" : ""}> ${t("md.done")}</label>${mapsLink(it)}</div></div>`).join("")}
        <div class="tl-item kick"><div class="tl-h"><span class="tl-time">${P.fmt(r.kickoff)}</span><span class="pill pend">${t("hypo")}</span></div><div class="tl-title">⚽ ${t("md.kick")} · ${esc(st ? L(st.name) : "")}</div></div>
      </div>`;
  }
  function mapsLink(it) {
    if (it.type === "transit" || it.type === "rest") return "";
    const city = D.CITIES[S.plan.form.city];
    let q = it.type === "transit-stadium" ? (stadium(S.plan.form.stadium) || {}).name?.en : (it.venue ? it.venue + " " + city.name.en : it.maps || ((it.place || it.title) + " " + city.name.en));
    if (!q) return "";
    const g = S.plan.form.geo;
    if (g && !it.venue && (it.type === "food" || it.type === "cafe")) q = q.replace(new RegExp("\\s*" + city.name.en + "$", "i"), "") + " near " + g.lat.toFixed(4) + "," + g.lng.toFixed(4);
    const url = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
    return `<a class="maplink" href="${url}" target="_blank" rel="noopener">🗺 ${t(it.type === "food" || it.type === "cafe" ? "md.mapsFood" : "md.maps")}</a>`;
  }
  function planPromptBase(f) {
    const st = stadium(f.stadium), city = D.CITIES[f.city];
    return `${fanContext()}
You are the Matchday Copilot. Plan one hypothetical matchday in ${city.name.en}, Saudi Arabia, ending with arrival at ${st.name.en}.
Inputs: day starts ${f.dayStart}; hypothetical kickoff ${f.kickoff}; must arrive at the stadium at least ${f.buffer} minutes before kickoff (the transit-stadium item must END by ${P.fmt(P.toMin(f.kickoff) - f.buffer)}); total budget ${f.budget} SAR per person for the whole day including transport; starting point: ${f.start || (f.geo ? "the fan's current location" : "not given (assume central " + city.name.en + ")")}${f.geo ? ` (GPS ${f.geo.lat.toFixed(4)}, ${f.geo.lng.toFixed(4)}; work out the district from these coordinates and plan nearby first)` : ""}; interests: ${f.interests.join(", ") || "any"}; food preferences: ${f.food || "none given"}; transport preferences: ${f.transport.join(", ") || "any"}.
Rules: 4–8 items; 24-hour "HH:MM" times on the same day; chronological, no overlaps; include realistic travel legs as type "transit"; finish with exactly one item of type "transit-stadium". Only use real, well-known landmarks or districts you are confident exist. Honour the food preferences exactly (e.g. if they want Italian, the meal is Italian). For food and cafe items you MAY put one specific, long-established restaurant or café in "venue" ONLY if you are highly confident it exists in ${city.name.en} near that area; otherwise leave "venue" empty and describe the kind of place. Never invent names. For every food, cafe, shopping and activity item also give "maps": a short Google Maps search phrase in English (e.g. "Italian restaurant Al Olaya Riyadh" or the landmark name + city) so the fan can see real, current options. Costs are integer SAR estimates per person (0 if free). Notes are one short sentence and say when a duration or cost is a rough estimate.
Return JSON only, no prose: {"reply": string, "constraints": {"budget": number, "bufferMinutes": number, "kickoff": "HH:MM", "dayStart": "HH:MM"}, "items": [{"title": string, "type": "activity|food|cafe|shopping|rest|transit|transit-stadium", "start": "HH:MM", "end": "HH:MM", "cost": number, "place": string, "venue": string, "maps": string, "note": string}]}`;
  }
  function applyPlan(json, f) {
    if (!json || !Array.isArray(json.items)) throw { code: "bad_json" };
    const c = P.normConstraints(json.constraints, { budget: f.budget, buffer: f.buffer, kickoff: f.kickoff, dayStart: f.dayStart });
    f.budget = c.budget; f.buffer = c.buffer; f.kickoff = c.kickoff; f.dayStart = c.dayStart;
    const prevDone = new Set((S.plan.result ? S.plan.result.items : []).filter(x => x.done).map(x => x.title));
    const items = json.items.map(x => Object.assign({}, x, { done: prevDone.has(String(x.title || "").trim()) }));
    const r = P.validatePlan(items, c);
    if (!r.items.length) throw { code: "bad_json" };
    r.stadium = f.stadium; r.lang = S.lang;
    S.plan.result = r; save();
    return r;
  }
  async function generatePlan() {
    const f = readForm(); const out = $("#plan-out"); out.innerHTML = planOut(true);
    const btn = $("#planform button[type=submit]"); btn.disabled = true;
    try {
      const json = await aiJSON(planPromptBase(f));
      const r = applyPlan(json, f);
      S.plan.chat = [{ role: "assistant", text: json.reply ? String(json.reply).slice(0, 800) : "", n: r.items.length, cost: r.total, lang: S.lang }];
      save(); badge("planner"); render();
    } catch (e) { out.innerHTML = `<h2>${t("md.timeline")}</h2><div class="notice err">${esc(aiError(e))}</div>`; btn.disabled = false; }
  }
  async function modifyPlan(text, opts = {}) {
    text = String(text || "").trim().slice(0, 300); if (!text || !S.plan.result) return;
    const f = S.plan.form; const r = S.plan.result;
    const isTr = !!opts.translate;
    S.plan.chat.push({ role: "user", text, lang: S.lang }); save();
    const msgs = $("#plan-msgs"); msgs.insertAdjacentHTML("beforeend", `<div class="msg u">${esc(text)}</div><div class="msg a" id="pending">${loadingDots()}</div>`); msgs.scrollTop = msgs.scrollHeight;
    const current = r.items.map(x => ({ title: x.title, type: x.type, start: P.fmt(x.start), end: P.fmt(x.end), cost: x.cost, place: x.place, venue: x.venue, maps: x.maps, note: x.note }));
    const history = S.plan.chat.slice(-7, -1).map(m => `${m.role}: ${m.text}`).join("\n");
    const prompt = `${planPromptBase(f)}

Current constraints: budget ${r.budget} SAR, bufferMinutes ${r.buffer}, kickoff ${P.fmt(r.kickoff)}, dayStart ${P.fmt(r.dayStart)}.
Current plan JSON: ${JSON.stringify(current)}
Recent conversation:
${history || "(none)"}
The fan now says: "${text}"
Update the plan to satisfy the request. If they change the budget, arrival buffer, kickoff or start time, put the new value in "constraints". If they ask to switch language, keep the JSON but write the text fields in the requested language. Keep everything they didn't ask to change. "reply" briefly says what changed. Return the complete updated JSON only.`;
    try {
      const json = await aiJSON(prompt);
      const nr = applyPlan(json, f);
      const fresh = { role: "assistant", text: json.reply ? String(json.reply).slice(0, 800) : "", n: nr.items.length, cost: nr.total, lang: S.lang };
      if (isTr) S.plan.chat = [fresh]; else S.plan.chat.push(fresh);
      save(); render();
    } catch (e) {
      S.plan.chat.pop(); save();
      const p = $("#pending"); if (p) { p.className = "msg err"; p.textContent = aiError(e); p.id = ""; }
    }
  }

  function vBudget() {
    const b = S.budget;
    return `<div class="md-grid">${planForm(`<p class="src" style="margin-bottom:10px">${t("bb.p")}</p><button class="btn btn-gold" type="submit" style="width:100%">${t("bb.go")} <span class="arrow">→</span></button>`)}
      <section class="panel" id="bb-out">${b ? budgetOut(b) : `<h2>${t("md.tBudget")}</h2><p class="notice info">${t("bb.p")}</p>`}</section></div>`;
  }
  function budgetOut(b) {
    const max = Math.max(1, b.budget);
    const stars = (n, m) => "●".repeat(n) + "○".repeat(Math.max(0, m - n));
    return `<div class="tl-h" style="margin-bottom:14px"><h2 style="margin:0">${t("md.tBudget")} · ${sar(b.budget)}</h2><span class="pill ai">${t("aiGen")} · ${t("estimate")}</span></div>
      <div class="plans">${b.plans.map((p, i) => `<article class="plan p${i + 1}"><span class="eyebrow">${t("bb." + p.tier)}</span>
        <div class="cost">${sar(p.total)}</div><div class="meter"><i style="width:${Math.min(100, p.total / max * 100)}%"></i></div>
        ${p.trimmed ? `<span class="pill bad">${t("bb.over")}</span>` : ""}
        <p style="font-size:14px">${esc(p.summary)}</p>
        <div class="rate"><span>${t("bb.acts")}</span><b>${nf(p.items.length)}</b></div>
        <div class="rate"><span>${t("bb.cx")}</span><b>${stars(p.complexity, 3)}</b></div>
        <div class="rate"><span>${t("bb.cv")}</span><b>${stars(p.culture, 5)}</b></div>
        ${p.hours ? `<div class="rate"><span>${t("bb.time")}</span><b class="num">${nf(p.hours)} h</b></div>` : ""}
        <ul>${p.items.map(x => `<li>${esc(x.title)} · ${sar(x.cost)}</li>`).join("")}</ul>
        <button class="btn btn-ghost btn-sm" data-useplan="${i}">${t("bb.use")}</button></article>`).join("")}</div>`;
  }
  async function generateBudget() {
    const f = readForm(); const out = $("#bb-out"); out.innerHTML = `<h2>${t("md.tBudget")}</h2><div class="shimmer"></div><div class="shimmer"></div>`;
    const st = stadium(f.stadium);
    const prompt = `${fanContext()}
Create three alternative plans for one hypothetical matchday in ${D.CITIES[f.city].name.en} before a match at ${st.name.en} (kickoff ${f.kickoff}, arrive ${f.buffer} min early), budget ${f.budget} SAR per person for the whole day including transport. Interests: ${f.interests.join(", ")}. Food: ${f.food || "none given"}. Transport: ${f.transport.join(", ")}.
Tiers: "economy" (well under budget), "balanced", "premium" (best experience, still within budget). Use real well-known places only; no specific restaurant names. Costs are integer SAR estimates.
Return JSON only: {"plans":[{"tier":"economy|balanced|premium","summary":string(one sentence),"complexity":1-3,"culture":1-5,"hours":number,"items":[{"title":string,"cost":number}]}]}`;
    try {
      const json = await aiJSON(prompt);
      if (!json || !Array.isArray(json.plans)) throw { code: "bad_json" };
      const tiers = ["economy", "balanced", "premium"];
      const plans = tiers.map(tier => {
        const p = json.plans.find(x => x && x.tier === tier) || json.plans[tiers.indexOf(tier)];
        if (!p) return null;
        const fit = P.fitBudget(p, f.budget);
        return { tier, summary: String(p.summary || "").slice(0, 240), complexity: Math.min(3, Math.max(1, Math.round(p.complexity) || 2)), culture: Math.min(5, Math.max(1, Math.round(p.culture) || 3)), hours: Number(p.hours) > 0 && Number(p.hours) < 24 ? Math.round(p.hours * 10) / 10 : null, items: fit.items, total: fit.total, trimmed: fit.trimmed };
      }).filter(Boolean);
      if (!plans.length) throw { code: "bad_json" };
      S.budget = { budget: f.budget, plans }; save(); out.innerHTML = budgetOut(S.budget);
    } catch (e) { out.innerHTML = `<h2>${t("md.tBudget")}</h2><div class="notice err">${esc(aiError(e))}</div>`; }
  }

  function vRescue() {
    const f = S.plan.form;
    return `<div class="md-grid"><form class="panel rescue" id="rescueform"><h2>${t("rs.t")}</h2><p style="color:var(--muted);margin-bottom:14px">${t("rs.p")}</p>
      <div class="form-grid">
        <div class="field full"><label for="r-st">${t("f.stadium")}</label><select id="r-st" class="input">${D.STADIUMS.map(s => `<option value="${s.id}" ${f.stadium === s.id ? "selected" : ""}>${esc(L(s.name))} · ${esc(L(D.CITIES[s.city].name))}</option>`).join("")}</select></div>
        <div class="field full"><label for="r-where">${t("rs.where")}</label><input id="r-where" class="input" required maxlength="140" placeholder="${t("rs.wherePh")}"></div>
        <div class="field"><label for="r-min">${t("rs.min")}</label><input id="r-min" type="number" class="input num" min="0" max="600" value="60" required></div>
        <div class="field"><span class="lbl-sm">${t("f.transport")}</span><div class="checks">${["metro", "taxi", "walk", "car"].map(k => `<label><input type="checkbox" name="rtr" value="${k}" ${f.transport.includes(k) ? "checked" : ""}>${t("tr." + k)}</label>`).join("")}</div></div>
        <div class="field full"><label for="r-what">${t("rs.what")}</label><textarea id="r-what" class="input" rows="3" maxlength="400" placeholder="${t("rs.whatPh")}"></textarea></div>
      </div><button class="btn btn-gold" style="width:100%;margin-top:14px">${t("rs.go")}</button></form>
      <section class="panel" id="rs-out" hidden></section></div>`;
  }
  const STADIUM_METRO = {
    "king-fahd": "Red Line (2) eastern terminus, King Fahd Sports City station, right next to the stadium.",
    "king-saud-university": "Red Line (2) western terminus, King Saud University station, on the university campus; finish on foot or by a short taxi to the stadium.",
  };
  async function runRescue() {
    const st = stadium($("#r-st").value), where = $("#r-where").value.trim().slice(0, 140), mins = Math.max(0, Math.min(600, Math.round(Number($("#r-min").value) || 0))), what = $("#r-what").value.trim().slice(0, 400);
    const modes = $$('input[name="rtr"]:checked').map(x => x.value);
    const out = $("#rs-out"); out.hidden = false;
    if (!where) { $("#r-where").focus(); return; }
    out.innerHTML = `<div class="shimmer"></div><div class="shimmer"></div>`;
    const city = D.CITIES[st.city];
    const dest = encodeURIComponent(`${st.name.en}, ${city.name.en}, Saudi Arabia`), origin = encodeURIComponent(where + ", " + city.name.en + ", Saudi Arabia");
    const tmode = modes.includes("metro") && st.city === "riyadh" && !modes.includes("taxi") && !modes.includes("car") ? "transit" : modes.length === 1 && modes[0] === "walk" ? "walking" : "driving";
    const metroOnly = modes.length > 0 && modes.every(m => m === "metro" || m === "walk");
    const metroInfo = st.city === "riyadh" ? `
Riyadh Metro facts you can rely on (opened Dec 2024 / Jan 2025, 6 lines, 85 stations):
- Blue Line (1): north–south along Olaya Street and Al Batha, SAB Bank ↔ Ad Dar Al-Baida, via KAFD, STC station and National Museum.
- Red Line (2): east–west along King Abdullah Road, King Saud University ↔ King Fahd Sports City (15 stations). Interchanges: Blue Line at STC, Green Line at Ministry of Education, Purple Line at Al Hamra.
- Orange Line (3): east–west, Jeddah Road ↔ Khashm Al-An.
- Yellow Line (4): Airport T1-2 ↔ KAFD.
- Green Line (5): King Abdulaziz Road, Ministry of Education ↔ National Museum.
- Purple Line (6): passes KAFD and Al Hamra.
- KAFD station links Blue, Yellow and Purple lines.
${STADIUM_METRO[st.id] ? "- For this stadium: " + STADIUM_METRO[st.id] : "- For this stadium no confirmed station is listed: say which line runs closest and tell them to finish by taxi or on foot."}
Only use station names that appear above or that you are certain exist. If you are not sure which station is closest to the fan, name the line and the nearest major road/interchange instead of guessing a station name.` : `
${city.name.en} has no metro. Do not suggest one.`;
    const prompt = `${fanContext()}
A fan needs urgent, calm help reaching ${st.name.en} in ${city.name.en}. They are at: "${where}". Kickoff is in ${mins} minutes. Transport they want to use: ${modes.join(", ") || "any"}. What they wrote: "${what || "running late"}".
${metroInfo}
Rules:
- Answer what they actually asked. If they ask for a metro route, give a concrete metro route: how to reach the nearest station from "${where}", which line and direction, any transfer station, the station to get off at, and the last walk to the gate.
- ${metroOnly ? "They chose metro/walking, so the main plan MUST use the metro (with walking). Mention a taxi only as a one-line backup if time is too short." : "Recommend the fastest of their chosen modes first."}
- Never tell them to download, open or use any app (no "open Darb", no "check the app"). A Google Maps directions button is shown under your answer, so you may say "the Maps button below shows live times".
- You have no live traffic or timetables: give a rough door-to-door estimate in minutes (or null) and say it is an estimate. Be honest if they may miss kickoff.
- Max 6 short steps.
Return JSON only: {"headline":string,"estimateMinutes":number|null,"steps":[string],"message":string}`;
    try {
      const j = await aiJSON(prompt);
      const est = Number.isFinite(Number(j.estimateMinutes)) && j.estimateMinutes !== null ? Math.round(j.estimateMinutes) : null;
      // Deterministic severity from the AI's travel estimate vs. time left.
      let sev = "tight";
      if (est != null) sev = est > mins ? "critical" : (mins - est <= 20 ? "tight" : "ok");
      else if (mins <= 30) sev = "critical";
      const steps = (Array.isArray(j.steps) ? j.steps : []).slice(0, 6).map(s => String(s).slice(0, 240));
      out.innerHTML = `<div class="tl-h"><span class="sev ${sev}">${sev === "ok" ? "✓" : "!"} ${t("rs." + sev)}</span><span class="pill ai">${t("aiGen")}</span></div>
        <h2 style="margin-top:14px">${esc(String(j.headline || "").slice(0, 160))}</h2>
        ${est != null ? `<p class="src">${t("estimate")}: ~${nf(est)} ${t("count.m")} · ${t("rs.min")}: ${nf(mins)}</p>` : ""}
        <h3 style="font-family:var(--body);font-size:15px;margin-top:16px;color:var(--gold)">${t("rs.steps")}</h3><ol class="steps">${steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
        ${j.message ? `<p style="margin-top:12px;color:var(--muted)">${esc(String(j.message).slice(0, 500))}</p>` : ""}
        <a class="btn btn-gold" style="margin-top:16px;width:100%" href="https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=${tmode}" target="_blank" rel="noopener">${t(tmode === "transit" ? "rs.dirMetro" : "rs.dir")} <span class="arrow">→</span></a>`;
    } catch (e) { out.innerHTML = `<div class="notice err">${esc(aiError(e))}</div><a class="btn btn-gold" style="margin-top:12px" href="https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=${tmode}" target="_blank" rel="noopener">${t("rs.dir")}</a>`; }
  }

  /* ---------- Discover ---------- */
  let dTab = "taste"; const trChat = [];
  function vDiscover() {
    return `<div class="wrap fade-page"><header class="page-head"><span class="eyebrow">${t("hero.eyebrow")}</span><h1>${t("d.t")}</h1><p>${t("d.p")}</p></header>
      <div class="tabs" role="tablist">${[["taste", "d.taste"], ["tr", "d.tr"], ["ms", "d.ms"]].map(([k, l]) => `<button role="tab" data-dtab="${k}" aria-selected="${dTab === k}">${t(l)}</button>`).join("")}</div>
      <div id="dpanel">${dTab === "taste" ? vTaste() : dTab === "tr" ? vTranslator() : vMission()}</div></div>`;
  }
  const DISH_KIND = { kabsa: ["main"], jareesh: ["main"], qursan: ["main"], saleeg: ["main"], mandi: ["main"], mutabbaq: ["snack"], masoub: ["breakfast", "sweet"], ful: ["breakfast"], sayadiya: ["main"], balaleet: ["breakfast", "sweet"], harees: ["main"], coffee: ["drink"], marqooq: ["main"], maqshush: ["sweet"], mantu: ["main"], sobia: ["drink"], muhammar: ["main", "sweet"], miflaq: ["main"], redbread: ["snack", "breakfast"], luqaimat: ["sweet"] };
  const KIND_WORDS = {
    sweet: /حل[اىو]|حلويات|حلوي|سكر|dessert|sweet|candy|디저트|단\s?것|달콤|甘い|スイーツ|デザート|お菓子/i,
    drink: /مشروب|اشرب|أشرب|عطش|قهو[ةه]|عصير|drink|beverage|coffee|thirst|음료|마실|커피|飲み物|飲む|コーヒー/i,
    breakfast: /فطور|ريوق|صباح|breakfast|morning|아침|朝食|朝ごはん/i,
    snack: /سناك|خفيف|snack|light bite|간식|軽食|おやつ/i,
    main: /غدا|غداء|عشا|عشاء|وجب[ةه]|رز|أرز|لحم|جوعان|lunch|dinner|main|hungry|rice|meat|점심|저녁|식사|배고|昼食|夕食|ご飯|お腹/i,
  };
  function detectKind(q) { for (const k of ["sweet", "drink", "breakfast", "snack", "main"]) if (KIND_WORDS[k].test(q)) return k; return ""; }
  function dishCities(id) { return Object.keys(D.CITIES).filter(c => (D.CITIES[c].food || []).includes(id)); }
  function vTaste() {
    return `<p style="color:var(--muted);margin-bottom:16px">${t("ta.p")}</p>
      <div class="md-grid" style="margin-bottom:22px"><form class="panel" id="tasteform"><h2>${t("d.taste")} · AI</h2><div class="form-grid">
        <div class="field full"><label for="ta-q">${t("ta.want")}</label><input id="ta-q" class="input" maxlength="160" required placeholder="${esc(t("ta.wantPh"))}"></div>
        <div class="field"><label for="ta-city">${t("f.city")}</label><select id="ta-city" class="input">${Object.entries(D.CITIES).map(([id, c]) => `<option value="${id}" ${S.plan.form.city === id ? "selected" : ""}>${esc(L(c.name))}</option>`).join("")}</select></div>
        <div class="field"><label for="ta-diet">${t("ta.diet")}</label><input id="ta-diet" class="input" maxlength="120" placeholder="${t("ta.dietPh")}"></div>
      </div><button class="btn btn-gold" style="width:100%;margin-top:14px">${t("ta.go")}</button></form>
      <section id="ta-out" hidden></section></div>
      <div class="dishes2">${D.DISHES.map(dishCard).join("")}</div>`;
  }
  async function runTaste() {
    const out = $("#ta-out"); const cityId = $("#ta-city").value; const city = D.CITIES[cityId];
    const q = $("#ta-q").value.trim().slice(0, 160); const diet = $("#ta-diet").value.trim().slice(0, 120);
    if (!q) { $("#ta-q").focus(); return; }
    out.hidden = false; out.innerHTML = `<div class="panel">${aiBox(loadingDots())}</div>`;
    const wanted = detectKind(q);
    const catalog = D.DISHES.map(d => `${d.id} | ${d.name.en} (${d.ar}) | kind: ${(DISH_KIND[d.id] || ["main"]).join("/")} | cities: ${dishCities(d.id).map(c => D.CITIES[c].name.en).join(", ") || "-"} | ingredients: ${d.ing ? d.ing.en : "-"}`).join("\n");
    const prompt = `${fanContext()}
You are "Saudi Taste". The visitor is in ${city.name.en} and wrote: "${q}". Dietary needs: ${diet || "none given"}.
Pick EXACTLY ONE dish from this catalog (use its id) that best answers what they asked for. If they ask for something sweet, pick a dish whose kind includes "sweet"; for a drink, "drink"; for breakfast, "breakfast". Prefer dishes served in ${city.name.en}. Never pick a dish that conflicts with their dietary needs.
Catalog:
${catalog}
Reply with JSON only: {"kind":"sweet|main|breakfast|drink|snack","id":"<catalog id>","why":"<1-2 sentences: why this dish fits their request>","tip":"<1 short practical tip: how or when locals enjoy it>","allergens":"<short note on allergens relevant to their needs, or empty>"}`;
    try {
      const r = await aiJSON(prompt);
      const byId = id => D.DISHES.find(d => d.id === id);
      const kind = wanted || (r && DISH_KIND[r.id] && r.kind) || "";
      const fits = d => d && (!kind || (DISH_KIND[d.id] || []).includes(kind));
      let dish = r && byId(String(r.id || "").trim());
      let corrected = false;
      if (!fits(dish)) {
        const inCity = (city.food || []).map(byId).filter(fits);
        dish = inCity[0] || D.DISHES.filter(fits)[0] || dish;
        corrected = true;
      }
      if (!dish) throw new Error("no dish");
      const here = (city.food || []).includes(dish.id);
      out.innerHTML = `<div class="panel ta-pick"><span class="eyebrow">${t("ta.pick")}</span>
        <div class="dishes2 one">${dishCard(dish)}</div>
        ${(() => { const inner = `${!corrected && r.why ? `<p>${esc(r.why)}</p>` : ""}${!corrected && r.tip ? `<p><b>${t("ta.tip")}</b> ${esc(r.tip)}</p>` : ""}${!corrected && r.allergens ? `<p class="src">${esc(r.allergens)}</p>` : ""}${here ? "" : `<p class="src">${t("ta.elsewhere", { city: esc(L(city.name)) })}</p>`}`; return inner ? aiBox(inner) : ""; })()}</div>`;
      out.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (e) { out.innerHTML = `<div class="notice err">${esc(aiError(e))}</div>`; }
  }
  function vTranslator() {
    return `<div class="panel" style="max-width:820px"><h2>${t("d.tr")}</h2><p style="color:var(--muted);margin-bottom:14px">${t("tr.p")}</p>
      <div class="chat"><div class="msgs" id="tr-msgs" aria-live="polite">${trChat.map(m => m.role === "user" ? `<div class="msg u">${esc(m.content)}</div>` : aiBox(prose(m.content))).join("")}</div>
      <div class="sugs">${["tr.s1", "tr.s2", "tr.s3", "tr.s4"].map(k => `<button type="button" data-trs="${esc(t(k))}">${esc(t(k))}</button>`).join("")}</div>
      <form class="chat-in" id="trform"><label for="trq" class="sr">${t("d.tr")}</label><input id="trq" class="input" maxlength="300" placeholder="${esc(t("tr.ph"))}" autocomplete="off"><button class="btn btn-gold">${t("send")}</button></form></div></div>`;
  }
  async function askTranslator(q) {
    q = String(q || "").trim().slice(0, 300); if (!q) return;
    trChat.push({ role: "user", content: q });
    const box = $("#tr-msgs"); box.insertAdjacentHTML("beforeend", `<div class="msg u">${esc(q)}</div><div class="msg a" id="trp">${loadingDots()}</div>`); box.scrollTop = box.scrollHeight;
    const sys = `${fanContext()}
You are the Cultural Translator: explain Arabic phrases, Saudi dialect (Najdi, Hijazi etc.), meanings in context, etiquette, and a simple pronunciation in Latin letters. Answer briefly (under 120 words). If unsure about a dialect detail, say so.`;
    const msgs = [{ role: "user", content: sys + "\n\nFirst question: " + trChat[0].content }].concat(trChat.slice(1).map(m => ({ role: m.role, content: m.content })));
    try {
      const txt = await aiText(msgs, x => { const p = $("#trp"); if (p) p.innerHTML = `<span class="pill ai tag">${t("aiGen")}</span>${prose(x)}`; }, { noLangGuard: true });
      trChat.push({ role: "assistant", content: txt }); const p = $("#trp"); if (p) p.id = "";
    } catch (e) { trChat.pop(); const p = $("#trp"); if (p) { p.className = "msg err"; p.textContent = aiError(e); p.id = ""; } }
  }

  function vMission() {
    const m = S.mission || (S.mission = { i: 0, score: 0, answered: null, ai: null });
    const total = D.MISSIONS.length;
    if (m.i >= total && !m.ai) return `<div class="panel mission"><h2 class="score-pop">${t("ms.done", { p: nf(m.score) })}</h2><p style="color:var(--muted);margin:10px 0 18px">${t("ms.p")}</p><div class="stack" style="flex-direction:row;flex-wrap:wrap"><button class="btn btn-ghost" data-ms-again>${t("ms.again")}</button><button class="btn btn-gold" data-ms-ai>${t("ms.ai")}</button></div><div id="ms-ai-out" style="margin-top:16px"></div></div>`;
    const sc = m.ai || D.MISSIONS[m.i];
    const scene = m.ai ? sc.scene : L(sc.scene), choices = m.ai ? sc.choices : sc.choices.map(L), why = m.ai ? sc.why : L(sc.why), correct = sc.correct;
    return `<div class="panel mission"><div class="tl-h"><span class="eyebrow">${m.ai ? t("aiGen") : t("ms.n", { n: nf(m.i + 1), t: nf(total) })}</span><span class="pill">${t("ms.score")}: ${nf(m.score)}</span></div>
      <div class="progress"><i style="width:${m.ai ? 100 : (m.i / total * 100)}%"></i></div>
      
      <p class="scene">${esc(scene)}</p>
      <div class="choices">${choices.map((c, i) => `<button class="choice ${m.answered != null ? (i === correct ? "right" : i === m.answered ? "wrong" : "") : ""}" data-msc="${i}" ${m.answered != null ? "disabled" : ""}><span class="k">${"ABC"[i]}</span><span>${esc(c)}</span></button>`).join("")}</div>
      ${m.answered != null ? `<div class="explain" role="status"><b>${m.answered === correct ? "✓ " + t("ms.right") : t("ms.wrong")}</b><p style="margin-top:6px">${esc(why)}</p></div><button class="btn btn-gold" style="margin-top:14px" data-ms-next>${t("ms.next")} <span class="arrow">→</span></button>` : ""}</div>`;
  }
  async function aiMission() {
    const out = $("#ms-ai-out") || $("#dpanel"); out.innerHTML = aiBox(loadingDots());
    const prompt = `${fanContext()}
Create one short, respectful, realistic etiquette scenario a football fan visiting Saudi Arabia for the Asian Cup might face (e.g. at a souq, a family invitation, a mosque visit, public transport, the stadium). Avoid stereotypes; reflect widely documented customs only. Three choices, exactly one clearly best.
Return JSON only: {"scene":string,"choices":[string,string,string],"best":0|1|2,"why":string}`;
    try {
      const j = await aiJSON(prompt);
      if (!j || typeof j.scene !== "string" || !Array.isArray(j.choices) || j.choices.length < 3) throw { code: "bad_json" };
      const best = [0, 1, 2].includes(j.best) ? j.best : 0;
      S.mission.ai = { scene: j.scene.slice(0, 500), choices: j.choices.slice(0, 3).map(c => String(c).slice(0, 200)), why: String(j.why || "").slice(0, 500), correct: best };
      S.mission.answered = null; save(); $("#dpanel").innerHTML = vMission();
    } catch (e) { out.innerHTML = `<div class="notice err">${esc(aiError(e))}</div>`; }
  }

  /* ---------- Challenges ---------- */
  let cTab = "quiz", predA = null, predB = null;
  function vChallenges() {
    return `<div class="wrap fade-page"><header class="page-head"><span class="eyebrow">${t("hero.eyebrow")}</span><h1>${t("ch.t")}</h1><p>${t("ch.p")}</p></header>
      <div class="tabs" role="tablist">${[["quiz", "ch.quiz"], ["pred", "ch.pred"]].map(([k, l]) => `<button role="tab" data-ctab="${k}" aria-selected="${cTab === k}">${t(l)}</button>`).join("")}</div>
      <div id="cpanel">${cTab === "quiz" ? vQuiz() : vPred()}</div></div>`;
  }
  const rnd = n => Math.floor(Math.random() * n);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  // Every question is about the fan's own team, built from verified data with a fixed answer key.
  function buildQuiz(diff, team) {
    const F = D.FINALISTS, H = window.FV_HISTORY, T = team;
    const f = F[T]; if (!f) return null;
    const fin = Object.keys(F), easy = [], medium = [], hard = [];
    const mk = (bucket, key, vars, answer, distract, ex) => { const opts = shuffle([answer].concat(shuffle(distract).slice(0, 3))); bucket.push({ key, vars, opts, ans: opts.findIndex(o => JSON.stringify(o) === JSON.stringify(answer)), ex }); };
    const me = { tm: T }, mates = D.GROUP_ORDER[f.g].filter(x => x !== T), others = fin.filter(x => F[x].g !== f.g);
    const won = H.finals.filter(x => x.w === T), lost = H.finals.filter(x => x.r === T), hosted = H.finals.filter(x => x.host.includes(T));
    const years = H.finals.map(x => x.y);
    const TF = (window.FV_TEAMFACTS || {})[T] || {}, ALLF = window.FV_TEAMFACTS || {};
    const REG = { arab: ["SA", "AE", "KW", "QA", "IQ", "JO", "OM", "PS", "BH", "SY", "YE"], east: ["JP", "KR", "CN", "KP", "AU"], central: ["IR", "UZ", "KG", "TJ"], sea: ["TH", "VN", "ID", "SG"] };
    const region = Object.values(REG).find(r => r.includes(T)) || fin;
    const nums = (x, spread) => { const out = new Set(); [1, 2, 3, -1, -2, 4, 5, -3, 6].forEach(k => { const v = x + k * spread; if (v >= 0 && v !== x) out.add(v); }); return [...out]; };
    const yearsNear = y => nums(y, 4).filter(v => v > 1900 && v < 2030);
    const playerPool = exclude => { const pool = []; const add = c => { const r = ALLF[c]; if (!r) return; [r.top, r.caps].forEach(o => { if (o && o.p && o.p.en !== exclude.en && !pool.some(q => q.en === o.p.en)) pool.push(o.p); }); };
      if (TF.top && TF.caps && TF.top.p.en !== TF.caps.p.en) pool.push(TF.top.p.en === exclude.en ? TF.caps.p : TF.top.p);
      shuffle(region.filter(c => c !== T)).forEach(add); if (pool.length < 3) shuffle(fin.filter(c => c !== T)).forEach(add); return pool.map(p => ({ pl: p })); };
    // Three separate banks per team. Every question lives in exactly one level, and all of them celebrate the team.
    // EASY: what most fans of this team know
    mk(easy, "qt.group", { team: me }, { g: f.g }, "ABCDEF".split("").filter(g => g !== f.g).map(g => ({ g })), { key: "ex.group", vars: { team: me, g: f.g } });
    mk(easy, "qt.mate", { team: me }, { tm: shuffle(mates)[0] }, shuffle(others).slice(0, 6).map(x => ({ tm: x })), { key: "ex.mate", vars: { g: f.g, list: { tms: D.GROUP_ORDER[f.g] } } });
    mk(easy, "qt.route", { team: me }, { r: f.route }, ["host", "r2w", "r2r", "r3w"].filter(r => r !== f.route).map(r => ({ r })), { key: "ex.route", vars: { team: me, r: { r: f.route } } });
    if (TF.nick) mk(easy, "qt.nick", { team: me }, { nk: T }, shuffle(region.concat(fin).filter((c, i, arr) => c !== T && arr.indexOf(c) === i && ALLF[c] && ALLF[c].nick)).map(c => ({ nk: c })), { key: "ex.nick", vars: { team: me, nk: { nk: T } } });
    if (TF.top) mk(easy, "qt.topScorer", { team: me }, { pl: TF.top.p }, playerPool(TF.top.p), { key: "ex.topScorer", vars: { team: me, p: { pl: TF.top.p }, n: TF.top.n ? { gl: TF.top.n } : "" } });
    if (won.length) mk(easy, "qt.titles", { team: me }, { n: won.length }, [1, 2, 3, 4, 5, 6].filter(x => x !== won.length).map(n => ({ n })), { key: "ex.titles", vars: { team: me, n: won.length, y: { yrs: won.map(x => x.y) } } });
    if (TF.wc && TF.wc.n > 0) mk(easy, "qt.wcEver", { team: me }, { yn: true }, [{ yn: false }], { key: "ex.wc", vars: { team: me, n: TF.wc.n, y: TF.wc.first || "" } });
    mk(easy, "qt.best", { team: me }, { f: f.best }, ["winners", "runnerup", "third", "fourth", "qf", "r16", "group"].filter(x => x !== f.best).map(x => ({ f: x })), { key: "ex.best", vars: { team: me, f: { f: f.best }, y: { yrs: f.years || f.bestYears } } });
    if (TF.home) mk(easy, "qt.home", { team: me }, { st2: TF.home }, shuffle(fin.filter(c => c !== T && ALLF[c] && ALLF[c].home)).map(c => ({ st2: ALLF[c].home })), { key: "ex.home", vars: { team: me, st: { st2: TF.home } } });
    if (mates.length >= 3) { const out = shuffle(others)[0]; mk(easy, "qt.notMate", { team: me }, { tm: out }, mates.map(x => ({ tm: x })), { key: "ex.mate", vars: { g: f.g, list: { tms: D.GROUP_ORDER[f.g] } } }); }
    // MEDIUM: records a keen fan knows
    if (TF.caps) mk(medium, "qt.caps", { team: me }, { pl: TF.caps.p }, playerPool(TF.caps.p), { key: "ex.caps", vars: { team: me, p: { pl: TF.caps.p }, n: TF.caps.n ? { cp: TF.caps.n } : "" } });
    if (TF.wc && TF.wc.n > 0) {
      mk(medium, "qt.wcApps", { team: me }, { n: TF.wc.n }, nums(TF.wc.n, 1).map(n => ({ n })), { key: "ex.wc", vars: { team: me, n: TF.wc.n, y: TF.wc.first } });
      mk(medium, "qt.wcFirst", { team: me }, { y: TF.wc.first }, yearsNear(TF.wc.first).map(y => ({ y })), { key: "ex.wc", vars: { team: me, n: TF.wc.n, y: TF.wc.first } });
      if (TF.wc.best) mk(medium, "qt.wcBest", { team: me }, { f: TF.wc.best }, ["group", "r16", "qf", "fourth", "third"].filter(x => x !== TF.wc.best).map(x => ({ f: x })), { key: "ex.wcBest", vars: { team: me, f: { f: TF.wc.best } } });
    }
    if (TF.regional && TF.regional.n > 0) mk(medium, "qt.regional", { team: me, cup: { cup: TF.regional.cup } }, { n: TF.regional.n }, nums(TF.regional.n, 1).map(n => ({ n })), { key: "ex.regional", vars: { team: me, cup: { cup: TF.regional.cup }, n: TF.regional.n, y: TF.regional.yrs } });
    if (hosted.length) { const h = hosted[rnd(hosted.length)].y; mk(medium, "qt.hosted", { team: me }, { y: h }, years.filter(y => !hosted.some(x => x.y === y)).map(y => ({ y })), { key: "ex.hosted", vars: { team: me, list: { yrs0: hosted.map(x => x.y) } } }); }
    if (TF.ac && TF.ac.first) mk(medium, "qt.debut", { team: me }, { y: TF.ac.first }, years.filter(y => y !== TF.ac.first).map(y => ({ y })), { key: "ex.debut", vars: { team: me, y: TF.ac.first } });
    if (won.length) { const w = won[rnd(won.length)].y; mk(medium, "qt.winYear", { team: me }, { y: w }, years.filter(y => !won.some(x => x.y === y)).map(y => ({ y })), { key: "ex.winYear", vars: { team: me, list: { yrs0: won.map(x => x.y) } } }); }
    const SUB = { waff: ["SA", "AE", "KW", "QA", "IQ", "JO", "OM", "PS", "BH", "SY", "YE"], cafa: ["IR", "UZ", "KG", "TJ"], eaff: ["JP", "KR", "CN", "KP"], aff: ["AU", "SG", "VN", "TH", "ID"] };
    const sub = Object.keys(SUB).find(k => SUB[k].includes(T));
    if (sub) mk(medium, "qt.subconf", { team: me }, { sc: sub }, ["waff", "cafa", "eaff", "aff", "saff"].filter(x => x !== sub).map(x => ({ sc: x })), { key: "ex.subconf", vars: { team: me, sc: { sc: sub } } });
    if (TF.ac && TF.ac.n) mk(medium, "qt.acApps", { team: me }, { n: TF.ac.n }, nums(TF.ac.n, 1).concat(nums(TF.ac.n, 2)).filter((v, i, a) => a.indexOf(v) === i && v > 0).map(n => ({ n })), { key: "ex.acApps", vars: { team: me, n: TF.ac.n } });
    const bestYrs = (f.years || f.bestYears || []).filter(y => y < 2027);
    if (bestYrs.length && f.best !== "winners") { const y = bestYrs[rnd(bestYrs.length)]; mk(medium, "qt.bestYear", { team: me, f: { f: f.best } }, { y }, years.filter(v => !bestYrs.includes(v)).map(v => ({ y: v })), { key: "ex.best", vars: { team: me, f: { f: f.best }, y: { yrs: bestYrs } } }); }
    const t4 = H.top4[T] || 0;
    if (t4 > 0) mk(medium, "qt.top4", { team: me }, { n: t4 }, [1, 2, 3, 4, 5, 6, 8, 10].filter(x => x !== t4).map(n => ({ n })), { key: "ex.top4", vars: { team: me, n: t4 } });
    // HARD: deep history
    if (TF.top && TF.top.n) mk(hard, "qt.topGoals", { team: me, p: { pl: TF.top.p } }, { n: TF.top.n }, nums(TF.top.n, Math.max(2, Math.round(TF.top.n / 8))).map(n => ({ n })), { key: "ex.topScorer", vars: { team: me, p: { pl: TF.top.p }, n: { gl: TF.top.n } } });
    if (TF.caps && TF.caps.n) mk(hard, "qt.capsN", { team: me, p: { pl: TF.caps.p } }, { n: TF.caps.n }, nums(TF.caps.n, Math.max(3, Math.round(TF.caps.n / 10))).map(n => ({ n })), { key: "ex.caps", vars: { team: me, p: { pl: TF.caps.p }, n: { cp: TF.caps.n } } });
    if (TF.first) mk(hard, "qt.firstIntl", { team: me, y: TF.first.y }, { tm: TF.first.opp }, shuffle(D.AFC.concat(["MA", "LY", "MX", "EG"]).filter(c => c !== T && c !== TF.first.opp)).map(c => ({ tm: c })), { key: "ex.firstIntl", vars: { team: me, y: TF.first.y, o: { tm: TF.first.opp } } });
    if (TF.big) mk(hard, "qt.bigWin", { team: me, o: { tm: TF.big.opp }, y: TF.big.y }, { s: TF.big.s }, (() => { const g = parseInt(TF.big.s, 10); return nums(g, 2).map(v => ({ s: v + "–" + (TF.big.s.split("–")[1]) })); })(), { key: "ex.bigWin", vars: { team: me, s: TF.big.s, o: { tm: TF.big.opp }, y: TF.big.y } });
    if (TF.big) mk(hard, "qt.bigWinOpp", { team: me, s: TF.big.s, y: TF.big.y }, { tm: TF.big.opp }, shuffle(D.AFC.filter(c => c !== T && c !== TF.big.opp)).map(c => ({ tm: c })), { key: "ex.bigWin", vars: { team: me, s: TF.big.s, o: { tm: TF.big.opp }, y: TF.big.y } });
    if (TF.regional && TF.regional.n > 0) { const fy = parseInt(String(TF.regional.yrs), 10); if (fy > 1900) mk(hard, "qt.regFirst", { team: me, cup: { cup: TF.regional.cup } }, { y: fy }, yearsNear(fy).map(y => ({ y })), { key: "ex.regional", vars: { team: me, cup: { cup: TF.regional.cup }, n: TF.regional.n, y: TF.regional.yrs } }); }
    if (TF.founded) mk(hard, "qt.founded", { team: me }, { y: TF.founded }, yearsNear(TF.founded).map(y => ({ y })), { key: "ex.founded", vars: { team: me, y: TF.founded } });
    if (TF.afc) mk(hard, "qt.afc", { team: me }, { y: TF.afc }, [1954, 1964, 1974, 1980, 1993, 2002, 2006].filter(y => y !== TF.afc).map(y => ({ y })), { key: "ex.afc", vars: { team: me, y: TF.afc } });
    if (TF.fifa) mk(hard, "qt.fifa", { team: me }, { y: TF.fifa }, yearsNear(TF.fifa).map(y => ({ y })), { key: "ex.fifa", vars: { team: me, y: TF.fifa } });
    if (won.length) {
      mk(hard, "qt.first", { team: me }, { y: won[0].y }, years.filter(y => y !== won[0].y).map(y => ({ y })), { key: "ex.first", vars: { team: me, y: won[0].y } });
      if (won.length > 1) mk(hard, "qt.latest", { team: me }, { y: won[won.length - 1].y }, years.filter(y => y !== won[won.length - 1].y).map(y => ({ y })), { key: "ex.latest", vars: { team: me, y: won[won.length - 1].y } });
      won.filter(x => x.s).forEach(x => {
        mk(hard, "qt.finalOpp", { team: me, y: x.y }, { tm: x.r }, fin.filter(c => c !== T && c !== x.r).map(c => ({ tm: c })), { key: "ex.final", vars: { y: x.y, w: { tm: x.w }, s: x.s, r: { tm: x.r } } });
        const g = String(x.s).match(/^(\d+)–(\d+)/); if (g) mk(hard, "qt.score", { team: me, y: x.y }, { s: x.s }, [`${+g[1] + 1}–${g[2]}`, `${g[1]}–${Math.max(0, +g[2] - 1) === +g[2] ? +g[2] + 1 : Math.max(0, +g[2] - 1)}`, `${+g[1] + 2}–${g[2]}`, `${+g[1] + 1}–${+g[2] + 1}`].filter(v => v !== x.s && v.split("–")[0] > v.split("–")[1]).map(v => ({ s: v })), { key: "ex.final", vars: { y: x.y, w: { tm: x.w }, s: x.s, r: { tm: x.r } } });
      });
    }
    (TF.extra || []).forEach(x => mk(x.lvl === "medium" ? medium : hard, x.key, Object.assign({ team: me }, x.vars), { pl: x.a }, x.d.map(p => ({ pl: p })), { key: x.key.replace("qt.", "ex."), vars: Object.assign({ team: me, p: { pl: x.a } }, x.vars) }));
    // Each level uses only its own bank. Rotate so a fan sees new questions before any repeat.
    const bank = (diff === "easy" ? easy : diff === "hard" ? hard : medium).filter(q => q.opts.length >= 2 && q.ans >= 0);
    const qid = q => q.key + "|" + JSON.stringify(q.vars);
    S.qseen = S.qseen || {}; const sk = T + ":" + diff; let seen = S.qseen[sk] || [];
    let fresh = bank.filter(q => !seen.includes(qid(q)));
    const ROUND = Math.min(8, bank.length);
    if (fresh.length < ROUND) { seen = []; fresh = bank.slice(); }
    const GRP = { "qt.bigWin": "big", "qt.bigWinOpp": "big", "qt.mate": "mate", "qt.notMate": "mate", "qt.wcApps": "wc", "qt.wcFirst": "wc", "qt.first": "first", "qt.winYear": "first" };
    const picked = [], used = new Set();
    for (const q of shuffle(fresh)) { if (picked.length >= ROUND) break; const g = GRP[q.key]; if (g && used.has(g)) continue; if (g) used.add(g); picked.push(q); }
    S.qseen[sk] = seen.concat(picked.map(qid)); save();
    return { diff, team: T, qs: picked, i: 0, score: 0, streak: 0, answered: null, pts: 0, done: false };
  }
  function optLabel(o) {
    if (o.tm) return teamName(o.tm);
    if (o.g) return t("group", { g: o.g });
    if (o.n != null) return nf(o.n);
    if (o.f) return t("fin." + o.f);
    if (o.y) return String(o.y);
    if (o.r) return t("route." + o.r);
    if (o.pl) return L(o.pl);
    if (o.nk) { const n = window.FV_TEAMFACTS[o.nk].nick; return L(n); }
    if (o.yn != null) return t(o.yn ? "yes" : "no");
    if (o.sc) return t("sc." + o.sc);
    if (o.st2) return L(o.st2);
    if (o.s) return fmtScore(o.s);
    if (o.city) return L(D.CITIES[o.city].name);
    if (o.st) return L(stadium(o.st).name);
    return "";
  }
  const fmtScore = s => String(s).replace(/\((\d–\d) p\)/, (_, x) => `(${x} ${t("pen")})`);
  function fillVars(vars) {
    const out = {};
    for (const [k, v] of Object.entries(vars || {})) {
      if (v && typeof v === "object") {
        if (v.tm) out[k] = teamName(v.tm);
        else if (v.tms) out[k] = v.tms.map(x => teamName(x)).join(S.lang === "ja" ? "、" : S.lang === "ar" ? "، " : ", ");
        else if (v.yrs) out[k] = v.yrs && v.yrs.length ? " (" + v.yrs.join(", ") + ")" : "";
        else if (v.yrs0) out[k] = v.yrs0.join(S.lang === "ja" ? "、" : S.lang === "ar" ? "، " : ", ");
        else if (v.r) out[k] = t("route." + v.r);
        else if (v.pl) out[k] = L(v.pl);
        else if (v.nk) out[k] = L(window.FV_TEAMFACTS[v.nk].nick);
        else if (v.st2) out[k] = L(v.st2);
        else if (v.cup) out[k] = t("cup." + v.cup);
        else if (v.gl) out[k] = t("q.goalsN", { n: nf(v.gl) });
        else if (v.cp) out[k] = t("q.capsCount", { n: nf(v.cp) });
        else if (v.f) out[k] = t("fin." + v.f);
        else if (v.sc) out[k] = t("sc." + v.sc);
        else out[k] = "";
      } else out[k] = k === "s" ? fmtScore(v) : v;
    }
    return out;
  }
  const flagOf = o => (o.tm ? `<span class="flag" aria-hidden="true">${flag(o.tm)}</span>` : `<span class="k"></span>`);
  function vQuiz() {
    const q = S.quiz;
    if (!q) {
      const T = S.team && isFinalist(S.team) ? S.team : null;
      if (!T) return `<div class="panel mission"><h2>${t("ch.quiz")}</h2><p style="color:var(--muted);margin:12px 0 16px">${t("q.pickTeam")}</p><button class="btn btn-gold" data-open-settings>${t("team.choose")}</button></div>`;
      return `<div class="panel mission"><h2>${t("ch.quiz")}</h2><span class="pill host">${flag(T)} ${t("q.forTeam", { team: esc(teamName(T)) })}</span><p style="color:var(--muted);margin:12px 0 16px">${t("q.introTeam", { team: esc(teamName(T)) })}</p>
        <span class="lbl-sm">${t("q.diff")}</span><div class="seg" role="group" style="margin:8px 0 18px" id="qdiff">${["easy", "medium", "hard"].map((d, i) => `<button data-qd="${d}" aria-pressed="${i === 1}">${t("q." + d)}</button>`).join("")}</div>
        <div><button class="btn btn-gold" data-qstart>${t("q.start")} <span class="arrow">→</span></button></div>
        </div>`;
    }
    if (q.done) {
      const perfect = q.score === q.qs.length;
      return `<div class="panel mission"><span class="eyebrow">${t("q." + q.diff)}</span><h2 class="score-pop" style="font-size:48px;margin-top:10px">${t("q.result", { s: nf(q.score), t: nf(q.qs.length) })}</h2><p style="font-size:20px;color:var(--gold-soft);margin:6px 0 18px">${t("q.points", { p: nf(q.pts) })}${perfect ? " · " + t("b.perfect") : ""}</p><button class="btn btn-gold" data-qreset>${t("q.again")}</button></div>`;
    }
    const cur = q.qs[q.i];
    return `<div class="panel mission"><div class="tl-h"><span class="eyebrow">${t("q.of", { n: nf(q.i + 1), t: nf(q.qs.length) })}</span><span class="pill">${t("q." + q.diff)} · ${nf(q.score)}${q.streak > 1 ? " · " + t("q.streak", { n: nf(q.streak) }) : ""}</span></div>
      <div class="progress"><i style="width:${(q.i / q.qs.length * 100)}%"></i></div>
      <p class="scene" style="font-weight:600">${esc(t(cur.key, fillVars(cur.vars)))}</p>
      <div class="choices">${cur.opts.map((o, i) => `<button class="choice ${q.answered != null ? (i === cur.ans ? "right" : i === q.answered ? "wrong" : "") : ""}" data-qa="${i}" ${q.answered != null ? "disabled" : ""}>${flagOf(o)}<span>${esc(optLabel(o))}</span></button>`).join("")}</div>
      ${q.answered != null ? `<div class="explain" role="status"><b>${q.answered === cur.ans ? "✓ " + t("q.right") + " " + t("q.points", { p: nf(ptsFor(q.diff)) }) : esc(t("q.wrongA", { a: optLabel(cur.opts[cur.ans]) }))}</b><p style="margin-top:6px">${esc(t(cur.ex.key, fillVars(cur.ex.vars)))}</p><div id="q-ai"></div><button class="btn btn-ghost btn-sm" style="margin-top:10px" data-qai>${t("q.ai")}</button></div>
        <button class="btn btn-gold" style="margin-top:14px" data-qnext>${q.i + 1 < q.qs.length ? t("q.next") : t("q.finish")} <span class="arrow">→</span></button>` : ""}</div>`;
  }
  const ptsFor = d => ({ easy: 10, medium: 15, hard: 20 }[d]);
  async function quizExplain() {
    const q = S.quiz, cur = q.qs[q.i]; const box = $("#q-ai");
    const qText = I.en[cur.key].replace(/\{(\w+)\}/g, (_, k) => { const v = cur.vars[k]; return v && v.tm ? teamName(v.tm, "en") : v && v.pl ? v.pl.en : (typeof v === "object" ? "" : String(v ?? "")); });
    const lang = S.lang; S.lang = "en"; const ans = optLabel(cur.opts[cur.ans]); const exp = t(cur.ex.key, fillVars(cur.ex.vars)); S.lang = lang;
    box.innerHTML = aiBox(loadingDots());
    const prompt = `${fanContext()}
A fan answered a quiz question. Question: "${qText}". Correct answer per the app's verified answer key: "${ans}". Verified fact: "${exp}".
In 2–3 sentences, explain the answer with well-known context. Never contradict the answer key and do not add new statistics you are not sure of.`;
    try { await aiText(prompt, x => { box.innerHTML = aiBox(prose(x)); }, { modelTier: "quick" }); }
    catch (e) { box.innerHTML = `<div class="notice err">${esc(aiError(e))}</div>`; }
  }
  function vPred() {
    const fin = Object.keys(D.FINALISTS).sort((a, b) => teamName(a).localeCompare(teamName(b), loc()));
    predA = predA || (S.team && isFinalist(S.team) ? S.team : "SA"); predB = predB || (predA === "JP" ? "KR" : "JP");
    const A = D.FINALISTS[predA], B = D.FINALISTS[predB];
    const ta = (A.years || []).length, tb = (B.years || []).length;
    const rank = f => ["winners", "runnerup", "third", "fourth", "qf", "r16", "group"].indexOf(f);
    const row = (label, l, r, lw, rw) => `<div class="cmp-row"><div class="l ${lw ? "win" : ""}">${l}</div><div class="c">${label}</div><div class="r ${rw ? "win" : ""}">${r}</div></div>`;
    const sel = (id, v) => `<select id="${id}" class="input">${fin.map(cc => `<option value="${cc}" ${cc === v ? "selected" : ""}>${flag(cc)} ${esc(teamName(cc))}</option>`).join("")}</select>`;
    return `<div class="panel"><p style="color:var(--muted);margin-bottom:16px">${t("pr.p")}</p>
      <div class="form-grid" style="margin-bottom:22px"><div class="field"><label for="pa">${t("pr.a")}</label>${sel("pa", predA)}</div><div class="field"><label for="pb">${t("pr.b")}</label>${sel("pb", predB)}</div></div>
      <div class="vs-board"><div class="vs-side"><span class="flag">${flag(predA)}</span><h3>${esc(teamName(predA))}</h3></div><div class="vs-mid">VS</div><div class="vs-side"><span class="flag">${flag(predB)}</span><h3>${esc(teamName(predB))}</h3></div></div>
      <div class="cmp-rows">
        ${row(t("team.titles"), nf(ta), nf(tb), ta > tb, tb > ta)}
        ${row(t("team.best"), t("fin." + A.best), t("fin." + B.best), rank(A.best) < rank(B.best), rank(B.best) < rank(A.best))}
        ${row(t("team.years"), (A.years || A.bestYears).join(", "), (B.years || B.bestYears).join(", "))}
        ${row(t("team.route"), t("route." + A.route), t("route." + B.route))}
        ${row(t("m.group"), t("group", { g: A.g }), t("group", { g: B.g }))}
        ${row(t("pr.h2h"), "—", "—")}
        ${row(t("pr.form"), "—", "—")}
      </div>
      <p class="notice info" style="margin-top:12px">${A.g === B.g ? t("pr.same", { g: A.g }) : t("pr.diff")}</p>
      <button class="btn btn-gold" style="margin-top:16px" data-pred-go ${predA === predB ? "disabled" : ""}>${t("pr.go")} <span class="arrow">→</span></button>
      <div id="pred-out" style="margin-top:16px"></div></div>`;
  }
  async function runPred() {
    const out = $("#pred-out"); const A = D.FINALISTS[predA], B = D.FINALISTS[predB];
    out.innerHTML = aiBox(loadingDots());
    const desc = (cc, f) => `${teamName(cc, "en")}: Asian Cup titles ${(f.years || []).length}${f.years ? " (" + f.years.join(", ") + ")" : ""}; best finish ${f.best}${f.bestYears ? " (" + f.bestYears.join(", ") + ")" : ""}; qualification route ${I.en["route." + f.route]}; 2027 group ${f.g}`;
    const prompt = `${fanContext()}
Write a short pre-match style analysis (under 170 words) of ${teamName(predA, "en")} vs ${teamName(predB, "en")} for the 2027 Asian Cup. Verified data you may use: ${desc(predA, A)}. ${desc(predB, B)}. ${A.g === B.g ? "They are in the same group." : "They are in different groups and could only meet in the knockout stage."}
No head-to-head records, recent form, player names, coaches or numbers beyond the data given (none are verified here). No win probabilities or score predictions. Discuss tournament pedigree and what each side's history suggests, framed as analysis. End with one line reminding that this is not a prediction.`;
    try { await aiText(prompt, x => { out.innerHTML = aiBox(prose(x)); }); }
    catch (e) { out.innerHTML = `<div class="notice err">${esc(aiError(e))}</div>`; }
  }

  /* ---------- Passport ---------- */
  function passportStats() {
    const items = S.plan.result ? S.plan.result.items : [];
    const done = items.filter(x => x.done).length + (S.missionsDone || 0);
    return { done, planned: items.filter(x => !x.done).length, missions: S.missionsDone || 0 };
  }
  function vPassport() {
    const st = passportStats();
    const T = S.team;
    const mrz = `P<${(T || "XXX").padEnd(3, "<")}<${(S.name || "FAN").toUpperCase().replace(/[^A-Z]/g, "<").padEnd(14, "<").slice(0, 14)}<<ASIA27<FANVERSE<${String(S.points).padStart(5, "0")}`;
    return `<div class="wrap fade-page"><header class="page-head"><span class="eyebrow">${t("hero.eyebrow")}</span><h1>${t("pp.t")}</h1><p>${t("pp.p")}</p></header>
      <div class="pp-grid">
        <article class="passport" id="passport-card">
          <div class="ph"><div><div class="label">ASIA 27 | FANVERSE · ${t("pp.holder")}</div><h2>${esc(S.name || "—")}</h2><div style="color:var(--muted)">${t("pp.fan")}: <b style="color:var(--ivory)">${T ? esc(teamName(T)) : t("pp.noTeam")}</b></div><div style="color:var(--muted)">${t("pp.city")}: <b style="color:var(--ivory)">${esc(L(D.CITIES[S.homeCity].name))}</b></div></div><span class="flag big" aria-hidden="true">${T ? flag(T) : "⚽"}</span></div>
          <div class="pp-stats"><div><b>${nf(S.points)}</b><span>${t("pp.points")}</span></div><div><b>${nf(st.done)}</b><span>${t("pp.done")}</span></div><div><b>${nf(st.planned)}</b><span>${t("pp.planned")}</span></div></div>
          <div class="label" style="margin-bottom:8px">${t("pp.badges")}</div>
          <div class="badges">${D.BADGES.map(b => `<span class="badge ${S.badges.includes(b) ? "" : "off"}" title="${esc(t("b." + b + "D"))}"><i>${{ first: "1", hat: "3", perfect: "★", majlis: "☕", planner: "⏱", explorer: "8" }[b]}</i>${t("b." + b)}</span>`).join("")}</div>
          ${S.summary ? `<div class="explain" style="margin-top:18px"><span class="pill ai">${t("aiGen")}</span><p style="margin-top:6px">${prose(S.summary)}</p></div>` : ""}
          <div class="mrz">${esc(mrz)}</div>
        </article>
        <div class="stack">
          <section class="panel"><div class="form-grid">
            <div class="field full"><label for="pp-name">${t("pp.name")}</label><input id="pp-name" class="input" maxlength="40" value="${esc(S.name)}" placeholder="${t("pp.namePh")}"></div>
            <div class="field"><label for="pp-city">${t("pp.city")}</label><select id="pp-city" class="input">${Object.entries(D.CITIES).map(([id, c]) => `<option value="${id}" ${S.homeCity === id ? "selected" : ""}>${esc(L(c.name))}</option>`).join("")}</select></div>
            <div class="field"><span class="lbl-sm">${t("pp.fan")}</span><button class="btn btn-ghost" data-open-settings>${T ? flag(T) + " " + esc(teamName(T)) : t("team.choose")}</button></div>
          </div></section>
          <section class="panel"><div class="stack">
            <button class="btn btn-gold" data-pp-export>${t("pp.export")}</button>
            <button class="btn btn-ghost" data-pp-share>${t("pp.share")}</button>
            <button class="btn btn-em" data-pp-sum>${t("pp.gen")}</button>
            <p class="src">${t("pp.summaryNote")} ${t("pp.p")}</p>
            <div id="pp-out"></div>
            <button class="btn btn-ghost btn-sm" data-pp-reset style="align-self:flex-start">${t("pp.reset")}</button>
          </div></section>
        </div>
      </div></div>`;
  }
  async function passportSummary() {
    const out = $("#pp-out"); out.innerHTML = aiBox(loadingDots());
    const items = S.plan.result ? S.plan.result.items : [];
    const prompt = `${fanContext()}
Write a warm 3-sentence trip summary for a fan passport. Name: ${S.name || "the fan"}. Base city: ${D.CITIES[S.homeCity].name.en}. Points: ${S.points}. Badges: ${S.badges.join(", ") || "none"}. Culture missions completed: ${S.missionsDone || 0}.
Activities the fan CONFIRMED as completed: ${items.filter(x => x.done).map(x => x.title).join("; ") || "none"}.
Activities only PLANNED (not done): ${items.filter(x => !x.done).map(x => x.title).join("; ") || "none"}.
Clearly distinguish planned from completed; never claim they visited anything not confirmed. Plain text, no headings.`;
    try { const txt = await aiText(prompt, x => { out.innerHTML = aiBox(prose(x)); }); S.summary = txt.slice(0, 900); save(); render(); }
    catch (e) { out.innerHTML = `<div class="notice err">${esc(aiError(e))}</div>`; }
  }
  async function drawPassportPNG() {
    try { await document.fonts.ready; } catch (e) { /* ignore */ }
    const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
    const team = getComputedStyle(document.documentElement).getPropertyValue("--team").trim() || "#d6b262";
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#0b1d36"); g.addColorStop(1, "#050d1a"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    const rg = x.createRadialGradient(W, 0, 10, W, 0, 800); rg.addColorStop(0, team + "88"); rg.addColorStop(1, "transparent"); x.fillStyle = rg; x.fillRect(0, 0, W, H);
    const rg2 = x.createRadialGradient(0, H, 10, 0, H, 700); rg2.addColorStop(0, "rgba(19,168,119,.45)"); rg2.addColorStop(1, "transparent"); x.fillStyle = rg2; x.fillRect(0, 0, W, H);
    x.strokeStyle = "rgba(214,178,98,.6)"; x.setLineDash([10, 8]); x.lineWidth = 2; x.strokeRect(36, 36, W - 72, H - 72); x.setLineDash([]);
    const rtl = meta().dir === "rtl"; x.direction = rtl ? "rtl" : "ltr"; x.textAlign = rtl ? "right" : "left";
    const X = rtl ? W - 90 : 90, body = getComputedStyle(document.body).fontFamily, disp = '"Alexandria", ' + body;
    x.fillStyle = "#d6b262"; x.font = `700 30px ${disp}`; x.fillText("ASIA 27 | FANVERSE", X, 130);
    x.fillStyle = "#9db0c6"; x.font = `500 26px ${body}`; x.fillText(t("pp.holder"), X, 175);
    x.fillStyle = "#f5f0e6"; x.font = `800 92px ${disp}`; x.fillText((S.name || "—").slice(0, 22), X, 280);
    x.font = `400 150px "Noto Color Emoji", sans-serif`; x.textAlign = rtl ? "left" : "right"; x.fillText(S.team ? flag(S.team) : "⚽", rtl ? 90 : W - 90, 290); x.textAlign = rtl ? "right" : "left";
    x.fillStyle = "#9db0c6"; x.font = `500 34px ${body}`; x.fillText(`${t("pp.fan")}: ${S.team ? teamName(S.team) : t("pp.noTeam")}`, X, 360);
    x.fillText(`${t("pp.city")}: ${L(D.CITIES[S.homeCity].name)}`, X, 410);
    const st = passportStats();
    [[S.points, t("pp.points")], [st.done, t("pp.done")], [st.planned, t("pp.planned")]].forEach(([n, l], i) => {
      const bx = rtl ? W - 90 - (i + 1) * 300 + 20 : 90 + i * 300; x.fillStyle = "rgba(6,15,28,.55)"; x.strokeStyle = "rgba(160,186,214,.25)"; x.lineWidth = 2;
      x.beginPath(); x.roundRect(bx, 470, 280, 170, 22); x.fill(); x.stroke();
      x.fillStyle = "#f0dca6"; x.font = `800 80px ${disp}`; x.textAlign = "center"; x.fillText(nf(n), bx + 140, 565); x.fillStyle = "#9db0c6"; x.font = `500 26px ${body}`; x.fillText(l, bx + 140, 612);
    });
    x.textAlign = rtl ? "right" : "left"; x.fillStyle = "#d6b262"; x.font = `600 28px ${body}`; x.fillText(t("pp.badges"), X, 720);
    let by = 770; const earned = D.BADGES.filter(b => S.badges.includes(b));
    x.font = `500 30px ${body}`; x.fillStyle = "#f5f0e6";
    if (!earned.length) { x.fillStyle = "#9db0c6"; x.fillText("—", X, by); }
    earned.forEach((b, i) => { x.fillText("★ " + t("b." + b), rtl ? W - 90 - (i % 2) * 450 : 90 + (i % 2) * 450, by + Math.floor(i / 2) * 52); });
    if (S.summary) {
      x.fillStyle = "#9db0c6"; x.font = `400 26px ${body}`; let y = 960; const words = S.summary.replace(/\*\*/g, "").split(/(\s+)/); let line = "";
      for (const w of words) { const test = line + w; if (x.measureText(test).width > W - 180) { x.fillText(line.trim(), X, y); y += 38; line = w; if (y > 1170) break; } else line = test; }
      if (y <= 1170) x.fillText(line.trim(), X, y);
    }
    x.fillStyle = "rgba(214,178,98,.75)"; x.font = `600 24px ui-monospace, monospace`; x.textAlign = "center"; x.direction = "ltr"; x.fillText(t("tagline"), W / 2, H - 80);
    return new Promise(res => c.toBlob(res, "image/png"));
  }
  async function exportPassport() {
    const out = $("#pp-out"); const blob = await drawPassportPNG();
    let dl = null; try { dl = window.claude && window.claude.use ? await window.claude.use("downloads") : null; } catch (e) { dl = null; }
    if (dl) {
      try { await dl.save({ filename: "asia27-fan-passport.png", data: blob }); toast(t("pp.saved")); return; }
      catch (e) { /* declined or failed: show the image instead */ }
    }
    const url = URL.createObjectURL(blob);
    out.innerHTML = `<p class="notice info">${t("pp.dl")}</p><img src="${url}" alt="${esc(t("pp.t"))}" style="margin-top:10px;border-radius:14px;border:1px solid var(--line)">`;
  }

  /* ---------- Settings modal (team, nationality, language are separate) ---------- */
  function openSettings() {
    closeModal();
    const m = document.createElement("div"); m.className = "modal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-labelledby", "set-t");
    m.innerHTML = `<div class="modal-box" style="width:min(820px,100%)"><div class="tl-h"><h2 id="set-t">${t("team.choose")}</h2><button class="btn btn-ghost btn-sm" data-close>${t("close")}</button></div>
      <div class="form-grid" style="margin:10px 0 16px">
        <div class="field"><label for="s-nat">${t("nat")}</label><select id="s-nat" class="input"><option value="">—</option>${D.AFC.slice().sort((a, b) => teamName(a).localeCompare(teamName(b), loc())).map(cc => `<option value="${cc}" ${S.nationality === cc ? "selected" : ""}>${flag(cc)} ${esc(teamName(cc))}</option>`).join("")}<option value="OTHER" ${S.nationality === "OTHER" ? "selected" : ""}>🌍 ${t("other")}</option></select></div>
        <div class="field"><label for="s-lang">${t("lang.label")}</label><select id="s-lang" class="input">${D.SUPPORTED.map(l => `<option value="${l}" ${l === S.lang ? "selected" : ""}>${I.meta[l].name}</option>`).join("")}</select></div>
      </div>
      <div class="tp-strip">${Object.keys(D.FINALISTS).map(teamTile).join("")}</div>
      <a class="btn btn-ghost btn-sm" style="margin-top:14px" href="#teams" data-close>${t("home.teams.all")} <span class="arrow">→</span></a></div>`;
    document.body.appendChild(m);
    $("#s-nat", m).addEventListener("change", e => { S.nationality = e.target.value || null; save(); });
    $("#s-lang", m).addEventListener("change", e => { setLang(e.target.value); });
    m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-close]")) closeModal(); });
    setTimeout(() => { const b = $(".tp[aria-pressed=true]", m) || $(".tp", m); b && b.focus(); }, 30);
  }
  function openLightbox(k) {
    const el = document.createElement("div"); el.className = "lightbox"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true");
    el.innerHTML = `<button class="btn btn-ghost btn-sm lb-close" data-lb-close>${t("close")}</button><figure><img src="img/${k}.jpg" alt=""><figcaption>${creditLine(k)}</figcaption></figure>`;
    el.addEventListener("click", e => { if (e.target === el) el.remove(); });
    document.body.appendChild(el); $(".lb-close", el).focus();
  }
  function closeModal() { $$(".modal").forEach(x => x.remove()); }
  function langPrompt(cc) {
    const sug = D.suggestLang(cc);
    const native = D.NATIVE[cc];
    if (sug === S.lang && (D.SUPPORTED.includes(native) || native === "en")) return;
    closeModal();
    const m = document.createElement("div"); m.className = "modal"; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true");
    const unsupported = native && !D.SUPPORTED.includes(native) && sug === "en" && native !== "en";
    const sugName = I.meta[sug].name;
    m.innerHTML = `<div class="modal-box"><span class="flag" style="font-size:54px">${flag(cc)}</span><h2 style="margin-top:8px">${esc(teamName(cc))}</h2>
      ${unsupported ? `<p style="color:var(--muted);margin:8px 0 18px">${t("lang.fallback", { lang: esc(langName(native)), fallback: I.meta[S.lang].name })}</p><button class="btn btn-gold" data-close>OK</button>`
        : `<p style="color:var(--muted);margin:8px 0 18px">${t("lang.suggest", { team: esc(teamName(cc)), lang: sugName })}</p><div class="stack" style="flex-direction:row;flex-wrap:wrap"><button class="btn btn-gold" data-setlang="${sug}">${I[sug]["lang.switch"].replace("{lang}", sugName)}</button><button class="btn btn-ghost" data-close>${t("lang.keep", { lang: I.meta[S.lang].name })}</button></div>`}</div>`;
    document.body.appendChild(m);
    m.addEventListener("click", e => {
      const sl = e.target.closest("[data-setlang]"); if (sl) { closeModal(); setLang(sl.dataset.setlang); return; }
      if (e.target === m || e.target.closest("[data-close]")) closeModal();
    });
    setTimeout(() => { const b = $("button", m); b && b.focus(); }, 30);
  }
  function pickTeam(cc) {
    const was = S.team; S.team = cc; save(); applyTeamTheme();
    if (S.quiz && !S.quiz.done && S.quiz.team !== cc) S.quiz = null;
    render(); toast(t("toast.team", { team: teamName(cc) }));
    if (was !== cc) langPrompt(cc);
  }
  function setLang(l) { if (!D.SUPPORTED.includes(l)) return; S.lang = l; save(); applyLang(); render(); }

  /* ---------------- Render & routing ---------------- */
  function vNotFound() { return `<div class="wrap"><header class="page-head"><h1>404</h1><a class="btn btn-gold" href="#home">${t("nav.home")}</a></header></div>`; }
  let cdTimer = 0;
  function render() {
    const r = route();
    $("#top").innerHTML = header();
    let html;
    if (r === "home") html = vHome();
    else if (r === "teams") html = vTeams();
    else if (r.startsWith("team-")) html = vTeam(r.slice(5).toUpperCase());
    else if (r === "matches") html = vMatches();
    else if (r === "stadiums") html = vStadiums();
    else if (r.startsWith("stadium-")) html = vStadium(r.slice(8));
    else if (r.startsWith("city-")) html = vCity(r.slice(5));
    else if (r === "matchday") html = vMatchday();
    else if (r === "discover") html = vDiscover();
    else if (r === "challenges") html = vChallenges();
    else if (r === "passport") html = vPassport();
    else html = vNotFound();
    $("#main").innerHTML = html;
    $("#foot").innerHTML = footer();
    const cv = $("#hero-canvas"); if (cv) startHero(cv); else if (heroCleanup) heroCleanup();
    clearInterval(cdTimer); if ($("#countdown")) { tick(); cdTimer = setInterval(tick, 1000); }
  }
  function tick() {
    const el = $("#countdown"); if (!el) return clearInterval(cdTimer);
    let ms = Math.max(0, new Date(D.TOURNAMENT.start + "T00:00:00+03:00") - Date.now());
    const d = Math.floor(ms / 864e5); ms -= d * 864e5; const h = Math.floor(ms / 36e5); ms -= h * 36e5; const m = Math.floor(ms / 6e4); const s = Math.floor((ms - m * 6e4) / 1000);
    const v = { d, h, m, s }; $$("[data-c]", el).forEach(b => { b.textContent = String(v[b.dataset.c]).padStart(2, "0"); });
  }

  /* ---------------- Events ---------------- */
  document.addEventListener("click", e => {
    const el = e.target.closest("button, a, [data-pick]"); if (!el) return;
    const d = el.dataset;
    if (d.skip !== undefined) { e.preventDefault(); $("#main").focus(); return; }
    if (d.lb) { openLightbox(d.lb); return; }
    if (d.lbClose !== undefined) { $$(".lightbox").forEach(x => x.remove()); return; }
    if (el.classList.contains("menu-btn")) { const n = $("#nav"); const o = n.classList.toggle("open"); el.setAttribute("aria-expanded", o); return; }
    if (el.closest(".nav")) { $("#nav").classList.remove("open"); }
    if (d.openSettings !== undefined) return openSettings();
    if (d.pick) { const inModal = !!el.closest(".modal"); if (inModal) closeModal(); pickTeam(d.pick); return; }
    if (d.tf) { teamFilter = d.tf; render(); return; }
    if (d.ccat) { cityCat = d.ccat; const y = scrollY; render(); scrollTo(0, y); return; }
    if (d.mg) { mGroup = d.mg; render(); return; }
    if (el.id === "p-geo") {
      readForm(); const f = S.plan.form;
      if (f.geo) { f.geo = null; save(); const y = scrollY; render(); scrollTo(0, y); return; }
      const pol = document.permissionsPolicy || document.featurePolicy;
      const blocked = !navigator.geolocation || !window.isSecureContext || (pol && pol.allowsFeature && !pol.allowsFeature("geolocation"));
      if (blocked) { toast(t("geo.blocked")); $("#p-start").focus(); return; }
      el.disabled = true; el.textContent = "📍 " + t("geo.wait");
      navigator.geolocation.getCurrentPosition(pos => {
        f.geo = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        let best = null, bd = Infinity;
        for (const [id, c] of Object.entries({ riyadh: [24.71, 46.68], jeddah: [21.54, 39.17], khobar: [26.28, 50.2] })) { const dd = (c[0] - f.geo.lat) ** 2 + (c[1] - f.geo.lng) ** 2; if (dd < bd) { bd = dd; best = id; } }
        if (bd < 1.5 && best !== f.city) { f.city = best; f.stadium = D.STADIUMS.find(s => s.city === best).id; }
        save(); const y = scrollY; render(); scrollTo(0, y);
      }, err => { el.disabled = false; el.textContent = "📍 " + t("geo.use"); toast(t(err && err.code === 1 ? (window.top !== window ? "geo.blocked" : "geo.denied") : "geo.err")); $("#p-start").focus(); }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
      return;
    }
    if (d.trplan !== undefined) { modifyPlan(t("md.trPrompt", { l: meta().name }), { translate: true }); return; }
    if (d.mdtab) { mdTab = d.mdtab; render(); return; }
    if (d.dtab) { dTab = d.dtab; render(); return; }
    if (d.ctab) { cTab = d.ctab; render(); return; }
    if (d.planStadium) { const s = stadium(d.planStadium); S.plan.form.stadium = s.id; S.plan.form.city = s.city; save(); mdTab = "plan"; location.hash = "#matchday"; return; }
    if (d.planCity) { S.plan.form.city = d.planCity; S.plan.form.stadium = D.STADIUMS.find(s => s.city === d.planCity).id; save(); mdTab = "plan"; location.hash = "#matchday"; return; }
    if (d.quizTeam) { cTab = "quiz"; S.quiz = null; if (S.team !== d.quizTeam) { S.team = d.quizTeam; applyTeamTheme(); } save(); return; }
    if (d.pred) { cTab = "pred"; predA = d.pred; predB = null; return; }
    if (d.sug !== undefined) { const i = $("#pc"); if (!S.plan.result) { i.value = d.sug; i.focus(); return; } modifyPlan(d.sug); return; }
    if (d.useplan !== undefined && S.budget) { const p = S.budget.plans[+d.useplan]; mdTab = "plan"; render(); const msg = `${t("bb.use")}: ${t("bb." + p.tier)} — ${p.items.map(x => x.title).join(", ")}`; if (S.plan.result) modifyPlan(msg); else generatePlan(); return; }
    if (d.trs) { askTranslator(d.trs); return; }
    if (d.msc !== undefined) {
      const m = S.mission; if (m.answered != null) return; m.answered = +d.msc;
      const sc = m.ai || D.MISSIONS[m.i]; const right = m.answered === sc.correct;
      if (m.ai) { award(5); m.score += 5; } else if (right) { award(15); m.score += 15; }
      save(); $("#dpanel").innerHTML = vMission(); return;
    }
    if (d.msNext !== undefined) { const m = S.mission; if (m.ai) { m.ai = null; m.answered = null; } else { m.i++; m.answered = null; if (m.i >= D.MISSIONS.length) { S.missionsDone = (S.missionsDone || 0) + 1; badge("majlis"); } } save(); $("#dpanel").innerHTML = vMission(); return; }
    if (d.msAgain !== undefined) { S.mission = { i: 0, score: 0, answered: null, ai: null }; save(); $("#dpanel").innerHTML = vMission(); return; }
    if (d.msAi !== undefined) { aiMission(); return; }
    if (d.qd) { $$("[data-qd]").forEach(b => b.setAttribute("aria-pressed", b === el)); return; }
    if (d.qstart !== undefined) { const diff = ($("[data-qd][aria-pressed=true]") || {}).dataset?.qd || "medium"; S.quiz = buildQuiz(diff, S.team); if (!S.quiz) return; save(); $("#cpanel").innerHTML = vQuiz(); return; }
    if (d.qa !== undefined) {
      const q = S.quiz; if (q.answered != null) return; q.answered = +d.qa; const cur = q.qs[q.i];
      if (q.answered === cur.ans) { q.score++; q.streak++; const p = ptsFor(q.diff); q.pts += p; award(p); if (q.streak >= 3) badge("hat"); } else q.streak = 0;
      save(); $("#cpanel").innerHTML = vQuiz(); return;
    }
    if (d.qnext !== undefined) { const q = S.quiz; q.i++; q.answered = null; if (q.i >= q.qs.length) { q.done = true; S.quizzesDone++; badge("first"); if (q.score === q.qs.length) badge("perfect"); } save(); $("#cpanel").innerHTML = vQuiz(); return; }
    if (d.qreset !== undefined) { S.quiz = null; save(); $("#cpanel").innerHTML = vQuiz(); return; }
    if (d.qai !== undefined) { el.remove(); quizExplain(); return; }
    if (d.predGo !== undefined) { runPred(); return; }
    if (d.ppExport !== undefined) { exportPassport(); return; }
    if (d.ppShare !== undefined) { const txt = t("pp.shareText", { team: S.team ? teamName(S.team) : "—", p: nf(S.points), b: nf(S.badges.length) }); navigator.clipboard.writeText(txt).then(() => toast(t("copied")), () => { $("#pp-out").innerHTML = `<textarea class="input" rows="3" readonly>${esc(txt)}</textarea>`; }); return; }
    if (d.ppSum !== undefined) { passportSummary(); return; }
    if (d.ppReset !== undefined) {
      $("#pp-out").innerHTML = `<div class="notice err"><div><p>${t("pp.resetQ")}</p><div class="stack" style="flex-direction:row;margin-top:10px"><button class="btn btn-sm btn-gold" data-pp-yes>${t("pp.yes")}</button><button class="btn btn-sm btn-ghost" data-pp-no>${t("pp.no")}</button></div></div></div>`; return;
    }
    if (d.ppYes !== undefined) { const keep = { lang: S.lang, team: S.team, nationality: S.nationality, name: S.name, homeCity: S.homeCity }; S = Object.assign(JSON.parse(JSON.stringify(DEFAULT)), keep); save(); render(); return; }
    if (d.ppNo !== undefined) { $("#pp-out").innerHTML = ""; return; }
  });
  document.addEventListener("submit", e => {
    e.preventDefault();
    const id = e.target.id;
    if (id === "planform") { if (mdTab === "budget") generateBudget(); else generatePlan(); }
    else if (id === "plan-chat") { const i = $("#pc"); const v = i.value; i.value = ""; modifyPlan(v); }
    else if (id === "rescueform") runRescue();
    else if (id === "tasteform") runTaste();
    else if (id === "trform") { const i = $("#trq"); const v = i.value; i.value = ""; askTranslator(v); }
  });
  document.addEventListener("change", e => {
    const el = e.target;
    if (el.id === "lang") setLang(el.value);
    else if (el.id === "p-city") { S.plan.form.city = el.value; S.plan.form.stadium = D.STADIUMS.find(s => s.city === el.value).id; readForm(); $("#mdpanel").innerHTML = mdTab === "plan" ? vPlan() : vBudget(); }
    else if (el.id === "mteam") { mTeam = el.value; render(); }
    else if (el.id === "mmine") { mMine = el.checked; render(); }
    else if (el.id === "pa" || el.id === "pb") { if (el.id === "pa") predA = el.value; else predB = el.value; $("#cpanel").innerHTML = vPred(); }
    else if (el.id === "pp-city") { S.homeCity = el.value; save(); render(); }
    else if (el.dataset.done) { const it = S.plan.result && S.plan.result.items.find(x => x.id === el.dataset.done); if (it) { it.done = el.checked; save(); $("#plan-out").innerHTML = planOut(); } }
  });
  document.addEventListener("input", e => {
    const el = e.target;
    if (el.id === "tq") { teamQuery = el.value; $("#tgrid").innerHTML = teamCards(); }
    else if (el.id === "p-buf") { $("#buf-v").textContent = t("f.min", { n: nf(el.value) }); }
    else if (el.id === "pp-name") { S.name = el.value.slice(0, 40); save(); clearTimeout(el._t); el._t = setTimeout(() => { const pos = el.selectionStart; render(); const n = $("#pp-name"); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }, 500); }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeModal(); $$(".lightbox").forEach(x => x.remove()); } });
  addEventListener("hashchange", () => { closeModal(); render(); scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); });

  /* ---------------- Boot ---------------- */
  applyLang(); applyTeamTheme(); render();
  getSample().catch(() => null);
})();
