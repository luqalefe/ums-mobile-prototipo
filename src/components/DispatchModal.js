import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Animated,
  useWindowDimensions, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DispatchModal = ({ visible, dispatch, onAccept, onReject }) => {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 120,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!dispatch) return null;

  const getPriorityColor = (p) => {
    if (p === 'URGENTE') return '#F44336';
    if (p === 'ALTA') return '#FF9800';
    return '#2196F3';
  };

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      {/* Overlay */}
      <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheetContainer,
          isTablet && styles.sheetContainerTablet,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={[styles.sheet, isTablet && styles.sheetTablet]}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.alertIcon}>
              <Ionicons name="alert-circle" size={28} color="#F44336" />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.title, isTablet && styles.titleTablet]}>
                Nova Ocorrência
              </Text>
              <View style={styles.headerMeta}>
                <Text style={styles.chamadoId}>{dispatch.id_chamado}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(dispatch.prioridade) + '25' }]}>
                  <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(dispatch.prioridade) }]} />
                  <Text style={[styles.priorityText, { color: getPriorityColor(dispatch.prioridade) }]}>
                    {dispatch.prioridade}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Descrição */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={18} color="#6C63FF" />
              <Text style={styles.sectionTitle}>Descrição</Text>
            </View>
            <Text style={[styles.description, isTablet && styles.descriptionTablet]}>
              {dispatch.descricao_ocorrencia}
            </Text>
          </View>

          {/* Destino */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={18} color="#E53935" />
              <Text style={styles.sectionTitle}>Destino</Text>
            </View>
            <Text style={[styles.destination, isTablet && styles.destinationTablet]}>
              {dispatch.local_destino}
            </Text>
            <Text style={styles.coordsText}>
              {dispatch.route_coordinates?.[dispatch.route_coordinates.length - 1]?.latitude.toFixed(5)},{' '}
              {dispatch.route_coordinates?.[dispatch.route_coordinates.length - 1]?.longitude.toFixed(5)}
            </Text>
          </View>

          {/* Info extra */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="navigate" size={16} color="#999" />
              <Text style={styles.infoText}>
                {dispatch.route_coordinates?.length || 0} pontos na rota
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={16} color="#999" />
              <Text style={styles.infoText}>
                ~{(dispatch.route_coordinates?.length || 1) * 3} min estimados
              </Text>
            </View>
          </View>

          {/* Botões */}
          <View style={[styles.buttons, isTablet && styles.buttonsTablet]}>
            <TouchableOpacity
              style={[styles.button, styles.rejectButton, isTablet && styles.buttonTablet]}
              onPress={onReject}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={24} color="#FFF" />
              <Text style={[styles.buttonText, isTablet && styles.buttonTextTablet]}>
                Recusar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.acceptButton, isTablet && styles.buttonTablet]}
              onPress={onAccept}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
              <Text style={[styles.buttonText, isTablet && styles.buttonTextTablet]}>
                Aceitar Rota
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainerTablet: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  sheet: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 12,
    maxHeight: '85%',
  },
  sheetTablet: {
    width: '70%',
    maxWidth: 700,
    borderRadius: 24,
    marginBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  alertIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#F4433620',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  titleTablet: {
    fontSize: 26,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chamadoId: {
    fontSize: 13,
    color: '#888',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 16,
    backgroundColor: '#222240',
    borderRadius: 14,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    color: '#DDD',
    lineHeight: 22,
  },
  descriptionTablet: {
    fontSize: 17,
    lineHeight: 26,
  },
  destination: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  destinationTablet: {
    fontSize: 22,
  },
  coordsText: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#999',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonsTablet: {
    gap: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
  },
  buttonTablet: {
    paddingVertical: 22,
    borderRadius: 20,
  },
  rejectButton: {
    backgroundColor: '#D32F2F',
  },
  acceptButton: {
    backgroundColor: '#2E7D32',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
  },
  buttonTextTablet: {
    fontSize: 20,
  },
});

export default DispatchModal;
