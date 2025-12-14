import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

/**
 * Generic data fetching hook
 * @param {string} url - API endpoint to fetch from
 * @param {object} options - Additional options (params, skip, etc.)
 * @returns {object} { data, loading, error, refetch }
 */
const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (options.skip) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(url, { params: options.params });
      
      if (response.data.success) {
        setData(response.data);
      } else {
        setError(response.data.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error(`Error fetching ${url}:`, err);
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url, options.skip, JSON.stringify(options.params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

export default useFetch;
