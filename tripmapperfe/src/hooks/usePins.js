import { useState, useEffect } from 'react';
import pinService from '../services/pinService';

const usePins = () => {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPins = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await pinService.getAll();
      setPins(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPin = async (pinData) => {
    setLoading(true);
    setError(null);
    try {
      const newPin = await pinService.create(pinData);
      setPins((prev) => [...prev, newPin]);
      return newPin;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const deletePin = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await pinService.delete(id);
      setPins((prev) => prev.filter((pin) => pin.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPins();
  }, []);

  return {
    pins,
    loading,
    error,
    fetchPins,
    createPin,
    updatePin,
    deletePin,
  };
};

export default usePins;
