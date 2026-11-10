/* ASIA 27 | FANVERSE — data layer.
   Every record states its kind: "official" (confirmed by AFC / LOC reporting), "historical",
   "estimate", "ai" or "hypothetical". Verification date for this release: 2026-11-09. */
window.FV_DATA = (() => {
  const VERIFIED = "2026-11-09";

  const SOURCES = {
    wiki: { title: "Wikipedia — 2027 AFC Asian Cup (venues, draw, qualified teams)", url: "https://en.wikipedia.org/wiki/2027_AFC_Asian_Cup", date: VERIFIED },
    draw: { title: "Inside World Football — Asian Cup 2027 final draw, 11 May 2026", url: "https://www.insideworldfootball.com/2026/05/11/ahlan-asia-afc-saudi-arabia-set-stage-asian-cup-2027-draw/", date: "2026-05-11" },
    dates: { title: "Gulf News — AFC confirms revised dates (3 Nov 2026), pending FIFA approval", url: "https://gulfnews.com/sport/saudi-arabias-2027-afc-asian-cup-postponed-by-almost-a-year-1.500733864", date: "2026-11-03" },
    ministry: { title: "Ajel — Ministry of Sport stadium update (10 Aug 2026)", url: "https://english.ajel.sa/sports/nnad331wj", date: "2026-08-10" },
    imsiu: { title: "Economy Middle East — Imam Mohammed Ibn Saud University Stadium expansion", url: "https://economymiddleeast.com/news/afc-asian-cup-2027-saudi-arabia-dates-stadium-nations", date: "2025-01-07" },
    aawsat: { title: "Asharq Al-Awsat — Dates and venues announced", url: "https://english.aawsat.com/sports/5098830-afc-asian-cup-saudi-arabia-2027-dates-and-venues-announced", date: "2025-01-07" },
    meet: { title: "MeetStadium — The eight stadiums of the AFC Asian Cup 2027", url: "https://meetstadium.com/journal/afc-asian-cup-2027-stadiums/", date: "2026-08-27" },
    sched: { title: "Malay Mail / Bernama-SPA — Jan–Feb 2027 schedule (superseded on 3 Nov 2026)", url: "https://www.malaymail.com/news/sports/2026/10/27/afc-asian-cup-2027-match-schedule-finalised-kickoff-times-and-venues-confirmed/240806", date: "2026-10-27" },
    afc: { title: "AFC — AFC Asian Cup official site", url: "https://www.the-afc.com/", date: VERIFIED },
  };

  const TOURNAMENT = {
    start: "2027-12-23", end: "2028-01-21", teams: 24, matches: 51, stadiums: 8, cities: 3,
    status: "announced-pending-fifa", source: "dates", drawDate: "2026-05-09",
  };

  // 47 AFC member associations (ISO-3166 codes; flag emoji derived from them).
  const AFC = ["AF","AU","BH","BD","BT","BN","KH","CN","TW","GU","HK","IN","ID","IR","IQ","JP","JO","KW","KG","LA","LB","MO","MY","MV","MN","MM","NP","KP","MP","OM","PK","PS","PH","QA","SA","SG","KR","LK","SY","TJ","TH","TL","TM","AE","UZ","VN","YE"];

  // Native-language code per nation for its local name (via Intl.DisplayNames).
  const NATIVE = { AF:"fa",AU:"en",BH:"ar",BD:"bn",BT:"dz",BN:"ms",KH:"km",CN:"zh",TW:"zh-Hant",GU:"en",HK:"zh-Hant",IN:"hi",ID:"id",IR:"fa",IQ:"ar",JP:"ja",JO:"ar",KW:"ar",KG:"ky",LA:"lo",LB:"ar",MO:"zh-Hant",MY:"ms",MV:"dv",MN:"mn",MM:"my",NP:"ne",KP:"ko",MP:"en",OM:"ar",PK:"ur",PS:"ar",PH:"fil",QA:"ar",SA:"ar",SG:"en",KR:"ko",LK:"si",SY:"ar",TJ:"tg",TH:"th",TL:"pt",TM:"tk",AE:"ar",UZ:"uz",VN:"vi",YE:"ar" };

  // Names the AFC uses that differ from ISO display names.
  const NAME_OVERRIDE = {
    TW: { en: "Chinese Taipei", ar: "تايبيه الصينية", ko: "차이니스 타이베이", ja: "チャイニーズ・タイペイ", native: "中華台北" },
    HK: { en: "Hong Kong, China", ar: "هونغ كونغ", ko: "홍콩", ja: "香港", native: "香港" },
    MO: { en: "Macau", ar: "ماكاو", ko: "마카오", ja: "マカオ", native: "澳門" },
    PS: { en: "Palestine", ar: "فلسطين", ko: "팔레스타인", ja: "パレスチナ", native: "فلسطين" },
    KR: { en: "South Korea", ar: "كوريا الجنوبية", ko: "대한민국", ja: "韓国", native: "대한민국" },
    KP: { en: "DPR Korea", ar: "كوريا الشمالية", ko: "북한", ja: "北朝鮮", native: "조선" },
    AE: { en: "United Arab Emirates", ar: "الإمارات", ko: "아랍에미리트", ja: "アラブ首長国連邦", native: "الإمارات" },
    MP: { en: "Northern Mariana Islands", ar: "جزر ماريانا الشمالية", ko: "북마리아나 제도", ja: "北マリアナ諸島", native: "Northern Mariana Islands" },
  };

  // Accent colours (subtle; used for lines and glows only).
  const COLORS = { SA:["#13a877","#e9f5ee"],KR:["#cd2e3a","#0047a0"],JP:["#2a4fb5","#e5e9f5"],QA:["#a3214d","#f0e6ea"],AU:["#f2c230","#0f7a4a"],IR:["#239f40","#da0000"],IQ:["#c8102e","#1f7a3f"],UZ:["#1eb5e5","#1eb53a"],AE:["#00843d","#c8102e"],JO:["#c8102e","#007a3d"],CN:["#de2910","#ffde00"],ID:["#e0191f","#f1f1f1"],TH:["#2d2a4a","#a51931"],VN:["#da251d","#ffcd00"],OM:["#c8102e","#008000"],PS:["#007a3d","#c8102e"],BH:["#ce1126","#f1f1f1"],KP:["#024fa2","#ed1c27"],KW:["#007a3d","#ce1126"],KG:["#e8112d","#ffef00"],SY:["#ce1126","#007a3d"],SG:["#ef3340","#f1f1f1"],TJ:["#cc0000","#006600"],YE:["#ce1126","#f1f1f1"],MY:["#cc0001","#010066"] };

  // The 24 finalists — draw groups (9 May 2026) and records from the Wikipedia tournament page.
  // route: host | r2w | r2r | r3w ; best: winners|runnerup|third|fourth|qf|r16|group
  const FINALISTS = {
    SA:{g:"A",route:"host",best:"winners",years:[1984,1988,1996]},
    KW:{g:"A",route:"r2r",best:"winners",years:[1980]},
    OM:{g:"A",route:"r2w",best:"r16",bestYears:[2019]},
    PS:{g:"A",route:"r2r",best:"r16",bestYears:[2023]},
    UZ:{g:"B",route:"r2r",best:"fourth",bestYears:[2011]},
    BH:{g:"B",route:"r2r",best:"fourth",bestYears:[2004]},
    KP:{g:"B",route:"r2r",best:"fourth",bestYears:[1980]},
    JO:{g:"B",route:"r2w",best:"runnerup",bestYears:[2023]},
    IR:{g:"C",route:"r2w",best:"winners",years:[1968,1972,1976]},
    SY:{g:"C",route:"r3w",best:"r16",bestYears:[2023]},
    KG:{g:"C",route:"r2r",best:"r16",bestYears:[2019]},
    CN:{g:"C",route:"r2r",best:"runnerup",bestYears:[1984,2004]},
    AU:{g:"D",route:"r2w",best:"winners",years:[2015]},
    TJ:{g:"D",route:"r3w",best:"qf",bestYears:[2023]},
    IQ:{g:"D",route:"r2w",best:"winners",years:[2007]},
    SG:{g:"D",route:"r3w",best:"group",bestYears:[1984]},
    KR:{g:"E",route:"r2w",best:"winners",years:[1956,1960]},
    AE:{g:"E",route:"r2w",best:"runnerup",bestYears:[1996]},
    VN:{g:"E",route:"r3w",best:"fourth",bestYears:[1956,1960]},
    YE:{g:"E",route:"r3w",best:"group",bestYears:[1976,2019]},
    JP:{g:"F",route:"r2w",best:"winners",years:[1992,2000,2004,2011]},
    QA:{g:"F",route:"r2w",best:"winners",years:[2019,2023]},
    TH:{g:"F",route:"r3w",best:"third",bestYears:[1972]},
    ID:{g:"F",route:"r2r",best:"r16",bestYears:[2023]},
  };
  const GROUP_ORDER = { A:["SA","KW","OM","PS"], B:["UZ","BH","KP","JO"], C:["IR","SY","KG","CN"], D:["AU","TJ","IQ","SG"], E:["KR","AE","VN","YE"], F:["JP","QA","TH","ID"] };

  // UI language suggested for a nation's fans (only locales this release fully supports).
  const SUPPORTED = ["en","ar","ko","ja"];
  const ARABIC = ["SA","BH","IQ","JO","KW","LB","OM","PS","QA","SY","AE","YE"];
  function suggestLang(code) {
    if (ARABIC.includes(code)) return "ar";
    if (code === "KR" || code === "KP") return "ko";
    if (code === "JP") return "ja";
    return NATIVE[code] && SUPPORTED.includes(NATIVE[code]) ? NATIVE[code] : "en";
  }

  const L = (en, ar, ko, ja) => ({ en, ar, ko, ja });

  const CITIES = {
    riyadh: {
      name: L("Riyadh","الرياض","리야드","リヤド"), hue: 32,
      intro: L(
        "The capital and the tournament's heart: five stadiums, the historic At-Turaif district in Diriyah, and late-night city life that comes alive after sunset.",
        "العاصمة وقلب البطولة: خمسة ملاعب، وحي الطريف التاريخي في الدرعية، وحياة مسائية تنبض بعد الغروب.",
        "수도이자 대회의 중심. 다섯 개의 경기장, 디리야의 역사 지구 앗투라이프, 해가 지면 더 활기찬 밤 풍경이 기다립니다.",
        "首都にして大会の中心。5つのスタジアム、ディルイーヤの歴史地区アッ・トゥライフ、日没後に活気づく夜の街が待っています。"),
      transport: L(
        "Riyadh Metro runs six lines across the city. Check the official Riyadh Metro / Darb app for the station closest to your stadium. Taxis and ride-hailing apps are widely used.",
        "يعمل مترو الرياض بستة خطوط في أنحاء المدينة. راجع تطبيق مترو الرياض / درب الرسمي لمعرفة أقرب محطة لملعبك. سيارات الأجرة وتطبيقات التوصيل منتشرة.",
        "리야드 메트로는 도시 전역에서 6개 노선을 운행합니다. 경기장과 가장 가까운 역은 공식 리야드 메트로 / Darb 앱에서 확인하세요. 택시와 차량 호출 앱도 널리 이용됩니다.",
        "リヤド・メトロは市内で6路線を運行しています。スタジアム最寄り駅は公式のリヤド・メトロ／Darbアプリで確認してください。タクシーや配車アプリも広く使われています。"),
      sights: [
        { n: L("At-Turaif, Diriyah","حي الطريف، الدرعية","디리야 앗투라이프","ディルイーヤのアッ・トゥライフ"), d: L("UNESCO World Heritage mud-brick district, birthplace of the first Saudi state.","موقع تراث عالمي لليونسكو من الطين، مهد الدولة السعودية الأولى.","제1 사우디 국가의 발상지로, 흙벽돌 건축이 남아 있는 유네스코 세계유산입니다.","第一次サウード王国発祥の地。日干しれんがの街並みが残るユネスコ世界遺産です。") },
        { n: L("Masmak Fortress","قصر المصمك","마스막 요새","マスマク城"), d: L("Clay-and-mud fort in old Riyadh, central to the city's story.","حصن من الطين في قلب الرياض القديمة، محور رئيسي في تاريخ المدينة.","옛 리야드 중심의 흙 요새로, 도시 역사의 핵심 장소입니다.","旧市街にある土の要塞で、リヤドの歴史を語るうえで欠かせない場所です。") },
        { n: L("National Museum","المتحف الوطني","국립박물관","国立博物館"), d: L("Galleries tracing the Arabian Peninsula from prehistory to today.","قاعات تروي تاريخ الجزيرة العربية من عصور ما قبل التاريخ حتى اليوم.","선사시대부터 현재까지 아라비아반도의 역사를 따라가는 전시관입니다.","先史時代から現代までのアラビア半島の歩みをたどる展示です。") },
      ],
      food: ["kabsa","jareesh","qursan"],
    },
    jeddah: {
      name: L("Jeddah","جدة","제다","ジッダ"), hue: 195,
      intro: L(
        "The Red Sea gateway: coral-stone houses in Al-Balad, a long seafront corniche and Hijazi street food.",
        "بوابة البحر الأحمر: بيوت الحجر المرجاني في البلد، وكورنيش طويل، وأكلات الشارع الحجازية.",
        "홍해의 관문. 알발라드의 산호석 가옥, 길게 이어진 해안 코니시, 히자즈 지역의 길거리 음식이 매력입니다.",
        "紅海の玄関口。アル・バラドのサンゴ石の家並み、長く続く海沿いのコーニッシュ、ヒジャーズの屋台料理が魅力です。"),
      transport: L(
        "Most fans move by taxi or ride-hailing. Allow extra time near the corniche on match evenings. Check live directions before you leave.",
        "يتنقل معظم المشجعين بسيارات الأجرة أو تطبيقات التوصيل. خصص وقتاً إضافياً قرب الكورنيش في أمسيات المباريات، وتحقق من الاتجاهات المباشرة قبل الخروج.",
        "대부분의 팬은 택시나 차량 호출 앱으로 이동합니다. 경기가 있는 저녁에는 코니시 주변에서 시간을 넉넉히 잡고, 출발 전 실시간 길 안내를 확인하세요.",
        "多くのファンはタクシーや配車アプリで移動します。試合日の夜はコーニッシュ周辺で時間に余裕を持ち、出発前にリアルタイムの経路を確認しましょう。"),
      sights: [
        { n: L("Al-Balad (Historic Jeddah)","البلد (جدة التاريخية)","알발라드 (역사 지구 제다)","アル・バラド（歴史地区ジッダ）"), d: L("UNESCO-listed old town of coral-stone houses with carved wooden balconies.","بلدة قديمة مدرجة في اليونسكو، بيوتها من الحجر المرجاني ورواشينها الخشبية.","나무 발코니(로샨)가 달린 산호석 가옥이 늘어선 유네스코 등재 구시가지입니다.","木彫りの出窓（ロウシャン）が特徴的なサンゴ石の家々が並ぶ、ユネスコ登録の旧市街です。") },
        { n: L("Jeddah Corniche","كورنيش جدة","제다 코니시","ジッダ・コーニッシュ"), d: L("Seafront promenade for an evening walk before or after the match.","واجهة بحرية للمشي مساءً قبل المباراة أو بعدها.","경기 전후 저녁 산책하기 좋은 바닷가 산책로입니다.","試合前後の夕方の散歩にぴったりの海辺の遊歩道です。") },
        { n: L("King Fahd's Fountain","نافورة الملك فهد","킹 파흐드 분수","キング・ファハド噴水"), d: L("One of the world's tallest fountains, visible along the waterfront.","من أعلى النوافير في العالم، تُرى على امتداد الواجهة البحرية.","세계에서 가장 높은 분수 중 하나로, 해안가에서 볼 수 있습니다.","世界有数の高さを誇る噴水で、海沿いから眺められます。") },
      ],
      food: ["mutabbaq","saleeg","mandi"],
    },
    khobar: {
      name: L("Al Khobar","الخبر","알코바르","アル・ホバル"), hue: 170,
      intro: L(
        "On the Arabian Gulf coast, next to Dammam and Dhahran: a waterfront city with a brand-new stadium for the tournament.",
        "على ساحل الخليج العربي بجوار الدمام والظهران: مدينة ساحلية بملعب جديد كلياً للبطولة.",
        "담맘, 다란과 맞닿은 아라비아만 해안 도시로, 이번 대회를 위한 새 경기장이 들어섭니다.",
        "ダンマーム、ダーランに隣接するアラビア湾岸の街で、大会のために新しいスタジアムが建設されています。"),
      transport: L(
        "Taxis and ride-hailing are the practical choice. Dammam, Dhahran and Al Khobar are close together, so check live directions for the real travel time.",
        "سيارات الأجرة وتطبيقات التوصيل هي الخيار العملي. الدمام والظهران والخبر متقاربة، فتحقق من الاتجاهات المباشرة لمعرفة الوقت الفعلي.",
        "택시나 차량 호출 앱이 가장 현실적입니다. 담맘, 다란, 알코바르가 가까이 붙어 있으니 실제 이동 시간은 실시간 길 안내로 확인하세요.",
        "タクシーや配車アプリが現実的です。ダンマーム、ダーラン、アル・ホバルは近接しているので、実際の所要時間はリアルタイムの経路で確認してください。"),
      sights: [
        { n: L("Al Khobar Corniche","كورنيش الخبر","알코바르 코니시","アル・ホバル・コーニッシュ"), d: L("Gulf-side promenade with parks and cafés.","واجهة على الخليج مع حدائق ومقاهٍ.","공원과 카페가 이어진 걸프 해안 산책로입니다.","公園やカフェが並ぶ湾岸の遊歩道です。") },
        { n: L("Ithra, Dhahran","إثراء، الظهران","이트라 (다란)","イスラ（ダーラン）"), d: L("King Abdulaziz Center for World Culture: museum, library and exhibitions.","مركز الملك عبدالعزيز الثقافي العالمي: متحف ومكتبة ومعارض.","킹 압둘아지즈 세계문화센터. 박물관, 도서관, 전시가 한곳에 있습니다.","キング・アブドゥルアズィーズ世界文化センター。博物館、図書館、展示がそろっています。") },
        { n: L("Half Moon Bay","شاطئ نصف القمر","하프문 베이","ハーフムーン・ベイ"), d: L("Calm bay south of the city for a beach afternoon.","خليج هادئ جنوب المدينة لقضاء وقت على الشاطئ.","도시 남쪽의 잔잔한 만으로, 해변에서 오후를 보내기 좋습니다.","市の南にある穏やかな湾で、ビーチでの午後に最適です。") },
      ],
      food: ["kabsa","mandi","mutabbaq"],
    },
  };

  // status: operational | renovation | new | unknown
  const STADIUMS = [
    { id:"king-fahd", city:"riyadh", shape:"ring",
      name:L("King Fahd Sports City Stadium","استاد مدينة الملك فهد الرياضية","킹 파흐드 스포츠 시티 스타디움","キング・ファハド・スポーツシティ・スタジアム"),
      aka:L("King Fahd International Stadium","استاد الملك فهد الدولي","킹 파흐드 국제경기장","キング・ファハド国際スタジアム"),
      capacity:72000, capSrc:"wiki", capAlt:{ value:70200, src:"ministry" },
      opened:{ value:1987, kind:"historical" }, status:"renovation", statusSrc:"ministry",
      notes:L(
        "Largest venue of the tournament. The Ministry of Sport said in August 2026 it would run at its full 70,200 capacity and be ready by the end of 2026. The AFC lists a rounded 72,000.",
        "أكبر ملاعب البطولة. أعلنت وزارة الرياضة في أغسطس 2026 أنه سيعمل بطاقته الكاملة البالغة 70,200 متفرج ويكون جاهزاً بنهاية 2026، بينما يذكر الاتحاد الآسيوي رقماً تقريبياً قدره 72,000.",
        "대회 최대 규모의 경기장입니다. 체육부는 2026년 8월, 수용 인원 70,200석 전체로 운영되며 2026년 말까지 준비가 끝난다고 밝혔습니다. AFC 공식 목록에는 약 72,000석으로 표기되어 있습니다.",
        "大会最大の会場です。スポーツ省は2026年8月、収容人数70,200人の全面運用で2026年末までに完成すると発表しました。AFCの一覧では概数の72,000人とされています。"),
      prev:L(
        "Opening match and final (assigned in the Jan–Feb 2027 schedule, which was superseded on 3 Nov 2026).",
        "المباراة الافتتاحية والنهائي (وفق جدول يناير–فبراير 2027 الذي أُلغي في 3 نوفمبر 2026).",
        "개막전과 결승전 (2026년 11월 3일 대체된 2027년 1–2월 일정 기준).",
        "開幕戦と決勝（2026年11月3日に差し替えられた2027年1〜2月の日程による割り当て）。") },
    { id:"king-saud-university", city:"riyadh", shape:"bowl",
      name:L("King Saud University Stadium","استاد جامعة الملك سعود","킹 사우드 대학교 스타디움","キング・サウード大学スタジアム"),
      aka:L("Al-Awwal Park","الأول بارك","알아왈 파크","アル・アウワル・パーク"),
      capacity:26000, capSrc:"wiki", opened:{ value:2015, kind:"historical" }, status:"operational", statusSrc:"meet",
      notes:L("University stadium in north-west Riyadh, also known by its sponsored name Al-Awwal Park.","ملعب جامعي في شمال غرب الرياض، يُعرف أيضاً باسمه التجاري الأول بارك.","리야드 북서부의 대학 경기장으로, 스폰서 명칭인 알아왈 파크로도 알려져 있습니다.","リヤド北西部の大学スタジアムで、命名権名称のアル・アウワル・パークとしても知られています。") },
    { id:"kingdom-arena", city:"riyadh", shape:"arena",
      name:L("Kingdom Arena","المملكة أرينا","킹덤 아레나","キングダム・アリーナ"),
      aka:null, capacity:26000, capSrc:"wiki", opened:{ value:2024, kind:"historical" }, status:"operational", statusSrc:"meet",
      notes:L("Modern multi-purpose arena in Riyadh, used for football and major events.","ساحة حديثة متعددة الاستخدامات في الرياض تستضيف كرة القدم والفعاليات الكبرى.","축구와 대형 이벤트에 쓰이는 리야드의 현대식 다목적 아레나입니다.","サッカーや大型イベントに使われるリヤドの近代的な多目的アリーナです。") },
    { id:"imam-mohammed", city:"riyadh", shape:"bowl",
      name:L("Imam Mohammed Ibn Saud University Stadium","استاد جامعة الإمام محمد بن سعود الإسلامية","이맘 무함마드 이븐 사우드 대학교 스타디움","イマーム・ムハンマド・イブン・サウード大学スタジアム"),
      aka:null, capacity:25000, capSrc:"wiki", capAlt:{ value:21000, src:"imsiu" },
      opened:{ value:null }, status:"renovation", statusSrc:"imsiu",
      notes:L(
        "Being revamped for the tournament. The January 2025 announcement gave an expanded capacity of 21,000; the current tournament listing shows 25,000 after renovation.",
        "يخضع للتطوير استعداداً للبطولة. ذكر إعلان يناير 2025 سعة موسعة قدرها 21,000، بينما تُظهر القائمة الحالية 25,000 بعد التجديد.",
        "대회를 위해 개보수 중입니다. 2025년 1월 발표에서는 21,000석으로 확장된다고 했고, 현재 대회 목록에는 개보수 후 25,000석으로 표기되어 있습니다.",
        "大会に向けて改修中です。2025年1月の発表では21,000人に拡張とされ、現在の大会一覧では改修後25,000人と記載されています。") },
    { id:"al-shabab", city:"riyadh", shape:"compact",
      name:L("Al Shabab Stadium","استاد نادي الشباب","알샤바브 스타디움","アル・シャバブ・スタジアム"),
      aka:L("SHG Arena","SHG أرينا","SHG 아레나","SHGアリーナ"), capacity:14000, capSrc:"wiki", opened:{ value:1984, kind:"historical" }, status:"operational",
      notes:L("Smallest of the eight venues. Fully redeveloped and reopened in October 2023, it has been Al Shabab's home ground since, and Al-Riyadh also play here.","أصغر الملاعب الثمانية. اكتمل تطويره بالكامل وأُعيد افتتاحه في أكتوبر 2023، ومن وقتها صار ملعب الشباب الأساسي، ويلعب عليه نادي الرياض أيضاً.","여덟 개 경기장 중 가장 작은 곳입니다. 전면 재건축 후 2023년 10월 다시 문을 열었고, 이후 알샤바브의 홈구장이며 알리야드도 사용합니다.","8会場の中で最も小さいスタジアム。全面改修を経て2023年10月に再開場し、以来アル・シャバブの本拠地で、アル・リヤドも使用しています。") },
    { id:"king-abdullah", city:"jeddah", shape:"jewel",
      name:L("Alinma Stadium","ملعب الإنماء","알인마 스타디움","アリンマ・スタジアム"),
      aka:L("The Shining Jewel (Al-Jawhara)","الجوهرة المشعة","샤이닝 주얼 (알자우하라)","シャイニング・ジュエル（アル・ジャウハラ）"),
      capacity:60000, capSrc:"wiki", opened:{ value:2014, kind:"historical" }, status:"operational", statusSrc:"meet",
      notes:L("Jeddah's main venue, nicknamed the Shining Jewel for its glowing façade. The AFC venue list names it King Abdullah Sports City Stadium.","الملعب الرئيسي في جدة، ولُقّب بالجوهرة المشعة لواجهته المضيئة. يرد في قائمة ملاعب الاتحاد الآسيوي باسم استاد مدينة الملك عبدالله الرياضية.","제다의 메인 경기장으로, 빛나는 외관 덕분에 '샤이닝 주얼'이라는 별명이 붙었습니다. AFC 경기장 목록에는 킹 압둘라 스포츠 시티 스타디움으로 표기됩니다.","ジッダのメイン会場で、輝くファサードから「シャイニング・ジュエル」と呼ばれています。AFCの会場一覧ではキング・アブドゥッラー・スポーツシティ・スタジアムと記載されています。") },
    { id:"prince-abdullah-al-faisal", city:"jeddah", shape:"ring",
      name:L("Prince Abdullah Al Faisal Sports City Stadium","استاد مدينة الأمير عبدالله الفيصل الرياضية","프린스 압둘라 알파이살 스포츠 시티 스타디움","プリンス・アブドゥッラー・アル・ファイサル・スポーツシティ・スタジアム"),
      aka:null, capacity:26000, capSrc:"wiki", opened:{ value:1970, kind:"historical" }, status:"operational", statusSrc:"aawsat",
      notes:L("Hosted several matches of the 2023 FIFA Club World Cup.","استضاف عدة مباريات في كأس العالم للأندية 2023.","2023 FIFA 클럽 월드컵의 여러 경기를 개최했습니다.","2023年FIFAクラブワールドカップの複数試合を開催しました。") },
    { id:"aramco", city:"khobar", shape:"wave",
      name:L("Aramco Stadium","استاد أرامكو","아람코 스타디움","アラムコ・スタジアム"),
      aka:L("Al Khobar Stadium","استاد الخبر","알코바르 스타디움","アル・ホバル・スタジアム"),
      capacity:47000, capSrc:"wiki", opened:{ value:null }, status:"finishing",
      notes:L("New 47,000-seat stadium built by Aramco and ROSHN, with a design inspired by the whirlpools off Khobar's coast. Construction is almost complete; the official opening date has not been announced yet. It will be Al-Qadsiah's new home.","ملعب جديد بسعة 47 ألف متفرج بنته أرامكو وروشن، وتصميمه مستوحى من الدوّامات المائية قبالة ساحل الخبر. البناء شارف على الانتهاء، ولم يُعلن موعد الافتتاح الرسمي بعد. سيكون الملعب الجديد لنادي القادسية.","아람코와 로신이 지은 4만 7천 석 규모의 새 경기장으로, 코바르 앞바다의 소용돌이에서 영감을 받은 디자인입니다. 공사는 거의 끝났지만 공식 개장일은 아직 발표되지 않았습니다. 알카디시야의 새 홈구장이 됩니다.","アラムコとROSHNが建設した4万7千席の新スタジアム。ホバル沖の渦をモチーフにしたデザインです。工事はほぼ完了していますが、正式な開場日はまだ発表されていません。アル・カーディシーヤの新本拠地になります。") },
  ];

  const DISHES = [
    { id:"kabsa", ar:"كبسة", icon:"rice",
      name:L("Kabsa","الكبسة","캅사","カブサ"),
      d:L("Spiced rice cooked with chicken or lamb, often topped with nuts and raisins. Widely considered the national dish.","أرز متبّل يُطهى مع الدجاج أو اللحم، ويُزيّن غالباً بالمكسرات والزبيب. يُعد الطبق الوطني.","닭고기나 양고기와 함께 향신료를 넣어 지은 밥으로, 견과류와 건포도를 얹기도 합니다. 사우디의 대표 음식으로 꼽힙니다.","鶏肉や羊肉と一緒にスパイスで炊き上げるご飯。ナッツやレーズンをのせることも多く、国民食とされています。") },
    { id:"jareesh", ar:"جريش", icon:"bowl",
      name:L("Jareesh","الجريش","자리시","ジャリーシュ"),
      d:L("Cracked wheat slow-cooked into a soft, savoury porridge. A Najdi comfort dish.","قمح مجروش يُطهى ببطء حتى يصبح طرياً. طبق نجدي دافئ.","굵게 빻은 밀을 오래 끓여 부드럽게 만든 짭조름한 죽입니다. 나즈드 지방의 소박한 음식입니다.","粗挽きの小麦をじっくり煮込んだ、やわらかく塩味のおかゆ。ナジュド地方の家庭料理です。") },
    { id:"qursan", ar:"قرصان", icon:"bread",
      name:L("Qursan","القرصان","쿠르산","クルサーン"),
      d:L("Thin wheat bread torn into a vegetable and meat stew. Traditional in Najd.","خبز رقيق يُقطّع في مرق الخضار واللحم. طبق نجدي تقليدي.","얇은 밀빵을 채소와 고기 스튜에 찢어 넣은 나즈드 전통 음식입니다.","薄い小麦パンを野菜と肉の煮込みにちぎり入れた、ナジュドの伝統料理です。") },
    { id:"saleeg", ar:"سليق", icon:"bowl",
      name:L("Saleeg","السليق","살리그","サリーグ"),
      d:L("Rice simmered in broth and milk until creamy, served with chicken. Associated with the Hijaz and Taif.","أرز يُطهى في المرق والحليب حتى يصبح كريمياً ويُقدّم مع الدجاج. يرتبط بالحجاز والطائف.","육수와 우유에 쌀을 크림처럼 부드럽게 끓여 닭고기와 함께 냅니다. 히자즈와 타이프 지역 음식입니다.","スープと牛乳で米をクリーミーに煮込み、鶏肉を添えます。ヒジャーズやターイフの料理です。") },
    { id:"mandi", ar:"مندي", icon:"rice",
      name:L("Mandi","المندي","만디","マンディ"),
      d:L("Meat and rice slow-cooked in an underground pit oven. Yemeni in origin and popular across Saudi Arabia.","لحم وأرز يُطهيان ببطء في حفرة تحت الأرض. أصله يمني ومنتشر في أنحاء المملكة.","고기와 밥을 땅속 화덕에서 천천히 익힌 요리로, 예멘에서 유래해 사우디 전역에서 사랑받습니다.","肉と米を地中のかまどでじっくり加熱する料理。イエメン発祥でサウジ全土で人気です。") },
    { id:"mutabbaq", ar:"مطبق", icon:"bread",
      name:L("Mutabbaq","المطبق","무타바크","ムタッバク"),
      d:L("Pan-fried folded pastry filled with egg and minced meat, or a sweet filling. Classic Hijazi street food.","عجينة مطوية تُقلى وتُحشى بالبيض واللحم المفروم أو بحشوة حلوة. من أشهر أكلات الشارع الحجازية.","달걀과 다진 고기, 또는 달콤한 속을 넣고 접어서 부친 페이스트리입니다. 히자즈의 대표 길거리 음식입니다.","卵とひき肉、または甘い具を包んで焼いた折りたたみパイ。ヒジャーズの定番屋台料理です。") },
  ];

  // Verified etiquette scenarios. correct = index of the best choice.
  const MISSIONS = [
    { id:"coffee", correct:0,
      scene:L("You are a guest in a traditional Saudi majlis. Your host pours a small cup of Arabic coffee (gahwa) and offers dates. What do you do?","أنت ضيف في مجلس سعودي تقليدي. يصبّ لك المضيف فنجاناً صغيراً من القهوة العربية ويقدّم التمر. ماذا تفعل؟","전통 사우디 마즐리스에 손님으로 초대받았습니다. 주인이 작은 잔에 아랍 커피(가흐와)를 따르고 대추야자를 권합니다. 어떻게 할까요?","伝統的なサウジのマジュリスに客として招かれました。主人が小さなカップにアラビアコーヒー（ガハワ）を注ぎ、デーツを勧めてくれます。どうしますか？"),
      choices:[
        L("Take the cup with your right hand, enjoy it, and gently shake the cup when you've had enough.","آخذ الفنجان بيدي اليمنى وأستمتع به، وأهزّ الفنجان برفق عندما أكتفي.","오른손으로 잔을 받아 마시고, 충분히 마셨으면 잔을 가볍게 흔듭니다.","右手でカップを受け取って味わい、もう十分なときはカップを軽く振ります。"),
        L("Ask for a large mug with milk and sugar instead.","أطلب كوباً كبيراً مع حليب وسكر بدلاً منه.","대신 우유와 설탕을 넣은 큰 머그잔을 달라고 합니다.","代わりにミルクと砂糖入りの大きなマグカップを頼みます。"),
        L("Hand the empty cup back with your left hand and hold it out for refills all evening.","أعيد الفنجان الفارغ بيدي اليسرى وأمدّه للمزيد طوال السهرة.","빈 잔을 왼손으로 돌려주고 저녁 내내 계속 더 달라고 내밉니다.","空のカップを左手で返し、一晩中おかわりを求め続けます。"),
      ],
      why:L("Gahwa is a gesture of welcome. Using the right hand is customary, and a gentle shake of the cup tells the host you're finished. Otherwise they will keep refilling it.","القهوة العربية رمز للترحيب. استخدام اليد اليمنى هو المعتاد، وهزّ الفنجان برفق يعني للمضيف أنك اكتفيت، وإلا سيستمر في صبّها.","가흐와는 환영의 표시입니다. 오른손으로 받는 것이 관습이고, 잔을 가볍게 흔들면 그만 마시겠다는 뜻이 됩니다. 그렇지 않으면 주인이 계속 따라 줍니다.","ガハワは歓迎のしるしです。右手で受け取るのが習わしで、カップを軽く振ると「もう十分です」という合図になります。振らないと主人は注ぎ続けます。") },
    { id:"greeting", correct:1,
      scene:L("A Saudi fan next to you in the stands smiles and says \"As-salamu alaykum\". How do you reply?","مشجع سعودي بجانبك في المدرجات يبتسم ويقول: «السلام عليكم». كيف ترد؟","관중석 옆자리의 사우디 팬이 웃으며 \"앗살라무 알라이쿰\"이라고 인사합니다. 어떻게 답할까요?","スタンドで隣のサウジのファンが笑顔で「アッサラーム・アライクム」と言いました。どう返しますか？"),
      choices:[
        L("Stay silent and nod.","أصمت وأكتفي بإيماءة.","말없이 고개만 끄덕입니다.","黙ってうなずくだけにします。"),
        L("\"Wa alaykum as-salam\": and peace be upon you too.","«وعليكم السلام».","\"와 알라이쿰 앗살람\"(당신에게도 평화가)이라고 답합니다.","「ワ・アライクム・アッサラーム」（あなたにも平安を）と返します。"),
        L("Reply \"Good night\".","أرد بـ«تصبح على خير».","\"잘 자요\"라고 답합니다.","「おやすみなさい」と返します。"),
      ],
      why:L("\"As-salamu alaykum\" means \"peace be upon you\". The standard reply is \"Wa alaykum as-salam\". Locals will appreciate the effort.","«السلام عليكم» تعني السلام لكم، والرد المعتاد «وعليكم السلام»، وسيقدّر الناس محاولتك.","\"앗살라무 알라이쿰\"은 '당신에게 평화가'라는 뜻이며, 정해진 답례는 \"와 알라이쿰 앗살람\"입니다. 현지인들이 그 노력을 반가워할 거예요.","「アッサラーム・アライクム」は「あなたに平安を」という意味で、決まった返事は「ワ・アライクム・アッサラーム」です。地元の人はその心遣いを喜んでくれます。") },
    { id:"prayer", correct:2,
      scene:L("You arrive at a shop before the match and find it briefly closed for prayer time. What's the best move?","تصل إلى متجر قبل المباراة فتجده مغلقاً مؤقتاً لوقت الصلاة. ما أفضل تصرف؟","경기 전에 가게에 갔더니 기도 시간이라 잠시 문을 닫았습니다. 가장 좋은 행동은?","試合前にお店へ行くと、礼拝の時間で一時的に閉まっていました。どうするのがよいでしょう？"),
      choices:[
        L("Knock on the door until someone opens.","أطرق الباب حتى يفتح أحد.","누군가 열어 줄 때까지 문을 두드립니다.","誰かが開けるまでドアをノックします。"),
        L("Complain loudly to people nearby.","أشتكي بصوت عالٍ لمن حولي.","주변 사람들에게 큰 소리로 불평합니다.","周りの人に大声で文句を言います。"),
        L("Wait a short while or come back later, and check prayer times when planning your day.","أنتظر قليلاً أو أعود لاحقاً، وأراعي أوقات الصلاة عند تخطيط يومي.","잠시 기다리거나 나중에 다시 오고, 하루 일정을 짤 때 기도 시간을 확인합니다.","少し待つか後で出直し、一日の計画を立てるときに礼拝時間を確認します。"),
      ],
      why:L("Some businesses pause briefly during prayer times. Closures are short, so a little patience and planning around them works best.","تتوقف بعض المحلات لفترة قصيرة وقت الصلاة. الإغلاق قصير، لذا فالصبر قليلاً والتخطيط حوله هو الأفضل.","일부 상점은 기도 시간에 잠시 영업을 멈춥니다. 금방 다시 열기 때문에 조금 기다리거나 일정을 맞춰 짜는 것이 가장 좋습니다.","礼拝の時間に一時的に営業を止めるお店があります。閉店は短時間なので、少し待つか予定を合わせるのが一番です。") },
    { id:"dress", correct:0,
      scene:L("You're heading out to explore the city and then the stadium. What should you wear?","ستخرج لاستكشاف المدينة ثم إلى الملعب. ماذا ترتدي؟","시내를 둘러본 뒤 경기장으로 갈 예정입니다. 무엇을 입는 게 좋을까요?","街を観光してからスタジアムへ向かいます。何を着ていくのがよいでしょう？"),
      choices:[
        L("Modest, comfortable clothes that cover shoulders and knees, plus your team shirt.","ملابس محتشمة ومريحة تغطي الكتفين والركبتين، مع قميص فريقي.","어깨와 무릎을 가리는 단정하고 편한 옷에 응원 팀 유니폼을 입습니다.","肩とひざが隠れる控えめで楽な服に、応援チームのユニフォームを合わせます。"),
        L("Swimwear, since it's warm.","ملابس السباحة لأن الجو دافئ.","날씨가 따뜻하니 수영복을 입습니다.","暖かいので水着で出かけます。"),
        L("Anything at all; there are no expectations.","أي شيء، فلا توجد توقعات.","아무거나 상관없습니다. 따로 기대하는 복장은 없습니다.","何でも構わない。特に気にされることはない。"),
      ],
      why:L("Visitors are asked to dress modestly in public places, covering shoulders and knees. Team shirts are welcome.","يُطلب من الزوار ارتداء ملابس محتشمة في الأماكن العامة تغطي الكتفين والركبتين، وقمصان الفرق مرحب بها.","방문객은 공공장소에서 어깨와 무릎을 가리는 단정한 옷차림을 하도록 권장됩니다. 팀 유니폼은 물론 환영입니다.","公共の場では肩とひざを覆う控えめな服装が求められています。チームのユニフォームはもちろん歓迎です。") },
  ];

  const BADGES = ["first","hat","perfect","majlis","planner","explorer"];

  return { VERIFIED, SOURCES, TOURNAMENT, AFC, NATIVE, NAME_OVERRIDE, COLORS, FINALISTS, GROUP_ORDER, SUPPORTED, suggestLang, CITIES, STADIUMS, DISHES, MISSIONS, BADGES };
})();

/* Photos: Wikimedia Commons, free licences, credited on every page that shows them. */
window.FV_PHOTOS = {
  "paaf-u1": { by: "", lic: "", user: true },
  "paaf-u2": { by: "", lic: "", user: true, render: true },
  "alinma-1": { by: "", lic: "", user: true },
  "alinma-2": { by: "", lic: "", user: true },
  "alinma-3": { by: "", lic: "", user: true },
  "arena-1": { by: "", lic: "", user: true },
  "arena-2": { by: "", lic: "", user: true },
  "arena-3": { by: "", lic: "", user: true },
  "p-kafd": { by: "Ahmed", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:King_Abdullah_Financial_District_184701.jpg" },
  "p-faisaliah": { by: "xiquinhosilva", lic: "CC BY 4.0", src: "https://commons.wikimedia.org/wiki/File:Al_Faisaliah_Tower_(xiquinhosilva)_-_Flickr.jpg" },
  "p-redsea": { by: "Ammar shaker", lic: "Public domain", src: "https://commons.wikimedia.org/wiki/File:Red_Sea_Mall2.JPG" },
  "p-yacht": { by: "Kolaiel", lic: "CC0", src: "https://commons.wikimedia.org/wiki/File:Jeddah_Yacht_Club_4.jpg" },
  "p-fakieh": { by: "Radosław Botev", lic: "CC BY 3.0 pl", src: "https://commons.wikimedia.org/wiki/File:Fakieh_Aquarium_(4).jpg" },
  "p-ajdan": { by: "Ajdan Holdings", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:Ajdan_Walk,_Saudi_Arabia.png" },
  "p-moa": { by: "Arbitrarily0", lic: "CC BY-SA 3.0", src: "https://commons.wikimedia.org/wiki/File:Jeddah_Mall_of_Arabia.jpg" },
  "p-shubaili": { by: "", lic: "", user: true, illus: true },
  "p-rashid": { by: "", lic: "", user: true, render: true },
  "p-ahsa": { by: "", lic: "", user: true },
  "p-halfmoon": { by: "", lic: "", user: true },
  "p-solitaire": { by: "", lic: "", user: true },
  "p-hanifah": { by: "", lic: "", user: true },
  "p-wadisafar": { by: "", lic: "", user: true, illus: true },
  "p-causeway": { by: "Greens n cornbread", lic: "CC BY 2.0", src: "https://commons.wikimedia.org/wiki/File:King_Fahd_Causeway_bridge_num4.jpg" },
  "f-kabsa": { by: "Unsplash", lic: "Unsplash", free: true },
  "f-mandi": { by: "Unsplash", lic: "Unsplash", free: true },
  "p-souq": { by: "Francisco Anzola", lic: "CC BY 2.0", src: "https://commons.wikimedia.org/wiki/File:Incense_souk_in_downtown_Riyadh_(12754047044).jpg" },
  "p-museum": { by: "Sammy Six", lic: "CC BY 2.0", src: "https://commons.wikimedia.org/wiki/File:National_Museum_Riyadh_(6329553512).jpg" },
  "f-jareesh": { by: "Unsplash", lic: "Unsplash", free: true },
  "f-saleeg": { by: "Unsplash", lic: "Unsplash", free: true },
  "f-mutabbaq": { by: "Unsplash", lic: "Unsplash", free: true },
  "p-edge": { by: "S0lL0 TRAVELER", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:Edge_of_the_World.jpg" },
  "p-ithra": { by: "", lic: "", user: true },
  "p-rahma": { by: "Tahir mq", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:Al-Rahmah_Mosque_1.jpg" },
  "p-babmakkah": { by: "Tahir mq", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:Bab_Makkah_1.jpg" },
  "p-historic": { by: "Tahir mq", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:Historic_Jeddah_8.jpg" },
  "p-murabba": { by: "saudipics", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:Murabba_Palace.jpg" },
  "p-bcity": { by: "Slayym", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:The_Boulevard_Riyadh_-_2021.jpg" },
  "p-ibrahim": { by: "Lawrence of Arabia", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:Ibrahim%27s_palace_in_the_city_of_Hofuf_in_Al-Ahsa.jpg" },
  "p-dammam": { by: "Radosław Botev", lic: "CC BY 3.0 PL", src: "https://commons.wikimedia.org/wiki/File:Dammam_Corniche_(1).jpg" },
  "p-qarah": { by: "", lic: "", user: true },
  "p-bworld": { by: "Saudi Press Agency (SPA)", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:Boulevard_World_in_Riyadh_(2023).jpg" },
  "p-via": { by: "Saudi Press Agency (SPA)", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:Via_Riyadh_(2024).jpg" },
  "p-qiddiya": { by: "Saudi Press Agency (SPA)", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:Six_Flags_Qiddiya_Theme_Park,_Saudi_Arabia_(2025).jpg" },
  "p-waterfront": { by: "Unknown author", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:Jeddah_Waterfront,_Western_Saudi_Arabia_(2026).jpg" },
  "p-kcentre": { by: "Hamza A. Durrani", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:Kingdom_Centre_Riyadh_2024.jpeg" },
  "f-masoub": { by: "", lic: "", user: true },
  "f-ful": { by: "", lic: "", user: true },
  "f-sayadiya": { by: "Unsplash", lic: "Unsplash", free: true },
  "f-balaleet": { by: "", lic: "", user: true },
  "f-harees": { by: "Unsplash", lic: "Unsplash", free: true },
  "f-coffee": { by: "Unsplash", lic: "Unsplash", free: true },
  "f-qursan": { by: "", lic: "", user: true },
  "f-luqaimat": { by: "", lic: "", user: true },
  "f-redbread": { by: "", lic: "", user: true },
  "f-miflaq": { by: "", lic: "", user: true },
  "f-muhammar": { by: "", lic: "", user: true },
  "f-sobia": { by: "", lic: "", user: true },
  "f-maqshush": { by: "", lic: "", user: true },
  "f-marqooq": { by: "", lic: "", user: true },
  "f-mantu": { by: "Unsplash", lic: "Unsplash", free: true },
  "imsiu-1": { by: "", lic: "", user: true, build: true },
  "imsiu-2": { by: "", lic: "", user: true, render: true },
  "imsiu-3": { by: "", lic: "", user: true, render: true },
  "imsiu-4": { by: "", lic: "", user: true, render: true },
  "aramco-1": { by: "", lic: "", user: true, build: true },
  "aramco-2": { by: "", lic: "", user: true },
  "aramco-3": { by: "", lic: "", user: true },
  "shabab-1": { by: "", lic: "", user: true },
  "shabab-2": { by: "", lic: "", user: true },
  "shabab-3": { by: "", lic: "", user: true },
  "kfsc-r1": { by: "", lic: "", user: true, render: true },
  "kfsc-r2": { by: "", lic: "", user: true },
  "kfsc-r3": { by: "", lic: "", user: true, render: true },
  "ksu-1": { by: "Alina.chiorean", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:Entire_King_Saud_University_Stadium.jpg" },
  "ksu-2": { by: "Alina.chiorean", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:Inside_King_Saud_University_Stadium.jpg" },
  "ksu-3": { by: "Alina.chiorean", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:Players_tunnel_-_King_Saud_University_Stadium.jpg" },
  "paaf-1": { by: "FIFA", lic: "CC BY-SA 2.5", src: "https://commons.wikimedia.org/wiki/File:Prince_Abdullah_Al-Faisal_Sports_City.jpg" },
  "riyadh": { by: "B.alotaby", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:Riyadh_Skyline.jpg" },
  "diriyah": { by: "Radosław Botev", lic: "CC BY 3.0 PL", src: "https://commons.wikimedia.org/wiki/File:At-Turaif_District_in_ad-Dir%27iyah_(5).jpg" },
  "masmak": { by: "Sammy Six", lic: "CC BY 2.0", src: "https://commons.wikimedia.org/wiki/File:Masmak_Fortress_(6329473680).jpg" },
  "balad": { by: "Tahir mq", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:Bait_Al_Balad,_Jeddah_3.jpg" },
  "jeddah": { by: "Joseph Azrak", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:Jeddah_Corniche_at_night.jpg" },
  "fountain": { by: "Tahir mq", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:King_Fahd%27s_Fountain_2.jpg" },
  "tower": { by: "Hezmok Media", lic: "CC BY-SA 4.0", src: "https://commons.wikimedia.org/wiki/File:Al_Khobar_Water_Tower.jpg" },
  "khobar": { by: "Francisco Anzola", lic: "CC BY 2.0", src: "https://commons.wikimedia.org/wiki/File:Al_Khobar_Corniche_(12482233074).jpg" },
  "fans": { by: "alobayd", lic: "CC BY 2.0", src: "https://commons.wikimedia.org/wiki/File:Al-Nasr_crowd.jpg" },
};
window.FV_GALLERY = {
  stadium: { "king-fahd": ["kfsc-r1", "kfsc-r2", "kfsc-r3"], "king-saud-university": ["ksu-1", "ksu-2", "ksu-3"], "kingdom-arena": ["arena-2", "arena-1", "arena-3"], "king-abdullah": ["alinma-1", "alinma-3", "alinma-2"], "prince-abdullah-al-faisal": ["paaf-u1", "paaf-1", "paaf-u2"], "al-shabab": ["shabab-1", "shabab-2", "shabab-3"], "aramco": ["aramco-2", "aramco-3", "aramco-1"], "imam-mohammed": ["imsiu-2", "imsiu-4", "imsiu-3", "imsiu-1"] },
  city: { riyadh: ["riyadh", "diriyah", "masmak"], jeddah: ["fountain", "balad", "jeddah"], khobar: ["tower", "khobar"] },
  hero: ["kfsc-r1","alinma-1","arena-1","paaf-1","aramco-1","ksu-1"],
};

/* City guide: places by category. cat: fun | heritage | nature | culture */
(() => {
  const L = (en, ar, ko, ja) => ({ en, ar, ko, ja });
  const D = window.FV_DATA;
  window.FV_PLACES = {
    riyadh: [
      { id: "bcity", cat: "fun", img: "p-bcity", n: L("Boulevard City", "بوليفارد سيتي", "불러바드 시티", "ブールバード・シティ"),
        d: L("Riyadh's biggest entertainment district: restaurants, cafés, shows and concerts. Busiest during Riyadh Season.", "أكبر منطقة ترفيهية في الرياض: مطاعم ومقاهٍ وعروض وحفلات، وتزدحم في موسم الرياض.", "리야드 최대의 엔터테인먼트 지구로 레스토랑, 카페, 공연, 콘서트가 모여 있습니다. 리야드 시즌에 가장 붐빕니다.", "リヤド最大のエンターテインメント地区。レストラン、カフェ、ショー、コンサートが集まり、リヤド・シーズン中は特ににぎわいます。") },
      { id: "bworld", cat: "fun", img: "p-bworld", n: L("Boulevard World", "بوليفارد وورلد", "불러바드 월드", "ブールバード・ワールド"),
        d: L("Themed zones that recreate countries and cultures from around the world, with rides, food and a lake. Usually open during Riyadh Season.", "مناطق تحاكي دولاً وثقافات من أنحاء العالم، مع ألعاب وأطعمة وبحيرة. يفتح عادةً خلال موسم الرياض.", "세계 여러 나라와 문화를 재현한 테마 구역에 놀이기구, 음식, 호수가 있습니다. 보통 리야드 시즌에 문을 엽니다.", "世界各国の文化を再現したテーマエリアに、アトラクション、グルメ、湖があります。通常はリヤド・シーズン中に営業します。") },
      { id: "qiddiya", cat: "fun", img: "p-qiddiya", n: L("Qiddiya & Six Flags Qiddiya", "القدية وسيكس فلاقز القدية", "키디야 & 식스 플래그스 키디야", "キディーヤ＆シックス・フラッグス・キディーヤ"),
        d: L("Entertainment, sport and culture giga-project southwest of Riyadh. Its flagship is the Six Flags Qiddiya theme park. Check which attractions are open before you go.", "مشروع عملاق للترفيه والرياضة والثقافة جنوب غرب الرياض، وأبرز معالمه مدينة سيكس فلاقز القدية. تأكد من المرافق المفتوحة قبل الذهاب.", "리야드 남서쪽의 엔터테인먼트·스포츠·문화 기가 프로젝트로, 대표 시설은 식스 플래그스 키디야 테마파크입니다. 방문 전 운영 중인 시설을 확인하세요.", "リヤド南西部のエンターテインメント・スポーツ・文化のギガプロジェクト。目玉はシックス・フラッグス・キディーヤです。訪問前に営業中の施設を確認しましょう。") },
      { id: "via", cat: "culture", img: "p-via", n: L("Via Riyadh", "فيا رياض", "비아 리야드", "ビア・リヤド"),
        d: L("Upscale open-air district with restaurants, cinemas and boutiques in a Najdi-inspired setting.", "وجهة راقية مفتوحة فيها مطاعم وسينما ومتاجر بتصميم مستوحى من العمارة النجدية.", "나즈드 건축에서 영감을 받은 고급 야외 복합 공간으로 레스토랑, 영화관, 부티크가 있습니다.", "ナジュド建築に着想を得た高級屋外エリア。レストラン、映画館、ブティックがあります。") },
      { id: "kcentre", cat: "culture", img: "p-kcentre", n: L("Kingdom Centre & Sky Bridge", "برج المملكة والجسر المعلّق", "킹덤 센터 & 스카이 브리지", "キングダム・センター＆スカイブリッジ"),
        d: L("Riyadh's iconic tower, with a mall below and a sky bridge on top for panoramic views.", "برج الرياض الأيقوني، وفيه مركز تسوق وجسر معلّق لإطلالة بانورامية على المدينة.", "리야드의 상징적인 타워로, 아래에는 쇼핑몰, 꼭대기에는 파노라마 전망의 스카이 브리지가 있습니다.", "リヤドを象徴するタワー。下層にモール、最上部には街を一望できるスカイブリッジがあります。") },
      { id: "diriyah", cat: "heritage", img: "diriyah", n: D.CITIES.riyadh.sights[0].n, d: D.CITIES.riyadh.sights[0].d },
      { id: "masmak", cat: "heritage", img: "masmak", n: D.CITIES.riyadh.sights[1].n, d: D.CITIES.riyadh.sights[1].d },
      { id: "museum", cat: "heritage", img: "p-museum", n: D.CITIES.riyadh.sights[2].n, d: D.CITIES.riyadh.sights[2].d },
      { id: "murabba", cat: "heritage", img: "p-murabba", n: L("Al Murabba Palace", "قصر المربع", "알무라바 궁전", "ムラッバ宮殿"),
        d: L("King Abdulaziz's former palace, a fine example of Najdi mud-brick architecture next to the National Museum.", "قصر الملك عبدالعزيز سابقاً، ونموذج رائع للعمارة الطينية النجدية بجوار المتحف الوطني.", "압둘아지즈 국왕의 옛 궁전으로, 국립박물관 옆에 있는 나즈드 흙벽돌 건축의 훌륭한 예입니다.", "アブドゥルアズィーズ国王の旧宮殿。国立博物館の隣にある、ナジュドの日干しれんが建築の好例です。") },
      { id: "souq", cat: "heritage", img: "p-souq", n: L("Downtown souqs (Al-Zal)", "أسواق الديرة (سوق الزل)", "구시가지 시장 (알잘)", "旧市街のスーク（アッ・ザル）"),
        d: L("Old-market lanes near Masmak selling incense, perfumes, carpets and traditional goods.", "أسواق قديمة قرب المصمك تبيع البخور والعطور والسجاد والمنتجات التقليدية.", "마스막 근처의 옛 시장 골목에서 향, 향수, 카펫, 전통 물품을 팝니다.", "マスマク近くの昔ながらの市場。お香、香水、じゅうたん、伝統工芸品が並びます。") },
      { id: "edge", cat: "nature", img: "p-edge", n: L("Edge of the World", "حافة العالم", "세상의 끝 (엣지 오브 더 월드)", "エッジ・オブ・ザ・ワールド"),
        d: L("Dramatic cliffs of the Tuwaiq escarpment, about two hours from the city. Go with a guide and a 4x4.", "منحدرات طويق المذهلة على بعد نحو ساعتين من المدينة. اذهب مع مرشد وسيارة دفع رباعي.", "도시에서 약 두 시간 거리에 있는 투와이크 절벽의 장관입니다. 가이드와 사륜구동 차량으로 가세요.", "市内から約2時間、トゥワイク崖の壮大な断崖。ガイドと四輪駆動車で行きましょう。") },
      { id: "hanifah", cat: "nature", img: "p-hanifah", n: L("Wadi Hanifah", "وادي حنيفة", "와디 하니파", "ワディ・ハニーファ"),
        d: L("Green valley along the city's west side with walking paths, lakes and picnic spots.", "وادٍ أخضر غرب المدينة فيه مسارات للمشي وبحيرات وأماكن للتنزه.", "도시 서쪽을 따라 이어진 초록 계곡으로 산책로, 호수, 피크닉 장소가 있습니다.", "市の西側に広がる緑の谷。遊歩道、湖、ピクニックスポットがあります。") },
      { id: "kafd", cat: "culture", img: "p-kafd", n: L("King Abdullah Financial District (KAFD)", "مركز الملك عبدالله المالي (كافد)", "킹 압둘라 금융지구(KAFD)", "キング・アブドゥッラー金融地区（KAFD）"),
        d: L("Riyadh's cluster of glass towers in the north of the city, with landscaped walkways, cafés and restaurants that light up at night.", "مجموعة الأبراج الزجاجية شمال الرياض، فيها ممرات مشاة مشجّرة ومقاهٍ ومطاعم تتألق ليلاً.", "리야드 북쪽의 유리 타워 단지로, 조경된 산책로와 카페, 레스토랑이 밤이면 화려하게 빛납니다.", "リヤド北部のガラスの高層ビル群。緑の遊歩道やカフェ、レストランが並び、夜はライトアップされます。") },
      { id: "faisaliah", cat: "culture", img: "p-faisaliah", n: L("Al Faisaliah Tower", "برج الفيصلية", "알 파이살리아 타워", "アル・ファイサリア・タワー"),
        d: L("One of Riyadh's first skyscrapers, known for the golden glass globe near its tip. It has a hotel, a shopping centre and a viewing deck.", "من أوائل ناطحات السحاب في الرياض، ويشتهر بالكرة الزجاجية الذهبية قرب قمته. يضم فندقاً ومركز تسوق وجلسة مطلّة.", "리야드 최초의 마천루 중 하나로, 꼭대기 근처의 황금빛 유리 구체로 유명합니다. 호텔, 쇼핑센터, 전망 공간이 있습니다.", "リヤド初期の超高層ビルの一つで、頂上近くの金色のガラス球で有名。ホテル、ショッピングセンター、展望スペースがあります。") },
      { id: "solitaire", cat: "shop", img: "p-solitaire", n: L("Solitaire", "سوليتير", "솔리테어", "ソリテア"),
        d: L("A luxury lifestyle mall opened in 2025 in Al Sahafah, with open-air shopping streets, global designer brands, restaurants and a roof garden facing KAFD.", "مجمّع تسوق فاخر افتُتح عام 2025 في حي الصحافة، فيه شوارع تسوق مفتوحة وعلامات عالمية ومطاعم وحديقة على السطح تطل على كافد.", "2025년 알 사하파에 문을 연 럭셔리 라이프스타일 몰로, 야외 쇼핑 거리, 글로벌 명품 브랜드, 레스토랑, KAFD가 보이는 루프 가든이 있습니다.", "2025年にアル・サハファに開業した高級ライフスタイルモール。屋外ショッピング通り、世界的ブランド、レストラン、KAFDを望む屋上庭園があります。") },
      { id: "wadisafar", cat: "nature", img: "p-wadisafar", n: L("Wadi Safar", "وادي صفار", "와디 사파르", "ワディ・サファル"),
        d: L("A new luxury destination of desert valleys and escarpments just west of Diriyah, about 30 minutes from Riyadh. Its first resort is due to open in early 2027, with golf and more hotels to follow.", "وجهة فاخرة جديدة من الأودية والحافات الصحراوية غرب الدرعية، على بعد 30 دقيقة تقريباً من الرياض. أول منتجع فيها مقرر افتتاحه مطلع 2027، وتتبعه ملاعب غولف وفنادق أخرى.", "디리야 서쪽, 리야드에서 약 30분 거리의 사막 계곡과 절벽에 조성 중인 새 럭셔리 목적지입니다. 첫 리조트는 2027년 초 개장 예정이며 골프장과 호텔이 이어집니다.", "ディルイーヤの西、リヤドから約30分の砂漠の渓谷と断崖に生まれる新しい高級リゾート地。最初のリゾートは2027年初めに開業予定で、ゴルフ場やホテルが続きます。") },
    ],
    jeddah: [
      { id: "balad", cat: "heritage", img: "balad", n: D.CITIES.jeddah.sights[0].n, d: D.CITIES.jeddah.sights[0].d },
      { id: "babmakkah", cat: "heritage", img: "p-babmakkah", n: L("Bab Makkah", "باب مكة", "밥 마카 (메카의 문)", "バーブ・マッカ"),
        d: L("Historic gate of old Jeddah that once led pilgrims toward Makkah, surrounded by busy souqs.", "بوابة جدة القديمة التي كانت تقود الحجاج نحو مكة، وحولها أسواق نابضة.", "옛날 순례자들을 메카로 이끌던 구 제다의 역사적인 성문으로, 주변에 활기찬 시장이 있습니다.", "かつて巡礼者をマッカへ導いた旧ジッダの歴史的な門。周りににぎやかな市場があります。") },
      { id: "lanes", cat: "heritage", img: "p-historic", n: L("Al-Balad lanes", "أزقة البلد", "알발라드 골목", "アル・バラドの路地"),
        d: L("Narrow lanes lined with rawasheen, the carved wooden latticed windows. Best explored on foot in the evening.", "أزقة ضيقة تزينها الرواشين الخشبية، وأجمل ما تكون مشياً في المساء.", "나무 격자창(라와신)이 늘어선 좁은 골목으로, 저녁에 걸어서 둘러보기 좋습니다.", "木製の格子窓（ラワシーン）が並ぶ細い路地。夕方に歩いて巡るのがおすすめです。") },
      { id: "corniche", cat: "nature", img: "jeddah", n: D.CITIES.jeddah.sights[1].n, d: D.CITIES.jeddah.sights[1].d },
      { id: "fountain", cat: "nature", img: "fountain", n: D.CITIES.jeddah.sights[2].n, d: D.CITIES.jeddah.sights[2].d },
      { id: "waterfront", cat: "fun", img: "p-waterfront", n: L("Jeddah Waterfront", "الواجهة البحرية بجدة", "제다 워터프런트", "ジッダ・ウォーターフロント"),
        d: L("Modern seafront with beaches, play areas, cycling paths and cafés.", "واجهة بحرية حديثة فيها شواطئ وألعاب ومسارات دراجات ومقاهٍ.", "해변, 놀이 공간, 자전거 길, 카페가 있는 현대적인 해안 공간입니다.", "ビーチ、遊び場、サイクリングロード、カフェがそろう近代的な海辺エリアです。") },
      { id: "rahma", cat: "culture", img: "p-rahma", n: L("Al-Rahmah Mosque", "مسجد الرحمة", "알라흐마 모스크", "アッ・ラフマ・モスク"),
        d: L("The \"floating mosque\", built over the sea. Best admired from the seafront at sunset.", "«المسجد العائم» المبني فوق البحر، وأجمل ما يُشاهد من الواجهة البحرية وقت الغروب.", "바다 위에 지어진 '떠 있는 모스크'로, 해 질 녘 해안에서 바라보는 모습이 가장 아름답습니다.", "海の上に建つ「浮かぶモスク」。夕暮れどきに海沿いから眺めるのが一番です。") },
      { id: "redsea", cat: "shop", img: "p-redsea", n: L("Red Sea Mall", "رد سي مول", "레드씨 몰", "レッドシー・モール"),
        d: L("One of Jeddah's largest malls, near the north corniche, with hundreds of shops, a cinema, restaurants and family entertainment.", "من أكبر مجمعات جدة قرب الكورنيش الشمالي، فيه مئات المحلات وسينما ومطاعم وترفيه للعائلة.", "북쪽 코르니시 근처에 있는 제다 최대 쇼핑몰 중 하나로, 수백 개의 매장, 영화관, 레스토랑, 가족 놀이 시설이 있습니다.", "北コーニッシュ近くにあるジッダ最大級のモール。数百の店舗、映画館、レストラン、ファミリー向け娯楽施設があります。") },
      { id: "moa", cat: "shop", img: "p-moa", n: L("Mall of Arabia", "مول العرب", "몰 오브 아라비아", "モール・オブ・アラビア"),
        d: L("A big family mall in north Jeddah with international brands, a food court and indoor entertainment for kids.", "مجمع عائلي كبير شمال جدة، فيه علامات عالمية وساحة مطاعم وألعاب داخلية للأطفال.", "제다 북부의 대형 가족 쇼핑몰로, 글로벌 브랜드, 푸드코트, 어린이 실내 놀이 시설이 있습니다.", "ジッダ北部の大型ファミリーモール。国際ブランド、フードコート、子ども向け屋内遊び場があります。") },
      { id: "yacht", cat: "fun", img: "p-yacht", n: L("Jeddah Yacht Club", "نادي جدة لليخوت", "제다 요트 클럽", "ジッダ・ヨットクラブ"),
        d: L("A marina on the corniche lined with restaurants, cafés and evening events right on the water.", "مرسى على الكورنيش تحيط به مطاعم ومقاهٍ وفعاليات مسائية على البحر مباشرة.", "코르니시의 마리나로, 바다 바로 앞에 레스토랑과 카페, 저녁 이벤트가 이어집니다.", "コーニッシュのマリーナ。海沿いにレストランやカフェが並び、夜はイベントも開かれます。") },
      { id: "fakieh", cat: "fun", img: "p-fakieh", n: L("Fakieh Aquarium", "فقيه أكواريوم", "파키에 아쿠아리움", "ファキー水族館"),
        d: L("A Red Sea aquarium on the corniche with sharks, rays and a dolphin show. Great for families.", "حوض أحياء مائية على الكورنيش فيه أسماك قرش وراي وعرض للدلافين، مناسب للعائلات.", "코르니시에 있는 홍해 수족관으로 상어, 가오리, 돌고래 쇼를 볼 수 있어 가족 단위에 좋습니다.", "コーニッシュにある紅海の水族館。サメやエイ、イルカショーが楽しめ、家族連れにおすすめです。") },
    ],
    khobar: [
      { id: "tower", cat: "culture", img: "tower", n: L("Khobar Water Tower", "برج المياه بالخبر", "알코바르 급수탑", "アル・ホバル給水塔"),
        d: L("Landmark tower on the corniche with views over the Gulf.", "معلم بارز على الكورنيش بإطلالة على الخليج العربي.", "코니시의 랜드마크 타워로 걸프 바다가 내려다보입니다.", "コーニッシュのランドマークタワー。アラビア湾を一望できます。") },
      { id: "corniche", cat: "nature", img: "khobar", n: D.CITIES.khobar.sights[0].n, d: D.CITIES.khobar.sights[0].d },
      { id: "ithra", cat: "culture", img: "p-ithra", n: D.CITIES.khobar.sights[1].n, d: D.CITIES.khobar.sights[1].d },
      { id: "causeway", cat: "fun", img: "p-causeway", n: L("King Fahd Causeway", "جسر الملك فهد", "킹 파흐드 코즈웨이", "キング・ファハド・コーズウェイ"),
        d: L("A 25 km bridge linking Saudi Arabia and Bahrain, with a viewing tower midway.", "جسر بطول 25 كم يربط السعودية بالبحرين، وفي منتصفه برج للمشاهدة.", "사우디아라비아와 바레인을 잇는 25km 다리로, 중간에 전망 타워가 있습니다.", "サウジアラビアとバーレーンを結ぶ全長25kmの橋。中ほどに展望タワーがあります。") },
      { id: "dammam", cat: "nature", img: "p-dammam", n: L("Dammam Corniche", "كورنيش الدمام", "담맘 코니시", "ダンマーム・コーニッシュ"),
        d: L("Long waterfront next door in Dammam, popular for evening walks and seafood.", "واجهة بحرية طويلة في الدمام المجاورة، مقصد للمشي مساءً وتناول المأكولات البحرية.", "바로 옆 담맘의 긴 해안 산책로로, 저녁 산책과 해산물로 인기가 많습니다.", "隣接するダンマームの長い海岸通り。夕方の散歩とシーフードで人気です。") },
      { id: "ahsa", cat: "heritage", img: "p-ahsa", n: L("Al-Ahsa Oasis (UNESCO)", "واحة الأحساء (يونسكو)", "알아흐사 오아시스 (유네스코)", "アル・アハサー・オアシス（ユネスコ）"),
        d: L("One of the world's largest palm oases and a UNESCO World Heritage site, roughly 1.5–2 hours away by car.", "من أكبر واحات النخيل في العالم وموقع تراث عالمي لليونسكو، على بعد ساعة ونصف إلى ساعتين تقريباً بالسيارة.", "세계 최대 규모의 야자 오아시스 중 하나이자 유네스코 세계유산으로, 차로 약 1시간 반~2시간 거리입니다.", "世界最大級のヤシのオアシスで、ユネスコ世界遺産。車で約1時間半〜2時間です。") },
      { id: "qarah", cat: "nature", img: "p-qarah", n: L("Jabal Al-Qarah", "جبل القارة", "자발 알카라", "ジャバル・アル・カーラ"),
        d: L("Cool limestone caves and rock formations in Al-Ahsa.", "كهوف وتكوينات صخرية جيرية باردة في الأحساء.", "알아흐사에 있는 시원한 석회암 동굴과 바위 지형입니다.", "アル・アハサーにある、ひんやりとした石灰岩の洞窟と奇岩です。") },
      { id: "ibrahim", cat: "heritage", img: "p-ibrahim", n: L("Ibrahim Palace, Hofuf", "قصر إبراهيم بالهفوف", "호푸프 이브라힘 궁전", "フフーフのイブラーヒーム宮殿"),
        d: L("Ottoman-era fort with a mosque and courtyards in the heart of Hofuf.", "قلعة من العهد العثماني فيها مسجد وساحات في قلب الهفوف.", "호푸프 중심에 있는 오스만 시대의 요새로, 모스크와 안뜰이 있습니다.", "フフーフ中心部にあるオスマン時代の砦。モスクと中庭があります。") },
      { id: "shubaili", cat: "shop", img: "p-shubaili", n: L("Al Shubaili Grand Mall", "الشبيلي جراند مول", "알 슈바일리 그랜드 몰", "アル・シュバイリ・グランドモール"),
        d: L("Khobar's newest mall, in a gradual soft opening since 29 October 2026, with cinemas, a karting track, arcades and The Valley dining area. A grand opening is planned for 2027.", "أحدث مجمّع في الخبر، بدأ افتتاحه التجريبي تدريجياً في 29 أكتوبر 2026، ويضم صالات سينما وحلبة كارتينغ وألعاب أركيد ومنطقة «ذا ڤالي» للمطاعم. الافتتاح الرسمي مخطط له في 2027.", "2026년 10월 29일부터 단계적으로 시범 개장 중인 코바르의 최신 쇼핑몰로, 영화관, 카트 트랙, 아케이드, 레스토랑 구역 ‘더 밸리’가 있습니다. 공식 개장은 2027년 예정입니다.", "2026年10月29日から段階的にプレオープン中のホバル最新のモール。映画館、カートコース、アーケード、飲食エリア「ザ・バレー」があり、グランドオープンは2027年予定です。") },
      { id: "rashid", cat: "shop", img: "p-rashid", n: L("Al Rashid Mall", "الراشد مول", "알 라시드 몰", "アル・ラシード・モール"),
        d: L("A long-time favourite mall in Khobar with fashion brands, restaurants and a multi-screen cinema.", "من أشهر مجمعات الخبر، فيه علامات أزياء ومطاعم وسينما متعددة الصالات.", "코바르에서 오랫동안 사랑받아 온 쇼핑몰로 패션 브랜드, 레스토랑, 멀티플렉스 영화관이 있습니다.", "ホバルで長く愛されるモール。ファッションブランド、レストラン、シネコンがあります。") },
      { id: "ajdan", cat: "fun", img: "p-ajdan", n: L("Ajdan Walk", "ممشى أجدان", "아즈단 워크", "アジュダン・ウォーク"),
        d: L("A seafront promenade on the Khobar corniche with cafés, restaurants and an evening crowd.", "ممشى بحري على كورنيش الخبر فيه مقاهٍ ومطاعم وأجواء مسائية حيوية.", "코바르 코르니시의 해변 산책로로, 카페와 레스토랑이 있고 저녁이면 활기찹니다.", "ホバルのコーニッシュにある海辺の遊歩道。カフェやレストランが並び、夜はにぎわいます。") },
      { id: "halfmoon", cat: "nature", img: "p-halfmoon", n: L("Half Moon Bay", "شاطئ نصف القمر", "하프문 베이", "ハーフムーン・ベイ"),
        d: L("A calm, curved bay south of Khobar with beaches, chalets and water sports.", "خليج هادئ على شكل هلال جنوب الخبر، فيه شواطئ وشاليهات ورياضات بحرية.", "코바르 남쪽의 잔잔한 반달 모양 만으로, 해변과 샬레, 수상 스포츠를 즐길 수 있습니다.", "ホバル南の穏やかな三日月形の湾。ビーチやシャレー、マリンスポーツが楽しめます。") },
    ],
  };

  // Dish photos, ingredients and new dishes.
  const add = (id, o) => { const d = D.DISHES.find(x => x.id === id); if (d) Object.assign(d, o); else D.DISHES.push(Object.assign({ id }, o)); };
  add("kabsa", { img: "f-kabsa", ing: L("Rice, chicken or lamb, tomato, onion, kabsa spices (cardamom, cinnamon, black lime, bay leaf), nuts and raisins", "أرز، دجاج أو لحم، طماطم، بصل، بهارات الكبسة (هيل، قرفة، لومي، ورق غار)، مكسرات وزبيب", "쌀, 닭고기 또는 양고기, 토마토, 양파, 캅사 향신료(카다멈, 계피, 블랙 라임, 월계수 잎), 견과류와 건포도", "米、鶏肉または羊肉、トマト、玉ねぎ、カブサ用スパイス（カルダモン、シナモン、ブラックライム、ローリエ）、ナッツとレーズン") });
  add("jareesh", { img: "f-jareesh", similar: true, ing: L("Cracked wheat, broth, yogurt or milk, onion, ghee", "قمح مجروش، مرق، لبن أو حليب، بصل، سمن", "빻은 밀, 육수, 요거트 또는 우유, 양파, 기", "挽き割り小麦、スープ、ヨーグルトまたは牛乳、玉ねぎ、ギー") });
  add("qursan", { img: "f-qursan", ing: L("Thin wheat bread, zucchini, eggplant, carrot, meat or chicken, tomato broth", "خبز رقيق، كوسا، باذنجان، جزر، لحم أو دجاج، مرق طماطم", "얇은 밀빵, 애호박, 가지, 당근, 고기 또는 닭고기, 토마토 육수", "薄い小麦パン、ズッキーニ、なす、にんじん、肉または鶏肉、トマトスープ") });
  add("saleeg", { img: "f-saleeg", similar: true, ing: L("Short-grain rice, chicken broth, milk, ghee or butter, cardamom, chicken", "أرز مصري، مرق دجاج، حليب، سمن أو زبدة، هيل، دجاج", "단립종 쌀, 닭 육수, 우유, 기 또는 버터, 카다멈, 닭고기", "短粒米、鶏ガラスープ、牛乳、ギーまたはバター、カルダモン、鶏肉") });
  add("mandi", { img: "f-mandi", ing: L("Rice, lamb or chicken, mandi spices, smoke from the underground pit oven", "أرز، لحم أو دجاج، بهارات المندي، دخان الحفرة", "쌀, 양고기 또는 닭고기, 만디 향신료, 땅속 화덕의 훈연", "米、羊肉または鶏肉、マンディ用スパイス、地中かまどの燻煙") });
  add("mutabbaq", { img: "f-mutabbaq", similar: true, ing: L("Thin dough, egg, minced meat, green onion or leek (sweet version: banana, cheese, honey)", "عجينة رقيقة، بيض، لحم مفروم، كراث أو بصل أخضر (الحلو: موز، جبن، عسل)", "얇은 반죽, 달걀, 다진 고기, 파 또는 리크 (달콤한 버전: 바나나, 치즈, 꿀)", "薄い生地、卵、ひき肉、ネギまたはリーキ（甘い版：バナナ、チーズ、はちみつ）") });
  add("masoub", { ar: "معصوب", icon: "bread", img: "f-masoub", name: L("Masoub", "المعصوب", "마아스브", "マアスーブ"),
    d: L("Jeddah's favourite breakfast: bread mashed with ripe banana, then topped with honey, cream and ghee.", "فطور جدة المفضل: خبز يُهرس مع الموز الناضج، ويُزيّن بالعسل والقشطة والسمن.", "제다 사람들이 가장 사랑하는 아침 식사로, 빵을 잘 익은 바나나와 으깬 뒤 꿀, 크림, 기를 얹습니다.", "ジッダで一番人気の朝ごはん。パンを完熟バナナとつぶし、はちみつ、クリーム、ギーをかけます。"),
    ing: L("Flatbread, ripe banana, honey, ghee (samn), cream (qishta), cheese (optional)", "خبز بر أو رقاق، موز ناضج، عسل، سمن، قشطة، جبن (اختياري)", "납작빵, 잘 익은 바나나, 꿀, 기(삼느), 크림(기슈타), 치즈(선택)", "平たいパン、完熟バナナ、はちみつ、ギー（サムン）、クリーム（ギシュタ）、チーズ（お好みで）") });
  add("ful", { ar: "فول", icon: "bowl", img: "f-ful", name: L("Hijazi ful", "الفول الحجازي", "히자즈식 풀", "ヒジャーズ風フール"),
    d: L("Slow-cooked fava beans with cumin and olive oil or ghee, eaten with tamees bread. A classic Jeddah breakfast.", "فول مطبوخ ببطء مع الكمون وزيت الزيتون أو السمن، ويؤكل مع خبز التميس. فطور جداوي أصيل.", "커민과 올리브유 또는 기를 넣고 오래 끓인 잠두콩을 타미스 빵과 함께 먹는, 제다의 대표 아침 식사입니다.", "クミンとオリーブオイルまたはギーで煮込んだそら豆を、タミースパンと食べるジッダの定番朝食です。"),
    ing: L("Fava beans, cumin, olive oil or ghee, garlic, lemon, tamees bread", "فول، كمون، زيت زيتون أو سمن، ثوم، ليمون، خبز تميس", "잠두콩, 커민, 올리브유 또는 기, 마늘, 레몬, 타미스 빵", "そら豆、クミン、オリーブオイルまたはギー、にんにく、レモン、タミースパン") });
  add("sayadiya", { ar: "صيادية", icon: "rice", img: "f-sayadiya", name: L("Sayadiya", "الصيادية", "사야디야", "サヤーディーヤ"),
    d: L("Fish served on spiced rice cooked with caramelised onions. Loved on both the Red Sea and Gulf coasts.", "سمك يُقدّم على أرز متبّل مطبوخ مع البصل المكرمل، محبوب على سواحل البحر الأحمر والخليج.", "캐러멜라이즈한 양파와 향신료로 지은 밥 위에 생선을 올린 요리로, 홍해와 걸프 해안 모두에서 사랑받습니다.", "飴色玉ねぎとスパイスで炊いたご飯に魚をのせた料理。紅海沿岸でも湾岸でも愛されています。"),
    ing: L("White fish, rice, onions, cumin and spices, tomato", "سمك أبيض، أرز، بصل، كمون وبهارات، طماطم", "흰살생선, 쌀, 양파, 커민과 향신료, 토마토", "白身魚、米、玉ねぎ、クミンとスパイス、トマト") });
  add("balaleet", { ar: "بلاليط", icon: "bowl", img: "f-balaleet", name: L("Balaleet", "البلاليط", "발랄리트", "バラリート"),
    d: L("Sweet vermicelli with saffron and cardamom, topped with a thin omelette. A Gulf-style breakfast.", "شعيرية حلوة بالزعفران والهيل تعلوها بيضة مقلية رقيقة. فطور خليجي.", "사프란과 카다멈을 넣은 달콤한 버미첼리 위에 얇은 오믈렛을 올린 걸프식 아침 식사입니다.", "サフランとカルダモンの甘いバーミセリに薄焼き卵をのせた湾岸風の朝ごはんです。"),
    ing: L("Vermicelli, sugar, saffron, cardamom, rosewater, eggs", "شعيرية، سكر، زعفران، هيل، ماء ورد، بيض", "버미첼리, 설탕, 사프란, 카다멈, 장미수, 달걀", "バーミセリ、砂糖、サフラン、カルダモン、ローズウォーター、卵") });
  add("harees", { similar: true, ar: "هريس", icon: "bowl", img: "f-harees", name: L("Harees", "الهريس", "하리스", "ハリース"),
    d: L("Wheat and meat slow-cooked into a smooth porridge. Much loved in the Eastern Province, especially in Ramadan.", "قمح ولحم يُطهيان ببطء حتى يصبحا ناعمين. طبق محبوب في المنطقة الشرقية خاصة في رمضان.", "밀과 고기를 오래 끓여 부드러운 죽으로 만든 요리로, 동부 지역에서 특히 라마단에 사랑받습니다.", "小麦と肉をじっくり煮込んだなめらかなおかゆ。東部州で特にラマダン中に好まれます。"),
    ing: L("Whole wheat, lamb or chicken, ghee, salt", "قمح، لحم أو دجاج، سمن، ملح", "통밀, 양고기 또는 닭고기, 기, 소금", "全粒小麦、羊肉または鶏肉、ギー、塩") });
  add("coffee", { ar: "قهوة وتمر", icon: "bowl", img: "f-coffee", name: L("Saudi coffee & dates", "القهوة السعودية والتمر", "사우디 커피와 대추야자", "サウジコーヒーとデーツ"),
    d: L("Lightly roasted coffee with cardamom and often saffron, poured from a dallah and served with dates. The sign of Saudi hospitality.", "قهوة خفيفة التحميص بالهيل وغالباً الزعفران، تُصب من الدلة وتُقدّم مع التمر. رمز الضيافة السعودية.", "카다멈과 종종 사프란을 넣은 약배전 커피를 달라에서 따라 대추야자와 함께 냅니다. 사우디 환대의 상징입니다.", "カルダモンと、よくサフランを加えた浅煎りコーヒーをダッラから注ぎ、デーツと一緒に出します。サウジのおもてなしの象徴です。"),
    ing: L("Lightly roasted coffee, cardamom, saffron, cloves (optional), dates", "بن خفيف التحميص، هيل، زعفران، قرنفل (اختياري)، تمر", "약배전 커피, 카다멈, 사프란, 정향(선택), 대추야자", "浅煎りコーヒー豆、カルダモン、サフラン、クローブ（お好みで）、デーツ") });
  add("marqooq", { img: "f-marqooq", ar: "مرقوق", icon: "bread", name: L("Marqooq", "المرقوق", "마르구그", "マルクーク"),
    d: L("Thin sheets of dough cooked right in a rich stew of meat and vegetables. Named Riyadh's signature dish by the Culinary Arts Commission.", "رقائق عجين تُطهى مباشرة في مرق غني باللحم والخضار. اختارته هيئة فنون الطهي طبقاً يمثّل منطقة الرياض.", "얇은 반죽을 고기와 채소가 든 진한 스튜에 바로 넣어 익힌 요리로, 요리예술위원회가 리야드 지역 대표 요리로 선정했습니다.", "薄い生地を肉と野菜の濃厚な煮込みで直接煮た料理。料理芸術委員会がリヤド地方を代表する料理に選びました。"),
    ing: L("Wheat dough, lamb or chicken, zucchini, eggplant, tomato, onion, spices", "عجينة بر، لحم أو دجاج، كوسا، باذنجان، طماطم، بصل، بهارات", "밀 반죽, 양고기 또는 닭고기, 애호박, 가지, 토마토, 양파, 향신료", "小麦の生地、羊肉または鶏肉、ズッキーニ、なす、トマト、玉ねぎ、スパイス") });
  add("maqshush", { img: "f-maqshush", ar: "مقشوش", icon: "bread", name: L("Maqshush", "المقشوش", "마그슈시", "マグシューシュ"),
    d: L("Small, soft discs of bread topped with ghee and honey, dates or sugar. Chosen as Saudi Arabia's national dessert in 2023.", "أقراص خبز صغيرة وطرية تُغطّى بالسمن والعسل أو التمر أو السكر. اعتُمد حلوى وطنية للمملكة عام 2023.", "작고 부드러운 빵 원반에 기와 꿀, 대추야자 또는 설탕을 얹은 디저트로, 2023년 사우디 국가 디저트로 선정되었습니다.", "小さく柔らかいパンにギーとはちみつ、デーツまたは砂糖をのせた菓子。2023年にサウジの国民的デザートに選ばれました。"),
    ing: L("Whole wheat flour, ghee, honey, dates or date molasses, sugar", "دقيق بر، سمن، عسل، تمر أو دبس، سكر", "통밀가루, 기, 꿀, 대추야자 또는 대추 시럽, 설탕", "全粒粉、ギー、はちみつ、デーツまたはデーツシロップ、砂糖") });
  add("mantu", { img: "f-mantu", ar: "منتو", icon: "bowl", name: L("Mantu", "المنتو", "만투", "マントゥ"),
    d: L("Steamed dumplings filled with meat or pumpkin, served with yogurt and tomato sauce. A Hijazi favourite with Central Asian roots.", "عجينة محشوة باللحم أو القرع تُطهى على البخار وتُقدّم مع اللبن وصلصة الطماطم. طبق حجازي محبوب أصوله من آسيا الوسطى.", "고기나 호박을 채워 찐 만두에 요거트와 토마토 소스를 곁들입니다. 중앙아시아에서 온 히자즈의 인기 요리입니다.", "肉またはかぼちゃを包んで蒸した餃子に、ヨーグルトとトマトソースを添えます。中央アジア由来のヒジャーズ料理です。"),
    ing: L("Dough, minced meat or pumpkin, onion, yogurt, garlic, tomato sauce", "عجينة، لحم مفروم أو قرع، بصل، لبن، ثوم، صلصة طماطم", "만두피, 다진 고기 또는 호박, 양파, 요거트, 마늘, 토마토 소스", "生地、ひき肉またはかぼちゃ、玉ねぎ、ヨーグルト、にんにく、トマトソース") });
  add("sobia", { img: "f-sobia", ar: "سوبيا", icon: "bowl", name: L("Sobia", "السوبيا", "소비아", "ソビア"),
    d: L("A cool, sweet drink made from barley or oats with cinnamon and sugar, sold from carts across the Hijaz in Ramadan.", "مشروب بارد وحلو من الشعير أو الشوفان مع القرفة والسكر، تبيعه العربات في أنحاء الحجاز خلال رمضان.", "보리나 귀리에 계피와 설탕을 넣은 시원하고 달콤한 음료로, 라마단이면 히자즈 곳곳의 수레에서 팝니다.", "大麦またはオーツにシナモンと砂糖を加えた冷たく甘い飲み物。ラマダンにはヒジャーズ中の屋台で売られます。"),
    ing: L("Barley or oats, dry bread, sugar, cinnamon, cardamom", "شعير أو شوفان، خبز ناشف، سكر، قرفة، هيل", "보리 또는 귀리, 마른 빵, 설탕, 계피, 카다멈", "大麦またはオーツ、乾燥パン、砂糖、シナモン、カルダモン") });
  add("muhammar", { img: "f-muhammar", ar: "محمّر", icon: "rice", name: L("Muhammar", "المحمّر", "무함마르", "ムハンマル"),
    d: L("Sweet rice cooked with date syrup or sugar, cardamom and saffron, traditionally eaten with grilled or fried fish on the Gulf coast.", "أرز حلو يُطهى بالدبس أو السكر مع الهيل والزعفران، ويؤكل تقليدياً مع السمك المشوي أو المقلي على ساحل الخليج.", "대추 시럽이나 설탕, 카다멈, 사프란으로 지은 달콤한 밥으로, 걸프 해안에서는 구운 생선이나 튀긴 생선과 함께 먹습니다.", "デーツシロップか砂糖、カルダモン、サフランで炊いた甘いご飯。湾岸では焼き魚や揚げ魚と一緒に食べます。"),
    ing: L("Rice, date syrup or sugar, cardamom, saffron, ghee, rosewater", "أرز، دبس أو سكر، هيل، زعفران، سمن، ماء ورد", "쌀, 대추 시럽 또는 설탕, 카다멈, 사프란, 기, 장미수", "米、デーツシロップまたは砂糖、カルダモン、サフラン、ギー、ローズウォーター") });
  add("miflaq", { img: "f-miflaq", ar: "مفلق حساوي", icon: "bowl", name: L("Hassawi miflaq", "المفلق الحساوي", "하사위 미플라그", "ハサウィ・ミフラク"),
    d: L("Cracked wheat cooked in place of rice with meat or shrimp, often topped with boiled eggs. A favourite of Al-Ahsa.", "قمح مجروش يُطبخ بدل الأرز مع اللحم أو الروبيان، ويُزيّن غالباً بالبيض المسلوق. من أشهر أكلات الأحساء.", "쌀 대신 빻은 밀을 고기나 새우와 함께 익히고 삶은 달걀을 올리기도 하는, 알아흐사의 인기 음식입니다.", "米の代わりに挽き割り小麦を肉またはエビと炊き、ゆで卵を添えることも多い料理。アル・アハサーの名物です。"),
    ing: L("Cracked wheat, meat or shrimp, onion, tomato, spices, boiled eggs", "قمح مجروش، لحم أو روبيان، بصل، طماطم، بهارات، بيض مسلوق", "빻은 밀, 고기 또는 새우, 양파, 토마토, 향신료, 삶은 달걀", "挽き割り小麦、肉またはエビ、玉ねぎ、トマト、スパイス、ゆで卵") });
  add("redbread", { img: "f-redbread", ar: "خبز أحمر", icon: "bread", name: L("Hassawi red bread", "الخبز الأحمر الحساوي", "하사위 붉은 빵", "ハサウィの赤いパン"),
    d: L("Date bread baked in a clay tannour oven, flavoured with black seed, cardamom and saffron. Listed by UNESCO's Creative Cities bakery initiative in 2024.", "خبز بالتمر يُخبز في تنور فخاري، بنكهة الحبة السوداء والهيل والزعفران. أُدرج في مبادرة مخبوزات المدن المبدعة لليونسكو عام 2024.", "점토 탄누르 화덕에서 구운 대추야자 빵으로 흑종초, 카다멈, 사프란 향이 납니다. 2024년 유네스코 창의도시 제빵 이니셔티브에 등재되었습니다.", "粘土のタンヌール窯で焼くデーツ入りのパン。ブラックシード、カルダモン、サフランが香ります。2024年にユネスコ創造都市のパン企画に登録されました。"),
    ing: L("Whole wheat flour, bran, dates, black seed, sesame, cardamom, saffron", "طحين بر، نخالة، تمر، حبة سوداء، سمسم، هيل، زعفران", "통밀가루, 밀기울, 대추야자, 흑종초, 참깨, 카다멈, 사프란", "全粒粉、ふすま、デーツ、ブラックシード、ごま、カルダモン、サフラン") });
  add("luqaimat", { img: "f-luqaimat", ar: "لقيمات", icon: "bread", name: L("Luqaimat", "اللقيمات", "루가이맛", "ルガイマート"),
    d: L("Crisp fried dough balls drizzled with date syrup and sesame. A Gulf favourite, especially in Ramadan and winter.", "كرات عجين مقلية ومقرمشة يُسكب عليها الدبس والسمسم. محبوبة في الخليج خاصة في رمضان والشتاء.", "바삭하게 튀긴 반죽 볼에 대추 시럽과 참깨를 뿌린 디저트로, 특히 라마단과 겨울에 걸프 지역에서 사랑받습니다.", "揚げた生地のボールにデーツシロップとごまをかけたお菓子。湾岸ではラマダンや冬に特に人気です。"),
    ing: L("Flour, yeast, cardamom, saffron, date syrup, sesame", "دقيق، خميرة، هيل، زعفران، دبس، سمسم", "밀가루, 이스트, 카다멈, 사프란, 대추 시럽, 참깨", "小麦粉、イースト、カルダモン、サフラン、デーツシロップ、ごま") });
  D.CITIES.riyadh.food = ["kabsa", "marqooq", "qursan", "jareesh", "maqshush", "mandi", "coffee"];
  D.CITIES.jeddah.food = ["masoub", "ful", "mutabbaq", "mantu", "saleeg", "sayadiya", "sobia"];
  D.CITIES.khobar.food = ["balaleet", "harees", "muhammar", "miflaq", "sayadiya", "redbread", "luqaimat"];
})();

/* Asian Cup history 1956–2023 (Wikipedia "AFC Asian Cup", verified 2026-11-09). */
window.FV_HISTORY = {
  finals: [
    { y: 1956, host: ["HK"], w: "KR", r: "IL", s: null }, { y: 1960, host: ["KR"], w: "KR", r: "IL", s: null },
    { y: 1964, host: ["IL"], w: "IL", r: "IN", s: null }, { y: 1968, host: ["IR"], w: "IR", r: "MM", s: null },
    { y: 1972, host: ["TH"], w: "IR", r: "KR", s: "2–1" }, { y: 1976, host: ["IR"], w: "IR", r: "KW", s: "1–0" },
    { y: 1980, host: ["KW"], w: "KW", r: "KR", s: "3–0" }, { y: 1984, host: ["SG"], w: "SA", r: "CN", s: "2–0" },
    { y: 1988, host: ["QA"], w: "SA", r: "KR", s: "0–0 (4–3 p)" }, { y: 1992, host: ["JP"], w: "JP", r: "SA", s: "1–0" },
    { y: 1996, host: ["AE"], w: "SA", r: "AE", s: "0–0 (4–2 p)" }, { y: 2000, host: ["LB"], w: "JP", r: "SA", s: "1–0" },
    { y: 2004, host: ["CN"], w: "JP", r: "CN", s: "3–1" }, { y: 2007, host: ["ID", "MY", "TH", "VN"], w: "IQ", r: "SA", s: "1–0" },
    { y: 2011, host: ["QA"], w: "JP", r: "AU", s: "1–0" }, { y: 2015, host: ["AU"], w: "AU", r: "KR", s: "2–1" },
    { y: 2019, host: ["AE"], w: "QA", r: "JP", s: "3–1" }, { y: 2023, host: ["QA"], w: "QA", r: "JO", s: "3–1" },
  ],
  top4: { KR: 11, IR: 10, JP: 6, SA: 6, CN: 6, KW: 4, AE: 4, IQ: 3, AU: 2, QA: 2, VN: 2, BH: 1, JO: 1, KP: 1, TH: 1, UZ: 1 },
  debut: { CN: 1976, SA: 1984, JP: 1988, AU: 2007 },
};

/* Team records — each national team's Wikipedia page, verified 2026-11-09.
   Only figures the page states consistently are included (conflicting ones are left out). */
(() => {
  const P = (en, ar, ko, ja) => ({ en, ar: ar || en, ko: ko || en, ja: ja || en });
  window.FV_TEAMFACTS = {
    SA: { nick: P("The Green Falcons", "الصقور الخضر"), caps: { p: P("Mohamed Al-Deayea", "محمد الدعيع"), n: 173 }, top: { p: P("Majed Abdullah", "ماجد عبدالله"), n: 72 }, first: { y: 1957, opp: "LB", s: "1–1" }, big: { s: "10–0", opp: "TL", y: 2015 }, wc: { n: 7, first: 1994, best: "r16" }, ac: { n: 12, first: 1984 }, founded: 1956,
      extra: [{ key: "qt.finalScorer1", vars: { y: 1984 }, a: P("Shaye Al-Nafisah", "شايع النفيسة"), d: [P("Majed Abdullah", "ماجد عبدالله"), P("Yasser Al-Qahtani", "ياسر القحطاني"), P("Sami Al-Jaber", "سامي الجابر")], lvl: "hard" }] },
    AE: { nick: P("Al-Abyad (The Whites)", "الأبيض"), caps: { p: P("Adnan Al Talyani", "عدنان الطلياني"), n: 161 }, top: { p: P("Ali Mabkhout", "علي مبخوت"), n: 85 }, first: { y: 1972, opp: "QA", s: "1–0" }, big: { s: "12–0", opp: "BN", y: 2001 }, wc: { n: 1, first: 1990, best: "group" }, ac: { n: 12, first: 1980 }, home: P("Zayed Sports City Stadium", "استاد مدينة زايد الرياضية") },
    KW: { nick: P("Al-Azraq (The Blues)", "الأزرق"), caps: { p: P("Bader Al-Mutawa", "بدر المطوع"), n: 202 }, top: { p: P("Bashar Abdullah", "بشار عبدالله"), n: 75 }, first: { y: 1961, opp: "LY", s: "2–2" }, big: { s: "20–0", opp: "BT", y: 2000 }, wc: { n: 1, first: 1982, best: "group" }, ac: { n: 11, first: 1972 }, home: P("Jaber Al-Ahmad International Stadium", "استاد جابر الأحمد الدولي") },
    JP: { nick: P("Samurai Blue", "الساموراي الأزرق", "사무라이 블루", "サムライ・ブルー"), caps: { p: P("Yasuhito Endō", "ياسوهيتو إندو", "엔도 야스히토", "遠藤保仁"), n: 152 }, top: { p: P("Kunishige Kamamoto", "كونيشيغي كاماموتو", "가마모토 구니시게", "釜本邦茂"), n: 75 }, first: { y: 1917, opp: "CN", s: "0–5" }, big: { s: "15–0", opp: "PH", y: 1967 }, wc: { n: 8, first: 1998, best: "r16" }, ac: { n: 11, first: 1988 }, founded: 1921,
      extra: [{ key: "qt.mvp", vars: { y: 2011 }, a: P("Keisuke Honda", "كيسكي هوندا", "혼다 게이스케", "本田圭佑"), d: [P("Shinji Kagawa", "شينجي كاغاوا", "가가와 신지", "香川真司"), P("Yasuhito Endō", "ياسوهيتو إندو", "엔도 야스히토", "遠藤保仁"), P("Shunsuke Nakamura", "شونسوكي ناكامورا", "나카무라 슌스케", "中村俊輔")], lvl: "hard" }] },
    KR: { nick: P("Taegeuk Warriors", "محاربو التايغوك", "태극전사", "テグク戦士"), caps: { p: P("Son Heung-min", "سون هيونغ مين", "손흥민", "孫興慜"), n: 151 }, top: { p: P("Son Heung-min", "سون هيونغ مين", "손흥민", "孫興慜"), n: 59 }, first: { y: 1948, opp: "MX", s: "5–3" }, big: { s: "16–0", opp: "NP", y: 2003 }, wc: { n: 12, first: 1954, best: "fourth" }, ac: { n: 15, first: 1956 }, founded: 1948 },
    QA: { nick: P("Al-Annabi (The Maroon)", "العنابي"), caps: { p: P("Hassan Al-Haydos", "حسن الهيدوس"), n: 188 }, top: { p: P("Almoez Ali", "المعز علي"), n: 60 }, first: { y: 1970, opp: "BH", s: "1–2" }, big: { s: "15–0", opp: "BT", y: 2015 }, wc: { n: 2, first: 2022, best: "group" }, ac: { n: 12, first: 1980 }, founded: 1960,
      extra: [{ key: "qt.mvp", vars: { y: 2023 }, a: P("Akram Afif", "أكرم عفيف"), d: [P("Almoez Ali", "المعز علي"), P("Hassan Al-Haydos", "حسن الهيدوس"), P("Musa Al-Taamari", "موسى التعمري")], lvl: "medium" }] },
    IR: { nick: P("Team Melli", "تيم ملي", "팀 멜리", "チーム・メッリ"), caps: { p: P("Javad Nekounam", "جواد نكونام"), n: 149 }, top: { p: P("Ali Daei", "علي دائي", "알리 다에이", "アリ・ダエイ"), n: 108 }, first: { y: 1941, opp: "AF", s: "0–0" }, big: { s: "19–0", opp: "GU", y: 2000 }, wc: { n: 7, first: 1978, best: "group" }, ac: { n: 16, first: 1968 }, founded: 1920, home: P("Azadi Stadium", "استاد آزادي", "아자디 스타디움", "アザディ・スタジアム") },
    IQ: { nick: P("Lions of Mesopotamia", "أسود الرافدين"), caps: { p: P("Younis Mahmoud", "يونس محمود"), n: 148 }, top: { p: P("Hussein Saeed", "حسين سعيد"), n: 78 }, first: { y: 1957, opp: "MA", s: "3–3" }, big: { s: "13–0", opp: "ET", y: 1992 }, wc: { n: 2, first: 1986, best: "group" }, ac: { n: 11, first: 1972 }, founded: 1948, home: P("Basra International Stadium", "استاد البصرة الدولي"),
      extra: [{ key: "qt.finalScorer", vars: { y: 2007 }, a: P("Younis Mahmoud", "يونس محمود"), d: [P("Hussein Saeed", "حسين سعيد"), P("Nashat Akram", "نشأت أكرم"), P("Hawar Mulla Mohammed", "هوار ملا محمد")], lvl: "medium" }] },
    AU: { nick: P("Socceroos", "سوكروز", "사커루즈", "サッカルーズ"), caps: { p: P("Mark Schwarzer", "مارك شوارزر", "마크 슈워처", "マーク・シュウォーツァー"), n: 109 }, top: { p: P("Tim Cahill", "تيم كاهيل", "팀 케이힐", "ティム・ケーヒル"), n: 50 }, wc: { first: 1974 }, ac: { first: 2007 }, afc: 2006 },
    JO: { nick: P("Al-Nashama", "النشامى"), caps: { p: P("Amer Shafi", "عامر شفيع"), n: 171 }, top: { p: P("Hamza Al-Dardour", "حمزة الدردور"), n: 31 }, first: { y: 1953, opp: "SY", s: "1–3" }, big: { s: "9–0", opp: "NP", y: 2011 }, wc: { n: 1, first: 2026, best: "group" }, ac: { first: 2004 } },
    CN: { nick: P("Dragon Team", "فريق التنين", "용의 팀", "龍之隊"), caps: { p: P("Li Weifeng", "لي ويفنغ", "리웨이펑", "李瑋鋒"), n: 112 }, top: { p: P("Hao Haidong", "هاو هايدونغ", "하오하이둥", "郝海東"), n: 39 }, big: { s: "19–0", opp: "GU", y: 2000 }, wc: { n: 1, first: 2002, best: "group" }, ac: { n: 14, first: 1976 }, founded: 1924 },
    UZ: { nick: P("White Wolves", "الذئاب البيضاء", "하얀 늑대", "白い狼"), caps: { p: P("Server Djeparov", "سيرفر جيباروف", "세르베르 제파로프", "セルヴェル・ジェパロフ"), n: 128 }, top: { p: P("Eldor Shomurodov", "إلدور شومورودوف", "엘도르 쇼무로도프", "エルドル・ショムロドフ"), n: 47 }, first: { y: 1992, opp: "TJ", s: "2–2" }, big: { s: "15–0", opp: "MN", y: 1998 }, wc: { n: 1, first: 2026, best: "group" }, ac: { n: 9, first: 1996 } },
    OM: { nick: P("Al-Ahmar (The Reds)", "الأحمر"), caps: { p: P("Ahmed Mubarak", "أحمد مبارك"), n: 193 }, top: { p: P("Hani Al-Dhabit", "هاني الضابط"), n: 42 }, first: { y: 1965, opp: "LY", s: "1–14" }, big: { s: "14–0", opp: "BT", y: 2017 }, wc: { n: 0 }, ac: { n: 6, first: 2004 }, home: P("Sultan Qaboos Sports Complex", "مجمع السلطان قابوس الرياضي"), regional: { cup: "gulf", n: 2, yrs: "2009, 2017–18" } },
    PS: { nick: P("Lions of Canaan", "أسود كنعان"), caps: { p: P("Abdelatif Bahdari", "عبد اللطيف البهداري"), n: 82 }, top: { p: P("Oday Dabbagh", "عدي الدباغ"), n: 17 }, big: { s: "11–0", opp: "GU", y: 2006 }, wc: { n: 0 }, ac: { n: 4, first: 2015 }, home: P("Faisal Al-Husseini International Stadium", "استاد فيصل الحسيني الدولي"), fifa: 1998, challenge: 2014 },
    BH: { nick: P("Al-Ahmar (The Red)", "الأحمر"), caps: { p: P("Sayed Mohammed Jaffer", "سيد محمد جعفر"), n: 163 }, top: { p: P("Ismail Abdullatif", "إسماعيل عبداللطيف") }, first: { y: 1966, opp: "KW", s: "4–4" }, big: { s: "10–0", opp: "ID", y: 2012 }, wc: { n: 0 }, ac: { n: 8, first: 1988 }, home: P("Bahrain National Stadium", "استاد البحرين الوطني"), regional: { cup: "gulf", n: 2, yrs: "2019, 2024–25" } },
    KP: { nick: P("Chollima", "تشوليما", "천리마", "千里馬"), caps: { p: P("Ri Myong-guk", "ري ميونغ كوك", "리명국", "李明国"), n: 118 }, top: { p: P("Jong Il-gwan", "جونغ إيل غوان", "정일관", "鄭一官"), n: 31 }, big: { s: "21–0", opp: "GU", y: 2005 }, wc: { n: 2, first: 1966, best: "qf" }, ac: { n: 6, first: 1980 }, home: P("Kim Il Sung Stadium", "استاد كيم إيل سونغ", "김일성경기장", "金日成競技場") },
    SY: { nick: P("Qasioun Eagles", "نسور قاسيون"), caps: { p: P("Mahmoud Al-Mawas", "محمود المواس"), n: 110 }, top: { p: P("Firas Al-Khatib", "فراس الخطيب"), n: 36 }, first: { y: 1942, opp: "LB", s: "2–1" }, big: { s: "13–0", opp: "OM", y: 1965 }, wc: { n: 0 }, ac: { n: 7, first: 1980 } },
    KG: { nick: P("White Falcons", "الصقور البيضاء", "하얀 매", "白い鷹"), caps: { p: P("Kayrat Zhyrgalbek uulu", "كايرات جيرغالبيك أولو") }, top: { p: P("Mirlan Murzayev", "ميرلان مورزاييف", "미를란 무르자예프", "ミルラン・ムルザエフ"), n: 16 }, first: { y: 1992, opp: "UZ", s: "0–3" }, wc: { n: 0 }, ac: { n: 3, first: 2019 }, home: P("Dolen Omurzakov Stadium", "استاد دولن أومورزاكوف") },
    TJ: { nick: P("The Crowns", "التيجان", "왕관", "王冠"), caps: { p: P("Akhtam Nazarov", "أختام نازاروف", "악탐 나자로프", "アフタム・ナザロフ"), n: 100 }, top: { p: P("Manuchekhr Dzhalilov", "منوچهر جليلوف", "마누체흐르 잘릴로프", "マヌチェフル・ジャリロフ"), n: 20 }, first: { y: 1992, opp: "UZ", s: "2–2" }, big: { s: "16–0", opp: "GU", y: 2000 }, wc: { n: 0 } },
    SG: { nick: P("The Lions", "الأسود", "라이온스", "ライオンズ"), caps: { p: P("Hariss Harun", "هاريس هارون") }, top: { p: P("Fandi Ahmad", "فندي أحمد", "판디 아마드", "ファンディ・アフマド"), n: 55 }, first: { y: 1948, opp: "CN", s: "1–0" }, big: { s: "11–0", opp: "LA", y: 2007 }, wc: { n: 0 }, regional: { cup: "aff", n: 4, yrs: "1998, 2004, 2007, 2012" } },
    VN: { nick: P("Golden Star Warriors", "محاربو النجمة الذهبية", "황금별 전사", "黄金の星の戦士"), caps: { p: P("Nguyễn Quang Hải", "نغوين كوانغ هاي", "응우옌꽝하이", "グエン・クアン・ハイ"), n: 88 }, top: { p: P("Lê Công Vinh", "لي كونغ فين", "레꽁빈", "レ・コン・ビン"), n: 51 }, first: { y: 1949, opp: "KR", s: "3–3" }, big: { s: "11–0", opp: "GU", y: 2000 }, wc: { n: 0 }, home: P("Mỹ Đình National Stadium", "استاد مي دينه الوطني", "미딘 국립경기장", "ミーディン国立競技場"), regional: { cup: "aff", n: 4, yrs: "2008, 2018, 2024, 2026" } },
    TH: { nick: P("War Elephants", "أفيال الحرب", "전쟁 코끼리", "戦象"), caps: { p: P("Kiatisuk Senamuang", "كياتيسوك سيناموانغ", "끼아띠삭 세나무앙", "キャティサック・セーナームアン"), n: 134 }, top: { p: P("Kiatisuk Senamuang", "كياتيسوك سيناموانغ", "끼아띠삭 세나무앙", "キャティサック・セーナームアン"), n: 71 }, first: { y: 1948, opp: "CN", s: "1–6" }, wc: { n: 0 }, home: P("Rajamangala Stadium", "استاد راجامانغالا", "라자망갈라 스타디움", "ラジャマンガラ・スタジアム"), regional: { cup: "aff", n: 7, yrs: "1996, 2000, 2002, 2014, 2016, 2020, 2022" } },
    ID: { nick: P("Garuda", "غارودا", "가루다", "ガルーダ"), caps: { p: P("Abdul Kadir", "عبد القادر"), n: 111 }, top: { p: P("Abdul Kadir", "عبد القادر"), n: 70 }, first: { y: 1934, opp: "JP", s: "7–1" }, big: { s: "13–1", opp: "PH", y: 2002 }, wc: { n: 1, first: 1938, best: "group" }, home: P("Gelora Bung Karno Stadium", "استاد جيلورا بونغ كارنو", "겔로라 붕 카르노 스타디움", "ゲロラ・ブン・カルノ・スタジアム") },
    YE: { nick: P("Happy Yemen", "اليمن السعيد"), caps: { p: P("Alaa Al-Sasi", "علاء الصاصي"), n: 84 }, top: { p: P("Ali Al-Nono", "علي النونو"), n: 30 }, wc: { n: 0 }, ac: { first: 2019 }, home: P("Althawra Sports City Stadium", "مدينة الثورة الرياضية") },
  };
})();

/* Association founding / FIFA / AFC membership years (AFC member-associations table, Wikipedia, checked 2026-11-10). Only fills gaps. */
(function () {
  const A = { SA: [1956, 1956, 1972], AE: [1971, 1974, 1974], KW: [1952, 1964, 1964], JP: [1921, 1921, 1954], KR: [null, 1948, 1954], QA: [1960, 1972, 1974], IR: [1920, 1948, 1958], IQ: [1948, 1950, 1970], AU: [1961, 1963, 2006], JO: [1949, 1956, 1970], CN: [1924, 1931, 1974], UZ: [1946, 1994, 1993], OM: [1978, 1980, 1980], PS: [null, 1998, 1998], BH: [1957, 1968, 1969], KP: [1945, 1958, 1974], SY: [1936, 1937, 1970], KG: [1992, 1994, 1993], TJ: [1936, 1994, 1993], SG: [1892, 1952, 1954], VN: [1960, null, null], TH: [1916, 1925, 1954], ID: [1930, 1952, 1954], YE: [1962, 1980, 1980] };
  const F = window.FV_TEAMFACTS || {};
  if (F.TJ && !(F.TJ.ac && F.TJ.ac.first)) F.TJ.ac = { n: 1, first: 2023 };
  if (F.SG && !(F.SG.ac && F.SG.ac.first)) F.SG.ac = { n: 1, first: 1984 };
  for (const [c, [fo, fi, af]] of Object.entries(A)) { const r = F[c]; if (!r) continue; if (!r.founded && fo) r.founded = fo; if (!r.fifa && fi) r.fifa = fi; if (!r.afc && af) r.afc = af; }
})();
