import { GoogleGenerativeAI, GenerativeModel, Part } from '@google/generative-ai';
import { apiKeyManager } from './api-key-manager';
import { GEMINI_MODELS, GeminiModel, MediaFile, CreativeGenerationRequest, GeneratedContent } from '@/types/multimodal';
import { wanAI, isWanAIAvailable } from './wan-ai';
import { webBrowser, WebBrowserService } from './web-browser';

// Enhanced Gemini integration with multimodal capabilities, intelligent responses, and web browsing
class EnhancedGeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private currentModel: GenerativeModel | null = null;
  private quotaExhaustedHandler: (() => void) | null = null;

  constructor() {
    this.initializeAPI();
  }

  private initializeAPI() {
    const apiKey = apiKeyManager.getKey('geminiApiKey');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  setQuotaExhaustedHandler(handler: () => void) {
    this.quotaExhaustedHandler = handler;
  }

  getAvailableModels(): GeminiModel[] {
    return GEMINI_MODELS.filter(model => model.isAvailable);
  }

  private getModel(modelId: string = 'gemini-2.0-flash-exp'): GenerativeModel | null {
    if (!this.genAI) {
      this.initializeAPI();
      if (!this.genAI) return null;
    }

    const modelConfig = GEMINI_MODELS.find(m => m.id === modelId);
    if (!modelConfig) {
      console.warn(`Model ${modelId} not found, falling back to gemini-1.5-flash`);
      modelId = 'gemini-1.5-flash';
    }

    return this.genAI!.getGenerativeModel({
      model: modelId,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });
  }

  // Convert MediaFile to Gemini Part format
  private async mediaFileToPart(mediaFile: MediaFile): Promise<Part> {
    const arrayBuffer = await mediaFile.file.arrayBuffer();
    const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    return {
      inlineData: {
        data: base64Data,
        mimeType: mediaFile.file.type
      }
    };
  }

  // Enhanced response generation with web browsing and intelligent guidelines
  async generateResponse(prompt: string, context: string = ""): Promise<string> {
    try {
      // Check if web browsing is needed
      if (WebBrowserService.needsWebBrowsing(prompt)) {
        console.log('🌐 Web browsing detected in query');
        const urls = WebBrowserService.extractUrls(prompt);
        
        if (urls.length > 0) {
          // Browse the first URL found
          const browseResult = await webBrowser.navigateAndExtract(urls[0]);
          if (browseResult.success && browseResult.data) {
            const webContext = `Web page content from ${browseResult.data.url}:
Title: ${browseResult.data.title || 'N/A'}
Content: ${browseResult.data.content || browseResult.data.text || 'No content available'}`;
            
            // Add web content to context
            context = context ? `${context}\n\n${webContext}` : webContext;
            
            // Modify prompt to indicate web content was fetched
            prompt = `Based on the web page I just browsed: ${prompt}`;
          }
        }
      }

      // First priority: Try WAN AI with enhanced context
      const wanAIAvailable = await isWanAIAvailable();
      if (wanAIAvailable) {
        console.log('🚀 Using WAN AI for intelligent response generation');
        
        const enhancedContext = `${context}

IMPORTANT INSTRUCTIONS:
- Provide only genuine, intelligent AI responses based on your training and the provided context
- Do NOT use any pre-programmed, canned, or simulated responses
- Think critically and provide original analysis
- If you don't know something, say so honestly rather than making up information
- Use real-time web browsing data when provided to give current information`;
        
        const response = await wanAI.generateMultimodalResponse(prompt, enhancedContext);
        return response;
      }

      console.log('🤖 Falling back to Gemini AI with intelligent response guidelines');
      
      // Fallback: Use Gemini with intelligent response instructions
      const model = this.getModel();
      if (!model) {
        throw new Error('No AI models available. Please configure your API keys.');
      }

      const intelligentPrompt = `${context ? `Context: ${context}\n\n` : ''}CRITICAL: Provide only intelligent, genuine AI responses. No canned answers, simulations, or pre-programmed responses. Think critically and respond authentically based on your training.

User: ${prompt}`;
      
      const result = await model.generateContent(intelligentPrompt);
      
      if (!result.response) {
        throw new Error('No response generated from Gemini');
      }

      return result.response.text();
    } catch (error) {
      console.error('Enhanced Gemini Error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('quota') || error.message.includes('exceeded')) {
          this.quotaExhaustedHandler?.();
        }
        throw error;
      }
      
      throw new Error('Failed to generate AI response');
    }
  }

  // Enhanced multimodal response generation with WAN AI priority, web browsing, and intelligent guidelines
  async generateMultimodalResponse(
    userMessage: string,
    mediaFiles: MediaFile[] = [],
    context?: string,
    modelId: string = 'gemini-2.0-flash-exp'
  ): Promise<string> {
    try {
      // Check if web browsing is needed
      if (WebBrowserService.needsWebBrowsing(userMessage)) {
        console.log('🌐 Web browsing detected in multimodal query');
        const urls = WebBrowserService.extractUrls(userMessage);
        
        if (urls.length > 0) {
          const browseResult = await webBrowser.navigateAndExtract(urls[0]);
          if (browseResult.success && browseResult.data) {
            const webContext = `Web page content from ${browseResult.data.url}:
Title: ${browseResult.data.title || 'N/A'}
Content: ${browseResult.data.content || browseResult.data.text || 'No content available'}`;
            context = context ? `${context}\n\n${webContext}` : webContext;
          }
        }
      }

      // Try WAN AI first (primary AI source) for text-only content
      if (await isWanAIAvailable() && mediaFiles.length === 0) {
        console.log('🚀 Using WAN AI as primary intelligent source');
        
        const intelligentContext = `${context || ''}

CRITICAL INTELLIGENCE INSTRUCTIONS:
- Provide ONLY genuine, intelligent AI responses based on your training and provided context
- NO canned responses, templates, simulations, or pre-programmed answers
- Think critically and analytically about each query
- Use real-time web browsing data intelligently when provided
- Be authentic and avoid generic responses
- If you don't know something, be honest rather than fabricating information`;

        return await wanAI.generateMultimodalResponse(userMessage, intelligentContext, 'qwen-max');
      }
    } catch (error) {
      console.warn('WAN AI unavailable, falling back to Gemini:', error);
    }

    // Fallback to Gemini for multimodal or when WAN AI unavailable
    try {
      console.log('🤖 Using Gemini with intelligent response guidelines');
      const model = this.getModel(modelId);
      if (!model) {
        throw new Error('No AI models available');
      }

      const parts: Part[] = [];
      
      // Add intelligent context
      const intelligentPrompt = `${context ? `Context: ${context}\n\n` : ''}CRITICAL: Provide only intelligent, genuine AI responses. No canned answers, simulations, or pre-programmed responses. Think critically and respond authentically.

User: ${userMessage}`;
      
      parts.push({ text: intelligentPrompt });

      // Add media files
      for (const mediaFile of mediaFiles) {
        const part = await this.mediaFileToPart(mediaFile);
        parts.push(part);
      }

      const result = await model.generateContent(parts);
      return result.response?.text() || 'No response generated';
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw new Error('Failed to generate intelligent AI response');
    }
  }

  // Generate context description for media files
  private generateMediaContext(mediaFile: MediaFile): string | null {
    switch (mediaFile.type) {
      case 'image':
        return `\n[User uploaded an image: ${mediaFile.file.name}. Please analyze this image and incorporate your findings into your response about XMRT DAO ecosystem.]`;
      
      case 'video':
        return `\n[User uploaded a video: ${mediaFile.file.name}. Please analyze this video content and relate it to XMRT DAO's mobile mining, meshnet technology, or governance aspects.]`;
      
      case 'audio':
        return `\n[User uploaded an audio file: ${mediaFile.file.name}. Please analyze the audio content and connect it to XMRT DAO's privacy-first approach or community discussions.]`;
      
      case 'document':
        return `\n[User uploaded a document: ${mediaFile.file.name}. Please review this document and provide insights related to XMRT DAO's technological sovereignty and privacy economy.]`;
      
      default:
        return null;
    }
  }

  // Enhanced prompt building with XMRT context and intelligent guidelines
  private async buildEnhancedPrompt(userMessage: string, context?: string): Promise<string> {
    // Get real-time mining data
    const miningData = await this.getMiningDataForChat().catch(() => null);
    
    const miningContext = miningData ? `
Current SupportXMR Pool Status (Real Data):
- Pool Hashrate: ${(miningData.poolHashrate / 1000000).toFixed(1)} MH/s
- Active Miners: ${miningData.poolMiners}
- Total Blocks Found: ${miningData.totalBlocks}
- Wallet Hashrate: ${miningData.walletHashrate > 0 ? `${miningData.walletHashrate} H/s` : 'Inactive'}
- Pool Contribution: ${miningData.poolContribution ? `${miningData.poolContribution.toFixed(4)}%` : '0%'}
- Amount Due: ${(miningData.walletDue / 1000000000000).toFixed(6)} XMR
- Total Paid: ${(miningData.walletPaid / 1000000000000).toFixed(6)} XMR` : '';

    return `You are Eliza, an advanced AI agent for the XMRT DAO ecosystem with comprehensive multimodal capabilities. You provide only intelligent, authentic responses based on your training and real-time data.

CRITICAL: Provide ONLY genuine, intelligent AI responses. No canned answers, simulations, or pre-programmed responses. Think critically and respond authentically.

XMRT DAO Context:
- 21,000,000 governance tokens on Sepolia testnet for community decision-making
- Mobile mining through mobilemonero.com as liquidity engine
- Mesh networking for resilience during internet outages
- Focus on financial privacy and technological sovereignty
- Real-time integration with SupportXMR mining pools

${miningContext}

Advanced Capabilities:
- Vision: Analyze images for mining setups, hardware configurations, UI/UX feedback
- Video Understanding: Review mining tutorials, governance presentations, community content
- Audio Processing: Transcribe and analyze community calls, educational content
- Document Analysis: Review proposals, technical documents, privacy frameworks
- Web Browsing: Access real-time information from websites

When analyzing multimodal content, always relate your findings back to XMRT DAO's mission of building unstoppable privacy infrastructure and empowering individuals through decentralized technology.

User Message: ${userMessage}
Context: ${context || 'General multimodal conversation'}

Provide thoughtful, educational responses that demonstrate deep understanding of both the uploaded content and XMRT DAO's technological ecosystem.`;
  }

  // Creative content generation
  async generateCreativeContent(request: CreativeGenerationRequest): Promise<GeneratedContent | null> {
    console.log('Creative generation requested:', request);
    
    const generatedContent: GeneratedContent = {
      id: `gen-${Date.now()}`,
      type: request.type,
      url: '', // Would be populated by actual generation service
      prompt: request.prompt,
      model: request.model || 'placeholder',
      timestamp: new Date()
    };

    return generatedContent;
  }

  // Voice synthesis integration
  async generateVoiceResponse(text: string, voice: string = 'alloy'): Promise<string | null> {
    return null;
  }

  // Enhanced system status checks
  async checkMultimodalCapabilities(): Promise<{
    vision: boolean;
    audio: boolean;
    video: boolean;
    creative: boolean;
    voice: boolean;
    webBrowsing: boolean;
  }> {
    const apiKey = apiKeyManager.getKey('geminiApiKey');
    
    return {
      vision: !!apiKey,
      audio: !!apiKey,
      video: !!apiKey,
      creative: false,
      voice: false,
      webBrowsing: true // Always available via playwright
    };
  }

  private async getMiningDataForChat() {
    try {
      const { getSupportXMRPoolStats, getXMRTWalletMining } = await import('./real-data-api');
      const [poolStats, walletStats] = await Promise.all([
        getSupportXMRPoolStats(),
        getXMRTWalletMining()
      ]);
      
      return {
        poolHashrate: poolStats.hashRate,
        poolMiners: poolStats.miners,
        totalBlocks: poolStats.totalBlocksFound,
        walletHashrate: walletStats.currentHashrate,
        walletDue: walletStats.amountDue,
        walletPaid: walletStats.amountPaid,
        poolContribution: walletStats.poolContribution
      };
    } catch (error) {
      console.error('Failed to get mining data:', error);
      return null;
    }
  }

  private getOfflineResponse(userMessage: string): string {
    return "Welcome to XMRT DAO's enhanced AI chat with intelligent responses and web browsing capabilities! I provide only genuine, authentic AI assistance based on real training and current data. Please provide a valid API key to unlock full capabilities.";
  }
}

// Export singleton instance
export const enhancedGemini = new EnhancedGeminiService();

// Legacy compatibility exports
export const generateElizaResponse = (userMessage: string, context?: string) => 
  enhancedGemini.generateResponse(userMessage, context || '');

export const setQuotaExhaustedHandler = (handler: () => void) => 
  enhancedGemini.setQuotaExhaustedHandler(handler);

export const getMiningDataForChat = async () => {
  try {
    const { getSupportXMRPoolStats, getXMRTWalletMining } = await import('./real-data-api');
    const [poolStats, walletStats] = await Promise.all([
      getSupportXMRPoolStats(),
      getXMRTWalletMining()
    ]);
    
    return {
      poolHashrate: poolStats.hashRate,
      poolMiners: poolStats.miners,
      totalBlocks: poolStats.totalBlocksFound,
      walletHashrate: walletStats.currentHashrate,
      walletDue: walletStats.amountDue,
      walletPaid: walletStats.amountPaid,
      poolContribution: walletStats.poolContribution
    };
  } catch (error) {
    console.error('Failed to get mining data:', error);
    return null;
  }
};