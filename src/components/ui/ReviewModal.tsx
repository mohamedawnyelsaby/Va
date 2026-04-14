'use client';
// PATH: src/components/ui/ReviewModal.tsx
import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { VG, monoLabel } from '@/lib/tokens';
import { useToast } from '@/components/ui/use-toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
  itemType: 'hotel' | 'attraction' | 'restaurant';
}

export function ReviewModal({ isOpen, onClose, itemId, itemName, itemType }: ReviewModalProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!rating) { toast({ title: 'Please select a rating', variant: 'destructive' }); return; }
    if (comment.length < 10) { toast({ title: 'Comment must be at least 10 characters', variant: 'destructive' }); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, itemType, rating, title, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit review');
      toast({ title: 'Review submitted!', variant: 'success' });
      onClose();
      setRating(0); setTitle(''); setComment('');
    } catch (e: any) {
      toast({ title: e.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    background: 'var(--vg-bg-surface)', border: '1px solid var(--vg-border)',
    padding: '0.75rem 0.9rem', fontFamily: 'var(--font-dm-sans)',
    fontSize: VG.font.body, color: 'var(--vg-text)', outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 8000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(3,2,10,0.8)' }} />
      <div style={{ position: 'relative', zIndex: 1, background: 'var(--vg-bg-card)', border: '1px solid var(--vg-gold-border)', width: '100%', maxWidth: '480px' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ height: '2px', background: 'linear-gradient(to right, var(--vg-gold), var(--vg-gold-2))' }} />
        <div style={{ padding: '1.8rem' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div className="vg-overline" style={{ marginBottom: '0.5rem' }}>Write a Review</div>
              <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.3rem', fontWeight: 300, color: 'var(--vg-text)' }}>{itemName}</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--vg-text-3)', padding: '0.25rem' }}>
              <X size={18} />
            </button>
          </div>

          {/* Stars */}
          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ ...monoLabel, display: 'block', marginBottom: '0.5rem' }}>Rating</div>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', fontSize: '1.6rem', color: s <= (hovered || rating) ? 'var(--vg-star)' : 'var(--vg-border)', transition: 'color 0.15s' }}>
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ ...monoLabel, display: 'block', marginBottom: '0.5rem' }}>Title (optional)</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Summarize your experience" style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--vg-gold-border)'}
              onBlur={e => e.target.style.borderColor = 'var(--vg-border)'} />
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ ...monoLabel, display: 'block', marginBottom: '0.5rem' }}>Your Review</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience in detail..." rows={4}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
              onFocus={e => e.target.style.borderColor = 'var(--vg-gold-border)'}
              onBlur={e => e.target.style.borderColor = 'var(--vg-border)'} />
            <div style={{ ...monoLabel, marginTop: '0.3rem', fontSize: '0.55rem', color: comment.length < 10 ? '#ef4444' : 'var(--vg-text-3)' }}>
              {comment.length} / 2000 chars (min 10)
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading} className="vg-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
