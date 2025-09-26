import { supabase } from '@/integrations/supabase/client';

export interface WebBrowseRequest {
  url: string;
  action?: 'navigate' | 'click' | 'type' | 'screenshot' | 'extract';
  selector?: string;
  text?: string;
  waitFor?: string;
  extractContent?: boolean;
}

export interface WebBrowseResult {
  success: boolean;
  data?: {
    title?: string;
    content?: string;
    screenshot?: string;
    url?: string;
    links?: Array<{ text: string; href: string }>;
    text?: string;
  };
  error?: string;
}

export class WebBrowserService {
  async browse(request: WebBrowseRequest): Promise<WebBrowseResult> {
    try {
      const { data, error } = await supabase.functions.invoke('playwright-browse', {
        body: request
      });

      if (error) {
        console.error('Web browser error:', error);
        return {
          success: false,
          error: `Browser error: ${error.message}`
        };
      }

      return data as WebBrowseResult;
    } catch (error) {
      console.error('Web browser service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown browser error'
      };
    }
  }

  async navigateAndExtract(url: string): Promise<WebBrowseResult> {
    return this.browse({
      url,
      action: 'navigate',
      extractContent: true
    });
  }

  async takeScreenshot(url: string): Promise<WebBrowseResult> {
    return this.browse({
      url,
      action: 'screenshot',
      extractContent: false
    });
  }

  async searchAndClick(url: string, selector: string, waitFor?: string): Promise<WebBrowseResult> {
    return this.browse({
      url,
      action: 'click',
      selector,
      waitFor,
      extractContent: true
    });
  }

  async fillForm(url: string, selector: string, text: string): Promise<WebBrowseResult> {
    return this.browse({
      url,
      action: 'type',
      selector,
      text,
      extractContent: true
    });
  }

  // Helper method to detect if a query needs web browsing
  static needsWebBrowsing(query: string): boolean {
    const webIndicators = [
      'browse', 'visit', 'go to', 'check website', 'look up online',
      'search web', 'find on internet', 'web search', 'google',
      'what does', 'current', 'latest', 'recent', 'news',
      'price of', 'weather', 'stock', 'real-time'
    ];

    const lowerQuery = query.toLowerCase();
    return webIndicators.some(indicator => lowerQuery.includes(indicator)) ||
           /https?:\/\//.test(query); // Contains URL
  }

  // Helper method to extract URLs from text
  static extractUrls(text: string): string[] {
    const urlRegex = /https?:\/\/[^\s]+/g;
    return text.match(urlRegex) || [];
  }
}

// Singleton instance
export const webBrowser = new WebBrowserService();