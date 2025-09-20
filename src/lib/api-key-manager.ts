/**
 * API Key Management System
 * Handles localStorage persistence, validation, and fallback mechanisms
 */

export interface APIKeyConfig {
  geminiApiKey?: string;
  githubPersonalAccessToken?: string;
  openaiApiKey?: string;
}

export interface APIKeyStatus {
  isValid: boolean;
  hasQuota: boolean;
  lastChecked: string;
  errorMessage?: string;
}

class APIKeyManager {
  private readonly STORAGE_KEY = 'xmrt-api-keys';
  private readonly STATUS_KEY = 'xmrt-api-status';
  private keyStatuses: Map<string, APIKeyStatus> = new Map();

  // Get stored API keys from localStorage
  getStoredKeys(): APIKeyConfig {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to retrieve stored API keys:', error);
      return {};
    }
  }

  // Store API keys securely in localStorage
  storeKeys(keys: Partial<APIKeyConfig>): boolean {
    try {
      const existingKeys = this.getStoredKeys();
      const updatedKeys = { ...existingKeys, ...keys };
      
      // Remove undefined/empty keys
      Object.keys(updatedKeys).forEach(key => {
        if (!updatedKeys[key as keyof APIKeyConfig]) {
          delete updatedKeys[key as keyof APIKeyConfig];
        }
      });

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedKeys));
      return true;
    } catch (error) {
      console.error('Failed to store API keys:', error);
      return false;
    }
  }

  // Get specific API key with fallback to environment
  getKey(keyType: keyof APIKeyConfig): string | null {
    const storedKeys = this.getStoredKeys();
    const userKey = storedKeys[keyType];
    
    if (userKey) return userKey;

    // Fallback to environment variables
    switch (keyType) {
      case 'geminiApiKey':
        return import.meta.env.VITE_GEMINI_API_KEY || null;
      case 'githubPersonalAccessToken':
        return import.meta.env.VITE_GITHUB_PAT || null;
      case 'openaiApiKey':
        return import.meta.env.VITE_OPENAI_API_KEY || null;
      default:
        return null;
    }
  }

  // Validate API key by making a test request
  async validateKey(keyType: keyof APIKeyConfig, apiKey: string): Promise<APIKeyStatus> {
    const status: APIKeyStatus = {
      isValid: false,
      hasQuota: false,
      lastChecked: new Date().toISOString(),
    };

    try {
      switch (keyType) {
        case 'geminiApiKey':
          status.isValid = await this.validateGeminiKey(apiKey);
          break;
        case 'githubPersonalAccessToken':
          status.isValid = await this.validateGitHubPAT(apiKey);
          break;
        case 'openaiApiKey':
          status.isValid = await this.validateOpenAIKey(apiKey);
          break;
      }

      if (status.isValid) {
        status.hasQuota = true; // Assume quota available if validation passes
      }
    } catch (error) {
      status.errorMessage = error instanceof Error ? error.message : 'Validation failed';
    }

    this.keyStatuses.set(keyType, status);
    return status;
  }

  private async validateGeminiKey(apiKey: string): Promise<boolean> {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      // Test with a simple prompt
      const result = await model.generateContent('Hello');
      return !!(await result.response.text());
    } catch (error: any) {
      // Check for quota exhaustion specifically
      if (error?.message?.includes('quota') || error?.message?.includes('QUOTA_EXCEEDED')) {
        throw new Error('API quota exceeded');
      }
      throw error;
    }
  }

  private async validateGitHubPAT(token: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  private async validateOpenAIKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      throw error;
    }
  }

  // Check if a key needs user input (env key failed/missing)
  needsUserInput(keyType: keyof APIKeyConfig): boolean {
    const envKey = this.getEnvironmentKey(keyType);
    const userKey = this.getStoredKeys()[keyType];
    
    // Need user input if no env key or env key is invalid
    return !envKey && !userKey;
  }

  // Get environment key status
  getEnvironmentKey(keyType: keyof APIKeyConfig): string | null {
    switch (keyType) {
      case 'geminiApiKey':
        return import.meta.env.VITE_GEMINI_API_KEY || null;
      case 'githubPersonalAccessToken':
        return import.meta.env.VITE_GITHUB_PAT || null;
      case 'openaiApiKey':
        return import.meta.env.VITE_OPENAI_API_KEY || null;
      default:
        return null;
    }
  }

  // Clear stored keys
  clearStoredKeys(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.STATUS_KEY);
      this.keyStatuses.clear();
    } catch (error) {
      console.error('Failed to clear stored keys:', error);
    }
  }

  // Get key status
  getKeyStatus(keyType: keyof APIKeyConfig): APIKeyStatus | null {
    return this.keyStatuses.get(keyType) || null;
  }

  // Check if quota exhaustion error
  isQuotaError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    return errorMessage.includes('quota') || 
           errorMessage.includes('rate limit') ||
           errorMessage.includes('usage limit');
  }
}

export const apiKeyManager = new APIKeyManager();