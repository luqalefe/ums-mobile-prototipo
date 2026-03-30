import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  useWindowDimensions, Platform, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SyncService from '../services/SyncService';
import { useLocationTracking } from '../hooks/useLocationTracking';

const HistoryScreen = () => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { locationHistory, pendingCount } = useLocationTracking();
  const [syncHistory, setSyncHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('live'); // 'live' or 'synced'
  const [refreshing, setRefreshing] = useState(false);

  const loadSyncHistory = useCallback(async () => {
    const history = await SyncService.getHistory(50);
    setSyncHistory(history);
  }, []);

  useEffect(() => {
    loadSyncHistory();
    const interval = setInterval(loadSyncHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSyncHistory();
    setRefreshing(false);
  };

  const formatTime = (ts) => {
    if (!ts) return '--:--';
    const d = new Date(ts);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const renderLiveItem = ({ item, index }) => (
    <View style={[styles.item, isTablet && styles.itemTablet]}>
      <View style={[styles.indexBadge, isTablet && styles.indexBadgeTablet]}>
        <Text style={[styles.indexText, isTablet && styles.indexTextTablet]}>{locationHistory.length - index}</Text>
      </View>
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemTime, isTablet && styles.itemTimeTablet]}>{formatTime(item.timestamp)}</Text>
          <Text style={[styles.itemAsset, isTablet && styles.itemAssetTablet]}>{item.id_patrimonio}</Text>
        </View>
        <Text style={[styles.itemCoords, isTablet && styles.itemCoordsTablet]}>
          📍 {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
        </Text>
        {item.speed !== null && item.speed !== undefined && (
          <Text style={[styles.itemDetail, isTablet && styles.itemDetailTablet]}>
            🚀 {(item.speed * 3.6).toFixed(1)} km/h • Precisão: {item.accuracy?.toFixed(0)}m
          </Text>
        )}
      </View>
    </View>
  );

  const renderSyncItem = ({ item }) => {
    const isSuccess = item.syncStatus === 'success';
    return (
      <View style={[styles.item, isTablet && styles.itemTablet]}>
        <View style={[
          styles.syncStatusIcon,
          isTablet && styles.syncStatusIconTablet,
          { backgroundColor: isSuccess ? '#16882120' : '#E5220720' }
        ]}>
          <Ionicons
            name={isSuccess ? 'checkmark-circle' : 'close-circle'}
            size={isTablet ? 28 : 20}
            color={isSuccess ? '#168821' : '#E52207'}
          />
        </View>
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemTime, isTablet && styles.itemTimeTablet]}>
              {formatDate(item.syncedAt)} {formatTime(item.syncedAt)}
            </Text>
            <View style={[styles.syncBadge, isTablet && styles.syncBadgeTablet, { backgroundColor: isSuccess ? '#16882130' : '#E5220730' }]}>
              <Text style={[styles.syncBadgeText, isTablet && styles.syncBadgeTextTablet, { color: isSuccess ? '#168821' : '#E52207' }]}>
                {isSuccess ? 'Enviado' : 'Falhou'}
              </Text>
            </View>
          </View>
          <Text style={[styles.itemCoords, isTablet && styles.itemCoordsTablet]}>
            📍 {item.latitude?.toFixed(6)}, {item.longitude?.toFixed(6)}
          </Text>
        </View>
      </View>
    );
  };

  const data = activeTab === 'live' ? [...locationHistory].reverse() : syncHistory;

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={[styles.tabBar, isTablet && styles.tabBarTablet]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'live' && styles.tabActive]}
          onPress={() => setActiveTab('live')}
        >
          <Ionicons name="radio" size={18} color={activeTab === 'live' ? '#1351B4' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'live' && styles.tabTextActive]}>
            Ao Vivo ({locationHistory.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'synced' && styles.tabActive]}
          onPress={() => setActiveTab('synced')}
        >
          <Ionicons name="cloud-done" size={18} color={activeTab === 'synced' ? '#1351B4' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'synced' && styles.tabTextActive]}>
            Sincronizados ({syncHistory.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pending Banner */}
      {pendingCount > 0 && (
        <View style={styles.pendingBanner}>
          <Ionicons name="time" size={16} color="#FFCD07" />
          <Text style={styles.pendingText}>
            {pendingCount} pacote(s) na fila offline
          </Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={data}
        renderItem={activeTab === 'live' ? renderLiveItem : renderSyncItem}
        keyExtractor={(item, index) => `${activeTab}-${index}`}
        contentContainerStyle={[styles.list, isTablet && styles.listTablet]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1351B4"
            colors={['#1351B4']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#333" />
            <Text style={styles.emptyText}>
              {activeTab === 'live'
                ? 'Inicie o rastreamento na tela Dashboard'
                : 'Nenhuma sincronização registrada'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071D41',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#071D41',
    paddingTop: Platform.OS === 'ios' ? 50 : 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  tabBarTablet: {
    paddingHorizontal: 32,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 8,
  },
  tabActive: {
    borderBottomColor: '#1351B4',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#1351B4',
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFCD0720',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  pendingText: {
    color: '#FFCD07',
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  listTablet: {
    padding: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#071D41',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  itemTablet: {
    padding: 18,
    borderRadius: 16,
  },
  indexBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1351B420',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  indexBadgeTablet: {
    width: 50,
    height: 50,
    borderRadius: 14,
    marginRight: 20,
  },
  indexText: {
    color: '#1351B4',
    fontWeight: '700',
    fontSize: 14,
  },
  indexTextTablet: {
    fontSize: 18,
  },
  syncStatusIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  syncStatusIconTablet: {
    width: 50,
    height: 50,
    borderRadius: 14,
    marginRight: 20,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTime: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  itemTimeTablet: {
    fontSize: 18,
  },
  itemAsset: {
    color: '#1351B4',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: '#1351B420',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  itemAssetTablet: {
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  itemCoords: {
    color: '#A0A0B0',
    fontSize: 13,
    marginTop: 2,
  },
  itemCoordsTablet: {
    fontSize: 16,
    marginTop: 6,
  },
  itemDetail: {
    color: '#666680',
    fontSize: 12,
    marginTop: 2,
  },
  itemDetailTablet: {
    fontSize: 14,
    marginTop: 6,
  },
  syncBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  syncBadgeTablet: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  syncBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  syncBadgeTextTablet: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    color: '#555',
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 250,
  },
});

export default HistoryScreen;
