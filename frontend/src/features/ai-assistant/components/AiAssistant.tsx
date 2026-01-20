import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Leaf } from 'lucide-react';
import { getGeminiResponse } from '@services/geminiService';
import { ChatMessage } from '@shared/types';

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Xin chào! Mình là EcoBot 🌱. Mình có thể giúp gì cho bạn về phân loại rác hôm nay?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const botResponseText = await getGeminiResponse(input);

    const botMsg: ChatMessage = { role: 'model', text: botResponseText, timestamp: new Date() };
    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-brand-600 text-white p-4 rounded-full shadow-2xl hover:bg-brand-700 hover:scale-110 transition-all duration-300 group"
      >
        {isOpen ? <X size={24} /> : <Leaf size={28} className="animate-bounce-slow" />}
        {!isOpen && (
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs py-1 px-3 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Hỏi EcoBot ngay!
          </span>
        )}
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`} style={{ height: '500px' }}>

        {/* Header */}
        <div className="bg-brand-500 p-4 rounded-t-2xl flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Bot className="text-white w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-bold">Trợ Lý EcoBot</h3>
            <p className="text-brand-100 text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Sẵn sàng hỗ trợ
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                  ? 'bg-brand-500 text-white rounded-tr-none'
                  : 'bg-white text-gray-700 shadow-sm border border-gray-200 rounded-tl-none'
                }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-200 flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 bg-white rounded-b-2xl border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bạn muốn hỏi gì về rác thải?..."
              className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-brand-500 text-white p-2 rounded-full hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">Powered by Google Gemini</p>
          </div>
        </form>
      </div>
    </>
  );
};

export default AiAssistant;