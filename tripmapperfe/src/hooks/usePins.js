import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import pinService from '../services/pinService';
import showError from '../modules/showError';
import showStatus from '../modules/showStatus';

const getErrorMessage = (error) => error?.response?.data?.message || error?.message || 'Request failed.';
const EMPTY_PINS = [];

const usePins = () => {
  const queryClient = useQueryClient();
  const [pinListArgs, setPinListArgs] = useState(null);
  const [pinCountArgs, setPinCountArgs] = useState(null);
  const [pinId, setPinId] = useState(null);

  const pinsQuery = useQuery({
    queryKey: ['pins', pinListArgs],
    queryFn: () => pinService.getAll(
      pinListArgs.title,
      pinListArgs.visitedFrom,
      pinListArgs.createdFrom,
      pinListArgs.category,
      pinListArgs.page,
      pinListArgs.pageSize
    ),
    enabled: pinListArgs !== null,
  });

  const pinsCountQuery = useQuery({
    queryKey: ['pins-count', pinCountArgs],
    queryFn: async () => {
      const result = await pinService.getCount(
        pinCountArgs.title,
        pinCountArgs.visitedFrom,
        pinCountArgs.createdFrom,
        pinCountArgs.category
      );
      return result.count || 0;
    },
    enabled: pinCountArgs !== null,
  });

  const pinDetailsQuery = useQuery({
    queryKey: ['pin', pinId],
    queryFn: () => pinService.getById(pinId),
    enabled: pinId !== null,
  });

  const createMutation = useMutation({
    mutationFn: (pinData) => pinService.create(pinData),
    onSuccess: (created) => {
      if (queryClient.getQueryData(['pins', null]) === undefined) {
        queryClient.setQueryData(['pins', null], [created]);
      } else {
        queryClient.setQueriesData({ queryKey: ['pins'] }, (current) => current ? [...current, created] : current);
      }
      queryClient.invalidateQueries({ queryKey: ['pins'], refetchType: 'none' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => pinService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: ['pin', deletedId] });
      queryClient.setQueriesData({ queryKey: ['pins'] }, (current) => current
        ? current.filter((pin) => pin.id !== deletedId)
        : current);
      queryClient.invalidateQueries({ queryKey: ['pins'], refetchType: 'none' });
      queryClient.invalidateQueries({ queryKey: ['pins-count'], refetchType: 'none' });
    },
  });

  const queryError = pinsQuery.error || pinsCountQuery.error || pinDetailsQuery.error;
  const error = createMutation.error || deleteMutation.error || queryError;
  const errorMessage = error ? getErrorMessage(error) : null;

  useEffect(() => {
    if (errorMessage) showError(errorMessage);
  }, [errorMessage]);

  const fetchPins = async (title, visitedFrom, createdFrom, category, page, pageSize) => {
    const args = { title, visitedFrom, createdFrom, category, page, pageSize };
    setPinListArgs(args);
    return queryClient.fetchQuery({
      queryKey: ['pins', args],
      queryFn: () => pinService.getAll(title, visitedFrom, createdFrom, category, page, pageSize),
    });
  };

  const fetchPinsCount = async (title, visitedFrom, createdFrom, category) => {
    const args = { title, visitedFrom, createdFrom, category };
    setPinCountArgs(args);
    return queryClient.fetchQuery({
      queryKey: ['pins-count', args],
      queryFn: async () => (await pinService.getCount(title, visitedFrom, createdFrom, category)).count || 0,
    });
  };

  const fetchPinDetails = async (id) => {
    setPinId(id);
    try {
      return await queryClient.fetchQuery({
        queryKey: ['pin', id],
        queryFn: () => pinService.getById(id),
      });
    } catch {
      return null;
    }
  };

  const createPin = async (pinData) => {
    const created = await createMutation.mutateAsync(pinData);
    showStatus('Pin created successfully');
    return created;
  };

  const deletePin = async (id) => {
    await deleteMutation.mutateAsync(id);
    showStatus('Pin deleted successfully');
  };

  return {
    pinDetails: pinDetailsQuery.data || null,
    pins: pinsQuery.data ?? EMPTY_PINS,
    pinsCount: pinsCountQuery.data || 0,
    loading: (pinsQuery.isFetching && !pinsQuery.isError)
      || (pinsCountQuery.isFetching && !pinsCountQuery.isError)
      || (pinDetailsQuery.isFetching && !pinDetailsQuery.isError)
      || createMutation.isPending || deleteMutation.isPending,
    error: errorMessage,
    fetchPinDetails,
    fetchPins,
    fetchPinsCount,
    createPin,
    deletePin,
  };
};

export default usePins;
