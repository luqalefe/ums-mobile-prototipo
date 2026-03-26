/**
 * Cliente HTTP real para comunicação com o backend Laravel da UMS.
 * Implementa os endpoints definidos em api_gps_mobile.md.
 */

import { API_BASE_URL } from '../config';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

/**
 * Envia um lote de posições GPS para o backend.
 * POST /gps/posicao
 */
export const enviarPosicoes = async (patrimonioTablet, rotaId, posicoes) => {
  const payload = {
    patrimonio_tablet: patrimonioTablet,
    rota_id: rotaId,
    posicoes: posicoes,
  };

  console.log('[apiClient] POST /gps/posicao —', posicoes.length, 'posição(ões)');

  const response = await fetch(API_BASE_URL + '/gps/posicao', {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.message || 'Erro HTTP ' + response.status;
    console.error('[apiClient] ❌', errorMsg, data.errors || '');
    throw new Error(errorMsg);
  }

  console.log('[apiClient] ✅', data.message);
  return data;
};

export default { enviarPosicoes };
