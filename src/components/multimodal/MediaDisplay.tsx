import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, Pause, Volume2, VolumeX, Download, Maximize2, 
  RotateCw, ZoomIn, ZoomOut, FileText, Image as ImageIcon 
} from 'lucide-react';
import { MediaFile, GeneratedContent } from '@/types/multimodal';

interface MediaDisplayProps {
  media?: MediaFile[];
  generated?: GeneratedContent[];
  className?: string;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({
  media = [],
  generated = [],
  className = ''
}) => {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState<Record<string, boolean>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  const allItems = [...media, ...generated];

  const togglePlay = (id: string, type: 'video' | 'audio') => {
    const element = type === 'video' ? videoRefs.current[id] : audioRefs.current[id];
    if (!element) return;

    if (isPlaying[id]) {
      element.pause();
    } else {
      element.play();
    }
    setIsPlaying(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMute = (id: string, type: 'video' | 'audio') => {
    const element = type === 'video' ? videoRefs.current[id] : audioRefs.current[id];
    if (!element) return;

    element.muted = !element.muted;
    setIsMuted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const downloadItem = (item: MediaFile | GeneratedContent) => {
    const url = 'file' in item ? item.url : item.url;
    const filename = 'file' in item 
      ? item.file.name 
      : `generated-${item.type}-${item.id}.${item.type === 'image' ? 'png' : 'mp4'}`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const renderImageDisplay = (item: MediaFile | GeneratedContent) => {
    const url = 'file' in item ? item.url : item.url;
    const isGenerated = !('file' in item);
    
    return (
      <Card key={item.id} className="overflow-hidden">
        <div className="relative group">
          <img
            src={url}
            alt={isGenerated ? item.prompt : 'file' in item ? item.file.name : ''}
            className="w-full h-auto max-h-64 object-cover cursor-pointer"
            onClick={() => setSelectedMedia(selectedMedia === item.id ? null : item.id)}
          />
          
          {/* Overlay controls */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedMedia(item.id)}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => downloadItem(item)}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {isGenerated ? `Generated ${item.type}` : 'file' in item ? item.file.name : ''}
              </p>
              {isGenerated && (
                <p className="text-xs text-muted-foreground truncate">
                  {item.prompt}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">
                <ImageIcon className="w-3 h-3 mr-1" />
                Image
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderVideoDisplay = (item: MediaFile | GeneratedContent) => {
    const url = 'file' in item ? item.url : item.url;
    const isGenerated = !('file' in item);
    
    return (
      <Card key={item.id} className="overflow-hidden">
        <div className="relative">
          <video
            ref={el => { if (el) videoRefs.current[item.id] = el; }}
            src={url}
            className="w-full h-auto max-h-64 object-cover"
            controls={false}
            onClick={() => togglePlay(item.id, 'video')}
            onPlay={() => setIsPlaying(prev => ({ ...prev, [item.id]: true }))}
            onPause={() => setIsPlaying(prev => ({ ...prev, [item.id]: false }))}
          />
          
          {/* Custom controls overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200">
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => togglePlay(item.id, 'video')}
                >
                  {isPlaying[item.id] ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toggleMute(item.id, 'video')}
                >
                  {isMuted[item.id] ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => downloadItem(item)}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {isGenerated ? `Generated Video` : 'file' in item ? item.file.name : ''}
              </p>
              {isGenerated && (
                <p className="text-xs text-muted-foreground truncate">
                  {item.prompt}
                </p>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              Video
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAudioDisplay = (item: MediaFile | GeneratedContent) => {
    const url = 'file' in item ? item.url : item.url;
    const isGenerated = !('file' in item);
    
    return (
      <Card key={item.id}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => togglePlay(item.id, 'audio')}
              >
                {isPlaying[item.id] ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleMute(item.id, 'audio')}
              >
                {isMuted[item.id] ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {isGenerated ? `Generated Audio` : 'file' in item ? item.file.name : ''}
              </p>
              {isGenerated && (
                <p className="text-xs text-muted-foreground truncate">
                  {item.prompt}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Audio
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadItem(item)}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <audio
            ref={el => { if (el) audioRefs.current[item.id] = el; }}
            src={url}
            className="hidden"
            onPlay={() => setIsPlaying(prev => ({ ...prev, [item.id]: true }))}
            onPause={() => setIsPlaying(prev => ({ ...prev, [item.id]: false }))}
          />
        </CardContent>
      </Card>
    );
  };

  const renderDocumentDisplay = (item: MediaFile) => {
    return (
      <Card key={item.id}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-8 h-8 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.file.type} • {item.metadata?.size && (
                    item.metadata.size > 1024 * 1024
                      ? `${(item.metadata.size / 1024 / 1024).toFixed(1)}MB`
                      : `${(item.metadata.size / 1024).toFixed(1)}KB`
                  )}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadItem(item)}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (allItems.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {allItems.map((item) => {
        const type = 'file' in item ? item.type : item.type;
        
        switch (type) {
          case 'image':
            return renderImageDisplay(item);
          case 'video':
            return renderVideoDisplay(item);
          case 'audio':
            return renderAudioDisplay(item);
          case 'document':
            return 'file' in item ? renderDocumentDisplay(item) : null;
          default:
            return null;
        }
      })}
      
      {/* Full-screen modal for selected media */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="max-w-full max-h-full">
            {(() => {
              const item = allItems.find(i => i.id === selectedMedia);
              if (!item) return null;
              
              const url = 'file' in item ? item.url : item.url;
              const type = 'file' in item ? item.type : item.type;
              
              if (type === 'image') {
                return (
                  <img
                    src={url}
                    alt=""
                    className="max-w-full max-h-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                );
              }
              
              if (type === 'video') {
                return (
                  <video
                    src={url}
                    controls
                    className="max-w-full max-h-full"
                    onClick={(e) => e.stopPropagation()}
                  />
                );
              }
              
              return null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaDisplay;