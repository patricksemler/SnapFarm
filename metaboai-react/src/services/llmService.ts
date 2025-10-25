// Fast Agricultural AI Service using Q&A model + Knowledge Base
// Optimized for plant diseases and farming practices

import { pipeline } from '@xenova/transformers';
import { Prediction } from '../types';

interface LLMMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface LLMResponse {
  message: string;
  confidence: number;
  processingTime: number;
}

class LLMService {
  private qaModel: any = null;
  private isLoading = false;
  private conversationHistory: LLMMessage[] = [];
  private maxHistoryLength = 10;
  
  // Curated agricultural knowledge base for Q&A
  private agriculturalKnowledge = `
PLANT DISEASES AND TREATMENTS:

Early Blight (Common in Tomatoes, Potatoes):
- Symptoms: Dark spots with concentric rings on leaves, yellowing around spots
- Causes: Alternaria solani fungus, warm humid conditions, poor air circulation
- Treatment: Remove affected leaves, apply copper fungicide, improve spacing
- Prevention: Crop rotation, avoid overhead watering, mulch soil
- Organic options: Baking soda spray, neem oil, compost tea

Late Blight (Common in Tomatoes, Potatoes):
- Symptoms: Water-soaked spots, white fuzzy growth on leaf undersides
- Causes: Phytophthora infestans, cool wet weather
- Treatment: Remove infected plants immediately, apply systemic fungicide
- Prevention: Use resistant varieties, avoid wetting leaves, good drainage
- Emergency: Destroy all infected material, do not compost

Septoria Leaf Spot (Common in Tomatoes):
- Symptoms: Small circular spots with gray centers, yellow halos
- Causes: Septoria lycopersici fungus, splashing water
- Treatment: Prune lower branches, apply fungicide, mulch around plants
- Prevention: Avoid wetting leaves, provide support, clean garden debris

Powdery Mildew:
- Symptoms: White powdery coating on leaves and stems
- Causes: Various fungi, poor air circulation, high humidity
- Treatment: Spray with milk solution (1:10 ratio), sulfur fungicide
- Prevention: Proper spacing, morning watering, resistant varieties

Bacterial Wilt:
- Symptoms: Sudden wilting, brown vascular tissue
- Causes: Ralstonia solanacearum bacteria, soil-borne
- Treatment: No cure, remove and destroy plants
- Prevention: Crop rotation, soil solarization, resistant varieties

SUSTAINABLE FARMING PRACTICES:

Companion Planting:
- Tomatoes with basil (pest deterrent), marigolds (nematode control)
- Peppers with herbs (natural pest control)
- Cucumbers with radishes (pest confusion)
- Corn, beans, squash (Three Sisters method)
- Carrots with onions (pest confusion)
- Lettuce with tall plants (shade protection)

Soil Health:
- Add compost regularly (2-4 inches annually)
- Test soil pH (6.0-7.0 ideal for most crops)
- Use cover crops (nitrogen fixation, erosion control)
- Minimize tillage (preserve soil structure)

Natural Pest Control:
- Beneficial insects: ladybugs, lacewings, parasitic wasps
- Physical barriers: row covers, copper tape for slugs
- Trap crops: nasturtiums for aphids, radishes for flea beetles
- Organic sprays: neem oil, insecticidal soap, diatomaceous earth

Water Management:
- Deep, infrequent watering (encourages deep roots)
- Drip irrigation (reduces disease, conserves water)
- Mulching (retains moisture, suppresses weeds)
- Rainwater harvesting (sustainable water source)

Crop Rotation:
- 4-year rotation minimum for disease prevention
- Rotate plant families (nightshades, brassicas, legumes)
- Follow heavy feeders with light feeders
- Include nitrogen-fixing crops (beans, peas)

SEASONAL FARMING CALENDAR:

Spring (March-May):
- Start seeds indoors 6-8 weeks before last frost
- Prepare soil with compost and amendments
- Plant cool-season crops (lettuce, peas, spinach)
- Set up irrigation systems

Summer (June-August):
- Plant warm-season crops after soil warms
- Monitor for pests and diseases daily
- Harvest regularly to encourage production
- Maintain consistent watering schedule

Fall (September-November):
- Plant cover crops for winter protection
- Harvest and preserve crops for storage
- Clean up garden debris to prevent disease
- Plan next year's garden layout

Winter (December-February):
- Order seeds and plan garden layout
- Maintain and repair tools and equipment
- Study and learn about new techniques
- Prepare seed starting equipment

ORGANIC FERTILIZERS:

Nitrogen Sources:
- Blood meal (quick release, 12-0-0)
- Fish emulsion (balanced, 5-1-1)
- Compost (slow release, varies)
- Coffee grounds (acidic, 2-0.3-0.3)

Phosphorus Sources:
- Bone meal (slow release, 3-15-0)
- Rock phosphate (very slow, 0-3-0)
- Bat guano (fast acting, 10-3-1)

Potassium Sources:
- Wood ash (fast acting, 0-0-6)
- Kelp meal (slow release, 1-0-2)
- Granite dust (very slow, 0-0-4)

COMMON PLANT PROBLEMS:

Yellowing Leaves:
- Overwatering: soggy soil, root rot
- Underwatering: dry soil, wilting
- Nutrient deficiency: nitrogen (lower leaves first)
- Disease: check for spots or patterns

Stunted Growth:
- Poor soil: compacted, low nutrients
- Root problems: pests, disease, pot-bound
- Environmental stress: temperature, light
- pH imbalance: nutrients unavailable

Wilting Plants:
- Water stress: too much or too little
- Root damage: pests, disease, transplant shock
- Heat stress: provide shade, increase humidity
- Vascular disease: check stem for discoloration

Poor Fruit Set:
- Pollination issues: lack of pollinators, weather
- Nutrient imbalance: too much nitrogen
- Environmental stress: temperature extremes
- Variety issues: self-pollinating vs cross-pollinating
`;

  /**
   * Initialize the Q&A model
   */
  async initializeModel(): Promise<void> {
    if (this.qaModel || this.isLoading) return;
    
    this.isLoading = true;
    try {
      console.log('Loading agricultural Q&A model...');
      
      // Use a fast, lightweight Q&A model optimized for browser use
      this.qaModel = await pipeline(
        'question-answering',
        'Xenova/distilbert-base-cased-distilled-squad',
        {
          quantized: true,
          progress_callback: (progress: any) => {
            if (progress.status === 'downloading') {
              console.log(`Downloading model: ${Math.round(progress.progress || 0)}%`);
            }
          }
        }
      );
      
      console.log('Agricultural Q&A model loaded successfully');
    } catch (error) {
      console.error('Failed to load Q&A model:', error);
      throw new Error('Unable to load agricultural Q&A model');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Check if model is ready
   */
  isModelReady(): boolean {
    return this.qaModel !== null && !this.isLoading;
  }

  /**
   * Get model loading status
   */
  getLoadingStatus(): { isLoading: boolean; isReady: boolean } {
    return {
      isLoading: this.isLoading,
      isReady: this.isModelReady()
    };
  }

  /**
   * Generate response using Q&A model + knowledge base
   */
  async generateResponse(
    message: string,
    context?: {
      predictions?: Prediction[];
      plantType?: string;
      location?: string;
      season?: string;
    }
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    
    if (!this.isModelReady()) {
      await this.initializeModel();
    }

    if (!this.qaModel) {
      throw new Error('Q&A model not available');
    }

    try {
      // Add user message to history
      const userMessage: LLMMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: Date.now()
      };
      this.conversationHistory.push(userMessage);

      // Enhance question with context
      const enhancedQuestion = this.enhanceQuestionWithContext(message, context);
      
      // Use Q&A model to find answer in knowledge base
      const result = await this.qaModel({
        question: enhancedQuestion,
        context: this.agriculturalKnowledge
      });

      // Generate comprehensive response
      let responseText = this.generateComprehensiveResponse(message, result, context);
      
      // Add assistant message to history
      const assistantMessage: LLMMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now()
      };
      this.conversationHistory.push(assistantMessage);

      // Trim history if too long
      if (this.conversationHistory.length > this.maxHistoryLength) {
        this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
      }

      const processingTime = Date.now() - startTime;

      return {
        message: responseText,
        confidence: result.score || 0.8,
        processingTime
      };

    } catch (error) {
      console.error('Q&A model error:', error);
      
      // Fallback to rule-based response
      return {
        message: this.getFallbackResponse(message, context),
        confidence: 0.6,
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Enhance question with context information
   */
  private enhanceQuestionWithContext(
    question: string,
    context?: {
      predictions?: Prediction[];
      plantType?: string;
      location?: string;
      season?: string;
    }
  ): string {
    let enhancedQuestion = question;

    if (context?.predictions && context.predictions.length > 0) {
      const disease = context.predictions[0].className;
      enhancedQuestion = `For ${disease} disease: ${question}`;
    }

    if (context?.plantType) {
      enhancedQuestion = `For ${context.plantType} plants: ${enhancedQuestion}`;
    }

    return enhancedQuestion;
  }

  /**
   * Generate comprehensive response from Q&A result
   */
  private generateComprehensiveResponse(
    originalQuestion: string,
    qaResult: any,
    context?: {
      predictions?: Prediction[];
      plantType?: string;
      location?: string;
      season?: string;
    }
  ): string {
    const lowerQuestion = originalQuestion.toLowerCase();
    let response = '';

    // Start with direct answer from Q&A model
    if (qaResult.answer && qaResult.score > 0.3) {
      response = qaResult.answer;
    }

    // Add context-specific information
    if (context?.predictions && context.predictions.length > 0) {
      const disease = context.predictions[0].className;
      const confidence = (context.predictions[0].probability * 100).toFixed(1);
      
      response = `Based on your ${disease} diagnosis (${confidence}% confidence):\n\n${response}`;
      
      // Add specific disease information
      if (disease.toLowerCase().includes('blight')) {
        response += `\n\n🚨 **Immediate Actions for ${disease}:**\n• Remove affected plant parts immediately\n• Improve air circulation around plants\n• Avoid overhead watering\n• Apply appropriate fungicide treatment`;
      }
    }

    // Add seasonal advice
    if (context?.season) {
      const seasonalTip = this.getSeasonalTip(context.season, lowerQuestion);
      if (seasonalTip) {
        response += `\n\n🌱 **${context.season.charAt(0).toUpperCase() + context.season.slice(1)} Tip:** ${seasonalTip}`;
      }
    }

    // Add plant-specific advice
    if (context?.plantType) {
      const plantTip = this.getPlantSpecificTip(context.plantType, lowerQuestion);
      if (plantTip) {
        response += `\n\n🍅 **For ${context.plantType}:** ${plantTip}`;
      }
    }

    // Ensure response quality
    if (!response || response.length < 20) {
      response = this.getFallbackResponse(originalQuestion, context);
    }

    return response;
  }

  /**
   * Get seasonal farming tip
   */
  private getSeasonalTip(season: string, question: string): string {
    const seasonalTips: Record<string, Record<string, string>> = {
      spring: {
        planting: 'Start seeds indoors 6-8 weeks before last frost date',
        soil: 'Add compost and test soil pH before planting',
        disease: 'Cool, wet spring weather increases fungal disease risk'
      },
      summer: {
        watering: 'Water deeply in early morning to reduce disease risk',
        pest: 'Monitor daily for pests - early detection is key',
        disease: 'Hot, humid conditions favor bacterial and fungal diseases'
      },
      fall: {
        harvest: 'Harvest regularly to extend production season',
        cleanup: 'Remove diseased plant material to prevent overwintering',
        planning: 'Plant cover crops to protect and improve soil'
      },
      winter: {
        planning: 'Plan next year\'s crop rotation to prevent disease buildup',
        tools: 'Clean and maintain tools to prevent disease spread',
        learning: 'Study integrated pest management strategies'
      }
    };

    const tips = seasonalTips[season];
    if (!tips) return '';

    if (question.includes('plant') || question.includes('grow')) return tips.planting || '';
    if (question.includes('water') || question.includes('irrigat')) return tips.watering || '';
    if (question.includes('pest') || question.includes('bug')) return tips.pest || '';
    if (question.includes('disease') || question.includes('sick')) return tips.disease || '';
    if (question.includes('harvest')) return tips.harvest || '';
    if (question.includes('soil')) return tips.soil || '';
    
    return Object.values(tips)[0] || '';
  }

  /**
   * Get plant-specific tip
   */
  private getPlantSpecificTip(plantType: string, question: string): string {
    const plantTips: Record<string, Record<string, string>> = {
      tomato: {
        disease: 'Provide good air circulation and avoid wetting leaves',
        watering: 'Water at soil level, maintain consistent moisture',
        support: 'Use cages or stakes to keep fruit off ground'
      },
      potato: {
        disease: 'Hill soil around plants to prevent tuber exposure',
        watering: 'Reduce watering as harvest approaches',
        storage: 'Cure in dark, cool place before storage'
      }
    };

    const plant = plantType.toLowerCase();
    const tips = plantTips[plant];
    if (!tips) return '';

    if (question.includes('disease') || question.includes('sick')) return tips.disease || '';
    if (question.includes('water') || question.includes('irrigat')) return tips.watering || '';
    
    return Object.values(tips)[0] || '';
  }

  /**
   * Get fallback response for agricultural questions
   */
private getFallbackResponse(
    message: string,
    context?: {
      predictions?: Prediction[];
      plantType?: string;
      location?: string;
      season?: string;
    }
  ): string {
    const lowerMessage = message.toLowerCase();
    
    // Handle follow-up questions about treatments more specifically
    if (context?.predictions && context.predictions.length > 0) {
      const disease = context.predictions[0].className.toLowerCase();
      
      // Check if user is asking for specific treatment details
      if (lowerMessage.includes('yes') || lowerMessage.includes('please') || lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('treatment')) {
        if (disease.includes('early blight')) {
          return `**Specific Early Blight Treatments:**\n\n**Organic Options:**\n• Baking soda spray (1 tsp per quart water)\n• Neem oil application every 7-14 days\n• Copper-based fungicides (Bordeaux mixture)\n• Compost tea foliar spray\n\n**Chemical Options:**\n• Chlorothalonil fungicide\n• Mancozeb fungicide\n• Azoxystrobin-based products\n\n**Application Tips:**\n• Apply in early morning or evening\n• Ensure good leaf coverage\n• Repeat every 7-10 days during humid conditions\n• Always follow label instructions\n\nWould you like advice on preventing future outbreaks?`;
        } else if (disease.includes('late blight')) {
          return `**Urgent Late Blight Treatment:**\n\n**Immediate Actions:**\n• Remove ALL infected plants immediately\n• Do NOT compost infected material - burn or trash\n• Apply systemic fungicide to remaining plants\n• Improve drainage around plants\n\n**Fungicide Options:**\n• Metalaxyl-based products\n• Dimethomorph fungicides\n• Copper compounds (preventive only)\n\n**Prevention:**\n• Use resistant varieties next season\n• Avoid overhead watering\n• Ensure good air circulation\n• Monitor weather - cool, wet conditions favor spread\n\nThis is a serious disease that can destroy entire crops quickly!`;
        } else {
          return `**Treatment for ${context.predictions[0].className}:**\n\n**General Approach:**\n• Remove affected plant parts\n• Improve growing conditions\n• Apply appropriate fungicide\n• Monitor for spread\n\n**Organic Treatments:**\n• Neem oil spray\n• Baking soda solution\n• Compost tea\n• Proper sanitation\n\n**Prevention:**\n• Good air circulation\n• Avoid wetting leaves\n• Crop rotation\n• Resistant varieties\n\nWhat specific aspect would you like more details about?`;
        }
      }
      
      // Initial diagnosis response
      const diseaseName = context.predictions[0].className;
return `I can see you've been diagnosed with ${diseaseName}. This is a ${diseaseName.toLowerCase().includes('blight') ? 'fungal disease that needs prompt attention' : 'common plant health issue'}.\n\n**Quick Overview:**\n• Remove affected plant parts immediately\n• Improve air circulation around plants\n• Apply appropriate treatment\n• Monitor other plants for symptoms\n• Adjust watering practices\n\nWould you like specific treatment recommendations?`;
    }
    
    if (lowerMessage.includes('disease') || lowerMessage.includes('sick') || lowerMessage.includes('spot') || lowerMessage.includes('blight')) {
      return `For plant disease management:\n\n• **Prevention:** Good air circulation, proper spacing, avoid overhead watering\n• **Early Detection:** Check plants daily for symptoms\n• **Treatment:** Remove affected parts, apply fungicides as needed\n• **Sanitation:** Clean tools, remove debris, practice crop rotation\n\nWhat specific symptoms are you seeing?`;
    }
    
    if (lowerMessage.includes('water') || lowerMessage.includes('irrigat')) {
      return `**Proper Watering Guidelines:**\n\n• **Timing:** Early morning (6-8 AM) is best\n• **Method:** Water at soil level, avoid wetting leaves\n• **Frequency:** Deep, less frequent watering\n• **Amount:** 1-2 inches per week including rainfall\n• **Check:** Soil moisture 2 inches deep\n\nWhat type of plants are you watering?`;
    }
    
    if (lowerMessage.includes('pest') || lowerMessage.includes('bug') || lowerMessage.includes('insect')) {
      return `**Integrated Pest Management:**\n\n• **Prevention:** Encourage beneficial insects, companion planting\n• **Monitoring:** Check plants daily, identify pests correctly\n• **Physical:** Hand-picking, barriers, traps\n• **Biological:** Beneficial insects, Bt spray\n• **Organic:** Neem oil, insecticidal soap, diatomaceous earth\n\nWhat pests are you dealing with?`;
    }
    
    if (lowerMessage.includes('soil') || lowerMessage.includes('fertiliz') || lowerMessage.includes('compost')) {
      return `**Soil Health Essentials:**\n\n• **Test pH:** 6.0-7.0 ideal for most crops\n• **Organic Matter:** Add 2-4 inches compost annually\n• **Drainage:** Ensure good water infiltration\n• **Nutrients:** Use balanced organic fertilizers\n• **Biology:** Encourage beneficial soil microorganisms\n\nWhat's your current soil situation?`;
    }
    
    return `I'm here to help with agricultural questions! I specialize in:\n\n🌱 **Plant Disease Diagnosis & Treatment**\n🚜 **Sustainable Farming Practices**\n💧 **Irrigation & Water Management**\n🐛 **Integrated Pest Management**\n🌿 **Soil Health & Fertilization**\n📅 **Seasonal Planning & Crop Rotation**\n\nWhat specific farming challenge can I help you with?`;
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): LLMMessage[] {
    return this.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get model information
   */
  getModelInfo(): { name: string; status: string; memoryUsage?: string } {
    return {
      name: this.qaModel ? 'DistilBERT Q&A (Agricultural)' : 'Not loaded',
      status: this.isLoading ? 'Loading...' : this.isModelReady() ? 'Ready' : 'Not initialized',
      memoryUsage: this.qaModel ? 'Optimized (~30MB)' : undefined
    };
  }
}

export const llmService = new LLMService();
export type { LLMMessage, LLMResponse };