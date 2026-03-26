import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  useWindowDimensions, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapViewOSM from '../components/MapViewOSM';
import DispatchModal from '../components/DispatchModal';
import MockUmsController from '../services/MockUmsController';

const MapScreen = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const mapRef = useRef(null);

  const [dispatch, setDispatch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);
  const [activeDestination, setActiveDestination] = useState(null);
  const [routeStatus, setRouteStatus] = useState('idle'); // idle, pending, active

  // Simular recebimento de dispatch ao montar
  useEffect(() => {
    waitForDispatch();
  }, []);

  const waitForDispatch = async () => {
    setRouteStatus('pending');
    try {
      const incoming = await MockUmsController.simulateIncomingDispatch();
      setDispatch(incoming);
      setShowModal(true);
    } catch (e) {
      console.error('[MapScreen] Erro ao receber dispatch:', e);
      setRouteStatus('idle');
    }
  };

  const handleAccept = async () => {
    if (!dispatch) return;

    setShowModal(false);
    setRouteStatus('active');

    // Responder ao mock backend
    await MockUmsController.respondToDispatch(dispatch.id_chamado, 'ACEITO');

    // Ativar rota no mapa
    setActiveRoute(dispatch.route_coordinates);
    setActiveDestination(dispatch.local_destino);

    // Ajustar zoom para caber a rota
    setTimeout(() => {
      mapRef.current?.fitToRoute();
    }, 500);

    Alert.alert(
      '✅ Rota Aceita',
      `Navegando para: ${dispatch.local_destino}`,
      [{ text: 'OK' }]
    );
  };

  const handleReject = async () => {
    if (!dispatch) return;

    setShowModal(false);
    setRouteStatus('idle');

    // Responder ao mock backend
    await MockUmsController.respondToDispatch(dispatch.id_chamado, 'RECUSADO');

    setDispatch(null);

    Alert.alert(
      '🚫 Rota Recusada',
      'Recusa enviada ao painel. Aguardando novo despacho...',
      [{
        text: 'OK',
        onPress: () => {
          // Após 2 segundos, simular novo dispatch
          setTimeout(waitForDispatch, 2000);
        },
      }]
    );
  };

  const handleFinishRoute = () => {
    Alert.alert(
      'Finalizar Rota',
      'Deseja marcar esta rota como concluída?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            setActiveRoute(null);
            setActiveDestination(null);
            setRouteStatus('idle');
            setDispatch(null);
            // Solicitar novo dispatch
            setTimeout(waitForDispatch, 2000);
          },
        },
      ]
    );
  };

  const handleRequestNewDispatch = () => {
    if (routeStatus === 'active') {
      Alert.alert('Atenção', 'Finalize a rota atual antes de aceitar um novo despacho.');
      return;
    }
    waitForDispatch();
  };

  return (
    <View style={styles.container}>
      {/* Mapa OSM */}
      <MapViewOSM
        ref={mapRef}
        routeCoordinates={activeRoute}
        destination={activeDestination}
      />

      {/* Status Bar Overlay */}
      <View style={[styles.statusBar, isTablet && styles.statusBarTablet]}>
        <View style={styles.statusContent}>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: routeStatus === 'active' ? '#168821' : routeStatus === 'pending' ? '#FFCD07' : '#666' }
          ]} />
          <Text style={styles.statusText}>
            {routeStatus === 'active' && `🚛 Em rota: ${activeDestination}`}
            {routeStatus === 'pending' && '📡 Aguardando despacho...'}
            {routeStatus === 'idle' && '⏹️ Sem rota ativa'}
          </Text>
        </View>
      </View>

      {/* Floating Action Buttons */}
      <View style={[styles.fabContainer, isTablet && styles.fabContainerTablet]}>
        {routeStatus === 'active' && (
          <TouchableOpacity
            style={[styles.fab, styles.fabFinish]}
            onPress={handleFinishRoute}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-done" size={24} color="#FFF" />
          </TouchableOpacity>
        )}

        {routeStatus === 'idle' && (
          <TouchableOpacity
            style={[styles.fab, styles.fabDispatch]}
            onPress={handleRequestNewDispatch}
            activeOpacity={0.7}
          >
            <Ionicons name="radio" size={24} color="#FFF" />
          </TouchableOpacity>
        )}

        {activeRoute && (
          <TouchableOpacity
            style={[styles.fab, styles.fabCenter]}
            onPress={() => mapRef.current?.fitToRoute()}
            activeOpacity={0.7}
          >
            <Ionicons name="locate" size={22} color="#FFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Route Info Panel */}
      {routeStatus === 'active' && dispatch && (
        <View style={[styles.routePanel, isTablet && styles.routePanelTablet]}>
          <View style={styles.routePanelHeader}>
            <Ionicons name="navigate" size={20} color="#168821" />
            <Text style={styles.routePanelTitle}>{dispatch.local_destino}</Text>
          </View>
          <Text style={styles.routePanelSub}>
            {dispatch.id_chamado} • {dispatch.prioridade}
          </Text>
          <Text style={styles.routePanelDesc} numberOfLines={2}>
            {dispatch.descricao_ocorrencia}
          </Text>
        </View>
      )}

      {/* Dispatch Modal */}
      <DispatchModal
        visible={showModal}
        dispatch={dispatch}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071D41',
  },
  statusBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 10,
    left: 16,
    right: 16,
    backgroundColor: '#071D41EE',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusBarTablet: {
    left: 24,
    right: 24,
    top: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    gap: 12,
  },
  fabContainerTablet: {
    right: 24,
    bottom: 120,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabFinish: {
    backgroundColor: '#168821',
  },
  fabDispatch: {
    backgroundColor: '#1351B4',
  },
  fabCenter: {
    backgroundColor: '#071D41',
  },
  routePanel: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 80,
    backgroundColor: '#071D41EE',
    borderRadius: 16,
    padding: 16,
  },
  routePanelTablet: {
    left: 24,
    right: 100,
    bottom: 32,
    padding: 20,
  },
  routePanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  routePanelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
  },
  routePanelSub: {
    fontSize: 12,
    color: '#888',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 6,
  },
  routePanelDesc: {
    fontSize: 13,
    color: '#AAA',
    lineHeight: 18,
  },
});

export default MapScreen;
