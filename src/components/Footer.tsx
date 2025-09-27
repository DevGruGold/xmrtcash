import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Github, 
  Twitter, 
  Globe, 
  Shield,
  Users,
  MessageCircle
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border/50 mt-8">
      <div className="container max-w-screen-2xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold gradient-text">XMRT DAO</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Privacy-first mining collective powered by Monero and governed by the community.
            </p>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                <span className="w-2 h-2 bg-primary rounded-full mr-1 animate-pulse" />
                Live on Testnet
              </Badge>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/chat" className="hover:text-primary transition-colors">AI Assistant</a></li>
              <li><a href="/agents" className="hover:text-primary transition-colors">Agent Network</a></li>
              <li><a href="/meshnet" className="hover:text-primary transition-colors">MESHNET</a></li>
              <li><a href="/faucet" className="hover:text-primary transition-colors">XMRT Faucet</a></li>
            </ul>
          </div>

          {/* XMRT Features */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">XMRT Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/wrap-xmr" className="hover:text-primary transition-colors">Wrap XMR</a></li>
              <li><a href="/unwrap-xmr" className="hover:text-primary transition-colors">Unwrap XMR</a></li>
              <li><a href="/onramp-fiat" className="hover:text-primary transition-colors">Fiat On-Ramp</a></li>
              <li><a href="/offramp-fiat" className="hover:text-primary transition-colors">Fiat Off-Ramp</a></li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Community</h4>
            <div className="flex gap-3">
              <a 
                href="https://github.com/xmrt-dao" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-card hover:bg-muted transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com/xmrt_dao" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-card hover:bg-muted transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="https://xmrt.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-card hover:bg-muted transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              Join our community for updates and discussions.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 XMRT DAO. Built with privacy in mind.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="/license" className="hover:text-primary transition-colors">License</a>
            <span>•</span>
            <span>Privacy First</span>
            <span>•</span>
            <span>Decentralized</span>
          </div>
        </div>
      </div>
    </footer>
  );
}