/**
 * Mock UMS Controller
 * Simula o backend do painel de controle da UMS.
 * Rotas baseadas em Rio Branco - AC.
 */

// Coordenada base: Centro de Rio Branco (~Palácio Rio Branco)
const BASE_LAT = -9.9747;
const BASE_LNG = -67.8100;

const MOCK_DISPATCHES = [
  {
    id_chamado: 'CH-2026-0347',
    descricao_ocorrencia: 'Falta de energia elétrica na escola. Gerador de emergência necessário para provas do ENEM.',
    local_destino: 'Escola Estadual Armando Nogueira',
    route_coordinates: [
      { latitude: -9.9747, longitude: -67.8100 },
      { latitude: -9.9730, longitude: -67.8070 },
      { latitude: -9.9710, longitude: -67.8040 },
      { latitude: -9.9695, longitude: -67.8010 },
      { latitude: -9.9680, longitude: -67.7980 },
    ],
  },
  {
    id_chamado: 'CH-2026-0348',
    descricao_ocorrencia: 'Problema hidráulico grave. Vazamento no banheiro do bloco B, risco de inundação.',
    local_destino: 'Escola Municipal Raimundo Hermínio de Melo',
    route_coordinates: [
      { latitude: -9.9747, longitude: -67.8100 },
      { latitude: -9.9780, longitude: -67.8130 },
      { latitude: -9.9810, longitude: -67.8160 },
      { latitude: -9.9840, longitude: -67.8190 },
      { latitude: -9.9870, longitude: -67.8220 },
    ],
  },
  {
    id_chamado: 'CH-2026-0349',
    descricao_ocorrencia: 'Alarme de incêndio disparado no laboratório de informática. Verificação urgente.',
    local_destino: 'Colégio Acreano - Bosque',
    route_coordinates: [
      { latitude: -9.9747, longitude: -67.8100 },
      { latitude: -9.9720, longitude: -67.8130 },
      { latitude: -9.9690, longitude: -67.8160 },
      { latitude: -9.9660, longitude: -67.8190 },
      { latitude: -9.9630, longitude: -67.8210 },
    ],
  },
  {
    id_chamado: 'CH-2026-0350',
    descricao_ocorrencia: 'Entrega urgente de materiais didáticos. Kits de ciências para feira municipal.',
    local_destino: 'Escola Neutel Maia - Conjunto Esperança',
    route_coordinates: [
      { latitude: -9.9747, longitude: -67.8100 },
      { latitude: -9.9770, longitude: -67.8060 },
      { latitude: -9.9800, longitude: -67.8020 },
      { latitude: -9.9830, longitude: -67.7980 },
      { latitude: -9.9860, longitude: -67.7940 },
    ],
  },
];

let dispatchIndex = 0;

const MockUmsController = {
  simulateIncomingDispatch: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const dispatch = MOCK_DISPATCHES[dispatchIndex % MOCK_DISPATCHES.length];
        dispatchIndex++;
        resolve({
          ...dispatch,
          timestamp: new Date().toISOString(),
          prioridade: dispatchIndex % 2 === 0 ? 'ALTA' : 'URGENTE',
          status: 'PENDENTE',
        });
      }, 3000);
    });
  },

  respondToDispatch: async (id_chamado, resposta) => {
    console.log(`[MockUmsController] Motorista respondeu ${resposta} para ${id_chamado}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 200,
          message: resposta === 'ACEITO'
            ? 'Rota aceita. Navegação iniciada.'
            : 'Recusa registrada. Encaminhando para outra UMS.',
          timestamp: new Date().toISOString(),
        });
      }, 500);
    });
  },

  requestNewDispatch: () => {
    return MockUmsController.simulateIncomingDispatch();
  },
};

export default MockUmsController;
