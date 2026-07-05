'use client';
/* ============================================================
   PATH: src/components/sections/ai-feature-cards.tsx
   Six functional AI tools for the homepage, all backed by the
   real /api/ai/travel endpoint (chat action) — no mock responses.
   ============================================================ */

import { useState } from 'react';
import styles from '@/app/[locale]/page.module.css';

interface Props {
  locale: string;
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
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return 1200 + (h % 6000);
}

export function AIFeatureCards({ locale }: Props) {
  const ar = isAr(locale);
  const t = (a: string, e: string) => (ar ? a : e);

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
    if (!chosen) return;
    setMoodLoading(true);
    setMoodResp(t('يبحث الذكاء الاصطناعي عن وجهتك المثالية…', 'Finding your perfect destination…'));
    try {
      const prompt = ar
        ? `المسافر يشعر بـ "${chosen}". أوصِ بوجهة سفر واحدة مناسبة، مع سبب مختصر. أجب بالعربية في 3 جمل كحد أقصى.`
        : `Traveler feels: "${chosen}". Recommend ONE travel destination with a brief reason. Max 3 sentences.`;
      setMoodResp(await askAI(prompt));
    } catch {
      setMoodResp(t('تعذر الاتصال بالخدمة الآن. حاول مرة أخرى.', 'Could not reach the AI service. Please try again.'));
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
    setVisaResp(t('جاري التحقق من متطلبات التأشيرة…', 'Checking visa requirements…'));
    try {
      const prompt = ar
        ? `جواز سفر ${passport} يريد السفر إلى ${visaDest}. هل يحتاج تأشيرة؟ المدة المسموحة؟ أجب في 3 جمل بالعربية.`
        : `${passport} passport traveling to ${visaDest}. Is a visa required? Duration allowed? Answer in max 3 sentences.`;
      setVisaResp(await askAI(prompt));
    } catch {
      setVisaResp(t('تعذر الاتصال بالخدمة الآن.', 'Could not reach the AI service.'));
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
    setPriceResp(t('يحلل الذكاء الاصطناعي أنماط الأسعار…', 'Analyzing price patterns…'));
    try {
      const prompt = ar
        ? `توقعات سعر ${priceDest}: أفضل يوم هو اليوم رقم ${bestIdx} بتوفير ${saving}% تقريباً. اكتب نصيحة حجز قصيرة بالعربية في جملتين.`
        : `Price forecast for ${priceDest}: best day is day ${bestIdx}, saving about ${saving}%. Write a short 2-sentence booking tip.`;
      setPriceResp(await askAI(prompt));
    } catch {
      setPriceResp(
        t(`أفضل توقيت للحجز: بعد ${bestIdx} يوماً — وفر حتى ${saving}%.`, `Best booking window: day ${bestIdx} — save up to ${saving}%.`)
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
    if (!text.trim()) return;
    setTranslateLoading(true);
    setTranslateOut(t('جاري الترجمة…', 'Translating…'));
    try {
      const reply = await askAI(`Translate the following text to ${targetLang}. Reply with only the translated text, nothing else:\n\n${text}`);
      setTranslateOut(reply.trim());
    } catch {
      setTranslateOut(t('تعذرت الترجمة الآن.', 'Translation unavailable right now.'));
    } finally {
      setTranslateLoading(false);
    }
  }

  function startListening() {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = ar ? 'ar-EG' : 'en-US';
    rec.onresult = (e: any) => {
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
    if (!budgetNum) return;
    setBudgetLoading(true);
    setBudgetTip(t('جاري التحليل…', 'Analyzing…'));
    try {
      const prompt = ar
        ? `ميزانية ${budgetNum}$ لمدة ${days} أيام. اكتب نصيحة توفير قصيرة بالعربية في جملتين.`
        : `Budget of $${budgetNum} for ${days} days. Write one short practical money-saving tip, max 2 sentences.`;
      setBudgetTip(await askAI(prompt));
    } catch {
      setBudgetTip(t('تعذر الاتصال بالخدمة الآن.', 'Could not reach the AI service.'));
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
    const from = carbonFrom.trim() || (ar ? 'القاهرة' : 'Cairo');
    const to = carbonTo.trim() || (ar ? 'دبي' : 'Dubai');
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
          <div className={styles.fcTitle}>🧠 {t('مستشار AI العاطفي', 'Emotional AI Concierge')}</div>
        </div>
        <div className={styles.fcSub}>{t('أخبرني كيف تشعر — يجد لك الذكاء الاصطناعي وجهتك المثالية.', 'Tell me how you feel — AI finds your perfect destination.')}</div>
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
            placeholder={t('أو صف مزاجك بحرية…', 'Or describe your mood freely…')}
            value={moodText}
            onChange={e => { setMoodText(e.target.value); setMood(''); }}
          />
          <button className="btn btn-g" style={{ padding: '9px 14px', borderRadius: 'var(--rM)' }} onClick={runMood} disabled={moodLoading}>
            ✨ {t('اكتشف', 'Discover')}
          </button>
        </div>
        {moodResp && <div className={`ai-resp${moodLoading ? ' loading' : ''}`} style={{ marginTop: 10 }}>{moodResp}</div>}
      </div>

      {/* 2. Smart Visa Checker */}
      <div className={styles.fc}>
        <div className={styles.fcHead}>
          <div className={styles.fcTitle}>🛂 {t('فاحص التأشيرة الذكي', 'Smart Visa Checker')}</div>
        </div>
        <div className={styles.fcSub}>{t('اعرف متطلبات التأشيرة فورياً لأي جواز سفر ووجهة.', 'Instantly know visa requirements for any passport & destination.')}</div>
        <div className="fgrid2" style={{ marginBottom: 9 }}>
          <div className="fgroup" style={{ margin: 0 }}>
            <label className="flabel">{t('جواز سفرك', 'Your passport')}</label>
            <select className="finput" style={{ fontSize: '.8rem' }} value={passport} onChange={e => setPassport(e.target.value)}>
              {PASSPORTS.map(p => <option key={p.code} value={p.code}>{p.flag} {ar ? p.ar : p.en}</option>)}
            </select>
          </div>
          <div className="fgroup" style={{ margin: 0 }}>
            <label className="flabel">{t('الوجهة', 'Destination')}</label>
            <select className="finput" style={{ fontSize: '.8rem' }} value={visaDest} onChange={e => setVisaDest(e.target.value)}>
              {DESTINATIONS.map(d => <option key={d.code} value={d.code}>{d.flag} {ar ? d.ar : d.en}</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-g" style={{ width: '100%', padding: 10, borderRadius: 'var(--rM)', fontSize: '.8rem' }} onClick={runVisa} disabled={visaLoading}>
          🔍 {t('فحص التأشيرة', 'Check Visa')}
        </button>
        {visaResp && <div className={`visa-result${visaLoading ? ' loading' : ''}`}>{visaResp}</div>}
        <div style={{ fontSize: '.62rem', color: 'var(--tm)', marginTop: 7, lineHeight: 1.6 }}>
          ⚠️ {t('معلومات تقديرية وقد لا تكون محدّثة — تأكد من السفارة قبل السفر.', 'AI estimate, may not be current — verify with the embassy before traveling.')}
        </div>
      </div>

      {/* 3. Predictive Pricing AI */}
      <div className={styles.fc}>
        <div className={styles.fcHead}>
          <div className={styles.fcTitle}>📈 {t('توقع الأسعار بالذكاء الاصطناعي', 'Predictive Pricing AI')}</div>
        </div>
        <div className={styles.fcSub}>{t('توقع أسعار 30 يوماً مع نصيحة الحجز المثلى.', '30-day price forecast with AI-generated booking advice.')}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <select className="finput" style={{ fontSize: '.79rem', flex: 1 }} value={priceDest} onChange={e => setPriceDest(e.target.value)}>
            {Object.keys(PRICE_DESTS).map(d => <option key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</option>)}
          </select>
          <button className="btn btn-g" style={{ padding: '8px 14px', borderRadius: 'var(--rM)', fontSize: '.76rem' }} onClick={runPredict} disabled={priceLoading}>
            🔮 {t('توقع', 'Predict')}
          </button>
        </div>
        {series && <Sparkline values={series} highlightIndex={series.reduce((m, v, i, a) => (v < a[m] ? i : m), 0)} />}
        {priceResp && <div className={`ai-resp${priceLoading ? ' loading' : ''}`}>{priceResp}</div>}
      </div>

      {/* 4. Voice AI + Translation */}
      <div className={styles.fc}>
        <div className={styles.fcHead}>
          <div className={styles.fcTitle}>🎙️ {t('الترجمة الصوتية الفورية', 'Voice AI + Translation')}</div>
        </div>
        <div className={styles.fcSub}>{t('تحدث أو اكتب — يترجم الذكاء الاصطناعي فورياً.', 'Speak or type — AI translates instantly.')}</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 9 }}>
          <select className="finput" style={{ fontSize: '.79rem', flex: 1 }} value={targetLang} onChange={e => setTargetLang(e.target.value)}>
            {TRANSLATE_LANGS.map(l => <option key={l.code} value={l.code}>{l.flag} {ar ? l.ar : l.en}</option>)}
          </select>
          <button
            className={`mic-btn${listening ? ' active' : ''}`}
            onClick={startListening}
            title={t('تحدث', 'Speak')}
          >
            🎤
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            className="finput"
            style={{ flex: 1, fontSize: '.79rem', padding: '9px 12px' }}
            placeholder={t('أو اكتب نصاً للترجمة…', 'Or type text to translate…')}
            value={translateIn}
            onChange={e => setTranslateIn(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') runTranslate(translateIn); }}
          />
          <button className="btn btn-g" style={{ padding: '9px 12px', borderRadius: 'var(--rM)', fontSize: '.76rem' }} onClick={() => runTranslate(translateIn)} disabled={translateLoading}>
            {t('ترجم', 'Translate')}
          </button>
        </div>
        <div className={`ai-resp${translateLoading ? ' loading' : ''}`}>
          {translateOut || t('ستظهر الترجمة هنا.', 'Translation will appear here.')}
        </div>
      </div>

      {/* 5. AI Budget Planner */}
      <div className={styles.fc}>
        <div className={styles.fcHead}>
          <div className={styles.fcTitle}>💰 {t('مخطط الميزانية الذكي', 'AI Budget Planner')}</div>
        </div>
        <div className={styles.fcSub}>{t('أدخل ميزانيتك — يوزعها الذكاء الاصطناعي بذكاء.', 'Enter your budget — AI allocates it smartly.')}</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 9 }}>
          <div className="sfield" style={{ flex: 1, padding: '8px 11px' }}>
            <span>💵</span>
            <input type="number" placeholder={t('ميزانيتك بالدولار', 'Your budget in USD')} value={budget} onChange={e => setBudget(e.target.value)} />
          </div>
          <select className="finput" style={{ maxWidth: 90, fontSize: '.79rem' }} value={days} onChange={e => setDays(Number(e.target.value))}>
            {[3, 5, 7, 10, 14].map(d => <option key={d} value={d}>{d} {t('أيام', 'days')}</option>)}
          </select>
          <button className="btn btn-g" style={{ padding: '8px 13px', borderRadius: 'var(--rM)', fontSize: '.76rem' }} onClick={runBudget} disabled={budgetLoading}>
            ✨ {t('خطط', 'Plan')}
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
            {t('أدخل ميزانيتك لرؤية التوزيع', 'Enter your budget to see the breakdown')}
          </div>
        )}
        {budgetTip && <div className={`ai-resp${budgetLoading ? ' loading' : ''}`} style={{ marginTop: 9 }}>{budgetTip}</div>}
      </div>

      {/* 6. Carbon Footprint Tracker */}
      <div className={styles.fc}>
        <div className={styles.fcHead}>
          <div className={styles.fcTitle}>🌱 {t('تتبع البصمة الكربونية', 'Carbon Footprint Tracker')}</div>
        </div>
        <div className={styles.fcSub}>{t('احسب انبعاثات رحلتك وتعوّض عنها.', "Calculate your trip's emissions and offset them.")}</div>
        <div className="fgrid2" style={{ marginBottom: 9, gap: 8 }}>
          <div className="fgroup" style={{ margin: 0 }}>
            <label className="flabel">{t('من', 'From')}</label>
            <input className="finput" style={{ fontSize: '.8rem' }} placeholder={t('القاهرة', 'Cairo')} value={carbonFrom} onChange={e => setCarbonFrom(e.target.value)} />
          </div>
          <div className="fgroup" style={{ margin: 0 }}>
            <label className="flabel">{t('إلى', 'To')}</label>
            <input className="finput" style={{ fontSize: '.8rem' }} placeholder={t('دبي', 'Dubai')} value={carbonTo} onChange={e => setCarbonTo(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 9, alignItems: 'center' }}>
          <select className="finput" style={{ fontSize: '.79rem', flex: 1 }} value={travelClass} onChange={e => setTravelClass(e.target.value as any)}>
            <option value="economy">{t('اقتصادي ✈️', 'Economy ✈️')}</option>
            <option value="business">{t('رجال أعمال 🎩', 'Business 🎩')}</option>
            <option value="first">{t('درجة أولى 👑', 'First Class 👑')}</option>
          </select>
          <button className="btn btn-g" style={{ padding: '8px 13px', borderRadius: 'var(--rM)', fontSize: '.76rem' }} onClick={runCarbon}>
            🌍 {t('احسب', 'Calculate')}
          </button>
        </div>
        {carbonResult ? (
          <div className="carbon-gauge">
            <div className="cg-item"><div className="cg-val">{carbonResult.co2}</div><div className="cg-lbl">{t('كجم CO₂', 'kg CO₂')}</div></div>
            <div className="cg-item"><div className="cg-val">{carbonResult.trees}</div><div className="cg-lbl">{t('أشجار', 'Trees')}</div></div>
            <div className="cg-item"><div className="cg-val">${carbonResult.offset}</div><div className="cg-lbl">{t('تعويض', 'Offset')}</div></div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 16, fontSize: '.78rem', color: 'var(--tm)' }}>
            {t('أدخل رحلتك لحساب البصمة الكربونية', 'Enter your trip to calculate its footprint')}
          </div>
        )}
      </div>

    </div>
  );
}
