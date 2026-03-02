import { useState, useEffect } from 'react';
import authService from '../services/authService';
import showError from '../modules/showError';
import showStatus from '../modules/showStatus';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (error) {
      showError(error);
  }
  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        setError(err.message);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refreshUser = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchUser();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await authService.login(username, password);
      fetchUser();
      showStatus('Login successful');
      return userData;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      fetchUser();
      showStatus('Registration successful');
      return response;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    showStatus('Logged out successfully');
    setUser(null);
  };

  const updateAccount = async (accountData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await authService.updateCurrentUser(accountData);
      setUser(updatedUser);
      showStatus('Account updated successfully');
      return updatedUser;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    updateAccount,
    isAuthenticated: !!user,
  };
};

export default useAuth;
