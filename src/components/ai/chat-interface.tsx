'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to VA AI Assistant! I can help you find the perfect travel experience. What are you looking for?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I found some great options for you. Would you like me to show you specific hotels or attractions?',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setLoading(false);
      inputRef.current?.focus();
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#0A0E27] to-[#1A1B4D]">
      {/* Header */}
      <div className="border-b border-[#3B82F6]/20 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#7C5CFC] flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-semibold">VA Assistant</h2>
          <p className="text-[#707A95] text-sm">Online · AI-Powered</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-[#3B82F6] to-[#7C5CFC] text-white rounded-br-none'
                    : 'bg-[#151B3D] border border-[#3B82F6]/30 text-[#F0F4FF] rounded-bl-none'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-white/60' : 'text-[#707A95]'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#7C5CFC] flex items-center justify-center">
              <Loader className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="text-[#707A95] text-sm">AI is thinking...</div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[#3B82F6]/20 p-4">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 bg-[#151B3D] border border-[#3B82F6]/30 rounded-xl px-4 py-3 text-white placeholder:text-[#707A95] focus:outline-none focus:border-[#3B82F6]/60 transition-colors"
          />
          <motion.button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#7C5CFC] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
