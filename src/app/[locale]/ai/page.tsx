'use client';
// src/app/[locale]/ai/page.tsx
// 🌍 Logy AI — Global Multilingual Travel Assistant

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
      background: 'linear-gradient(160deg, #050d1a 0%, #0a1628 40%, #050d1a 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
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
        background: 'radial-gradient(circle, rgba(0,179,165,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(5,13,26,0.8)',
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
            borderRadius: 12,
            background: 'linear-gradient(135deg, #00b3a5 0%, #0097a7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            boxShadow: '0 0 20px rgba(0,179,165,0.3)',
          }}>🤖</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>
              Logy AI
            </div>
            <div style={{ color: '#00b3a5', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00b3a5', display: 'inline-block' }} />
              Online • 🌍 All Languages • π Pi Network
            </div>
          </div>
        </div>
        <a href="/ar" style={{
          color: 'rgba(255,255,255,0.4)',
          textDecoration: 'none',
          fontSize: 13,
          padding: '6px 12px',
          borderRadius: 8,
          border: '1px solid rgba(255,255,255,0.1)',
        }}>← Back</a>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
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
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #00b3a5, #0097a7)'
                : 'rgba(255,255,255,0.06)',
              border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
              color: '#fff',
              fontSize: 14.5,
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap',
              boxShadow: msg.role === 'user'
                ? '0 4px 15px rgba(0,179,165,0.3)'
                : '0 2px 8px rgba(0,0,0,0.2)',
            }}>
              {msg.content}
            </div>

            {/* Hotel Results */}
            {msg.hotels && msg.hotels.length > 0 && (
              <div style={{ width: '100%', marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, paddingLeft: 4 }}>
                  🏨 {msg.hotels.length} hotels found from Booking.com
                </div>
                {msg.hotels.map((hotel: any) => (
                  <div key={hotel.id} style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: 14,
                    overflow: 'hidden',
                    display: 'flex',
                    transition: 'border-color 0.2s',
                  }}>
                    {hotel.thumbnail && (
                      <img
                        src={hotel.thumbnail}
                        alt={hotel.name}
                        style={{ width: 90, height: 90, objectFit: 'cover', flexShrink: 0 }}
                      />
                    )}
                    <div style={{ padding: '10px 14px', flex: 1, minWidth: 0 }}>
                      <div style={{
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 13.5,
                        marginBottom: 5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {hotel.name}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                        {hotel.stars > 0 && (
                          <span style={{ color: '#ffd700', fontSize: 11 }}>
                            {'★'.repeat(Math.min(hotel.stars, 5))}
                          </span>
                        )}
                        {hotel.rating && (
                          <span style={{
                            background: 'rgba(0,179,165,0.2)',
                            color: '#00b3a5',
                            padding: '2px 7px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 700,
                            border: '1px solid rgba(0,179,165,0.3)',
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
                            window.location.href = `/ar/booking?${params.toString()}`;
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #00b3a5, #26c6da)',
                            color: '#fff',
                            border: 'none',
                            padding: '7px 14px',
                            borderRadius: 9,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 600,
                            boxShadow: '0 2px 8px rgba(0,179,165,0.3)',
                          }}
                        >
                          Book Now →
                        </button>
                        <div>
                          <span style={{ color: '#00b3a5', fontWeight: 700, fontSize: 15 }}>
                            ${hotel.price}
                          </span>
                          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>/night</span>
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
              borderRadius: '4px 18px 18px 18px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              gap: 5,
              alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#00b3a5',
                  animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions - show at start */}
      {messages.length <= 1 && (
        <div style={{ padding: '0 16px 10px' }}>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginBottom: 8, textAlign: 'center' }}>
            Try in any language:
          </div>
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 4 }}>
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => sendMessage(action.text)}
                style={{
                  background: 'rgba(0,179,165,0.08)',
                  border: '1px solid rgba(0,179,165,0.2)',
                  color: 'rgba(255,255,255,0.7)',
                  padding: '8px 13px',
                  borderRadius: 20,
                  cursor: 'pointer',
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  flexShrink: 0,
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
        borderTop: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(5,13,26,0.9)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
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
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 14,
            padding: '12px 16px',
            color: '#fff',
            fontSize: 14.5,
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(0,179,165,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{
            width: 46,
            height: 46,
            borderRadius: 13,
            background: loading || !input.trim()
              ? 'rgba(255,255,255,0.06)'
              : 'linear-gradient(135deg, #00b3a5, #26c6da)',
            border: 'none',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            transition: 'all 0.2s',
            flexShrink: 0,
            boxShadow: loading || !input.trim() ? 'none' : '0 4px 15px rgba(0,179,165,0.4)',
          }}
        >
          {loading ? '⌛' : '➤'}
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,179,165,0.2); border-radius: 2px; }
      `}</style>
    </div>
  );
}
