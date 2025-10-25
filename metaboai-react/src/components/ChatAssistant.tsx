// Real LLM-Powered Chat Assistant
// Uses Transformers.js for browser-based language model inference

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { llmService, LLMMessage, LLMResponse } from '../services/llmService';
import { Prediction } from '../types';

interface ChatAssistantProps {
  className?: string;
  predictions?: Prediction[];
  plantType?: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ 
  className = '', 
  predictions,
  plantType 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<LLMMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [modelStatus, setModelStatus] = useState({ isLoading: false, isReady: false });
  const [lastResponse, setLastResponse] = useState<LLMResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize LLM and welcome message
  useEffect(() => {
    const initializeChat = async () => {
      // Check model status
      const status = llmService.getLoadingStatus();
      setModelStatus(status);

      // Initialize model if not ready
      if (!status.isReady && !status.isLoading) {
        setModelStatus({ isLoading: true, isReady: false });
        try {
          await llmService.initializeModel();
          setModelStatus({ isLoading: false, isReady: true });
        } catch (error) {
          console.error('Failed to initialize LLM:', error);
          setModelStatus({ isLoading: false, isReady: false });
        }
      }

      // Add welcome message
      const welcomeMessage: LLMMessage = {
        id: 'welcome',
        role: 'assistant',
content: `Hello ${user?.displayName || 'there'}! I'm SnapFarm AI, your intelligent farming assistant powered by a real language model. I can help you with plant diseases, sustainable farming, crop management, and more. ${predictions && predictions.length > 0 ? 
          `I see you've recently diagnosed ${predictions[0].className}. Would you like specific advice about this?` : 
          'What farming question can I help you with today?'}`,
        timestamp: Date.now()
      };
      
      setMessages([welcomeMessage]);
    };

    initializeChat();
  }, [user, predictions]);

  // Monitor model loading status
  useEffect(() => {
    const checkModelStatus = () => {
      const status = llmService.getLoadingStatus();
      setModelStatus(status);
    };

    const interval = setInterval(checkModelStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentSeason = (): string => {
    const month = new Date().getMonth();
    if (month < 3 || month > 10) return 'winter';
    if (month < 6) return 'spring';
    if (month < 9) return 'summer';
    return 'fall';
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText;
    if (!textToSend.trim()) return;

    // Check if model is ready
    if (!modelStatus.isReady) {
      const errorMessage: LLMMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I\'m still loading my language model. Please wait a moment and try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: LLMMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Generate response using real LLM
      const response = await llmService.generateResponse(textToSend, {
        predictions,
        plantType,
        season: getCurrentSeason()
      });

      const assistantMessage: LLMMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLastResponse(response);
      
      console.log(`LLM Response generated in ${response.processingTime}ms`);
    } catch (error) {
      console.error('Error generating LLM response:', error);
      const errorMessage: LLMMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: "I'm having trouble processing your request right now. This might be due to model loading issues. Please try again in a moment, or ask a simpler question about farming.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    llmService.clearHistory();
    setMessages([]);
    setLastResponse(null);
    
    // Re-add welcome message
    setTimeout(() => {
      const welcomeMessage: LLMMessage = {
        id: 'welcome-new',
        role: 'assistant',
content: "Chat cleared! I'm SnapFarm AI, ready to help with your farming questions using my language model. What would you like to know?",
        timestamp: Date.now()
      };
      setMessages([welcomeMessage]);
    }, 100);
  };

  const initializeModel = async () => {
    setModelStatus({ isLoading: true, isReady: false });
    try {
      await llmService.initializeModel();
      setModelStatus({ isLoading: false, isReady: true });
      
      const successMessage: LLMMessage = {
        id: Date.now().toString(),
        role: 'assistant',
content: "Great! I'm SnapFarm AI and my language model is now loaded and ready. I can provide intelligent responses to your farming questions. What would you like to know?",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, successMessage]);
    } catch (error) {
      setModelStatus({ isLoading: false, isReady: false });
      const errorMessage: LLMMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having trouble loading my language model. I can still help with basic questions, but responses might be limited. Please check your internet connection and try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const getModelStatusColor = () => {
    if (modelStatus.isLoading) return 'bg-yellow-500';
    if (modelStatus.isReady) return 'bg-green-500';
    return 'bg-red-500';
  };

  const getModelStatusText = () => {
    if (modelStatus.isLoading) return 'Loading LLM...';
    if (modelStatus.isReady) return 'LLM Ready';
    return 'LLM Not Ready';
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
<h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">SnapFarm AI</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Real LLM-Powered Assistant</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getModelStatusColor()} ${modelStatus.isLoading ? 'animate-pulse' : ''}`}></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{getModelStatusText()}</span>
          </div>
          {!modelStatus.isReady && !modelStatus.isLoading && (
            <button
              onClick={initializeModel}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
            >
              Load Model
            </button>
          )}
          <button
            onClick={clearChat}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Clear chat"
          >
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Model Status Banner */}
      {modelStatus.isLoading && (
        <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
            <div className="animate-spin w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
            <span className="text-sm">Loading language model... This may take a moment on first use.</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-4xl ${
              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-green-600 text-white'
              }`}>
                <span className="text-sm">
{message.role === 'user' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </span>
              </div>
              
              {/* Message bubble */}
              <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
              }`}>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-line text-sm leading-relaxed mb-0">
                    {message.content}
                  </p>
                </div>
                
                <p className="text-xs mt-2 opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">AI is thinking...</p>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Performance Info */}
      {lastResponse && modelStatus.isReady && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
<span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Real LLM Response
            </span>
<span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {lastResponse.processingTime}ms • 
              <svg className="w-3 h-3 ml-1 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {(lastResponse.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={modelStatus.isReady ? "Ask me anything about farming..." : "Please wait for model to load..."}
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
              disabled={isTyping || !modelStatus.isReady}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping || !modelStatus.isReady}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {/* Context indicator */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            {predictions && predictions.length > 0 && (
              <div className="flex items-center space-x-1">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Context: {predictions[0].className} detected</span>
              </div>
            )}
            {plantType && (
              <div className="flex items-center space-x-1">
                <span>🌿</span>
                <span>Plant: {plantType}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-1">
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Powered by Transformers.js</span>
          </div>
        </div>
      </div>
    </div>
  );
};