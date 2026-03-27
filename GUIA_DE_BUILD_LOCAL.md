# Guia de Compilação e Build Local - UMS Mobile

Este documento descreve o passo a passo para configurar, compilar e executar o projeto **UMS Mobile** (baseado em React Native e Expo) no seu ambiente de desenvolvimento local.

---

## 1. Pré-requisitos

Antes de iniciar a compilação, certifique-se de que seu ambiente possui as seguintes ferramentas instaladas:

- **Node.js** (recomendado versão LTS, 18.x ou 20.x).
- **Gerenciador de pacotes**: `npm` (que já vem com o Node) ou `yarn`.
- **Git** (para controle de versão e clonagem se necessário).
- **Para desenvolvimento Android**: 
  - [Android Studio](https://developer.android.com/studio) instalado e atualizado.
  - SDK do Android (preferencialmente nas versões mais recentes indicadas pelo Expo).
  - Um Emulador Android configurado no AVD Manager ou um dispositivo físico com "Depuração USB" ativada.
- **Para desenvolvimento iOS** (Apenas no macOS):
  - [Xcode](https://developer.apple.com/xcode/) instalado.
  - CocoaPods instalados (`sudo gem install cocoapods` ou `brew install cocoapods`).

---

## 2. Instalação das Dependências

Para começar, navegue até a pasta raiz do projeto (onde o arquivo `package.json` está localizado) e instale todas as dependências necessárias.

Abra o terminal e execute:

```bash
npm install
# ou, se estiver usando yarn:
# yarn install
```

Isso fará o download da pasta `node_modules` com todas as bibliotecas usadas pelo projeto.

---

## 3. Executando o Servidor de Desenvolvimento (Metro Bundler)

Para testar o aplicativo rapidamente usando o **Expo Go** no seu celular ou no emulador, inicie o servidor local:

```bash
npm start
# ou
npx expo start
```

Isso abrirá uma interface no terminal (e possivelmente no navegador) com um **QR Code**. 
- **Em dispositivo físico:** Baixe o aplicativo "Expo Go" na sua loja de aplicativos (App Store ou Google Play), abra-o e escaneie o QR Code.
- **No emulador Android:** Pressione a tecla `a` no terminal após o servidor iniciar.
- **No simulador iOS:** Pressione a tecla `i` no terminal.

---

## 4. Compilação e Build Local Nativo

Se o projeto utilizar código nativo customizado (via `expo-dev-client` ou plugins específicos) que não funcionam no Expo Go padrão, você precisará gerar um build nativo. 

O projeto está configurado com os scripts de Continuous Native Generation (CNG) no `package.json`.

### 4.1. Build para Android

Certifique-se de que o **Android Studio e o emulador** estejam abertos.

Execute o seguinte comando no terminal:

```bash
npm run android
# ou
npx expo run:android
```

**O que este comando faz:**
1. Gera a pasta `android/` com os arquivos nativos baseados nas configurações do `app.json`/`app.config.js`.
2. Interage com o Gradle para compilar o projeto em um aplicativo real (`.apk`).
3. Instala e roda o aplicativo diretamente no Emulador ou Dispositivo Android Conectado via USB.

### 4.2. Build para iOS (Somente macOS)

Certifique-se de que o **Xcode e o Simulador do iOS** estejam abertos.

Execute o seguinte comando no terminal:

```bash
npm run ios
# ou
npx expo run:ios
```

**O que este comando faz:**
1. Gera a pasta `ios/` baseando-se no `app.json`.
2. Usa o `pod install` para gerenciar as dependências nativas (CocoaPods).
3. Compila o app no Xcode e faz o deploy no Simulador do iOS.

---

## 5. (Opcional) Gerando APK / AAB usando o EAS Build Localmente

Caso precise gerar um arquivo de instalação (`.apk` para Android ou `.ipa` para iOS) para enviar a outras pessoas ou para subir nas lojas sem depender da nuvem do Expo, você pode rodar o EAS localmente.

Primeiro, instale a ferramenta de linha de comando do EAS:
```bash
npm install -g eas-cli
```

Faça login na sua conta da Expo:
```bash
eas login
```

Para gerar o build localmente, instale o Android NDK e as ferramentas de build e execute:
```bash
# Build Android:
eas build --platform android --local

# Build iOS:
eas build --platform ios --local
```

Após a conclusão da compilação pelo seu computador, o arquivo será salvo localmente na pasta do projeto.

---

## Dicas para Solução de Problemas

- **Problemas de Cache:** Se o código parecer desatualizado ou as fontes/cores não atualizarem, limpe o cache do bundler com:
  ```bash
  npx expo start -c
  ```
- **Erro de Módulos (Watchman/Node):** Tente apagar o projeto e instalar dependências de novo:
  ```bash
  rm -rf node_modules
  rm -rf package-lock.json (ou yarn.lock)
  npm install
  ```
- **Erros no Gradle/Android:** Remova a pasta `android/` e deixe o Expo recriá-la:
  ```bash
  rm -rf android
  npx expo run:android
  ```
