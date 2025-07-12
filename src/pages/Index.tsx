
import MochaSidebar from "@/components/MochaSidebar";
import MochaHeader from "@/components/MochaHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Send, Download, TrendingUp, Shield, Users } from "lucide-react";

export default function Index() {
  return (
    <div className="flex min-h-screen bg-background">
      <MochaSidebar />
      <main className="flex-1 flex flex-col">
        <MochaHeader />
        
        <div className="flex-1 p-6 space-y-6">
          {/* Balance Section */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Your Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold text-foreground">$2,847.32</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">24h Change</span>
                      <div className="text-primary font-medium">+3.24%</div>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Portfolio Value</span>
                      <div className="text-foreground font-medium">$8,192.45</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                  <Button variant="outline">
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Receive
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-primary">⚡</span>
                Quick Pay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-16 rounded-xl">
                  <div className="text-center">
                    <Send className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-sm font-medium">Tap to Pay</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-16 rounded-xl">
                  <div className="text-center">
                    <Shield className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-sm font-medium">Secure Circle</div>
                  </div>
                </Button>
              </div>
              <Button variant="ghost" className="w-full mt-3 text-muted-foreground">
                <Send className="w-4 h-4 mr-2" />
                Send to Anyone
              </Button>
            </CardContent>
          </Card>

          {/* Secure Circle */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Secure Circle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No friends in your secure circle yet</p>
                <Button variant="outline" className="w-full">
                  Add to Circle
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <div className="font-medium">Sent</div>
                    <div className="text-sm text-muted-foreground">0x1234...5678</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-destructive font-medium">-0.5 XMR</div>
                  <div className="text-sm text-muted-foreground">2024-02-20</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <ArrowDownLeft className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Received</div>
                    <div className="text-sm text-muted-foreground">0x8765...4321</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-primary font-medium">+1.2 XMR</div>
                  <div className="text-sm text-muted-foreground">2024-02-19</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <div className="font-medium">Sent</div>
                    <div className="text-sm text-muted-foreground">0x9876...1234</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-destructive font-medium">-0.3 XMR</div>
                  <div className="text-sm text-muted-foreground">2024-02-18</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile App Connection */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Scan to connect with our mobile app</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-2">MobileMonero Wallet app</h3>
                  <p className="text-sm text-muted-foreground mb-4">Connect with your self-custody wallet</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div>1. Open MobileMonero Wallet app</div>
                    <div>2. Tap <strong>Scan</strong></div>
                  </div>
                </div>
                <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-4xl">📱</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
