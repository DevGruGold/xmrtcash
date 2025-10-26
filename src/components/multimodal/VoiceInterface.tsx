import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, MicOff, Volume2, VolumeX, Play, Pause, 
  Loader2, Radio, Settings 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { VoiceData, VoiceSettings } from '@/types/multimodal';
import { supabase } from '@/integrations/supabase/client';

interface VoiceInterfaceProps {
  onVoiceRecorded: (voiceData: VoiceData) => void;
  onSpeakText: (text: string) => void;
  settings: VoiceSettings;
  onSettingsChange: (settings: VoiceSettings) => void;
  className?: string;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onVoiceRecorded,
  onSpeakText,
  settings,
  onSettingsChange,
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  // Initialize audio context and analyzer for voice level monitoring
  const initializeAudioContext = async (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyzerRef.current);
      
      analyzerRef.current.fftSize = 256;
      const bufferLength = analyzerRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudioLevel = () => {
        if (analyzerRef.current && isRecording) {
          analyzerRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(average / 255 * 100);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error initializing audio context:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      // Initialize audio level monitoring
      await initializeAudioContext(stream);
      
      // Set up MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processRecordedAudio(audioBlob);
      };
      
      // Start recording
      mediaRecorderRef.current.start(1000); // Record in 1-second intervals
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start duration timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone"
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: "Please check microphone permissions",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      // Clean up
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const processRecordedAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert audio blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Audio = btoa(String.fromCharCode(...uint8Array));
      
      // Call Supabase edge function for speech-to-text
      const { data, error } = await supabase.functions.invoke('speech-to-text', {
        body: { audio: base64Audio }
      });

      if (error) {
        throw new Error(error.message || 'Speech-to-text failed');
      }

      const transcript = data.text || 'Could not transcribe audio';
      
      // Create audio URL for playback
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const voiceData: VoiceData = {
        audioUrl,
        transcript,
        language: settings.language,
        duration: recordingDuration,
        confidence: 0.95
      };
      
      onVoiceRecorded(voiceData);
      
      toast({
        title: "Voice recorded",
        description: `"${transcript.substring(0, 50)}${transcript.length > 50 ? '...' : ''}"`
      });
      
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Processing failed",
        description: "Could not process voice recording. Please check your OpenAI API key.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setRecordingDuration(0);
    }
  };

  const speakText = (text: string) => {
    if (!settings.enabled) return;
    
    // Cancel any existing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices().find(voice => 
      voice.name.includes(settings.voice)
    ) || speechSynthesis.getVoices()[0];
    
    utterance.rate = settings.speed;
    utterance.pitch = settings.pitch;
    utterance.lang = settings.language;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast({
        title: "Speech failed",
        description: "Could not synthesize speech",
        variant: "destructive"
      });
    };
    
    speechSynthesisRef.current = utterance;
    speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleVoiceSettings = () => {
    onSettingsChange({
      ...settings,
      enabled: !settings.enabled
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      speechSynthesis.cancel();
    };
  }, []);

  // Expose speakText function
  useEffect(() => {
    if (settings.enabled) {
      // This could be called from parent component
    }
  }, [settings.enabled]);

  const VOICE_OPTIONS = [
    { id: 'Aria', name: 'Aria (English - Warm)', language: 'en-US' },
    { id: 'Sarah', name: 'Sarah (Multilingual - Spanish)', language: 'multi' },
    { id: 'Charlotte', name: 'Charlotte (English - Professional)', language: 'en-US' },
    { id: 'Alice', name: 'Alice (English - Friendly)', language: 'en-US' },
    { id: 'Jessica', name: 'Jessica (English - Calm)', language: 'en-US' }
  ];

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4" />
            <span className="text-sm font-medium">Voice Interface</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={settings.enabled ? "default" : "secondary"}
              className="text-xs"
            >
              {settings.enabled ? "Active" : "Disabled"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVoiceSettings}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {settings.enabled && (
          <div className="space-y-4">
            {/* Voice Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice</label>
              <select 
                value={settings.voice}
                onChange={(e) => onSettingsChange({ ...settings, voice: e.target.value })}
                className="w-full p-2 rounded border bg-background text-sm"
              >
                {VOICE_OPTIONS.map(voice => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Sarah voice supports fluent Costa Rican Spanish and English
              </p>
            </div>
            {/* Recording Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant={isRecording ? "destructive" : "default"}
                size="sm"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Stop ({recordingDuration}s)
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Record
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={isSpeaking ? stopSpeaking : () => speakText("Hello! This is a test of the voice synthesis system.")}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    Stop
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    Test Voice
                  </>
                )}
              </Button>
            </div>

            {/* Audio Level Indicator */}
            {isRecording && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Audio Level</span>
                  <span>{Math.round(audioLevel)}%</span>
                </div>
                <Progress value={audioLevel} className="h-2" />
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing audio...
              </div>
            )}

            {/* Speaking Indicator */}
            {isSpeaking && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <Volume2 className="w-4 h-4 animate-pulse" />
                Speaking...
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceInterface;