import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface SensorCardProps {
  title: string;
  value: number | string | null;
  unit: string;
  icon: LucideIcon;
  status: 'good' | 'warning' | 'critical';
  description?: string;
  min?: number;
  max?: number;
}

export function SensorCard({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  status, 
  description,
  min,
  max 
}: SensorCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'bg-gradient-success text-sensor-good-foreground';
      case 'warning': return 'bg-gradient-warning text-sensor-warning-foreground';
      case 'critical': return 'bg-gradient-critical text-sensor-critical-foreground';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'good': return 'Optimal';
      case 'warning': return 'Attention';
      case 'critical': return 'Critical';
    }
  };

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-105">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-foreground">
              {value === null ? (
                <span className="text-muted-foreground">null</span>
              ) : typeof value === 'number' ? (
                value.toFixed(1)
              ) : (
                value
              )}
              <span className="text-sm text-muted-foreground ml-1">{unit}</span>
            </div>
            {(min !== undefined && max !== undefined) && (
              <div className="text-xs text-muted-foreground mt-1">
                Range: {min} - {max} {unit}
              </div>
            )}
            {description && (
              <div className="text-xs text-muted-foreground mt-1">
                {description}
              </div>
            )}
          </div>
          <Badge className={`${getStatusColor()} border-0`}>
            {getStatusText()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}