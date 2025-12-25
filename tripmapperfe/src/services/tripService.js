import axios from '../api/axios';

const tripService = {
  getAll: async (title, dateFrom, dateVisited) => {
    // Note: dateVisited parameter is not used in backend yet
    const response = await axios.get('/Trips', {
      params: {
        title, dateFrom },
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/Trips/${id}`);
    return response.data;
  },

  getAccess: async (id) => {
    const response = await axios.get(`/Trips/${id}/access`);
    return response.data;
  },

  create: async (tripData) => {
    const response = await axios.post('/Trips', tripData);
    return response.data;
  },

  update: async (id, tripData) => {
    const response = await axios.put(`/Trips/${id}`, tripData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/Trips/${id}`);
    return response.data;
  },
};

export default tripService;
