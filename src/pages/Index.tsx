import { useState, useEffect } from "react";
import { SensorCard } from "@/components/SensorCard";
import { DataSourceSelector } from "@/components/DataSourceSelector";
import { RecommendationsPanel } from "@/components/RecommendationsPanel";
import { ManualInputPanel } from "@/components/ManualInputPanel";
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
  soilMoisture: number;
  temperature: number;
  humidity: number;
  waterLevel: number;
  rain: number;
  light: number;
}

const Index = () => {
  const { toast } = useToast();
  const [dataSource, setDataSource] = useState<'arduino' | 'simulated' | 'manual'>('simulated');
  const [isConnected, setIsConnected] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData>({
    soilMoisture: 65.4,
    temperature: 24.8,
    humidity: 58.2,
    waterLevel: 78.9,
    rain: 12.3,
    light: 450
  });

  // Simulate sensor data
  const generateSimulatedData = (): SensorData => ({
    soilMoisture: Math.random() * 100,
    temperature: 15 + Math.random() * 25,
    humidity: 30 + Math.random() * 50,
    waterLevel: Math.random() * 100,
    rain: Math.random() * 100,
    light: Math.random() * 1000
  });

  // Get sensor status based on value ranges
  const getSensorStatus = (sensor: keyof SensorData, value: number): 'good' | 'warning' | 'critical' => {
    switch (sensor) {
      case 'soilMoisture':
        if (value < 30) return 'critical';
        if (value < 50) return 'warning';
        return 'good';
      case 'temperature':
        if (value < 10 || value > 35) return 'warning';
        if (value < 5 || value > 40) return 'critical';
        return 'good';
      case 'humidity':
        if (value < 30 || value > 80) return 'warning';
        if (value < 20 || value > 90) return 'critical';
        return 'good';
      case 'waterLevel':
        if (value < 20) return 'critical';
        if (value < 40) return 'warning';
        return 'good';
      case 'rain':
        if (value > 70) return 'warning';
        return 'good';
      case 'light':
        if (value < 200) return 'warning';
        if (value < 100) return 'critical';
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
        // In a real implementation, this would read from serial port
        // For now, we'll simulate it with some variation
        setSensorData(prev => ({
          soilMoisture: Math.max(0, Math.min(100, prev.soilMoisture + (Math.random() - 0.5) * 5)),
          temperature: Math.max(-10, Math.min(50, prev.temperature + (Math.random() - 0.5) * 2)),
          humidity: Math.max(0, Math.min(100, prev.humidity + (Math.random() - 0.5) * 3)),
          waterLevel: Math.max(0, Math.min(100, prev.waterLevel + (Math.random() - 0.5) * 2)),
          rain: Math.max(0, Math.min(100, prev.rain + (Math.random() - 0.5) * 10)),
          light: Math.max(0, Math.min(1000, prev.light + (Math.random() - 0.5) * 50))
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isConnected, dataSource]);

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
