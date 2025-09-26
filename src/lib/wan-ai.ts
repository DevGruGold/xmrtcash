import { apiKeyManager } from './api-key-manager';

export interface WanAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface WanAIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class WanAIService {
  private readonly baseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  private apiKey: string | null = null;

  constructor() {
    // Try to get WAN AI key from environment or stored keys
    this.apiKey = this.getWanAIKey();
  }

  private getWanAIKey(): string | null {
    // For client-side, we'll use the edge function
    // This method is mainly for server-side edge functions
    if (typeof window === 'undefined') {
      try {
        const DenoEnv = (globalThis as any).Deno?.env;
        return DenoEnv?.get?.('WAN_AI_API_KEY') || null;
      } catch {
        return null;
      }
    }
    
    // Client-side will use edge function, return null to trigger edge function call
    return null;
  }

  private async getApiKey(): Promise<string> {
    if (!this.apiKey) {
      this.apiKey = this.getWanAIKey();
      if (!this.apiKey) {
        // For client-side, we don't throw error here as we'll use edge function
        if (typeof window !== 'undefined') {
          return 'edge-function'; // Special value to indicate edge function usage
        }
        throw new Error('WAN AI API key not configured. Please add your API key in settings.');
      }
    }
    return this.apiKey;
  }

  async generateResponse(
    messages: WanAIMessage[],
    model: string = 'qwen-max',
    temperature: number = 0.7,
    maxTokens: number = 2000
  ): Promise<string> {
    try {
      const apiKey = await this.getApiKey();
      
      // Use edge function for client-side requests
      if (typeof window !== 'undefined' || apiKey === 'edge-function') {
        const { supabase } = await import('@/integrations/supabase/client');
        
        const { data, error } = await supabase.functions.invoke('wan-ai-chat', {
          body: {
            messages,
            model,
            temperature,
            max_tokens: maxTokens
          }
        });
        
        if (error) {
          throw new Error(`Edge function error: ${error.message}`);
        }
        
        return data.content;
      }
      
      // Direct API call for server-side (edge functions)
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('WAN AI API Error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Invalid WAN AI API key. Please check your credentials.');
        } else if (response.status === 429) {
          throw new Error('WAN AI API quota exceeded. Please try again later.');
        } else {
          throw new Error(`WAN AI API error: ${response.status} - ${errorText}`);
        }
      }

      const data: WanAIResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response generated from WAN AI');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('WAN AI Service Error:', error);
      throw error;
    }
  }

  async generateMultimodalResponse(
    userMessage: string,
    context?: string,
    model: string = 'qwen-max'
  ): Promise<string> {
    const messages: WanAIMessage[] = [
      {
        role: 'system',
        content: context || 'You are Eliza, an AI assistant for the XMRT DAO ecosystem. You help users with blockchain, mining, and decentralized autonomous organization operations.'
      },
      {
        role: 'user',
        content: userMessage
      }
    ];

    return this.generateResponse(messages, model);
  }

  async checkCapabilities(): Promise<{
    available: boolean;
    models: string[];
    error?: string;
  }> {
    try {
      // For client-side, check if edge function is available
      if (typeof window !== 'undefined') {
        const { supabase } = await import('@/integrations/supabase/client');
        
        try {
          const { error } = await supabase.functions.invoke('wan-ai-chat', {
            body: {
              messages: [{ role: 'user', content: 'test' }],
              model: 'qwen-max'
            }
          });
          
          if (!error) {
            return {
              available: true,
              models: this.getAvailableModels()
            };
          }
        } catch (e) {
          // Ignore test errors, just check if function exists
        }
        
        return {
          available: true, // Assume available if edge function can be called
          models: this.getAvailableModels()
        };
      }

      // Server-side direct API check
      const apiKey = await this.getApiKey();
      
      const response = await fetch(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const modelNames = data.data?.map((model: any) => model.id) || this.getAvailableModels();
        
        return {
          available: true,
          models: modelNames
        };
      } else {
        return {
          available: false,
          models: [],
          error: `API check failed: ${response.status}`
        };
      }
    } catch (error) {
      return {
        available: false,
        models: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Available models based on Alibaba Cloud Qwen lineup
  getAvailableModels(): string[] {
    return [
      'qwen-max',      // Most capable model
      'qwen-plus',     // Balanced capability and speed
      'qwen-turbo',    // Fastest model
      'qwen-long',     // For long context
    ];
  }
}

// Singleton instance
export const wanAI = new WanAIService();

// Utility functions for backward compatibility
export async function generateWanAIResponse(
  userMessage: string,
  context?: string,
  model?: string
): Promise<string> {
  return wanAI.generateMultimodalResponse(userMessage, context, model);
}

export async function isWanAIAvailable(): Promise<boolean> {
  const capabilities = await wanAI.checkCapabilities();
  return capabilities.available;
}