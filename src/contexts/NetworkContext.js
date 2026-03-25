import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';

const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [forceOffline, setForceOffline] = useState(false);
  const [stats, setStats] = useState({
    reconnections: 0,
    lastOnline: null,
    lastOffline: null,
    offlineDuration: 0,
  });
  const offlineStartRef = useRef(null);
  const prevOnlineRef = useRef(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const realOnline = !!state.isConnected && !!state.isInternetReachable;
      const effectiveOnline = !forceOffline && realOnline;
      setIsOnline(effectiveOnline);
    });

    return () => unsubscribe();
  }, [forceOffline]);

  // Rastrear estatísticas de conexão
  useEffect(() => {
    if (!isOnline && prevOnlineRef.current) {
      // Ficou offline
      offlineStartRef.current = Date.now();
      setStats(prev => ({ ...prev, lastOffline: new Date().toISOString() }));
    } else if (isOnline && !prevOnlineRef.current) {
      // Voltou online
      const duration = offlineStartRef.current
        ? Math.round((Date.now() - offlineStartRef.current) / 1000)
        : 0;
      setStats(prev => ({
        ...prev,
        reconnections: prev.reconnections + 1,
        lastOnline: new Date().toISOString(),
        offlineDuration: prev.offlineDuration + duration,
      }));
      offlineStartRef.current = null;
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  const toggleForceOffline = () => {
    setForceOffline(prev => {
      const next = !prev;
      if (next) {
        setIsOnline(false);
      }
      return next;
    });
  };

  return (
    <NetworkContext.Provider value={{ isOnline, forceOffline, toggleForceOffline, stats }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
