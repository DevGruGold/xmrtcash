import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrowseRequest {
  url: string;
  action?: 'navigate' | 'click' | 'type' | 'screenshot' | 'extract';
  selector?: string;
  text?: string;
  waitFor?: string;
  extractContent?: boolean;
}

interface BrowseResponse {
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

serve(async (req) => {
  console.log('🌐 Playwright browse request:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, action = 'navigate', selector, text, waitFor, extractContent = true }: BrowseRequest = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔍 Browsing: ${url} with action: ${action}`);

    // Import Playwright dynamically
    const { chromium } = await import("https://deno.land/x/playwright@1.40.0/mod.ts");
    
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    try {
      // Set a reasonable timeout
      page.setDefaultTimeout(30000);
      
      // Navigate to the URL
      await page.goto(url, { waitUntil: 'networkidle' });
      
      let result: BrowseResponse['data'] = {
        url: page.url(),
        title: await page.title()
      };

      // Perform specific actions based on request
      switch (action) {
        case 'click':
          if (selector) {
            await page.click(selector);
            if (waitFor) {
              await page.waitForSelector(waitFor, { timeout: 10000 });
            }
          }
          break;
          
        case 'type':
          if (selector && text) {
            await page.fill(selector, text);
          }
          break;
          
        case 'screenshot':
          const screenshot = await page.screenshot({ 
            type: 'png', 
            fullPage: false,
            clip: { x: 0, y: 0, width: 1280, height: 720 }
          });
          result.screenshot = `data:image/png;base64,${btoa(String.fromCharCode(...screenshot))}`;
          break;
      }

      // Extract content if requested
      if (extractContent) {
        // Get page text content
        const textContent = await page.evaluate(() => {
          // Remove script and style content
          const scripts = (globalThis as any).document.querySelectorAll('script, style');
          scripts.forEach((el: any) => el.remove());
          
          // Get clean text content
          const doc = (globalThis as any).document;
          const textContent = doc.body?.innerText || doc.textContent || '';
          
          // Limit to first 10000 characters to avoid huge responses
          return textContent.substring(0, 10000).trim();
        });
        
        result.text = textContent;

        // Extract main content areas
        const mainContent = await page.evaluate(() => {
          const doc = (globalThis as any).document;
          const selectors = [
            'main', 
            '[role="main"]', 
            '.main-content', 
            '.content',
            'article',
            '.article-content',
            '.post-content'
          ];
          
          for (const selector of selectors) {
            const element = doc.querySelector(selector);
            if (element) {
              return element.innerText?.substring(0, 5000) || '';
            }
          }
          
          // Fallback to body content
          return doc.body?.innerText?.substring(0, 5000) || '';
        });
        
        result.content = mainContent;

        // Extract links
        const links = await page.evaluate(() => {
          const doc = (globalThis as any).document;
          const linkElements = Array.from(doc.querySelectorAll('a[href]'));
          return linkElements
            .slice(0, 20) // Limit to first 20 links
            .map((link: any) => ({
              text: (link.textContent || '').trim().substring(0, 100),
              href: link.getAttribute('href') || ''
            }))
            .filter((link: any) => link.text && link.href);
        });
        
        result.links = links;
      }

      await browser.close();

      const response: BrowseResponse = {
        success: true,
        data: result
      };

      console.log('✅ Browse completed successfully');
      
      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (pageError) {
      await browser.close();
      throw pageError;
    }

  } catch (error) {
    console.error('❌ Playwright browse error:', error);
    
    const response: BrowseResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown browsing error'
    };
    
    return new Response(
      JSON.stringify(response),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});