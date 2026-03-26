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
      { borderLeftWidth: 6, borderLeftColor: accentColor || '#1A5C38' }
    ]}>
      <View style={styles.header}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: (iconColor || '#1351B4') + '20' }]}>
            <Ionicons name={icon} size={isTablet ? 28 : 22} color={iconColor || '#1351B4'} />
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
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
    color: '#666666',
    flex: 1,
  },
  titleTablet: {
    fontSize: 18,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginVertical: 4,
  },
  valueTablet: {
    fontSize: 42,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  subtitleTablet: {
    fontSize: 14,
  },
});

export default StatusCard;
