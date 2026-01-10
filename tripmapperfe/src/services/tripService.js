import axios from '../api/axios';

const tripService = {
  getAll: async (title, dateFrom, dateTo, page, pageSize) => {
    const params = {};
    if (title && title.trim()) params.title = title.trim();
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    
    const response = await axios.get('/Trips', { params });
    return response.data;
  },

  getCount: async (title, dateFrom, dateTo) => {
    const params = {};
    if (title && title.trim()) params.title = title.trim();
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    const response = await axios.get('/Trips/count', { params });
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

  delete: async (id, rowVersion) => {
    const response = await axios.delete(`/Trips/${id}`, { params: { rowVersion: rowVersion } });
    return response.data;
  },
};

export default tripService;
