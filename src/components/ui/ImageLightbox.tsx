'use client';
// PATH: src/components/ui/ImageLightbox.tsx
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  alt?: string;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex = 0, alt = '', onClose }: ImageLightboxProps) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, prev, next]);

  if (!images.length) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(3,2,10,0.96)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: '1px solid rgba(242,238,230,0.2)', cursor: 'pointer', color: '#F2EEE6', padding: '0.5rem', display: 'flex', zIndex: 1 }}
      >
        <X size={18} />
      </button>

      {/* Counter */}
      <div style={{ position: 'absolute', top: '1.5rem', left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-space-mono)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'rgba(242,238,230,0.5)' }}>
        {current + 1} / {images.length}
      </div>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev(); }}
          style={{ position: 'absolute', left: '1.5rem', background: 'rgba(3,2,10,0.7)', border: '1px solid rgba(242,238,230,0.2)', cursor: 'pointer', color: '#F2EEE6', padding: '0.75rem', display: 'flex', zIndex: 1 }}
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Image */}
      <div
        onClick={e => e.stopPropagation()}
        style={{ position: 'relative', maxWidth: '90vw', maxHeight: '85vh', width: '900px', height: '600px' }}
      >
        <Image
          src={images[current]}
          alt={`${alt} ${current + 1}`}
          fill
          style={{ objectFit: 'contain' }}
          sizes="90vw"
          priority
        />
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next(); }}
          style={{ position: 'absolute', right: '1.5rem', background: 'rgba(3,2,10,0.7)', border: '1px solid rgba(242,238,230,0.2)', cursor: 'pointer', color: '#F2EEE6', padding: '0.75rem', display: 'flex', zIndex: 1 }}
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem' }}>
          {images.slice(0, 8).map((img, i) => (
            <div
              key={i}
              onClick={e => { e.stopPropagation(); setCurrent(i); }}
              style={{ width: '48px', height: '36px', position: 'relative', cursor: 'pointer', border: `1px solid ${i === current ? 'var(--vg-gold)' : 'rgba(242,238,230,0.2)'}`, overflow: 'hidden', flexShrink: 0, opacity: i === current ? 1 : 0.5, transition: 'opacity 0.2s, border-color 0.2s' }}
            >
              <Image src={img} alt={`thumb ${i + 1}`} fill style={{ objectFit: 'cover' }} sizes="48px" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Hook to manage lightbox state
export function useImageLightbox(images: string[]) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const openAt = useCallback((i: number) => { setIndex(i); setOpen(true); }, []);
  const close = useCallback(() => setOpen(false), []);

  return { open, index, openAt, close };
}
