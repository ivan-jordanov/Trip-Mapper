import { useState, useEffect } from "react";
import tripService from "../services/tripService";
import showError from '../modules/showError';
import showStatus from '../modules/showStatus';

const useTrips = () => {
  const [tripDetails, setTripDetails] = useState(null);
  const [tripAccess, setTripAccess] = useState(null);
  const [trips, setTrips] = useState([]);
  const [tripsCount, setTripsCount] = useState(0);
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
      const message = err.response?.data?.message || err.message || 'Unable to load trip.';
      setTripDetails(null);
      setError(message);
      return null;
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
      const message = err.response?.data?.message || err.message || 'Unable to load trip access.';
      setTripAccess(null);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchTrips = async (title, dateFrom, dateVisited, page, pageSize) => {
    setLoading(true);
    setError(null);
    try {
      const data = await tripService.getAll(title, dateFrom, dateVisited, page, pageSize);
      setTrips(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTripsCount = async (title, dateFrom, dateVisited) => {
    try {
      const data = await tripService.getCount(title, dateFrom, dateVisited);
      setTripsCount(data.count || 0);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
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

  const deleteTrip = async (id, rowVersion) => {
    setLoading(true);
    setError(null);
    try {
      await tripService.delete(id, rowVersion);
      setTrips((prev) => prev.filter((trip) => trip.id !== id));
      showStatus('Trip deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    trips,
    tripsCount,
    tripDetails,
    tripAccess,
    loading,
    error,
    fetchTrips,
    fetchTripsCount,
    fetchTripDetails,
    fetchTripAccess,
    createTrip,
    updateTrip,
    deleteTrip,
  };
};

export default useTrips;
