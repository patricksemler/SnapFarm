// App Layout Component
// Main layout for authenticated users with navigation and content

import React, { useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ImageUpload } from './ImageUpload';
import { Inference } from './Inference';
import { ResultsCard } from './ResultsCard';
import { Dashboard } from './Dashboard';
import { ChatAssistant } from './ChatAssistant';
import { AuthModal } from './AuthModal';
import { AdditionalDataForm } from './AdditionalDataForm';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Prediction, AdditionalDiagnosisData } from '../types';
import { recordDiagnosisToLocalStorage } from '../utils/diagnosisRecorder';

type AppView = 'diagnose' | 'dashboard' | 'chat';

interface AppLayoutProps {
  view: AppView;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ view: currentView }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [lastSavedDiagnosisId, setLastSavedDiagnosisId] = useState<string>('');
  const [showAdditionalDataForm, setShowAdditionalDataForm] = useState(false);
  const [additionalData, setAdditionalData] = useState<AdditionalDiagnosisData | null>(null);
  const [readyForInference, setReadyForInference] = useState(false);
  const [hasEnvironmentalData, setHasEnvironmentalData] = useState(false);
  const processingRef = useRef<boolean>(false);

  const handleImageSelect = (file: File) => {
    console.log('📷 New image selected:', file.name);
    setSelectedImage(file);
    setPredictions([]);
    setProcessedImageUrl('');
    setError('');
    setAdditionalData(null);
    setReadyForInference(false);

    // Show additional data form immediately after image selection
    setShowAdditionalDataForm(true);
  };

  const handleInferenceResults = useCallback(async (results: Prediction[], imageUrl: string) => {
    console.log('🎯 Inference results received:', results.length, 'predictions');

    // Prevent concurrent processing
    if (processingRef.current) {
      console.log('🔄 Already processing, skipping duplicate call');
      return;
    }

    processingRef.current = true;

    try {
      setPredictions(results);
      setProcessedImageUrl(imageUrl);

      // Save diagnosis to user's dashboard if user is logged in
      if (user && results.length > 0) {
        try {
          // Create a duplicate check key based on image and prediction (without timestamp)
          const duplicateCheckKey = `${user.id}_${imageUrl.slice(-20)}_${results[0].className}`;

          // Check if we already saved this exact diagnosis
          if (lastSavedDiagnosisId === duplicateCheckKey) {
            console.log('🔄 Duplicate diagnosis detected, skipping save');
            return;
          }

          // Create unique ID with timestamp for storage
          const uniqueId = `diagnosis_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

          const diagnosisRecord: any = {
            id: uniqueId,
            userId: user.id,
            timestamp: Date.now(),
            imageUrl: imageUrl,
            topPrediction: {
              className: results[0].className,
              probability: results[0].probability
            },
            allPredictions: results.map(pred => ({
              className: pred.className,
              probability: pred.probability
            })),
            businessMetrics: (results[0] as any).businessMetrics || {
              water_saved_est: 0,
              pesticide_avoided_est: 0,
              cost_savings_est: 0,
              environmental_impact_score: 0
            },
            // Only include environmental data if user provided it
            ...(hasEnvironmentalData && {
              environmentalData: (results[0] as any).environmentalData || {
                optimal_conditions: {},
                current_readings: {},
                recommendations: []
              }
            }),
            // Add additional data if available
            ...(additionalData && { additionalData })
          };

          await recordDiagnosisToLocalStorage(diagnosisRecord);
          setLastSavedDiagnosisId(duplicateCheckKey); // Store the check key, not the unique ID
          console.log('✅ Diagnosis saved to user dashboard:', diagnosisRecord.id);
        } catch (error) {
          console.error('❌ Failed to save diagnosis:', error);
          // Don't show error to user - diagnosis still works, just not saved
        }
      }
    } finally {
      // Reset processing flag after a short delay to allow UI updates
      setTimeout(() => {
        processingRef.current = false;
      }, 100);
    }
  }, [user, lastSavedDiagnosisId, additionalData, hasEnvironmentalData]);

  const handleInferenceError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setPredictions([]);
    setProcessedImageUrl('');
  }, []);

  const handleAdditionalDataSubmit = async (data: AdditionalDiagnosisData) => {
    console.log('📝 Additional data submitted:', data);
    setAdditionalData(data);
    setHasEnvironmentalData(true);
    setShowAdditionalDataForm(false);
    setReadyForInference(true); // This will trigger the inference
  };

  const handleAdditionalDataSkip = async () => {
    console.log('⏭️ Additional data skipped');
    setAdditionalData(null);
    setHasEnvironmentalData(false);
    setShowAdditionalDataForm(false);
    setReadyForInference(true); // This will trigger the inference without additional data
  };





  const resetDiagnosis = () => {
    setSelectedImage(null);
    setPredictions([]);
    setProcessedImageUrl('');
    setError('');
    setLastSavedDiagnosisId(''); // Reset the duplicate check
    setShowAdditionalDataForm(false);
    setAdditionalData(null);
    setReadyForInference(false);
    setHasEnvironmentalData(false);
    processingRef.current = false; // Reset processing flag
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigation = (view: AppView) => {
    navigate(`/${view}`);
    setShowMobileMenu(false);
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 grid grid-rows-[auto_1fr_auto]">
      {/* Navigation Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">SF</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">SnapFarm</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI Plant Disease Diagnosis</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {[
                {
                  key: 'diagnose',
                  label: 'Diagnose',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  ),
                  path: '/diagnose'
                },
                {
                  key: 'dashboard',
                  label: 'Dashboard',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ),
                  path: '/dashboard'
                },
                {
                  key: 'chat',
                  label: 'Assistant',
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  ),
                  path: '/chat'
                }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleNavigation(tab.key as AppView)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${location.pathname === tab.path
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* User Menu & Theme Toggle */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <button className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Sign out"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-xl">{showMobileMenu ? '✕' : '☰'}</span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <nav className="flex flex-col space-y-2">
                {[
                  {
                    key: 'diagnose',
                    label: 'Diagnose',
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    ),
                    path: '/diagnose'
                  },
                  {
                    key: 'dashboard',
                    label: 'Dashboard',
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    ),
                    path: '/dashboard'
                  },
                  {
                    key: 'chat',
                    label: 'Assistant',
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    ),
                    path: '/chat'
                  }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => handleNavigation(tab.key as AppView)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${location.pathname === tab.path
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={`w-full overflow-y-auto ${currentView === 'dashboard' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
        } ${currentView === 'chat' ? '' :
          currentView === 'diagnose' ? 'py-2' : 'py-8'
        }`}>
        {currentView === 'diagnose' && (
          <div className="h-full flex flex-col px-4 sm:px-6 lg:px-8">
            {/* Page Header - Compact */}
            <div className="text-center py-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                Plant Disease Diagnosis
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Upload a photo of your plant for instant AI-powered health analysis
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="max-w-2xl mx-auto mb-2">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-red-800">Error</h3>
                      <p className="text-base text-red-700 mt-1">{error}</p>
                      <button
                        onClick={resetDiagnosis}
                        className="mt-2 text-base text-red-600 hover:text-red-800 underline"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Workflow */}
            <div className="flex-1 flex items-center justify-center py-4">
              {predictions.length === 0 ? (
                // Centered upload when no results
                <div className="max-w-2xl mx-auto space-y-6">
                  <ImageUpload
                    onImageSelect={handleImageSelect}
                    isProcessing={readyForInference && !!selectedImage && predictions.length === 0 && !error}
                  />

                  {readyForInference && (
                    <Inference
                      key={selectedImage ? `${selectedImage.name}-${selectedImage.size}` : 'no-image'}
                      imageFile={selectedImage}
                      onResults={handleInferenceResults}
                      onError={handleInferenceError}
                    />
                  )}
                </div>
              ) : (
                // Results with internal scrolling
                <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
                  {predictions.length > 0 && processedImageUrl && (
                    <div className="flex-1 overflow-hidden">
                      <ResultsCard
                        predictions={predictions}
                        imageUrl={processedImageUrl}
                        hasEnvironmentalData={hasEnvironmentalData}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions - Fixed at bottom */}
            {predictions.length > 0 && (
              <div className="text-center py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <button
                  onClick={resetDiagnosis}
                  className="px-8 py-3 bg-green-600 text-white text-lg font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Diagnose Another Plant
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === 'dashboard' && <Dashboard />}

        {currentView === 'chat' && (
          <div className="max-w-4xl mx-auto h-full flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex-1 min-h-0">
              <ChatAssistant
                className="h-full"
                predictions={predictions}
                plantType="Plant"
              />
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <AdditionalDataForm
        isVisible={showAdditionalDataForm}
        onSubmit={handleAdditionalDataSubmit}
        onSkip={handleAdditionalDataSkip}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                SnapFarm - Sustainable AI Farming
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>AI Ready</span>
              </div>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              Powered by TensorFlow.js • Advanced Plant Disease Detection
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};