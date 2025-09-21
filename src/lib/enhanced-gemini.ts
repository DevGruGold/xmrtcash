import { GoogleGenerativeAI, GenerativeModel, Part } from '@google/generative-ai';
import { apiKeyManager } from './api-key-manager';
import { GEMINI_MODELS, GeminiModel, MediaFile, CreativeGenerationRequest, GeneratedContent } from '@/types/multimodal';

// Enhanced Gemini integration with multimodal capabilities
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

  // Enhanced multimodal response generation
  async generateMultimodalResponse(
    userMessage: string,
    mediaFiles: MediaFile[] = [],
    context?: string,
    modelId: string = 'gemini-2.0-flash-exp'
  ): Promise<string> {
    try {
      const model = this.getModel(modelId);
      if (!model) {
        throw new Error('Gemini API not available');
      }

      // Prepare content parts
      const parts: (string | Part)[] = [];
      
      // Add text content with enhanced XMRT context
      const enhancedPrompt = await this.buildEnhancedPrompt(userMessage, context);
      parts.push(enhancedPrompt);

      // Add media parts
      for (const mediaFile of mediaFiles) {
        if (mediaFile.processing?.status === 'complete') {
          const part = await this.mediaFileToPart(mediaFile);
          parts.push(part);
          
          // Add context for the media
          const mediaContext = this.generateMediaContext(mediaFile);
          if (mediaContext) {
            parts.push(mediaContext);
          }
        }
      }

      // Generate response
      const result = await model.generateContent(parts);
      const response = await result.response;
      return response.text();

    } catch (error: any) {
      console.error('Enhanced Gemini API error:', error);
      
      if (apiKeyManager.isQuotaError(error)) {
        console.log('Quota exhausted, triggering user input dialog...');
        if (this.quotaExhaustedHandler) {
          this.quotaExhaustedHandler();
        }
        return this.getOfflineResponse(userMessage) + '\n\n🔑 *API quota exhausted. Please provide your own Gemini API key for continued AI responses.*';
      }
      
      return this.getOfflineResponse(userMessage);
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

  // Enhanced prompt building with XMRT context
  private async buildEnhancedPrompt(userMessage: string, context?: string): Promise<string> {
    // Get real-time mining data
    const { getSupportXMRPoolStats, getXMRTWalletMining } = await import('./real-data-api');
    const miningData = await getMiningDataForChat().catch(() => null);
    
    const miningContext = miningData ? `
Current SupportXMR Pool Status (Real Data):
- Pool Hashrate: ${(miningData.poolHashrate / 1000000).toFixed(1)} MH/s
- Active Miners: ${miningData.poolMiners}
- Total Blocks Found: ${miningData.totalBlocks}
- Wallet Hashrate: ${miningData.walletHashrate > 0 ? `${miningData.walletHashrate} H/s` : 'Inactive'}
- Pool Contribution: ${miningData.poolContribution ? `${miningData.poolContribution.toFixed(4)}%` : '0%'}
- Amount Due: ${(miningData.walletDue / 1000000000000).toFixed(6)} XMR
- Total Paid: ${(miningData.walletPaid / 1000000000000).toFixed(6)} XMR` : '';

    return `You are Eliza, an advanced AI agent for the XMRT DAO ecosystem with comprehensive multimodal capabilities. You can analyze images, videos, audio, and documents to provide insights about decentralized finance, privacy technology, mobile mining, and mesh networking.

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

When analyzing multimodal content, always relate your findings back to XMRT DAO's mission of building unstoppable privacy infrastructure and empowering individuals through decentralized technology.

User Message: ${userMessage}
Context: ${context || 'General multimodal conversation'}

Provide thoughtful, educational responses that demonstrate deep understanding of both the uploaded content and XMRT DAO's technological ecosystem.`;
  }

  // Creative content generation
  async generateCreativeContent(request: CreativeGenerationRequest): Promise<GeneratedContent | null> {
    // This would integrate with Veo 3, ImageFX, MusicFX when available
    // For now, return a placeholder structure
    console.log('Creative generation requested:', request);
    
    // Placeholder for future implementation with Google's creative models
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
    // This would integrate with Google's TTS or maintain OpenAI integration
    // For now, maintain existing voice functionality
    return null;
  }

  // Enhanced system status checks
  async checkMultimodalCapabilities(): Promise<{
    vision: boolean;
    audio: boolean;
    video: boolean;
    creative: boolean;
    voice: boolean;
  }> {
    const apiKey = apiKeyManager.getKey('geminiApiKey');
    
    return {
      vision: !!apiKey,
      audio: !!apiKey,
      video: !!apiKey, // Gemini 2.0 Flash supports video
      creative: false, // Requires separate Veo/ImageFX integration
      voice: false // Requires TTS integration
    };
  }

  private getOfflineResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    if (message.includes('image') || message.includes('photo') || message.includes('picture')) {
      return "I can analyze images to help with mining setups, UI feedback, and visual content related to XMRT DAO. However, I need an active Gemini API key to process visual content.";
    }
    
    if (message.includes('video')) {
      return "Video analysis helps me understand mining tutorials, governance presentations, and community content. Please provide your Gemini API key to enable video processing capabilities.";
    }
    
    if (message.includes('audio') || message.includes('voice')) {
      return "Audio processing allows me to transcribe and analyze community calls and educational content. An active API key is required for audio analysis.";
    }
    
    // Default multimodal response
    return "Welcome to XMRT DAO's enhanced multimodal chat! I can analyze images, videos, audio, and documents to provide insights about our privacy-first ecosystem. Please provide a valid Gemini API key to unlock full multimodal capabilities.";
  }
}

// Export singleton instance
export const enhancedGemini = new EnhancedGeminiService();

// Legacy compatibility exports
export const generateElizaResponse = (userMessage: string, context?: string) => 
  enhancedGemini.generateMultimodalResponse(userMessage, [], context);

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