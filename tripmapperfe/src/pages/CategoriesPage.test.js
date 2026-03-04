import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import CategoriesPage from './CategoriesPage';
import useCategories from '../hooks/useCategories';
import showError from '../modules/showError';

jest.mock('../hooks/useCategories', () => jest.fn());
jest.mock('../modules/showError', () => jest.fn());

jest.mock('@mantine/hooks', () => {
  const actual = jest.requireActual('@mantine/hooks');
  return {
    ...actual,
    useMediaQuery: jest.fn(() => false),
  };
});

let mockLatestFormProps;

jest.mock('../components/categories/CategoryForm', () => {
  const React = require('react');

  return function MockCategoryForm(props) {
    mockLatestFormProps = props;

    return (
      <div>
        <button type="button" onClick={() => props.setName('Food')}>
          set-name
        </button>
        <button type="button" onClick={() => props.setColor('#ff0000')}>
          set-color
        </button>
        <button
          type="button"
          onClick={() => props.handleSubmit({ preventDefault: jest.fn() })}
        >
          submit-form
        </button>
      </div>
    );
  };
});

jest.mock('../components/categories/CategoryList', () => {
  const React = require('react');

  return function MockCategoryList({ categories, onDelete }) {
    return (
      <div>
        <span data-testid="category-count">{categories.length}</span>
        <button type="button" onClick={() => onDelete(5)}>
          delete-5
        </button>
      </div>
    );
  };
});

describe('CategoriesPage', () => {
  let createCategoryMock;
  let fetchCategoriesMock;
  let deleteCategoryMock;

  const renderPage = () =>
    render(
      <MantineProvider>
        <CategoriesPage />
      </MantineProvider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
    mockLatestFormProps = null;

    createCategoryMock = jest.fn().mockResolvedValue({ id: 11, name: 'Food' });
    fetchCategoriesMock = jest.fn().mockResolvedValue([]);
    deleteCategoryMock = jest.fn().mockResolvedValue(true);

    useCategories.mockReturnValue({
      categories: [{ id: 1, name: 'Sample', colorCode: '#228be6', isDefault: false }],
      loading: false,
      createCategory: createCategoryMock,
      fetchCategories: fetchCategoriesMock,
      deleteCategory: deleteCategoryMock,
    });
  });

  it('fetches categories on mount', () => {
    renderPage();

    expect(fetchCategoriesMock).toHaveBeenCalledTimes(1);
  });

  it('submits new category payload and resets form state', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'set-name' }));
    fireEvent.click(screen.getByRole('button', { name: 'set-color' }));
    fireEvent.click(screen.getByRole('button', { name: 'submit-form' }));

    await waitFor(() => {
      expect(createCategoryMock).toHaveBeenCalledWith({
        name: 'Food',
        colorCode: '#ff0000',
      });
    });

    await waitFor(() => {
      expect(mockLatestFormProps.name).toBe('');
      expect(mockLatestFormProps.color).toBe('#228be6');
    });
  });

  it('shows API error when create fails', async () => {
    createCategoryMock.mockRejectedValue({
      response: { data: { message: 'Create category failed' } },
      message: 'Fallback message',
    });

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'submit-form' }));

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith('Create category failed');
    });
  });

  it('refetches categories after successful delete', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'delete-5' }));

    await waitFor(() => {
      expect(deleteCategoryMock).toHaveBeenCalledWith(5);
      expect(fetchCategoriesMock).toHaveBeenCalledTimes(2);
    });
  });
});
