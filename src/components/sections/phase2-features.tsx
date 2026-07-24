'use client';
/* ============================================================
   PATH: src/components/sections/phase2-features.tsx
   Phase 2 features: AI Packing List, Destination Compare,
   Group Trip Planner, Smart Price Calendar.
   ============================================================ */

import { useState } from 'react';
import styles from '@/app/[locale]/page.module.css';
import { t as getTranslations } from '@/lib/i18n/translations';

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
  if (!res.ok || data.error) throw new Error(data.message || 'AI service unavailable');
  return data.message as string;
}

/* ── shared destination reference data (compare + calendar) ── */
const DEST_DATA: Record<string, { flag: string; price: number; temp: string; safety: number; food: number; beaches: number; culture: number }> = {
  Dubai: { flag: '🇦🇪', price: 840, temp: '35°C', safety: 8, food: 8, beaches: 7, culture: 7 },
  Tokyo: { flag: '🇯🇵', price: 650, temp: '18°C', safety: 10, food: 10, beaches: 4, culture: 10 },
  Paris: { flag: '🇫🇷', price: 720, temp: '18°C', safety: 7, food: 10, beaches: 5, culture: 10 },
  Bali: { flag: '🇮🇩', price: 420, temp: '27°C', safety: 8, food: 9, beaches: 10, culture: 9 },
  Maldives: { flag: '🇲🇻', price: 1200, temp: '29°C', safety: 9, food: 7, beaches: 10, culture: 5 },
  Istanbul: { flag: '🇹🇷', price: 380, temp: '20°C', safety: 7, food: 9, beaches: 6, culture: 10 },
};

function monthPrice(base: number, day: number, month: number) {
  const seasonal = Math.sin((month / 12) * Math.PI * 2) * 0.18;
  const noise = (Math.sin(day * 7.3 + base + month) * 0.5 - 0.25) * 0.08;
  return Math.round((base * (1 + seasonal + noise)) / 5) * 5;
}

export function Phase2Features({ locale }: Props) {
  const ar = isAr(locale);
  const tr = getTranslations(locale);
  const ph = tr.phase2;

  /* ── 1. AI Packing List ── */
  const STYLE_KEYS = ['beach', 'city', 'mountain', 'business'];
  const [packDest, setPackDest] = useState('');
  const [packDays, setPackDays] = useState(7);
  const [packStyle, setPackStyle] = useState('beach');
  const [packList, setPackList] = useState<Record<string, string[]> | null>(null);
  const [packResp, setPackResp] = useState('');
  const [packLoading, setPackLoading] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  async function generatePacking() {
    const dest = packDest.trim() || 'Bali';
    setPackLoading(true);
    setPackResp(ph.packGenerating);
    setPackList(null);
    try {
      const prompt = `Create a packing list for a ${packDays}-day ${packStyle} trip to ${dest}. ` +
        `Reply with ONLY valid JSON, no other text, in this exact shape: ` +
        `{"clothing":["item1","item2"],"toiletries":["item1"],"electronics":["item1"],"documents":["item1"]}. Max 5 items per category.`;
      const raw = await askAI(prompt);
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setPackList(parsed);
      setChecked(new Set());
      setPackResp(ph.packReadyTemplate.replace('{days}', String(packDays)).replace('{dest}', dest));
    } catch {
      setPackResp(ph.packError);
    } finally {
      setPackLoading(false);
    }
  }

  function toggleItem(key: string) {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  /* ── 2. Destination Compare ── */
  const DEST_KEYS = Object.keys(DEST_DATA);
  const [cmp1, setCmp1] = useState(DEST_KEYS[0]);
  const [cmp2, setCmp2] = useState(DEST_KEYS[1]);
  const [cmpResp, setCmpResp] = useState('');
  const [cmpLoading, setCmpLoading] = useState(false);
  const [showTable, setShowTable] = useState(false);

  async function compareTrips() {
    if (cmp1 === cmp2) return;
    setShowTable(true);
    setCmpLoading(true);
    setCmpResp(ph.cmpAnalyzing);
    try {
      const d1 = DEST_DATA[cmp1], d2 = DEST_DATA[cmp2];
      const prompt = `Compare ${cmp1} ($${d1.price}/night) vs ${cmp2} ($${d2.price}/night) for a typical tourist. Which offers better value? Max 2 sentences.`;
      setCmpResp(await askAI(prompt));
    } catch {
      const winner = DEST_DATA[cmp1].price < DEST_DATA[cmp2].price ? cmp1 : cmp2;
      setCmpResp(ph.cmpWinnerTemplate.replace('{winner}', winner));
    } finally {
      setCmpLoading(false);
    }
  }

  const compareRows: Array<[string, string, string, 'price' | 'num' | null]> = showTable ? [
    [ph.cmpPrice, `$${DEST_DATA[cmp1].price}`, `$${DEST_DATA[cmp2].price}`, 'price'],
    [ph.cmpWeather, DEST_DATA[cmp1].temp, DEST_DATA[cmp2].temp, null],
    [ph.cmpFood, `${DEST_DATA[cmp1].food}/10`, `${DEST_DATA[cmp2].food}/10`, 'num'],
    [ph.cmpBeaches, `${DEST_DATA[cmp1].beaches}/10`, `${DEST_DATA[cmp2].beaches}/10`, 'num'],
    [ph.cmpCulture, `${DEST_DATA[cmp1].culture}/10`, `${DEST_DATA[cmp2].culture}/10`, 'num'],
    [ph.cmpSafety, `${DEST_DATA[cmp1].safety}/10`, `${DEST_DATA[cmp2].safety}/10`, 'num'],
  ] : [];

  /* ── 3. Group Trip Planner ── */
  const [members, setMembers] = useState<string[]>([...ph.defaultMembers]);
  const [memberInput, setMemberInput] = useState('');
  const [groupDest, setGroupDest] = useState('');
  const [groupBudget, setGroupBudget] = useState('');
  const [groupResp, setGroupResp] = useState('');
  const [groupLoading, setGroupLoading] = useState(false);

  function addMember() {
    const name = memberInput.trim();
    if (!name) return;
    setMembers(prev => [...prev, name]);
    setMemberInput('');
  }
  function removeMember(idx: number) {
    setMembers(prev => prev.filter((_, i) => i !== idx));
  }

  const groupBudgetNum = parseFloat(groupBudget) || 0;
  const perPersonAmount = members.length > 0 ? Math.round(groupBudgetNum / members.length) : 0;

  async function planGroupTrip() {
    if (members.length < 2) return;
    setGroupLoading(true);
    setGroupResp(ph.groupPlanning);
    try {
      const dest = groupDest.trim() || 'Bali';
      const prompt = `Group of ${members.length} (${members.join(', ')}) traveling to ${dest} with $${groupBudgetNum || members.length * 500} budget. Give 2 practical tips for a successful group trip. Max 2 sentences.`;
      setGroupResp(await askAI(prompt));
    } catch {
      setGroupResp(ph.costSplitTemplate.replace('{amount}', String(perPersonAmount)));
    } finally {
      setGroupLoading(false);
    }
  }

  /* ── 4. Smart Price Calendar ── */
  const [calDest, setCalDest] = useState(DEST_KEYS[0]);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calOpen, setCalOpen] = useState(false);
  const [selDay, setSelDay] = useState<number | null>(null);

  const monthNames = ph.monthNames;

  function navMonth(dir: number) {
    let m = calMonth + dir, y = calYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setCalMonth(m); setCalYear(y); setSelDay(null);
  }

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const base = DEST_DATA[calDest].price;
  const prices = Array.from({ length: daysInMonth }, (_, i) => monthPrice(base, i + 1, calMonth));
  const minP = Math.min(...prices), maxP = Math.max(...prices);

  return (
    <div className={styles.fcGrid}>

      {/* Packing List */}
      <div className={styles.fc}>
        <div className={styles.fcHead}>
          <div className={styles.fcTitle}>🧳 {ph.packTitle}</div>
        </div>
        <div className={styles.fcSub}>{ph.packSub}</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 9 }}>
          <input className="finput" style={{ flex: 1, fontSize: '.81rem' }} placeholder={ph.packDestPlaceholder} value={packDest} onChange={e => setPackDest(e.target.value)} />
          <select className="finput" style={{ maxWidth: 82, fontSize: '.78rem' }} value={packDays} onChange={e => setPackDays(Number(e.target.value))}>
            {[3, 5, 7, 10, 14].map(d => <option key={d} value={d}>{d} {ph.days}</option>)}
          </select>
        </div>
        <div className="pack-cats">
          {STYLE_KEYS.map((key, i) => (
            <div key={key} className={`pack-cat${packStyle === key ? ' on' : ''}`} onClick={() => setPackStyle(key)}>
              {ph.packStyles[i]}
            </div>
          ))}
        </div>
        <button className="btn btn-g" style={{ width: '100%', padding: 10, borderRadius: 'var(--rM)', fontSize: '.8rem' }} onClick={generatePacking} disabled={packLoading}>
          ✨ {ph.packGenerate}
        </button>
        {packList && (
          <div className="pack-results" style={{ display: 'flex' }}>
            {Object.entries(packList).map(([cat, items]) => (
              <div key={cat} className="pack-section">
                <div className="pack-sec-hdr"><span className="pack-ico">📦</span> {cat}</div>
                <div className="pack-items-list">
                  {items.map((item, i) => {
                    const key = `${cat}-${i}`;
                    return (
                      <div key={key} className={`pack-item${checked.has(key) ? ' checked' : ''}`} onClick={() => toggleItem(key)}>
                        <div className="pack-cb">{checked.has(key) ? '✓' : ''}</div>
                        <span>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        {packResp && <div className={`ai-resp${packLoading ? ' loading' : ''}`} style={{ marginTop: 8 }}>{packResp}</div>}
      </div>

      {/* Destination Compare */}
      <div className={styles.fc}>
        <div className={styles.fcHead}>
          <div className={styles.fcTitle}>⚖️ {ph.cmpTitle}</div>
        </div>
        <div className={styles.fcSub}>{ph.cmpSub}</div>
        <div className="compare-grid">
          <select className="compare-sel" value={cmp1} onChange={e => setCmp1(e.target.value)}>
            {DEST_KEYS.map(d => <option key={d} value={d}>{DEST_DATA[d].flag} {d}</option>)}
          </select>
          <select className="compare-sel" value={cmp2} onChange={e => setCmp2(e.target.value)}>
            {DEST_KEYS.map(d => <option key={d} value={d}>{DEST_DATA[d].flag} {d}</option>)}
          </select>
        </div>
        <button className="btn btn-g" style={{ width: '100%', padding: 10, borderRadius: 'var(--rM)', fontSize: '.8rem' }} onClick={compareTrips} disabled={cmpLoading}>
          ⚖️ {ph.cmpNow}
        </button>
        {showTable && (
          <table className="compare-table">
            <thead>
              <tr><th>{ph.cmpCriteria}</th><th>{DEST_DATA[cmp1].flag} {cmp1}</th><th>{DEST_DATA[cmp2].flag} {cmp2}</th></tr>
            </thead>
            <tbody>
              {compareRows.map(([label, v1, v2]) => (
                <tr key={label}><td>{label}</td><td>{v1}</td><td>{v2}</td></tr>
              ))}
            </tbody>
          </table>
        )}
        {cmpResp && <div className={`ai-resp${cmpLoading ? ' loading' : ''}`} style={{ marginTop: 8 }}>{cmpResp}</div>}
      </div>

      {/* Group Trip Planner */}
      <div className={styles.fc}>
        <div className={styles.fcHead}>
          <div className={styles.fcTitle}>👨‍👩‍👧 {ph.groupTitle}</div>
        </div>
        <div className={styles.fcSub}>{ph.groupSub}</div>
        <div className="group-add">
          <input
            className="finput" style={{ flex: 1, fontSize: '.8rem' }}
            placeholder={ph.memberName}
            value={memberInput}
            onChange={e => setMemberInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addMember(); }}
          />
          <button className="group-add-btn" onClick={addMember}>+ {ph.add}</button>
        </div>
        <div className="group-members">
          {members.map((m, i) => (
            <div key={i} className="group-member">👤 {m} <span className="rm" onClick={() => removeMember(i)}>✕</span></div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 9 }}>
          <input className="finput" style={{ flex: 1, fontSize: '.8rem' }} placeholder={ph.destination} value={groupDest} onChange={e => setGroupDest(e.target.value)} />
          <input type="number" className="finput" style={{ flex: 1, fontSize: '.8rem' }} placeholder={ph.totalBudget} value={groupBudget} onChange={e => setGroupBudget(e.target.value)} />
        </div>
        <button className="btn btn-g" style={{ width: '100%', padding: 10, borderRadius: 'var(--rM)', fontSize: '.8rem' }} onClick={planGroupTrip} disabled={groupLoading}>
          ✨ {ph.planGroupTrip}
        </button>
        {groupBudgetNum > 0 && members.length > 0 && (
          <div style={{ marginTop: 9 }}>
            <div className="split-row"><div className="split-name">{ph.perPerson}</div><div className="split-amt">${perPersonAmount}</div></div>
          </div>
        )}
        {groupResp && <div className={`ai-resp${groupLoading ? ' loading' : ''}`} style={{ marginTop: 8 }}>{groupResp}</div>}
      </div>

      {/* Smart Price Calendar */}
      <div className={styles.fc}>
        <div className={styles.fcHead}>
          <div className={styles.fcTitle}>📅 {ph.calTitle}</div>
        </div>
        <div className={styles.fcSub}>{ph.calSub}</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <select className="finput" style={{ flex: 1, fontSize: '.79rem' }} value={calDest} onChange={e => setCalDest(e.target.value)}>
            {DEST_KEYS.map(d => <option key={d} value={d}>{DEST_DATA[d].flag} {d}</option>)}
          </select>
          <button className="btn btn-g" style={{ padding: '8px 14px', borderRadius: 'var(--rM)', fontSize: '.78rem' }} onClick={() => setCalOpen(true)}>
            📅 {ph.openCalendar}
          </button>
        </div>
        {selDay && (
          <div style={{ background: 'var(--gdim)', border: '1px solid var(--gglow)', borderRadius: 'var(--rM)', padding: 10, fontSize: '.78rem', color: 'var(--g)', fontWeight: 600 }}>
            📅 {monthNames[calMonth]} {selDay}, {calYear} — ${prices[selDay - 1]}/night
          </div>
        )}
      </div>

      {calOpen && (
        <div className="cal-bg on" onClick={() => setCalOpen(false)}>
          <div className="cal-modal" onClick={e => e.stopPropagation()}>
            <div className="cal-nav">
              <button className="cal-nb" onClick={() => navMonth(-1)}>‹</button>
              <div className="cal-month-lbl">{monthNames[calMonth]} {calYear}</div>
              <button className="cal-nb" onClick={() => navMonth(1)}>›</button>
            </div>
            <div className="cal-grid">
              {ph.weekdayAbbrev.map(d => (
                <div key={d} className="cal-dn">{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {prices.map((p, i) => {
                const day = i + 1;
                const cls = p <= minP * 1.1 ? 'pl' : p >= maxP * 0.9 ? 'ph' : 'pm';
                return (
                  <div
                    key={day}
                    className={`cal-d${selDay === day ? ' sel1' : ''}`}
                    onClick={() => { setSelDay(day); setCalOpen(false); }}
                  >
                    <div className="cal-dnum">{day}</div>
                    <div className={`cal-dprice ${cls}`}>${p}</div>
                  </div>
                );
              })}
            </div>
            <div className="cal-legend">
              <div className="cal-li"><div className="cal-ld" style={{ background: 'var(--green)' }} />{ph.cheap}</div>
              <div className="cal-li"><div className="cal-ld" style={{ background: 'var(--g)' }} />{ph.mid}</div>
              <div className="cal-li"><div className="cal-ld" style={{ background: 'var(--red)' }} />{ph.high}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
