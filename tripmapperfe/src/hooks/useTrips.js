import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import tripService from '../services/tripService';
import showError from '../modules/showError';
import showStatus from '../modules/showStatus';

const getErrorMessage = (error) => error?.response?.data?.message || error?.message || 'Request failed.';

const useTrips = () => {
  const queryClient = useQueryClient();
  const [tripListArgs, setTripListArgs] = useState(null);
  const [tripCountArgs, setTripCountArgs] = useState(null);
  const [tripId, setTripId] = useState(null);
  const [accessTripId, setAccessTripId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const tripsQuery = useQuery({
    queryKey: ['trips', tripListArgs],
    queryFn: () => tripService.getAll(
      tripListArgs.title,
      tripListArgs.dateFrom,
      tripListArgs.dateTo,
      tripListArgs.page,
      tripListArgs.pageSize
    ),
    enabled: tripListArgs !== null,
  });

  const tripsCountQuery = useQuery({
    queryKey: ['trips-count', tripCountArgs],
    queryFn: async () => {
      const result = await tripService.getCount(
        tripCountArgs.title,
        tripCountArgs.dateFrom,
        tripCountArgs.dateTo
      );
      return result.count || 0;
    },
    enabled: tripCountArgs !== null,
  });

  const tripDetailsQuery = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripService.getById(tripId),
    enabled: tripId !== null,
  });

  const tripAccessQuery = useQuery({
    queryKey: ['trip-access', accessTripId],
    queryFn: () => tripService.getAccess(accessTripId),
    enabled: accessTripId !== null,
  });

  const createMutation = useMutation({
    mutationFn: (tripData) => tripService.create(tripData),
    onSuccess: (created) => {
      if (queryClient.getQueryData(['trips', null]) === undefined) {
        queryClient.setQueryData(['trips', null], [created]);
      } else {
        queryClient.setQueriesData({ queryKey: ['trips'] }, (current) => current ? [...current, created] : current);
      }
      queryClient.invalidateQueries({ queryKey: ['trips'], refetchType: 'none' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, tripData }) => tripService.update(id, tripData),
    onSuccess: (updated, variables) => {
      queryClient.setQueryData(['trip', variables.id], updated);
      queryClient.setQueryData(['trips', tripListArgs], (current) => current
        ? current.map((trip) => (trip.id === variables.id ? updated : trip))
        : current);
      queryClient.setQueriesData({ queryKey: ['trips'] }, (current) => current
        ? current.map((trip) => (trip.id === variables.id ? updated : trip))
        : current);
      queryClient.invalidateQueries({ queryKey: ['trips'], refetchType: 'none' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, rowVersion }) => tripService.delete(id, rowVersion),
    onSuccess: (_, variables) => {
      queryClient.removeQueries({ queryKey: ['trip', variables.id] });
      queryClient.setQueryData(['trips', tripListArgs], (current) => current
        ? current.filter((trip) => trip.id !== variables.id)
        : current);
      queryClient.setQueriesData({ queryKey: ['trips'] }, (current) => current
        ? current.filter((trip) => trip.id !== variables.id)
        : current);
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });

  const mutationError = createMutation.error || updateMutation.error || deleteMutation.error;
  const queryError = tripsQuery.error || tripsCountQuery.error || tripDetailsQuery.error || tripAccessQuery.error;
  const error = actionError || mutationError || queryError;
  const errorMessage = error ? getErrorMessage(error) : null;

  useEffect(() => {
    if (errorMessage) showError(errorMessage);
  }, [errorMessage]);

  const fetchTrips = async (title, dateFrom, dateTo, page, pageSize) => {
    setActionError(null);
    const args = { title, dateFrom, dateTo, page, pageSize };
    setTripListArgs(args);
    try {
      return await queryClient.fetchQuery({
        queryKey: ['trips', args],
        queryFn: () => tripService.getAll(title, dateFrom, dateTo, page, pageSize),
      });
    } catch (fetchError) {
      setActionError(fetchError);
      return [];
    }
  };

  const fetchTripsCount = async (title, dateFrom, dateTo) => {
    setActionError(null);
    const args = { title, dateFrom, dateTo };
    setTripCountArgs(args);
    try {
      return await queryClient.fetchQuery({
        queryKey: ['trips-count', args],
        queryFn: async () => (await tripService.getCount(title, dateFrom, dateTo)).count || 0,
      });
    } catch (fetchError) {
      setActionError(fetchError);
      return 0;
    }
  };

  const fetchTripDetails = async (id) => {
    setActionError(null);
    setTripId(id);
    try {
      return await queryClient.fetchQuery({
        queryKey: ['trip', id],
        queryFn: () => tripService.getById(id),
      });
    } catch (fetchError) {
      setActionError(fetchError);
      return null;
    }
  };

  const fetchTripAccess = async (id) => {
    setActionError(null);
    setAccessTripId(id);
    try {
      return await queryClient.fetchQuery({
        queryKey: ['trip-access', id],
        queryFn: () => tripService.getAccess(id),
      });
    } catch (fetchError) {
      setActionError(fetchError);
      return null;
    }
  };

  const createTrip = async (tripData) => {
    const created = await createMutation.mutateAsync(tripData);
    showStatus('Trip created successfully');
    return created;
  };

  const updateTrip = async (id, tripData) => {
    const updated = await updateMutation.mutateAsync({ id, tripData });
    showStatus('Trip updated successfully');
    return updated;
  };

  const deleteTrip = async (id, rowVersion) => {
    await deleteMutation.mutateAsync({ id, rowVersion });
    queryClient.setQueryData(['trips', tripListArgs], (current) => current
      ? current.filter((trip) => trip.id !== id)
      : current);
    showStatus('Trip deleted successfully');
  };

  return {
    trips: tripsQuery.data || [],
    tripsCount: tripsCountQuery.data || 0,
    tripDetails: tripDetailsQuery.data || null,
    tripAccess: tripAccessQuery.data || null,
    loading: (tripsQuery.isFetching && !tripsQuery.isError)
      || (tripsCountQuery.isFetching && !tripsCountQuery.isError)
      || (tripDetailsQuery.isFetching && !tripDetailsQuery.isError && !actionError)
      || (tripAccessQuery.isFetching && !tripAccessQuery.isError && !actionError)
      || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: errorMessage,
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
