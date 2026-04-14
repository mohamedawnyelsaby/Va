'use client';
// PATH: src/app/[locale]/ai/page.tsx
// REDESIGNED: VG aesthetic, sharp corners, proper hero, better UX

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, Globe, Zap, ArrowLeft, Hotel, Star, MapPin } from 'lucide-react';
import { VG, monoLabel } from '@/lib/tokens';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  hotels?: any[];
  searchParams?: any;
  timestamp?: Date;
}

const QUICK_ACTIONS = [
  { text: 'Hotels in Dubai tonight', emoji: '🇦🇪', label: 'Dubai' },
  { text: 'Cheap hotels in Paris',   emoji: '🇫🇷', label: 'Paris' },
  { text: 'فنادق في القاهرة',        emoji: '🇪🇬', label: 'القاهرة' },
  { text: 'Luxury hotels London',    emoji: '🇬🇧', label: 'London' },
  { text: 'Hotels en Barcelona',     emoji: '🇪🇸', label: 'Barcelona' },
  { text: '東京のホテル',              emoji: '🇯🇵', label: 'Tokyo' },
];

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0 clamp(1rem,4vw,2rem)' }}>
      <div style={{ width: '32px', height: '32px', background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--vg-gold)' }}>
        <Bot size={14} />
      </div>
      <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', padding: '0.9rem 1.1rem', display: 'flex', gap: '5px', alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: '7px', height: '7px', background: 'var(--vg-gold)', borderRadius: '50%', animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

function HotelCard({ hotel, locale }: { hotel: any; locale: string }) {
  return (
    <div style={{
      background: 'var(--vg-bg-card)',
      border: '1px solid var(--vg-border)',
      display: 'flex',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-gold-border)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-border)'}
    >
      {hotel.thumbnail && (
        <img src={hotel.thumbnail} alt={hotel.name} style={{ width: '88px', height: '88px', objectFit: 'cover', flexShrink: 0, filter: 'brightness(0.85) saturate(0.75)' }} />
      )}
      <div style={{ padding: '0.75rem 1rem', flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.05rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {hotel.name}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {hotel.stars > 0 && (
              <span style={{ color: 'var(--vg-star)', fontSize: '0.65rem', letterSpacing: '0.08em' }}>{'★'.repeat(Math.min(hotel.stars, 5))}</span>
            )}
            {hotel.rating && (
              <span style={{ ...monoLabel, background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)', color: 'var(--vg-gold)', padding: '0.12rem 0.5rem' }}>
                {hotel.rating} {hotel.reviewText}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <button
            onClick={() => {
              const params = new URLSearchParams({
                hotelId: hotel.id, hotelName: hotel.name,
                checkIn: hotel.checkIn || '', checkOut: hotel.checkOut || '',
                price: hotel.price.toString(), source: 'booking.com',
                thumbnail: hotel.thumbnail || '',
              });
              window.location.href = `/${locale}/booking?${params.toString()}`;
            }}
            className="vg-btn-primary"
            style={{ padding: '0.45rem 0.9rem', fontSize: VG.font.micro }}
          >
            Book →
          </button>
          <div>
            <span className="vg-stat-num" style={{ fontSize: '1rem' }}>${hotel.price}</span>
            <span style={{ ...monoLabel, marginLeft: '0.25rem', color: 'var(--vg-text-3)' }}>/night</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, locale }: { msg: Message; locale: string }) {
  const isUser = msg.role === 'user';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: '0.6rem', padding: '0 clamp(1rem,4vw,2rem)' }}>
      {!isUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '24px', height: '24px', background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vg-gold)' }}>
            <Bot size={12} />
          </div>
          <span style={{ ...monoLabel }}>Logy AI</span>
        </div>
      )}

      <div style={{
        maxWidth: '78%',
        padding: '0.9rem 1.1rem',
        background: isUser ? 'var(--vg-gold)' : 'var(--vg-bg-card)',
        border: isUser ? 'none' : '1px solid var(--vg-border)',
        color: isUser ? 'var(--vg-bg)' : 'var(--vg-text)',
        fontFamily: 'var(--font-dm-sans)',
        fontSize: VG.font.body,
        lineHeight: 1.7,
        whiteSpace: 'pre-wrap',
      }}>
        {msg.content}
      </div>

      {/* Hotel results */}
      {msg.hotels && msg.hotels.length > 0 && (
        <div style={{ width: '100%', maxWidth: '520px' }}>
          <div style={{ ...monoLabel, marginBottom: '0.6rem', color: 'var(--vg-text-3)' }}>
            🏨 {msg.hotels.length} hotels found
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)' }}>
            {msg.hotels.slice(0, 4).map((hotel: any) => (
              <HotelCard key={hotel.id} hotel={hotel} locale={locale} />
            ))}
          </div>
        </div>
      )}

      {msg.timestamp && (
        <div style={{ ...monoLabel, color: 'var(--vg-text-3)', fontSize: '0.48rem' }}>
          {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
}

export default function AITravelPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '🌍 Welcome to Logy AI!\n\nI speak your language — write in any language and I\'ll respond in kind.\n\nWhere would you like to go?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showQuick, setShowQuick] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'en' : 'en';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setLoading(true);
    setShowQuick(false);

    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date() }]);

    try {
      const res = await fetch('/api/ai/travel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message || 'Sorry, please try again.',
        hotels: data.hotels,
        searchParams: data.searchParams,
        timestamp: new Date(),
      }]);
      if (data.history) setHistory(data.history);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Connection error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, history]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--vg-bg)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-dm-sans)',
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: '0 clamp(1rem,4vw,2rem)',
        borderBottom: '1px solid var(--vg-border)',
        background: 'var(--vg-bg-surface)',
        backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
        height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Left: Back + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href={`/${locale}`} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            textDecoration: 'none', color: 'var(--vg-text-3)',
            fontFamily: 'var(--font-space-mono)', fontSize: VG.font.micro,
            letterSpacing: '0.15em', transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--vg-gold)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--vg-text-3)'}
          >
            <ArrowLeft size={12} /> Back
          </Link>

          <div style={{ width: '1px', height: '20px', background: 'var(--vg-border)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div style={{ width: '36px', height: '36px', background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vg-gold)' }}>
              <Bot size={16} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.15rem', fontWeight: 300, color: 'var(--vg-text)', lineHeight: 1 }}>
                Logy <em style={{ color: 'var(--vg-gold)', fontStyle: 'italic' }}>AI</em>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
                <span style={{ ...monoLabel, color: '#10b981', fontSize: '0.48rem' }}>Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Features */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} className="header-features">
          <style>{`@media(max-width:500px){.header-features{display:none!important}}`}</style>
          {[
            { icon: Globe, label: 'All Languages' },
            { icon: Zap,   label: 'Instant Results' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.7rem', border: '1px solid var(--vg-border)', background: 'var(--vg-bg-card)' }}>
                <Icon size={11} color="var(--vg-gold)" />
                <span style={{ ...monoLabel, color: 'var(--vg-text-3)', letterSpacing: '0.12em' }}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1.5rem 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
        maxWidth: '860px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}>

        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} locale={locale} />
        ))}

        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Actions ── */}
      {showQuick && messages.length <= 1 && (
        <div style={{ maxWidth: '860px', width: '100%', margin: '0 auto', padding: '0 clamp(1rem,4vw,2rem) 0.75rem', boxSizing: 'border-box' }}>
          <div style={{ ...monoLabel, color: 'var(--vg-text-3)', marginBottom: '0.6rem', display: 'block' }}>Try asking:</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={i}
                onClick={() => sendMessage(action.text)}
                style={{
                  background: 'var(--vg-bg-card)',
                  border: '1px solid var(--vg-border)',
                  color: 'var(--vg-text-2)',
                  padding: '0.55rem 0.9rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: VG.font.small,
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  transition: 'border-color 0.2s, color 0.2s, background 0.2s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--vg-gold-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--vg-gold)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--vg-gold-dim)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--vg-border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--vg-text-2)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--vg-bg-card)'; }}
              >
                <span style={{ fontSize: '1rem', lineHeight: 1 }}>{action.emoji}</span>
                {action.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input Bar ── */}
      <div style={{
        borderTop: '1px solid var(--vg-border)',
        background: 'var(--vg-bg-surface)',
        padding: '0.85rem clamp(1rem,4vw,2rem)',
        position: 'sticky', bottom: 0, zIndex: 50,
      }}>
        <div style={{
          display: 'flex', gap: '0.75rem', alignItems: 'center',
          maxWidth: '860px', margin: '0 auto',
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Ask anything in any language… 🌍"
            style={{
              flex: 1,
              background: 'var(--vg-bg-card)',
              border: '1px solid var(--vg-border)',
              padding: '0.85rem 1rem',
              color: 'var(--vg-text)',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: VG.font.body,
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--vg-gold-border)'}
            onBlur={e => e.target.style.borderColor = 'var(--vg-border)'}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              width: '46px', height: '46px', flexShrink: 0,
              background: loading || !input.trim() ? 'var(--vg-bg-card)' : 'var(--vg-gold)',
              border: loading || !input.trim() ? '1px solid var(--vg-border)' : 'none',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: loading || !input.trim() ? 'var(--vg-text-3)' : 'var(--vg-bg)',
              transition: 'all 0.2s',
            }}
            aria-label="Send"
          >
            <Send size={16} style={{ transform: loading ? 'none' : 'rotate(0deg)' }} />
          </button>
        </div>

        <div style={{ ...monoLabel, color: 'var(--vg-text-3)', textAlign: 'center', marginTop: '0.5rem', display: 'block' }}>
          π Powered by Pi Network · All Languages Supported
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30%            { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: var(--vg-gold-border); }
      `}</style>
    </div>
  );
}
