import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Loader2 } from 'lucide-react';
import ChatMessage from '../components/ai/ChatMessage';
import HealthCard from '../components/ai/HealthCard';
import LeakDetectionPanel from '../components/ai/LeakDetectionPanel';
import { ChatMessage as ChatMessageType } from '../types';
import { apiPost } from '../utils/api';

const suggestedQuestions = [
  'Is today\'s water safe?',
  'Which pumps need maintenance?',
  'Show recent complaints',
  'Why is water supply low?',
  'Predict next week\'s usage',
  'What are the quality trends?',
];

const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      _id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI Water Management Assistant. I can help you with:\n\n• Water quality analysis\n• Pump health monitoring\n• Leak detection\n• Usage predictions\n• Complaint summaries\n\nHow can I assist you today?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (question?: string) => {
    const text = question || input;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessageType = {
      _id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiPost<{ success: boolean; data: { response: string; suggestions: string[] } }>('/ai/chat', {
        message: text,
      });
      const assistantMessage: ChatMessageType = {
        _id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data?.response || 'No response received.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Mock response
      const mockResponse: ChatMessageType = {
        _id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getMockResponse(text),
        timestamp: new Date().toISOString(),
      };
      setTimeout(() => {
        setMessages((prev) => [...prev, mockResponse]);
        setIsLoading(false);
      }, 1000);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const getMockResponse = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes('safe') || q.includes('quality')) {
      return 'Based on the latest readings from 2 hours ago:\n\n✅ pH Level: 7.2 (Safe)\n✅ TDS: 285 mg/L (Within limits)\n✅ Turbidity: 0.8 NTU (Clear)\n✅ Chlorine: 0.5 mg/L (Adequate)\n\nOverall Status: **SAFE** for consumption.\n\nAll parameters are within BIS drinking water standards.';
    }
    if (q.includes('maintenance') || q.includes('pump')) {
      return ' pumps requiring attention:\n\n🔴 P-007: Efficiency dropped to 45% - Immediate maintenance needed\n🟡 P-005: Running hours exceeding threshold (850h)\n🟡 P-003: Efficiency below 80%\n\nRecommended Actions:\n1. Schedule maintenance for P-007 within 24 hours\n2. Check P-005 bearing and seals\n3. Inspect P-003 impeller';
    }
    if (q.includes('complaint')) {
      return 'Recent Complaints Summary:\n\n📋 Total Active: 8 complaints\n• 3 Pending assignment\n• 3 In progress\n• 2 Resolved this week\n\nTop Issues:\n1. Water discoloration (3 reports)\n2. Low pressure (2 reports)\n3. Leakage (2 reports)\n\nAverage resolution time: 2.3 days';
    }
    if (q.includes('low') || q.includes('supply')) {
      return 'Water Supply Analysis:\n\nCurrent supply is 12% below normal. Possible reasons:\n\n1. 🌡️ High demand due to summer season (+18% usage)\n2. 🔧 P-007 offline affecting Pump Station A\n3. 💧 Tank B level at 45% - below optimal\n\nRecommendations:\n• Increase pumping from Station B\n• Schedule Tank B refill\n• Monitor usage patterns';
    }
    return 'I understand your question. Based on current system data:\n\n• 21 of 24 pumps are operational\n• Water quality is within safe limits\n• 3 active leaks being addressed\n• Tank levels averaging 72%\n\nWould you like me to provide more details on any specific area?';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Get AI-powered insights for your water management
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col h-[600px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((message) => (
                <ChatMessage key={message._id} message={message} />
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 2 && (
              <div className="px-4 pb-3">
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSend(question)}
                      className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about water quality, pumps, complaints..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Health Cards */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Pump Health
            </h3>
            <div className="space-y-4">
              <HealthCard
                name="Pump P-001"
                healthScore={92}
                failureRisk="low"
                recommendation="Continue regular maintenance schedule"
                lastMaintenance="5 days ago"
              />
              <HealthCard
                name="Pump P-007"
                healthScore={45}
                failureRisk="high"
                recommendation="Immediate inspection required. Check motor and impeller."
                lastMaintenance="45 days ago"
              />
            </div>
          </div>

          {/* Leak Detection */}
          <LeakDetectionPanel />
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
