import { renderHook, act, waitFor } from '@testing-library/react';
import useAuth from './useAuth';
import authService from '../services/authService';
import showStatus from '../modules/showStatus';

jest.mock('../services/authService', () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    updateCurrentUser: jest.fn(),
  },
}));
jest.mock('../modules/showError', () => jest.fn());
jest.mock('../modules/showStatus', () => jest.fn());

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('finishes initial load with no token', async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(authService.getCurrentUser).not.toHaveBeenCalled();
  });

  it('loads current user on mount when token exists', async () => {
    const user = { id: 7, username: 'ivanj' };
    localStorage.setItem('token', 'fake-token');
    authService.getCurrentUser.mockResolvedValue(user);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.user).toEqual(user);
    });

    expect(authService.getCurrentUser).toHaveBeenCalledTimes(1);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('logs in successfully and returns service payload', async () => {
    const loginResponse = { token: 'abc123' };
    authService.login.mockResolvedValue(loginResponse);

    const { result } = renderHook(() => useAuth());
    let response;

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      response = await result.current.login('ivanj', 'password123');
    });

    expect(response).toEqual(loginResponse);
    expect(authService.login).toHaveBeenCalledWith('ivanj', 'password123');
    expect(showStatus).toHaveBeenCalledWith('Login successful');
  });

  it('clears user and calls status on logout', async () => {
    localStorage.setItem('token', 'fake-token');
    authService.getCurrentUser.mockResolvedValue({ id: 1, username: 'ivanj' });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toEqual({ id: 1, username: 'ivanj' });
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(authService.logout).toHaveBeenCalledTimes(1);
    expect(result.current.user).toBeNull();
    expect(showStatus).toHaveBeenCalledWith('Logged out successfully');
  });

  it('updates account and persists updated user in state', async () => {
    const initialUser = { id: 1, username: 'ivanj' };
    const updatedUser = { id: 1, username: 'ivanj-updated' };
    localStorage.setItem('token', 'fake-token');
    authService.getCurrentUser.mockResolvedValue(initialUser);
    authService.updateCurrentUser.mockResolvedValue(updatedUser);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toEqual(initialUser);
    });

    let response;
    await act(async () => {
      response = await result.current.updateAccount({ username: 'ivanj-updated' });
    });

    expect(response).toEqual(updatedUser);
    expect(authService.updateCurrentUser).toHaveBeenCalledWith({ username: 'ivanj-updated' });
    expect(result.current.user).toEqual(updatedUser);
    expect(showStatus).toHaveBeenCalledWith('Account updated successfully');
  });
});
