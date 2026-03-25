/**
 * Mock API Service
 * Simula uma API RESTful com delay, suporte a GET/POST e falhas aleatórias.
 */

const FAILURE_RATE = 0.1; // 10% de chance de falha simulada

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldFail = () => Math.random() < FAILURE_RATE;

const apiMock = {
  post: async (endpoint, data) => {
    console.log(`[apiMock] POST ${endpoint}`, data);
    await delay(800 + Math.random() * 700);

    if (shouldFail()) {
      console.warn(`[apiMock] ⚠️ Simulated failure for POST ${endpoint}`);
      throw new Error(`Simulated server error on ${endpoint}`);
    }

    console.log(`[apiMock] ✅ 200 OK for POST ${endpoint}`);
    return {
      status: 200,
      data: {
        success: true,
        message: 'Dados recebidos com sucesso',
        timestamp: new Date().toISOString(),
        id: Math.random().toString(36).substring(7),
      },
    };
  },

  get: async (endpoint) => {
    console.log(`[apiMock] GET ${endpoint}`);
    await delay(500 + Math.random() * 500);

    if (shouldFail()) {
      console.warn(`[apiMock] ⚠️ Simulated failure for GET ${endpoint}`);
      throw new Error(`Simulated server error on ${endpoint}`);
    }

    // Simular diferentes respostas por endpoint
    let responseData = {};

    if (endpoint.includes('/status')) {
      responseData = {
        serverTime: new Date().toISOString(),
        activeDrivers: Math.floor(Math.random() * 20) + 5,
        totalDeliveries: Math.floor(Math.random() * 100) + 50,
      };
    } else if (endpoint.includes('/routes')) {
      responseData = {
        routeId: 'RT-' + Math.random().toString(36).substring(7),
        estimatedTime: Math.floor(Math.random() * 60) + 20 + ' min',
      };
    }

    console.log(`[apiMock] ✅ 200 OK for GET ${endpoint}`);
    return { status: 200, data: responseData };
  },
};

export default apiMock;
