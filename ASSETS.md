# Visual assets — heritage redesign

## Generated assets

Created with the built-in image generation tool, then encoded to WebP for delivery (no changes to their content). Original generated PNGs are preserved in client/public/images/ alongside the WebP files.

- `client/public/images/saudi-mosaic.webp` — homepage artistic travel composition (not a geographically literal photograph).
- `client/public/images/culture-atlas.webp` — nine-panel illustrative contact sheet consumed using CSS background positioning: three coffees, three regional dishes, three architectural scenes. Recipe photos are illustrations, not proof of a single definitive recipe.

### Final prompt: Saudi montage

Use case: ads-marketing. Asset type: wide website hero artwork, landscape 3:2. Create a premium editorial travel photomontage of Saudi Arabia's diverse regions with a seamless warm golden-hour atmosphere: Najdi Diriyah mudbrick heritage architecture with triangular parapets, Riyadh Kingdom Centre skyline subtly in background, Hijazi Al Balad wooden rawashin in Jeddah, Red Sea turquoise water, Eastern Saudi Al Ahsa palm oasis and Arabian Gulf corniche, AlUla sandstone tomb landscape and Asir mountain village buildings in the distance. A richly textured photographic collage of destinations, not pretending these places are geographically adjacent. Warm sandstone, terracotta, palm green and sea turquoise. Architectural subjects occupy full panoramic frame, a layered travel-magazine aesthetic. No writing, labels, logos, watermark, people or football stadiums. This will be labeled artistic travel composition.

### Final prompt: regional contact sheet

Use case: photorealistic-natural. Asset type: a 3 columns by 3 rows editorial photo contact sheet for a Saudi cultural travel website, exactly nine equally sized square photo panels in a perfect grid with NO borders/gaps/text. Each panel is a separate beautifully lit full-bleed food or architecture photo, no writing anywhere. Top row left: golden blond Najdi Arabic coffee in small handleless finjan cups, ornate brass dallah, Riyadh dates, cardamom, cloves and saffron on a sadu woven table. Top middle: Hijazi medium-golden Arabic coffee, silver dallah, mastic crystals cardamom saffron and dates beside a wooden rawashin window. Top right: Eastern Saudi pale-golden Arabic coffee, brass dallah with saffron cardamom dates on palm weave. Middle row left: authentic Saudi marqooq stew, thin whole-wheat dough pieces with meat, tomato, zucchini and pumpkin in a rustic bowl, not pasta. Middle middle: authentic Hijazi saleeg, creamy white rice cooked with milk and broth topped with roasted chicken, warm butter sheen. Middle right: authentic Eastern Saudi hassawi reddish brown rice with spiced meat and onion, palm-frond mat. Bottom row left: Najdi Diriyah mud brick architecture with triangular parapets. Bottom middle: Hijazi Al Balad traditional carved wooden rawashin facade. Bottom right: Eastern Saudi Al Ahsa traditional plaster architecture with palms and a coastal courtyard. Natural material textures, appetizing elegant travel magazine photography, warm ivory, terracotta and date-palm green, no people, no captions, no utensils crossing grid boundaries.

## Stadium imagery and provenance

Official images retain their owners' rights. Source attribution is displayed beside the image and linked in each stadium guide. These images are not represented as public-domain or AI-generated assets. Confirm appropriate reuse rights with the owners before a public/commercial release; the supplied educational project does not include a blanket redistribution licence from the owners.

- Riyadh: `client/public/images/stadium-riyadh.webp`. Official Populous redevelopment visualisation, not a completed-building photograph. Source https://populous.com/showcases/king-fahad-sports-city-stadium . Image https://populous.com/uploads/2026/06/Populous_King-Fahad-Sports-City-Stadium-scaled-1920x0-c-default.webp .
- Jeddah: `client/public/images/stadium-jeddah.webp`. Saudi Ministry of Sport stadium photograph. Source https://www.mos.gov.sa/facilities/sport-facilities/sport-cities/king-abdullah-sport-city-jeddah . Original image https://www.mos.gov.sa/-/media/king-abdullah-sport-city-jeddah.jpg .
- Al Khobar: `client/public/images/stadium-khobar.webp`. Official construction-progress photograph identified as September 2026; it is not used to assert an official opening. Source https://www.aramcostadium.com/en/about . Image https://www.aramcostadium.com/-/jssmedia/aramcostadium/construction-2026/2026-sep-img-2.webp . Resized/encoded for web delivery only.

Country flag PNGs in `client/public/images/flags/` were downloaded from https://flagcdn.com/w80/{country-code}.png, derived from national flag designs. Flag imagery replaces Unicode regional-indicator emoji because Windows did not render those as flags during browser QA. No country qualification status is inferred from a flag.

Original city photography remains credited in README.md. New CSS uses code-native geometry for the arch, palm/clay colour system and decorative ribbon rather than fabricated text within images.

## Explorer landmark imagery

Fifteen local photographs and full source/author/licence data are maintained in shared/place-photos.ts. Wikimedia Commons originals include Public Domain, CC BY and CC BY-SA images. Their per-file source and licence links are rendered in the landmark cards, with modification notices; mission image credits are also available in an expandable panel. WebP conversions retain the source licence. The Muaiqiliyah source image comes from its specific Saudipedia article and is attributed to the owner rather than described as open-licensed. Specific image reuse rights for that owner-retained image should be cleared before public redistribution, as for the official stadium images.

New generated cultural assets are client/public/images/hospitality.webp (offering coffee and dates to a visitor) and client/public/images/etiquette.webp (asking permission before a photograph). They are labeled illustrations; their exact prompts and local paths are recorded in GENERATED_IMAGES_V3.md.

## World Cup atlas
World stadium images 0–11 are published SAFF media-centre bid designs via https://saudipedia.com/en/2034-fifa-world-cup-stadiums . Remaining 12 (South Riyadh), 13 (Jeddah Central), 14 (NEOM) are the corresponding designs at https://saudipedia.com/ملاعب-كأس-العالم-2034 . Rights retained by original owners; not AI-created or completed-site photographs.
Abha city: Green Mountain photograph via https://saudipedia.com/en/abha-city . NEOM regional landscape: https://neom.scene7.com/is/image/neom/NEOM_THELINE_HERO_IMG?scl=1 via https://www.neom.com/en-us/regions/theline . NEOM landscape is not a completed future city.
Asian Cup identity: https://www.asiancup2027.sa/images/afc_logo_desktop.png . Saudi 2034 bid mark extracted from page 7 of https://strapi.wasmenia.com/uploads/Saudi_2034_Guidelines_a4a9956169.pdf ; labelled host-bid identity, not a final FIFA tournament emblem. Flags from flagcdn.com.

## Interior galleries — 2 November 2026
- fahd-bowl.webp and fahd-concourse.webp: official Populous redevelopment visualisations, https://populous.com/showcases/king-fahad-sports-city-stadium . Labelled renders, not completed works.
- aramco-bowl.webp and aramco-tunnel.webp: official venue-hire media, https://www.aramcostadium.com/en/venue-hire/event-spaces . Labelled published visualisations, not proof that a shown event occurred.
- alinma-interior.webp: Manaf228 at English Wikipedia, https://commons.wikimedia.org/wiki/File:Al-Jawhara2014.jpg ; CC BY-SA 3.0 https://creativecommons.org/licenses/by-sa/3.0/ . Real historical interior photo, 12 September 2014; resized and encoded to WebP. Attribution and licence appear in the gallery.

## Real Aramco photographs and expanded landmarks — 3 November 2026
Aramco gallery now contains real photos only: operator interior/exterior progress photos from September 2026 at https://www.aramcostadium.com/en/about and the 18 October 2026 club-visit photo at https://alqadsiah.com/en/posts/alkadsy-ystkshf-mlaab-aramko-astaadada-lahtdan-mbaryath-aal-ardh . No Google Maps user photo is copied or presented as operator photography.
13 additional places use actual photographs with per-photo author, licence and source links in shared/extra-places.ts. Riyadh: National Museum, Murabba Palace, Kingdom Centre, Faisaliah Tower, KAFD. Jeddah: King Fahd Fountain, Tayebat Museum, Obhur Creek, Khuzam Palace, Bab Makkah. Al Khobar: Water Tower, King Fahd Causeway, Scitech. Scitech building photo is from Saudipedia; all other additions are attributed Wikimedia Commons photographs.
