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
    if (response.status === 404) return null;
    throw new Error(`Erro ao buscar despacho: HTTP ${response.status}`);
  }
  
  const responseText = await response.text();
  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.error('[dispatchApi] Resposta não-JSON em fetchPendingDispatch:', responseText.substring(0, 100));
    return null;
  }
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
      resposta: resposta,
    }),
  });
  
  const responseText = await response.text();
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    throw new Error(`Erro no servidor ao responder despacho (HTTP ${response.status})`);
  }

  if (!response.ok) {
    throw new Error(data.message || `Erro ao responder o despacho: HTTP ${response.status}`);
  }
  
  return data;
};

export default { fetchPendingDispatch, respondDispatch };
