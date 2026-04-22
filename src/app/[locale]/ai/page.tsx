/* ============================================================
   PATH: app/[locale]/ai/page.tsx
   ============================================================ */

'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const SUGGESTIONS = [
  { flag: '🇦🇪', text: 'Hotels in Dubai tonight' },
  { flag: '🇫🇷', text: 'Cheap hotels in Paris' },
  { flag: '🇪🇬', text: 'فنادق في القاهرة' },
  { flag: '🇬🇧', text: 'Luxury hotels London' },
  { flag: '🇪🇸', text: 'Hotels en Barcelona' },
  { flag: '🇯🇵', text: '東京のホテル' },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function AIPage({ params }: { params: { locale: string } }) {
  const locale = params?.locale ?? 'en';
  const isAr = locale === 'ar';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: isAr
        ? '🌍 مرحباً بك في Logy AI!\n\nأتحدث لغتك — اكتب بأي لغة وسأرد بها.\n\nإلى أين تريد السفر؟'
        : '🌍 Welcome to Logy AI!\n\nI speak your language — write in any language and I\'ll respond in kind.\n\nWhere would you like to go?',
      time: formatTime(new Date()),
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      time: formatTime(new Date()),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), locale }),
      });

      const data = await res.json();

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || (isAr ? 'حدث خطأ ما. حاول مرة أخرى.' : 'Something went wrong. Please try again.'),
        time: formatTime(new Date()),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: isAr ? 'حدث خطأ في الاتصال. تحقق من الإنترنت.' : 'Connection error. Please check your internet.',
        time: formatTime(new Date()),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const showSuggestions = messages.length <= 1;

  return (
    <div className={styles.page} dir={isAr ? 'rtl' : 'ltr'}>

      {/* ── Header ── */}
      <div className={styles.chatHeader}>
        <div className={styles.agentInfo}>
          <div className={styles.agentAvatar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/>
              <circle cx="9" cy="13" r="1" fill="currentColor"/>
              <circle cx="15" cy="13" r="1" fill="currentColor"/>
            </svg>
            <span className={styles.onlineDot} />
          </div>
          <div>
            <div className={styles.agentName}>
              Logy <span className={styles.agentAi}>AI</span>
            </div>
            <div className={styles.agentStatus}>
              {isAr ? '● متاح الآن' : '● Online'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`${styles.msgRow} ${msg.role === 'user' ? styles.userRow : styles.botRow}`}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {msg.role === 'assistant' && (
              <div className={styles.botAvatar}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/>
                  <circle cx="9" cy="13" r="1" fill="currentColor"/>
                  <circle cx="15" cy="13" r="1" fill="currentColor"/>
                </svg>
              </div>
            )}
            <div className={styles.msgContent}>
              <div className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.botBubble}`}>
                {msg.content.split('\n').map((line, j) => (
                  <span key={j}>{line}{j < msg.content.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
              <div className={styles.msgTime}>{msg.time}</div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className={`${styles.msgRow} ${styles.botRow}`}>
            <div className={styles.botAvatar}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/>
              </svg>
            </div>
            <div className={styles.msgContent}>
              <div className={`${styles.bubble} ${styles.botBubble}`}>
                <div className={styles.typing}>
                  <span /><span /><span />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Suggestions ── */}
      {showSuggestions && (
        <div className={styles.suggestions}>
          <p className={`text-label muted ${styles.suggestLabel}`}>
            {isAr ? 'جرب:' : 'Try asking:'}
          </p>
          <div className={styles.chips}>
            {SUGGESTIONS.map(s => (
              <button
                key={s.text}
                className={styles.chip}
                onClick={() => send(s.text)}
              >
                <span>{s.flag}</span>
                <span>{s.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input ── */}
      <div className={styles.inputArea}>
        <div className={styles.inputWrap}>
          <div className={styles.inputAvatar}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKey}
            placeholder={isAr ? 'اسأل بأي لغة... 🌍' : 'Ask anything in any language... 🌍'}
            className={styles.textarea}
            rows={1}
            disabled={loading}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className={styles.sendBtn}
            aria-label="Send"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
