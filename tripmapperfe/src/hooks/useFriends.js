import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import friendService from '../services/friendService';
import { useAuthContext } from '../context/AuthContext';

const EMPTY_LIST = [];

const useFriends = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthContext();
  const userId = user?.id ?? null;
  const queryOptions = { enabled: isAuthenticated && userId !== null };
  const friendsQuery = useQuery({ queryKey: ['friends', userId], queryFn: friendService.getFriends, ...queryOptions });
  const incomingQuery = useQuery({
    queryKey: ['friend-requests', userId, 'incoming'],
    queryFn: () => friendService.getRequests('incoming'),
    ...queryOptions,
  });
  const outgoingQuery = useQuery({
    queryKey: ['friend-requests', userId, 'outgoing'],
    queryFn: () => friendService.getRequests('outgoing'),
    ...queryOptions,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['friends'] });
    queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
  };

  const sendMutation = useMutation({
    mutationFn: (username) => friendService.sendRequest(username),
    onSuccess: refresh,
  });
  const acceptMutation = useMutation({
    mutationFn: (id) => friendService.acceptRequest(id),
    onSuccess: refresh,
  });
  const declineMutation = useMutation({
    mutationFn: (id) => friendService.declineRequest(id),
    onSuccess: refresh,
  });
  const removeMutation = useMutation({
    mutationFn: (userId) => friendService.removeFriend(userId),
    onSuccess: refresh,
  });

  return {
    friends: friendsQuery.data ?? EMPTY_LIST,
    incomingRequests: incomingQuery.data ?? EMPTY_LIST,
    outgoingRequests: outgoingQuery.data ?? EMPTY_LIST,
    loading: friendsQuery.isLoading || incomingQuery.isLoading || outgoingQuery.isLoading,
    sending: sendMutation.isPending,
    responding: acceptMutation.isPending || declineMutation.isPending,
    removing: removeMutation.isPending,
    error: friendsQuery.error || incomingQuery.error || outgoingQuery.error,
    sendRequest: sendMutation.mutateAsync,
    acceptRequest: acceptMutation.mutateAsync,
    declineRequest: declineMutation.mutateAsync,
    removeFriend: removeMutation.mutateAsync,
  };
};

export default useFriends;
