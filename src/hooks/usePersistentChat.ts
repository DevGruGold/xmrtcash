import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  message_type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    confidence_score?: number;
  };
}

export interface ChatSession {
  id: string;
  session_key?: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

export function usePersistentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSession, setCurrentSession] = useState<string>('default-session');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  // Send message and get AI response
  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim()) return;
    
    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      message_type: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      // Call AI chat function with conversation memory
      const { data, error } = await supabase.functions.invoke('wan-ai-chat', {
        body: {
          message: messageText.trim(),
          conversationHistory: messages.slice(-10) // Send last 10 messages for context
        }
      });

      if (error) throw error;

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        message_type: 'assistant',
        content: data.response || 'I apologize, but I encountered an issue processing your request.',
        timestamp: new Date().toISOString(),
        metadata: {
          confidence_score: 0.9
        }
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        message_type: 'assistant', 
        content: 'I apologize, but I\'m having trouble processing your request right now. Please try again.',
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Message Error",
        description: "Failed to get AI response",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  }, [messages, toast]);

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([{
      id: 'welcome',
      message_type: 'assistant',
      content: 'Hello! I\'m your intelligent AI assistant for the XMRT platform. I have long-term memory and can help you with Monero mining, blockchain technology, and answer any questions you have. How can I assist you today?',
      timestamp: new Date().toISOString(),
      metadata: {
        confidence_score: 1.0
      }
    }]);
    
    toast({
      title: "Chat Cleared",
      description: "Chat history has been cleared",
    });
  }, [toast]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        message_type: 'assistant',
        content: 'Hello! I\'m your intelligent AI assistant for the XMRT platform. I have long-term memory and can help you with Monero mining, blockchain technology, and answer any questions you have. How can I assist you today?',
        timestamp: new Date().toISOString(),
        metadata: {
          confidence_score: 1.0
        }
      }]);
    }
  }, []);

  return {
    messages,
    currentSession,
    isLoading,
    isTyping,
    sendMessage,
    clearChat
  };
}