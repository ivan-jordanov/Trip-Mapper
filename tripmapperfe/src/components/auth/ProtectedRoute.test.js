import React from 'react';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import { useAuthContext } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

jest.mock('../../context/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock(
  'react-router-dom',
  () => ({
    Navigate: ({ to, replace, state }) => (
      <div
        data-testid="navigate"
        data-to={to}
        data-replace={String(replace)}
        data-from-pathname={state?.from?.pathname || ''}
      />
    ),
    useLocation: jest.fn(() => ({ pathname: '/private-area' })),
  }),
  { virtual: true }
);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLocation.mockReturnValue({ pathname: '/private-area' });
  });

  it('renders nothing while auth is loading', () => {
    useAuthContext.mockReturnValue({ isAuthenticated: false, loading: true });

    const { container } = render(
      <ProtectedRoute>
        <div>Private Content</div>
      </ProtectedRoute>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('redirects unauthenticated users to login and preserves location', () => {
    useAuthContext.mockReturnValue({ isAuthenticated: false, loading: false });

    render(
      <ProtectedRoute>
        <div>Private Content</div>
      </ProtectedRoute>
    );

    const navigate = screen.getByTestId('navigate');
    expect(navigate).toHaveAttribute('data-to', '/login');
    expect(navigate).toHaveAttribute('data-replace', 'true');
    expect(navigate).toHaveAttribute('data-from-pathname', '/private-area');
  });

  it('renders children for authenticated users', () => {
    useAuthContext.mockReturnValue({ isAuthenticated: true, loading: false });

    render(
      <ProtectedRoute>
        <div>Private Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Private Content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });
});
