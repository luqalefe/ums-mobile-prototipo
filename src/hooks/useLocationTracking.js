import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { enviarPosicoes } from '../services/apiClient';
import SyncService from '../services/SyncService';
import { useNetwork } from '../contexts/NetworkContext';
import { PATRIMONIO_TABLET, GPS_INTERVAL_MS } from '../config';

/**
 * Hook customizado para gerenciar o rastreamento GPS e sincronização offline.
 * Refatorado para produção: evita sobreposição de capturas e garante integridade dos dados.
 */
export const useLocationTracking = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastLocation, setLastLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [rotaId, setRotaId] = useState(null);
  
  const { isOnline } = useNetwork();
  
  // Refs para valores mutáveis que precisam ser acessados dentro de callbacks sem recriá-los
  const timerRef = useRef(null);
  const isOnlineRef = useRef(isOnline);
  const rotaIdRef = useRef(rotaId);
  const isTrackingRef = useRef(false);

  // Sincronizar refs com estado
  useEffect(() => { isOnlineRef.current = isOnline; }, [isOnline]);
  useEffect(() => { rotaIdRef.current = rotaId; }, [rotaId]);

  // Atualizar contador de fila quando o componente monta e quando isTracking muda
  const refreshQueueCount = useCallback(async () => {
    const count = await SyncService.getQueueCount();
    setPendingCount(count);
  }, []);

  useEffect(() => {
    refreshQueueCount();
  }, [isTracking, refreshQueueCount]);

  // Sincronização automática ao voltar online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) { 
      syncNow(); 
    }
  }, [isOnline, pendingCount, isSyncing]);

  /**
   * Força a sincronização dos pacotes pendentes.
   */
  const syncNow = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const result = await SyncService.syncPending(rotaIdRef.current, (progress) => {
        // Log de progresso simplificado para auditoria
      });
      await refreshQueueCount();
      setLastError(null);
      return result;
    } catch (e) {
      console.error('[Sync] Erro na sincronização manual:', e);
      setLastError(`Erro na sincronização: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshQueueCount]);

  /**
   * Obtém a posição atual do GPS com precisão equilibrada para economizar bateria.
   */
  const getLocation = async () => {
    try {
      // Nota: Accuracy.Balanced é ideal para rastreamento contínuo em veículos
      const location = await Location.getCurrentPositionAsync({ 
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000 
      });
      return location;
    } catch (e) {
      console.warn('[Location] Falha ao obter posição:', e.message);
      throw e;
    }
  };

  /**
   * Loop recursivo de captura de posição.
   * Garante que uma captura termine (com sucesso ou falha) antes de agendar a próxima.
   */
  const captureLoop = async () => {
    if (!isTrackingRef.current) return;

    try {
      await capturePosition();
    } catch (e) {
      console.error('[Tracking] Erro no loop de captura:', e.message);
    } finally {
      // Agenda a próxima captura apenas após o término da atual
      if (isTrackingRef.current) {
        timerRef.current = setTimeout(captureLoop, GPS_INTERVAL_MS);
      }
    }
  };

  const capturePosition = async () => {
    try {
      const location = await getLocation();
      
      // SEGURANÇA: Bloqueio de posições simuladas (Mock Location)
      if (location.mocked) {
        console.warn('[Security] GPS Falso detectado. Posição ignorada.');
        setLastError('Atenção: GPS Falso detectado. Desative simuladores para rastrear.');
        return;
      }
      
      const timestamp = new Date().toISOString();
      const payload = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: timestamp,
      };

      // Atualiza UI local
      const displayPayload = {
        ...payload,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
        patrimonio_tablet: PATRIMONIO_TABLET,
      };
      setLastLocation(displayPayload);
      setLocationHistory(prev => [...prev.slice(-49), displayPayload]);

      // Lógica de envio/offline
      if (isOnlineRef.current) {
        try {
          await enviarPosicoes(PATRIMONIO_TABLET, rotaIdRef.current, [payload]);
          setLastError(null);
        } catch (e) {
          console.warn('[Tracking] Falha no envio imediato, enfileirando...', e.message);
          await SyncService.enqueue(payload, rotaIdRef.current);
          await refreshQueueCount();
        }
      } else {
        await SyncService.enqueue(payload, rotaIdRef.current);
        await refreshQueueCount();
      }
    } catch (e) {
      setLastError(`GPS: ${e.message}`);
      throw e;
    }
  };

  const startTracking = async () => {
    if (isTracking) return;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLastError('Permissão de GPS negada.');
        return;
      }

      setIsTracking(true);
      isTrackingRef.current = true;
      setLastError(null);

      // Inicia o loop recursivo
      captureLoop();
      
    } catch (e) {
      console.error('[Tracking] Erro ao iniciar:', e.message);
      setLastError('Erro ao solicitar permissão de GPS.');
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
    isTrackingRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      isTrackingRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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
    rotaId, 
    setRotaId,
    useMockLocation: false, // Produção: sempre GPS real
  };
};
