'use client';

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  count?: number;
  type?: 'card' | 'text' | 'hero' | 'grid';
}

const shimmerVariants = {
  animate: {
    backgroundPosition: ['200% center', '-200% center'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export function SkeletonLoader({ count = 1, type = 'card' }: SkeletonLoaderProps) {
  const shimmerGradient = `
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(255, 255, 255, 0.1) 100%
    )
  `;

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            variants={shimmerVariants}
            animate="animate"
            className="glass-effect rounded-2xl border border-[#3B82F6]/20 overflow-hidden"
            style={{
              backgroundImage: shimmerGradient,
              backgroundSize: '200% 100%',
            }}
          >
            <div className="h-64 bg-[#151B3D]/50" />
            <div className="p-6 space-y-4">
              <div className="h-4 bg-[#151B3D]/50 rounded w-3/4" />
              <div className="h-4 bg-[#151B3D]/50 rounded w-1/2" />
              <div className="h-10 bg-[#151B3D]/50 rounded w-full" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            variants={shimmerVariants}
            animate="animate"
            className="h-4 bg-[#151B3D]/50 rounded"
            style={{
              backgroundImage: shimmerGradient,
              backgroundSize: '200% 100%',
              width: i === count - 1 ? '75%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  if (type === 'hero') {
    return (
      <motion.div
        variants={shimmerVariants}
        animate="animate"
        className="glass-effect rounded-2xl border border-[#3B82F6]/20 overflow-hidden"
        style={{
          backgroundImage: shimmerGradient,
          backgroundSize: '200% 100%',
        }}
      >
        <div className="h-96 flex flex-col items-center justify-center p-8 space-y-4">
          <div className="h-12 bg-[#151B3D]/50 rounded w-1/2" />
          <div className="h-4 bg-[#151B3D]/50 rounded w-1/3" />
          <div className="h-10 bg-[#151B3D]/50 rounded w-1/4" />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          variants={shimmerVariants}
          animate="animate"
          className="glass-effect rounded-xl border border-[#3B82F6]/20 p-6"
          style={{
            backgroundImage: shimmerGradient,
            backgroundSize: '200% 100%',
          }}
        >
          <div className="space-y-3">
            <div className="h-6 bg-[#151B3D]/50 rounded w-1/2" />
            <div className="h-4 bg-[#151B3D]/50 rounded w-full" />
            <div className="h-4 bg-[#151B3D]/50 rounded w-3/4" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
