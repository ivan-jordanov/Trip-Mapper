import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import categoryService from '../services/categoryService';
import showError from '../modules/showError';
import showStatus from '../modules/showStatus';

const getErrorMessage = (error) => error?.response?.data?.message || error?.message || 'Request failed.';
const EMPTY_CATEGORIES = [];

const useCategories = () => {
  const queryClient = useQueryClient();
  const [categoriesEnabled, setCategoriesEnabled] = useState(false);
  const [categoryId, setCategoryId] = useState(null);

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
    enabled: categoriesEnabled,
  });

  const categoryQuery = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => categoryService.getById(categoryId),
    enabled: categoryId !== null,
  });

  const createMutation = useMutation({
    mutationFn: (categoryData) => categoryService.create(categoryData),
    onSuccess: (created) => {
      const current = queryClient.getQueryData(['categories']);
      queryClient.setQueryData(['categories'], current ? [...current, created] : [created]);
      queryClient.invalidateQueries({ queryKey: ['categories'], refetchType: 'none' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryService.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['categories'], (current) => current
        ? current.filter((category) => category.id !== deletedId)
        : current);
      queryClient.invalidateQueries({ queryKey: ['categories'], refetchType: 'none' });
    },
  });

  const error = createMutation.error || deleteMutation.error || categoriesQuery.error || categoryQuery.error;
  const errorMessage = error ? getErrorMessage(error) : null;

  useEffect(() => {
    if (errorMessage) showError(errorMessage);
  }, [errorMessage]);

  const fetchCategories = async () => {
    setCategoriesEnabled(true);
    return queryClient.fetchQuery({ queryKey: ['categories'], queryFn: categoryService.getAll });
  };

  const fetchCategoryById = async (id) => {
    setCategoryId(id);
    try {
      return await queryClient.fetchQuery({
        queryKey: ['category', id],
        queryFn: () => categoryService.getById(id),
      });
    } catch {
      return null;
    }
  };

  const createCategory = async (categoryData) => {
    const created = await createMutation.mutateAsync(categoryData);
    showStatus('Category created successfully');
    return created;
  };

  const deleteCategory = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      showStatus('Category deleted successfully');
      return true;
    } catch {
      return false;
    }
  };

  return {
    categories: categoriesQuery.data ?? EMPTY_CATEGORIES,
    curCategory: categoryQuery.data || null,
    loading: (categoriesQuery.isFetching && !categoriesQuery.isError)
      || (categoryQuery.isFetching && !categoryQuery.isError)
      || createMutation.isPending || deleteMutation.isPending,
    error: errorMessage,
    fetchCategories,
    fetchCategoryById,
    createCategory,
    deleteCategory,
  };
};

export default useCategories;
