import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// Mock de serviços e componentes
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
}));

describe('Auditoria de Segurança (Red Phase)', () => {

  test('VULNERABILIDADE 1: Não deve haver URLs de API hardcoded com HTTP (Inseguro)', async () => {
    // Verificando arquivos de configuração e serviços
    const config = require('../src/config').default || require('../src/config');
    const apiClient = require('../src/services/apiClient').default || require('../src/services/apiClient');
    
    const apiUrl = config.API_URL || '';
    expect(apiUrl.startsWith('https://')).toBe(true);
  });

  test('VULNERABILIDADE 2: Não deve haver console.logs ativos que imprimam dados sensíveis', () => {
    // Esta é uma verificação estática simulada por regex no teste
    const fs = require('fs');
    const path = require('path');
    
    const filesToScan = [
      'src/services/SyncService.js',
      'src/screens/MapScreen.js',
      'src/screens/Dashboard.js'
    ];

    filesToScan.forEach(file => {
      const content = fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');
      // Procura por console.log que imprime objetos (pode conter dados sensíveis)
      const hasSensitiveLog = /console\.log\s*\(\s*['"]?.*['"]?\s*,\s*\w+\s*\)/.test(content);
      expect(hasSensitiveLog).toBe(false);
    });
  });

  test('VULNERABILIDADE 3: WebView não deve permitir origens arbitrárias (XSS/Injection)', () => {
    const fs = require('fs');
    const path = require('path');
    
    const mapViewContent = fs.readFileSync(path.resolve(__dirname, '../src/components/MapViewOSM.js'), 'utf8');
    
    // Verifica se originWhitelist está presente e restrito
    const hasRestrictedOrigin = /originWhitelist\s*=\s*\{\[?['"]https:\/\/.*['"]\]?\}/.test(mapViewContent);
    expect(hasRestrictedOrigin).toBe(true);
  });

  test('VULNERABILIDADE 4: Armazenamento offline de localizações deve ser seguro/criptografado', () => {
    const fs = require('fs');
    const path = require('path');
    
    const syncServiceContent = fs.readFileSync(path.resolve(__dirname, '../src/services/SyncService.js'), 'utf8');
    
    // Verifica se está usando AsyncStorage para dados de localização (deveria ser SecureStore ou criptografado)
    const usesAsyncStorageForLocation = /import.*AsyncStorage.*from.*@react-native-async-storage\/async-storage/.test(syncServiceContent);
    const usesSecureStore = /expo-secure-store/.test(syncServiceContent);
    
    // Se usa AsyncStorage para localizações e NÃO usa SecureStore, falha
    if (usesAsyncStorageForLocation) {
      expect(usesSecureStore).toBe(true);
    }
  });

  test('VULNERABILIDADE 5: Deve haver proteção contra Mock Location (GPS Falso)', () => {
    const fs = require('fs');
    const path = require('path');
    
    const trackingHookContent = fs.readFileSync(path.resolve(__dirname, '../src/hooks/useLocationTracking.js'), 'utf8');
    
    // Verifica se há checagem de mocked location
    const checksMocked = /mocked|isMocked/.test(trackingHookContent);
    expect(checksMocked).toBe(true);
  });
});
