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
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#07090F]">

      {/* Glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#7C5CFC]/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-10 right-0 w-[300px] h-[300px] bg-[#EAB308]/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 container mx-auto px-4 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-[#7C5CFC]/30 bg-[#7C5CFC]/08 text-[#A78BFA] text-xs px-4 py-2 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-[#EAB308] rounded-full animate-pulse" />
          AI-Powered · Pi Network · 120+ Countries
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium text-white leading-tight mb-4">
          Travel the World,<br />
          Pay with{' '}
          <span className="text-[#EAB308]">π Pi</span>
          {' '}—{' '}
          <span className="text-[#7C5CFC]">Instantly</span>
        </h1>

        <p className="text-white/40 text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
          The first global travel platform powered by AI and Pi Network.<br />
          Book hotels, attractions & restaurants in seconds.
        </p>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-1 bg-white/4 rounded-xl p-1 mb-3">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-[#7C5CFC]/20 text-[#A78BFA]'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                {tab === 'Ask AI' ? '🤖 Ask AI' : tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 flex-1 border-r border-white/7">
              <MapPin className="h-4 w-4 text-white/25 shrink-0" />
              <input
                type="text"
                placeholder="Where do you want to go?"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="bg-transparent outline-none text-white/65 placeholder:text-white/25 text-sm w-full"
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 border-r border-white/7">
              <Calendar className="h-4 w-4 text-white/25 shrink-0" />
              <input
                type="text"
                placeholder="Check in"
                onFocus={e => (e.target.type = 'date')}
                onBlur={e => (e.target.type = 'text')}
                className="bg-transparent outline-none text-white/65 placeholder:text-white/25 text-sm w-24"
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-3">
              <Users className="h-4 w-4 text-white/25 shrink-0" />
              <input
                type="text"
                placeholder="Guests"
                className="bg-transparent outline-none text-white/65 placeholder:text-white/25 text-sm w-16"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-[#7C5CFC] hover:bg-[#6D4EE8] text-white px-6 py-3 text-sm font-medium transition-colors flex items-center gap-2 m-1 rounded-lg"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center items-center gap-8 mt-10 flex-wrap">
          {[
            { val: '10K+', lbl: 'Hotels' },
            { val: '50K+', lbl: 'Attractions' },
            { val: '120+', lbl: 'Countries' },
            { val: 'π AI', lbl: 'Powered' },
          ].map((s, i) => (
            <div key={s.lbl} className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-white text-xl font-medium">{s.val}</div>
                <div className="text-white/30 text-xs mt-1">{s.lbl}</div>
              </div>
              {i < 3 && <div className="w-px h-8 bg-white/7" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
