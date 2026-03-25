import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import apiMock from '../services/apiMock';
import SyncService from '../services/SyncService';
import { useNetwork } from '../contexts/NetworkContext';
import { getMockPosition } from '../data/mockRoutes';

const INTERVAL_MS = 10000; // 10 segundos

export const useLocationTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastLocation, setLastLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [useMockLocation, setUseMockLocation] = useState(false);
  const { isOnline } = useNetwork();
  const timerRef = useRef(null);
  const isOnlineRef = useRef(isOnline);

  // Manter ref atualizada
  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  // Atualizar contador de pendentes
  useEffect(() => {
    const updateCount = async () => {
      const count = await SyncService.getQueueCount();
      setPendingCount(count);
    };
    updateCount();
    const interval = setInterval(updateCount, 2000);
    return () => clearInterval(interval);
  }, []);

  // Sync automático quando volta online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      syncNow();
    }
  }, [isOnline]);

  const syncNow = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await SyncService.syncPending((progress) => {
        console.log(`[Sync] ${progress.percent}% (${progress.synced} ok, ${progress.failed} falhas)`);
      });
      const remaining = await SyncService.getQueueCount();
      setPendingCount(remaining);
      setLastError(null);
      return result;
    } catch (e) {
      setLastError(e.message);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  const getLocation = async () => {
    if (useMockLocation) {
      return getMockPosition();
    }
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return location;
    } catch (e) {
      console.warn('[Location] Fallback para mock:', e.message);
      setUseMockLocation(true);
      return getMockPosition();
    }
  };

  const startTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('[Location] Permissão negada, usando mock');
        setUseMockLocation(true);
      }
    } catch (e) {
      console.warn('[Location] Erro de permissão, usando mock:', e.message);
      setUseMockLocation(true);
    }

    setIsTracking(true);
    setLastError(null);

    // Capturar primeira posição imediatamente
    await capturePosition();

    timerRef.current = setInterval(capturePosition, INTERVAL_MS);
  };

  const capturePosition = async () => {
    try {
      const location = await getLocation();
      const payload = {
        id_patrimonio: 'TB-001',
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
        timestamp: new Date().toISOString(),
      };

      setLastLocation(payload);
      setLocationHistory(prev => [...prev.slice(-49), payload]); // Manter últimos 50

      if (isOnlineRef.current) {
        try {
          await apiMock.post('/tracking', payload);
        } catch (e) {
          // Se falha online, enfileirar
          await SyncService.enqueue(payload);
          const count = await SyncService.getQueueCount();
          setPendingCount(count);
        }
      } else {
        await SyncService.enqueue(payload);
        const count = await SyncService.getQueueCount();
        setPendingCount(count);
      }

      setLastError(null);
    } catch (e) {
      console.error('[Tracking] Erro:', e);
      setLastError(e.message);
    }
  };

  const stopTracking = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTracking(false);
  };

  return {
    isTracking,
    startTracking,
    stopTracking,
    pendingCount,
    lastLocation,
    locationHistory,
    isSyncing,
    syncNow,
    lastError,
    useMockLocation,
  };
};
