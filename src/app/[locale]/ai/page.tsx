'use client';
// src/app/[locale]/ai/page.tsx
// FIX: replaced ALL hardcoded dark colors with CSS variables for light/dark mode support

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  hotels?: any[];
  searchParams?: any;
}

export default function AITravelPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '🌍 Welcome to Logy AI!\n\nI speak your language — write in any language and I\'ll respond in kind.\n\nWhere would you like to go? 🏨✈️',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: msg }]);

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
      }]);

      if (data.history) setHistory(data.history);

    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Connection error. Please try again.',
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const quickActions = [
    { text: 'Hotels in Dubai tonight', emoji: '🇦🇪' },
    { text: 'Cheap hotels in Paris', emoji: '🇫🇷' },
    { text: 'فنادق في القاهرة', emoji: '🇪🇬' },
    { text: 'Luxury hotels London', emoji: '🇬🇧' },
    { text: 'Hotels en Barcelona', emoji: '🇪🇸' },
    { text: '东京酒店', emoji: '🇯🇵' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      // FIX: use VG background instead of hardcoded dark color
      background: 'var(--vg-bg)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--font-dm-sans)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed',
        top: -200,
        right: -200,
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,162,39,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--vg-border)',
        background: 'var(--vg-bg-surface)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            background: 'var(--vg-gold-dim)',
            border: '1px solid var(--vg-gold-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
          }}>🤖</div>
          <div>
            <div style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.2rem', fontWeight: 300,
              color: 'var(--vg-text)',
            }}>
              Logy <em style={{ color: 'var(--vg-gold)', fontStyle: 'italic' }}>AI</em>
            </div>
            <div style={{
              fontFamily: 'var(--font-space-mono)', fontSize: '0.48rem',
              letterSpacing: '0.15em', color: 'var(--vg-gold)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--vg-gold)', display: 'inline-block',
              }} />
              Online · All Languages · π Pi Network
            </div>
          </div>
        </div>
        <a href={`/${typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'en'}`}
          style={{
            color: 'var(--vg-text-2)',
            textDecoration: 'none',
            fontFamily: 'var(--font-space-mono)',
            fontSize: '0.48rem',
            letterSpacing: '0.15em',
            padding: '6px 12px',
            border: '1px solid var(--vg-border)',
            transition: 'border-color .2s, color .2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-gold-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--vg-gold)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--vg-text-2)'; }}
        >← Back</a>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 16px',
        display: 'flex', flexDirection: 'column', gap: 14,
        maxWidth: '800px', width: '100%', margin: '0 auto',
        boxSizing: 'border-box',
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '88%',
              padding: '13px 17px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
              // FIX: user messages use VG gold, assistant uses VG card
              background: msg.role === 'user'
                ? 'var(--vg-gold)'
                : 'var(--vg-bg-card)',
              border: msg.role === 'assistant' ? '1px solid var(--vg-border)' : 'none',
              // FIX: user text color adapts to theme
              color: msg.role === 'user' ? 'var(--vg-bg)' : 'var(--vg-text)',
              fontSize: '0.9rem',
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
              fontFamily: 'var(--font-dm-sans)',
            }}>
              {msg.content}
            </div>

            {/* Hotel Results */}
            {msg.hotels && msg.hotels.length > 0 && (
              <div style={{ width: '100%', marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{
                  fontFamily: 'var(--font-space-mono)', fontSize: '0.5rem',
                  letterSpacing: '0.15em', color: 'var(--vg-text-3)',
                }}>
                  🏨 {msg.hotels.length} hotels found from Booking.com
                </div>
                {msg.hotels.map((hotel: any) => (
                  <div key={hotel.id} style={{
                    background: 'var(--vg-bg-card)',
                    border: '1px solid var(--vg-border)',
                    overflow: 'hidden',
                    display: 'flex',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-gold-border)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--vg-border)'}
                  >
                    {hotel.thumbnail && (
                      <img
                        src={hotel.thumbnail}
                        alt={hotel.name}
                        style={{ width: 90, height: 90, objectFit: 'cover', flexShrink: 0, filter: 'brightness(0.9) saturate(0.8)' }}
                      />
                    )}
                    <div style={{ padding: '10px 14px', flex: 1, minWidth: 0 }}>
                      <div style={{
                        color: 'var(--vg-text)',
                        fontFamily: 'var(--font-cormorant)',
                        fontWeight: 300, fontSize: '1.1rem',
                        marginBottom: 5,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {hotel.name}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                        {hotel.stars > 0 && (
                          <span style={{ color: 'var(--vg-star)', fontSize: '0.7rem' }}>
                            {'★'.repeat(Math.min(hotel.stars, 5))}
                          </span>
                        )}
                        {hotel.rating && (
                          <span style={{
                            background: 'var(--vg-gold-dim)',
                            color: 'var(--vg-gold)',
                            padding: '2px 7px',
                            border: '1px solid var(--vg-gold-border)',
                            fontFamily: 'var(--font-space-mono)',
                            fontSize: '0.5rem', letterSpacing: '0.08em',
                          }}>
                            {hotel.rating} {hotel.reviewText}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button
                          onClick={() => {
                            const params = new URLSearchParams({
                              hotelId: hotel.id,
                              hotelName: hotel.name,
                              checkIn: hotel.checkIn || '',
                              checkOut: hotel.checkOut || '',
                              price: hotel.price.toString(),
                              source: 'booking.com',
                              thumbnail: hotel.thumbnail || '',
                            });
                            const locale = window.location.pathname.split('/')[1] || 'en';
                            window.location.href = `/${locale}/booking?${params.toString()}`;
                          }}
                          className="vg-btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.46rem' }}
                        >
                          Book Now →
                        </button>
                        <div>
                          <span className="vg-stat-num" style={{ fontSize: '1rem' }}>${hotel.price}</span>
                          <span style={{
                            fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem',
                            letterSpacing: '0.12em', color: 'var(--vg-text-3)',
                          }}>/night</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{
              padding: '13px 18px',
              background: 'var(--vg-bg-card)',
              border: '1px solid var(--vg-border)',
              display: 'flex', gap: 5, alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: 'var(--vg-gold)',
                  animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div style={{ padding: '0 16px 10px', maxWidth: '800px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <div style={{
            fontFamily: 'var(--font-space-mono)', fontSize: '0.48rem',
            letterSpacing: '0.15em', color: 'var(--vg-text-3)',
            marginBottom: 8, textAlign: 'center', textTransform: 'uppercase',
          }}>
            Try in any language:
          </div>
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4 }}>
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => sendMessage(action.text)}
                style={{
                  background: 'var(--vg-gold-dim)',
                  border: '1px solid var(--vg-gold-border)',
                  color: 'var(--vg-text-2)',
                  padding: '8px 13px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '0.82rem',
                  whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 5,
                  flexShrink: 0,
                  transition: 'color .2s, background .2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--vg-gold)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(201,162,39,0.2)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--vg-text-2)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--vg-gold-dim)';
                }}
              >
                {action.emoji} {action.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--vg-border)',
        background: 'var(--vg-bg-surface)',
        backdropFilter: 'blur(20px)',
        display: 'flex', gap: 10, alignItems: 'center',
        maxWidth: '800px', width: '100%', margin: '0 auto',
        boxSizing: 'border-box',
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type in any language... 🌍"
          style={{
            flex: 1,
            background: 'var(--vg-bg-card)',
            border: '1px solid var(--vg-border)',
            padding: '12px 16px',
            color: 'var(--vg-text)',
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--vg-gold-border)'}
          onBlur={e => e.target.style.borderColor = 'var(--vg-border)'}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className={loading || !input.trim() ? '' : 'vg-btn-primary'}
          style={{
            width: 46, height: 46,
            background: loading || !input.trim() ? 'var(--vg-bg-card)' : 'var(--vg-gold)',
            border: loading || !input.trim() ? '1px solid var(--vg-border)' : 'none',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
            color: loading || !input.trim() ? 'var(--vg-text-3)' : 'var(--vg-bg)',
            transition: 'all 0.2s',
          }}
          aria-label="Send message"
        >
          {loading ? '⌛' : '➤'}
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: var(--vg-gold-border); border-radius: 2px; }
      `}</style>
    </div>
  );
}
