'use client';
// PATH: src/components/sections/hero.tsx
import { useEffect, useRef, useState } from 'react';
import { Search, Hotel, Utensils, MapPin, Bot, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Land bounding boxes [lonMin, latMin, lonMax, latMax]
const LAND: Array<[number,number,number,number]> = [
  [-25,35,50,72],[-20,-35,55,37],[25,5,145,55],[100,-45,155,10],
  [-140,25,-55,60],[-82,-56,-34,13],[130,30,145,46],[95,-8,141,8],
  [-25,63,-13,66],[-5,48,10,60],[-170,55,-50,75],
];
function isOnLand(lat:number,lon:number):boolean{
  for(const[a,b,c,d]of LAND){if(lon>=a&&lon<=c&&lat>=b&&lat<=d)return true;}
  return false;
}

function GlobeCanvas({isMobile}:{isMobile:boolean}){
  const ref=useRef<HTMLCanvasElement>(null);
  const rot=useRef(0);
  const raf=useRef(0);
  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext('2d');if(!ctx)return;
    const S=isMobile?260:420;
    cv.width=S;cv.height=S;
    const cx=S/2,cy=S/2,R=S*0.44;
    const N=2000,PHI=Math.PI*(3-Math.sqrt(5));
    const dots=[];
    for(let i=0;i<N;i++){
      const y=1-(i/(N-1))*2,r=Math.sqrt(1-y*y),th=PHI*i;
      const x=Math.cos(th)*r,z=Math.sin(th)*r;
      const lat=Math.asin(y)*180/Math.PI,lon=Math.atan2(z,x)*180/Math.PI;
      dots.push({lat,lon,land:isOnLand(lat,lon)});
    }
    function draw(){
      ctx.clearRect(0,0,S,S);
      const g=ctx.createRadialGradient(cx,cy,R*.8,cx,cy,R*1.08);
      g.addColorStop(0,'rgba(201,162,39,0.07)');g.addColorStop(1,'rgba(201,162,39,0)');
      ctx.beginPath();ctx.arc(cx,cy,R*1.08,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
      for(let lat=-60;lat<=60;lat+=30){
        const lr=(lat*Math.PI)/180,rl=R*Math.cos(lr),yl=cy+R*Math.sin(lr);
        if(rl<3)continue;
        ctx.beginPath();ctx.ellipse(cx,yl,rl,rl*.17,0,0,Math.PI*2);
        ctx.strokeStyle='rgba(201,162,39,0.06)';ctx.lineWidth=.5;ctx.stroke();
      }
      for(const d of dots){
        const lr=(d.lat*Math.PI)/180,lo=((d.lon+rot.current)*Math.PI)/180;
        const x=Math.cos(lr)*Math.cos(lo),y=Math.sin(lr),z=Math.cos(lr)*Math.sin(lo);
        if(z<0)continue;
        const px=cx+R*x,py=cy-R*y,dp=(z+1)/2;
        ctx.beginPath();
        if(d.land){ctx.arc(px,py,1.4,0,Math.PI*2);ctx.fillStyle=`rgba(201,162,39,${(.3+dp*.7).toFixed(2)})`;}
        else{ctx.arc(px,py,.7,0,Math.PI*2);ctx.fillStyle=`rgba(242,238,230,${(.01+dp*.05).toFixed(3)})`;}
        ctx.fill();
      }
      ctx.beginPath();ctx.ellipse(cx,cy,R,R*.17,0,0,Math.PI*2);
      ctx.strokeStyle='rgba(201,162,39,0.1)';ctx.lineWidth=.6;ctx.stroke();
      ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);
      ctx.strokeStyle='rgba(201,162,39,0.1)';ctx.lineWidth=.8;ctx.stroke();
      rot.current+=0.25;
      raf.current=requestAnimationFrame(draw);
    }
    raf.current=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(raf.current);
  },[isMobile]);
  return(
    <canvas ref={ref} style={isMobile
      ?{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',opacity:.15,pointerEvents:'none',zIndex:0}
      :{display:'block',zIndex:1}}
    />
  );
}

function StarCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext('2d');if(!ctx)return;
    const resize=()=>{cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;};
    resize();window.addEventListener('resize',resize);
    const stars=Array.from({length:160},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.1+.3,a:Math.random(),s:Math.random()*.004+.001,d:Math.random()>.5?1:-1}));
    let raf=0;
    const draw=()=>{
      ctx.clearRect(0,0,cv.width,cv.height);
      for(const s of stars){s.a+=s.s*s.d;if(s.a>1||s.a<.1)s.d*=-1;ctx.beginPath();ctx.arc(s.x*cv.width,s.y*cv.height,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(201,162,39,${s.a.toFixed(2)})`;ctx.fill();}
      raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);};
  },[]);
  return<canvas ref={ref} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}/>;
}

const TABS=[
  {id:'hotels',     label:'Hotels',      Icon:Hotel,    href:'/hotels'},
  {id:'attractions',label:'Attractions', Icon:MapPin,   href:'/attractions'},
  {id:'restaurants',label:'Restaurants', Icon:Utensils, href:'/restaurants'},
  {id:'ai',         label:'Ask AI',      Icon:Bot,      href:'/ai-assistant'},
];
const STATS=[
  {num:'180+',label:'Countries'},
  {num:'50K+',label:'Properties'},
  {num:'2M+', label:'Travelers'},
  {num:'π',   label:'Native Payments'},
];

export function HeroSection({locale}:{locale:string}){
  const[tab,setTab]=useState('hotels');
  const[query,setQuery]=useState('');
  const[mobile,setMobile]=useState(false);
  useEffect(()=>{
    const check=()=>setMobile(window.innerWidth<768);
    check();window.addEventListener('resize',check);return()=>window.removeEventListener('resize',check);
  },[]);
  const cur=TABS.find(t=>t.id===tab)!;
  return(
    <section style={{position:'relative',minHeight:'100vh',background:'var(--vg-bg)',display:'flex',alignItems:'center',overflow:'hidden',paddingTop:'64px',direction:'ltr'}}>
      <StarCanvas/>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 70% 60% at 55% 50%, transparent 25%, var(--vg-bg) 80%)',pointerEvents:'none'}}/>
      {mobile&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}><GlobeCanvas isMobile/></div>}
      <div style={{position:'relative',zIndex:2,width:'100%',maxWidth:'1280px',margin:'0 auto',padding:'clamp(2rem,6vw,5rem) clamp(1.25rem,5vw,4rem)',display:'grid',gridTemplateColumns:mobile?'1fr':'1fr auto',gap:mobile?'2.5rem':'4rem',alignItems:'center'}}>
        {/* Left */}
        <div>
          <div className="vg-overline" style={{marginBottom:'1.5rem'}}>Void Gold Travel Intelligence</div>
          <h1 className="vg-display" style={{fontSize:'clamp(2.8rem,8vw,6rem)',marginBottom:'1.4rem',lineHeight:.92}}>
            The World<br/><em className="vg-italic">Awaits</em> You
          </h1>
          <p style={{fontFamily:'var(--font-dm-sans)',fontSize:'clamp(.82rem,1.8vw,.95rem)',color:'var(--vg-text-2)',lineHeight:1.75,maxWidth:'440px',marginBottom:'2.5rem'}}>
            Discover extraordinary destinations. Book with Pi. Curated experiences powered by AI for the discerning traveller.
          </p>

          {/* Search box */}
          <div style={{background:'var(--vg-bg-card)',border:'1px solid var(--vg-border)',marginBottom:'2.5rem',direction:'ltr'}}>
            <div style={{display:'flex',borderBottom:'1px solid var(--vg-border)'}}>
              {TABS.map(({id,label,Icon})=>{
                const active=tab===id;
                return(
                  <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:'.7rem .3rem',background:active?'var(--vg-gold-dim)':'none',border:'none',borderBottom:active?'2px solid var(--vg-gold)':'2px solid transparent',cursor:'pointer',color:active?'var(--vg-gold)':'var(--vg-text-3)',fontFamily:'var(--font-space-mono)',fontSize:'.42rem',letterSpacing:'.14em',textTransform:'uppercase',display:'flex',flexDirection:'column',alignItems:'center',gap:'.3rem',transition:'all .25s'}}>
                    <Icon size={13}/>
                    {!mobile&&<span>{label}</span>}
                  </button>
                );
              })}
            </div>
            <div style={{display:'flex',direction:'ltr'}}>
              <div style={{flex:1,display:'flex',alignItems:'center',gap:'.7rem',padding:'.9rem 1.1rem'}}>
                <Search size={14} color="var(--vg-text-3)"/>
                <input type="text" value={query} onChange={e=>setQuery(e.target.value)}
                  placeholder={`Search ${cur.label.toLowerCase()}…`}
                  style={{flex:1,background:'none',border:'none',outline:'none',fontFamily:'var(--font-dm-sans)',fontSize:'.88rem',color:'var(--vg-text)'}}/>
              </div>
              <Link href={`/${locale}${cur.href}${query?`?q=${encodeURIComponent(query)}`:''}`} className="vg-btn-primary"
                style={{textDecoration:'none',borderLeft:'1px solid var(--vg-gold-border)',display:'flex',alignItems:'center',gap:'.45rem',padding:'.9rem 1.1rem'}}>
                <ArrowRight size={14}/>
                {!mobile&&<span>Search</span>}
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',direction:'ltr'}}>
            {STATS.map(s=>(
              <div key={s.label}>
                <div className="vg-stat-num" style={{fontSize:'clamp(1.4rem,3vw,2.4rem)'}}>{s.num}</div>
                <div className="vg-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — globe desktop */}
        {!mobile&&<div style={{display:'flex',alignItems:'center',justifyContent:'center'}}><GlobeCanvas isMobile={false}/></div>}
      </div>
    </section>
  );
}
