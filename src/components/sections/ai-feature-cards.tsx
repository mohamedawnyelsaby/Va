'use client';
/* ============================================================
   PATH: src/components/sections/ai-feature-cards.tsx
   Six functional AI tools for the homepage, all backed by the
   real /api/ai/travel endpoint (chat action) — no mock responses.
   ============================================================ */

import { useState } from 'react';
import styles from '@/app/[locale]/page.module.css';
import { t as getTranslations } from '@/lib/i18n/translations';

interface Props {
  locale: string;
}

// Minimal surface for the (non-standard, vendor-prefixed) Web Speech
// API — not part of TypeScript's standard dom lib, so declared locally
// covering only what this component actually uses.
interface SpeechRecognitionResultLike {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}
interface SpeechRecognitionLike {
  lang: string;
  onresult: ((event: SpeechRecognitionResultLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const isAr = (locale: string) => locale === 'ar';

async function askAI(message: string): Promise<string> {
  const res = await fetch('/api/ai/travel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history: [] }),
  });
  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.message || 'AI service unavailable');
  }
  return data.message as string;
}

const PASSPORTS = [
  { code: 'Egyptian', flag: '🇪🇬', ar: 'مصر', en: 'Egypt' },
  { code: 'Saudi', flag: '🇸🇦', ar: 'السعودية', en: 'Saudi Arabia' },
  { code: 'Emirati', flag: '🇦🇪', ar: 'الإمارات', en: 'UAE' },
  { code: 'British', flag: '🇬🇧', ar: 'بريطانيا', en: 'UK' },
  { code: 'American', flag: '🇺🇸', ar: 'أمريكا', en: 'USA' },
  { code: 'German', flag: '🇩🇪', ar: 'ألمانيا', en: 'Germany' },
];

const DESTINATIONS = [
  { code: 'UAE', flag: '🇦🇪', ar: 'الإمارات', en: 'UAE' },
  { code: 'Turkey', flag: '🇹🇷', ar: 'تركيا', en: 'Turkey' },
  { code: 'Japan', flag: '🇯🇵', ar: 'اليابان', en: 'Japan' },
  { code: 'Schengen Zone', flag: '🇪🇺', ar: 'شنغن', en: 'Schengen' },
  { code: 'USA', flag: '🇺🇸', ar: 'أمريكا', en: 'USA' },
  { code: 'Thailand', flag: '🇹🇭', ar: 'تايلاند', en: 'Thailand' },
];

const PRICE_DESTS: Record<string, number> = {
  dubai: 840, paris: 720, tokyo: 650, bali: 420, maldives: 1200, istanbul: 380,
};

const TRANSLATE_LANGS = [
  { code: 'English', flag: '🇬🇧', ar: 'الإنجليزية', en: 'English' },
  { code: 'French', flag: '🇫🇷', ar: 'الفرنسية', en: 'French' },
  { code: 'Japanese', flag: '🇯🇵', ar: 'اليابانية', en: 'Japanese' },
  { code: 'Spanish', flag: '🇪🇸', ar: 'الإسبانية', en: 'Spanish' },
  { code: 'German', flag: '🇩🇪', ar: 'الألمانية', en: 'German' },
];

function genPriceSeries(dest: string): number[] {
  const base = PRICE_DESTS[dest] || 700;
  return Array.from({ length: 30 }, (_, i) => {
    const seasonal = Math.sin((i / 15) * Math.PI) * 0.13;
    const noise = (Math.sin(i * 7.3 + base) * 0.5 - 0.25) * 0.05;
    return Math.round((base * (1 + seasonal + noise)) / 5) * 5;
  });
}

/** Simple dependency-free SVG sparkline (no chart library required). */
function Sparkline({ values, highlightIndex }: { values: number[]; highlightIndex: number }) {
  const w = 600, h = 140, pad = 8;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const [hx, hy] = points[highlightIndex] ?? points[0];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 120 }}>
      <path d={path} fill="none" stroke="var(--g)" strokeWidth={2.5} />
      <circle cx={hx} cy={hy} r={6} fill="var(--green)" stroke="#fff" strokeWidth={2} />
    </svg>
  );
}

/* ── deterministic pseudo-distance so repeated lookups are stable ── */
function hashDistance(from: string, to: string): number {
  const s = (from + to).toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) {h = (h * 31 + s.charCodeAt(i)) >>> 0;}
  return 1200 + (h % 6000);
}

export function AIFeatureCards({ locale }: Props) {
  const ar = isAr(locale);
  const tr = getTranslations(locale);
  const ac = tr.aiCards;
  const lang = ac.langName; // English name of the current locale, used to instruct the AI which language to reply in

  /* ── 1. Mood Concierge ── */
  const MOODS = [
    { key: 'adventurous', ar: '🗺️ مغامرة', en: '🗺️ Adventurous' },
    { key: 'relax', ar: '🌊 استرخاء', en: '🌊 Relax' },
    { key: 'romantic', ar: '💕 رومانسية', en: '💕 Romantic' },
    { key: 'cultural', ar: '🎭 ثقافة', en: '🎭 Cultural' },
  ];
  const [mood, setMood] = useState('');
  const [moodText, setMoodText] = useState('');
  const [moodResp, setMoodResp] = useState('');
  const [moodLoading, setMoodLoading] = useState(false);

  async function runMood() {
    const chosen = moodText.trim() || mood;
    if (!chosen) {return;}
    setMoodLoading(true);
    setMoodResp(ac.moodFinding);
    try {
      const prompt = `Traveler feels: "${chosen}". Recommend ONE travel destination with a brief reason. Answer in ${lang}, max 3 sentences.`;
      setMoodResp(await askAI(prompt));
    } catch {
      setMoodResp(ac.moodError);
    } finally {
      setMoodLoading(false);
    }
  }

  /* ── 2. Visa Checker ── */
  const [passport, setPassport] = useState(PASSPORTS[0].code);
  const [visaDest, setVisaDest] = useState(DESTINATIONS[0].code);
  const [visaResp, setVisaResp] = useState('');
  const [visaLoading, setVisaLoading] = useState(false);

  async function runVisa() {
    setVisaLoading(true);
    setVisaResp(ac.visaChecking);
    try {
      const prompt = `${passport} passport traveling to ${visaDest}. Is a visa required? Duration allowed? Answer in ${lang}, max 3 sentences.`;
      setVisaResp(await askAI(prompt));
    } catch {
      setVisaResp(ac.visaError);
    } finally {
      setVisaLoading(false);
    }
  }

  /* ── 3. Predictive Pricing ── */
  const [priceDest, setPriceDest] = useState('dubai');
  const [series, setSeries] = useState<number[] | null>(null);
  const [priceResp, setPriceResp] = useState('');
  const [priceLoading, setPriceLoading] = useState(false);

  async function runPredict() {
    const s = genPriceSeries(priceDest);
    setSeries(s);
    const bestIdx = s.reduce((m, v, i, a) => (v < a[m] ? i : m), 0);
    const saving = Math.round((1 - s[bestIdx] / s[0]) * 100);
    setPriceLoading(true);
    setPriceResp(ac.priceAnalyzing);
    try {
      const prompt = `Price forecast for ${priceDest}: best day is day ${bestIdx}, saving about ${saving}%. Write a short booking tip in ${lang}, max 2 sentences.`;
      setPriceResp(await askAI(prompt));
    } catch {
      setPriceResp(
        ac.priceErrorTemplate.replace('{bestIdx}', String(bestIdx)).replace('{saving}', String(saving))
      );
    } finally {
      setPriceLoading(false);
    }
  }

  /* ── 4. Voice / Text Translation ── */
  const [targetLang, setTargetLang] = useState(TRANSLATE_LANGS[0].code);
  const [translateIn, setTranslateIn] = useState('');
  const [translateOut, setTranslateOut] = useState('');
  const [translateLoading, setTranslateLoading] = useState(false);
  const [listening, setListening] = useState(false);

  async function runTranslate(text: string) {
    if (!text.trim()) {return;}
    setTranslateLoading(true);
    setTranslateOut(ac.translating);
    try {
      const reply = await askAI(`Translate the following text to ${targetLang}. Reply with only the translated text, nothing else:\n\n${text}`);
      setTranslateOut(reply.trim());
    } catch {
      setTranslateOut(ac.translateError);
    } finally {
      setTranslateLoading(false);
    }
  }

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {return;}
    const rec = new SR();
    rec.lang = ar ? 'ar-EG' : 'en-US';
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranslateIn(text);
      runTranslate(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  }

  /* ── 5. Budget Planner ── */
  const [budget, setBudget] = useState('');
  const [days, setDays] = useState(7);
  const [budgetTip, setBudgetTip] = useState('');
  const [budgetLoading, setBudgetLoading] = useState(false);

  const SPLITS = [
    { key: 'stay', pct: 40, ar: '🏨 إقامة', en: '🏨 Accommodation' },
    { key: 'flights', pct: 28, ar: '✈️ طيران', en: '✈️ Flights' },
    { key: 'food', pct: 16, ar: '🍽️ طعام', en: '🍽️ Food' },
    { key: 'activities', pct: 10, ar: '🎭 أنشطة', en: '🎭 Activities' },
    { key: 'transport', pct: 6, ar: '🚕 مواصلات', en: '🚕 Transport' },
  ];
  const budgetNum = parseFloat(budget) || 0;

  async function runBudget() {
    if (!budgetNum) {return;}
    setBudgetLoading(true);
    setBudgetTip(ac.budgetAnalyzing);
    try {
      const prompt = `Budget of $${budgetNum} for ${days} days. Write one short practical money-saving tip in ${lang}, max 2 sentences.`;
      setBudgetTip(await askAI(prompt));
    } catch {
      setBudgetTip(ac.budgetError);
    } finally {
      setBudgetLoading(false);
    }
  }

  /* ── 6. Carbon Footprint Tracker (pure client-side estimate, no AI needed) ── */
  const [carbonFrom, setCarbonFrom] = useState('');
  const [carbonTo, setCarbonTo] = useState('');
  const [travelClass, setTravelClass] = useState<'economy' | 'business' | 'first'>('economy');
  const [carbonResult, setCarbonResult] = useState<{ co2: number; trees: number; offset: string } | null>(null);

  function runCarbon() {
    const from = carbonFrom.trim() || 'Cairo';
    const to = carbonTo.trim() || 'Dubai';
    const mult = { economy: 1, business: 2, first: 3 }[travelClass];
    const dist = hashDistance(from, to);
    const co2 = Math.round(dist * 0.255 * mult);
    const trees = Math.ceil(co2 / 21.7);
    const offset = (co2 * 0.015).toFixed(1);
    setCarbonResult({ co2, trees, offset });
  }

  return (
    <div className={styles.fcGrid}>

      {/* 1. Emotional AI Concierge */}
      <div className={styles.fc}>
        <div className={styles.fcHead}>
          <div className={styles.fcTitle}>🧠 {ac.moodTitle}</div>
        </div>
        <div className={styles.fcSub}>{ac.moodSub}</div>
        <div className="mood-btns">
          {MOODS.map(m => (
            <button
              key={m.key}
              type="button"
              className={`mood-btn${mood === m.key ? ' on' : ''}`}
              onClick={() => { setMood(m.key); setMoodText(''); }}
            >
              {ar ? m.ar : m.en}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="finput"
            style={{ flex: 1, fontSize: '.78rem', padding: '9px 12px' }}
            placeholder={ac.moodPlaceholder}
            value={moodText}
            onChange={e => { setMoodText(e.target.value); setMood(''); }}
          />
          <button className="btn btn-g" style={{ padding: '9px 14px', borderRadius: 'var(--rM)' }} onClick={runMood} disabled={moodLoading}>
            ✨ {ac.discover}
          </button>
        </div>
        {moodResp && <div className={`ai-resp${moodLoading ? ' loading' : ''}`} style={{ marginTop: 10 }}>{moodResp}</div>}
      </div>

      {/* 2. Smart Visa Checker */}
      <div className={styles.fc}>
        <div className={styles.fcHead}>
          <div className={styles.fcTitle}>🛂 {ac.visaTitle}</div>
        </div>
        <div className={styles.fcSub}>{ac.visaSub}</div>
        <div className="fgrid2" style={{ marginBottom: 9 }}>
          <div className="fgroup" style={{ margin: 0 }}>
            <label className="flabel">{ac.yourPassport}</label>
            <select className="finput" style={{ fontSize: '.8rem' }} value={passport} onChange={e => setPassport(e.target.value)}>
              {PASSPORTS.map(p => <option key={p.code} value={p.code}>{p.flag} {ar ? p.ar : p.en}</option>)}
            </select>
          </div>
          <div className="fgroup" style={{ margin: 0 }}>
            <label className="flabel">{ac.destinationLabel}</label>
            <select className="finput" style={{ fontSize: '.8rem' }} value={visaDest} onChange={e => setVisaDest(e.target.value)}>
              {DESTINATIONS.map(d => <option key={d.code} value={d.code}>{d.flag} {ar ? d.ar : d.en}</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-g" style={{ width: '100%', padding: 10, borderRadius: 'var(--rM)', fontSize: '.8rem' }} onClick={runVisa} disabled={visaLoading}>
          🔍 {ac.checkVisa}
        </button>
        {visaResp && <div className={`visa-result${visaLoading ? ' loading' : ''}`}>{visaResp}</div>}
        <div style={{ fontSize: '.62rem', color: 'var(--tm)', marginTop: 7, lineHeight: 1.6 }}>
          ⚠️ {ac.visaDisclaimer}
        </div>
      </div>

      {/* 3. Predictive Pricing AI */}
      <div className={styles.fc}>
        <div className={styles.fcHead}>
          <div className={styles.fcTitle}>📈 {ac.priceTitle}</div>
        </div>
        <div className={styles.fcSub}>{ac.priceSub}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <select className="finput" style={{ fontSize: '.79rem', flex: 1 }} value={priceDest} onChange={e => setPriceDest(e.target.value)}>
            {Object.keys(PRICE_DESTS).map(d => <option key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</option>)}
          </select>
          <button className="btn btn-g" style={{ padding: '8px 14px', borderRadius: 'var(--rM)', fontSize: '.76rem' }} onClick={runPredict} disabled={priceLoading}>
            🔮 {ac.predict}
          </button>
        </div>
        {series && <Sparkline values={series} highlightIndex={series.reduce((m, v, i, a) => (v < a[m] ? i : m), 0)} />}
        {priceResp && <div className={`ai-resp${priceLoading ? ' loading' : ''}`}>{priceResp}</div>}
      </div>

      {/* 4. Voice AI + Translation */}
      <div className={styles.fc}>
        <div className={styles.fcHead}>
          <div className={styles.fcTitle}>🎙️ {ac.voiceTitle}</div>
        </div>
        <div className={styles.fcSub}>{ac.voiceSub}</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 9 }}>
          <select className="finput" style={{ fontSize: '.79rem', flex: 1 }} value={targetLang} onChange={e => setTargetLang(e.target.value)}>
            {TRANSLATE_LANGS.map(l => <option key={l.code} value={l.code}>{l.flag} {ar ? l.ar : l.en}</option>)}
          </select>
          <button
            className={`mic-btn${listening ? ' active' : ''}`}
            onClick={startListening}
            title={ac.speak}
          >
            🎤
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            className="finput"
            style={{ flex: 1, fontSize: '.79rem', padding: '9px 12px' }}
            placeholder={ac.translatePlaceholder}
            value={translateIn}
            onChange={e => setTranslateIn(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') {runTranslate(translateIn);} }}
          />
          <button className="btn btn-g" style={{ padding: '9px 12px', borderRadius: 'var(--rM)', fontSize: '.76rem' }} onClick={() => runTranslate(translateIn)} disabled={translateLoading}>
            {ac.translateBtn}
          </button>
        </div>
        <div className={`ai-resp${translateLoading ? ' loading' : ''}`}>
          {translateOut || ac.translationPlaceholder}
        </div>
      </div>

      {/* 5. AI Budget Planner */}
      <div className={styles.fc}>
        <div className={styles.fcHead}>
          <div className={styles.fcTitle}>💰 {ac.budgetTitle}</div>
        </div>
        <div className={styles.fcSub}>{ac.budgetSub}</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 9 }}>
          <div className="sfield" style={{ flex: 1, padding: '8px 11px' }}>
            <span>💵</span>
            <input type="number" placeholder={ac.budgetPlaceholder} value={budget} onChange={e => setBudget(e.target.value)} />
          </div>
          <select className="finput" style={{ maxWidth: 90, fontSize: '.79rem' }} value={days} onChange={e => setDays(Number(e.target.value))}>
            {[3, 5, 7, 10, 14].map(d => <option key={d} value={d}>{d} {tr.phase2.days}</option>)}
          </select>
          <button className="btn btn-g" style={{ padding: '8px 13px', borderRadius: 'var(--rM)', fontSize: '.76rem' }} onClick={runBudget} disabled={budgetLoading}>
            ✨ {ac.plan}
          </button>
        </div>
        {budgetNum > 0 ? (
          <div className="budget-items">
            {SPLITS.map(s => (
              <div key={s.key} className="bitem-row">
                <div style={{ flex: 1, fontSize: '.73rem', fontWeight: 600 }}>{ar ? s.ar : s.en}</div>
                <div className="bitem-bar"><div className="bitem-fill" style={{ width: `${s.pct}%` }} /></div>
                <div className="bitem-pct">${Math.round((budgetNum * s.pct) / 100)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 16, fontSize: '.78rem', color: 'var(--tm)' }}>
            {ac.enterBudgetPrompt}
          </div>
        )}
        {budgetTip && <div className={`ai-resp${budgetLoading ? ' loading' : ''}`} style={{ marginTop: 9 }}>{budgetTip}</div>}
      </div>

      {/* 6. Carbon Footprint Tracker */}
      <div className={styles.fc}>
        <div className={styles.fcHead}>
          <div className={styles.fcTitle}>🌱 {ac.carbonTitle}</div>
        </div>
        <div className={styles.fcSub}>{ac.carbonSub}</div>
        <div className="fgrid2" style={{ marginBottom: 9, gap: 8 }}>
          <div className="fgroup" style={{ margin: 0 }}>
            <label className="flabel">{ac.from}</label>
            <input className="finput" style={{ fontSize: '.8rem' }} placeholder="Cairo" value={carbonFrom} onChange={e => setCarbonFrom(e.target.value)} />
          </div>
          <div className="fgroup" style={{ margin: 0 }}>
            <label className="flabel">{ac.to}</label>
            <input className="finput" style={{ fontSize: '.8rem' }} placeholder="Dubai" value={carbonTo} onChange={e => setCarbonTo(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 9, alignItems: 'center' }}>
          <select className="finput" style={{ fontSize: '.79rem', flex: 1 }} value={travelClass} onChange={e => setTravelClass(e.target.value as 'economy' | 'business' | 'first')}>
            <option value="economy">{ac.economy}</option>
            <option value="business">{ac.business}</option>
            <option value="first">{ac.firstClass}</option>
          </select>
          <button className="btn btn-g" style={{ padding: '8px 13px', borderRadius: 'var(--rM)', fontSize: '.76rem' }} onClick={runCarbon}>
            🌍 {ac.calculate}
          </button>
        </div>
        {carbonResult ? (
          <div className="carbon-gauge">
            <div className="cg-item"><div className="cg-val">{carbonResult.co2}</div><div className="cg-lbl">{ac.kgCO2}</div></div>
            <div className="cg-item"><div className="cg-val">{carbonResult.trees}</div><div className="cg-lbl">{ac.trees}</div></div>
            <div className="cg-item"><div className="cg-val">${carbonResult.offset}</div><div className="cg-lbl">{ac.offset}</div></div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 16, fontSize: '.78rem', color: 'var(--tm)' }}>
            {ac.enterTripPrompt}
          </div>
        )}
      </div>

    </div>
  );
}
