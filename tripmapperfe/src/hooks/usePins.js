import { useState, useEffect } from "react";
import pinService from "../services/pinService";
import showError from '../modules/showError';
import showStatus from '../modules/showStatus';

const usePins = () => {
  const [pinDetails, setPinDetails] = useState(null);
  const [pins, setPins] = useState([]);
  const [pinsCount, setPinsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (error) {
    showError(error);
  }

  const fetchPinDetails = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const pin = await pinService.getById(id);
      setPinDetails(pin);
      return pin;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Unable to load pin.';
      setPinDetails(null);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchPins = async (title, visitedFrom, createdFrom, category, page, pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const data = await pinService.getAll(title, visitedFrom, createdFrom, category, page, pageSize);
      setPins(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPinsCount = async (title, visitedFrom, createdFrom, category) => {
    try {
      const data = await pinService.getCount(title, visitedFrom, createdFrom, category);
      setPinsCount(data.count || 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const createPin = async (pinData) => {
    setLoading(true);
    setError(null);
    try {
      const newPin = await pinService.create(pinData);
      setPins((prev) => [...prev, newPin]);
      showStatus('Pin created successfully');
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
      showStatus('Pin deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    pinDetails,
    pins,
    pinsCount,
    loading,
    error,
    fetchPinDetails,
    fetchPins,
    fetchPinsCount,
    createPin,
    deletePin,
  };
};

export default usePins;
