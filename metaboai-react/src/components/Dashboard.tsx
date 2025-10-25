import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { getMetrics, getDiagnosisHistory } from '../utils/storage';
import { DashboardMetrics, DiagnosisResult } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentDiagnoses, setRecentDiagnoses] = useState<DiagnosisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const metricsData = await getMetrics(user?.id);
        const diagnosesData = await getDiagnosisHistory(user?.id);
        
        setMetrics(metricsData);
        setRecentDiagnoses(diagnosesData.slice(0, 5)); // Last 5 diagnoses
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Remove auto-refresh for better performance
    // const interval = setInterval(loadData, 30000);
    // return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
<div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">No data available yet</p>
        </div>
      </div>
    );
  }

  // Chart data for disease frequency
  const diseaseChartData = {
    labels: Object.keys(metrics.diseaseFrequency),
    datasets: [{
      label: 'Diagnoses',
      data: Object.values(metrics.diseaseFrequency),
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',   // Green for Healthy
        'rgba(239, 68, 68, 0.8)',   // Red for Blight
        'rgba(245, 158, 11, 0.8)',  // Orange for Leaf Curl
        'rgba(168, 85, 247, 0.8)'   // Purple for Mosaic Virus
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(168, 85, 247, 1)'
      ],
      borderWidth: 2
    }]
  };

  // Chart data for health ratio
  const healthChartData = {
    labels: ['Healthy Plants', 'Diseased Plants'],
    datasets: [{
      data: [metrics.healthyPlants, metrics.diseasedPlants],
      backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
      borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
      borderWidth: 2
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          {user ? `${user.displayName}'s Dashboard` : 'SnapFarm Dashboard'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Track your plant health and sustainability impact
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Diagnoses</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{metrics.totalDiagnoses}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
<div className="flex items-center text-green-600 dark:text-green-400">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Active monitoring
                </div>
              </p>
            </div>
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg">
<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Healthy Plants</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{metrics.healthyPlants}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {metrics.totalDiagnoses > 0 ? `${((metrics.healthyPlants / metrics.totalDiagnoses) * 100).toFixed(1)}% healthy` : 'No data yet'}
              </p>
            </div>
            <div className="p-4 bg-green-600 rounded-2xl shadow-lg">
<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Water Saved</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{metrics.waterSaved.toFixed(1)}L</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Sustainable practices
              </p>
            </div>
            <div className="p-4 bg-cyan-600 rounded-2xl shadow-lg">
<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pesticides Avoided</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{metrics.pesticidesAvoided.toFixed(0)}ml</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Eco-friendly approach
              </p>
            </div>
            <div className="p-4 bg-purple-600 rounded-2xl shadow-lg">
<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Environmental Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Average Soil pH</h3>
<div className="p-2 bg-orange-600 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.averageSoilPH.toFixed(1)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Optimal: 6.0 - 6.8 • 
            <span className={`ml-1 ${
              metrics.averageSoilPH >= 6.0 && metrics.averageSoilPH <= 6.8 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {metrics.averageSoilPH >= 6.0 && metrics.averageSoilPH <= 6.8 ? 'Good' : 'Needs attention'}
            </span>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Average Temperature</h3>
<div className="p-2 bg-red-600 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.averageTemperature.toFixed(1)}°C</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Optimal: 18 - 26°C • 
            <span className={`ml-1 ${
              metrics.averageTemperature >= 18 && metrics.averageTemperature <= 26 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {metrics.averageTemperature >= 18 && metrics.averageTemperature <= 26 ? 'Good' : 'Monitor closely'}
            </span>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Average Humidity</h3>
<div className="p-2 bg-cyan-600 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metrics.averageHumidity.toFixed(1)}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Optimal: 60 - 70% • 
            <span className={`ml-1 ${
              metrics.averageHumidity >= 60 && metrics.averageHumidity <= 70 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {metrics.averageHumidity >= 60 && metrics.averageHumidity <= 70 ? 'Good' : 'Adjust if needed'}
            </span>
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disease Frequency Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700">
<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Disease Frequency
          </h3>
          {Object.keys(metrics.diseaseFrequency).length > 0 ? (
            <Bar data={diseaseChartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <div className="text-center">
<div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-lg font-medium">No diagnoses yet</p>
                <p className="text-sm mt-2">Upload plant images to see disease patterns</p>
              </div>
            </div>
          )}
        </div>

        {/* Health Ratio Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700">
<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Plant Health Ratio
          </h3>
          {metrics.totalDiagnoses > 0 ? (
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={healthChartData} options={doughnutOptions} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <div className="text-center">
<div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <p className="text-lg font-medium">No diagnoses yet</p>
                <p className="text-sm mt-2">Start diagnosing plants to see health ratios</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Diagnoses */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Recent Diagnoses
          </h3>
        </div>
        <div className="p-6">
          {recentDiagnoses.length > 0 ? (
            <div className="space-y-4">
              {recentDiagnoses.map((diagnosis) => (
                <div key={diagnosis.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <img 
                    src={diagnosis.imageUrl} 
                    alt="Plant diagnosis" 
                    className="w-16 h-16 rounded-xl object-cover shadow-sm"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{diagnosis.topPrediction.className}</h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(diagnosis.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Confidence: {(diagnosis.topPrediction.probability * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
<div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-lg font-medium mb-2">No diagnoses yet</p>
              <p className="text-sm">Upload your first plant image to get started!</p>
            </div>
          )}
        </div>
      </div>

      {/* Sustainability Impact */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
<h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center flex items-center justify-center">
          <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Your Sustainability Impact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{metrics.waterSaved.toFixed(1)}L</div>
<div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
              <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Water conserved through smart irrigation
            </div>
          </div>
          <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">{metrics.pesticidesAvoided.toFixed(0)}ml</div>
<div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
              <svg className="w-4 h-4 mr-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Chemical pesticides avoided
            </div>
          </div>
          <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{metrics.diseasedPlants}</div>
<div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
              <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Plants treated sustainably
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};