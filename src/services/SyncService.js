import AsyncStorage from '@react-native-async-storage/async-storage';
import apiMock from './apiMock';

const SYNC_KEY = '@gps_queue';
const HISTORY_KEY = '@sync_history';

const SyncService = {
  // Adicionar à fila offline
  enqueue: async (payload) => {
    try {
      const existing = await AsyncStorage.getItem(SYNC_KEY);
      const queue = existing ? JSON.parse(existing) : [];
      queue.push({ ...payload, queuedAt: new Date().toISOString() });
      await AsyncStorage.setItem(SYNC_KEY, JSON.stringify(queue));
      console.log(`[SyncService] ✅ Enfileirado offline (total: ${queue.length}):`, payload);
      return queue.length;
    } catch (e) {
      console.error('[SyncService] Erro ao enfileirar', e);
      return -1;
    }
  },

  // Tamanho da fila
  getQueueCount: async () => {
    try {
      const existing = await AsyncStorage.getItem(SYNC_KEY);
      return existing ? JSON.parse(existing).length : 0;
    } catch (e) {
      return 0;
    }
  },

  // Obter itens da fila
  getQueue: async () => {
    try {
      const existing = await AsyncStorage.getItem(SYNC_KEY);
      return existing ? JSON.parse(existing) : [];
    } catch (e) {
      return [];
    }
  },

  // Sincronizar com callback de progresso
  syncPending: async (onProgress) => {
    try {
      const existing = await AsyncStorage.getItem(SYNC_KEY);
      if (!existing) return { synced: 0, failed: 0 };

      const queue = JSON.parse(existing);
      if (queue.length === 0) return { synced: 0, failed: 0 };

      console.log(`[SyncService] 🔄 Sincronizando ${queue.length} itens...`);

      let synced = 0;
      let failed = 0;
      const failedItems = [];

      for (let i = 0; i < queue.length; i++) {
        try {
          const response = await apiMock.post('/sync', { data: queue[i] });
          if (response.status === 200) {
            synced++;
            // Salvar no histórico
            await SyncService._addToHistory(queue[i], 'success');
          }
        } catch (err) {
          failed++;
          failedItems.push(queue[i]);
          await SyncService._addToHistory(queue[i], 'failed');
        }

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: queue.length,
            synced,
            failed,
            percent: Math.round(((i + 1) / queue.length) * 100),
          });
        }
      }

      // Manter apenas os que falharam na fila
      if (failedItems.length > 0) {
        await AsyncStorage.setItem(SYNC_KEY, JSON.stringify(failedItems));
      } else {
        await AsyncStorage.removeItem(SYNC_KEY);
      }

      console.log(`[SyncService] ✅ Sync completo — ${synced} enviados, ${failed} falharam`);
      return { synced, failed };
    } catch (e) {
      console.error('[SyncService] ❌ Sync falhou', e);
      return { synced: 0, failed: -1 };
    }
  },

  // Histórico de sincronizações
  getHistory: async (limit = 50) => {
    try {
      const history = await AsyncStorage.getItem(HISTORY_KEY);
      const items = history ? JSON.parse(history) : [];
      return items.slice(-limit).reverse();
    } catch (e) {
      return [];
    }
  },

  // Limpar histórico
  clearHistory: async () => {
    await AsyncStorage.removeItem(HISTORY_KEY);
  },

  // Método interno para adicionar ao histórico
  _addToHistory: async (item, status) => {
    try {
      const existing = await AsyncStorage.getItem(HISTORY_KEY);
      const history = existing ? JSON.parse(existing) : [];
      history.push({
        ...item,
        syncStatus: status,
        syncedAt: new Date().toISOString(),
      });
      // Manter últimas 200 entradas
      const trimmed = history.slice(-200);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch (e) {
      // silencioso
    }
  },
};

export default SyncService;
