import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Clock, Moon, Sun } from "lucide-react";

export const OnlineStatusSettings = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [autoAway, setAutoAway] = useState(true);
  const [awayAfterMinutes, setAwayAfterMinutes] = useState(15);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wifi className="h-5 w-5 mr-2" />
          Online Status & Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-muted-foreground'}`} />
            <div>
              <Label className="text-base font-medium text-card-foreground">
                {isOnline ? 'Online' : 'Offline'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {isOnline ? 'You appear online to other users' : 'You appear offline to other users'}
              </p>
            </div>
          </div>
          <Badge variant={isOnline ? "default" : "secondary"}>
            {isOnline ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Online Status Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label>Show Online Status</Label>
            <p className="text-sm text-muted-foreground">Let others see when you're online</p>
          </div>
          <Switch 
            checked={showOnlineStatus} 
            onCheckedChange={setShowOnlineStatus}
          />
        </div>

        {/* Auto Away Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Away Mode</Label>
              <p className="text-sm text-muted-foreground">Automatically set status to away when inactive</p>
            </div>
            <Switch 
              checked={autoAway} 
              onCheckedChange={setAutoAway}
            />
          </div>

          {autoAway && (
            <div className="ml-6 space-y-3">
              <div>
                <Label className="text-sm">Set away after</Label>
                <div className="flex items-center gap-2 mt-1">
                  <select 
                    value={awayAfterMinutes}
                    onChange={(e) => setAwayAfterMinutes(Number(e.target.value))}
                    className="px-3 py-1 border border-input rounded-md text-sm bg-background text-foreground"
                  >
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                  <span className="text-sm text-muted-foreground">of inactivity</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Status Actions */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Status</Label>
          <div className="flex gap-2">
            <Button
              variant={isOnline ? "default" : "outline"}
              size="sm"
              onClick={() => setIsOnline(true)}
              className="flex items-center gap-2"
            >
              <Sun className="h-4 w-4" />
              Available
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOnline(false)}
              className="flex items-center gap-2"
            >
              <Moon className="h-4 w-4" />
              Away
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOnline(false)}
              className="flex items-center gap-2"
            >
              <WifiOff className="h-4 w-4" />
              Offline
            </Button>
          </div>
        </div>

        {/* Status Schedule (Future Feature) */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <Label>Status Schedule</Label>
              <p className="text-sm text-muted-foreground">Set automatic status changes (Coming Soon)</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Configure
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
