import axios from '../api/axios';

const categoryService = {
  getAll: async () => {
    const response = await axios.get('/categories');
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`/categories/${id}`);
    return response.data;
  },

  create: async (categoryData) => {
    const response = await axios.post('/categories', categoryData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
