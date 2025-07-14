import { pipeline } from '@huggingface/transformers';

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

class SensorAIService {
  private generator: any = null;
  private isInitializing = false;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized || this.isInitializing) return;
    
    this.isInitializing = true;
    try {
      console.log('Initializing AI model...');
      this.generator = await pipeline(
        'text-generation',
        'microsoft/DialoGPT-small'
      );
      this.isInitialized = true;
      console.log('AI model initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI model:', error);
      this.isInitialized = false;
    } finally {
      this.isInitializing = false;
    }
  }

  private analyzeSensorConditions(data: SensorData): string {
    const conditions = [];
    
    // Soil moisture analysis
    if (data.soilMoisture < 30) {
      conditions.push('critically dry soil');
    } else if (data.soilMoisture < 50) {
      conditions.push('moderately dry soil');
    } else if (data.soilMoisture > 80) {
      conditions.push('very wet soil');
    }

    // Temperature analysis
    if (data.temperature < 10) {
      conditions.push('cold temperature');
    } else if (data.temperature > 30) {
      conditions.push('hot temperature');
    }

    // Humidity analysis
    if (data.humidity < 40) {
      conditions.push('low humidity');
    } else if (data.humidity > 70) {
      conditions.push('high humidity');
    }

    // Water level analysis
    if (data.waterLevel < 20) {
      conditions.push('low water tank level');
    }

    // Rain analysis
    if (data.rain > 60) {
      conditions.push('heavy rain detected');
    }

    // Light analysis
    if (data.light < 200) {
      conditions.push('low light conditions');
    } else if (data.light > 800) {
      conditions.push('very bright conditions');
    }

    return conditions.join(', ') || 'optimal conditions';
  }

  private createPrompt(data: SensorData): string {
    const conditions = this.analyzeSensorConditions(data);
    
    return `You are an expert agricultural advisor analyzing IoT sensor data. Based on the current readings:

Soil Moisture: ${data.soilMoisture.toFixed(1)}%
Temperature: ${data.temperature.toFixed(1)}°C  
Humidity: ${data.humidity.toFixed(1)}%
Water Tank: ${data.waterLevel.toFixed(1)}%
Rain: ${data.rain.toFixed(1)}%
Light: ${data.light.toFixed(0)} lux

Current conditions: ${conditions}

Provide specific, actionable advice in exactly this format:
PRIORITY: [Critical/Warning/Good]
TITLE: [Brief descriptive title]
ACTION: [Specific action to take]
REASON: [Why this action is needed]

Focus on the most important issue. Be concise and practical.`;
  }

  async generateRecommendations(data: SensorData): Promise<AIRecommendation[]> {
    if (!this.isInitialized || !this.generator) {
      return this.getFallbackRecommendations(data);
    }

    try {
      const prompt = this.createPrompt(data);
      
      const result = await this.generator(prompt, {
        max_new_tokens: 200,
        temperature: 0.3,
        do_sample: true,
        top_p: 0.9,
        repetition_penalty: 1.1,
      });

      // Handle the result properly
      const output = Array.isArray(result) ? result[0] : result;
      const generatedText = (output as any)?.generated_text || '';
      const cleanText = generatedText.replace(prompt, '').trim();
      
      return this.parseAIResponse(cleanText, data);
    } catch (error) {
      console.error('AI generation failed:', error);
      return this.getFallbackRecommendations(data);
    }
  }

  private parseAIResponse(response: string, data: SensorData): AIRecommendation[] {
    try {
      const lines = response.split('\n').map(line => line.trim()).filter(line => line);
      
      let priority = 'good';
      let title = 'System Analysis';
      let action = 'Continue monitoring';
      let reason = 'Conditions are stable';

      for (const line of lines) {
        if (line.startsWith('PRIORITY:')) {
          priority = line.replace('PRIORITY:', '').trim().toLowerCase();
        } else if (line.startsWith('TITLE:')) {
          title = line.replace('TITLE:', '').trim();
        } else if (line.startsWith('ACTION:')) {
          action = line.replace('ACTION:', '').trim();
        } else if (line.startsWith('REASON:')) {
          reason = line.replace('REASON:', '').trim();
        }
      }

      // Map priority to our system
      const mappedPriority = priority.includes('critical') ? 'critical' : 
                           priority.includes('warning') ? 'warning' : 'good';

      return [{
        type: mappedPriority as 'good' | 'warning' | 'critical',
        title,
        message: reason,
        action,
        confidence: 0.85
      }];
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.getFallbackRecommendations(data);
    }
  }

  private getFallbackRecommendations(data: SensorData): AIRecommendation[] {
    // Smart fallback logic
    const issues = [];

    if (data.soilMoisture < 30) {
      issues.push({
        type: 'critical' as const,
        title: 'Urgent: Soil Critically Dry',
        message: 'Soil moisture is dangerously low. Plants are at risk of severe stress or death.',
        action: 'Water immediately and check irrigation system',
        confidence: 0.95
      });
    }

    if (data.waterLevel < 20) {
      issues.push({
        type: 'critical' as const,
        title: 'Water Tank Nearly Empty',
        message: 'Irrigation reservoir is critically low. Watering system may fail.',
        action: 'Refill water tank immediately',
        confidence: 0.9
      });
    }

    if (data.temperature > 35) {
      issues.push({
        type: 'warning' as const,
        title: 'High Temperature Alert',
        message: 'Excessive heat can stress plants and increase water needs.',
        action: 'Provide shade or increase ventilation',
        confidence: 0.8
      });
    }

    if (data.light < 200) {
      issues.push({
        type: 'warning' as const,
        title: 'Insufficient Light',
        message: 'Low light levels may slow plant growth and photosynthesis.',
        action: 'Add supplemental lighting or relocate plants',
        confidence: 0.75
      });
    }

    if (issues.length === 0) {
      issues.push({
        type: 'good' as const,
        title: 'Optimal Growing Conditions',
        message: 'All environmental parameters are within healthy ranges for plant growth.',
        action: 'Continue current care routine and monitor regularly',
        confidence: 0.85
      });
    }

    return issues.slice(0, 3); // Return top 3 most important issues
  }

  async getSuitablePlants(data: SensorData): Promise<string[]> {
    const { temperature, humidity, light, soilMoisture } = data;
    
    // AI-driven plant recommendations
    const plants = [];

    // Temperature-based recommendations
    if (temperature >= 20 && temperature <= 30) {
      if (light > 500 && soilMoisture > 50) {
        plants.push('Tomatoes', 'Peppers', 'Basil', 'Cucumbers');
      }
      if (humidity > 60) {
        plants.push('Tropical herbs', 'Lettuce', 'Spinach');
      }
    }

    if (temperature >= 15 && temperature < 25) {
      plants.push('Broccoli', 'Cabbage', 'Peas', 'Carrots');
    }

    // Light-based recommendations
    if (light > 800) {
      plants.push('Sunflowers', 'Marigolds', 'Zinnias');
    } else if (light > 400) {
      plants.push('Herbs', 'Leafy greens', 'Strawberries');
    } else if (light > 200) {
      plants.push('Lettuce', 'Arugula', 'Microgreens');
    }

    // Soil moisture adaptations
    if (soilMoisture > 70) {
      plants.push('Rice', 'Watercress', 'Mint');
    } else if (soilMoisture < 40) {
      plants.push('Succulents', 'Lavender', 'Rosemary');
    }

    // Remove duplicates and return unique suggestions
    return [...new Set(plants)].slice(0, 8);
  }
}

export const sensorAI = new SensorAIService();