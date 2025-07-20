
import MochaSidebar from "@/components/MochaSidebar";
import MochaHeader from "@/components/MochaHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, Send, Download, Shield, Users, Smartphone } from "lucide-react";

export default function Index() {
  return (
    <div className="flex min-h-screen bg-background">
      <MochaSidebar />
      
      <main className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <MochaHeader />
        
        <div className="flex-1 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          {/* Balance Section */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-neon">
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="text-sm text-muted-foreground">Your Balance</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-foreground">$2,847.32</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
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
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-neon">
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                  <Button variant="outline" className="flex-1 sm:flex-none border-primary/30 text-primary hover:bg-primary/10">
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Receive
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-neon">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2">
                <span className="text-primary text-xl">⚡</span>
                Quick Pay
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 h-16 rounded-xl shadow-neon">
                  <div className="text-center">
                    <Send className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-sm font-medium">Tap to Pay</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-16 rounded-xl border-primary/30 hover:bg-primary/10">
                  <div className="text-center">
                    <Shield className="w-6 h-6 mx-auto mb-1" />
                    <div className="text-sm font-medium">Secure Circle</div>
                  </div>
                </Button>
              </div>
              <Button variant="ghost" className="w-full mt-3 text-muted-foreground hover:text-primary hover:bg-primary/5">
                <Send className="w-4 h-4 mr-2" />
                Send to Anyone
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Secure Circle */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-neon">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Secure Circle
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="text-center py-6 sm:py-8">
                  <p className="text-muted-foreground mb-4">No friends in your secure circle yet</p>
                  <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10">
                    Add to Circle
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Mobile App Connection */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-neon">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg">Connect Mobile App</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="text-center py-4 sm:py-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-neon">
                    <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">MobileMonero Wallet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Scan QR to connect</p>
                  <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10">
                    Show QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-neon">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 space-y-3 sm:space-y-4">
              {[
                { type: "Sent", address: "0x1234...5678", amount: "-0.5 XMR", date: "2024-02-20", color: "destructive" },
                { type: "Received", address: "0x8765...4321", amount: "+1.2 XMR", date: "2024-02-19", color: "primary" },
                { type: "Sent", address: "0x9876...1234", amount: "-0.3 XMR", date: "2024-02-18", color: "destructive" }
              ].map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-${tx.color}/20 rounded-full flex items-center justify-center`}>
                      {tx.type === "Sent" ? (
                        <ArrowUpRight className="w-4 h-4 text-destructive" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm sm:text-base">{tx.type}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{tx.address}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`${tx.color === 'primary' ? 'text-primary' : 'text-destructive'} font-medium text-sm sm:text-base`}>
                      {tx.amount}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{tx.date}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
