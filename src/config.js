/**
 * Configurações centralizadas do UMS Mobile
 */

// URL base do backend Laravel (sem barra final)
export const API_BASE_URL = 'http://10.0.2.2:8000/api';

// Identificador físico do tablet em campo (patrimônio)
export const PATRIMONIO_TABLET = 'TREAC-12345';

// Intervalo de captura GPS em milissegundos
export const GPS_INTERVAL_MS = 10000;

// Usar API Mock ao invés da API real (para desenvolvimento)
export const USE_MOCK_API = false; // PRODUÇÃO
