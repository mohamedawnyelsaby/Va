// src/components/sections/features.tsx
'use client';

import { motion } from 'framer-motion';
import { Globe, Shield, Zap, Brain, CreditCard, Headphones } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const features = [
  {
    icon: Globe,
    title: 'Multilingual Support',
    description: 'Full support for 50+ languages with automatic RTL detection',
    gradient: 'from-[#3B82F6] to-[#06B6D4]'
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'Bank-level encryption with Pi Network and traditional payment options',
    gradient: 'from-[#10B981] to-[#06B6D4]'
  },
  {
    icon: Zap,
    title: 'Fast Booking',
    description: 'Instant confirmations with our AI-powered booking system',
    gradient: 'from-[#F59E0B] to-[#EC4899]'
  },
  {
    icon: Brain,
    title: 'AI Recommendations',
    description: 'Personalized suggestions based on your preferences and behavior',
    gradient: 'from-[#7C5CFC] to-[#A855F7]'
  },
  {
    icon: CreditCard,
    title: 'Pi Network Integration',
    description: 'Pay with Pi cryptocurrency and earn rewards',
    gradient: 'from-[#06B6D4] to-[#3B82F6]'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer service in your language',
    gradient: 'from-[#EC4899] to-[#F59E0B]'
  }
];

export function FeaturesSection({ locale }: { locale: string }) {
  const { t } = useTranslation('home');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[#0A0E27] to-[#0F1635]">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-12"
        >
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            {t('features.title') || 'Why Choose VA?'}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-[#A0A7C7] max-w-2xl mx-auto">
            {t('features.subtitle') || 'We combine cutting-edge technology with world-class service to revolutionize your travel experience.'}
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group glass-effect rounded-2xl p-6 border border-[#3B82F6]/20 hover:border-[#7C5CFC]/50 transition-all duration-300 cursor-pointer"
            >
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${feature.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>

              {/* Description */}
              <p className="text-[#A0A7C7]">{feature.description}</p>

              {/* Gradient line */}
              <div className={`mt-4 h-1 w-12 bg-gradient-to-r ${feature.gradient} rounded-full group-hover:w-full transition-all duration-300`} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
