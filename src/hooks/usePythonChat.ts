import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  message_type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: any;
}

interface PythonChatOptions {
  onMessage?: (message: ChatMessage) => void;
  pythonFirst?: boolean; // Route through Python executor
}

/**
 * Python-first chat hook
 * Routes all chat interactions through the Python executor
 * which then orchestrates calls to ai-chat and other edge functions
 */
export const usePythonChat = (options?: PythonChatOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      const { data, error } = await supabase
        .from('conversation_sessions')
        .insert({
          session_key: `python-${Date.now()}`,
          is_active: true,
          metadata: { mode: 'python-first', created_at: new Date().toISOString() }
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentSessionId(data.id);

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: `welcome-${Date.now()}`,
        message_type: 'assistant',
        content: '🐍 Python-First Mode Active\n\nI\'m now orchestrating all operations through Python, giving me access to parallel processing, advanced logic, and seamless integration with all 100+ edge functions.',
        timestamp: new Date().toISOString(),
        metadata: { python_mode: true }
      };
      setMessages([welcomeMessage]);
    } catch (error: any) {
      console.error('Failed to initialize session:', error);
      toast({
        title: 'Session Error',
        description: 'Failed to initialize Python chat session',
        variant: 'destructive'
      });
    }
  };

  const sendMessage = async (messageText: string, pageContext?: any) => {
    if (!messageText.trim() || !currentSessionId) return;

    setIsLoading(true);

    try {
      // Add user message to UI
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        message_type: 'user',
        content: messageText.trim(),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      // Store user message in database
      await supabase
        .from('conversation_messages')
        .insert({
          session_id: currentSessionId,
          message_type: 'user',
          content: messageText.trim(),
          metadata: { python_mode: true }
        });

      // Build conversation history
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.message_type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Generate Python code to orchestrate the chat
      const pythonCode = `
import json

# Initialize ElizaTools (available as global 'tools')
result = await tools.ai_chat(
    message=${JSON.stringify(messageText.trim())},
    context=${JSON.stringify(pageContext?.data || null)},
    conversation_history=${JSON.stringify(conversationHistory)}
)

# Return the AI response
result
`;

      // Route through Python executor
      const { data, error } = await supabase.functions.invoke('python-executor', {
        body: {
          code: pythonCode,
          source: 'python-chat-hook',
          workflow_id: currentSessionId,
          metadata: {
            user_message: messageText.trim(),
            mode: 'python-first'
          }
        }
      });

      if (error) throw error;

      // Extract response from Python execution result
      let responseContent = 'I apologize, but I encountered an issue processing your request.';
      let metadata: any = { python_mode: true, execution_time: data.execution_time_ms };

      if (data.status === 'completed' && data.result) {
        responseContent = data.result.response || JSON.stringify(data.result).slice(0, 500);
        metadata.python_execution_id = data.execution_id;
      } else if (data.status === 'failed') {
        responseContent = `Python execution failed: ${data.error_message}`;
        metadata.error = true;
      }

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        message_type: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString(),
        metadata
      };
      setMessages(prev => [...prev, aiMessage]);

      // Store AI message in database
      await supabase
        .from('conversation_messages')
        .insert({
          session_id: currentSessionId,
          message_type: 'assistant',
          content: responseContent,
          metadata
        });

      if (options?.onMessage) {
        options.onMessage(aiMessage);
      }

    } catch (error: any) {
      console.error('Python chat error:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        message_type: 'assistant',
        content: `❌ Error: ${error.message || 'Failed to process message'}`,
        timestamp: new Date().toISOString(),
        metadata: { error: true, python_mode: true }
      };
      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: 'Chat Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    if (!currentSessionId) return;

    try {
      await supabase
        .from('conversation_messages')
        .delete()
        .eq('session_id', currentSessionId);

      await supabase
        .from('conversation_sessions')
        .update({ 
          is_active: false,
          metadata: { cleared_at: new Date().toISOString() }
        })
        .eq('id', currentSessionId);

      // Reinitialize
      await initializeSession();
    } catch (error: any) {
      console.error('Failed to clear chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear chat history',
        variant: 'destructive'
      });
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    currentSessionId
  };
};
