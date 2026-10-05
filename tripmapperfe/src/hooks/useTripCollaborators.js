import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import tripService from '../services/tripService';

const useTripCollaborators = (tripId) => {
  const queryClient = useQueryClient();
  const queryKey = ['collaborators', tripId];

  const collaboratorsQuery = useQuery({
    queryKey,
    queryFn: () => tripService.getCollaborators(tripId),
    enabled: Boolean(tripId),
  });

  const grantMutation = useMutation({
    mutationFn: ({ username, accessLevel }) => tripService.grantAccess(tripId, username, accessLevel),
    onSuccess: (granted) => queryClient.setQueryData(queryKey, (current) => [...(current || []), granted]),
  });

  const revokeMutation = useMutation({
    mutationFn: (userId) => tripService.revokeAccess(tripId, userId),
    onSuccess: (_, userId) => queryClient.setQueryData(queryKey, (current) =>
      (current || []).filter((collaborator) => collaborator.userId !== userId)),
  });

  const leaveMutation = useMutation({ mutationFn: () => tripService.leaveTrip(tripId) });

  return {
    collaborators: collaboratorsQuery.data || [],
    loading: collaboratorsQuery.isFetching,
    grant: grantMutation.mutateAsync,
    revoke: revokeMutation.mutateAsync,
    leave: leaveMutation.mutateAsync,
    granting: grantMutation.isPending,
  };
};

export default useTripCollaborators;
