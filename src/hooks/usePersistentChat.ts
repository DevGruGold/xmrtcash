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

export function usePersistentChat(pageContext?: any) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  // Initialize session and load messages
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Create a new session
        const { data: session, error: sessionError } = await supabase
          .from('conversation_sessions')
          .insert({
            session_key: `session-${Date.now()}`,
            title: 'XMRT Chat Session',
            metadata: { pageContext: pageContext?.data || {} }
          })
          .select()
          .single();

        if (sessionError) throw sessionError;

        setCurrentSessionId(session.id);
        
        // Add welcome message
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          message_type: 'assistant',
          content: 'Hello! I\'m your intelligent AI assistant for the XMRT platform. I can see your current mining stats and help you with Monero mining, blockchain technology, and answer any questions you have. How can I assist you today?',
          timestamp: new Date().toISOString(),
          metadata: { confidence_score: 1.0 }
        };
        setMessages([welcomeMessage]);

      } catch (error) {
        console.error('Failed to initialize session:', error);
        // Fallback to local mode
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          message_type: 'assistant',
          content: 'Hello! I\'m your AI assistant. I\'m currently in offline mode, but I can still help you with general questions.',
          timestamp: new Date().toISOString(),
          metadata: { confidence_score: 1.0 }
        };
        setMessages([welcomeMessage]);
      }
    };

    initializeSession();
  }, []);

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
      // Store user message in database
      if (currentSessionId) {
        await supabase
          .from('conversation_messages')
          .insert({
            session_id: currentSessionId,
            message_type: 'user',
            content: messageText.trim(),
            metadata: {}
          });
      }

      // Call AI chat function with conversation memory and page context
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          sessionId: currentSessionId,
          userMessage: messageText.trim(),
          pageContext: pageContext?.data || null,
          conversationHistory: messages.slice(-10).map(msg => ({
            role: msg.message_type === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
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
  }, [messages, currentSessionId, pageContext, toast]);

  // Clear chat history
  const clearChat = useCallback(async () => {
    try {
      // Clear messages from database
      if (currentSessionId) {
        await supabase
          .from('conversation_messages')
          .delete()
          .eq('session_id', currentSessionId);
        
        // Update session metadata
        await supabase
          .from('conversation_sessions')
          .update({ 
            updated_at: new Date().toISOString(),
            metadata: { cleared: true, pageContext: pageContext?.data || {} }
          })
          .eq('id', currentSessionId);
      }

      // Reset local messages
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        message_type: 'assistant',
        content: 'Hello! I\'m your intelligent AI assistant for the XMRT platform. I can see your current mining stats and have long-term memory. How can I assist you today?',
        timestamp: new Date().toISOString(),
        metadata: { confidence_score: 1.0 }
      };
      
      setMessages([welcomeMessage]);
      
      toast({
        title: "Chat Cleared",
        description: "Chat history has been cleared from memory and database",
      });
    } catch (error) {
      console.error('Failed to clear chat:', error);
      toast({
        title: "Clear Failed",
        description: "Failed to clear chat history",
        variant: "destructive"
      });
    }
  }, [currentSessionId, pageContext, toast]);

  // Store conversation context for long-term memory
  const storeMemoryContext = useCallback(async (content: string, contextType: string) => {
    if (!currentSessionId) return;
    
    try {
      await supabase
        .from('memory_contexts')
        .insert({
          user_id: 'anonymous', // Would use auth.uid() in authenticated version
          session_id: currentSessionId,
          content,
          context_type: contextType,
          importance_score: 0.8,
          metadata: { pageContext: pageContext?.data || {} }
        });
    } catch (error) {
      console.error('Failed to store memory context:', error);
    }
  }, [currentSessionId, pageContext]);

  return {
    messages,
    currentSessionId,
    isLoading,
    isTyping,
    sendMessage,
    clearChat,
    storeMemoryContext
  };
}