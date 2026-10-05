import { useQuery } from '@tanstack/react-query';
import pinService from '../services/pinService';

const usePinSearch = (searchText) => {
  const query = useQuery({
    queryKey: ['pin-search', searchText.trim()],
    queryFn: () => pinService.searchPins(searchText.trim()),
    enabled: searchText.trim().length >= 2,
  });

  return {
    pins: query.data || [],
    loading: query.isFetching,
    error: query.error,
  };
};

export default usePinSearch;
