import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import apiMock from '../services/apiMock';
import { enviarPosicoes } from '../services/apiClient';
import SyncService from '../services/SyncService';
import { useNetwork } from '../contexts/NetworkContext';
import { getMockPosition } from '../data/mockRoutes';
import { PATRIMONIO_TABLET, GPS_INTERVAL_MS, USE_MOCK_API } from '../config';

export const useLocationTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastLocation, setLastLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [useMockLocation, setUseMockLocation] = useState(false);
  const [rotaId, setRotaId] = useState(null);
  const { isOnline } = useNetwork();
  const timerRef = useRef(null);
  const isOnlineRef = useRef(isOnline);

  useEffect(() => { isOnlineRef.current = isOnline; }, [isOnline]);

  useEffect(() => {
    const updateCount = async () => {
      const count = await SyncService.getQueueCount();
      setPendingCount(count);
    };
    updateCount();
    const interval = setInterval(updateCount, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOnline && pendingCount > 0) { syncNow(); }
  }, [isOnline]);

  const syncNow = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await SyncService.syncPending(rotaId, (progress) => {
        console.log('[Sync] ' + progress.percent + '% (' + progress.synced + ' ok, ' + progress.failed + ' falhas)');
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
  }, [isSyncing, rotaId]);

  const getLocation = async () => {
    if (useMockLocation) { return getMockPosition(); }
    try {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
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
        console.warn('[Location] Permissao negada, usando mock');
        setUseMockLocation(true);
      }
    } catch (e) {
      console.warn('[Location] Erro de permissao, usando mock:', e.message);
      setUseMockLocation(true);
    }
    setIsTracking(true);
    setLastError(null);
    await capturePosition();
    timerRef.current = setInterval(capturePosition, GPS_INTERVAL_MS);
  };

  const capturePosition = async () => {
    try {
      const location = await getLocation();
      const displayPayload = {
        patrimonio_tablet: PATRIMONIO_TABLET,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
        timestamp: new Date().toISOString(),
      };
      setLastLocation(displayPayload);
      setLocationHistory(prev => [...prev.slice(-49), displayPayload]);

      const apiPosicao = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(),
      };

      if (isOnlineRef.current) {
        try {
          if (USE_MOCK_API) {
            await apiMock.post('/gps/posicao', {
              patrimonio_tablet: PATRIMONIO_TABLET,
              rota_id: rotaId,
              posicoes: [apiPosicao],
            });
          } else {
            await enviarPosicoes(PATRIMONIO_TABLET, rotaId, [apiPosicao]);
          }
        } catch (e) {
          await SyncService.enqueue(apiPosicao);
          const count = await SyncService.getQueueCount();
          setPendingCount(count);
        }
      } else {
        await SyncService.enqueue(apiPosicao);
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
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsTracking(false);
  };

  return {
    isTracking, startTracking, stopTracking,
    pendingCount, lastLocation, locationHistory,
    isSyncing, syncNow, lastError, useMockLocation,
    rotaId, setRotaId,
  };
};
