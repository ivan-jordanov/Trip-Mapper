import { useState, useEffect } from "react";
import tripService from "../services/tripService";
import showError from '../modules/showError';
import showStatus from '../modules/showStatus';

const useTrips = () => {
  const [tripDetails, setTripDetails] = useState(null);
  const [tripAccess, setTripAccess] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (error) {
    showError(error);
  }

  const fetchTripDetails = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const trip = await tripService.getById(id);
      setTripDetails(trip);
      return trip;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchTripAccess = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const access = await tripService.getAccess(id);
      setTripAccess(access);
      return access;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchTrips = async (title, dateFrom, dateVisited) => {
    setLoading(true);
    setError(null);
    try {
      const data = await tripService.getAll(title, dateFrom, dateVisited);
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
      showStatus('Trip created successfully');
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
      showStatus('Trip updated successfully');
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
      showStatus('Trip deleted successfully');
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
    tripDetails,
    loading,
    error,
    fetchTrips,
    fetchTripDetails,
    fetchTripAccess,
    createTrip,
    updateTrip,
    deleteTrip,
  };
};

export default useTrips;
