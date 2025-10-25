import { collection, addDoc, getDocs, query, orderBy, limit, where, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { DiagnosisResult, ChatMessage, DashboardMetrics } from '../types';

// LocalStorage keys for offline fallback
const STORAGE_KEYS = {
  DIAGNOSES: 'snapfarm_diagnoses',
  CHAT_HISTORY: 'snapfarm_chat_history',
  METRICS: 'snapfarm_metrics'
} as const;

// Diagnosis History Management
export const saveDiagnosis = async (diagnosis: DiagnosisResult, userId?: string): Promise<void> => {
  try {
    console.log('💾 Saving diagnosis:', diagnosis.id);
    
    // Always save to localStorage (since we're not using Firebase)
    const existing = getDiagnosisHistoryLocal();
    const updated = [diagnosis, ...existing].slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.DIAGNOSES, JSON.stringify(updated));
    
    console.log('✅ Diagnosis saved successfully');
    
    // Update metrics
    await updateMetrics(userId);
  } catch (error) {
    console.error('❌ Failed to save diagnosis:', error);
    throw error;
  }
};

export const getDiagnosisHistory = async (userId?: string): Promise<DiagnosisResult[]> => {
  try {
    console.log('📋 Loading diagnosis history for user:', userId || 'anonymous');
    // Always use localStorage (since we're not using Firebase)
    return getDiagnosisHistoryLocal();
  } catch (error) {
    console.error('❌ Failed to load diagnosis history:', error);
    return [];
  }
};

const getDiagnosisHistoryLocal = (): DiagnosisResult[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.DIAGNOSES);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load local diagnosis history:', error);
    return [];
  }
};

export const clearDiagnosisHistory = async (userId?: string): Promise<void> => {
  try {
    if (userId) {
      // Clear from Firestore
      const q = query(collection(db, 'diagnoses'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    }
    // Also clear localStorage
    localStorage.removeItem(STORAGE_KEYS.DIAGNOSES);
    await updateMetrics(userId);
  } catch (error) {
    console.error('Failed to clear diagnosis history:', error);
  }
};

// Chat History Management
export const saveChatMessage = async (message: ChatMessage, userId?: string): Promise<void> => {
  try {
    if (userId) {
      // Save to Firestore
      await addDoc(collection(db, 'chatMessages'), {
        ...message,
        userId,
        createdAt: new Date()
      });
    } else {
      // Fallback to localStorage
      const existing = getChatHistoryLocal();
      const updated = [...existing, message].slice(-200);
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(updated));
    }
  } catch (error) {
    console.error('Failed to save chat message:', error);
    // Fallback to localStorage on error
    const existing = getChatHistoryLocal();
    const updated = [...existing, message].slice(-200);
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(updated));
  }
};

export const getChatHistory = async (userId?: string): Promise<ChatMessage[]> => {
  try {
    if (userId) {
      // Get from Firestore
      const q = query(
        collection(db, 'chatMessages'),
        where('userId', '==', userId),
        orderBy('timestamp', 'asc'),
        limit(200)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
    } else {
      // Fallback to localStorage
      return getChatHistoryLocal();
    }
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return getChatHistoryLocal();
  }
};

const getChatHistoryLocal = (): ChatMessage[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load local chat history:', error);
    return [];
  }
};

export const clearChatHistory = async (userId?: string): Promise<void> => {
  try {
    if (userId) {
      // Clear from Firestore
      const q = query(collection(db, 'chatMessages'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    }
    // Also clear localStorage
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  } catch (error) {
    console.error('Failed to clear chat history:', error);
  }
};

// Metrics Calculation and Storage
export const updateMetrics = async (userId?: string): Promise<void> => {
  try {
    console.log('📊 Updating metrics for user:', userId || 'anonymous');
    const diagnoses = await getDiagnosisHistory(userId);
    const metrics = calculateMetrics(diagnoses);
    
    // Always save to localStorage (since we're not using Firebase)
    localStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(metrics));
    console.log('✅ Metrics updated successfully');
  } catch (error) {
    console.error('❌ Failed to update metrics:', error);
  }
};

export const getMetrics = async (userId?: string): Promise<DashboardMetrics> => {
  try {
    if (userId) {
      // Get from Firestore
      const diagnoses = await getDiagnosisHistory(userId);
      return calculateMetrics(diagnoses);
    } else {
      // Fallback to localStorage
      const stored = localStorage.getItem(STORAGE_KEYS.METRICS);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Calculate fresh metrics if none stored
      const diagnoses = await getDiagnosisHistory();
      return calculateMetrics(diagnoses);
    }
  } catch (error) {
    console.error('Failed to load metrics:', error);
    return getDefaultMetrics();
  }
};

const calculateMetrics = (diagnoses: DiagnosisResult[]): DashboardMetrics => {
  const total = diagnoses.length;
  
  // Return empty state if no diagnoses
  if (total === 0) {
    return {
      totalDiagnoses: 0,
      healthyPlants: 0,
      diseasedPlants: 0,
      waterSaved: 0,
      pesticidesAvoided: 0,
      diseaseFrequency: {},
      averageSoilPH: 0,
      averageTemperature: 0,
      averageHumidity: 0
    };
  }
  
  const healthy = diagnoses.filter(d => d.topPrediction.className === 'Healthy').length;
  const diseased = total - healthy;
  
  // Calculate disease frequency
  const diseaseFrequency: Record<string, number> = {};
  diagnoses.forEach(d => {
    const disease = d.topPrediction.className;
    diseaseFrequency[disease] = (diseaseFrequency[disease] || 0) + 1;
  });
  
  // Calculate environmental averages (only from records with additional data)
  const recordsWithData = diagnoses.filter(d => d.additionalData);
  const averageSoilPH = recordsWithData.length > 0 
    ? recordsWithData.reduce((sum, d) => sum + d.additionalData!.soilPH, 0) / recordsWithData.length 
    : 0;
  const averageTemperature = recordsWithData.length > 0
    ? recordsWithData.reduce((sum, d) => sum + d.additionalData!.temperature, 0) / recordsWithData.length
    : 0;
  const averageHumidity = recordsWithData.length > 0
    ? recordsWithData.reduce((sum, d) => sum + d.additionalData!.humidity, 0) / recordsWithData.length
    : 0;
  
  // Estimate sustainability savings (simplified calculation)
  const sustainableActionsUsed = diseased * 2; // Assume 2 sustainable actions per diseased plant
  const waterSaved = sustainableActionsUsed * 2.5; // 2.5L per action
  const pesticidesAvoided = sustainableActionsUsed * 15; // 15ml per action
  
  return {
    totalDiagnoses: total,
    healthyPlants: healthy,
    diseasedPlants: diseased,
    waterSaved,
    pesticidesAvoided,
    diseaseFrequency,
    averageSoilPH,
    averageTemperature,
    averageHumidity
  };
};

const getDefaultMetrics = (): DashboardMetrics => ({
  totalDiagnoses: 0,
  healthyPlants: 0,
  diseasedPlants: 0,
  waterSaved: 0,
  pesticidesAvoided: 0,
  diseaseFrequency: {},
  averageSoilPH: 7.0,
  averageTemperature: 24,
  averageHumidity: 65
});

// Storage utilities
export const getStorageUsage = (): { used: number; available: number } => {
  try {
    const used = new Blob(Object.values(localStorage)).size;
    const available = 5 * 1024 * 1024; // 5MB typical limit
    return { used, available };
  } catch (error) {
    return { used: 0, available: 5 * 1024 * 1024 };
  }
};

export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};