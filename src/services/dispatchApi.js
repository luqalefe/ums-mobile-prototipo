import { API_BASE_URL, PATRIMONIO_TABLET } from '../config';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

/**
 * Busca despachos/chamados pendentes para este dispositivo.
 * GET /chamados/pendentes
 */
export const fetchPendingDispatch = async () => {
  const response = await fetch(`${API_BASE_URL}/chamados/pendentes?patrimonio_tablet=${PATRIMONIO_TABLET}`, {
    method: 'GET',
    headers: defaultHeaders,
  });
  
  if (!response.ok) {
    if (response.status === 404) return null; // Sem despachos atribuídos no momento
    throw new Error('Erro ao buscar despacho pendente');
  }
  
  return await response.json();
};

/**
 * Responde a um despacho (Aceita ou Recusa).
 * POST /chamados/{id}/responder
 */
export const respondDispatch = async (id_chamado, resposta) => {
  const response = await fetch(`${API_BASE_URL}/chamados/${id_chamado}/responder`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify({
      patrimonio_tablet: PATRIMONIO_TABLET,
      resposta: resposta, // Ex: 'ACEITO' ou 'RECUSADO'
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Erro ao responder o despacho: HTTP ${response.status}`);
  }
  
  return await response.json();
};

export default { fetchPendingDispatch, respondDispatch };
