import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Sprout, AlertTriangle, CheckCircle, XCircle, Brain, Loader2 } from "lucide-react";
import { sensorAI } from "@/services/sensorAI";

interface SensorData {
  soilMoisture: number;
  temperature: number;
  humidity: number;
  waterLevel: number;
  rain: number;
  light: number;
}

interface AIRecommendation {
  type: 'good' | 'warning' | 'critical';
  title: string;
  message: string;
  action: string;
  confidence: number;
}

interface RecommendationsPanelProps {
  sensorData: SensorData;
}

export function RecommendationsPanel({ sensorData }: RecommendationsPanelProps) {
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [suitablePlants, setSuitablePlants] = useState<string[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isAIInitialized, setIsAIInitialized] = useState(false);
  const [useAI, setUseAI] = useState(false);

  // Initialize AI on component mount
  useEffect(() => {
    const initializeAI = async () => {
      try {
        await sensorAI.initialize();
        setIsAIInitialized(true);
      } catch (error) {
        console.error('Failed to initialize AI:', error);
      }
    };
    
    initializeAI();
  }, []);

  // Generate AI recommendations when sensor data changes
  useEffect(() => {
    if (useAI && isAIInitialized) {
      generateAIRecommendations();
    } else {
      setAiRecommendations(getFallbackRecommendations());
    }
    generatePlantRecommendations();
  }, [sensorData, useAI, isAIInitialized]);

  const generateAIRecommendations = async () => {
    setIsLoadingAI(true);
    try {
      const recommendations = await sensorAI.generateRecommendations(sensorData);
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('AI recommendation failed:', error);
      setAiRecommendations(getFallbackRecommendations());
    } finally {
      setIsLoadingAI(false);
    }
  };

  const generatePlantRecommendations = async () => {
    try {
      const plants = await sensorAI.getSuitablePlants(sensorData);
      setSuitablePlants(plants);
    } catch (error) {
      console.error('Plant recommendation failed:', error);
      setSuitablePlants(['Adjust conditions for optimal plant growth']);
    }
  };

  const getFallbackRecommendations = (): AIRecommendation[] => {
    const recommendations = [];
    
    // Soil moisture analysis
    if (sensorData.soilMoisture < 30) {
      recommendations.push({
        type: 'critical' as const,
        title: 'Soil Moisture Critical',
        message: 'Soil is too dry. Water immediately to prevent plant stress.',
        action: 'Water the plants now',
        confidence: 0.9
      });
    } else if (sensorData.soilMoisture < 50) {
      recommendations.push({
        type: 'warning' as const,
        title: 'Soil Moisture Low',
        message: 'Consider watering soon to maintain optimal moisture levels.',
        action: 'Schedule watering within 2-4 hours',
        confidence: 0.8
      });
    }

    // Temperature analysis
    if (sensorData.temperature > 35) {
      recommendations.push({
        type: 'warning' as const,
        title: 'High Temperature',
        message: 'Temperature is high. Provide shade or increase ventilation.',
        action: 'Install shade cloth or improve airflow',
        confidence: 0.85
      });
    } else if (sensorData.temperature < 10) {
      recommendations.push({
        type: 'warning' as const,
        title: 'Low Temperature',
        message: 'Temperature is low. Consider protection for sensitive plants.',
        action: 'Use frost protection or heating',
        confidence: 0.8
      });
    }

    // Water level analysis
    if (sensorData.waterLevel < 20) {
      recommendations.push({
        type: 'critical' as const,
        title: 'Water Tank Low',
        message: 'Water reservoir is critically low. Refill immediately.',
        action: 'Refill water tank',
        confidence: 0.95
      });
    }

    // Light analysis
    if (sensorData.light < 200) {
      recommendations.push({
        type: 'warning' as const,
        title: 'Low Light Conditions',
        message: 'Light levels are low. Consider supplemental lighting.',
        action: 'Add grow lights or relocate plants',
        confidence: 0.75
      });
    }

    // If no issues, provide positive feedback
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'good' as const,
        title: 'Optimal Conditions',
        message: 'All sensor readings are within optimal ranges.',
        action: 'Continue current care routine',
        confidence: 0.9
      });
    }

    return recommendations;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'critical': return XCircle;
      case 'warning': return AlertTriangle;
      default: return CheckCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Toggle and Status */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI-Powered Analysis
            </div>
            <div className="flex items-center gap-2">
              {isAIInitialized && (
                <Badge variant="outline" className="text-xs">
                  AI Ready
                </Badge>
              )}
              <Button
                onClick={() => setUseAI(!useAI)}
                size="sm"
                variant={useAI ? "default" : "outline"}
                disabled={!isAIInitialized}
                className={useAI ? "bg-gradient-primary" : ""}
              >
                {useAI ? "AI Mode" : "Basic Mode"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        {!isAIInitialized && (
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Initializing AI model...
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recommendations */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Smart Recommendations
            {isLoadingAI && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {aiRecommendations.map((rec, index) => {
            const Icon = getIcon(rec.type);
            return (
              <Alert key={index} className={`border-l-4 ${
                rec.type === 'critical' ? 'border-l-sensor-critical bg-red-50' :
                rec.type === 'warning' ? 'border-l-sensor-warning bg-yellow-50' :
                'border-l-sensor-good bg-green-50'
              }`}>
                <Icon className={`h-4 w-4 ${
                  rec.type === 'critical' ? 'text-sensor-critical' :
                  rec.type === 'warning' ? 'text-sensor-warning' :
                  'text-sensor-good'
                }`} />
                <AlertDescription className="ml-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-sm">{rec.title}</div>
                    {useAI && (
                      <Badge variant="outline" className="text-xs">
                        {(rec.confidence * 100).toFixed(0)}% confident
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{rec.message}</div>
                  <div className="text-xs font-medium mt-2 text-primary">{rec.action}</div>
                </AlertDescription>
              </Alert>
            );
          })}
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