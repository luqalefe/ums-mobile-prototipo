# 📱 UMS Mobile — Documentação Técnica

> **Módulo 3** — Rastreamento GPS e Despacho de Rotas para Unidades Móveis de Suporte  
> Stack: React Native + Expo | OpenStreetMap | AsyncStorage

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Pré-requisitos](#-pré-requisitos)
3. [Configuração do Ambiente](#-configuração-do-ambiente-passo-a-passo)
4. [Executando o Projeto](#-executando-o-projeto)
5. [Estrutura de Arquivos](#-estrutura-de-arquivos)
6. [Explicação dos Arquivos de Código](#-explicação-dos-arquivos-de-código)
7. [Fluxo de Funcionamento](#-fluxo-de-funcionamento)
8. [Troubleshooting](#-troubleshooting)

---

## 🎯 Visão Geral

O **UMS Mobile** é um aplicativo para tablets e celulares destinado ao gerenciamento de Unidades Móveis de Suporte (UMS) na área de logística educacional. O app permite:

- **Rastreamento GPS** em tempo real com estratégia offline-first
- **Despacho de rotas** com fluxo de aceitação/recusa pelo motorista
- **Mapa OpenStreetMap** com renderização de trajetos
- **Fila offline** com sincronização automática via AsyncStorage
- **Interface responsiva** adaptada para celular e tablet

> ⚠️ A API backend (Laravel) ainda não está pronta. Todo o app funciona com **dados mockados**.

---

## 🔧 Pré-requisitos

| Ferramenta | Versão Mínima | Para que serve |
|-----------|--------------|----------------|
| **WSL 2** (Ubuntu 24.04) | — | Ambiente Linux no Windows |
| **Node.js** | v20.x | Runtime JavaScript |
| **npm** | v10.x | Gerenciador de pacotes |
| **NVM** | v0.40+ | Gerenciador de versões do Node |
| **Expo Go** (celular) | SDK 54 | Executa o app no dispositivo |

---

## 🚀 Configuração do Ambiente (Passo a Passo)

### 1. Instalar o WSL (caso não tenha)

No **PowerShell como administrador**:
```powershell
wsl --install -d Ubuntu-24.04
```
Reinicie o computador após a instalação.

### 2. Instalar o NVM e Node.js

Abra o terminal **WSL (Ubuntu)**:
```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Recarregar o terminal
source ~/.bashrc

# Instalar Node.js 20
nvm install 20

# Verificar instalação
node -v   # deve mostrar v20.x.x
npm -v    # deve mostrar 10.x.x
```

### 3. Clonar/Acessar o projeto

```bash
cd ~/projetos/ums-mobile
```

### 4. Instalar dependências

```bash
npm install
```

### 5. Instalar o Expo Go no celular

- **Android**: [Play Store — Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS**: [App Store — Expo Go](https://apps.apple.com/app/expo-go/id982107779)

> Certifique-se de que o Expo Go está na versão compatível com **SDK 54**.

---

## ▶️ Executando o Projeto

### Iniciar o servidor de desenvolvimento

```bash
cd ~/projetos/ums-mobile
npx expo start --tunnel --clear
```

- `--tunnel`: Cria uma URL pública (ngrok) para acessar de qualquer rede
- `--clear`: Limpa o cache do Metro Bundler

### Conectar o celular

1. O terminal vai exibir um **QR Code**
2. **Android**: Abra o app **Expo Go** → escaneie o QR code
3. **iOS**: Abra a **Câmera** → aponte para o QR code → toque no link

### Comandos úteis durante o desenvolvimento

| Tecla | Ação |
|-------|------|
| `r` | Recarregar o app |
| `m` | Abrir menu do desenvolvedor |
| `j` | Abrir DevTools |
| `?` | Ver todas as opções |

---

## 📁 Estrutura de Arquivos

```
ums-mobile/
├── App.js                              # Ponto de entrada do aplicativo
├── app.json                            # Configuração do Expo (permissões, ícones)
├── babel.config.js                     # Configuração do Babel (transpilador)
├── package.json                        # Dependências e scripts do projeto
├── assets/                             # Ícones e splash screen
│
└── src/
    ├── components/                     # Componentes visuais reutilizáveis
    │   ├── DispatchModal.js            #   Modal de aceitar/recusar ocorrência
    │   ├── MapViewOSM.js               #   Componente de mapa OpenStreetMap
    │   ├── StatusCard.js               #   Card genérico com ícone e valor
    │   └── SyncIndicator.js            #   Indicador animado de sincronização
    │
    ├── contexts/                       # Contextos React (estado global)
    │   └── NetworkContext.js           #   Gerencia status online/offline
    │
    ├── data/                           # Dados estáticos mockados
    │   └── mockRoutes.js               #   Rotas GPS e entregas simuladas
    │
    ├── hooks/                          # Custom Hooks
    │   └── useLocationTracking.js      #   Lógica de rastreamento GPS
    │
    ├── navigation/                     # Navegação entre telas
    │   └── AppNavigator.js             #   Tab navigator (3 abas)
    │
    ├── screens/                        # Telas do aplicativo
    │   ├── Dashboard.js                #   Painel principal com controles
    │   ├── HistoryScreen.js            #   Histórico de localizações
    │   └── MapScreen.js                #   Mapa com despacho de rotas
    │
    └── services/                       # Serviços e camada de dados
        ├── apiMock.js                  #   Simulador de API REST
        ├── MockUmsController.js        #   Simulador do backend UMS
        └── SyncService.js              #   Gerenciador de fila offline
```

---

## 📖 Explicação dos Arquivos de Código

### Arquivo Raiz

#### `App.js`
Ponto de entrada do aplicativo. Sua única responsabilidade é montar a árvore de **providers** (contextos) e a **navegação**:
- Envolve tudo com `NetworkProvider` para que qualquer tela acesse o status da rede
- Usa `NavigationContainer` do React Navigation para gerenciar as rotas
- Define a `StatusBar` com estilo claro (tema escuro)

#### `app.json`
Arquivo de configuração do Expo. Define:
- Nome do app ("UMS Mobile"), slug, versão
- Permissões de GPS (`ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`)
- Mensagem de permissão de localização em português
- Suporte a tablets (`supportsTablet: true`)
- Cores de fundo (#1a1a2e — tema escuro)

#### `babel.config.js`
Configuração do transpilador Babel:
- Usa o preset `babel-preset-expo` (padrão para projetos Expo)
- Inclui o plugin `react-native-reanimated/plugin` para animações avançadas

#### `package.json`
Gerencia as dependências do projeto:
- **`expo@~54.0.0`**: SDK principal do Expo
- **`react-native-maps`**: Renderização de mapas (com UrlTile para OSM)
- **`expo-location`**: Acesso ao GPS do dispositivo
- **`@react-native-async-storage/async-storage`**: Armazenamento local persistente
- **`@react-native-community/netinfo`**: Detecção de status de rede
- **`@react-navigation/*`**: Navegação entre telas (bottom tabs)
- **`react-native-reanimated`**: Animações de alta performance
- **`@expo/vector-icons`**: Ícones vetoriais (Ionicons)

---

### 📂 `src/services/` — Camada de Serviços

#### `apiMock.js`
Simula uma API RESTful completa. Substitui o backend Laravel enquanto ele não está pronto.

**Funcionalidades:**
- **`post(endpoint, data)`**: Simula POST com delay de 800-1500ms
- **`get(endpoint)`**: Simula GET com delay de 500-1000ms
- **Falhas simuladas**: 10% de chance de erro (testa resiliência do app)
- **Respostas variadas**: Endpoints `/status` e `/routes` retornam dados diferentes

**Como funciona:**
```javascript
// Exemplo de uso
const response = await apiMock.post('/tracking', { latitude: -9.97, longitude: -67.81 });
// Após ~1s: { status: 200, data: { success: true, message: "...", id: "abc123" } }
// Ou em 10% dos casos: throw Error("Simulated server error")
```

---

#### `MockUmsController.js`
Simula o **painel de controle (backend)** que envia ocorrências para os motoristas.

**Funcionalidades:**
- **`simulateIncomingDispatch()`**: Retorna uma `Promise` que resolve após **3 segundos** com uma ocorrência. Simula o tempo de espera de um despacho real.
- **`respondToDispatch(id, resposta)`**: Registra se o motorista aceitou ou recusou. Resolve após 500ms.
- **`requestNewDispatch()`**: Atalho para solicitar novo despacho manualmente.

**Dados mockados (4 cenários em Rio Branco-AC):**

| Chamado | Ocorrência | Escola |
|---------|-----------|--------|
| CH-2026-0347 | Falta de energia | Escola Estadual Armando Nogueira |
| CH-2026-0348 | Vazamento hidráulico | E.M. Raimundo Hermínio de Melo |
| CH-2026-0349 | Alarme de incêndio | Colégio Acreano (Bosque) |
| CH-2026-0350 | Entrega de materiais | Escola Neutel Maia |

Cada despacho inclui um array `route_coordinates` com 5 pontos de latitude/longitude formando o trajeto.

---

#### `SyncService.js`
Gerencia a **fila offline** usando AsyncStorage. É o coração da estratégia offline-first do app.

**Funcionalidades:**
- **`enqueue(payload)`**: Adiciona um pacote GPS à fila local. Usado quando o app está offline.
- **`getQueueCount()`**: Retorna quantos pacotes estão na fila.
- **`getQueue()`**: Retorna todos os itens da fila.
- **`syncPending(onProgress)`**: Envia cada item da fila ao `apiMock` um por um. Aceita um callback de progresso. Itens que falharem permanecem na fila para retry.
- **`getHistory(limit)`**: Retorna o histórico das últimas sincronizações (sucesso/falha).
- **`clearHistory()`**: Limpa o histórico.

**Fluxo de sincronização:**
```
[Offline] → enqueue() → AsyncStorage (@gps_queue)
[Online]  → syncPending() → apiMock.post() → remove da fila
                           → se falhar → mantém na fila
```

---

### 📂 `src/contexts/` — Estado Global

#### `NetworkContext.js`
Contexto React que monitora o status da conexão de internet e compartilha com todo o app.

**Estado fornecido (`useNetwork()`):**

| Propriedade | Tipo | Descrição |
|------------|------|-----------|
| `isOnline` | boolean | Se o app está efetivamente online |
| `forceOffline` | boolean | Se o modo offline manual está ativo |
| `toggleForceOffline()` | function | Liga/desliga simulação de offline |
| `stats` | object | Estatísticas: reconexões, duração offline total |

**Como funciona:**
- Usa `NetInfo.addEventListener` para escutar mudanças de rede reais
- Combina o status real com o `forceOffline` (override manual para testes)
- Rastreia timestamps de quando ficou online/offline e conta reconexões

---

### 📂 `src/hooks/` — Custom Hooks

#### `useLocationTracking.js`
Hook que encapsula toda a lógica de rastreamento GPS. É o "cérebro" do módulo de tracking.

**Estado retornado:**

| Propriedade | Tipo | Descrição |
|------------|------|-----------|
| `isTracking` | boolean | Se o GPS está ativo |
| `startTracking()` | function | Inicia captura a cada 10s |
| `stopTracking()` | function | Para o rastreamento |
| `pendingCount` | number | Pacotes na fila offline |
| `lastLocation` | object | Última coordenada capturada |
| `locationHistory` | array | Últimas 50 posições |
| `isSyncing` | boolean | Se está sincronizando agora |
| `syncNow()` | function | Forçar sincronização manual |
| `lastError` | string | Último erro ocorrido |
| `useMockLocation` | boolean | Se está usando mock ao invés de GPS real |

**Fluxo de captura:**
1. `startTracking()` pede permissão de GPS
2. Se permissão negada → ativa `useMockLocation` automaticamente
3. `setInterval` de 10 segundos chama `capturePosition()`
4. Se **online** → envia via `apiMock.post('/tracking', payload)`
5. Se **offline** → salva via `SyncService.enqueue(payload)`
6. Se volta online → `SyncService.syncPending()` automático

---

### 📂 `src/data/` — Dados Mockados

#### `mockRoutes.js`
Dados estáticos que simulam GPS e entregas. Baseado em **Rio Branco, Acre**.

**Exports:**
- **`MOCK_ROUTE`**: Array de 10 coordenadas simulando um trajeto (Centro → Morada do Sol)
- **`MOCK_ASSETS`**: 3 veículos/tablets com motorista e placa
- **`getMockPosition()`**: Retorna uma posição simulada percorrendo a rota ponto a ponto, com leve variação aleatória (jitter) para simular GPS real
- **`MOCK_DELIVERIES`**: 5 entregas com status (entregue/em_rota/pendente)
- **`getStatusColor()`** / **`getStatusLabel()`**: Helpers de formatação

---

### 📂 `src/components/` — Componentes Visuais

#### `MapViewOSM.js`
Componente de mapa que utiliza **OpenStreetMap** (sem Google Maps).

**Implementação técnica:**
- Usa `<MapView>` do `react-native-maps` com `mapType="none"` para desabilitar o mapa padrão
- Renderiza tiles OSM via `<UrlTile urlTemplate="https://a.tile.openstreetmap.de/{z}/{x}/{y}.png" />`
- Expõe métodos via `forwardRef` + `useImperativeHandle`:
  - `fitToRoute()`: Ajusta zoom para caber toda a rota na tela
  - `animateToRegion()`: Move a câmera para uma região específica
- Renderiza `<Polyline>` vermelha quando há rota aceita
- Renderiza `<Marker>` verde na origem e vermelho (com ícone de escola) no destino

---

#### `DispatchModal.js`
Modal animado estilo **Bottom Sheet** para exibir ocorrências recebidas.

**UX/Design:**
- Animação de entrada: slide de baixo + fade do overlay (spring animation)
- Mostra: ID do chamado, badge de prioridade (URGENTE/ALTA), descrição, destino
- Dois botões grandes otimizados para toque em tablet:
  - 🟢 **Aceitar Rota**: Desenha a rota no mapa
  - 🔴 **Recusar**: Envia recusa e solicita novo despacho
- Responsivo: No tablet, o modal fica centralizado com largura máxima de 700px

---

#### `StatusCard.js`
Card visual reutilizável para exibir informações no Dashboard.

**Props:**
- `icon`: Nome do ícone Ionicons
- `iconColor`: Cor do ícone
- `title`: Título do card
- `value`: Valor principal (ex: número de pacotes pendentes)
- `subtitle`: Texto secundário
- `accentColor`: Cor da borda lateral de destaque
- `children`: Conteúdo customizado adicional

Adapta padding e fontes para tablets via `useWindowDimensions`.

---

#### `SyncIndicator.js`
Barra de status da sincronização com animações.

**Estados visuais:**
- ✅ "Tudo sincronizado" (verde)
- ☁️ "X aguardando envio" (azul, quando online com fila)
- ⛔ "X na fila offline" (vermelho, com animação de pulse)
- 🔄 "Sincronizando..." (laranja, com barra de progresso)

---

### 📂 `src/navigation/`

#### `AppNavigator.js`
Navegação por **abas inferiores** (bottom tabs) usando `@react-navigation/bottom-tabs`.

**3 abas:**
| Aba | Tela | Ícone |
|-----|------|-------|
| Dashboard | `Dashboard.js` | grid |
| Mapa | `MapScreen.js` | map |
| Histórico | `HistoryScreen.js` | time |

- Tab bar com tema escuro (#1E1E2E)
- Ícones roxos quando ativo (#6C63FF)
- Tamanho dos ícones adapta para tablet

---

### 📂 `src/screens/` — Telas do App

#### `Dashboard.js`
Painel principal com visão geral do sistema.

**Seções:**
1. **Header**: Título + badge de status online/offline
2. **SyncIndicator**: Status da fila de sincronização
3. **Cards em grid** (tablet) ou lista (celular):
   - Controle GPS (iniciar/parar rastreamento)
   - Última posição capturada (lat, lng, velocidade)
   - Fila offline (contador + botão de sync manual)
   - Controle de rede (simular offline)
4. **Banner de erro** quando há falha

**Animações:** Cards entram com fade + slide animados via `Animated`.

---

#### `MapScreen.js`
Tela de mapa com fluxo completo de despacho de rotas.

**Ciclo de vida do despacho:**
1. **Ao montar**: Chama `simulateIncomingDispatch()` (3s de espera)
2. **Modal aparece**: Motorista vê a ocorrência
3. **Aceitar**: Polyline desenhada → zoom ajustado → painel de rota ativo
4. **Recusar**: Alerta de recusa → novo despacho em 2s
5. **Finalizar rota**: Limpa mapa → novo despacho

**Overlays no mapa:**
- Barra de status superior (estado atual: idle/pending/active)
- FABs (floating action buttons): finalizar, solicitar despacho, centralizar
- Painel inferior com dados da rota ativa

---

#### `HistoryScreen.js`
Lista de localizações capturadas e histórico de sincronizações.

**2 abas internas:**
- **Ao Vivo**: Localizações capturadas em tempo real (últimas 50)
- **Sincronizados**: Histórico de envios ao servidor (sucesso/falha)

**Funcionalidades:**
- Pull-to-refresh
- Banner de pacotes pendentes
- Badge de patrimônio (TB-001)
- Ícone de status (✅ enviado / ❌ falhou)

---

## 🔄 Fluxo de Funcionamento

### Rastreamento GPS
```
[Iniciar] → Pedir Permissão GPS
              ├── Concedida → expo-location (GPS real)
              └── Negada → getMockPosition() (simulado)
                            ↓
                  setInterval(10 segundos)
                            ↓
                  capturar posição atual
                            ↓
              ┌── Online? ──┐
              │ SIM         │ NÃO
              ↓             ↓
        apiMock.post()   SyncService.enqueue()
              │             │
              │             └→ AsyncStorage
              │                    ↓
              │           [Quando voltar online]
              │                    ↓
              └──────── SyncService.syncPending()
```

### Despacho de Rota
```
[Tela Mapa abre]
       ↓
simulateIncomingDispatch() (3s delay)
       ↓
   [Modal aparece]
       ├── [Aceitar]
       │      ↓
       │   respondToDispatch("ACEITO")
       │      ↓
       │   routeCoordinates → <Polyline>
       │      ↓
       │   fitToCoordinates() → zoom auto
       │      ↓
       │   [Motorista navega]
       │      ↓
       │   [Finalizar Rota]
       │      ↓
       │   Limpar mapa → Novo dispatch
       │
       └── [Recusar]
              ↓
           respondToDispatch("RECUSADO")
              ↓
           Alert("Recusa enviada")
              ↓
           Novo dispatch (2s)
```

---

## 🔧 Troubleshooting

| Problema | Solução |
|----------|---------|
| `npx: command not found` | Rode `source ~/.bashrc` para carregar o NVM |
| `SDK incompatível (Expo Go)` | Verifique se o Expo Go é SDK 54. O projeto usa `expo@~54.0.0` |
| `App entry not found` | `package.json` deve ter `"main": "expo/AppEntry"` |
| `babel-preset-expo not found` | Rode `npm install babel-preset-expo` |
| `libnspr4.so not found` | `sudo apt install -y libnss3 libnspr4` (só DevTools, app funciona sem) |
| Mapa não renderiza | Verifique conexão de internet (tiles OSM são baixados online) |
| GPS não funciona no emulador | O app faz fallback automático para `getMockPosition()` |
| Arquivos não aparecem | Use `ls -la` no caminho nativo do WSL: `~/projetos/ums-mobile` |

---

> **Última atualização:** 24/03/2026  
> **Localização das rotas mock:** Rio Branco, Acre  
> **Versão:** 1.0.0
