'use client';

import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, Zap, MessageSquare, Sparkles } from 'lucide-react';

interface DashboardStat {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

export function AIDashboard() {
  const stats: DashboardStat[] = [
    {
      label: 'Total Interactions',
      value: '1,248',
      change: 12.5,
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      label: 'Average Response Time',
      value: '320ms',
      change: -8.3,
      icon: <Clock className="w-5 h-5" />,
    },
    {
      label: 'AI Accuracy',
      value: '94.2%',
      change: 2.1,
      icon: <Zap className="w-5 h-5" />,
    },
    {
      label: 'Bookings Completed',
      value: '156',
      change: 24.8,
      icon: <TrendingUp className="w-5 h-5" />,
    },
  ];

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
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#7C5CFC] flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Dashboard</h1>
          <p className="text-[#707A95]">Monitor your AI assistant performance</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            className="glass-effect rounded-xl p-6 border border-[#3B82F6]/20 group cursor-pointer"
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3B82F6]/20 to-[#7C5CFC]/20 flex items-center justify-center text-[#06B6D4] mb-4 group-hover:scale-110 transition-transform">
              {stat.icon}
            </div>

            {/* Label */}
            <p className="text-[#707A95] text-sm mb-2">{stat.label}</p>

            {/* Value */}
            <h3 className="text-2xl font-bold text-white mb-3">{stat.value}</h3>

            {/* Change */}
            <div className={`text-sm font-semibold ${stat.change > 0 ? 'text-[#10B981]' : 'text-[#EC4899]'}`}>
              {stat.change > 0 ? '+' : ''}{stat.change}% from last month
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Conversations */}
      <motion.div
        variants={itemVariants}
        className="glass-effect rounded-xl border border-[#3B82F6]/20 p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Recent Conversations</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((_, i) => (
            <motion.div
              key={i}
              whileHover={{ x: 8 }}
              className="flex items-center justify-between p-4 bg-[#151B3D] rounded-lg border border-[#3B82F6]/15 hover:border-[#3B82F6]/30 transition-colors"
            >
              <div className="flex-1">
                <p className="text-white font-medium">Hotel recommendations in Paris</p>
                <p className="text-[#707A95] text-sm">2 hours ago</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] text-xs font-semibold">
                Completed
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
