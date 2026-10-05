import { useQuery } from '@tanstack/react-query';
import usersService from '../services/usersService';

const useUserSearch = (searchText) => {
  const query = useQuery({
    queryKey: ['user-search', searchText.trim()],
    queryFn: () => usersService.searchUsers(searchText.trim()),
    enabled: searchText.trim().length >= 2,
  });

  return {
    users: query.data || [],
    loading: query.isFetching,
    error: query.error,
  };
};

export default useUserSearch;
