const fs = require('fs');
const path = require('path');

const vulnerabilities = [
  {
    name: 'VULNERABILIDADE 1: URLs de API inseguras (HTTP)',
    check: () => {
      const configPath = path.resolve(__dirname, 'src/config.js');
      if (!fs.existsSync(configPath)) return true;
      const content = fs.readFileSync(configPath, 'utf8');
      return !content.includes('http://');
    }
  },
  {
    name: 'VULNERABILIDADE 2: Console.logs com dados sensíveis',
    check: () => {
      const files = ['src/services/SyncService.js', 'src/screens/MapScreen.js', 'src/screens/Dashboard.js'];
      for (const file of files) {
        const fullPath = path.resolve(__dirname, file);
        if (!fs.existsSync(fullPath)) continue;
        const content = fs.readFileSync(fullPath, 'utf8');
        // Procura por logs que imprimem variáveis ou objetos
        if (/console\.log\s*\(\s*['"]?.*['"]?\s*,\s*\w+\s*\)/.test(content)) return false;
      }
      return true;
    }
  },
  {
    name: 'VULNERABILIDADE 3: WebView com originWhitelist insegura',
    check: () => {
      const filePath = path.resolve(__dirname, 'src/components/MapViewOSM.js');
      if (!fs.existsSync(filePath)) return true;
      const content = fs.readFileSync(filePath, 'utf8');
      return content.includes("originWhitelist={['https://") || content.includes('originWhitelist={["https://');
    }
  },
  {
    name: 'VULNERABILIDADE 4: Armazenamento offline não criptografado',
    check: () => {
      const filePath = path.resolve(__dirname, 'src/services/SyncService.js');
      if (!fs.existsSync(filePath)) return true;
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('@react-native-async-storage/async-storage')) {
        return content.includes('expo-secure-store') || content.includes('encrypt');
      }
      return true;
    }
  },
  {
    name: 'VULNERABILIDADE 5: Falta de proteção contra Fake GPS',
    check: () => {
      const filePath = path.resolve(__dirname, 'src/hooks/useLocationTracking.js');
      if (!fs.existsSync(filePath)) return true;
      const content = fs.readFileSync(filePath, 'utf8');
      return content.includes('mocked') || content.includes('isMocked');
    }
  }
];

console.log('--- AUDITORIA DE SEGURANÇA (FASE VERMELHA) ---');
let allPassed = true;
vulnerabilities.forEach(v => {
  const passed = v.check();
  console.log(`${passed ? '✅' : '❌'} ${v.name}`);
  if (!passed) allPassed = false;
});

if (!allPassed) {
  console.log('\nFALHA: Vulnerabilidades detectadas. Iniciando correções...');
  process.exit(1);
} else {
  console.log('\nSUCESSO: Nenhuma vulnerabilidade detectada.');
  process.exit(0);
}
