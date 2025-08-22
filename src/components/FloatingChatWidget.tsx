import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Minimize2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ElizaChatbot from "@/components/ElizaChatbot";

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg neon-button relative group"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
          <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs">
            <span className="animate-pulse">●</span>
          </Badge>
        </Button>
      </div>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl h-[80vh] max-h-[600px] p-0 bg-transparent border-none shadow-none">
          <div className="h-full">
            <ElizaChatbot className="h-full border-0" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}