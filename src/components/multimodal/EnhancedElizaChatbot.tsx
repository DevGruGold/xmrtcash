import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, Send, Minimize2, Maximize2, User, Zap, Loader2, Key, 
  Paperclip, Mic, Image, Video, FileText, Wand2, Settings, Volume2 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { APIKeyDialog } from "@/components/ui/api-key-dialog";
import { apiKeyManager } from "@/lib/api-key-manager";
import { useIntelligentChat } from "@/hooks/useIntelligentChat";
import { supabase } from "@/integrations/supabase/client";
import MediaUploader from "./MediaUploader";
import MediaDisplay from "./MediaDisplay";
import VoiceInterface from "./VoiceInterface";
import { 
  MultimodalMessage, 
  MediaFile, 
  GeneratedContent, 
  VoiceData, 
  MultimodalChatSettings,
  DEFAULT_CHAT_SETTINGS,
  GEMINI_MODELS 
} from "@/types/multimodal";

interface EnhancedElizaChatbotProps {
  className?: string;
  agent?: {
    id: string;
    name: string;
    description: string;
    capabilities: string[];
  };
}

const EnhancedElizaChatbot: React.FC<EnhancedElizaChatbotProps> = ({ 
  className = "", 
  agent 
}) => {
  const { 
    messages: chatMessages, 
    sendMessage, 
    isLoading, 
    isTyping, 
    clearChat 
  } = useIntelligentChat();
  
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKeyType, setApiKeyType] = useState<'geminiApiKey' | 'githubPersonalAccessToken'>('geminiApiKey');
  const [settings, setSettings] = useState<MultimodalChatSettings>(DEFAULT_CHAT_SETTINGS);
  const [activeTab, setActiveTab] = useState('chat');
  const [pendingFiles, setPendingFiles] = useState<MediaFile[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Convert chat messages to multimodal format for display
  const messages: MultimodalMessage[] = [
    {
      id: 'welcome',
      text: getWelcomeMessage(),
      isUser: false,
      timestamp: new Date(),
      agent: agent?.name || "Eliza Core",
      type: 'text'
    },
    ...chatMessages.map(msg => ({
      id: msg.id,
      text: msg.message_text,
      isUser: msg.sender === 'user',
      timestamp: new Date(msg.timestamp),
      agent: msg.sender === 'assistant' ? (agent?.name || "Eliza Core") : undefined,
      type: 'text' as const
    }))
  ];

  function getWelcomeMessage(): string {
    if (!agent) {
      return "🛡️ Welcome to XMRT DAO's Enhanced Multimodal Chat! I'm Eliza, your AI executive agent with comprehensive capabilities:\n\n📱 **Multimodal Understanding**: Upload images, videos, audio, and documents\n🎨 **Creative Generation**: AI-powered image and video creation\n🗣️ **Voice Interface**: Real-time speech recognition and synthesis\n📊 **Live Data Analysis**: Real-time mining stats and DAO insights\n🌐 **Advanced Models**: Powered by Gemini 2.0 Flash with vision and audio\n\nPrivacy is a fundamental right - how can I help you explore our technological sovereignty?";
    }

    const welcomeMessages = {
      'mining-oracle': "⚡ **Enhanced Mining Oracle** - Now with multimodal capabilities!\n\n📊 Upload mining setup photos for optimization advice\n🎥 Share mining tutorial videos for analysis\n📈 Voice queries for real-time statistics\n💻 Document analysis for hardware specs\n🔧 Advanced troubleshooting with visual diagnostics\n\nWhat mining challenge can I help solve with my enhanced capabilities?",
      'dao-governance': "🗳️ **Advanced DAO Governance Assistant**\n\n📜 Analyze proposal documents and presentations\n🎥 Review governance meeting recordings\n📊 Generate visual governance reports\n👥 Voice-activated voting guidance\n📈 Multimodal proposal analysis\n\nHow can I enhance your governance experience?",
      'privacy-guard': "🛡️ **Enhanced Privacy Guard** with multimodal security analysis\n\n🔒 Visual security audit capabilities\n📱 Mobile privacy setup guidance\n🎥 Video-based threat assessment\n🔍 Document security analysis\n⚠️ Voice-activated privacy alerts\n\nWhat privacy or security concerns can I address with my enhanced capabilities?",
      'defi-strategist': "💰 **Advanced DeFi Strategist** with comprehensive analysis\n\n📈 Chart analysis and market visualization\n📊 Document-based strategy review\n🎥 Educational video analysis\n💼 Voice-activated portfolio updates\n💱 Visual cross-chain opportunity mapping\n\nWhat DeFi strategy can I help develop with multimodal insights?",
      'mesh-coordinator': "🌐 **Enhanced Mesh Coordinator** with advanced diagnostics\n\n🕸️ Network topology visualization\n📡 Hardware setup photo analysis\n🎥 Network tutorial video processing\n🔗 Voice-controlled network monitoring\n⚡ Visual performance diagnostics\n\nHow can I optimize your mesh networking with enhanced capabilities?",
      'eliza-core': "🛡️ **Eliza Core - Enhanced Multimodal Assistant**\n\n🎯 Upload any content for AI analysis\n🎨 Creative content generation\n🗣️ Voice-powered interactions\n📊 Real-time ecosystem insights\n🔗 Seamless agent coordination\n\nExperience the future of AI interaction!"
    };

    return welcomeMessages[agent.id as keyof typeof welcomeMessages] || welcomeMessages['eliza-core'];
  }

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Play audio for assistant messages
  const playAudio = async (text: string) => {
    if (!text || isPlayingAudio) return;
    
    try {
      setIsPlayingAudio(true);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'Aria' }
      });

      if (error) throw error;

      // Convert base64 to audio and play
      const audioBlob = new Blob([
        Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))
      ], { type: 'audio/mpeg' });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsPlayingAudio(false);
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlayingAudio(false);
      toast({
        title: "Audio Error",
        description: "Could not play audio response",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    
    try {
      await sendMessage(messageText);
      
      // Play audio for the response after a short delay
      setTimeout(() => {
        const latestMessage = chatMessages[chatMessages.length - 1];
        if (latestMessage && latestMessage.sender === 'assistant') {
          playAudio(latestMessage.message_text);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Connection Error",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFilesAdded = (files: MediaFile[]) => {
    setPendingFiles(prev => [...prev, ...files]);
  };

  const handleVoiceRecorded = (voiceData: VoiceData) => {
    // Convert voice to text and send as message
    if (voiceData.transcript) {
      sendMessage(voiceData.transcript);
    }
  };

  const handleApiKeyAdded = (keyType: string, key: string) => {
    toast({
      title: "API Key Added",
      description: `Your ${keyType === 'geminiApiKey' ? 'Gemini API' : 'GitHub'} key has been saved successfully.`,
    });
    
    if (keyType === 'geminiApiKey') {
      toast({
        title: "Enhanced AI Available",
        description: "Full multimodal capabilities are now active!",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isMinimized) {
    return (
      <Card className={`glass-card w-full max-w-xs sm:max-w-sm h-14 sm:h-16 ${className}`}>
        <CardContent className="p-3 sm:p-4 flex items-center justify-between h-full">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
              <AvatarImage src="/eliza-avatar.jpg" alt="Eliza" />
              <AvatarFallback><Bot className="w-3 h-3 sm:w-4 sm:h-4" /></AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 min-w-0">
              <span className="gradient-text font-medium text-sm sm:text-base truncate">
                {agent?.name || "Enhanced Eliza"}
              </span>
              <Zap className="w-2 h-2 sm:w-3 sm:h-3 text-primary animate-pulse flex-shrink-0" />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(false)}
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-card w-full max-w-4xl h-[600px] sm:h-[700px] flex flex-col ${className}`}>
      <CardHeader className="flex-shrink-0 pb-3 px-3 sm:px-6">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
              <AvatarImage src="/eliza-avatar.jpg" alt="Eliza" />
              <AvatarFallback><Bot className="w-3 h-3 sm:w-4 sm:h-4" /></AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 min-w-0">
              <span className="gradient-text text-sm sm:text-base font-medium truncate">
                {agent?.name || "Enhanced Eliza AI"}
              </span>
              <Badge variant="outline" className="text-xs flex-shrink-0">
                <Wand2 className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                Multimodal
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setApiKeyType('geminiApiKey');
                setShowApiKeyDialog(true);
              }}
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
              title="Manage API Keys"
            >
              <Key className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-3 sm:p-4 pt-0 min-h-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
            <TabsTrigger value="media" className="text-xs">Media</TabsTrigger>
            <TabsTrigger value="voice" className="text-xs">Voice</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
            <ScrollArea className="flex-1 w-full pr-2 sm:pr-4">
              <div className="space-y-3 sm:space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 sm:gap-3 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                      {message.isUser ? (
                        <AvatarFallback><User className="w-3 h-3 sm:w-4 sm:h-4" /></AvatarFallback>
                      ) : (
                        <>
                          <AvatarImage src="/eliza-avatar.jpg" alt="Eliza" />
                          <AvatarFallback><Bot className="w-3 h-3 sm:w-4 sm:h-4" /></AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    
                    <div className={`flex-1 min-w-0 max-w-full ${message.isUser ? 'text-right' : 'text-left'}`}>
                      {message.text && (
                        <div
                          className={`inline-block p-2 sm:p-3 rounded-lg text-xs sm:text-sm w-full max-w-[calc(100%-2rem)] sm:max-w-[85%] overflow-hidden ${
                            message.isUser
                              ? 'bg-primary text-primary-foreground ml-auto'
                              : 'bg-muted/50 text-foreground border border-border/50'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words word-wrap overflow-wrap-anywhere overflow-hidden">
                            {message.text}
                          </p>
                        </div>
                      )}
                      
                      {/* Media Display */}
                      {message.media && message.media.length > 0 && (
                        <div className="mt-2">
                          <MediaDisplay media={message.media} />
                        </div>
                      )}
                      
                      {/* Generated Content Display */}
                      {message.generated && message.generated.length > 0 && (
                        <div className="mt-2">
                          <MediaDisplay generated={message.generated} />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                        {!message.isUser && message.agent && (
                          <Badge variant="outline" className="text-xs px-1 py-0 flex-shrink-0">
                            {message.agent}
                          </Badge>
                        )}
                        {message.type !== 'text' && (
                          <Badge variant="outline" className="text-xs px-1 py-0 flex-shrink-0">
                            {message.type}
                          </Badge>
                        )}
                        {!message.isUser && message.text && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => playAudio(message.text!)}
                            className="h-4 px-1 text-xs"
                            disabled={isPlayingAudio}
                          >
                            <Volume2 className="w-3 h-3" />
                          </Button>
                        )}
                        <span className="flex-shrink-0">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(isLoading || isTyping) && (
                  <div className="flex gap-2 sm:gap-3">
                    <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                      <AvatarImage src="/eliza-avatar.jpg" alt="Eliza" />
                      <AvatarFallback><Bot className="w-3 h-3 sm:w-4 sm:h-4" /></AvatarFallback>
                    </Avatar>
                    <div className="bg-muted/50 p-2 sm:p-3 rounded-lg border border-border/50">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-primary flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {isTyping ? 'Eliza is typing...' : 'Eliza is thinking...'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>
            
            {/* Pending Files Display */}
            {pendingFiles.length > 0 && (
              <div className="py-2 border-t border-border">
                <MediaDisplay media={pendingFiles} />
              </div>
            )}
            
            <div className="flex gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={agent ? `Ask ${agent.name} anything...` : "Ask Enhanced Eliza anything..."}
                disabled={isLoading}
                className="flex-1 text-xs sm:text-sm min-w-0"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setActiveTab('media')}
                className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10"
                title="Attach Media"
              >
                <Paperclip className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={isLoading || (!inputMessage.trim() && pendingFiles.length === 0)}
                size="icon"
                className="neon-button flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10"
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="media" className="flex-1 mt-0">
            <MediaUploader 
              onFilesAdded={handleFilesAdded}
              maxFiles={settings.maxFileSize}
              allowedTypes={settings.allowedFileTypes}
            />
          </TabsContent>

          <TabsContent value="voice" className="flex-1 mt-0">
            <VoiceInterface
              onVoiceRecorded={handleVoiceRecorded}
              onSpeakText={(text) => {
                // Implement TTS functionality
                toast({
                  title: "Text-to-Speech",
                  description: "Voice synthesis will be implemented in the next iteration"
                });
              }}
              settings={settings.voiceSettings}
              onSettingsChange={(voiceSettings) => 
                setSettings(prev => ({ ...prev, voiceSettings }))
              }
            />
          </TabsContent>

          <TabsContent value="settings" className="flex-1 mt-0">
            <div className="space-y-4">
              <h3 className="font-medium">Chat Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Preferred Model</label>
                  <select 
                    value={settings.preferredModel}
                    onChange={(e) => setSettings(prev => ({ ...prev, preferredModel: e.target.value }))}
                    className="w-full mt-1 p-2 rounded border bg-background"
                  >
                    {GEMINI_MODELS.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoPlayAudio"
                    checked={settings.autoPlayAudio}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoPlayAudio: e.target.checked }))}
                  />
                  <label htmlFor="autoPlayAudio" className="text-sm">Auto-play voice responses</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableCreativeGeneration"
                    checked={settings.enableCreativeGeneration}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableCreativeGeneration: e.target.checked }))}
                  />
                  <label htmlFor="enableCreativeGeneration" className="text-sm">Enable creative generation</label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <APIKeyDialog
        open={showApiKeyDialog}
        onOpenChange={setShowApiKeyDialog}
        keyType={apiKeyType}
        onKeyAdded={handleApiKeyAdded}
      />
    </Card>
  );
};

export default EnhancedElizaChatbot;