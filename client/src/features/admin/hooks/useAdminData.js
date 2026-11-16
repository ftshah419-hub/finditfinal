import { useState, useEffect, useCallback } from 'react';
import adminApi from '../services/adminApi';

/**
 * useAdminData Hook
 * Centralized data telemetry and reactive synchronization for the Admin Console
 */
export const useAdminData = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getDashboard();
      setStats(data || {});
    } catch (err) {
      console.error('[AdminData] Error fetching telemetry stats:', err);
      setError(err.message || 'Failed to connect to administrative metrics service.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const pendingAlerts =
    (stats?.claims?.pending || 0) +
    (stats?.items?.pending || 0) +
    (stats?.reports?.pending || 0);

  return {
    stats,
    loading,
    error,
    pendingAlerts,
    refetchStats: fetchStats
  };
};

export default useAdminData;
