// Core types for SnapFarm
export interface Prediction {
  className: string;
  probability: number;
}

export interface AdditionalDiagnosisData {
  soilPH: number;
  soilMoisture: number;
  temperature: number;
  humidity: number;
  lightIntensity: number;
  plantAge: number; // days
  location: string;
  notes: string;
}

export interface DiagnosisResult {
  id: string;
  userId?: string;
  timestamp: number;
  imageUrl: string;
  predictions: Prediction[];
  topPrediction: Prediction;
  environmentalConditions?: EnvironmentalConditions;
  recommendations?: string[];
  additionalData?: AdditionalDiagnosisData;
}

export interface EnvironmentalConditions {
  temperature: { optimal: number; current: number };
  humidity: { optimal: number; current: number };
  soilMoisture: { optimal: number; current: number };
  lightIntensity: { optimal: number; current: number };
}

export interface DiseaseInfo {
  name: string;
  severity: 'low' | 'medium' | 'high';
  environmentalConditions: EnvironmentalConditions;
  recommendations: string[];
  sustainableActions: string[];
  reason: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  timestamp: number;
  type: 'user' | 'assistant';
  content: string;
  dashboardData?: DashboardMetrics; // For context-aware responses
}

export interface DashboardMetrics {
  totalDiagnoses: number;
  healthyPlants: number;
  diseasedPlants: number;
  waterSaved: number; // liters
  pesticidesAvoided: number; // ml
  diseaseFrequency: Record<string, number>;
  averageSoilPH: number;
  averageTemperature: number;
  averageHumidity: number;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  units: 'metric' | 'imperial';
  language: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}