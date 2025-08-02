import MochaSidebar from "@/components/MochaSidebar";
import MochaHeader from "@/components/MochaHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, Shield, Database, Activity, AlertCircle } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="lg:flex">
        <MochaSidebar />
        
        <div className="flex-1 lg:ml-0">
          <MochaHeader />
          
          <main className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 pb-20">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2">Manage XMRT ecosystem operations and configurations</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* System Status */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Activity className="w-5 h-5 text-primary" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Network</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Contracts</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400">Deployed</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">API</span>
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400">Partial</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* User Management */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Users className="w-5 h-5 text-primary" />
                      User Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">1,247</div>
                      <div className="text-sm text-muted-foreground">Active Users</div>
                    </div>
                    <Button className="w-full neon-button">
                      Manage Users
                    </Button>
                  </CardContent>
                </Card>

                {/* Security */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Shield className="w-5 h-5 text-primary" />
                      Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Last Audit</span>
                      <span className="text-sm text-foreground">2 days ago</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Threats</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400">None</Badge>
                    </div>
                    <Button className="w-full neon-button">
                      Security Settings
                    </Button>
                  </CardContent>
                </Card>

                {/* Database */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Database className="w-5 h-5 text-primary" />
                      Database
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">99.9%</div>
                      <div className="text-sm text-muted-foreground">Uptime</div>
                    </div>
                    <Button className="w-full neon-button">
                      Database Admin
                    </Button>
                  </CardContent>
                </Card>

                {/* Configuration */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Settings className="w-5 h-5 text-primary" />
                      Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-sm">API Keys</span>
                        <span className="text-sm text-foreground">3/5 Active</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-sm">Features</span>
                        <span className="text-sm text-foreground">All Enabled</span>
                      </div>
                    </div>
                    <Button className="w-full neon-button">
                      System Config
                    </Button>
                  </CardContent>
                </Card>

                {/* Alerts */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <AlertCircle className="w-5 h-5 text-primary" />
                      System Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">0</div>
                      <div className="text-sm text-muted-foreground">Active Alerts</div>
                    </div>
                    <Button className="w-full neon-button">
                      View All Alerts
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Admin Actions */}
              <Card className="glass-card mt-6">
                <CardHeader>
                  <CardTitle className="text-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button className="neon-button h-auto py-4 flex-col gap-2">
                      <Settings className="w-5 h-5" />
                      <span className="text-sm">System Settings</span>
                    </Button>
                    <Button className="neon-button h-auto py-4 flex-col gap-2">
                      <Users className="w-5 h-5" />
                      <span className="text-sm">User Roles</span>
                    </Button>
                    <Button className="neon-button h-auto py-4 flex-col gap-2">
                      <Database className="w-5 h-5" />
                      <span className="text-sm">Backup Data</span>
                    </Button>
                    <Button className="neon-button h-auto py-4 flex-col gap-2">
                      <Shield className="w-5 h-5" />
                      <span className="text-sm">Security Scan</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}