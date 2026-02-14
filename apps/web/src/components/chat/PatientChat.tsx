import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { cn } from '../../utils/cn';
// import { detectQuestionType, generateResponse } from '../../data/chatResponses';
import type { Patient, ChatMessage } from '../../types';

interface PatientChatProps {
  patient: Patient;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const PatientChat: React.FC<PatientChatProps> = ({ patient, isOpen: controlledIsOpen, onOpenChange }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen ?? internalIsOpen;
  const setIsOpen = (open: boolean) => {
    setInternalIsOpen(open);
    onOpenChange?.(open);
  };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Add welcome message when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! Ask me anything about patient data, risks, labs, or upcoming sessions.`,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, patient.name]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);

    try {
      const apiResponse = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          context: patient
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch response');
      }

      const data = await apiResponse.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error in chat:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error.message || "I'm sorry, I'm having trouble connecting to the server."}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const formatMessage = (content: string) => {
    // Convert markdown-style bold to HTML
    return content.split('\n').map((line, i) => (
      <p key={i} className="mb-2 last:mb-0">
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="text-renal-text">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-14 right-0 bottom-0 w-[400px] bg-renal-panel border-l border-renal-border shadow-2xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-renal-border bg-renal-panel shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rs-blue flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-renal-text text-sm">Chat</h3>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors text-renal-muted hover:text-renal-text"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-2',
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {/* Avatar */}
            <div className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
              message.role === 'user'
                ? 'bg-rs-blue/20 text-rs-blue'
                : 'bg-rs-blue/10 text-rs-blue'
            )}>
              {message.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            {/* Message Bubble */}
            <div className={cn(
              'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
              message.role === 'user'
                ? 'bg-rs-blue/10 text-renal-text rounded-tr-sm'
                : 'bg-renal-bg border border-renal-border text-renal-muted rounded-tl-sm'
            )}>
              {formatMessage(message.content)}
            </div>
          </div>
        ))}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-lg bg-rs-blue/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-rs-blue" />
            </div>
            <div className="bg-renal-bg border border-renal-border rounded-2xl rounded-tl-sm px-3 py-2">
              <div className="flex items-center gap-2 text-renal-muted text-sm">
                <span>Analyzing patient data</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-rs-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-rs-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-rs-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-renal-border bg-renal-panel-secondary p-3 shrink-0">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-renal-bg border border-renal-border rounded-lg px-3 py-2 text-sm text-renal-text placeholder:text-renal-muted focus:outline-none focus:border-rs-blue focus:ring-1 focus:ring-rs-blue/50 transition-all"
          />
          <button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isThinking}
            className={cn(
              'p-2 rounded-lg transition-all duration-150',
              inputValue.trim() && !isThinking
                ? 'bg-rs-blue text-white hover:brightness-110'
                : 'bg-renal-bg text-renal-muted cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
