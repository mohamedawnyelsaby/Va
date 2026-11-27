'use client';
// PATH: src/app/[locale]/ai/page.tsx
// Logy AI - travel assistant chat.
//  - clean empty state with localized starter prompts (8 languages)
//  - answers rendered as readable text (bold, lists, links), not inside heavy bubbles
//  - copy, retry, new chat, typing indicator, conversation kept for the browser session
//  - "Find hotels" button that opens the bookable list with the dates / guests the AI understood
//  - composer that grows with the text and stays above the keyboard
import { use, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { parseStayParams, stayQuery } from '@/lib/stay';

interface Stay { destination: string; checkIn?: string; checkOut?: string; guests?: number }
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
  error?: boolean;
  stay?: Stay;
}

interface Words {
  subtitle: string; headline: string; sub: string; placeholder: string; newChat: string;
  copy: string; copied: string; retry: string; disclaimer: string; errorText: string; send: string;
  findHotels: (destination: string) => string;
  suggestions: string[];
}

const WORDS: Record<string, Words> = {
  en: { subtitle: 'Your travel assistant', headline: 'Where to next?', sub: 'Ask about hotels, trips and plans. I answer in your language.',
    placeholder: 'Ask anything about your trip…', newChat: 'New chat', copy: 'Copy', copied: 'Copied', retry: 'Try again', send: 'Send',
    disclaimer: 'AI can make mistakes. Check prices and details before booking.', errorText: 'Something went wrong. Please try again.',
    findHotels: (d) => `Find hotels in ${d}`,
    suggestions: ['🏖️ Plan a 3-day trip to Dubai', '🏨 Best hotels in Paris', '💸 Budget stays in Tokyo', '🗽 What to do in New York'] },
  ar: { subtitle: 'مساعد السفر الذكي', headline: 'إلى أين الوجهة؟', sub: 'اسأل عن الفنادق والرحلات والخطط. أجيب بلغتك.',
    placeholder: 'اسأل عن رحلتك…', newChat: 'محادثة جديدة', copy: 'نسخ', copied: 'تم النسخ', retry: 'حاول مجدداً', send: 'إرسال',
    disclaimer: 'قد يخطئ الذكاء الاصطناعي. تحقق من الأسعار والتفاصيل قبل الحجز.', errorText: 'حدث خطأ ما. حاول مرة أخرى.',
    findHotels: (d) => `ابحث عن فنادق في ${d}`,
    suggestions: ['🏖️ خطط لي رحلة 3 أيام إلى دبي', '🏨 أفضل الفنادق في باريس', '💸 إقامة اقتصادية في طوكيو', '🗽 ماذا أفعل في نيويورك'] },
  fr: { subtitle: 'Votre assistant voyage', headline: 'Où partons-nous ?', sub: 'Posez vos questions sur les hôtels et les voyages. Je réponds dans votre langue.',
    placeholder: 'Posez une question sur votre voyage…', newChat: 'Nouveau chat', copy: 'Copier', copied: 'Copié', retry: 'Réessayer', send: 'Envoyer',
    disclaimer: 'L’IA peut se tromper. Vérifiez les prix et les détails avant de réserver.', errorText: 'Une erreur est survenue. Réessayez.',
    findHotels: (d) => `Trouver des hôtels à ${d}`,
    suggestions: ['🏖️ Un voyage de 3 jours à Dubaï', '🏨 Meilleurs hôtels à Paris', '💸 Séjours pas chers à Tokyo', '🗽 Que faire à New York'] },
  es: { subtitle: 'Tu asistente de viajes', headline: '¿A dónde vamos?', sub: 'Pregunta por hoteles y viajes. Respondo en tu idioma.',
    placeholder: 'Pregunta sobre tu viaje…', newChat: 'Nuevo chat', copy: 'Copiar', copied: 'Copiado', retry: 'Reintentar', send: 'Enviar',
    disclaimer: 'La IA puede equivocarse. Revisa precios y detalles antes de reservar.', errorText: 'Algo salió mal. Inténtalo de nuevo.',
    findHotels: (d) => `Buscar hoteles en ${d}`,
    suggestions: ['🏖️ Un viaje de 3 días a Dubái', '🏨 Mejores hoteles en París', '💸 Alojamiento barato en Tokio', '🗽 Qué hacer en Nueva York'] },
  de: { subtitle: 'Dein Reiseassistent', headline: 'Wohin geht es?', sub: 'Frag nach Hotels und Reisen. Ich antworte in deiner Sprache.',
    placeholder: 'Frag etwas zu deiner Reise…', newChat: 'Neuer Chat', copy: 'Kopieren', copied: 'Kopiert', retry: 'Erneut versuchen', send: 'Senden',
    disclaimer: 'KI kann Fehler machen. Prüfe Preise und Details vor der Buchung.', errorText: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
    findHotels: (d) => `Hotels in ${d} finden`,
    suggestions: ['🏖️ 3-Tage-Reise nach Dubai', '🏨 Beste Hotels in Paris', '💸 Günstig übernachten in Tokio', '🗽 Was tun in New York'] },
  ru: { subtitle: 'Ваш помощник по путешествиям', headline: 'Куда отправимся?', sub: 'Спрашивайте об отелях и поездках. Отвечаю на вашем языке.',
    placeholder: 'Спросите о вашей поездке…', newChat: 'Новый чат', copy: 'Копировать', copied: 'Скопировано', retry: 'Повторить', send: 'Отправить',
    disclaimer: 'ИИ может ошибаться. Проверяйте цены и детали перед бронированием.', errorText: 'Что-то пошло не так. Попробуйте ещё раз.',
    findHotels: (d) => `Найти отели: ${d}`,
    suggestions: ['🏖️ Поездка в Дубай на 3 дня', '🏨 Лучшие отели Парижа', '💸 Недорогое жильё в Токио', '🗽 Чем заняться в Нью-Йорке'] },
  zh: { subtitle: '你的旅行助手', headline: '下一站去哪里？', sub: '询问酒店、行程和计划，我会用你的语言回答。',
    placeholder: '询问你的旅行…', newChat: '新对话', copy: '复制', copied: '已复制', retry: '重试', send: '发送',
    disclaimer: 'AI 可能出错。预订前请核实价格和详情。', errorText: '出了点问题，请重试。',
    findHotels: (d) => `查找${d}的酒店`,
    suggestions: ['🏖️ 迪拜3日游规划', '🏨 巴黎最佳酒店', '💸 东京经济住宿', '🗽 纽约有什么好玩的'] },
  ja: { subtitle: 'あなたの旅行アシスタント', headline: '次はどこへ？', sub: 'ホテルや旅行について質問してください。あなたの言語で答えます。',
    placeholder: '旅行について質問…', newChat: '新しいチャット', copy: 'コピー', copied: 'コピーしました', retry: '再試行', send: '送信',
    disclaimer: 'AIは間違える可能性があります。予約前に料金と詳細をご確認ください。', errorText: '問題が発生しました。もう一度お試しください。',
    findHotels: (d) => `${d}のホテルを探す`,
    suggestions: ['🏖️ ドバイ3日間の旅行プラン', '🏨 パリのおすすめホテル', '💸 東京の格安宿', '🗽 ニューヨークで何をする'] },
};

const STORAGE_KEY = 'va_ai_chat_v1';
const MAX_HISTORY = 20; // the API accepts at most 20 previous messages
const REQUEST_TIMEOUT_MS = 30_000;

/* ── tiny, safe markdown (no HTML injection): **bold**, [text](https://…), lists, headings ── */
function inline(text: string, keyBase: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*\n]+\*\*|\[[^\]\n]+\]\(https?:\/\/[^)\s]+\))/g);
  return parts.map((p, i) => {
    if (p.length > 4 && p.startsWith('**') && p.endsWith('**')) { return <strong key={`${keyBase}-${i}`}>{p.slice(2, -2)}</strong>; }
    const m = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(p);
    if (m) { return <a key={`${keyBase}-${i}`} href={m[2]} target="_blank" rel="noopener noreferrer">{m[1]}</a>; }
    return p;
  });
}

function Markdown({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = text.replace(/\r/g, '').split('\n');
  let list: { ordered: boolean; items: string[] } | null = null;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      const k = `p${blocks.length}`;
      blocks.push(<p key={k}>{inline(para.join(' '), k)}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      const k = `l${blocks.length}`;
      const items = list.items.map((it, i) => <li key={`${k}-${i}`}>{inline(it, `${k}-${i}`)}</li>);
      blocks.push(list.ordered ? <ol key={k}>{items}</ol> : <ul key={k}>{items}</ul>);
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    const bullet = /^(?:[-*•]\s+)(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    const heading = /^#{1,4}\s+(.*)$/.exec(line);
    if (!line) { flushPara(); flushList(); continue; }
    if (bullet || numbered) {
      flushPara();
      const ordered = !!numbered;
      if (!list || list.ordered !== ordered) { flushList(); list = { ordered, items: [] }; }
      list.items.push((bullet ?? numbered)![1]);
      continue;
    }
    flushList();
    if (heading) {
      flushPara();
      const k = `h${blocks.length}`;
      blocks.push(<p key={k} className={styles.mdHead}>{inline(heading[1], k)}</p>);
      continue;
    }
    para.push(line);
  }
  flushPara();
  flushList();
  return <div className={styles.md}>{blocks}</div>;
}

/* ── icons ── */
const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
);
const IconSend = () => <Svg><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></Svg>;
const IconCopy = () => <Svg><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></Svg>;
const IconCheck = () => <Svg><path d="M20 6L9 17l-5-5" /></Svg>;
const IconPlus = () => <Svg><path d="M12 5v14M5 12h14" /></Svg>;
const IconSpark = () => <Svg><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></Svg>;
const IconRetry = () => <Svg><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></Svg>;

function formatTime(date: Date, locale: string): string {
  try { return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
}
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** Keyboard open => hide the bottom nav (responsive.css) and lift the page above the keyboard. */
function useKeyboardInset() {
  useEffect(() => {
    const root = document.documentElement;
    const vv = window.visualViewport;
    let base = window.innerHeight;
    const update = () => {
      base = Math.max(base, window.innerHeight);
      const h = vv ? vv.height : window.innerHeight;
      if (base - h > 150) {
        root.dataset.kb = 'open';
        root.style.setProperty('--kb-h', `${Math.max(0, window.innerHeight - h - (vv?.offsetTop ?? 0))}px`);
      } else {
        delete root.dataset.kb;
        root.style.removeProperty('--kb-h');
      }
    };
    const onOrientation = () => { base = window.innerHeight; update(); };
    update();
    vv?.addEventListener('resize', update);
    vv?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', onOrientation);
    return () => {
      vv?.removeEventListener('resize', update);
      vv?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', onOrientation);
      delete root.dataset.kb;
      root.style.removeProperty('--kb-h');
    };
  }, []);
}

interface Props { params: Promise<{ locale: string }> }

export default function AIPage({ params }: Props) {
  const { locale } = use(params);
  const w = WORDS[locale] ?? WORDS.en;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [restored, setRestored] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesRef = useRef<Message[]>([]);
  const loadingRef = useRef(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const started = useRef(false);

  messagesRef.current = messages;
  useKeyboardInset();

  const growTextarea = () => {
    const ta = taRef.current;
    if (!ta) { return; }
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  };

  const send = useCallback(async (raw: string) => {
    const text = raw.trim().slice(0, 2000);
    if (!text || loadingRef.current) { return; }

    const history = messagesRef.current
      .filter((m) => !m.error)
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

    const userMsg: Message = { id: uid(), role: 'user', content: text, time: formatTime(new Date(), locale) };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    requestAnimationFrame(growTextarea);
    loadingRef.current = true;
    setLoading(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch('/api/ai/travel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.message !== 'string' || !data.message) { throw new Error('bad response'); }

      const sp = data.searchParams as Partial<Stay> | undefined;
      const stay: Stay | undefined = sp?.destination
        ? { destination: String(sp.destination).slice(0, 80), checkIn: sp.checkIn, checkOut: sp.checkOut, guests: sp.guests }
        : undefined;
      setMessages((prev) => [...prev, { id: uid(), role: 'assistant', content: data.message, time: formatTime(new Date(), locale), stay }]);
    } catch {
      setMessages((prev) => [...prev, { id: uid(), role: 'assistant', content: w.errorText, time: formatTime(new Date(), locale), error: true }]);
    } finally {
      clearTimeout(timer);
      loadingRef.current = false;
      setLoading(false);
    }
  }, [locale, w.errorText]);

  const retry = () => {
    const list = messagesRef.current;
    const lastUser = [...list].reverse().find((m) => m.role === 'user');
    if (!lastUser) { return; }
    // drop the failed answer and the question, then ask again
    setMessages(list.filter((m) => !m.error && m.id !== lastUser.id));
    messagesRef.current = list.filter((m) => !m.error && m.id !== lastUser.id);
    void send(lastUser.content);
  };

  const newChat = () => {
    setMessages([]);
    messagesRef.current = [];
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* storage blocked */ }
    taRef.current?.focus();
  };

  const copy = async (m: Message) => {
    try {
      await navigator.clipboard.writeText(m.content);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = m.content;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* nothing else to try */ }
      ta.remove();
    }
    setCopiedId(m.id);
    setTimeout(() => setCopiedId((id) => (id === m.id ? null : id)), 1500);
  };

  // First load: ?q=... (home search box) starts a new chat, otherwise bring back this session's chat.
  useEffect(() => {
    if (started.current) { return; }
    started.current = true;
    const q = new URLSearchParams(window.location.search).get('q')?.trim().slice(0, 500);
    if (q) {
      setRestored(true);
      void send(q);
      return;
    }
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Message[];
        if (Array.isArray(parsed)) { setMessages(parsed.filter((m) => m && typeof m.content === 'string').slice(-40)); }
      }
    } catch { /* ignore corrupt or blocked storage */ }
    setRestored(true);
  }, [send]);

  useEffect(() => {
    if (!restored) { return; }
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40))); } catch { /* storage blocked */ }
  }, [messages, restored]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) { el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); }
  }, [messages, loading]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send(input);
    }
  };

  const hotelsHref = (s: Stay): string => {
    const stay = parseStayParams(new URLSearchParams({
      ...(s.checkIn ? { checkIn: s.checkIn } : {}),
      ...(s.checkOut ? { checkOut: s.checkOut } : {}),
      ...(s.guests ? { guests: String(s.guests) } : {}),
    }).toString());
    const sp = new URLSearchParams(stayQuery(stay));
    sp.set('q', s.destination);
    return `/${locale}/hotels?${sp.toString()}`;
  };

  const lastIndex = messages.length - 1;
  const isEmpty = messages.length === 0 && !loading;

  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <div className={styles.brand}>
          <span className={styles.avatar}><IconSpark /></span>
          <div className={styles.brandText}>
            <div className={styles.brandName}>Logy <em>AI</em></div>
            <div className={styles.brandSub}>{w.subtitle}</div>
          </div>
        </div>
        {messages.length > 0 && (
          <button type="button" className={styles.newBtn} onClick={newChat}>
            <IconPlus /> <span>{w.newChat}</span>
          </button>
        )}
      </header>

      <div className={styles.scroller} ref={scrollerRef}>
        <div className={styles.inner}>
          {isEmpty ? (
            <div className={styles.empty}>
              <div className={styles.orb}><IconSpark /></div>
              <h1 className={styles.headline}>{w.headline}</h1>
              <p className={styles.sub}>{w.sub}</p>
              <div className={styles.suggestions}>
                {w.suggestions.map((s) => (
                  <button key={s} type="button" className={styles.sug} onClick={() => void send(s.replace(/^\S+\s/, ''))}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, idx) =>
              m.role === 'user' ? (
                <div key={m.id} className={styles.userRow}>
                  <div className={styles.userBubble}>{m.content}</div>
                </div>
              ) : (
                <div key={m.id} className={styles.aiRow}>
                  <span className={styles.avatarSm}><IconSpark /></span>
                  <div className={styles.aiBody}>
                    {m.error ? <p className={styles.errorText}>{m.content}</p> : <Markdown text={m.content} />}
                    <div className={styles.actions}>
                      {m.error ? (
                        <button type="button" className={styles.actionBtn} onClick={retry}><IconRetry /> {w.retry}</button>
                      ) : (
                        <button type="button" className={styles.actionBtn} onClick={() => void copy(m)}>
                          {copiedId === m.id ? <IconCheck /> : <IconCopy />} {copiedId === m.id ? w.copied : w.copy}
                        </button>
                      )}
                      <span className={styles.time}>{m.time}</span>
                    </div>
                    {m.stay && idx === lastIndex && (
                      <Link href={hotelsHref(m.stay)} className={styles.cta}>🏨 {w.findHotels(m.stay.destination)}</Link>
                    )}
                  </div>
                </div>
              ),
            )
          )}

          {loading && (
            <div className={styles.aiRow} aria-live="polite">
              <span className={styles.avatarSm}><IconSpark /></span>
              <div className={styles.dots} aria-label="…"><i /><i /><i /></div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.composerWrap}>
        <div className={styles.inner}>
          <div className={styles.composer}>
            <textarea
              ref={taRef}
              className={styles.textarea}
              value={input}
              rows={1}
              maxLength={2000}
              placeholder={w.placeholder}
              enterKeyHint="send"
              aria-label={w.placeholder}
              onChange={(e) => { setInput(e.target.value); growTextarea(); }}
              onKeyDown={onKeyDown}
            />
            <button type="button" className={styles.sendBtn} onClick={() => void send(input)} disabled={loading || !input.trim()} aria-label={w.send}>
              <IconSend />
            </button>
          </div>
          <p className={styles.disclaimer}>{w.disclaimer}</p>
        </div>
      </div>
    </div>
  );
}
