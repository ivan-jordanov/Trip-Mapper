import { useState, useEffect } from 'react';
import tripService from '../services/tripService';

const useTrips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tripService.getAll();
      setTrips(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (tripData) => {
    setLoading(true);
    setError(null);
    try {
      const newTrip = await tripService.create(tripData);
      setTrips((prev) => [...prev, newTrip]);
      return newTrip;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTrip = async (id, tripData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await tripService.update(id, tripData);
      setTrips((prev) => prev.map((trip) => (trip.id === id ? updated : trip)));
      return updated;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await tripService.delete(id);
      setTrips((prev) => prev.filter((trip) => trip.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return {
    trips,
    loading,
    error,
    fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
  };
};

export default useTrips;
