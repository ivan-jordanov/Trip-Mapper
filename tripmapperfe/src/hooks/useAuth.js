import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import authService from '../services/authService';
import showError from '../modules/showError';
import showStatus from '../modules/showStatus';

const getErrorMessage = (error) => {
  const responseData = error?.response?.data;

  if (typeof responseData === 'string' && responseData.trim()) return responseData;
  if (typeof responseData?.message === 'string' && responseData.message.trim()) return responseData.message;
  return error?.message || 'Request failed.';
};

const useAuth = () => {
  const queryClient = useQueryClient();
  const [loggedOut, setLoggedOut] = useState(false);
  const [sessionInvalid, setSessionInvalid] = useState(false);
  const [userOverride, setUserOverride] = useState(undefined);
  const hasToken = Boolean(localStorage.getItem('token'));

  const userQuery = useQuery({
    queryKey: ['current-user'],
    queryFn: authService.getCurrentUser,
    enabled: hasToken && !sessionInvalid,
    retry: false,
  });

  const loginMutation = useMutation({ mutationFn: ({ username, password }) => authService.login(username, password) });
  const registerMutation = useMutation({ mutationFn: (userData) => authService.register(userData) });
  const updateMutation = useMutation({
    mutationFn: (accountData) => authService.updateCurrentUser(accountData),
    onSuccess: (updatedUser) => queryClient.setQueryData(['current-user'], updatedUser),
  });
  const passwordMutation = useMutation({ mutationFn: (passwordData) => authService.changePassword(passwordData) });

  const error = userQuery.error || loginMutation.error || registerMutation.error
    || updateMutation.error || passwordMutation.error;
  const errorMessage = error ? getErrorMessage(error) : null;

  useEffect(() => {
    if (userQuery.isError && userQuery.error?.response?.status === 401) {
      localStorage.removeItem('token');
      setSessionInvalid(true);
      setLoggedOut(true);
      queryClient.removeQueries({ queryKey: ['current-user'] });
    }
  }, [queryClient, userQuery.isError, userQuery.error]);

  useEffect(() => {
    if (errorMessage) showError(errorMessage);
  }, [errorMessage]);

  const fetchUser = async () => {
    if (!localStorage.getItem('token')) return null;
    try {
      return await queryClient.fetchQuery({
        queryKey: ['current-user'],
        queryFn: authService.getCurrentUser,
      });
    } catch {
      localStorage.removeItem('token');
      setSessionInvalid(true);
      setLoggedOut(true);
      queryClient.removeQueries({ queryKey: ['current-user'] });
      return null;
    }
  };

  const refreshUser = async () => fetchUser();

  const login = async (username, password) => {
    setLoggedOut(false);
    setSessionInvalid(false);
    setUserOverride(undefined);
    const response = await loginMutation.mutateAsync({ username, password });
    await fetchUser();
    showStatus('Login successful');
    return response;
  };

  const register = async (userData) => {
    setLoggedOut(false);
    setSessionInvalid(false);
    setUserOverride(undefined);
    const response = await registerMutation.mutateAsync(userData);
    await fetchUser();
    showStatus('Registration successful');
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setLoggedOut(true);
    queryClient.setQueryData(['current-user'], null);
    showStatus('Logged out successfully');
  };

  const updateAccount = async (accountData) => {
    const updatedUser = await updateMutation.mutateAsync(accountData);
    setUserOverride(updatedUser);
    queryClient.setQueryData(['current-user'], updatedUser);
    showStatus('Account updated successfully');
    return updatedUser;
  };

  const changePassword = async (passwordData) => {
    const response = await passwordMutation.mutateAsync(passwordData);
    showStatus('Password changed successfully');
    return response;
  };

  const loading = userQuery.isFetching || loginMutation.isPending || registerMutation.isPending
    || updateMutation.isPending || passwordMutation.isPending;

  return {
    user: loggedOut ? null : userOverride !== undefined ? userOverride : userQuery.data || null,
    loading,
    error: errorMessage,
    login,
    register,
    logout,
    refreshUser,
    updateAccount,
    changePassword,
    isAuthenticated: !loggedOut && Boolean(userQuery.data),
  };
};

export default useAuth;
