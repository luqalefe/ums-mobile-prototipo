import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  useWindowDimensions, Animated, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '../contexts/NetworkContext';
import { useLocationTracking } from '../hooks/useLocationTracking';
import StatusCard from '../components/StatusCard';
import SyncIndicator from '../components/SyncIndicator';

const Dashboard = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { isOnline, forceOffline, toggleForceOffline, stats } = useNetwork();
  const {
    isTracking, startTracking, stopTracking, pendingCount,
    lastLocation, isSyncing, syncNow, lastError, useMockLocation,
  } = useLocationTracking();

  // Animações de entrada
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const formatCoord = (val) => val ? val.toFixed(6) : '--';
  const formatTime = (ts) => {
    if (!ts) return '--:--';
    const d = new Date(ts);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, isTablet && styles.titleTablet]}>
              Painel de Rastreamento
            </Text>
            <Text style={styles.subtitle}>UMS Logistics • Módulo GPS</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isOnline ? '#4CAF5030' : '#F4433630' }]}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#4CAF50' : '#F44336' }]} />
            <Text style={[styles.statusBadgeText, { color: isOnline ? '#4CAF50' : '#F44336' }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Sync Indicator */}
        <SyncIndicator pendingCount={pendingCount} isOnline={isOnline} isSyncing={isSyncing} />

        {/* Cards Grid */}
        <View style={isTablet ? styles.gridTablet : styles.gridPhone}>

          {/* GPS Control Card */}
          <View style={isTablet ? styles.gridItem : null}>
            <StatusCard
              icon="navigate"
              iconColor={isTracking ? '#4CAF50' : '#FF5252'}
              title="Controle GPS"
              subtitle={useMockLocation ? '📍 Usando posição simulada' : '📡 GPS real ativo'}
            >
              <View style={styles.trackingStatus}>
                <Ionicons
                  name={isTracking ? 'radio' : 'radio-outline'}
                  size={24}
                  color={isTracking ? '#4CAF50' : '#666'}
                />
                <Text style={[styles.trackingText, { color: isTracking ? '#4CAF50' : '#999' }]}>
                  {isTracking ? 'Rastreando a cada 10s' : 'Parado'}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.button, isTracking ? styles.stopBtn : styles.startBtn]}
                onPress={isTracking ? stopTracking : startTracking}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isTracking ? 'stop-circle' : 'play-circle'}
                  size={20}
                  color="#FFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.buttonText}>
                  {isTracking ? 'Parar' : 'Iniciar Rastreamento'}
                </Text>
              </TouchableOpacity>
            </StatusCard>
          </View>

          {/* Last Position Card */}
          <View style={isTablet ? styles.gridItem : null}>
            <StatusCard
              icon="location"
              iconColor="#2196F3"
              title="Última Posição"
              subtitle={lastLocation ? `Capturada às ${formatTime(lastLocation.timestamp)}` : 'Aguardando dados...'}
            >
              {lastLocation ? (
                <View style={styles.coordsContainer}>
                  <View style={styles.coordRow}>
                    <Text style={styles.coordLabel}>LAT</Text>
                    <Text style={styles.coordValue}>{formatCoord(lastLocation.latitude)}</Text>
                  </View>
                  <View style={styles.coordRow}>
                    <Text style={styles.coordLabel}>LNG</Text>
                    <Text style={styles.coordValue}>{formatCoord(lastLocation.longitude)}</Text>
                  </View>
                  {lastLocation.speed !== null && (
                    <View style={styles.coordRow}>
                      <Text style={styles.coordLabel}>VEL</Text>
                      <Text style={styles.coordValue}>
                        {(lastLocation.speed * 3.6).toFixed(1)} km/h
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <Text style={styles.noData}>Inicie o rastreamento para ver dados</Text>
              )}
            </StatusCard>
          </View>

          {/* Queue Card */}
          <View style={isTablet ? styles.gridItem : null}>
            <StatusCard
              icon="cloud-upload"
              iconColor="#FF9800"
              title="Fila Offline"
              value={pendingCount}
              subtitle="pacotes aguardando sincronização"
              accentColor="#FF9800"
            >
              {pendingCount > 0 && isOnline && (
                <TouchableOpacity
                  style={[styles.button, styles.syncBtn]}
                  onPress={syncNow}
                  disabled={isSyncing}
                  activeOpacity={0.7}
                >
                  <Ionicons name="sync" size={18} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.buttonText}>
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                  </Text>
                </TouchableOpacity>
              )}
            </StatusCard>
          </View>

          {/* Network Control Card */}
          <View style={isTablet ? styles.gridItem : null}>
            <StatusCard
              icon="wifi"
              iconColor="#6C63FF"
              title="Controle de Rede"
              subtitle={`${stats.reconnections} reconexão(ões) • ${stats.offlineDuration}s offline total`}
            >
              <TouchableOpacity
                style={[styles.button, forceOffline ? styles.onlineBtn : styles.offlineBtn]}
                onPress={toggleForceOffline}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={forceOffline ? 'wifi' : 'airplane'}
                  size={18}
                  color="#FFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.buttonText}>
                  {forceOffline ? 'Restaurar Conexão' : 'Simular Offline'}
                </Text>
              </TouchableOpacity>
            </StatusCard>
          </View>
        </View>

        {/* Error Banner */}
        {lastError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#FF5252" />
            <Text style={styles.errorText}>{lastError}</Text>
          </View>
        )}

        <Text style={styles.footer}>UMS Mobile v1.0 • {isTablet ? 'Tablet' : 'Celular'}</Text>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#13131A',
  },
  content: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  titleTablet: {
    fontSize: 32,
  },
  subtitle: {
    fontSize: 13,
    color: '#666680',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  gridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridPhone: {},
  gridItem: {
    width: '50%',
    paddingHorizontal: 6,
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  trackingText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  startBtn: { backgroundColor: '#4CAF50' },
  stopBtn: { backgroundColor: '#F44336' },
  syncBtn: { backgroundColor: '#2196F3' },
  onlineBtn: { backgroundColor: '#4CAF50' },
  offlineBtn: { backgroundColor: '#607D8B' },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  coordsContainer: {
    marginTop: 4,
  },
  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
  },
  coordLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C63FF',
    letterSpacing: 1,
  },
  coordValue: {
    fontSize: 16,
    color: '#E0E0E0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  noData: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 12,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF525220',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  errorText: {
    color: '#FF8A80',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    textAlign: 'center',
    color: '#333',
    fontSize: 11,
    marginTop: 24,
  },
});

export default Dashboard;
