import { renderHook, act } from '@testing-library/react';
import useCategories from './useCategories';
import categoryService from '../services/categoryService';
import showStatus from '../modules/showStatus';

jest.mock('../services/categoryService', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock('../modules/showError', () => jest.fn());
jest.mock('../modules/showStatus', () => jest.fn());

describe('useCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches categories and updates state', async () => {
    const apiCategories = [
      { id: 1, name: 'Food', colorCode: '#ff0000' },
      { id: 2, name: 'Nature', colorCode: '#00ff00' },
    ];
    categoryService.getAll.mockResolvedValue(apiCategories);

    const { result } = renderHook(() => useCategories());

    await act(async () => {
      await result.current.fetchCategories();
    });

    expect(categoryService.getAll).toHaveBeenCalledTimes(1);
    expect(result.current.categories).toEqual(apiCategories);
    expect(result.current.loading).toBe(false);
  });

  it('creates a category, appends it and shows status', async () => {
    const newCategory = { id: 3, name: 'City', colorCode: '#228be6' };
    categoryService.create.mockResolvedValue(newCategory);

    const { result } = renderHook(() => useCategories());
    let created;

    await act(async () => {
      created = await result.current.createCategory({
        name: 'City',
        colorCode: '#228be6',
      });
    });

    expect(created).toEqual(newCategory);
    expect(result.current.categories).toEqual([newCategory]);
    expect(showStatus).toHaveBeenCalledWith('Category created successfully');
  });

  it('stores create errors and rethrows for callers', async () => {
    const createErr = new Error('Create failed');
    categoryService.create.mockRejectedValue(createErr);

    const { result } = renderHook(() => useCategories());
    let caught;

    await act(async () => {
      try {
        await result.current.createCategory({ name: 'Broken', colorCode: '#111111' });
      } catch (err) {
        caught = err;
      }
    });

    expect(caught).toBe(createErr);
    expect(result.current.error).toBe('Create failed');
    expect(result.current.loading).toBe(false);
  });

  it('deletes a category and keeps remaining ones', async () => {
    const initialCategories = [
      { id: 1, name: 'Food', colorCode: '#ff0000' },
      { id: 2, name: 'Nature', colorCode: '#00ff00' },
    ];
    categoryService.getAll.mockResolvedValue(initialCategories);
    categoryService.delete.mockResolvedValue({});

    const { result } = renderHook(() => useCategories());

    await act(async () => {
      await result.current.fetchCategories();
    });

    let deleted;
    await act(async () => {
      deleted = await result.current.deleteCategory(1);
    });

    expect(deleted).toBe(true);
    expect(categoryService.delete).toHaveBeenCalledWith(1);
    expect(result.current.categories).toEqual([
      { id: 2, name: 'Nature', colorCode: '#00ff00' },
    ]);
    expect(showStatus).toHaveBeenCalledWith('Category deleted successfully');
  });
});
