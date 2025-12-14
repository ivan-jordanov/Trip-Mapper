import axios from '../api/axios';

const tripService = {
  getAll: async () => {
    const response = await axios.get('/trips');
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/trips/${id}`);
    return response.data;
  },

  create: async (tripData) => {
    const response = await axios.post('/trips', tripData);
    return response.data;
  },

  update: async (id, tripData) => {
    const response = await axios.put(`/trips/${id}`, tripData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/trips/${id}`);
    return response.data;
  },
};

export default tripService;
