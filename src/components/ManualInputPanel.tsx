import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit3 } from "lucide-react";

interface SensorData {
  soilMoisture: number;
  temperature: number;
  humidity: number;
  waterLevel: number;
  rain: number;
  light: number;
}

interface ManualInputPanelProps {
  sensorData: SensorData;
  onDataUpdate: (data: SensorData) => void;
  isVisible: boolean;
}

export function ManualInputPanel({ sensorData, onDataUpdate, isVisible }: ManualInputPanelProps) {
  const [formData, setFormData] = useState(sensorData);

  const handleInputChange = (field: keyof SensorData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDataUpdate(formData);
  };

  if (!isVisible) return null;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="h-5 w-5 text-primary" />
          Manual Sensor Input
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="soilMoisture">Soil Moisture (%)</Label>
              <Input
                id="soilMoisture"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.soilMoisture}
                onChange={(e) => handleInputChange('soilMoisture', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                min="-50"
                max="80"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => handleInputChange('temperature', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="humidity">Humidity (%)</Label>
              <Input
                id="humidity"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.humidity}
                onChange={(e) => handleInputChange('humidity', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="waterLevel">Water Level (%)</Label>
              <Input
                id="waterLevel"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.waterLevel}
                onChange={(e) => handleInputChange('waterLevel', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="rain">Rain Sensor (%)</Label>
              <Input
                id="rain"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.rain}
                onChange={(e) => handleInputChange('rain', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="light">Light (lux)</Label>
              <Input
                id="light"
                type="number"
                min="0"
                max="100000"
                step="1"
                value={formData.light}
                onChange={(e) => handleInputChange('light', e.target.value)}
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full bg-gradient-primary">
            Update Sensor Data
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}