/**
 * Configurações centralizadas do UMS Mobile
 * Todas as requisições de produção devem utilizar HTTPS.
 */

// URL base do backend Laravel (Padrão Wi-Fi First)
export const API_BASE_URL = 'https://api.oms-logistics.gov.br/api';

// Identificador físico do tablet em campo (patrimônio)
export const PATRIMONIO_TABLET = 'TREAC-12345';

// Intervalo de captura GPS em milissegundos (10s para telemetria em tempo real)
export const GPS_INTERVAL_MS = 10000;

// Usar API Mock ao invés da API real (para desenvolvimento local)
export const USE_MOCK_API = false;
