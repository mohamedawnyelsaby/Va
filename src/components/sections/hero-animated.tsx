'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function HeroAnimated({ locale }: { locale: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Hotels');
  const [destination, setDestination] = useState('');

  const tabs = ['Hotels', 'Attractions', 'Restaurants', 'Ask AI'];

  const handleSearch = () => {
    if (activeTab === 'Ask AI') {
      router.push(`/${locale}/ai`);
    } else {
      const path = activeTab === 'Hotels' ? 'hotels' : activeTab === 'Attractions' ? 'attractions' : 'restaurants';
      router.push(`/${locale}/${path}${destination ? `?search=${destination}` : ''}`);
    }
  };

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
      transition: {
        duration: 0.8,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E27] via-[#0F1635] to-[#0A0E27]" />
      
      {/* Animated Gradient Orbs */}
      <motion.div
        animate={{
          y: [0, 30, 0],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#3B82F6]/15 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, 30, 0],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-[#7C5CFC]/15 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{
          y: [0, -30, 0],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-0 left-1/2 w-[600px] h-[300px] bg-[#06B6D4]/10 rounded-full blur-[120px] pointer-events-none"
      />

      {/* Grid background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container mx-auto px-4 text-center py-20"
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-[#3B82F6]/30 bg-gradient-to-r from-[#3B82F6]/10 to-[#7C5CFC]/10"
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 bg-[#06B6D4] rounded-full"
          />
          <span className="text-[#A78BFA] text-xs font-medium">AI-Powered · Pi Network · 120+ Countries</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight"
        >
          <span className="text-white">Your Global</span><br />
          <motion.span
            className="bg-gradient-to-r from-[#3B82F6] via-[#7C5CFC] to-[#06B6D4] bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            AI Travel Assistant
          </motion.span>
          <br />
          <span className="text-white">Powered by π</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-[#A0A7C7] text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed"
        >
          Experience the world&apos;s smartest travel platform. Book hotels, explore attractions, and discover restaurants—all with advanced AI and instant Pi Network payments.
        </motion.p>

        {/* Search Section */}
        <motion.div
          variants={itemVariants}
          className="max-w-3xl mx-auto"
        >
          {/* Tabs */}
          <motion.div className="flex gap-2 bg-gradient-to-r from-[#3B82F6]/10 to-[#7C5CFC]/10 rounded-2xl p-1.5 mb-4 backdrop-blur-sm border border-[#3B82F6]/20">
            {tabs.map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-xl transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-[#3B82F6] to-[#7C5CFC] text-white shadow-lg shadow-[#3B82F6]/30'
                    : 'text-[#A0A7C7] hover:text-[#E0E5FF]'
                }`}
              >
                {tab === 'Ask AI' ? '✨ Ask AI' : tab}
              </motion.button>
            ))}
          </motion.div>

          {/* Search Box */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="glass-effect rounded-2xl overflow-hidden border border-[#3B82F6]/30 shadow-2xl"
            style={{
              boxShadow: '0 20px 60px rgba(59, 130, 246, 0.15), inset 0 1px 2px rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex items-center flex-wrap md:flex-nowrap gap-0">
              <div className="flex items-center gap-3 px-5 py-4 flex-1 border-b md:border-b-0 md:border-r border-[#3B82F6]/20 w-full md:w-auto">
                <MapPin className="w-5 h-5 text-[#06B6D4] flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Where to?"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="bg-transparent outline-none text-white placeholder:text-[#707A95] text-sm flex-1"
                />
              </div>
              <div className="flex items-center gap-3 px-5 py-4 border-b md:border-b-0 md:border-r border-[#3B82F6]/20 w-full md:w-auto">
                <Calendar className="w-5 h-5 text-[#7C5CFC] flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Check in"
                  onFocus={e => (e.target.type = 'date')}
                  onBlur={e => (e.target.type = 'text')}
                  className="bg-transparent outline-none text-white placeholder:text-[#707A95] text-sm w-28"
                />
              </div>
              <div className="flex items-center gap-3 px-5 py-4 border-b md:border-b-0 md:border-r border-[#3B82F6]/20 w-full md:w-auto">
                <Users className="w-5 h-5 text-[#EC4899] flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Guests"
                  className="bg-transparent outline-none text-white placeholder:text-[#707A95] text-sm w-20"
                />
              </div>
              <motion.button
                onClick={handleSearch}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full md:w-auto bg-gradient-to-r from-[#3B82F6] to-[#7C5CFC] hover:from-[#60A5FA] hover:to-[#A78BFA] text-white px-8 py-4 font-semibold transition-all duration-300 flex items-center justify-center gap-2 m-1 rounded-xl hover:shadow-lg hover:shadow-[#3B82F6]/40"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Quick suggestions */}
          <motion.div
            className="flex gap-2 mt-4 justify-center flex-wrap"
            variants={containerVariants}
          >
            {['🏨 Dubai', '🗼 Paris', '🇯🇵 Tokyo', '🏖️ Bali'].map((suggestion) => (
              <motion.button
                key={suggestion}
                onClick={() => setDestination(suggestion.split(' ')[1])}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm rounded-lg bg-[#3B82F6]/15 hover:bg-[#3B82F6]/30 text-[#A78BFA] border border-[#3B82F6]/30 transition-all duration-300"
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
        >
          {[
            { val: '10K+', lbl: 'Hotels', icon: '🏨' },
            { val: '50K+', lbl: 'Attractions', icon: '🎭' },
            { val: '120+', lbl: 'Countries', icon: '🌍' },
            { val: '24/7', lbl: 'AI Support', icon: '🤖' },
          ].map((stat) => (
            <motion.div
              key={stat.lbl}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group glass-effect rounded-xl p-4 border border-[#3B82F6]/20 hover:border-[#7C5CFC]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#7C5CFC]/20"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-2xl mb-2"
              >
                {stat.icon}
              </motion.div>
              <div className="text-white text-xl md:text-2xl font-bold mb-1">{stat.val}</div>
              <div className="text-[#707A95] text-sm">{stat.lbl}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
