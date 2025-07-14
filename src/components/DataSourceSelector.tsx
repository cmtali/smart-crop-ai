import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, Play, Settings, WifiOff } from "lucide-react";

interface DataSourceSelectorProps {
  currentSource: 'arduino' | 'simulated' | 'manual';
  onSourceChange: (source: 'arduino' | 'simulated' | 'manual') => void;
  isConnected: boolean;
  onToggleConnection: () => void;
  onRunSimulation: () => void;
}

export function DataSourceSelector({ 
  currentSource, 
  onSourceChange, 
  isConnected, 
  onToggleConnection,
  onRunSimulation 
}: DataSourceSelectorProps) {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Data Source Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={currentSource === 'arduino' ? 'default' : 'outline'}
            onClick={() => onSourceChange('arduino')}
            className={currentSource === 'arduino' ? 'bg-gradient-primary' : ''}
          >
            Arduino (Serial)
          </Button>
          <Button
            variant={currentSource === 'simulated' ? 'default' : 'outline'}
            onClick={() => onSourceChange('simulated')}
            className={currentSource === 'simulated' ? 'bg-gradient-secondary' : ''}
          >
            Simulated Data
          </Button>
          <Button
            variant={currentSource === 'manual' ? 'default' : 'outline'}
            onClick={() => onSourceChange('manual')}
            className={currentSource === 'manual' ? 'bg-gradient-warning' : ''}
          >
            Manual Input
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant={isConnected ? 'default' : 'secondary'}
              className={isConnected ? 'bg-gradient-success' : ''}
            >
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Auto-refresh: 5s
            </span>
          </div>
          
          <div className="flex gap-2">
            {currentSource === 'simulated' && (
              <Button
                onClick={onRunSimulation}
                size="sm"
                className="bg-gradient-secondary"
              >
                <Play className="h-4 w-4 mr-1" />
                Run Simulation
              </Button>
            )}
            <Button
              onClick={onToggleConnection}
              size="sm"
              variant={isConnected ? 'destructive' : 'default'}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}