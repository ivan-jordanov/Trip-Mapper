import React, { createContext, useContext, useEffect, useRef } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from './AuthContext';
import usePresenceOnline from '../hooks/usePresenceOnline';

// Create React context for broad component tree access
const PresenceContext = createContext(null);

// Extracts domain origin from base API URL (e.g. "http://localhost:5000/api" -> "http://localhost:5000/hubs/presence")
const getHubUrl = () => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  return `${new URL(apiUrl).origin}/hubs/presence`;
};

const PresenceProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuthContext();
  const queryClient = useQueryClient();
  const connectionRef = useRef(null);

  const onlineUserIdsFromServer = usePresenceOnline(isAuthenticated);

  useEffect(() => {
    // If user logs out, tear down any existing connection and flush online user state
    if (!isAuthenticated) {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
      }
      queryClient.setQueryData(['presence-online'], []);
      return undefined;
    }

    // Initialize the SignalR WebSocket builder
    const connection = new HubConnectionBuilder()
      .withUrl(getHubUrl(), {
        // Pass JWT token to authenticate handshake on [Authorize] PresenceHub endpoint
        accessTokenFactory: () => localStorage.getItem('token') || '',
      })
      .withAutomaticReconnect() // Auto-reconnect on intermittent disconnects
      .configureLogging(LogLevel.Warning)
      .build();

    // Event listener: Server broadcasts "UserIsOnline" -> Add userId to React Query cache if not already present
    connection.on('UserIsOnline', (userId) => {
      queryClient.setQueryData(['presence-online'], (current = []) => (
        current.includes(userId) ? current : [...current, userId]
      ));
    });

    // Event listener: Server broadcasts "UserIsOffline" -> Filter out userId from React Query cache
    connection.on('UserIsOffline', (userId) => {
      queryClient.setQueryData(['presence-online'], (current = []) => (
        current.filter((id) => id !== userId)
      ));
    });

    // Event hooks reserved for custom reconnect/close handling if needed
    connection.onreconnecting(() => {});
    connection.onclose(() => {});
    
    connectionRef.current = connection;

    // Initiate connection to ASP.NET Core Hub
    connection.start().catch(() => {});

    // Cleanup: Unsubscribe handlers and disconnect socket when component unmounts or auth changes
    return () => {
      connection.off('UserIsOnline');
      connection.off('UserIsOffline');
      connection.stop().catch(() => {});
      if (connectionRef.current === connection) connectionRef.current = null;
    };
  }, [isAuthenticated, queryClient]);

  // Merge online query results with logged-in user ID (ensuring self is always counted as online locally)
  const onlineUserIds = isAuthenticated
    ? [...new Set([...onlineUserIdsFromServer, ...(user?.id != null ? [user.id] : [])])]
    : [];

  return (
    <PresenceContext.Provider value={{
      onlineUserIds,
      isOnline: (userId) => onlineUserIds.includes(userId), // Helper helper function for quick checks (e.g. isOnline(5))
      connectionState: connectionRef.current?.state,
    }}>
      {children}
    </PresenceContext.Provider>
  );
};

// Custom hook for consuming components
export const usePresence = () => {
  const context = useContext(PresenceContext);
  if (!context) throw new Error('usePresence must be used within a PresenceProvider');
  return context;
};

export default PresenceProvider;