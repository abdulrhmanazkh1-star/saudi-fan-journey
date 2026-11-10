// Vercel serverless route: POST /api/ai  { messages: [{role, content}] } -> { text }
// Used only when the app runs outside claude.ai. Keeps the Groq key on the server.
// Env: GROQ_API_KEY (required), GROQ_MODEL (optional, comma-separated list tried in order).
// Default chain: a strong model first, then a lighter one with more free capacity, so a public
// launch (e.g. a LinkedIn post) keeps answering when the first model hits its rate limit.
// Check current IDs at https://console.groq.com/docs/models.
const MODELS = (process.env.GROQ_MODEL || "openai/gpt-oss-120b,openai/gpt-oss-20b")
  .split(",").map(s => s.trim()).filter(Boolean);

// Light per-instance throttle so one visitor can't drain the shared free quota.
const WINDOW_MS = 60_000, MAX_PER_WINDOW = 12;
const hits = new Map();
function throttled(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > MAX_PER_WINDOW;
}

async function callGroq(key, model, messages) {
  const payload = { model, messages, temperature: 0.5, max_completion_tokens: 4000 };
  if (/gpt-oss/.test(model)) payload.reasoning_effort = "low";
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => null);
  const text = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
  return { status: r.status, ok: r.ok && typeof text === "string" && text.trim() !== "", text, error: j && j.error && j.error.message };
}

// Keyless fallback so the site works before a Groq key is added (shared free tier, rate limited).
const FREE = [
  { url: "https://text.pollinations.ai/openai", model: "openai" },
  { url: "https://gen.pollinations.ai/v1/chat/completions", model: "openai" },
];
async function callFree(messages) {
  let last = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    for (const p of FREE) {
      try {
        const r = await fetch(p.url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: p.model, messages, private: true, referrer: "asia27-fanverse" }) });
        const raw = await r.text(); let j = null; try { j = JSON.parse(raw); } catch {}
        const text = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
        if (r.ok && typeof text === "string" && text.trim()) return { ok: true, text, model: "pollinations:" + p.model };
        last = { status: r.status, error: (j && j.error && (j.error.message || j.error)) || raw.slice(0, 200) };
      } catch (e) { last = { status: 0, error: "Free provider unreachable" }; }
    }
    await new Promise(r => setTimeout(r, 3000));
  }
  return Object.assign({ ok: false }, last);
}

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const key = process.env.GROQ_API_KEY;

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
  if (throttled(ip)) return res.status(429).json({ error: "Too many requests, try again in a minute" });

  const body = typeof req.body === "string" ? safeParse(req.body) : req.body;
  const messages = Array.isArray(body && body.messages) ? body.messages : null;
  const valid = messages && messages.length > 0 && messages.length <= 20 &&
    messages.every(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.length <= 12000);
  if (!valid) return res.status(400).json({ error: "Invalid messages payload" });

  if (!key) {
    const f = await callFree(messages);
    if (f.ok) return res.status(200).json({ text: f.text, provider: "free", model: f.model });
    return res.status(f.status === 429 ? 429 : 502).json({ error: String(f.error || "Free provider error") });
  }
  let last = null;
  for (const model of MODELS) {
    try {
      const r = await callGroq(key, model, messages);
      if (r.ok) return res.status(200).json({ text: r.text, provider: "groq", model });
      last = r;
      // Bad key or bad request won't be fixed by another model.
      if (r.status === 401 || r.status === 403 || r.status === 400 && !/model/i.test(r.error || "")) break;
    } catch (e) { last = { status: 0, error: "Provider unreachable" }; }
  }
  if (last && last.status === 429) return res.status(429).json({ error: "Rate limited by provider" });
  return res.status(502).json({ error: (last && last.error) || "Provider error" });
}
function safeParse(s) { try { return JSON.parse(s); } catch { return null; } }
