import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Sprout, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface SensorData {
  soilMoisture: number;
  temperature: number;
  humidity: number;
  waterLevel: number;
  rain: number;
  light: number;
}

interface RecommendationsPanelProps {
  sensorData: SensorData;
}

export function RecommendationsPanel({ sensorData }: RecommendationsPanelProps) {
  const getRecommendations = () => {
    const recommendations = [];
    
    // Soil moisture analysis
    if (sensorData.soilMoisture < 30) {
      recommendations.push({
        type: 'critical',
        icon: XCircle,
        title: 'Soil Moisture Critical',
        message: 'Soil is too dry. Water immediately to prevent plant stress.',
        action: 'Water the plants now'
      });
    } else if (sensorData.soilMoisture < 50) {
      recommendations.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Soil Moisture Low',
        message: 'Consider watering soon to maintain optimal moisture levels.',
        action: 'Schedule watering within 2-4 hours'
      });
    }

    // Temperature analysis
    if (sensorData.temperature > 35) {
      recommendations.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'High Temperature',
        message: 'Temperature is high. Provide shade or increase ventilation.',
        action: 'Install shade cloth or improve airflow'
      });
    } else if (sensorData.temperature < 10) {
      recommendations.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Low Temperature',
        message: 'Temperature is low. Consider protection for sensitive plants.',
        action: 'Use frost protection or heating'
      });
    }

    // Water level analysis
    if (sensorData.waterLevel < 20) {
      recommendations.push({
        type: 'critical',
        icon: XCircle,
        title: 'Water Tank Low',
        message: 'Water reservoir is critically low. Refill immediately.',
        action: 'Refill water tank'
      });
    }

    // Light analysis
    if (sensorData.light < 200) {
      recommendations.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Low Light Conditions',
        message: 'Light levels are low. Consider supplemental lighting.',
        action: 'Add grow lights or relocate plants'
      });
    }

    // If no issues, provide positive feedback
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'good',
        icon: CheckCircle,
        title: 'Optimal Conditions',
        message: 'All sensor readings are within optimal ranges.',
        action: 'Continue current care routine'
      });
    }

    return recommendations;
  };

  const getSuitablePlants = () => {
    const { temperature, humidity, light, soilMoisture } = sensorData;
    const plants = [];

    // High light, warm conditions
    if (light > 500 && temperature > 20 && soilMoisture > 40) {
      plants.push('Tomatoes', 'Peppers', 'Basil', 'Sunflowers');
    }
    
    // Medium light conditions
    if (light > 200 && light <= 500) {
      plants.push('Lettuce', 'Spinach', 'Herbs', 'Green Beans');
    }
    
    // High humidity tolerance
    if (humidity > 70) {
      plants.push('Ferns', 'Orchids', 'Tropical plants');
    }
    
    // Low light tolerance
    if (light <= 200) {
      plants.push('Pothos', 'Snake Plant', 'ZZ Plant');
    }
    
    // Cool weather crops
    if (temperature < 20 && temperature > 10) {
      plants.push('Cabbage', 'Broccoli', 'Peas', 'Carrots');
    }

    return plants.length > 0 ? plants : ['Adjust conditions for optimal plant growth'];
  };

  const recommendations = getRecommendations();
  const suitablePlants = getSuitablePlants();

  return (
    <div className="space-y-6">
      {/* Recommendations */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.map((rec, index) => (
            <Alert key={index} className={`border-l-4 ${
              rec.type === 'critical' ? 'border-l-sensor-critical bg-red-50' :
              rec.type === 'warning' ? 'border-l-sensor-warning bg-yellow-50' :
              'border-l-sensor-good bg-green-50'
            }`}>
              <rec.icon className={`h-4 w-4 ${
                rec.type === 'critical' ? 'text-sensor-critical' :
                rec.type === 'warning' ? 'text-sensor-warning' :
                'text-sensor-good'
              }`} />
              <AlertDescription className="ml-2">
                <div className="font-medium text-sm">{rec.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{rec.message}</div>
                <div className="text-xs font-medium mt-2 text-primary">{rec.action}</div>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      {/* Plant Recommendations */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-primary" />
            Suitable Plants & Crops
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-3">
            Based on current environmental conditions:
          </div>
          <div className="flex flex-wrap gap-2">
            {suitablePlants.map((plant, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {plant}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}