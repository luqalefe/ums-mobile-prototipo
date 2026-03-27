import AsyncStorage from '@react-native-async-storage/async-storage';
import { enviarPosicoes } from './apiClient';
import { PATRIMONIO_TABLET } from '../config';

const SYNC_KEY = '@gps_queue';
const HISTORY_KEY = '@sync_history';

const SyncService = {
  enqueue: async (posicao) => {
    try {
      const existing = await AsyncStorage.getItem(SYNC_KEY);
      const queue = existing ? JSON.parse(existing) : [];
      queue.push({
        latitude: posicao.latitude,
        longitude: posicao.longitude,
        timestamp: posicao.timestamp,
      });
      await AsyncStorage.setItem(SYNC_KEY, JSON.stringify(queue));
      console.log('[SyncService] Enfileirado offline (total: ' + queue.length + ')');
      return queue.length;
    } catch (e) {
      console.error('[SyncService] Erro ao enfileirar', e);
      return -1;
    }
  },

  getQueueCount: async () => {
    try {
      const existing = await AsyncStorage.getItem(SYNC_KEY);
      return existing ? JSON.parse(existing).length : 0;
    } catch (e) {
      return 0;
    }
  },

  getQueue: async () => {
    try {
      const existing = await AsyncStorage.getItem(SYNC_KEY);
      return existing ? JSON.parse(existing) : [];
    } catch (e) {
      return [];
    }
  },

  syncPending: async (rotaId, onProgress) => {
    if (rotaId === undefined) rotaId = null;
    try {
      const existing = await AsyncStorage.getItem(SYNC_KEY);
      if (!existing) return { synced: 0, failed: 0 };
      const queue = JSON.parse(existing);
      if (queue.length === 0) return { synced: 0, failed: 0 };

      console.log('[SyncService] Sincronizando ' + queue.length + ' posicoes em batch...');

      if (onProgress) {
        onProgress({ current: 0, total: queue.length, synced: 0, failed: 0, percent: 0 });
      }

      try {
        await enviarPosicoes(PATRIMONIO_TABLET, rotaId, queue);

        await AsyncStorage.removeItem(SYNC_KEY);
        await SyncService._addToHistory({ type: 'batch', count: queue.length, rotaId }, 'success');

        if (onProgress) {
          onProgress({ current: queue.length, total: queue.length, synced: queue.length, failed: 0, percent: 100 });
        }
        console.log('[SyncService] Batch enviado — ' + queue.length + ' posicoes sincronizadas');
        return { synced: queue.length, failed: 0 };

      } catch (err) {
        console.error('[SyncService] Batch falhou:', err.message);
        await SyncService._addToHistory({ type: 'batch', count: queue.length, rotaId, error: err.message }, 'failed');
        if (onProgress) {
          onProgress({ current: queue.length, total: queue.length, synced: 0, failed: queue.length, percent: 100 });
        }
        return { synced: 0, failed: queue.length };
      }

    } catch (e) {
      console.error('[SyncService] Sync falhou', e);
      return { synced: 0, failed: -1 };
    }
  },

  getHistory: async (limit) => {
    if (!limit) limit = 50;
    try {
      const history = await AsyncStorage.getItem(HISTORY_KEY);
      const items = history ? JSON.parse(history) : [];
      return items.slice(-limit).reverse();
    } catch (e) {
      return [];
    }
  },

  clearHistory: async () => {
    await AsyncStorage.removeItem(HISTORY_KEY);
  },

  _addToHistory: async (item, status) => {
    try {
      const existing = await AsyncStorage.getItem(HISTORY_KEY);
      const history = existing ? JSON.parse(existing) : [];
      history.push({
        ...item,
        syncStatus: status,
        syncedAt: new Date().toISOString(),
      });
      const trimmed = history.slice(-200);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch (e) {
      // silencioso
    }
  },
};

export default SyncService;
