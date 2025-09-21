// Enhanced multimodal message types for comprehensive chat system

export interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  preview?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    size: number;
    mimeType: string;
  };
  processing?: {
    status: 'pending' | 'processing' | 'complete' | 'error';
    progress?: number;
    error?: string;
  };
}

export interface GeneratedContent {
  id: string;
  type: 'image' | 'video' | 'audio' | 'music';
  url: string;
  prompt: string;
  model: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    style?: string;
    quality?: string;
  };
  timestamp: Date;
}

export interface VoiceData {
  audioUrl: string;
  transcript: string;
  language?: string;
  confidence?: number;
  duration: number;
}

export interface MultimodalMessage {
  id: string;
  text?: string;
  isUser: boolean;
  timestamp: Date;
  agent?: string;
  type: 'text' | 'multimodal' | 'voice' | 'generated';
  
  // Media attachments
  media?: MediaFile[];
  
  // Generated content
  generated?: GeneratedContent[];
  
  // Voice data
  voice?: VoiceData;
  
  // Processing status
  processing?: {
    status: 'pending' | 'processing' | 'complete' | 'error';
    stage?: string;
    progress?: number;
    error?: string;
  };
  
  // Thread support
  threadId?: string;
  replyTo?: string;
}

export interface GeminiModel {
  id: string;
  name: string;
  description: string;
  capabilities: ('text' | 'vision' | 'audio' | 'video' | 'code')[];
  maxTokens: number;
  costTier: 'free' | 'low' | 'medium' | 'high';
  isAvailable: boolean;
}

export const GEMINI_MODELS: GeminiModel[] = [
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    description: 'Latest multimodal AI with native audio and video understanding',
    capabilities: ['text', 'vision', 'audio', 'video', 'code'],
    maxTokens: 1000000,
    costTier: 'medium',
    isAvailable: true
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: 'Advanced reasoning and long-context analysis',
    capabilities: ['text', 'vision', 'audio'],
    maxTokens: 2000000,
    costTier: 'high',
    isAvailable: true
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'Fast and efficient multimodal model',
    capabilities: ['text', 'vision', 'audio'],
    maxTokens: 1000000,
    costTier: 'low',
    isAvailable: true
  }
];

export interface CreativeGenerationRequest {
  type: 'image' | 'video' | 'audio' | 'music';
  prompt: string;
  style?: string;
  quality?: 'standard' | 'high' | 'ultra';
  dimensions?: { width: number; height: number };
  duration?: number;
  model?: string;
}

export interface VoiceSettings {
  voice: string;
  speed: number;
  pitch: number;
  language: string;
  enabled: boolean;
}

export interface MultimodalChatSettings {
  autoPlayAudio: boolean;
  autoPlayVideo: boolean;
  voiceSettings: VoiceSettings;
  preferredModel: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  enableRealTimeVoice: boolean;
  enableCreativeGeneration: boolean;
}

export const DEFAULT_CHAT_SETTINGS: MultimodalChatSettings = {
  autoPlayAudio: true,
  autoPlayVideo: false,
  voiceSettings: {
    voice: 'alloy',
    speed: 1.0,
    pitch: 1.0,
    language: 'en-US',
    enabled: true
  },
  preferredModel: 'gemini-2.0-flash-exp',
  maxFileSize: 20 * 1024 * 1024, // 20MB
  allowedFileTypes: [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/mov',
    'audio/mp3', 'audio/wav', 'audio/ogg',
    'application/pdf', 'text/plain', 'application/json'
  ],
  enableRealTimeVoice: true,
  enableCreativeGeneration: true
};