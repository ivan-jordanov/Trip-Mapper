import axios from '../api/axios';

const usersService = {
  searchUsers: async (query) => {
    const response = await axios.get('/Users', { params: { search: query } });
    return response.data;
  },
};

export default usersService;