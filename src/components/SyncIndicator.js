import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SyncIndicator = ({ pendingCount, isOnline, isSyncing }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSyncing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(progressAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
          Animated.timing(progressAnim, { toValue: 0, duration: 0, useNativeDriver: false }),
        ])
      ).start();
    } else {
      progressAnim.setValue(0);
    }
  }, [isSyncing]);

  useEffect(() => {
    if (pendingCount > 0 && !isOnline) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [pendingCount, isOnline]);

  const getStatusInfo = () => {
    if (isSyncing) return { icon: 'sync', color: '#FF9800', text: 'Sincronizando...' };
    if (pendingCount === 0) return { icon: 'checkmark-circle', color: '#4CAF50', text: 'Tudo sincronizado' };
    if (isOnline) return { icon: 'cloud-upload', color: '#2196F3', text: `${pendingCount} aguardando envio` };
    return { icon: 'cloud-offline', color: '#F44336', text: `${pendingCount} na fila offline` };
  };

  const status = getStatusInfo();
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Ionicons name={status.icon} size={20} color={status.color} />
        </Animated.View>
        <Text style={[styles.text, { color: status.color }]}>{status.text}</Text>
        {pendingCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingCount}</Text>
          </View>
        )}
      </View>
      {isSyncing && (
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  badge: {
    backgroundColor: '#FF5252',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#2A2A3E',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 2,
  },
});

export default SyncIndicator;
