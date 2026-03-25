import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StatusCard = ({ icon, iconColor, title, value, subtitle, accentColor, children }) => {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View style={[
      styles.card,
      isTablet && styles.cardTablet,
      accentColor && { borderLeftWidth: 4, borderLeftColor: accentColor }
    ]}>
      <View style={styles.header}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: (iconColor || '#6C63FF') + '20' }]}>
            <Ionicons name={icon} size={isTablet ? 28 : 22} color={iconColor || '#6C63FF'} />
          </View>
        )}
        <Text style={[styles.title, isTablet && styles.titleTablet]}>{title}</Text>
      </View>

      {value !== undefined && (
        <Text style={[styles.value, isTablet && styles.valueTablet, accentColor && { color: accentColor }]}>
          {value}
        </Text>
      )}

      {subtitle && (
        <Text style={[styles.subtitle, isTablet && styles.subtitleTablet]}>{subtitle}</Text>
      )}

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E2E',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardTablet: {
    padding: 24,
    marginBottom: 18,
    borderRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A0A0B0',
    flex: 1,
  },
  titleTablet: {
    fontSize: 18,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  valueTablet: {
    fontSize: 42,
  },
  subtitle: {
    fontSize: 12,
    color: '#666680',
    marginTop: 4,
  },
  subtitleTablet: {
    fontSize: 14,
  },
});

export default StatusCard;
