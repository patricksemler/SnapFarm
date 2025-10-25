import React, { useState } from 'react';
import { Prediction } from '../types';
import { getDiseaseInfoFromPredictions } from '../utils/diseaseMapping';
import { getAIFocusHints } from '../utils/inference';

interface ResultsCardProps {
  predictions: Prediction[];
  imageUrl: string;
  hasEnvironmentalData?: boolean;
}

export const ResultsCard: React.FC<ResultsCardProps> = ({ 
  predictions, 
  imageUrl,
  hasEnvironmentalData = false
}) => {
  const [activeTab, setActiveTab] = useState<'predictions' | 'recommendations' | 'focus'>('predictions');

  const topPrediction = predictions[0];
  const diseaseInfo = getDiseaseInfoFromPredictions(predictions);
  const focusHints = getAIFocusHints(topPrediction.className);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden max-w-3xl mx-auto h-full flex flex-col">
      {/* Compact Header with image and top prediction - Fixed */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <img 
            src={imageUrl} 
            alt="Analyzed plant" 
            className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-sm flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{diseaseInfo.name}</h2>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(diseaseInfo.severity)} flex-shrink-0`}>
                {diseaseInfo.severity.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 overflow-hidden" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>{diseaseInfo.reason}</p>
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Confidence: </span>
              <span className={`font-medium ${getConfidenceColor(topPrediction.probability)}`}>
                {(topPrediction.probability * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Fixed */}
      <div className="border-b border-gray-200 flex-shrink-0">
        <nav className="flex">
          {[
            { 
              key: 'predictions', 
              label: 'Predictions', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            { 
              key: 'recommendations', 
              label: 'Treatment', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )
            },
            { 
              key: 'focus', 
              label: 'AI Focus', 
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )
            }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content - Optimized to fit */}
      <div className="flex-1 p-4">
        {activeTab === 'predictions' && (
          <div className="space-y-3 h-full flex flex-col">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">All Predictions</h3>
            <div className="flex-1 space-y-3">
              {predictions.map((prediction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-3">
                    {index === 0 ? (
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ) : index === 1 ? (
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    )}
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100 text-base">{prediction.className}</span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {index === 0 ? 'Primary diagnosis' : index === 1 ? 'Secondary possibility' : 'Alternative diagnosis'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${prediction.probability * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-base font-bold text-gray-900 dark:text-gray-100 w-12 text-right">
                      {(prediction.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-3 h-full flex flex-col">
            {/* Treatment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Sustainable Actions
                </h3>
                <ul className="space-y-1.5">
                  {diseaseInfo.sustainableActions.slice(0, 3).map((action, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-600 mt-0.5 text-sm">•</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm flex items-center">
                  <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Additional Treatments
                </h3>
                <ul className="space-y-1.5">
                  {diseaseInfo.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-0.5 text-sm">•</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Environmental Conditions */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-xs flex items-center">
                <svg className="w-3 h-3 mr-1 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Environmental Conditions
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(diseaseInfo.environmentalConditions).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="bg-white dark:bg-gray-800 p-2 rounded text-center shadow-sm">
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 font-medium truncate">
                      {key.replace(/([A-Z])/g, ' $1').trim().split(' ')[0]}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        <span className="font-semibold">{value.optimal}</span>
                      </div>
                      <div className={`text-xs font-semibold ${value.current === value.optimal ? 'text-green-600' : 'text-red-600'}`}>
                        {value.current}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'focus' && (
          <div className="space-y-2 h-full flex flex-col">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm flex items-center">
                <svg className="w-3 h-3 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                What the AI Analyzed
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Key features the AI focused on for diagnosis:
              </p>
            </div>
            
            <div className="flex-1 space-y-1.5">
              {focusHints.slice(0, 4).map((hint, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="w-1 h-1 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300 leading-tight">{hint}</span>
                </div>
              ))}
            </div>
            
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> AI explanations are simplified. The model analyzes thousands of features.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};