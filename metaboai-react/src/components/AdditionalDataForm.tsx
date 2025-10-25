import React, { useState } from 'react';
import { Thermometer, Droplets, Sun, MapPin, Calendar, FileText } from 'lucide-react';
import { AdditionalDiagnosisData } from '../types';

interface AdditionalDataFormProps {
  onSubmit: (data: AdditionalDiagnosisData) => void;
  onSkip: () => void;
  isVisible: boolean;
}

export const AdditionalDataForm: React.FC<AdditionalDataFormProps> = ({
  onSubmit,
  onSkip,
  isVisible
}) => {
  const [formData, setFormData] = useState<AdditionalDiagnosisData>({
    soilPH: 7.0,
    soilMoisture: 50,
    temperature: 24,
    humidity: 65,
    lightIntensity: 800,
    plantAge: 30,
    location: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 AdditionalDataForm: Submit clicked', formData);
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof AdditionalDiagnosisData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Plant Environment Data</h2>
          <p className="text-blue-100">
            Help our AI provide more accurate diagnosis by sharing your plant's environmental conditions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Soil pH */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Droplets className="mr-2 text-blue-500" size={16} />
                Soil pH Level
              </label>
              <input
                type="number"
                min="0"
                max="14"
                step="0.1"
                value={formData.soilPH}
                onChange={(e) => handleInputChange('soilPH', parseFloat(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="7.0"
              />
              <p className="text-xs text-gray-500 mt-1">Optimal range: 6.0 - 6.8</p>
            </div>

            {/* Soil Moisture */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Droplets className="mr-2 text-cyan-500" size={16} />
                Soil Moisture (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.soilMoisture}
                onChange={(e) => handleInputChange('soilMoisture', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="50"
              />
              <p className="text-xs text-gray-500 mt-1">Optimal range: 60 - 80%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Temperature */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Thermometer className="mr-2 text-red-500" size={16} />
                Temperature (°C)
              </label>
              <input
                type="number"
                min="-10"
                max="50"
                value={formData.temperature}
                onChange={(e) => handleInputChange('temperature', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="24"
              />
              <p className="text-xs text-gray-500 mt-1">Optimal range: 18 - 26°C</p>
            </div>

            {/* Humidity */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Droplets className="mr-2 text-teal-500" size={16} />
                Humidity (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.humidity}
                onChange={(e) => handleInputChange('humidity', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="65"
              />
              <p className="text-xs text-gray-500 mt-1">Optimal range: 60 - 70%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Light Intensity */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Sun className="mr-2 text-yellow-500" size={16} />
                Light Intensity (lux)
              </label>
              <input
                type="number"
                min="0"
                max="2000"
                value={formData.lightIntensity}
                onChange={(e) => handleInputChange('lightIntensity', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="800"
              />
              <p className="text-xs text-gray-500 mt-1">Optimal range: 600 - 1000 lux</p>
            </div>

            {/* Plant Age */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="mr-2 text-green-500" size={16} />
                Plant Age (days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={formData.plantAge}
                onChange={(e) => handleInputChange('plantAge', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="30"
              />
              <p className="text-xs text-gray-500 mt-1">Days since planting</p>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="mr-2 text-purple-500" size={16} />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Greenhouse A, Garden Plot 3, Indoor Setup"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="mr-2 text-gray-500" size={16} />
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Any additional observations, recent treatments, or concerns..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
            >
              Analyze with Data
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('⏭️ AdditionalDataForm: Skip clicked');
                onSkip();
              }}
              className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Analyze Without Data
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Why this data helps:</strong> Environmental conditions significantly impact plant health. 
              Providing this information before analysis allows our AI to consider these factors and provide more accurate diagnoses and personalized treatment recommendations.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};