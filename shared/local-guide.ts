import {stadiumFor} from './stadiums.ts';
import {ingredients} from './regions.ts';
import {regionFor} from './regions.ts';import {destinations,culture,type Lang} from './data.ts';
export type StoryPath='heritage'|'food'|'football';
export function localScene(destination:string,language:Lang,scene:number,previousChoices:string[],path:StoryPath='heritage'){
const r=regionFor(destination),city=destinations.find(d=>d.id===destination)||destinations[0],ar=language==='ar',i=ar?1:0;
const choice=previousChoices.at(-1)||'';
const subject=/coffee|قهوة|コーヒー/i.test(choice)?r.coffee[i]:/food|meal|مذاق|طبق|أكلة/i.test(choice)?r.dish[i]:/stadium|ملعب|جمهور|football/i.test(choice)?(ar?'أجواء الجمهور':'fan culture'):(ar?'تراث المدينة':'the city’s heritage');
const titles=ar?['حياك الله في '+city.ar,'نكهة من '+r.ar,'يجمعنا شغف المدرّج','حكاية تأخذها معك']:['Welcome to '+city.en,'A taste of '+r.en,'A shared love of the game','A memory to take home'];
const narratives=ar?[
`تبدأ جولتك الثقافية في ${city.ar}. اخترنا لك مسار ${path==='food'?'المذاق':path==='football'?'شغف كرة القدم':'التراث'}. أمامك فنجان من ${r.coffee[1]} وتمرات؛ هذه جولة محلية تفاعلية وليست رواية مولّدة بالذكاء الاصطناعي. أي باب تفتح أولاً؟`,
`اختيارك السابق «${choice}» يقودك إلى ${subject}. على السفرة ${r.dish[1]}، وفي المكان تفاصيل من طراز ${r.ar}. اختر التجربة التي ترغب في اكتشافها أكثر.`,
`بعد «${choice}»، تنتقل الحكاية إلى لحظة لقاء تخيّلية مع مشجعين. تتبادلون التحية وتتحدثون عن رحلتكم. لا يفترض هذا المشهد وجود مباراة محددة أو السماح بدخول ملعب. كيف تصنع ذكرتك؟`,
`من ${city.ar} تحمل معك مذاق ${r.dish[1]}، ودفء ${r.coffee[1]}، وشغفاً يقرّب المشجعين. اختياراتك: ${previousChoices.join(' ← ')}. اختر عنوان الذكرى التي تريد حفظها.`
]:[
`Your cultural tour begins in ${city.en}, following the ${path} trail. A finjan of ${r.coffee[0]} and dates introduce the region. This is a curated interactive guide, not an AI-generated story. Which discovery will you choose?`,
`Your choice, “${choice}”, takes the story towards ${subject}. ${r.dish[0]} is on the local table, and the region’s architecture offers another way to explore. Where next?`,
`After “${choice}”, imagine meeting fellow football fans and exchanging greetings. This fictional scene does not imply a real fixture, stadium admission or event booking. What will you remember?`,
`You leave ${city.en} with the flavors of ${r.dish[0]}, the welcome of ${r.coffee[0]}, and a shared passion for football. Your choices: ${previousChoices.join(' → ')}. Choose a title for your memory.`
];
const choices=scene===3?(ar?['ذكرى المذاق والضيافة','ذكرى العمارة والتراث','ذكرى الأصدقاء وكرة القدم']:['A memory of food & hospitality','A memory of heritage','A memory of football & friendship']):(ar?['اكتشف القهوة والتمر','تذوّق طبق '+r.dish[1],'اكتشف الملعب وأجواء الجمهور']:['Discover coffee & dates','Taste the local meal: '+r.dish[0],'Explore stadium & fan culture']);
return {sceneTitle:titles[scene],narrative:narratives[scene],culturalFact:scene===1?(ar?`${r.dish[1]}: من المكونات الشائعة ${r.foodIngredients.slice(0,3).map(n=>ingredients.ar[n]).join('، ')}.`:`${r.dish[0]}: typical ingredients in this guide include ${r.foodIngredients.slice(0,3).map(n=>ingredients.en[n]).join(', ')}.`):scene===2?`${stadiumFor(destination).capacity} · ${stadiumFor(destination).capacityLabel[i]}`:culture[scene%culture.length].fact[i],choices:choices.map((text,index)=>({id:['A','B','C'][index] as 'A'|'B'|'C',text})) as [{id:'A';text:string},{id:'B';text:string},{id:'C';text:string}],sceneCategory:['arrival','culture','football','memory'][scene] as 'arrival'|'culture'|'football'|'memory',isSimulation:true as const,model:'local-guide',language};
}
