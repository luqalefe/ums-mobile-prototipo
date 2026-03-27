import AsyncStorage from '@react-native-async-storage/async-storage';
import { enviarPosicoes } from './apiClient';
import { PATRIMONIO_TABLET } from '../config';

const SYNC_KEY = '@gps_queue';
const HISTORY_KEY = '@sync_history';
const CHUNK_SIZE = 50; // Enviar no máximo 50 posições por vez

// Lock simples para evitar condições de corrida entre enqueue e sync
let isProcessing = false;

const SyncService = {
  /**
   * Enfileira uma posição para envio posterior.
   * Agora inclui o rotaId para garantir que o ponto seja vinculado à rota correta mesmo offline.
   */
  enqueue: async (posicao, rotaId = null) => {
    // Aguarda se estiver processando para evitar leitura de dado sujo
    if (isProcessing) {
      // Pequeno delay e tenta novamente uma vez
      await new Promise(r => setTimeout(r, 100));
    }

    try {
      const existing = await AsyncStorage.getItem(SYNC_KEY);
      const queue = existing ? JSON.parse(existing) : [];
      
      queue.push({
        latitude: posicao.latitude,
        longitude: posicao.longitude,
        timestamp: posicao.timestamp,
        rota_id: rotaId, // Salva a rota ativa no momento da captura
      });

      await AsyncStorage.setItem(SYNC_KEY, JSON.stringify(queue));
      console.log(`[SyncService] Enfileirado offline (total: ${queue.length}) | Rota: ${rotaId}`);
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

  /**
   * Sincroniza posições pendentes em lotes (chunks).
   * Não apaga a fila inteira; remove apenas o que foi confirmado pelo servidor.
   */
  syncPending: async (currentRotaId, onProgress) => {
    if (isProcessing) return { synced: 0, failed: 0 };
    isProcessing = true;

    try {
      const existing = await AsyncStorage.getItem(SYNC_KEY);
      if (!existing) {
        isProcessing = false;
        return { synced: 0, failed: 0 };
      }

      let queue = JSON.parse(existing);
      if (queue.length === 0) {
        isProcessing = false;
        return { synced: 0, failed: 0 };
      }

      const totalItems = queue.length;
      let totalSynced = 0;
      let totalFailed = 0;

      console.log(`[SyncService] Sincronizando ${totalItems} posicoes em chunks de ${CHUNK_SIZE}...`);

      // Processar em chunks
      while (queue.length > 0) {
        const chunk = queue.slice(0, CHUNK_SIZE);
        
        // Agrupar por rota_id dentro do chunk (conforme api_gps_mobile.md, cada POST leva um rota_id principal)
        // Se houver múltiplas rotas no chunk, pegamos a do primeiro item ou a informada
        const chunkRotaId = chunk[0].rota_id || currentRotaId;

        try {
          await enviarPosicoes(PATRIMONIO_TABLET, chunkRotaId, chunk);
          
          // Sucesso: Remove este chunk da fila original
          queue = queue.slice(chunk.length);
          totalSynced += chunk.length;
          
          // Atualiza o storage imediatamente após cada chunk bem sucedido
          await AsyncStorage.setItem(SYNC_KEY, JSON.stringify(queue));

          if (onProgress) {
            onProgress({ 
              current: totalSynced, 
              total: totalItems, 
              synced: totalSynced, 
              failed: totalFailed, 
              percent: Math.round((totalSynced / totalItems) * 100) 
            });
          }
        } catch (err) {
          console.error(`[SyncService] Chunk falhou: ${err.message}`);
          totalFailed = totalItems - totalSynced;
          await SyncService._addToHistory({ 
            type: 'chunk_fail', 
            count: chunk.length, 
            error: err.message 
          }, 'failed');
          break; // Para o processamento se um chunk falhar
        }
      }

      if (totalSynced > 0) {
        await SyncService._addToHistory({ 
          type: 'batch_partial', 
          count: totalSynced, 
          status: totalFailed > 0 ? 'partial' : 'success' 
        }, totalFailed > 0 ? 'warning' : 'success');
      }

      isProcessing = false;
      return { synced: totalSynced, failed: totalFailed };

    } catch (e) {
      console.error('[SyncService] Sync crítico falhou', e);
      isProcessing = false;
      return { synced: 0, failed: -1 };
    }
  },

  getHistory: async (limit = 50) => {
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
