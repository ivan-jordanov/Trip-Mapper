import { useState, useEffect } from "react";
import pinService from "../services/pinService";
import showError from '../modules/showError';
import showStatus from '../modules/showStatus';

const usePins = () => {
  const [pinDetails, setPinDetails] = useState(null);
  const [pins, setPins] = useState([]);
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
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchPins = async (title, visitedFrom, createdFrom, category) => {
    setLoading(true);
    setError(null);
    try {
      const data = await pinService.getAll(title, visitedFrom, createdFrom, category);
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
    loading,
    error,
    fetchPinDetails,
    fetchPins,
    createPin,
    deletePin,
  };
};

export default usePins;
