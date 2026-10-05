import { useQuery } from '@tanstack/react-query';
import configService from '../services/configService';

const useMapApiKey = () => {
  const query = useQuery({
    queryKey: ['map-api-key'],
    queryFn: configService.getMapApiKey,
    staleTime: Infinity,
  });

  return {
    apiKey: query.data || '',
    loading: query.isFetching,
    error: query.error,
  };
};

export default useMapApiKey;
