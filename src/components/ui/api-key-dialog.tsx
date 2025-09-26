import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Key, Github, Zap, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { apiKeyManager, type APIKeyConfig } from "@/lib/api-key-manager";
import { useToast } from "@/hooks/use-toast";

interface APIKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyType?: keyof APIKeyConfig;
  onKeyAdded?: (keyType: keyof APIKeyConfig, key: string) => void;
  title?: string;
  description?: string;
}

export const APIKeyDialog: React.FC<APIKeyDialogProps> = ({
  open,
  onOpenChange,
  keyType,
  onKeyAdded,
  title,
  description
}) => {
  const [apiKeys, setApiKeys] = useState<Partial<APIKeyConfig>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});
  const [validationStatus, setValidationStatus] = useState<Record<string, 'valid' | 'invalid' | null>>({});
  const { toast } = useToast();

  const keyConfigs = {
    geminiApiKey: {
      label: 'Gemini API Key',
      icon: <Zap className="w-4 h-4" />,
      placeholder: 'AIzaSy...',
      description: 'Your Google Gemini API key for AI responses',
      helpText: 'Get your key from Google AI Studio (makersuite.google.com)',
      pattern: /^AIzaSy[0-9A-Za-z-_]{33}$/
    },
    githubPersonalAccessToken: {
      label: 'GitHub Personal Access Token',
      icon: <Github className="w-4 h-4" />,
      placeholder: 'ghp_...',
      description: 'GitHub PAT for autonomous code enhancements',
      helpText: 'Create a token at github.com/settings/tokens with repo permissions',
      pattern: /^gh[ps]_[A-Za-z0-9_]{36,251}$/
    },
    openaiApiKey: {
      label: 'OpenAI API Key',
      icon: <Key className="w-4 h-4" />,
      placeholder: 'sk-...',
      description: 'OpenAI API key for advanced AI features',
      helpText: 'Get your key from platform.openai.com',
      pattern: /^sk-[A-Za-z0-9]{48,}$/
    },
    elevenLabsApiKey: {
      label: 'ElevenLabs API Key',
      icon: <Key className="w-4 h-4" />,
      placeholder: 'sk_...',
      description: 'ElevenLabs API key for text-to-speech functionality',
      helpText: 'Get your key from elevenlabs.io (Speech Synthesis tab)',
      pattern: /^sk_[A-Za-z0-9]{32,}$/
    }
  };

  const activeKeyType = keyType || 'geminiApiKey';
  const activeConfig = keyConfigs[activeKeyType];

  const handleKeyChange = (type: keyof APIKeyConfig, value: string) => {
    setApiKeys(prev => ({ ...prev, [type]: value }));
    setValidationStatus(prev => ({ ...prev, [type]: null }));
  };

  const toggleShowKey = (type: string) => {
    setShowKeys(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const validateAndStore = async (type: keyof APIKeyConfig) => {
    const key = apiKeys[type];
    if (!key) return;

    setIsValidating(prev => ({ ...prev, [type]: true }));

    try {
      const status = await apiKeyManager.validateKey(type, key);
      
      if (status.isValid) {
        apiKeyManager.storeKeys({ [type]: key });
        setValidationStatus(prev => ({ ...prev, [type]: 'valid' }));
        
        toast({
          title: "API Key Validated",
          description: `${keyConfigs[type].label} has been saved successfully.`,
        });

        onKeyAdded?.(type, key);
      } else {
        setValidationStatus(prev => ({ ...prev, [type]: 'invalid' }));
        toast({
          title: "Invalid API Key",
          description: status.errorMessage || `The ${keyConfigs[type].label} is invalid.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      setValidationStatus(prev => ({ ...prev, [type]: 'invalid' }));
      toast({
        title: "Validation Error",
        description: `Failed to validate ${keyConfigs[type].label}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsValidating(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSave = async () => {
    if (keyType) {
      await validateAndStore(keyType);
      if (validationStatus[keyType] === 'valid') {
        onOpenChange(false);
      }
    } else {
      // Validate all provided keys
      const keysToValidate = Object.entries(apiKeys).filter(([_, value]) => value);
      for (const [type] of keysToValidate) {
        await validateAndStore(type as keyof APIKeyConfig);
      }
      
      if (keysToValidate.every(([type]) => validationStatus[type] === 'valid')) {
        onOpenChange(false);
      }
    }
  };

  const renderKeyInput = (type: keyof APIKeyConfig) => {
    const config = keyConfigs[type];
    const currentKey = apiKeys[type] || '';
    const isValidatingKey = isValidating[type];
    const status = validationStatus[type];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {config.icon}
          <Label htmlFor={type} className="text-sm font-medium">
            {config.label}
          </Label>
          {status === 'valid' && <CheckCircle className="w-4 h-4 text-green-500" />}
          {status === 'invalid' && <AlertCircle className="w-4 h-4 text-red-500" />}
        </div>
        
        <div className="relative">
          <Input
            id={type}
            type={showKeys[type] ? 'text' : 'password'}
            value={currentKey}
            onChange={(e) => handleKeyChange(type, e.target.value)}
            placeholder={config.placeholder}
            className="pr-20"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleShowKey(type)}
              className="h-8 w-8 p-0"
            >
              {showKeys[type] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => validateAndStore(type)}
              disabled={!currentKey || isValidatingKey}
              className="h-8 px-2"
            >
              {isValidatingKey ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Test'}
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>{config.description}</p>
          <p className="mt-1 text-primary">{config.helpText}</p>
        </div>

        {status === 'invalid' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please check your API key and try again.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  };

  if (keyType) {
    // Single key dialog
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {title || `Add ${activeConfig.label}`}
            </DialogTitle>
            <DialogDescription>
              {description || `Your ${activeConfig.label} is required for enhanced functionality.`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {renderKeyInput(keyType)}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!apiKeys[keyType] || isValidating[keyType]}
            >
              {isValidating[keyType] && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Multi-key dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {title || 'API Key Management'}
          </DialogTitle>
          <DialogDescription>
            {description || 'Manage your API keys for enhanced XMRT DAO functionality.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="geminiApiKey" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="geminiApiKey" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Gemini
            </TabsTrigger>
            <TabsTrigger value="githubPersonalAccessToken" className="text-xs">
              <Github className="w-3 h-3 mr-1" />
              GitHub
            </TabsTrigger>
            <TabsTrigger value="openaiApiKey" className="text-xs">
              <Key className="w-3 h-3 mr-1" />
              OpenAI
            </TabsTrigger>
            <TabsTrigger value="elevenLabsApiKey" className="text-xs">
              <Key className="w-3 h-3 mr-1" />
              ElevenLabs
            </TabsTrigger>
          </TabsList>

          {Object.entries(keyConfigs).map(([type, config]) => (
            <TabsContent key={type} value={type} className="space-y-4">
              {renderKeyInput(type as keyof APIKeyConfig)}
            </TabsContent>
          ))}
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleSave}>
            Save All Keys
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};