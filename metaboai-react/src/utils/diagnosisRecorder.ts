// Diagnosis Recording and Dashboard Data Management
// Handles storing diagnosis records and updating dashboard metrics

import { DashboardMetrics } from '../types';
import { BusinessMetrics } from './environmentMap';

interface DiagnosisRecord {
  id: string;
  userId: string;
  timestamp: number;
  imageUrl: string;
  topPrediction: {
    className: string;
    probability: number;
  };
  allPredictions: Array<{
    className: string;
    probability: number;
  }>;
  businessMetrics: BusinessMetrics;
  environmentalData: {
    optimal_conditions: any;
    current_readings: any;
    recommendations: string[];
  };
  additionalData?: {
    soilPH: number;
    soilMoisture: number;
    temperature: number;
    humidity: number;
    lightIntensity: number;
    plantAge: number;
    location: string;
    notes: string;
  };
}

const STORAGE_KEY = 'snapfarm_diagnosis_records';

/**
 * Record a new diagnosis to localStorage and update dashboard data
 * @param diagnosisRecord - Complete diagnosis record with business metrics
 * @returns Promise<void>
 */
export const recordDiagnosisToLocalStorage = async (diagnosisRecord: DiagnosisRecord): Promise<void> => {
  try {
    // Get existing records
    const existingRecords = getDiagnosisRecords();
    
    // Add new record
    const updatedRecords = [diagnosisRecord, ...existingRecords];
    
    // Keep only last 100 records to prevent storage bloat
    const trimmedRecords = updatedRecords.slice(0, 100);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedRecords));
    
    // Update dashboard data series
    await updateDashboardDataSeries(trimmedRecords);
    
    console.log('Diagnosis recorded successfully:', diagnosisRecord.id);
  } catch (error) {
    console.error('Failed to record diagnosis:', error);
    throw new Error('Failed to save diagnosis record');
  }
};

/**
 * Get all diagnosis records from localStorage
 * @returns Array<DiagnosisRecord>
 */
export const getDiagnosisRecords = (): DiagnosisRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load diagnosis records:', error);
    return [];
  }
};

/**
 * Update dashboard data series based on stored diagnosis records
 * @param records - Array of diagnosis records
 * @returns Promise<void>
 */
const updateDashboardDataSeries = async (records: DiagnosisRecord[]): Promise<void> => {
  try {
    // Calculate aggregated metrics
    const dashboardMetrics = calculateDashboardMetrics(records);
    
    // Store dashboard data for react-chartjs-2 consumption
    localStorage.setItem('snapfarm_dashboard_data', JSON.stringify({
      metrics: dashboardMetrics,
      chartData: generateChartData(records),
      lastUpdated: Date.now()
    }));
    
    console.log('Dashboard data updated:', dashboardMetrics);
  } catch (error) {
    console.error('Failed to update dashboard data:', error);
  }
};

/**
 * Calculate comprehensive dashboard metrics from diagnosis records
 * @param records - Array of diagnosis records
 * @returns DashboardMetrics
 */
const calculateDashboardMetrics = (records: DiagnosisRecord[]): DashboardMetrics => {
  if (records.length === 0) {
    return {
      totalDiagnoses: 0,
      healthyPlants: 0,
      diseasedPlants: 0,
      waterSaved: 0,
      pesticidesAvoided: 0,
      diseaseFrequency: {},
      averageSoilPH: 7.0,
      averageTemperature: 24,
      averageHumidity: 65
    };
  }

  // Basic counts
  const totalDiagnoses = records.length;
  const healthyPlants = records.filter(r => r.topPrediction.className === 'Healthy').length;
  const diseasedPlants = totalDiagnoses - healthyPlants;

  // Business metrics aggregation
  const totalWaterSaved = records.reduce((sum, r) => sum + r.businessMetrics.water_saved_est, 0);
  const totalPesticidesAvoided = records.reduce((sum, r) => sum + r.businessMetrics.pesticide_avoided_est, 0);

  // Disease frequency mapping
  const diseaseFrequency: Record<string, number> = {};
  records.forEach(record => {
    const disease = record.topPrediction.className;
    diseaseFrequency[disease] = (diseaseFrequency[disease] || 0) + 1;
  });

  // Environmental averages (from additional data if available)
  const recordsWithEnvData = records.filter(r => r.additionalData);
  const averageSoilPH = recordsWithEnvData.length > 0 
    ? recordsWithEnvData.reduce((sum, r) => sum + r.additionalData!.soilPH, 0) / recordsWithEnvData.length
    : 7.0;
  
  const averageTemperature = recordsWithEnvData.length > 0
    ? recordsWithEnvData.reduce((sum, r) => sum + r.additionalData!.temperature, 0) / recordsWithEnvData.length
    : 24;
    
  const averageHumidity = recordsWithEnvData.length > 0
    ? recordsWithEnvData.reduce((sum, r) => sum + r.additionalData!.humidity, 0) / recordsWithEnvData.length
    : 65;

  return {
    totalDiagnoses,
    healthyPlants,
    diseasedPlants,
    waterSaved: totalWaterSaved,
    pesticidesAvoided: totalPesticidesAvoided,
    diseaseFrequency,
    averageSoilPH,
    averageTemperature,
    averageHumidity
  };
};

/**
 * Generate chart data for react-chartjs-2 visualization
 * @param records - Array of diagnosis records
 * @returns Object with chart datasets
 */
const generateChartData = (records: DiagnosisRecord[]) => {
  // Time series data for trends
  const last30Days = records.filter(r => 
    Date.now() - r.timestamp < 30 * 24 * 60 * 60 * 1000
  );

  // Group by day for trend analysis
  const dailyData: Record<string, { healthy: number; diseased: number; water_saved: number }> = {};
  
  last30Days.forEach(record => {
    const date = new Date(record.timestamp).toISOString().split('T')[0];
    if (!dailyData[date]) {
      dailyData[date] = { healthy: 0, diseased: 0, water_saved: 0 };
    }
    
    if (record.topPrediction.className === 'Healthy') {
      dailyData[date].healthy++;
    } else {
      dailyData[date].diseased++;
    }
    
    dailyData[date].water_saved += record.businessMetrics.water_saved_est;
  });

  // Disease frequency for pie/doughnut charts
  const diseaseFrequency: Record<string, number> = {};
  records.forEach(record => {
    const disease = record.topPrediction.className;
    diseaseFrequency[disease] = (diseaseFrequency[disease] || 0) + 1;
  });

  // Sustainability impact over time
  const sustainabilityTrend = Object.entries(dailyData).map(([date, data]) => ({
    date,
    waterSaved: data.water_saved,
    plantsHealthy: data.healthy,
    plantsDiseased: data.diseased
  }));

  return {
    diseaseFrequency,
    dailyTrends: dailyData,
    sustainabilityTrend,
    totalRecords: records.length
  };
};

/**
 * Get dashboard data for chart consumption
 * @returns Dashboard data object or null
 */
export const getDashboardData = () => {
  try {
    const stored = localStorage.getItem('snapfarm_dashboard_data');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    return null;
  }
};

/**
 * Clear all diagnosis records (for testing/reset)
 * @returns Promise<void>
 */
export const clearDiagnosisRecords = async (): Promise<void> => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('snapfarm_dashboard_data');
    console.log('All diagnosis records cleared');
  } catch (error) {
    console.error('Failed to clear diagnosis records:', error);
  }
};

/**
 * Get diagnosis records for a specific user
 * @param userId - User ID to filter by
 * @returns Array<DiagnosisRecord>
 */
export const getUserDiagnosisRecords = (userId: string): DiagnosisRecord[] => {
  const allRecords = getDiagnosisRecords();
  return allRecords.filter(record => record.userId === userId);
};

/**
 * Export diagnosis data for backup/analysis
 * @param userId - Optional user ID to filter by
 * @returns JSON string of diagnosis data
 */
export const exportDiagnosisData = (userId?: string): string => {
  const records = userId ? getUserDiagnosisRecords(userId) : getDiagnosisRecords();
  const dashboardData = getDashboardData();
  
  return JSON.stringify({
    records,
    dashboardData,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  }, null, 2);
};

/**
 * Get the last diagnosis for chat context
 * @param userId - User ID
 * @returns DiagnosisRecord or null
 */
export const getLastDiagnosisForChatContext = (userId: string): DiagnosisRecord | null => {
  const userRecords = getUserDiagnosisRecords(userId);
  return userRecords.length > 0 ? userRecords[0] : null;
};