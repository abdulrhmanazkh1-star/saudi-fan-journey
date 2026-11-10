# ASIA 27 | FANVERSE

**One Cup. Many Nations. One Experience.** Your Intelligent Asian Cup Companion.

This is an independent, unofficial fan project built at the Tuwaiq Academy AI Bootcamp for the AFC Asian Cup Saudi Arabia 2027. It is not affiliated with or endorsed by the AFC, and it sells no tickets.

## Structure

| File | Role |
|---|---|
| `index.html` | Page shell and fonts (Alexandria, Readex Pro, Black Han Sans, IBM Plex Sans KR, Dela Gothic One, Zen Kaku Gothic New, Noto Color Emoji) |
| `styles.css` | Visual identity (dark Saudi green, gold), RTL, reduced motion |
| `data.js` | Verified data with sources: 47 AFC members, 24 finalists, groups, 8 stadiums, 3 cities, dishes, etiquette missions |
| `i18n.js` | Complete UI strings for `en`, `ar` (RTL), `ko-KR`, `ja-JP` |
| `planner.js` | Deterministic checks for overlaps, arrival deadline and budget. The AI proposes and this code decides |
| `app.js` | Router, views, AI features, quiz engine, Fan Passport, PNG export |
| `api/ai.js` | Vercel serverless route for Groq. Used only outside claude.ai |

## AI providers
- **In claude.ai:** the artifact uses the viewer's Claude through the `sample` capability, so no keys are needed.
- **On Vercel:** `app.js` falls back to `POST /api/ai`, which calls Groq with a key held on the server.

```
GROQ_API_KEY=...        # Vercel → Project → Settings → Environment Variables (never commit)
GROQ_MODEL=openai/gpt-oss-120b,openai/gpt-oss-20b   # optional; tried in order, falls back on rate limits
```

## Run locally
```
npx vercel dev        # serves the static files plus /api/ai
# or for static only (no AI): python3 -m http.server 8080
```

## Data integrity
- Dates: 23 Dec 2027 – 21 Jan 2028 (announced 3 Nov 2026, pending FIFA approval).
- Fixtures: group pairings come from the draw (9 May 2026). Dates, kickoffs and venues show "pending official confirmation" because the Jan–Feb 2027 schedule was superseded.
- Matchday plans are labelled hypothetical. Costs and travel times are AI estimates and are labelled that way.
- The quiz answer key comes from `data.js`. The AI only explains answers.
- No win probabilities, head-to-head records or recent form are shown, because no verified feed is connected.

## النشر على Vercel (عشان يشتغل الذكاء الاصطناعي)
1. أنشئ مفتاح من https://console.groq.com/keys
2. ارفع هذا المجلد كريبو على GitHub (لا ترفع أي ملف فيه المفتاح).
3. في https://vercel.com سوّ **Add New → Project** واختر الريبو. خلّ Framework Preset = Other بدون أوامر بناء.
4. في **Environment Variables** أضف `GROQ_API_KEY` = مفتاحك، ثم Deploy.
5. افتح رابط Vercel وجرّب يوم المباراة الذكي. لو غيّرت المتغيرات بعدين سوّ Redeploy.
