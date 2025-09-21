import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, Camera, Mic, FileText, Image, Video, 
  Music, X, AlertCircle, CheckCircle2, Loader2 
} from 'lucide-react';
import { MediaFile } from '@/types/multimodal';
import { useToast } from '@/components/ui/use-toast';

interface MediaUploaderProps {
  onFilesAdded: (files: MediaFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number;
  allowedTypes?: string[];
  className?: string;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onFilesAdded,
  maxFiles = 5,
  maxFileSize = 20 * 1024 * 1024,
  allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/mov',
    'audio/mp3', 'audio/wav', 'audio/ogg',
    'application/pdf', 'text/plain'
  ],
  className = ''
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  const getFileType = (file: File): 'image' | 'video' | 'audio' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const createMediaFile = useCallback(async (file: File): Promise<MediaFile> => {
    const type = getFileType(file);
    const url = URL.createObjectURL(file);
    
    let metadata = {
      size: file.size,
      mimeType: file.type
    };

    // Generate preview for images and videos
    let preview = undefined;
    if (type === 'image') {
      preview = url;
    } else if (type === 'video') {
      // Create video thumbnail
      const video = document.createElement('video');
      video.src = url;
      video.load();
      
      preview = await new Promise<string>((resolve) => {
        video.onloadedmetadata = () => {
          video.currentTime = 1; // Seek to 1 second
          video.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
            resolve(canvas.toDataURL());
          };
        };
      });
      
      metadata = {
        ...metadata,
      };
    }

    return {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      type,
      url,
      preview,
      metadata,
      processing: {
        status: 'complete'
      }
    };
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }

    const newFiles: MediaFile[] = [];
    
    for (const file of acceptedFiles) {
      if (file.size > maxFileSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`,
          variant: "destructive"
        });
        continue;
      }

      try {
        const mediaFile = await createMediaFile(file);
        newFiles.push(mediaFile);
      } catch (error) {
        console.error('Error processing file:', error);
        toast({
          title: "File processing error",
          description: `Failed to process ${file.name}`,
          variant: "destructive"
        });
      }
    }

    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
      onFilesAdded(newFiles);
    }
  }, [uploadedFiles.length, maxFiles, maxFileSize, createMediaFile, onFilesAdded, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: maxFiles - uploadedFiles.length,
    multiple: true
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      
      // Create video element for capture
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // For now, just show a basic capture interface
      toast({
        title: "Camera activated",
        description: "Camera capture will be implemented in the next iteration"
      });
      
      // Stop stream for now
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please enable camera permissions",
        variant: "destructive"
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      
      // Basic recording setup - will be enhanced with full implementation
      toast({
        title: "Recording started",
        description: "Voice recording will be implemented in the next iteration"
      });
      
      // Stop stream for now
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Microphone access denied",
        description: "Please enable microphone permissions",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card 
        {...getRootProps()} 
        className={`cursor-pointer transition-all duration-200 ${
          isDragActive 
            ? 'border-primary bg-primary/5 scale-105' 
            : 'border-dashed border-muted-foreground/50 hover:border-primary/50'
        }`}
      >
        <CardContent className="p-6 text-center">
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-primary">Drop files here...</p>
          ) : (
            <div>
              <p className="mb-2">Drag & drop files here, or click to browse</p>
              <p className="text-sm text-muted-foreground">
                Images, videos, audio, documents (max {Math.round(maxFileSize / 1024 / 1024)}MB each)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={startCamera}
          className="flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Camera
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={startRecording}
          disabled={isRecording}
          className="flex items-center gap-2"
        >
          {isRecording ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
          {isRecording ? 'Recording...' : 'Voice'}
        </Button>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Attached Files</h4>
          <div className="grid gap-2">
            {uploadedFiles.map((file) => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {getFileIcon(file.type)}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.file.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {file.type}
                        </Badge>
                        <span>{(file.metadata?.size || 0) > 1024 * 1024 
                          ? `${(file.metadata!.size / 1024 / 1024).toFixed(1)}MB`
                          : `${(file.metadata!.size / 1024).toFixed(1)}KB`}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {file.processing?.status === 'complete' && (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    )}
                    {file.processing?.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {file.processing?.status === 'processing' && (
                  <Progress 
                    value={file.processing.progress || 0} 
                    className="mt-2"
                  />
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;