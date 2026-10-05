import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../context/AuthContext';
import friendService from '../services/friendService';

const EMPTY_LIST = [];

const useFriendSearch = (searchText) => {
  const { user, isAuthenticated } = useAuthContext();
  const userId = user?.id ?? null;
  const hasSearch = Boolean(searchText?.trim());
  const friendsQuery = useQuery({
    queryKey: ['friends-search', userId],
    queryFn: friendService.getFriends,
    enabled: isAuthenticated && userId !== null && hasSearch,
  });
  const normalizedSearch = searchText?.trim().toLowerCase() || '';
  const friends = hasSearch
    ? (friendsQuery.data ?? EMPTY_LIST).filter((friend) =>
      friend.username.toLowerCase().includes(normalizedSearch)
    )
    : EMPTY_LIST;

  return {
    friends,
    loading: friendsQuery.isFetching,
  };
};

export default useFriendSearch;
