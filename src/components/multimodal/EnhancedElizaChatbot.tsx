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
  hideHeader?: boolean;
  agent?: {
    id: string;
    name: string;
    description: string;
    capabilities: string[];
  };
}

const EnhancedElizaChatbot: React.FC<EnhancedElizaChatbotProps> = ({ 
  className = "", 
  hideHeader = false,
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
  const [apiKeyType, setApiKeyType] = useState<'geminiApiKey' | 'githubPersonalAccessToken' | 'elevenLabsApiKey' | 'openaiApiKey'>('geminiApiKey');
  const [settings, setSettings] = useState<MultimodalChatSettings>(DEFAULT_CHAT_SETTINGS);
  const [activeTab, setActiveTab] = useState('chat');
  const [pendingFiles, setPendingFiles] = useState<MediaFile[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Convert chat messages to multimodal format for display
  const messages: MultimodalMessage[] = chatMessages.map(msg => ({
    id: msg.id,
    text: msg.content,
    isUser: msg.message_type === 'user',
    timestamp: new Date(msg.timestamp),
    agent: msg.message_type === 'assistant' ? (agent?.name || "Eliza Core") : undefined,
    type: 'text' as const
  }));


  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  // Re-enable auto-scroll with improved targeting
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [scrollToBottom, messages.length]);

  // Play audio for assistant messages using browser TTS
  const playAudio = async (text: string) => {
    if (!text || isPlayingAudio || !settings.voiceSettings.enabled) return;
    
    try {
      setIsPlayingAudio(true);
      
      // Use browser's built-in speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = settings.voiceSettings.speed || 0.9;
        utterance.pitch = settings.voiceSettings.pitch || 1.1;
        utterance.volume = 0.8;
        
        // Use a pleasant voice if available
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Female') || 
          voice.name.includes('Samantha') ||
          voice.name.includes('Karen') ||
          voice.name.includes('Google US English')
        ) || voices[0];
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        utterance.onend = () => {
          setIsPlayingAudio(false);
        };
        
        utterance.onerror = () => {
          setIsPlayingAudio(false);
        };
        
        speechSynthesis.speak(utterance);
        console.log('Browser TTS started successfully');
      } else {
        setIsPlayingAudio(false);
      }
      
    } catch (error) {
      console.error('TTS error:', error);
      setIsPlayingAudio(false);
      // Silently fail - don't show error toasts for TTS failures
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
        if (latestMessage && latestMessage.message_type === 'assistant') {
          playAudio(latestMessage.content);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Check if error is related to missing API keys
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('API key') || errorMessage.includes('unavailable')) {
        toast({
          title: "Setup Required",
          description: "AI services need to be configured. Please check that API keys are set up correctly.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection Error",
          description: "Unable to send message. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFilesAdded = (files: MediaFile[]) => {
    setPendingFiles(prev => [...prev, ...files]);
  };

  const handleVoiceRecorded = (voiceData: VoiceData) => {
    // Convert voice to text and send as message
    if (voiceData.transcript && voiceData.transcript !== "Voice message recorded") {
      setInputMessage(voiceData.transcript);
      // Optionally auto-send the voice message
      setTimeout(() => {
        sendMessage(voiceData.transcript!);
      }, 100);
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

  if (hideHeader) {
    return (
      <div className={`h-full flex flex-col overflow-hidden ${className}`}>
        <div className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
              <TabsTrigger value="media" className="text-xs">Media</TabsTrigger>
              <TabsTrigger value="voice" className="text-xs">Voice</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col mt-0 min-h-0">
              <ScrollArea className="flex-1 min-h-0 h-0 p-3 sm:p-4">
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
                      <div className={`flex-1 min-w-0 ${message.isUser ? 'flex justify-end' : 'flex justify-start'}`}>
                        {message.text && (
                          <div
                            className={`inline-block p-2 sm:p-3 rounded-lg text-xs sm:text-sm max-w-[85%] ${
                              message.isUser
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/50 text-foreground border border-border/50'
                            }`}
                            style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                          >
                            <p className="whitespace-pre-wrap" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                              {message.text}
                            </p>
                          </div>
                        )}
                        {message.media && message.media.length > 0 && (
                          <div className="mt-2">
                            <MediaDisplay media={message.media} />
                          </div>
                        )}
                        {message.generated && message.generated.length > 0 && (
                          <div className="mt-2">
                            <MediaDisplay generated={message.generated} />
                          </div>
                        )}
                        <div className={`flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap ${
                          message.isUser ? 'justify-end' : 'justify-start'
                        }`}>
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
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              {pendingFiles.length > 0 && (
                <div className="py-2 border-t border-border flex-shrink-0">
                  <MediaDisplay media={pendingFiles} />
                </div>
              )}
              <div className="border-t border-border p-2 sm:p-3 pb-[env(safe-area-inset-bottom)] flex gap-2 flex-shrink-0 bg-background">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={agent ? `Ask ${agent.name} anything...` : "Ask Enhanced Eliza anything..."}
                  disabled={isLoading}
                  className="flex-1 text-xs sm:text-sm"
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
        </div>
        <APIKeyDialog
          open={showApiKeyDialog}
          onOpenChange={setShowApiKeyDialog}
          keyType={apiKeyType}
          onKeyAdded={handleApiKeyAdded}
        />
      </div>
    );
  }

  return (
    <Card className={`glass-card w-full max-w-4xl max-h-[85vh] sm:max-h-[80vh] h-full flex flex-col overflow-hidden ${className}`}>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
            <TabsTrigger value="media" className="text-xs">Media</TabsTrigger>
            <TabsTrigger value="voice" className="text-xs">Voice</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col mt-0 min-h-0">
            <ScrollArea className="flex-1 min-h-0 h-0 p-3 sm:p-4">
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
                    <div className={`flex-1 min-w-0 ${message.isUser ? 'flex justify-end' : 'flex justify-start'}`}>
                      {message.text && (
                        <div
                          className={`inline-block p-2 sm:p-3 rounded-lg text-xs sm:text-sm max-w-[85%] ${
                            message.isUser
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted/50 text-foreground border border-border/50'
                          }`}
                          style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                        >
                          <p className="whitespace-pre-wrap" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                            {message.text}
                          </p>
                        </div>
                      )}
                      {message.media && message.media.length > 0 && (
                        <div className="mt-2">
                          <MediaDisplay media={message.media} />
                        </div>
                      )}
                      {message.generated && message.generated.length > 0 && (
                        <div className="mt-2">
                          <MediaDisplay generated={message.generated} />
                        </div>
                      )}
                      <div className={`flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap ${
                        message.isUser ? 'justify-end' : 'justify-start'
                      }`}>
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
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            {pendingFiles.length > 0 && (
              <div className="py-2 border-t border-border flex-shrink-0">
                <MediaDisplay media={pendingFiles} />
              </div>
            )}
            <div className="border-t border-border p-2 sm:p-3 pb-[env(safe-area-inset-bottom)] flex gap-2 flex-shrink-0 bg-background">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={agent ? `Ask ${agent.name} anything...` : "Ask Enhanced Eliza anything..."}
                disabled={isLoading}
                className="flex-1 text-xs sm:text-sm"
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