import React, { useEffect, useState } from 'react';
import { Stats } from '../types';
import { getStats } from '../services/api';

const StatsBar: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Safety Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-primary-50 rounded-lg p-4">
          <div className="text-3xl font-bold text-primary-600">{stats.total_reports}</div>
          <div className="text-sm text-gray-600 mt-1">Total Reports</div>
        </div>
        
        <div className="bg-warning-50 rounded-lg p-4">
          <div className="text-3xl font-bold text-warning-600">{stats.total_hotspots}</div>
          <div className="text-sm text-gray-600 mt-1">Active Hotspots</div>
        </div>
        
        <div className="bg-danger-50 rounded-lg p-4">
          <div className="text-xl font-bold text-danger-600 capitalize">
            {stats.most_common_incident.replace('_', ' ')}
          </div>
          <div className="text-sm text-gray-600 mt-1">Most Common</div>
        </div>
        
        <div className="bg-success-50 rounded-lg p-4">
          <div className="text-3xl font-bold text-success-600">
            {stats.peak_reporting_hour}:00
          </div>
          <div className="text-sm text-gray-600 mt-1">Peak Hour</div>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
