/**
 * Mock GPS Routes - Rotas simuladas em Rio Branco, Acre
 * Formato de patrimonio compativel com a API: patrimonio_tablet (ex: TREAC-12345)
 */

export const MOCK_ROUTE = [
  { latitude: -9.9747, longitude: -67.8100, label: 'Saida - Base Central (Centro)' },
  { latitude: -9.9730, longitude: -67.8070, label: 'Ponto 1 - Av. Brasil' },
  { latitude: -9.9710, longitude: -67.8040, label: 'Ponto 2 - Estacao Experimental' },
  { latitude: -9.9695, longitude: -67.8010, label: 'Ponto 3 - Conjunto Tucuma' },
  { latitude: -9.9680, longitude: -67.7980, label: 'Ponto 4 - Via Verde' },
  { latitude: -9.9660, longitude: -67.7950, label: 'Ponto 5 - UNINORTE' },
  { latitude: -9.9640, longitude: -67.7920, label: 'Ponto 6 - Jardim Europa' },
  { latitude: -9.9620, longitude: -67.7890, label: 'Ponto 7 - Parque Shopping' },
  { latitude: -9.9600, longitude: -67.7860, label: 'Ponto 8 - Morada do Sol' },
  { latitude: -9.9580, longitude: -67.7830, label: 'Chegada - Destino Final' },
];

export const MOCK_ASSETS = [
  { patrimonio_tablet: 'TREAC-12345', type: 'Tablet', driver: 'Carlos Silva', vehicle: 'VAN-2847' },
  { patrimonio_tablet: 'TREAC-12346', type: 'Tablet', driver: 'Maria Santos', vehicle: 'VAN-1923' },
  { patrimonio_tablet: 'TREAC-12347', type: 'Tablet', driver: 'Joao Oliveira', vehicle: 'VAN-3651' },
];

export const MOCK_ROTAS = [
  { rota_id: 12, descricao: 'Rota Norte - Estacao Experimental' },
  { rota_id: 15, descricao: 'Rota Sul - Conjunto Esperanca' },
  { rota_id: 18, descricao: 'Rota Leste - Via Verde' },
  { rota_id: 21, descricao: 'Rota Oeste - Bosque' },
];

let currentRouteIndex = 0;

export const getMockPosition = () => {
  const point = MOCK_ROUTE[currentRouteIndex];
  const jitter = () => (Math.random() - 0.5) * 0.001;
  const position = {
    coords: {
      latitude: point.latitude + jitter(),
      longitude: point.longitude + jitter(),
      altitude: 140 + Math.random() * 10,
      accuracy: 5 + Math.random() * 10,
      heading: Math.random() * 360,
      speed: 5 + Math.random() * 30,
    },
    timestamp: Date.now(),
  };
  currentRouteIndex = (currentRouteIndex + 1) % MOCK_ROUTE.length;
  return position;
};

export const MOCK_DELIVERIES = [
  { id: 1, status: 'entregue', address: 'Escola Armando Nogueira', time: '08:30', recipient: 'Ana Costa' },
  { id: 2, status: 'entregue', address: 'CEF Raimundo Herminio', time: '09:15', recipient: 'Pedro Lima' },
  { id: 3, status: 'em_rota', address: 'Colegio Acreano', time: '10:00', recipient: 'Lucia Neves' },
  { id: 4, status: 'pendente', address: 'Escola Neutel Maia', time: '10:45', recipient: 'Roberto Dias' },
  { id: 5, status: 'pendente', address: 'IFAC Campus Centro', time: '11:30', recipient: 'Fernanda Souza' },
];

export const getStatusColor = (status) => {
  switch (status) {
    case 'entregue': return '#168821';
    case 'em_rota': return '#FFCD07';
    case 'pendente': return '#9E9E9E';
    default: return '#666';
  }
};

export const getStatusLabel = (status) => {
  switch (status) {
    case 'entregue': return 'Entregue';
    case 'em_rota': return 'Em Rota';
    case 'pendente': return 'Pendente';
    default: return status;
  }
};
