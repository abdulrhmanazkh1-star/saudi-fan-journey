import {useEffect,useRef} from 'react';

type RGB=[number,number,number];
type Palette={base1:RGB;base2:RGB;line:RGB;a:RGB;b:RGB;c:RGB};
type Spark={x:number;y:number;vx:number;vy:number;life:number;max:number;size:number;color:RGB;spin:number};
type Ripple={x:number;y:number;t0:number};

const HERITAGE:Palette={base1:[250,246,237],base2:[239,230,211],line:[38,75,61],a:[38,75,61],b:[169,81,53],c:[201,154,60]};
const WORLDCUP:Palette={base1:[246,251,253],base2:[227,240,245],line:[23,56,74],a:[8,124,128],b:[23,56,74],c:[59,166,196]};

const TILT_SELECTOR='.how-card,.city-card,.tournament-option,.tournament-preview,.country-card,.culture-card,.travel-card,.adventure-invite,.result-card,.passport-card,.landmark-card,.recipe-card,.culture-story-card,.day-result-card,.quest-route-card';
const PARALLAX_SELECTOR='.stadium-photo-stage,.landmark-photo,.destination-stadium,.world-hero,.world-venue-image,.city-card,.culture-stadium-photo,.world-stadium-grid>*,.world-city-grid>*,.hero-art';
const MAGNET_SELECTOR='.button,.brand-symbol';
const INTERACTIVE_SELECTOR='a,button,input,textarea,select,[role=button],.country-card,.city-card,.how-card,.tournament-option,.tournament-preview';

const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const mix=(a:RGB,b:RGB,t:number):RGB=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
const rgba=(c:RGB,a:number)=>`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;

export function CreativeBackground(){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const ringRef=useRef<HTMLDivElement>(null);
  const dotRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas)return;
    const ctx=canvas.getContext('2d');
    if(!ctx)return;

    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer=window.matchMedia('(pointer: fine)').matches;
    const ring=ringRef.current;
    const dot=dotRef.current;

    let w=0,h=0,dpr=1;
    let raf=0;
    let active=false;       // has the pointer moved at all
    let lastMove=0;
    const target={x:-9999,y:-9999};
    const smooth={x:-9999,y:-9999};
    const cursor={x:-9999,y:-9999};
    const dotPos={x:-9999,y:-9999};
    let hoverBoost=0;
    let palette:Palette={...HERITAGE};
    const sparks:Spark[]=[];
    const ripples:Ripple[]=[];
    let tiltEl:HTMLElement|null=null;
    let magnetEl:HTMLElement|null=null;
    let parEl:HTMLElement|null=null;

    const resize=()=>{
      dpr=Math.min(window.devicePixelRatio||1,2);
      w=window.innerWidth;h=window.innerHeight;
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
      canvas.style.width=w+'px';canvas.style.height=h+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };

    const spawn=(x:number,y:number,n:number,burst=false)=>{
      for(let i=0;i<n;i++){
        const ang=Math.random()*Math.PI*2;
        const sp=burst?.8+Math.random()*1.8:.15+Math.random()*.5;
        const pick=Math.random();
        sparks.push({x,y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp+(burst?0:.25),life:0,max:burst?40+Math.random()*20:40,size:burst?2+Math.random()*3:2+Math.random()*2.5,color:pick<.4?palette.a:pick<.75?palette.b:palette.c,spin:(Math.random()-.5)*.2});
      }
      if(sparks.length>220)sparks.splice(0,sparks.length-220);
    };

    const octagram=(cx:number,cy:number,r:number,rot:number)=>{
      // 8-pointed star (khatam) made of two overlapping squares
      for(let k=0;k<2;k++){
        ctx.beginPath();
        for(let i=0;i<4;i++){
          const a=rot+k*Math.PI/4+i*Math.PI/2+Math.PI/4;
          const px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r;
          if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    };

    const onMove=(e:PointerEvent)=>{
      target.x=e.clientX;target.y=e.clientY;
      if(!active){active=true;smooth.x=cursor.x=dotPos.x=e.clientX;smooth.y=cursor.y=dotPos.y=e.clientY;}
      const now=performance.now();
      lastMove=now;
      const el=e.target instanceof Element?e.target:null;
      hoverBoost=el&&el.closest(INTERACTIVE_SELECTOR)?1:0;

      if(e.pointerType==='touch')return;
      // card tilt + spotlight
      const card=el?el.closest<HTMLElement>(TILT_SELECTOR):null;
      if(tiltEl&&tiltEl!==card){tiltEl.style.setProperty('--rx','0deg');tiltEl.style.setProperty('--ry','0deg');tiltEl.style.setProperty('--glow','0');}
      tiltEl=card;
      if(card){
        const r=card.getBoundingClientRect();
        const px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
        card.style.setProperty('--mx',(px*100).toFixed(1)+'%');
        card.style.setProperty('--my',(py*100).toFixed(1)+'%');
        card.style.setProperty('--ry',((px-.5)*7).toFixed(2)+'deg');
        card.style.setProperty('--rx',((.5-py)*7).toFixed(2)+'deg');
        card.style.setProperty('--glow','1');
      }
      // image parallax
      const ph=el?el.closest<HTMLElement>(PARALLAX_SELECTOR):null;
      if(parEl&&parEl!==ph){parEl.style.setProperty('--px','0');parEl.style.setProperty('--py','0');}
      parEl=ph;
      if(ph){const r=ph.getBoundingClientRect();ph.style.setProperty('--px',(((e.clientX-r.left)/r.width-.5)*2).toFixed(3));ph.style.setProperty('--py',(((e.clientY-r.top)/r.height-.5)*2).toFixed(3));}
      // magnetic buttons
      const mag=el?el.closest<HTMLElement>(MAGNET_SELECTOR):null;
      if(magnetEl&&magnetEl!==mag){magnetEl.style.setProperty('--tx','0px');magnetEl.style.setProperty('--ty','0px');}
      magnetEl=mag;
      if(mag){
        const r=mag.getBoundingClientRect();
        mag.style.setProperty('--tx',((e.clientX-(r.left+r.width/2))*.16).toFixed(1)+'px');
        mag.style.setProperty('--ty',((e.clientY-(r.top+r.height/2))*.22).toFixed(1)+'px');
      }
    };
    const onDown=(e:PointerEvent)=>{
      ripples.push({x:e.clientX,y:e.clientY,t0:performance.now()});
      if(ripples.length>6)ripples.shift();
      if(!reduced)spawn(e.clientX,e.clientY,7,true);
    };
    const onLeave=()=>{
      hoverBoost=0;
      if(tiltEl){tiltEl.style.setProperty('--rx','0deg');tiltEl.style.setProperty('--ry','0deg');tiltEl.style.setProperty('--glow','0');tiltEl=null;}
      if(magnetEl){magnetEl.style.setProperty('--tx','0px');magnetEl.style.setProperty('--ty','0px');magnetEl=null;}
      if(parEl){parEl.style.setProperty('--px','0');parEl.style.setProperty('--py','0');parEl=null;}
    };

    const frame=(now:number)=>{
      raf=requestAnimationFrame(frame);
      if(document.hidden)return;
      const appEl=document.querySelector('.app');
      const wc=appEl?.getAttribute('data-tournament')==='world-cup-2034';
      const goal=wc?WORLDCUP:HERITAGE;
      for(const key of Object.keys(goal) as (keyof Palette)[])palette[key]=mix(palette[key],goal[key],.06);

      // when the pointer is idle (or on touch screens) a soft light wanders by itself
      const t=now*.001;
      const idle=!active||now-lastMove>4500;
      if(idle&&!reduced){
        target.x=w*(.5+.34*Math.sin(t*.35));
        target.y=h*(.46+.3*Math.sin(t*.27+1.3));
      }
      smooth.x=lerp(smooth.x,target.x,idle?.025:.16);
      smooth.y=lerp(smooth.y,target.y,idle?.025:.16);

      // base
      const g=ctx.createLinearGradient(0,0,w,h);
      g.addColorStop(0,rgba(palette.base1,1));
      g.addColorStop(1,rgba(palette.base2,1));
      ctx.fillStyle=g;ctx.fillRect(0,0,w,h);

      // soft light following the pointer
      const gr=ctx.createRadialGradient(smooth.x,smooth.y,0,smooth.x,smooth.y,260);
      gr.addColorStop(0,rgba(palette.c,.13));
      gr.addColorStop(.45,rgba(palette.b,.035));
      gr.addColorStop(1,rgba(palette.c,0));
      ctx.fillStyle=gr;ctx.fillRect(0,0,w,h);

      // star lattice
      const step=132;
      const scroll=0;
      const R=150;
      ctx.lineWidth=.9;
      const rowH=step*.86;
      let rows=Math.ceil(h/rowH)+3;
      if(rows%2)rows++;
      const total=rows*rowH;
      const cols=Math.ceil(w/step)+3;
      for(let j=0;j<rows;j++){
        for(let i=-1;i<cols;i++){
          const cx=i*step+(j&1?step/2:0)-step/2+8;
          const cy=(((j*rowH-scroll)%total)+total)%total-rowH;
          const dx=cx-smooth.x,dy=cy-smooth.y;
          const d=Math.sqrt(dx*dx+dy*dy);
          let infl=Math.exp(-(d*d)/(R*R));
          for(const rp of ripples){
            const age=(now-rp.t0)/1100;
            if(age<1){
              const rd=Math.hypot(cx-rp.x,cy-rp.y);
              const front=age*Math.max(w,h)*.55;
              infl+=Math.exp(-Math.pow((rd-front)/46,2))*(1-age)*.6;
            }
          }
          infl=Math.min(infl,1.2);
          const wob=reduced?0:Math.sin(t*.6+i*.7+j*.9)*.05;
          const rad=9+infl*(8+hoverBoost*2)+wob*3;
          const rot=wob+infl*Math.PI/6;
          const hueMix=((Math.sin(i*1.7+j*2.3)+1)/2);
          const hot=hueMix<.34?palette.a:hueMix<.68?palette.b:palette.c;
          const col=mix(palette.line,hot,Math.min(infl*1.4,1));
          ctx.strokeStyle=rgba(col,.055+Math.min(infl,1)*.26);
          octagram(cx,cy,rad,rot);
          if(infl>.08){
            ctx.fillStyle=rgba(hot,Math.min(infl,1)*.07);
            ctx.beginPath();ctx.arc(cx,cy,rad*.34,0,Math.PI*2);ctx.fill();
          }else{
            
          }
        }
      }

      // ripples (expanding octagon outlines)
      for(let k=ripples.length-1;k>=0;k--){
        const rp=ripples[k];
        const age=(now-rp.t0)/1100;
        if(age>=1){ripples.splice(k,1);continue;}
        ctx.strokeStyle=rgba(palette.c,(1-age)*.3);
        ctx.lineWidth=2;
        octagram(rp.x,rp.y,20+age*Math.max(w,h)*.55,age*1.2);
        ctx.lineWidth=1.1;
      }

      // sparks (little diamonds)
      for(let k=sparks.length-1;k>=0;k--){
        const s=sparks[k];
        s.life++;
        if(s.life>=s.max){sparks.splice(k,1);continue;}
        s.x+=s.vx;s.y+=s.vy;s.vx*=.985;s.vy*=.985;
        const a=1-s.life/s.max;
        ctx.save();
        ctx.translate(s.x,s.y);ctx.rotate(s.life*s.spin);
        ctx.fillStyle=rgba(s.color,a*.45);
        const z=s.size*(.4+a*.6);
        ctx.beginPath();ctx.moveTo(0,-z);ctx.lineTo(z*.6,0);ctx.lineTo(0,z);ctx.lineTo(-z*.6,0);ctx.closePath();ctx.fill();
        ctx.restore();
      }

    };

    resize();
    window.addEventListener('resize',resize);
    window.addEventListener('pointermove',onMove,{passive:true});
    window.addEventListener('pointerdown',onDown,{passive:true});
    document.documentElement.addEventListener('pointerleave',onLeave);
    window.addEventListener('blur',onLeave);
    raf=requestAnimationFrame(frame);

    return()=>{
      cancelAnimationFrame(raf);
      window.removeEventListener('resize',resize);
      window.removeEventListener('pointermove',onMove);
      window.removeEventListener('pointerdown',onDown);
      document.documentElement.removeEventListener('pointerleave',onLeave);
      window.removeEventListener('blur',onLeave);
    };
  },[]);

  return <>
    <canvas ref={canvasRef} className="fx-canvas" aria-hidden="true"/>
  </>;
}
