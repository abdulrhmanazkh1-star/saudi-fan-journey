# Verification record

Executed on 2 November 2026.

## Passed

- TypeScript strict check: `node node_modules/typescript/bin/tsc --noEmit`.
- Production Vite build with runner config loader. Generated static client bundle and local photos in dist/.
- 17 Node unit/integration tests: country identifiers and request/history constraints; response shape and simulation flag; missing config and wrong model family; authenticated provider request; previous choices in provider messages; malformed JSON retry/failure and recovery; grounded-fact rejection; safe provider errors; actual HTTP input and missing-config errors; timeout mapping; HTTP rate limiting; Tokyo–Riyadh Haversine distance; zero-distance invariant; London summer/winter and India half-hour offsets; all 20 origin time zones/coordinate ranges; all ten quiz answer records.
- Browser tested the production app at localhost:3001: homepage, 2027 selection, Japan search/filter, country and Riyadh selection, dashboard, English/Arabic switching, and actual API configuration failure with retry control.
- Dashboard showed Tokyo–Riyadh approximately 8,689 km, and destination minus origin time difference of −6 hours.
- Browser tested isolated localhost:3002 fixture: four scene transitions, choice history reaching subsequent scenes, optional quiz correct-answer feedback, completion card, persistence after reload, and PNG generation/download action.
- PNG result was decoded by the browser: natural dimensions 1150 × 1334, complete=true. The application displays an exported-image preview and direct repeat-download link. OS download-folder delivery was not independently observed.
- The fixture explicitly labels all its scene narratives and attribution as TEST FIXTURE / NOT AI OUTPUT. It does not claim Llama connectivity and is excluded from the production server.
- Browser inspected a narrow 650 px viewport using the mobile navigation and responsive stacked layouts. Physical phones and additional browser engines were not tested.
- Saudi photos downloaded with successful HTTP 200 responses, bundled locally and visually inspected (Riyadh panorama, Jeddah heritage architecture, Al Khobar corniche sunset). Gradients remain as graceful fallbacks.

## Not verified / external setup required

- No OpenRouter key was provided. There has been no live successful Llama request, no live provider-generated four-scene adventure, and no claim of one. Provider tests use deterministic mocks; UI lifecycle tests use the visibly labeled separate fixture.
- No remote deployment was performed. Dockerfile, Render blueprint, environment example and step-by-step deployment instructions are included. Run the real-key flow on the target host before a public demonstration.
- 2034 uses the same stage engine and input validation with future-simulation metadata; a separate complete 2034 browser run was not performed.
- Browser-controlled PNG generation was confirmed; browser download location depends on the host app/browser policy.
- Full screen-reader audit, physical-device QA and multi-instance deployment/load testing remain outside this verification.

## Environment notes

Initial package installation succeeded in fetching dependencies but returned a nonzero status because pnpm blocked esbuild lifecycle scripts. pnpm-workspace.yaml now declares esbuild as an allowed build dependency. The default tsx loader encountered an OS user-info sandbox error; production/test scripts use Node 24 native TypeScript support instead. Vite's default config bundler encountered a parent-path sandbox access error; the runner config loader builds successfully.

Final command verification: the documented pnpm build command completed successfully after switching the pnpm 11 lifecycle allowlist to allowBuilds: { esbuild: true }. Both esbuild installation scripts completed, TypeScript passed and Vite built successfully.

## Heritage redesign regression checks

- Strict TypeScript check and production build passed after the redesign.
- 26 unit/integration tests passed, including 13-origin Asian Cup filtering, backend rejection of European/African Asian Cup origins, Japanese recipe/Arabic ingredient coverage, stadium current/planned transport distinctions, branching local stories, chat schema validation, a mocked authenticated Llama request with Japanese/metro grounding, provider failure handling and actual missing-configuration chat HTTP behavior.
- The real production browser flow was exercised in Arabic with Japan selected: Asian Cup origins contained only the 13 supported Asian countries; stadium destination cards displayed the requested three venues; Riyadh details exposed Line 2/Red Line, station, source and map links; Japanese coffee and marqooq cards displayed Arabic subtitles and ingredients.
- The actual curated local story (not a fixture) completed four scenes for Al Khobar with food-trail selection, visible prior choices and a completed result. PNG export decoded successfully at 1560 × 1188 with loaded flag images.
- The real tourist chat UI showed Japanese curated stadium information and sent a free-text Japanese question to the backend; the server correctly returned the missing-key setup error without inventing an AI reply.
- The landmark montage, official Riyadh rendering, Jeddah Ministry of Sport stadium image, Aramco September 2026 progress photograph and regional illustration atlas were visually inspected. Images use local assets and country flags now use image files rather than unsupported Windows flag emoji.
- No live Llama success is claimed. No remote deployment was performed.

## Explorer update verification

- 33 automated tests passed after adding landmark data, geographic labels, real asset existence/attribution, stable unique photo-clue choices, meaningful scoring, validated three-place AI routes, key-free status reporting and the actual diagnostic endpoint's missing-key behavior.
- Strict TypeScript check and Vite production build passed.
- Browser: Riyadh dashboard displayed Masmak, Wadi Hanifah, Muaiqiliyah, At-Turaif and Souq Al Zal with real photos, descriptions and attribution; market filtering and bookmarking updated the view/visit list.
- Browser: the complete hands-on Explorer Passport flow selected three distinct real stops, identified the Muaiqiliyah photo, answered the permission scenario, chose a memory and entered a personal note. Score reached 260 with the corresponding stamps. A generated PNG passport loaded successfully at 1560 × 1630 pixels.
- Browser: the real AI setup dialog opened from the primary activation button, showed official account/key/model links, and an actual call to /api/ai/test reported the missing key instead of fabricating verification.
- The public OpenRouter model catalogue returned Meta Llama instruct models with JSON response-format support. This was a read-only catalogue check, not authenticated inference.
- No live Meta Llama success or remote deployment is claimed. Adding a valid key and available account credit remains necessary for that test.

## Current verification
38 automated tests passed; TypeScript and production build passed. Browser verified 24 Asian Cup teams, three Asia destinations without World Cup atlas, five World Cup cities/15 venues, filtering, local plan persistence and correct Abha chat context. Real Groq Qwen replies succeeded for Arabic tourist transport, Japanese Abha capacity and Arabic quest scene generation. No live inference occurs in unit tests.

## Interior/language/assistant enhancement
42 automated tests pass. Real API checks: Hail and proposed training-city answers in Arabic/Italian; Japanese adventure scene; Italian/Japanese UI translation. UI verification: interior gallery, club tabs, zoom controls, country-driven Japanese language selection. Initial translations depend on provider quota; persisted cache avoids repeated calls.

## 3 November enhancement
45 tests passed; TypeScript/build passed. New key verified with actual responses. Arabic question with Japanese selected returned Japanese after explicit target-language enforcement; French general-science response succeeded; custom-date question correctly explained 21 January 2028 as project configuration. All Aramco gallery entries are real photos with capture/publication context.

## Matchday game verification
49 automated tests pass; TypeScript and production build pass. Scenario tests cover five valid moments per host city, seeded variation, scoring and distinct Riyadh Qiddiya/Jeddah Coast entries. Browser verified one-click start, immediate points, locked answers and progression.
Browser completed all five decisions with 100/100 and the final card; live AI coach returned a short Arabic reply after enabling outbound connectivity. Card export completed without a visible error.
