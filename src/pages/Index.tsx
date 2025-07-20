import { useState, useEffect } from "react";
import { SensorCard } from "@/components/SensorCard";
import { DataSourceSelector } from "@/components/DataSourceSelector";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import { ManualInputPanel } from "@/components/ManualInputPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Droplets, 
  Thermometer, 
  Cloud, 
  Waves, 
  CloudRain, 
  Sun,
  Cpu,
  Activity
} from "lucide-react";

interface SensorData {
  soilMoisture: number | null;
  temperature: number | null;
  humidity: number | null;
  waterLevel: number | null;
  rain: number | null;
  light: number | null;
}

interface RegionSettings {
  name: string;
  optimalTemp: { min: number; max: number };
  optimalHumidity: { min: number; max: number };
  optimalSoilMoisture: { min: number; max: number };
}

const Index = () => {
  const { toast } = useToast();
  const [dataSource, setDataSource] = useState<'arduino' | 'simulated' | 'manual'>('simulated');
  const [isConnected, setIsConnected] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('temperate');
  const [sensorData, setSensorData] = useState<SensorData>({
    soilMoisture: 65.4,
    temperature: 24.8,
    humidity: 58.2,
    waterLevel: 78.9,
    rain: 12.3,
    light: 450
  });

  const regions: Record<string, RegionSettings> = {
    temperate: {
      name: "Temperate Climate",
      optimalTemp: { min: 15, max: 25 },
      optimalHumidity: { min: 40, max: 70 },
      optimalSoilMoisture: { min: 40, max: 80 }
    },
    tropical: {
      name: "Tropical Climate", 
      optimalTemp: { min: 22, max: 32 },
      optimalHumidity: { min: 60, max: 85 },
      optimalSoilMoisture: { min: 50, max: 85 }
    },
    arid: {
      name: "Arid/Desert Climate",
      optimalTemp: { min: 20, max: 35 },
      optimalHumidity: { min: 20, max: 40 },
      optimalSoilMoisture: { min: 20, max: 50 }
    },
    mediterranean: {
      name: "Mediterranean Climate",
      optimalTemp: { min: 18, max: 28 },
      optimalHumidity: { min: 45, max: 65 },
      optimalSoilMoisture: { min: 35, max: 70 }
    }
  };

  // Simulate sensor data
  const generateSimulatedData = (): SensorData => ({
    soilMoisture: Math.random() * 100,
    temperature: 15 + Math.random() * 25,
    humidity: 30 + Math.random() * 50,
    waterLevel: Math.random() * 100,
    rain: Math.random() * 100,
    light: Math.random() * 1000
  });

  // Get sensor status based on value ranges and selected region
  const getSensorStatus = (sensor: keyof SensorData, value: number | null): 'good' | 'warning' | 'critical' => {
    if (value === null) return 'critical';
    
    const region = regions[selectedRegion];
    
    switch (sensor) {
      case 'soilMoisture':
        if (value < region.optimalSoilMoisture.min - 20) return 'critical';
        if (value < region.optimalSoilMoisture.min || value > region.optimalSoilMoisture.max + 10) return 'warning';
        return 'good';
      case 'temperature':
        if (value < region.optimalTemp.min - 10 || value > region.optimalTemp.max + 10) return 'critical';
        if (value < region.optimalTemp.min || value > region.optimalTemp.max) return 'warning';
        return 'good';
      case 'humidity':
        if (value < region.optimalHumidity.min - 20 || value > region.optimalHumidity.max + 20) return 'critical';
        if (value < region.optimalHumidity.min || value > region.optimalHumidity.max) return 'warning';
        return 'good';
      case 'waterLevel':
        if (value < 20) return 'critical';
        if (value < 40) return 'warning';
        return 'good';
      case 'rain':
        if (value > 80) return 'warning';
        return 'good';
      case 'light':
        if (value < 100) return 'critical';
        if (value < 300) return 'warning';
        return 'good';
      default:
        return 'good';
    }
  };

  // Auto-refresh data every 5 seconds
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      if (dataSource === 'simulated') {
        setSensorData(generateSimulatedData());
      } else if (dataSource === 'arduino') {
        // Arduino mode shows null until real data comes in
        // In a real implementation, this would read from serial port
        setSensorData({
          soilMoisture: null,
          temperature: null,
          humidity: null,
          waterLevel: null,
          rain: null,
          light: null
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected, dataSource]);

  // Initialize Arduino mode data to null when switching
  useEffect(() => {
    if (dataSource === 'arduino') {
      setSensorData({
        soilMoisture: null,
        temperature: null,
        humidity: null,
        waterLevel: null,
        rain: null,
        light: null
      });
    }
  }, [dataSource]);

  const handleDataSourceChange = (source: 'arduino' | 'simulated' | 'manual') => {
    setDataSource(source);
    toast({
      title: "Data Source Changed",
      description: `Switched to ${source} mode`,
    });
  };

  const handleToggleConnection = () => {
    setIsConnected(!isConnected);
    toast({
      title: isConnected ? "Disconnected" : "Connected",
      description: isConnected ? "Data collection stopped" : "Data collection started",
      variant: isConnected ? "destructive" : "default"
    });
  };

  const handleRunSimulation = () => {
    setSensorData(generateSimulatedData());
    toast({
      title: "Simulation Updated",
      description: "New sensor data generated",
    });
  };

  const handleManualDataUpdate = (newData: SensorData) => {
    setSensorData(newData);
    toast({
      title: "Data Updated",
      description: "Sensor values updated manually",
    });
  };

  return (
    <div className="min-h-screen bg-background-gradient">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-primary rounded-full">
              <Cpu className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Arduino Sensor Dashboard
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Real-time environmental monitoring and smart recommendations
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Activity className={`h-4 w-4 ${isConnected ? 'text-sensor-good animate-pulse' : 'text-muted-foreground'}`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Live monitoring active' : 'Monitoring paused'}
            </span>
          </div>
        </div>

        {/* Data Source Configuration */}
        <DataSourceSelector
          currentSource={dataSource}
          onSourceChange={handleDataSourceChange}
          isConnected={isConnected}
          onToggleConnection={handleToggleConnection}
          onRunSimulation={handleRunSimulation}
        />

        {/* Region Selection */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              Climate Region
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(regions).map(([key, region]) => (
                <Button
                  key={key}
                  variant={selectedRegion === key ? 'default' : 'outline'}
                  onClick={() => setSelectedRegion(key)}
                  className={selectedRegion === key ? 'bg-gradient-primary' : ''}
                >
                  {region.name}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Selected: {regions[selectedRegion].name} | 
              Optimal temp: {regions[selectedRegion].optimalTemp.min}°C - {regions[selectedRegion].optimalTemp.max}°C
            </p>
          </CardContent>
        </Card>

        {/* Manual Input Panel */}
        <ManualInputPanel
          sensorData={sensorData}
          onDataUpdate={handleManualDataUpdate}
          isVisible={dataSource === 'manual'}
        />

        {/* Sensor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SensorCard
            title="Soil Moisture"
            value={sensorData.soilMoisture}
            unit="%"
            icon={Droplets}
            status={getSensorStatus('soilMoisture', sensorData.soilMoisture)}
            description="Plant root zone hydration"
            min={0}
            max={100}
          />
          
          <SensorCard
            title="Temperature"
            value={sensorData.temperature}
            unit="°C"
            icon={Thermometer}
            status={getSensorStatus('temperature', sensorData.temperature)}
            description="Ambient air temperature"
            min={-10}
            max={50}
          />
          
          <SensorCard
            title="Humidity"
            value={sensorData.humidity}
            unit="%"
            icon={Cloud}
            status={getSensorStatus('humidity', sensorData.humidity)}
            description="Relative air humidity"
            min={0}
            max={100}
          />
          
          <SensorCard
            title="Water Level"
            value={sensorData.waterLevel}
            unit="%"
            icon={Waves}
            status={getSensorStatus('waterLevel', sensorData.waterLevel)}
            description="Irrigation tank capacity"
            min={0}
            max={100}
          />
          
          <SensorCard
            title="Rain Sensor"
            value={sensorData.rain}
            unit="%"
            icon={CloudRain}
            status={getSensorStatus('rain', sensorData.rain)}
            description="Precipitation detection"
            min={0}
            max={100}
          />
          
          <SensorCard
            title="Light Intensity"
            value={sensorData.light}
            unit="lux"
            icon={Sun}
            status={getSensorStatus('light', sensorData.light)}
            description="Ambient light levels"
            min={0}
            max={1000}
          />
        </div>

        {/* Recommendations Panel */}
        <RecommendationsPanel sensorData={sensorData} />
      </div>
    </div>
  );
};

export default Index;
