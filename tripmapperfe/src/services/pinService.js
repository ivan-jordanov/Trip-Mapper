import axios from '../api/axios';

const pinService = {
  getAll: async (title, visitedFrom, createdFrom, category, page, pageSize) => {
    const response = await axios.get('/Pins', {
      params: {
        title, visitedFrom, createdFrom, category, page, pageSize },
    });
    return response.data;
  },

  getCount: async (title, visitedFrom, createdFrom, category) => {
    const response = await axios.get('/Pins/count', {
      params: {
        title, visitedFrom, createdFrom, category },
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/Pins/${id}`);
    return response.data;
  },

  create: async (pinData) => {
    const response = await axios.post('/Pins', pinData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/Pins/${id}`);
    return response.data;
  },
};

export default pinService;
