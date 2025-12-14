import axios from '../api/axios';

const pinService = {
  getAll: async (title, visitedFrom, createdFrom, category) => {
    const response = await axios.get('/pins', {
      params: {
        title, visitedFrom, createdFrom, category },
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/pins/${id}`);
    return response.data;
  },

  create: async (pinData) => {
    const response = await axios.post('/pins', pinData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/pins/${id}`);
    return response.data;
  },
};

export default pinService;
