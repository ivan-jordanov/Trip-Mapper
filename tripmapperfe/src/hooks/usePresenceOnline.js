import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';

const usePresenceOnline = (enabled) => {
  const query = useQuery({
    queryKey: ['presence-online'],
    queryFn: async () => (await axios.get('/Presence/online')).data.userIds || [],
    enabled,
    staleTime: 30 * 1000,
  });

  return query.data || [];
};

export default usePresenceOnline;
