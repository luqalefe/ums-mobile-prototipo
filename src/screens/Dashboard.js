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

/**
 * Painel Principal (Dashboard)
 * Exibe o status do rastreamento GPS, fila de sincronização offline e métricas de conexão.
 * Suporta layouts responsivos para Celulares e Tablets Samsung.
 */
const Dashboard = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const isWideTablet = width >= 1100;

  // Consumo de contextos de rede e rastreamento local
  const { isOnline, forceOffline, toggleForceOffline, stats } = useNetwork();
  const {
    isTracking, startTracking, stopTracking, pendingCount,
    lastLocation, isSyncing, syncNow, lastError, useMockLocation,
  } = useLocationTracking();

  // Animações de entrada para suavizar o carregamento da UI
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  /**
   * Formata coordenadas decimais para exibição
   * @param {number} val Valor da latitude ou longitude
   * @returns {string} Valor formatado ou '--'
   */
  const formatCoord = (val) => val ? val.toFixed(6) : '--';

  /**
   * Formata timestamp para o formato de hora local
   * @param {number} ts Timestamp da localização
   * @returns {string} Hora formatada
   */
  const formatTime = (ts) => {
    if (!ts) return '--:--';
    const d = new Date(ts);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

        {/* Cabeçalho com Status de Conexão */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, isTablet && styles.titleTablet]}>
              Painel de Rastreamento
            </Text>
            <Text style={styles.subtitle}>UMS Logistics • Módulo GPS</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isOnline ? '#1A5C38' : '#E5220730' }]}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#1A5C38' : '#E52207' }]} />
            <Text style={[styles.statusBadgeText, { color: isOnline ? '#FFF' : '#E52207' }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        <View style={styles.bodyWrapper}>
          {/* Indicador de Sincronização (Wi-Fi First) */}
          <SyncIndicator pendingCount={pendingCount} isOnline={isOnline} isSyncing={isSyncing} />

        {/* Grade de Cards Responsiva */}
        <View style={isTablet ? [styles.gridTablet, isWideTablet && { marginHorizontal: -8 }] : styles.gridPhone}>

          {/* Card de Controle de Rastreamento */}
          <View style={isWideTablet ? styles.gridItemWide : (isTablet ? styles.gridItem : null)}>
            <StatusCard
              icon="navigate"
              iconColor={isTracking ? '#168821' : '#FF5252'}
              title="Controle GPS"
              subtitle={useMockLocation ? '📍 Usando posição simulada' : '📡 GPS real ativo'}
            >
              <View style={styles.trackingStatus}>
                <Ionicons
                  name={isTracking ? 'radio' : 'radio-outline'}
                  size={isTablet ? 28 : 24}
                  color={isTracking ? '#168821' : '#666'}
                />
                <Text style={[styles.trackingText, isTablet && styles.trackingTextTablet, { color: isTracking ? '#168821' : '#999' }]}>
                  {isTracking ? 'Rastreando a cada 10s' : 'Parado'}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.button, isTablet && styles.buttonTablet, isTracking ? styles.stopBtn : styles.startBtn]}
                onPress={isTracking ? stopTracking : startTracking}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isTracking ? 'stop-circle' : 'play-circle'}
                  size={isTablet ? 24 : 20}
                  color="#FFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.buttonText, isTablet && styles.buttonTextTablet]}>
                  {isTracking ? 'Parar' : 'Iniciar Rastreamento'}
                </Text>
              </TouchableOpacity>
            </StatusCard>
          </View>

          {/* Last Position Card */}
          <View style={isWideTablet ? styles.gridItemWide : (isTablet ? styles.gridItem : null)}>
            <StatusCard
              icon="location"
              iconColor="#2196F3"
              title="Última Posição"
              subtitle={lastLocation ? `Capturada às ${formatTime(lastLocation.timestamp)}` : 'Aguardando dados...'}
            >
              {lastLocation ? (
                <View style={styles.coordsContainer}>
                  <View style={styles.coordRow}>
                    <Text style={[styles.coordLabel, isTablet && styles.coordLabelTablet]}>LAT</Text>
                    <Text style={[styles.coordValue, isTablet && styles.coordValueTablet]}>{formatCoord(lastLocation.latitude)}</Text>
                  </View>
                  <View style={styles.coordRow}>
                    <Text style={[styles.coordLabel, isTablet && styles.coordLabelTablet]}>LNG</Text>
                    <Text style={[styles.coordValue, isTablet && styles.coordValueTablet]}>{formatCoord(lastLocation.longitude)}</Text>
                  </View>
                  {lastLocation.speed !== null && (
                    <View style={styles.coordRow}>
                      <Text style={[styles.coordLabel, isTablet && styles.coordLabelTablet]}>VEL</Text>
                      <Text style={[styles.coordValue, isTablet && styles.coordValueTablet]}>
                        {(lastLocation.speed * 3.6).toFixed(1)} km/h
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <Text style={[styles.noData, isTablet && styles.noDataTablet]}>Inicie o rastreamento para ver dados</Text>
              )}
            </StatusCard>
          </View>

          {/* Queue Card */}
          <View style={isWideTablet ? styles.gridItemWide : (isTablet ? styles.gridItem : null)}>
            <StatusCard
              icon="cloud-upload"
              iconColor="#FFCD07"
              title="Fila Offline"
              value={pendingCount}
              subtitle="pacotes aguardando sincronização"
              accentColor="#FFCD07"
            >
              {pendingCount > 0 && isOnline && (
                <TouchableOpacity
                  style={[styles.button, isTablet && styles.buttonTablet, styles.syncBtn]}
                  onPress={syncNow}
                  disabled={isSyncing}
                  activeOpacity={0.7}
                >
                  <Ionicons name="sync" size={isTablet ? 22 : 18} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={[styles.buttonText, isTablet && styles.buttonTextTablet]}>
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                  </Text>
                </TouchableOpacity>
              )}
            </StatusCard>
          </View>

          {/* Network Control Card */}
          <View style={isWideTablet ? styles.gridItemWide : (isTablet ? styles.gridItem : null)}>
            <StatusCard
              icon="wifi"
              iconColor="#1351B4"
              title="Controle de Rede"
              subtitle={`${stats.reconnections} reconexão(ões) • ${stats.offlineDuration}s offline total`}
            >
              <TouchableOpacity
                style={[styles.button, isTablet && styles.buttonTablet, forceOffline ? styles.onlineBtn : styles.offlineBtn]}
                onPress={toggleForceOffline}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={forceOffline ? 'wifi' : 'airplane'}
                  size={isTablet ? 22 : 18}
                  color="#FFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.buttonText, isTablet && styles.buttonTextTablet]}>
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
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    paddingBottom: 30,
  },
  bodyWrapper: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#1A5C38',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    borderBottomWidth: 4,
    borderBottomColor: '#F3C524',
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
    color: '#DEDEDE',
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
  gridItemWide: {
    width: '33.33%',
    paddingHorizontal: 8,
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
  trackingTextTablet: {
    fontSize: 18,
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
  buttonTablet: {
    paddingVertical: 18,
    borderRadius: 16,
  },
  startBtn: { backgroundColor: '#168821' },
  stopBtn: { backgroundColor: '#E52207' },
  syncBtn: { backgroundColor: '#1A5C38' },
  onlineBtn: { backgroundColor: '#168821' },
  offlineBtn: { backgroundColor: '#E52207' },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  buttonTextTablet: {
    fontSize: 17,
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
    borderBottomColor: '#E0E0E0',
  },
  coordLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1351B4',
    letterSpacing: 1,
  },
  coordLabelTablet: {
    fontSize: 14,
  },
  coordValue: {
    fontSize: 16,
    color: '#333333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  coordValueTablet: {
    fontSize: 20,
  },
  noData: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 12,
  },
  noDataTablet: {
    fontSize: 16,
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
