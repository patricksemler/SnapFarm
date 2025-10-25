// Environment Mapping for Disease Classes
// Maps each disease to optimal conditions, recommendations, and business metrics

export interface EnvironmentalRange {
  min: number;
  max: number;
  optimal: number;
  unit: string;
}

export interface BusinessMetrics {
  water_saved_est: number; // Liters saved through sustainable practices
  pesticide_avoided_est: number; // mL of chemical pesticides avoided
  cost_savings_est: number; // USD saved through sustainable methods
  environmental_impact_score: number; // 1-10 scale (10 = most sustainable)
}

export interface DiseaseEnvironmentMap {
  disease_name: string;
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  
  // Environmental conditions
  temperature: EnvironmentalRange;
  humidity: EnvironmentalRange;
  soil_moisture: EnvironmentalRange;
  soil_ph: EnvironmentalRange;
  light_intensity: EnvironmentalRange;
  
  // Simulated current readings (for demo purposes)
  current_readings: {
    temperature: number;
    humidity: number;
    soil_moisture: number;
    soil_ph: number;
    light_intensity: number;
  };
  
  // Treatment recommendations
  immediate_actions: string[];
  sustainable_actions: string[];
  chemical_fallback: string[];
  prevention_tips: string[];
  
  // Business impact metrics
  business_metrics: BusinessMetrics;
  
  // Additional metadata
  recovery_time_days: number;
  spread_risk: 'low' | 'medium' | 'high';
  seasonal_prevalence: string[];
}

// Comprehensive disease environment mapping
export const DISEASE_ENVIRONMENT_MAP: Record<string, DiseaseEnvironmentMap> = {
  'Healthy': {
    disease_name: 'Healthy Plant',
    severity_level: 'low',
    
    temperature: { min: 18, max: 26, optimal: 22, unit: '°C' },
    humidity: { min: 60, max: 70, optimal: 65, unit: '%' },
    soil_moisture: { min: 65, max: 75, optimal: 70, unit: '%' },
    soil_ph: { min: 6.0, max: 6.8, optimal: 6.4, unit: 'pH' },
    light_intensity: { min: 600, max: 1000, optimal: 800, unit: 'lux' },
    
    current_readings: {
      temperature: 22,
      humidity: 65,
      soil_moisture: 70,
      soil_ph: 6.4,
      light_intensity: 800
    },
    
    immediate_actions: [
      'Continue current care routine',
      'Monitor daily for any changes',
      'Maintain consistent watering schedule'
    ],
    
    sustainable_actions: [
      'Apply organic compost monthly',
      'Use companion planting with basil',
      'Implement drip irrigation system',
      'Collect rainwater for irrigation'
    ],
    
    chemical_fallback: [],
    
    prevention_tips: [
      'Ensure proper plant spacing (18-24 inches)',
      'Rotate crops annually',
      'Remove weeds regularly',
      'Inspect plants weekly'
    ],
    
    business_metrics: {
      water_saved_est: 5.2,
      pesticide_avoided_est: 0,
      cost_savings_est: 12.50,
      environmental_impact_score: 10
    },
    
    recovery_time_days: 0,
    spread_risk: 'low',
    seasonal_prevalence: ['spring', 'summer', 'fall']
  },

  'Early Blight': {
    disease_name: 'Early Blight (Alternaria solani)',
    severity_level: 'medium',
    
    temperature: { min: 15, max: 22, optimal: 18, unit: '°C' },
    humidity: { min: 40, max: 60, optimal: 50, unit: '%' },
    soil_moisture: { min: 50, max: 65, optimal: 60, unit: '%' },
    soil_ph: { min: 6.0, max: 7.0, optimal: 6.5, unit: 'pH' },
    light_intensity: { min: 700, max: 1200, optimal: 900, unit: 'lux' },
    
    current_readings: {
      temperature: 28,
      humidity: 85,
      soil_moisture: 80,
      soil_ph: 6.2,
      light_intensity: 600
    },
    
    immediate_actions: [
      'Remove affected leaves immediately',
      'Improve air circulation around plants',
      'Reduce watering frequency',
      'Apply mulch to prevent soil splash'
    ],
    
    sustainable_actions: [
      'Spray neem oil solution (2 tbsp per gallon)',
      'Apply baking soda spray (1 tsp per quart water)',
      'Use copper-based organic fungicide',
      'Install drip irrigation to avoid leaf wetness',
      'Increase plant spacing for better airflow'
    ],
    
    chemical_fallback: [
      'Apply chlorothalonil fungicide if severe',
      'Use mancozeb as preventive treatment'
    ],
    
    prevention_tips: [
      'Water at soil level, not on leaves',
      'Ensure good drainage',
      'Remove plant debris regularly',
      'Use disease-resistant varieties'
    ],
    
    business_metrics: {
      water_saved_est: 8.7,
      pesticide_avoided_est: 45,
      cost_savings_est: 28.90,
      environmental_impact_score: 7
    },
    
    recovery_time_days: 14,
    spread_risk: 'medium',
    seasonal_prevalence: ['late summer', 'early fall']
  },

  'Late Blight': {
    disease_name: 'Late Blight (Phytophthora infestans)',
    severity_level: 'critical',
    
    temperature: { min: 12, max: 20, optimal: 16, unit: '°C' },
    humidity: { min: 30, max: 50, optimal: 40, unit: '%' },
    soil_moisture: { min: 45, max: 60, optimal: 55, unit: '%' },
    soil_ph: { min: 6.2, max: 7.2, optimal: 6.8, unit: 'pH' },
    light_intensity: { min: 800, max: 1400, optimal: 1000, unit: 'lux' },
    
    current_readings: {
      temperature: 18,
      humidity: 95,
      soil_moisture: 85,
      soil_ph: 6.1,
      light_intensity: 500
    },
    
    immediate_actions: [
      'Remove and destroy affected plants immediately',
      'Isolate healthy plants',
      'Improve ventilation drastically',
      'Stop overhead watering completely'
    ],
    
    sustainable_actions: [
      'Apply copper hydroxide spray',
      'Use Bacillus subtilis biological fungicide',
      'Install fans for air circulation',
      'Apply potassium bicarbonate solution',
      'Mulch heavily to reduce soil moisture'
    ],
    
    chemical_fallback: [
      'Apply metalaxyl-based fungicide immediately',
      'Use propamocarb for severe infections',
      'Consider systemic fungicides for prevention'
    ],
    
    prevention_tips: [
      'Plant in well-draining locations',
      'Use certified disease-free seeds',
      'Avoid working with wet plants',
      'Monitor weather conditions closely'
    ],
    
    business_metrics: {
      water_saved_est: 12.3,
      pesticide_avoided_est: 75,
      cost_savings_est: 45.60,
      environmental_impact_score: 6
    },
    
    recovery_time_days: 21,
    spread_risk: 'high',
    seasonal_prevalence: ['late summer', 'fall']
  },

  'Leaf Curl': {
    disease_name: 'Tomato Leaf Curl Virus',
    severity_level: 'high',
    
    temperature: { min: 20, max: 28, optimal: 24, unit: '°C' },
    humidity: { min: 50, max: 70, optimal: 60, unit: '%' },
    soil_moisture: { min: 60, max: 80, optimal: 70, unit: '%' },
    soil_ph: { min: 6.0, max: 7.0, optimal: 6.5, unit: 'pH' },
    light_intensity: { min: 600, max: 900, optimal: 750, unit: 'lux' },
    
    current_readings: {
      temperature: 32,
      humidity: 45,
      soil_moisture: 50,
      soil_ph: 6.8,
      light_intensity: 1100
    },
    
    immediate_actions: [
      'Control whitefly populations (virus vector)',
      'Provide shade during peak heat hours',
      'Increase watering frequency',
      'Remove severely affected plants'
    ],
    
    sustainable_actions: [
      'Install yellow sticky traps for whiteflies',
      'Plant marigolds as natural pest deterrent',
      'Use reflective mulch to confuse vectors',
      'Apply neem oil for whitefly control',
      'Install shade cloth (30-50%) during hot periods'
    ],
    
    chemical_fallback: [
      'Apply imidacloprid for whitefly control',
      'Use thiamethoxam as soil drench'
    ],
    
    prevention_tips: [
      'Use virus-resistant varieties',
      'Control weeds that harbor whiteflies',
      'Inspect new plants for whiteflies',
      'Maintain proper plant nutrition'
    ],
    
    business_metrics: {
      water_saved_est: 6.8,
      pesticide_avoided_est: 35,
      cost_savings_est: 22.40,
      environmental_impact_score: 8
    },
    
    recovery_time_days: 28,
    spread_risk: 'high',
    seasonal_prevalence: ['summer', 'early fall']
  },

  'Mosaic Virus': {
    disease_name: 'Tomato Mosaic Virus',
    severity_level: 'high',
    
    temperature: { min: 18, max: 25, optimal: 21, unit: '°C' },
    humidity: { min: 55, max: 75, optimal: 65, unit: '%' },
    soil_moisture: { min: 65, max: 80, optimal: 72, unit: '%' },
    soil_ph: { min: 6.2, max: 7.0, optimal: 6.6, unit: 'pH' },
    light_intensity: { min: 650, max: 950, optimal: 800, unit: 'lux' },
    
    current_readings: {
      temperature: 24,
      humidity: 70,
      soil_moisture: 75,
      soil_ph: 6.4,
      light_intensity: 780
    },
    
    immediate_actions: [
      'Remove infected plants immediately',
      'Disinfect tools with 10% bleach solution',
      'Avoid handling plants when wet',
      'Isolate remaining healthy plants'
    ],
    
    sustainable_actions: [
      'Use certified virus-free seeds',
      'Implement strict sanitation protocols',
      'Rotate with non-solanaceous crops',
      'Encourage beneficial insects for pest control',
      'Apply organic soil amendments to boost immunity'
    ],
    
    chemical_fallback: [
      'No direct chemical treatment available',
      'Focus on vector control if applicable'
    ],
    
    prevention_tips: [
      'Purchase certified disease-free transplants',
      'Avoid tobacco use around plants',
      'Wash hands before handling plants',
      'Control aphids and other potential vectors'
    ],
    
    business_metrics: {
      water_saved_est: 4.2,
      pesticide_avoided_est: 25,
      cost_savings_est: 18.75,
      environmental_impact_score: 9
    },
    
    recovery_time_days: 0, // No recovery - plant removal required
    spread_risk: 'high',
    seasonal_prevalence: ['spring', 'summer']
  }
};

/**
 * Get environment map for specific disease
 * @param diseaseName - Name of the disease
 * @returns DiseaseEnvironmentMap or default healthy map
 */
export const getEnvironmentMap = (diseaseName: string): DiseaseEnvironmentMap => {
  return DISEASE_ENVIRONMENT_MAP[diseaseName] || DISEASE_ENVIRONMENT_MAP['Healthy'];
};

/**
 * Calculate business metrics based on treatment choices
 * @param diseaseName - Name of the disease
 * @param useSustainableActions - Whether sustainable actions were chosen
 * @param plantCount - Number of plants treated
 * @returns Calculated business metrics
 */
export const calculateBusinessMetrics = (
  diseaseName: string, 
  useSustainableActions: boolean = true,
  plantCount: number = 1
): BusinessMetrics => {
  const baseMetrics = getEnvironmentMap(diseaseName).business_metrics;
  
  if (!useSustainableActions) {
    // Reduce benefits if chemical treatments are used
    return {
      water_saved_est: baseMetrics.water_saved_est * 0.3 * plantCount,
      pesticide_avoided_est: 0, // No pesticides avoided if chemicals used
      cost_savings_est: baseMetrics.cost_savings_est * 0.5 * plantCount,
      environmental_impact_score: Math.max(1, baseMetrics.environmental_impact_score - 4)
    };
  }
  
  return {
    water_saved_est: baseMetrics.water_saved_est * plantCount,
    pesticide_avoided_est: baseMetrics.pesticide_avoided_est * plantCount,
    cost_savings_est: baseMetrics.cost_savings_est * plantCount,
    environmental_impact_score: baseMetrics.environmental_impact_score
  };
};

/**
 * Get severity color for UI display
 * @param severity - Severity level
 * @returns CSS color class
 */
export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'low': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'high': return 'text-orange-600 bg-orange-100';
    case 'critical': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

/**
 * Check if current readings are within optimal range
 * @param current - Current reading value
 * @param range - Environmental range object
 * @returns boolean indicating if within optimal range
 */
export const isWithinOptimalRange = (current: number, range: EnvironmentalRange): boolean => {
  const tolerance = (range.max - range.min) * 0.1; // 10% tolerance
  return current >= (range.optimal - tolerance) && current <= (range.optimal + tolerance);
};