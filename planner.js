/* Deterministic matchday checks. The AI proposes; this file decides what is feasible. */
(function (root) {
  const TYPES = ["activity", "food", "cafe", "shopping", "rest", "transit", "transit-stadium"];

  function toMin(s) {
    if (typeof s !== "string") return null;
    const m = s.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const h = +m[1], mi = +m[2];
    if (h > 23 || mi > 59) return null;
    return h * 60 + mi;
  }
  function fmt(m) {
    m = ((Math.round(m) % 1440) + 1440) % 1440;
    return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  }
  const clampInt = (v, lo, hi, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };

  function normConstraints(c, fallback) {
    const f = fallback || {};
    const pick = (k, ok) => (c && ok(c[k]) ? c[k] : f[k]);
    return {
      budget: clampInt(pick("budget", v => Number.isFinite(Number(v)) && Number(v) >= 0), 0, 100000, 300),
      buffer: clampInt(c && c.bufferMinutes != null ? c.bufferMinutes : f.buffer, 15, 300, 90),
      kickoff: pick("kickoff", v => toMin(v) != null) || "20:00",
      dayStart: pick("dayStart", v => toMin(v) != null) || "10:00",
    };
  }

  function sanitize(raw) {
    return (Array.isArray(raw) ? raw : []).slice(0, 14).map((it, i) => ({
      id: "s" + i + "-" + Math.random().toString(36).slice(2, 7),
      title: String((it && it.title) || "").trim().slice(0, 120),
      type: TYPES.includes(it && it.type) ? it.type : "activity",
      start: toMin(it && it.start),
      end: toMin(it && it.end),
      cost: Math.max(0, Math.round(Number(it && it.cost) || 0)),
      place: String((it && it.place) || "").slice(0, 120),
      note: String((it && it.note) || "").slice(0, 400),
      venue: String((it && it.venue) || "").trim().slice(0, 80),
      maps: String((it && it.maps) || "").trim().slice(0, 140),
      done: !!(it && it.done),
    })).filter(it => it.title && it.start != null && it.end != null && it.end > it.start);
  }

  /* c: { dayStart:"HH:MM", kickoff:"HH:MM", buffer:minutes, budget:SAR } */
  function validatePlan(raw, c) {
    const warnings = [];
    const start = toMin(c.dayStart), ko = toMin(c.kickoff);
    const target = ko - c.buffer;
    let items = sanitize(raw).sort((a, b) => a.start - b.start);

    items = items.filter(it => {
      if (it.start < start) { warnings.push({ k: "w.before", a: it.title }); return false; }
      return true;
    });

    // Keep only the last trip to the stadium; it must close the day.
    const transits = items.filter(x => x.type === "transit-stadium");
    let transit = transits.length ? transits[transits.length - 1] : null;
    items = items.filter(x => x.type !== "transit-stadium");

    // Resolve overlaps by pushing later stops forward.
    const seq = [];
    for (const it of items) {
      const prev = seq[seq.length - 1];
      if (prev && it.start < prev.end) {
        const dur = it.end - it.start;
        it.start = prev.end; it.end = it.start + dur;
        warnings.push({ k: "w.overlap", a: it.title, t: fmt(it.start) });
      }
      seq.push(it);
    }

    if (transit) {
      const dur = transit.end - transit.start;
      // Every stop must finish in time to leave and still reach the stadium by the target.
      const latestStart = target - dur;
      const kept = [];
      for (const it of seq) {
        if (it.end > latestStart) { warnings.push({ k: "w.cut", a: it.title }); continue; }
        kept.push(it);
      }
      const keptEnd = kept.length ? kept[kept.length - 1].end : start;
      // Leave after the last stop, and no later than needed.
      const leave = Math.max(keptEnd, Math.min(transit.start, latestStart));
      transit.start = leave; transit.end = leave + dur;
      items = kept.concat([transit]);
    } else {
      items = seq.filter(it => { if (it.end > target) { warnings.push({ k: "w.cut", a: it.title }); return false; } return true; });
      warnings.push({ k: "w.noTransit" });
    }

    // Budget: drop the most expensive optional stops until the plan fits.
    let total = items.reduce((s, x) => s + x.cost, 0);
    while (total > c.budget) {
      const optional = items.filter(x => x.type !== "transit-stadium" && x.type !== "transit" && !x.done && x.cost > 0);
      if (!optional.length) break;
      const drop = optional.reduce((a, b) => (b.cost > a.cost ? b : a));
      items = items.filter(x => x !== drop);
      total -= drop.cost;
      warnings.push({ k: "w.budget", a: drop.title, b: c.budget });
    }

    const arrive = transit ? transit.end : null;
    if (arrive != null && arrive > target) warnings.push({ k: "w.late", t: fmt(target) });
    if (items.some(x => x.type === "transit" || x.type === "transit-stadium")) warnings.push({ k: "w.route", info: true });

    const feasible = arrive != null && arrive <= target && total <= c.budget;
    return { items, total, warnings, feasible, arrive, target, kickoff: ko, dayStart: start, budget: c.budget, buffer: c.buffer };
  }

  /* Budget Battle: re-add every line and trim until each plan fits. */
  function fitBudget(plan, budget) {
    let items = (Array.isArray(plan.items) ? plan.items : []).slice(0, 10).map(x => ({ title: String(x.title || "").slice(0, 100), cost: Math.max(0, Math.round(Number(x.cost) || 0)) })).filter(x => x.title);
    let total = items.reduce((s, x) => s + x.cost, 0), trimmed = false;
    while (total > budget && items.length) {
      const drop = items.reduce((a, b) => (b.cost > a.cost ? b : a));
      items = items.filter(x => x !== drop); total -= drop.cost; trimmed = true;
    }
    return { items, total, trimmed };
  }

  const api = { toMin, fmt, validatePlan, fitBudget, normConstraints, TYPES };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.FV_PLAN = api;
})(typeof window !== "undefined" ? window : globalThis);
