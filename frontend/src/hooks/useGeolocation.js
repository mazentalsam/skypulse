import { useState, useCallback } from 'react';

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPosition = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      setLoading(true);
      setError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLoading(false);
          resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        (err) => {
          setLoading(false);
          const msg = err.code === 1 ? 'Location access denied' : 'Could not get your location';
          setError(msg);
          reject(new Error(msg));
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    });
  }, []);

  return { getPosition, loading, error };
}
