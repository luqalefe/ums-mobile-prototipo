/**
 * Serviço de Sincronização (SyncService)
 * Gerencia a fila offline de posições GPS utilizando armazenamento seguro (criptografado).
 * Segue o padrão Wi-Fi First: armazena localmente em falhas e sincroniza quando online.
 */
import * as SecureStore from 'expo-secure-store';
import { enviarPosicoes } from './apiClient';
import { PATRIMONIO_TABLET } from '../config';

const SYNC_KEY = 'gps_queue_secure';
const HISTORY_KEY = 'sync_history_secure';
const CHUNK_SIZE = 50; // Limite de posições por lote de envio (conforme api_gps_mobile.md)

// Lock para evitar condições de corrida em operações assíncronas
let isProcessing = false;

/**
 * Helper para persistência segura
 */
const saveSecure = async (key, data) => {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(data));
  } catch (e) {
    console.error(`[SyncService] Erro ao salvar no SecureStore (${key}):`, e);
  }
};

/**
 * Helper para leitura segura
 */
const getSecure = async (key) => {
  try {
    const data = await SecureStore.getItemAsync(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error(`[SyncService] Erro ao ler do SecureStore (${key}):`, e);
    return null;
  }
};

const SyncService = {
  /**
   * Enfileira uma posição para envio posterior em caso de falha de rede.
   * @param {Object} posicao Coordenadas e timestamp
   * @param {string|null} rotaId ID da rota ativa no momento da captura
   */
  enqueue: async (posicao, rotaId = null) => {
    if (isProcessing) {
      await new Promise(r => setTimeout(r, 100));
    }

    try {
      const queue = (await getSecure(SYNC_KEY)) || [];
      
      queue.push({
        latitude: posicao.latitude,
        longitude: posicao.longitude,
        timestamp: posicao.timestamp,
        rota_id: rotaId,
      });

      await saveSecure(SYNC_KEY, queue);
      return queue.length;
    } catch (e) {
      return -1;
    }
  },

  getQueueCount: async () => {
    const queue = await getSecure(SYNC_KEY);
    return queue ? queue.length : 0;
  },

  /**
   * Sincroniza posições pendentes em lotes (chunks).
   * @param {string} currentRotaId Rota ativa para vinculação do lote
   * @param {Function} onProgress Callback para atualização da UI (SyncIndicator)
   */
  syncPending: async (currentRotaId, onProgress) => {
    if (isProcessing) return { synced: 0, failed: 0 };
    isProcessing = true;

    try {
      let queue = (await getSecure(SYNC_KEY)) || [];
      if (queue.length === 0) {
        isProcessing = false;
        return { synced: 0, failed: 0 };
      }

      const totalItems = queue.length;
      let totalSynced = 0;
      let totalFailed = 0;

      // Processamento em lotes para evitar sobrecarga na API Laravel
      while (queue.length > 0) {
        const chunk = queue.slice(0, CHUNK_SIZE);
        const chunkRotaId = chunk[0].rota_id || currentRotaId;

        try {
          await enviarPosicoes(PATRIMONIO_TABLET, chunkRotaId, chunk);
          
          // Sucesso: Remove lote enviado e persiste a fila restante
          queue = queue.slice(chunk.length);
          totalSynced += chunk.length;
          await saveSecure(SYNC_KEY, queue);

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
          totalFailed = totalItems - totalSynced;
          await SyncService._addToHistory({ 
            type: 'chunk_fail', 
            count: chunk.length, 
            error: err.message 
          }, 'failed');
          break; // Interrompe se houver falha persistente de rede
        }
      }

      if (totalSynced > 0) {
        await SyncService._addToHistory({ 
          type: 'batch_sync', 
          count: totalSynced, 
          status: totalFailed > 0 ? 'partial' : 'success' 
        }, totalFailed > 0 ? 'warning' : 'success');
      }

      isProcessing = false;
      return { synced: totalSynced, failed: totalFailed };

    } catch (e) {
      isProcessing = false;
      return { synced: 0, failed: -1 };
    }
  },

  getHistory: async (limit = 50) => {
    const history = (await getSecure(HISTORY_KEY)) || [];
    return history.slice(-limit).reverse();
  },

  _addToHistory: async (item, status) => {
    try {
      const history = (await getSecure(HISTORY_KEY)) || [];
      history.push({
        ...item,
        syncStatus: status,
        syncedAt: new Date().toISOString(),
      });
      // Mantém apenas os últimos 200 logs para economizar espaço seguro
      await saveSecure(HISTORY_KEY, history.slice(-200));
    } catch (e) {
      // Falha silenciosa em logs de histórico
    }
  },
};

export default SyncService;
