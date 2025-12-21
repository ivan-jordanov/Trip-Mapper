import { useState } from 'react';
import categoryService from '../services/categoryService';
import showError from '../modules/showError';
import showStatus from '../modules/showStatus';

const useCategories = () => {
  const [curCategory, setCurCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (error) {
    showError(error);
  }

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getById(id);
      setCurCategory(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const newCategory = await categoryService.create(categoryData);
      setCategories((prev) => [...prev, newCategory]);
      showStatus('Category created successfully');
      return newCategory;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await categoryService.delete(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      showStatus('Category deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    curCategory,
    loading,
    error,
    fetchCategories,
    fetchCategoryById,
    createCategory,
    deleteCategory,
  };
};

export default useCategories;
