/**
 * Cliente HTTP para comunicação segura com o backend Laravel da UMS.
 * Implementa os endpoints definidos em api_gps_mobile.md utilizando HTTPS.
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

  const response = await fetch(API_BASE_URL + '/gps/posicao', {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  let data;
  
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Resposta do servidor inválida (HTTP ${response.status})`);
  }

  if (!response.ok) {
    const errorMsg = data.message || `Erro HTTP ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};

export default { enviarPosicoes };
