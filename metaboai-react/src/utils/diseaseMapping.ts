import { DiseaseInfo } from '../types';

// Disease classification mapping with sustainable-first recommendations
export const DISEASE_MAPPING: Record<string, DiseaseInfo> = {
  'Healthy': {
    name: 'Healthy Plant',
    severity: 'low',
    environmentalConditions: {
      temperature: { optimal: 24, current: 24 },
      humidity: { optimal: 65, current: 65 },
      soilMoisture: { optimal: 70, current: 70 },
      lightIntensity: { optimal: 800, current: 800 }
    },
    recommendations: [
      'Continue current care routine',
      'Monitor for early signs of stress',
      'Maintain consistent watering schedule'
    ],
    sustainableActions: [
      'Use compost for natural fertilization',
      'Implement companion planting',
      'Collect rainwater for irrigation'
    ],
    reason: 'Plant shows optimal health indicators with balanced environmental conditions'
  },
  
  'Early Blight': {
    name: 'Early Blight',
    severity: 'high',
    environmentalConditions: {
      temperature: { optimal: 22, current: 28 },
      humidity: { optimal: 50, current: 85 },
      soilMoisture: { optimal: 60, current: 80 },
      lightIntensity: { optimal: 800, current: 600 }
    },
    recommendations: [
      'Improve air circulation around plants',
      'Reduce watering frequency',
      'Remove affected leaves immediately',
      'Apply copper-based fungicide if severe'
    ],
    sustainableActions: [
      'Use neem oil as natural fungicide',
      'Install drip irrigation to avoid leaf wetness',
      'Apply baking soda solution (1 tsp per quart water)',
      'Increase plant spacing for better airflow'
    ],
    reason: 'High humidity and poor air circulation create ideal conditions for fungal growth'
  },

  'Late Blight': {
    name: 'Late Blight',
    severity: 'high',
    environmentalConditions: {
      temperature: { optimal: 20, current: 26 },
      humidity: { optimal: 45, current: 90 },
      soilMoisture: { optimal: 55, current: 85 },
      lightIntensity: { optimal: 800, current: 500 }
    },
    recommendations: [
      'Remove infected plants immediately',
      'Apply systemic fungicide',
      'Improve drainage around plants',
      'Avoid overhead watering'
    ],
    sustainableActions: [
      'Use copper-based organic fungicides',
      'Install drip irrigation system',
      'Mulch to prevent soil splash',
      'Ensure proper plant spacing'
    ],
    reason: 'Cool, wet conditions favor rapid spread of this aggressive fungal disease'
  },

  'Blight': {
    name: 'Blight Disease',
    severity: 'high',
    environmentalConditions: {
      temperature: { optimal: 22, current: 28 },
      humidity: { optimal: 50, current: 85 },
      soilMoisture: { optimal: 60, current: 80 },
      lightIntensity: { optimal: 800, current: 600 }
    },
    recommendations: [
      'Improve air circulation around plants',
      'Reduce watering frequency',
      'Remove affected leaves immediately',
      'Apply copper-based fungicide if severe'
    ],
    sustainableActions: [
      'Use neem oil as natural fungicide',
      'Install drip irrigation to avoid leaf wetness',
      'Apply baking soda solution (1 tsp per quart water)',
      'Increase plant spacing for better airflow'
    ],
    reason: 'High humidity and poor air circulation create ideal conditions for fungal growth'
  },
  
  'Leaf Curl': {
    name: 'Tomato Leaf Curl Virus',
    severity: 'medium',
    environmentalConditions: {
      temperature: { optimal: 24, current: 32 },
      humidity: { optimal: 65, current: 45 },
      soilMoisture: { optimal: 70, current: 50 },
      lightIntensity: { optimal: 800, current: 900 }
    },
    recommendations: [
      'Control whitefly populations (virus vector)',
      'Provide shade during peak heat',
      'Increase watering frequency',
      'Remove severely affected plants'
    ],
    sustainableActions: [
      'Use yellow sticky traps for whiteflies',
      'Plant marigolds as natural pest deterrent',
      'Install shade cloth during hot periods',
      'Mulch heavily to retain soil moisture'
    ],
    reason: 'Heat stress and whitefly transmission increase virus susceptibility'
  },
  
  'Mosaic Virus': {
    name: 'Tomato Mosaic Virus',
    severity: 'medium',
    environmentalConditions: {
      temperature: { optimal: 24, current: 26 },
      humidity: { optimal: 65, current: 70 },
      soilMoisture: { optimal: 70, current: 75 },
      lightIntensity: { optimal: 800, current: 750 }
    },
    recommendations: [
      'Remove infected plants immediately',
      'Disinfect tools between plants',
      'Avoid handling plants when wet',
      'Plant resistant varieties next season'
    ],
    sustainableActions: [
      'Use 10% bleach solution for tool disinfection',
      'Implement crop rotation with non-solanaceous plants',
      'Save seeds only from healthy plants',
      'Encourage beneficial insects for natural pest control'
    ],
    reason: 'Viral infection spreads through mechanical transmission and infected seeds'
  }
};

// Helper function to get disease info by prediction
export const getDiseaseInfo = (className: string): DiseaseInfo => {
  return DISEASE_MAPPING[className] || DISEASE_MAPPING['Healthy'];
};

// Smart function to determine disease status from all predictions
export const getDiseaseInfoFromPredictions = (predictions: Array<{ className: string; probability: number }>): DiseaseInfo => {
  console.log('🔍 getDiseaseInfoFromPredictions called with:', predictions);
  
  if (!predictions || predictions.length === 0) {
    console.log('❌ No predictions provided, returning Healthy');
    return DISEASE_MAPPING['Healthy'];
  }

  // Check for any disease predictions above 15% probability (excluding "Healthy")
  const significantDiseases = predictions.filter(pred => 
    pred.className.toLowerCase() !== 'healthy' && pred.probability > 0.15
  );
  
  console.log('🔍 Significant diseases found:', significantDiseases);
  
  // If we have significant disease detections, use the highest probability disease
  if (significantDiseases.length > 0) {
    const topDisease = significantDiseases[0]; // Already sorted by probability
    console.log(`🦠 Disease detected: ${topDisease.className} (${(topDisease.probability * 100).toFixed(1)}%)`);
    
    const diseaseInfo = DISEASE_MAPPING[topDisease.className];
    if (diseaseInfo) {
      console.log(`✅ Found disease mapping for: ${topDisease.className}`, diseaseInfo);
      return diseaseInfo;
    } else {
      console.log(`❌ No disease mapping found for: ${topDisease.className}, available keys:`, Object.keys(DISEASE_MAPPING));
      return DISEASE_MAPPING['Healthy'];
    }
  }
  
  // Only use "Healthy" if no significant diseases detected
  console.log(`✅ No significant diseases detected - plant is healthy`);
  return DISEASE_MAPPING['Healthy'];
};

// Calculate water and pesticide savings
export const calculateSavings = (sustainableActionsUsed: number, _totalDiagnoses: number) => {
  const waterSavedPerAction = 2.5; // liters per sustainable action
  const pesticidesAvoidedPerAction = 15; // ml per sustainable action
  
  return {
    waterSaved: sustainableActionsUsed * waterSavedPerAction,
    pesticidesAvoided: sustainableActionsUsed * pesticidesAvoidedPerAction
  };
};