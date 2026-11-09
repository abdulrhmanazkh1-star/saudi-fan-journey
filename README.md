# Saudi Fan Journey

Your Journey Starts Before Kickoff.

An independent Tuwaiq Academy AI Bootcamp portfolio project: an English/Arabic cultural journey for international football fans. This is an application with a React client and a real Express API, not a chatbot or booking service.

## Status and requirements

The app is built and locally tested. Groq is configured server-side with Qwen 3.8; real Arabic/Japanese chat and an Arabic adventure scene succeeded on 2 November 2026. Meta Llama support remains available through OpenRouter or an eligible Groq account. The supplied Groq account returned model_not_found for Llama 3.3, so the active model is accurately identified as Qwen. Credentials are never included in frontend bundles or the source archive.

Node.js 24 LTS and pnpm 11 (or npm) are required. The frontend uses React 19, TypeScript, Vite, Tailwind 4, a shadcn-style Radix Slot/CVA Button, Motion, Lucide and html-to-image. Express 5, Zod, Helmet and express-rate-limit protect the backend. No database, login or paid travel-data API is needed.

## Start locally

```sh
corepack enable
pnpm install
cp .env.example .env
# Edit .env locally with your OpenRouter settings.
pnpm dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp` if preferred. Open the URL printed by Vite (normally http://localhost:5173). Vite proxies `/api` to Express on port 3001. Keep PORT=3001 for this development proxy, or update vite.config.ts with your chosen backend port.

For a production build and a single server:

```sh
pnpm build
pnpm start
```

Open http://localhost:3001. Express serves both the built frontend and `/api`, so no CORS or separate frontend environment is needed. Native TypeScript support in Node 24 runs the backend; the frontend is compiled by Vite. Vite's runner config loader avoids config-bundling path issues on restricted Windows installations.

npm users can run `npm install`, `npm run dev`, `npm run build`, `npm start`, and `npm test` instead. Use one package manager consistently. The supplied pnpm lockfile pins the tested dependency graph. `pnpm-workspace.yaml` permits esbuild's standard installation script.

## OpenRouter / Meta Llama setup

Set these ONLY in the server environment:

```env
OPENROUTER_API_KEY=your_private_key
OPENROUTER_MODEL=an_available_meta_llama_model_id
PORT=3001
```

Find an available model at https://openrouter.ai/models and copy its complete model ID. It must begin `meta-llama/llama-`, for example a model-family ID such as `meta-llama/llama-3.3-70b-instruct` if it is currently offered. This is an illustrative ID, not an availability guarantee. Check the model page for cost, context limits and compatible providers. Do not assume that a free variant is available. Choose a provider/model supporting JSON response format. See https://openrouter.ai/docs/features/structured-outputs and https://openrouter.ai/docs/features/provider-routing.

Never prefix this key with VITE_ or commit .env. In local development, saved .env edits reload automatically. On a production host, restart the service after changing its secret environment values. `.env.example` has empty placeholders. `/api/health` distinguishes configuration from a successful real-reply verification; the UI displays the Llama attribution only for a successfully returned Llama scene. A configured model is not proof that it is callable.

### Generation contract

`POST /api/adventure/generate` accepts:

```json
{
  "tournament": "asian-cup-2027",
  "country": "JP",
  "destination": "riyadh",
  "language": "en",
  "sceneNumber": 1,
  "previousChoices": []
}
```

For subsequent scenes, add one `{ "sceneTitle": "...", "narrative": "...", "choice": "..." }` history object for each completed scene. Scene number must equal history length + 1. The server validates identifiers, language, lengths and stages; rejects unknown top-level fields; supplies grounded cultural context; and makes an authenticated server-side request to OpenRouter. No alternative model is silently selected. Provider fallback is disabled.

Each response contains `sceneTitle`, `narrative`, `culturalFact`, exactly three labeled `choices`, `sceneCategory`, `isSimulation: true`, `provider`, and `model`. Both Zod validation and stage validation run before returning data. Cultural facts must exactly match a curated fact in the requested language. Malformed/ungrounded output gets one fresh corrective retry. Each provider call has a 25-second timeout; the whole two-attempt operation may take about 50 seconds. Requests are limited to 12 per IP per minute, with 20 KB JSON bodies. Errors do not log or return secrets. AI content renders as React text, never HTML.

## Journey features

- Cinematic homepage with local Saudi photography and a date-level countdown to the published 7 January 2027 opening date (not an invented kickoff time).
- Tournament selection: AFC Asian Cup 2027 and clearly labeled fictional 2034 future scenarios.
- Searchable country origin dataset with capital coordinates and IANA zones. Origins are not a list of tournament qualifiers.
- Riyadh, Jeddah and Al Khobar destination selection and highlights.
- Haversine straight-line distance; current local times and date-specific IANA offsets including daylight saving. Pretoria represents South Africa's executive capital; times are for the listed capitals, not all regions of a country.
- Four generated scenes: arrival, culture, fictional fan atmosphere, final memory. Previous choices and scene narratives ground later scenes.
- Ten optional cultural questions with immutable curated answers; feedback never depends on the model.
- English/Arabic UI, RTL, reduced motion, keyboard controls and mobile layouts.
- Selections, generated scenes and choices persist in browser localStorage. Changing tournament, origin or destination resets generated story data. Back navigation preserves selections. New journey clears the previous story.
- Switching language preserves saved story content in its original language, labeled accordingly; subsequent generated scenes use the newly selected language. The interface itself is translated.
- Personalized completion card and PNG export. On success, an export preview and a second download link are shown. The export uses system fonts for reliability and contains no cross-origin photos.

Storage contains only local choices and generated content; it is not encrypted and should not contain sensitive data. Clearing browser storage clears progress. In private browsing or if storage is unavailable, the current session still works but persistence may not.

## Deployment: single Node service (recommended)

The app is prepared for deployment; no remote service has been provisioned or published during this task.

### Render or equivalent Node hosting

1. Push this directory to a private Git repository.
2. Create a Render Web Service from it, or use the included render.yaml blueprint. Set the repository root directory if this app is in a subfolder.
3. Use Node 24. Build: `corepack enable && pnpm install --frozen-lockfile && pnpm build`.
4. Start: `pnpm start`. The host supplies PORT; the app binds 0.0.0.0.
5. Set OPENROUTER_API_KEY and OPENROUTER_MODEL in the host's secret environment settings. Never put them in a static-site build variable.
6. Health-check `/api/health`, then run the complete real-key journey after deployment.
7. Use HTTPS at the host edge. If the service is behind exactly one trusted reverse proxy, set TRUST_PROXY_HOPS=1 for per-visitor rate limiting. Do not enable proxy trust on an internet-facing server without that proxy.

### Docker

```sh
docker build -t saudi-fan-journey .
docker run --rm -p 3001:3001 --env-file .env saudi-fan-journey
```

Docker excludes local .env, node_modules and Git data. The hosting runtime needs outbound HTTPS to openrouter.ai. Scale beyond one process only after moving rate-limit state into a shared store; current rate limiting is in-memory per process. Free hosting tiers may sleep. Configure the host request timeout above 55 seconds to accommodate one repair attempt.

Vercel's static hosting alone cannot run this Express process. Prefer the single-service deployment above. A separate Vercel frontend requires a rewrite/proxy to a deployed Express backend, consistent API paths, backend HTTPS and an appropriate security review; it is not the included default deployment.

## Tests and verification

```sh
pnpm test
pnpm build
```

See TESTING.md for the checks actually performed and outstanding live-provider checks. Unit/integration tests use explicit provider mocks and never prove live Llama connectivity.

For UI-only regression testing without an API key:

```sh
pnpm build
node --experimental-strip-types tests/fixture.ts
```

Open http://localhost:3002. All test scenes explicitly say TEST FIXTURE / NOT AI OUTPUT. This separate local test server is not used by the production server. Do not deploy it as the application.

## Data and asset sources

- Tournament date: Saudi Arabian Football Federation, https://www.saff.com.sa/en/news.php?id=3440 (7 January–5 February 2027). No specific fixtures are modeled.
- Cultural grounding: UNESCO Arabic coffee https://ich.unesco.org/en/RL/arabic-coffee-a-symbol-of-generosity-01074 ; majlis https://ich.unesco.org/en/RL/majlis-a-cultural-and-social-space-01076 ; Historic Jeddah https://whc.unesco.org/en/list/1361/ ; Saudi Culinary Arts Commission https://culinary.moc.gov.sa/ . Etiquette and sportsmanship cards are practical guidance, not legal advice.
- Country/city coordinates are rounded capital/city-center reference points, not airport locations. IANA data is supplied by the Node/browser Intl runtime.
- Photos are bundled from Unsplash under its standard license (https://unsplash.com/license). Jeddah: https://unsplash.com/photos/traditional-architecture-building-is-lit-up-at-night-FDGA5A7IQF4 ; Al Khobar: https://unsplash.com/photos/the-sun-is-setting-over-a-park-with-palm-trees-5Yt5tTYF7NM ; Riyadh source image: https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6 . Gradient fallbacks remain visible if images cannot load.
- Fonts: Plus Jakarta Sans and IBM Plex Sans Arabic via Google Fonts, with system fallbacks. Font loading is optional to functionality.

## Troubleshooting

- 503 / setup required: set both server variables, select a Meta Llama ID and restart.
- 502 / provider failure: confirm model availability, key and credit balance; the provider HTTP status is included without sensitive details.
- Invalid scene after retry: the model failed the strict JSON/stage/grounding contract. Retry or select another currently available Meta Llama model supporting JSON.
- 504: provider timed out. Retry; check hosting outbound access and timeout settings.
- 429: wait one minute. Inspect proxy configuration if unrelated visitors share the limit.
- No browser data persists: allow site storage, or continue within the current session.
- PNG export blocked: use the displayed Save PNG again link; browser download policies may require a direct click.
- Windows loader errors: use Node 24 and the supplied `--configLoader runner` build script.

## Layout

`client/src/main.tsx` holds the complete journey UI and reusable Button/PageTitle components; `client/src/style.css` holds the responsive visual system. `shared/data.ts` holds the original and additional supported countries, destinations, tournaments, cultural grounding, phrases, quizzes and geography/time helpers. `server/adventure.ts` owns validation and provider integration; `server/index.ts` owns HTTP/security/static serving. Tests sit next to the modules they verify, with an isolated browser fixture under tests/.

## Heritage redesign update (2 November 2026)

The visual system now uses sand, Najdi clay, Hijazi wood tones and Eastern palm green, with a generated landmark montage spanning multiple Saudi regions. The destination step features King Fahd Sports City, Alinma Stadium and Aramco Stadium images, capacities, establishment/history, redevelopment status, source links, map links and transport details. Riyadh guidance identifies Metro Line 2 (Red) to King Fahd Sports City; it does not invent a direct metro for Jeddah or Khobar.

There are 29 supported origins, including 13 geographically Asian origins for the Asian Cup filter. This is a curated supported-origin list, not an exhaustive list of Asian countries or a qualification list. The backend also rejects non-Asian origins for Asian Cup adventure requests. A previously saved incompatible origin is reset to Japan while story data is cleared to avoid mixing contexts.

Regional cultural cards use the origin language (Japanese for Japan), with smaller Arabic translations. Local copy is supplied in Japanese, Korean, Chinese, Hindi, German, French, Spanish, Italian, Portuguese, English and Arabic. All current supported origins map to one of these languages; English is used for the listed English-speaking/multilingual origins. Recipes follow the user's brief and are presented as household-variable examples. Riyadh: Najdi coffee and marqooq; Jeddah: Hijazi coffee and saleeg; the East: Eastern coffee and Hassawi rice. Cultural photos are AI illustrations, labeled in the UI; they are not documentary photos.

### Two explicit story modes

- **Meta Llama mode:** when configured, the selected heritage/food/football trail enters the real API prompt, with regional and stadium context. Attribution is displayed only after a successful provider response.
- **Curated local story:** when no key is configured, the visitor can complete an interactive four-scene guide immediately. It is prominently labeled “local guide / not AI”; this is a separate functional experience, not a replacement masquerading as Llama output. Choices, regional dishes and the final memory affect the local narrative.

### Tourist chat

The new floating tourist assistant supports a real server-side `POST /api/chat` integration. Example request:

```json
{"country":"JP","destination":"riyadh","language":"ja","messages":[{"role":"user","content":"地下鉄でスタジアムに行くには？"}]}
```

Messages are validated (12 messages maximum, 2,000 characters each; last role must be user). The response language defaults to the selected origin, with a visible language selector. The server supplies curated culture, regional recipes and stadium/transit context, requires Meta Llama, disables provider fallback and uses a 25-second timeout. Chat requests are limited to 15 per IP per minute. Model output renders as plain React text. No key is sent to the browser.

Without credentials, a free-text AI question returns an honest setup message. Separate quick-information buttons display explicitly labeled curated local content; these are not AI answers. The latest verification still has no successful real Llama request because no key was supplied. Set the same OPENROUTER_API_KEY and OPENROUTER_MODEL for both chat and stories, restart the server and refresh the page before the live demonstration.

See ASSETS.md for new visual assets, generation prompts and official-image provenance. Source modules added: shared/regions.ts, shared/stadiums.ts, shared/local-guide.ts, server/chat.ts, and the RegionalGuide, StadiumGuide and TouristChat components. The new heritage.css layer supplies the revised identity.


## Explorer update — landmarks, missions and AI activation

The dashboard now includes 15 real photographed landmarks (five per destination group), searchable/filterable categories, map/source links, native Japanese descriptions for Japan and Arabic subtitles, and a persistent visit wishlist. Al Ahsa and Dhahran destinations are explicitly distinguished from places inside Al Khobar. Image authors, original source pages, licences and WebP/resize notices are provided in the UI and shared/place-photos.ts. Most images are licensed Commons material; the Muaiqiliyah source photo retains its Saudipedia owner rights. The new hospitality/etiquette illustrations use separate image files rather than recycled coffee/architecture photos. The requested recipe-disclaimer wording was removed from the UI and regional copy.

The current adventure screen is now the Explorer Passport (QuestStudio), replacing the repetitive local-story UI:

1. Build a three-stop route from real place photographs.
2. Solve a seeded, shuffled visual landmark clue, with optional hint and score consequences.
3. Respond to a photography-permission situation and earn a thoughtful-guest stamp.
4. Choose a final place/photo memory, add a personal note, and download a PNG passport with points, route and earned stamps.

There are explicitly separate modes: hands-on challenges without AI, and real Meta Llama narrative. AI mode generates four genuine chapters using validated route IDs and the actual task decisions. It never labels the hands-on preview as AI. Route IDs are validated to the selected destination and must be three distinct places. Cultural quiz correctness and scores are app-owned, not model-owned. Passport progress is saved by origin/destination/tournament in localStorage.

The floating AI connection control provides official account/key/model links and a real test button. See AI_SETUP_AR.md for Arabic setup steps. A blank local `.env` was prepared with the Meta Llama model prefilled. It is NOT included in the ZIP. No real key has been supplied or logged. In local development, saved .env changes are reread without restart; production uses the hosting environment and standard service restarts.

`POST /api/ai/test` makes a real provider request through the tourist-chat service, limited to three attempts per minute. `/api/health` distinguishes missing key, missing model, invalid model, configured-but-untested and a successful verified reply, without exposing the key. Chat and story successes also mark the current configuration verified in process memory. Verification is not persisted as proof across restarts.

The public OpenRouter model catalogue was checked during this update: `meta-llama/llama-3.3-70b-instruct` was listed with response_format support and paid token pricing. No free Meta Llama model was assumed. This catalogue read is not a successful authenticated model-generation test; live inference remains dependent on the user's key/account credit.

New source: shared/places.ts, shared/place-photos.ts, shared/expedition.ts, server/ai-status.ts, LandmarkGuide.tsx, QuestStudio.tsx, AIConnection.tsx and expedition.css. Generated-image prompts and saved project paths are recorded in GENERATED_IMAGES_V3.md.


## Tournament separation — November 2026

Asian Cup offers exactly 24 confirmed finalists (including Australia and Yemen; excluding non-finalists India/Lebanon). The original three-city cultural explorer remains separate. World Cup has a distinct five-city atlas, all 15 published bid stadium designs, FIFA bid capacities, cultural trip ideas and a locally saved multi-stadium blueprint with PNG export. Future plans are labelled as proposals, not confirmed match schedules. Aramco includes the listed 1 December 2026 fixture with a source qualifier.

## Stadium explorer and visitor language
Asian Cup stadium cards now open an interior/exterior photo gallery with zoom, club relationships and timeline/transport tabs. Image labels distinguish historical real photos from official design renders. Japanese/Italian and 16 other supported language choices apply to page content through a server-side translation service; cached translations persist privately in .runtime/ and never contain credentials. Initial translation requires provider connectivity, with explicit loading/retry states. Translation uses a separate Groq GPT OSS 20B model to avoid consuming the Qwen chat model quota. Arabic/English base copy remains available.
The Qwen assistant now serves Saudi cities beyond the selected host city, retrieves Hail facts and the ten proposed supporting base-camp locations, keeps longer conversation context and shows source links. It never confirms a team assignment or training access without evidence. Native adventure generation supports the selected visitor language.

## Latest configuration
The new Groq key is stored only in .env. Qwen chat gives brief selected-language answers and can answer general questions beyond travel. The selector supports 45 language choices; API language tags are checked using Intl language data. Arabic/Japanese/French live checks passed. A user-configured Asian Cup scenario date of 21 January 2028 is clearly distinguished from an official schedule; the original 2027 finalist list remains a reference. There are now 28 photographed places: Riyadh 10, Jeddah 10, Al Khobar/regional outings 8.

## Matchday challenge update
Asian Cup now starts a five-situation fan day in one click, replacing the three-place selection flow. Decisions award points and stamps, with immediate curated feedback, optional live AI coaching, saved progress and a downloadable final card. The main Qiddiya stadium is explicitly named Riyadh; Qiddiya Coast remains a separately labelled Jeddah proposal from the 2024 bid.
