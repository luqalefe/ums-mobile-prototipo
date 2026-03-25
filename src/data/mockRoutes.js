/**
 * Mock GPS Routes - Rotas simuladas em Rio Branco, Acre
 */

// Rota simulada de entrega - Rio Branco
export const MOCK_ROUTE = [
  { latitude: -9.9747, longitude: -67.8100, label: 'Saída - Base Central (Centro)' },
  { latitude: -9.9730, longitude: -67.8070, label: 'Ponto 1 - Av. Brasil' },
  { latitude: -9.9710, longitude: -67.8040, label: 'Ponto 2 - Estação Experimental' },
  { latitude: -9.9695, longitude: -67.8010, label: 'Ponto 3 - Conjunto Tucumã' },
  { latitude: -9.9680, longitude: -67.7980, label: 'Ponto 4 - Via Verde' },
  { latitude: -9.9660, longitude: -67.7950, label: 'Ponto 5 - UNINORTE' },
  { latitude: -9.9640, longitude: -67.7920, label: 'Ponto 6 - Jardim Europa' },
  { latitude: -9.9620, longitude: -67.7890, label: 'Ponto 7 - Parque Shopping' },
  { latitude: -9.9600, longitude: -67.7860, label: 'Ponto 8 - Morada do Sol' },
  { latitude: -9.9580, longitude: -67.7830, label: 'Chegada - Destino Final' },
];

// Dados dos patrimônios (veículos/tablets)
export const MOCK_ASSETS = [
  { id: 'TB-001', type: 'Tablet', driver: 'Carlos Silva', vehicle: 'VAN-2847' },
  { id: 'TB-002', type: 'Tablet', driver: 'Maria Santos', vehicle: 'VAN-1923' },
  { id: 'TB-003', type: 'Tablet', driver: 'João Oliveira', vehicle: 'VAN-3651' },
];

// Gerar posição mockada baseada na rota
let currentRouteIndex = 0;

export const getMockPosition = () => {
  const point = MOCK_ROUTE[currentRouteIndex];
  const jitter = () => (Math.random() - 0.5) * 0.001;
  const position = {
    coords: {
      latitude: point.latitude + jitter(),
      longitude: point.longitude + jitter(),
      altitude: 140 + Math.random() * 10, // Rio Branco ~ 153m altitude
      accuracy: 5 + Math.random() * 10,
      heading: Math.random() * 360,
      speed: 5 + Math.random() * 30,
    },
    timestamp: Date.now(),
  };
  currentRouteIndex = (currentRouteIndex + 1) % MOCK_ROUTE.length;
  return position;
};

// Status de entregas mockado
export const MOCK_DELIVERIES = [
  { id: 1, status: 'entregue', address: 'Escola Armando Nogueira', time: '08:30', recipient: 'Ana Costa' },
  { id: 2, status: 'entregue', address: 'CEF Raimundo Hermínio', time: '09:15', recipient: 'Pedro Lima' },
  { id: 3, status: 'em_rota', address: 'Colégio Acreano', time: '10:00', recipient: 'Lucia Neves' },
  { id: 4, status: 'pendente', address: 'Escola Neutel Maia', time: '10:45', recipient: 'Roberto Dias' },
  { id: 5, status: 'pendente', address: 'IFAC Campus Centro', time: '11:30', recipient: 'Fernanda Souza' },
];

export const getStatusColor = (status) => {
  switch (status) {
    case 'entregue': return '#4CAF50';
    case 'em_rota': return '#FF9800';
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
