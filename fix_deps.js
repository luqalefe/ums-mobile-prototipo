const fs = require('fs');
const pkgPath = './package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.dependencies = {
  ...pkg.dependencies,
  '@expo/vector-icons': '^15.0.3',
  '@react-native-async-storage/async-storage': '2.2.0',
  '@react-native-community/netinfo': '~11.4.0',
  '@react-navigation/bottom-tabs': '^7.0.0',
  '@react-navigation/native': '^7.0.0',
  '@react-navigation/native-stack': '^7.0.0',
  'expo': '~54.0.0',
  'expo-location': '~19.0.8',
  'expo-status-bar': '~3.0.9',
  'react': '19.1.0',
  'react-native': '0.81.5',
  'react-native-gesture-handler': '~2.28.0',
  'react-native-maps': '1.20.1',
  'react-native-reanimated': '~4.1.1',
  'react-native-safe-area-context': '~5.6.0',
  'react-native-screens': '~4.16.0',
  'expo-asset': '~12.0.12'
};
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

const appPath = './App.js';
let appContent = fs.readFileSync(appPath, 'utf8');
if (!appContent.includes('react-native-gesture-handler')) {
  appContent = 'import \'react-native-gesture-handler\';\n' + appContent;
  appContent = appContent.replace('import { StatusBar } from \'expo-status-bar\';', 'import { StatusBar } from \'expo-status-bar\';\nimport { GestureHandlerRootView } from \'react-native-gesture-handler\';\nimport { SafeAreaProvider } from \'react-native-safe-area-context\';');
  appContent = appContent.replace('<NetworkProvider>', '<GestureHandlerRootView style={{ flex: 1 }}>\n      <SafeAreaProvider>\n        <NetworkProvider>');
  appContent = appContent.replace('</NetworkProvider>', '</NetworkProvider>\n      </SafeAreaProvider>\n    </GestureHandlerRootView>');
  fs.writeFileSync(appPath, appContent);
}
console.log('Update Success!');
