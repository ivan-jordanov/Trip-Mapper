import axios from '../api/axios';

const pinService = {
  getAll: async () => {
    const response = await axios.get('/pins');
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

  update: async (id, pinData) => {
    const response = await axios.put(`/pins/${id}`, pinData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/pins/${id}`);
    return response.data;
  },
};

export default pinService;
