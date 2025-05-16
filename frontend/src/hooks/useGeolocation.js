// src/hooks/useGeolocation.js
import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => setPosition(pos),
      (err) => setError(err.message)
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { position, error };
};
