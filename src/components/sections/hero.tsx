'use client';

import { useState } from 'react';
import { Search, MapPin, Calendar, Users, Sparkles } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

export function HeroSection({ locale }: { locale: string }) {
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

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* High-Tech Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E27] via-[#0F1635] to-[#0A0E27]" />
      
      {/* Dynamic Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#3B82F6]/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-[#7C5CFC]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 w-[600px] h-[300px] bg-[#06B6D4]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid background overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative z-10 container mx-auto px-4 text-center py-20">

        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 gradient-border px-4 py-2 rounded-full mb-8 float-in" style={{
          animation: 'float-up 0.8s ease-out',
          borderRadius: '50px',
        }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#06B6D4] rounded-full animate-pulse" />
            <span className="text-[#A78BFA] text-xs font-medium">AI-Powered · Pi Network · 120+ Countries</span>
          </div>
        </div>

        {/* Main Headline with Gradient Text */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: '1.5rem',
          animation: 'float-up 1s ease-out 0.2s both',
        }}>
          <span className="text-white">Your Global</span><br />
          <span className="gradient-text">AI Travel Assistant</span><br />
          <span className="text-white">Powered by π</span>
        </h1>

        <p className="text-[#A0A7C7] text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed" style={{
          animation: 'float-up 1s ease-out 0.4s both',
        }}>
          Experience the world's smartest travel platform. Book hotels, explore attractions, and discover restaurants—all with advanced AI and instant Pi Network payments.
        </p>

        {/* Search Section */}
        <div className="max-w-3xl mx-auto" style={{
          animation: 'float-up 1s ease-out 0.6s both',
        }}>
          {/* Tabs */}
          <div className="flex gap-2 bg-gradient-to-r from-[#3B82F6]/10 to-[#7C5CFC]/10 rounded-2xl p-1.5 mb-4 backdrop-blur-sm border border-[#3B82F6]/20">
            {tabs.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-xl transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-[#3B82F6] to-[#7C5CFC] text-white shadow-lg shadow-[#3B82F6]/30'
                    : 'text-[#A0A7C7] hover:text-[#E0E5FF]'
                }`}
              >
                {tab === 'Ask AI' ? '✨ Ask AI' : tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="glass-effect rounded-2xl overflow-hidden border border-[#3B82F6]/30 shadow-2xl" style={{
            boxShadow: '0 20px 60px rgba(59, 130, 246, 0.15), inset 0 1px 2px rgba(255,255,255,0.1)',
          }}>
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
              <button
                onClick={handleSearch}
                className="w-full md:w-auto bg-gradient-to-r from-[#3B82F6] to-[#7C5CFC] hover:from-[#60A5FA] hover:to-[#A78BFA] text-white px-8 py-4 font-semibold transition-all duration-300 flex items-center justify-center gap-2 m-1 rounded-xl hover:shadow-lg hover:shadow-[#3B82F6]/40"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>

          {/* Quick suggestions */}
          <div className="flex gap-2 mt-4 justify-center flex-wrap">
            {['🏨 Dubai', '🗼 Paris', '🇯🇵 Tokyo', '🏖️ Bali'].map(suggestion => (
              <button
                key={suggestion}
                onClick={() => setDestination(suggestion.split(' ')[1])}
                className="px-4 py-2 text-sm rounded-lg bg-[#3B82F6]/15 hover:bg-[#3B82F6]/30 text-[#A78BFA] border border-[#3B82F6]/30 transition-all duration-300"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16" style={{
          animation: 'float-up 1s ease-out 0.8s both',
        }}>
          {[
            { val: '10K+', lbl: 'Hotels', icon: '🏨' },
            { val: '50K+', lbl: 'Attractions', icon: '🎭' },
            { val: '120+', lbl: 'Countries', icon: '🌍' },
            { val: '24/7', lbl: 'AI Support', icon: '🤖' },
          ].map((stat) => (
            <div 
              key={stat.lbl} 
              className="group glass-effect rounded-xl p-4 border border-[#3B82F6]/20 hover:border-[#7C5CFC]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#7C5CFC]/20"
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-white text-xl md:text-2xl font-bold mb-1">{stat.val}</div>
              <div className="text-[#707A95] text-sm">{stat.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
