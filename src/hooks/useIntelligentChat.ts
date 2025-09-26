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
  has_audio?: boolean;
}

export interface ChatSession {
  id: string;
  session_key: string;
  title?: string;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
}

export function useIntelligentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  // Initialize or get current session
  const initializeSession = useCallback(async () => {
    try {
      // Create a new session
      const { data: session, error: sessionError } = await (supabase as any)
        .from('conversation_sessions')
        .insert({
          session_key: `Chat ${new Date().toLocaleString()}`,
          title: `Chat ${new Date().toLocaleString()}`,
          is_active: true
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      setCurrentSession(session);
      
      // Add initial system message
      const { error: messageError } = await (supabase as any)
        .from('conversation_messages')
        .insert({
          session_id: session?.id,
          message_type: 'assistant',
          content: 'Hello! I\'m your intelligent AI assistant for the XMRT platform. I can help you with Monero mining, blockchain technology, and answer any questions you have. How can I assist you today?',
          metadata: {
            confidence_score: 1.0
          }
        });

      if (messageError) throw messageError;

      // Load the initial message
      if (session?.id) {
        loadMessages(session.id);
      }
      
    } catch (error) {
      console.error('Error initializing session:', error);
      toast({
        title: "Session Error",
        description: "Failed to initialize chat session",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Load messages for current session
  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await (supabase as any)
        .from('conversation_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load chat history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Send message and get AI response
  const sendMessage = useCallback(async (messageText: string) => {
    if (!currentSession || !messageText.trim()) return;
    
    try {
      setIsTyping(true);
      
      // Call AI chat function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          sessionId: currentSession.id,
          userMessage: messageText.trim()
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'AI response failed');
      }

      // Reload messages to show the new conversation
      await loadMessages(currentSession.id);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Message Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
    }
  }, [currentSession, loadMessages, toast]);

  // Clear chat history
  const clearChat = useCallback(async () => {
    if (!currentSession) return;
    
    try {
      // Delete all messages for this session
      const { error } = await (supabase as any)
        .from('conversation_messages')
        .delete()
        .eq('session_id', currentSession.id);

      if (error) throw error;

      // Create a new session
      await initializeSession();
      
      toast({
        title: "Chat Cleared",
        description: "Chat history has been cleared and a new session started",
      });
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast({
        title: "Clear Error",
        description: "Failed to clear chat history",
        variant: "destructive"
      });
    }
  }, [currentSession, initializeSession, toast]);

  // Initialize session on mount
  useEffect(() => {
    if (!currentSession) {
      initializeSession();
    }
  }, [currentSession, initializeSession]);

  // Set up real-time message updates
  useEffect(() => {
    if (!currentSession) return;

    const channel = supabase
      .channel('chat-messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_messages',
          filter: `session_id=eq.${currentSession.id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentSession]);

  return {
    messages,
    currentSession,
    isLoading,
    isTyping,
    sendMessage,
    clearChat,
    initializeSession
  };
}