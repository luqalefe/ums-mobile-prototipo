import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import MapView, { UrlTile, Polyline, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

const INITIAL_REGION = {
  latitude: -9.9747,
  longitude: -67.8100,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const OSM_TILE_URL = 'https://a.tile.openstreetmap.de/{z}/{x}/{y}.png';

const MapViewOSM = forwardRef(({ routeCoordinates, destination, children }, ref) => {
  const mapRef = useRef(null);
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;

  useImperativeHandle(ref, () => ({
    fitToRoute: () => {
      if (mapRef.current && routeCoordinates && routeCoordinates.length > 0) {
        mapRef.current.fitToCoordinates(routeCoordinates, {
          edgePadding: {
            top: isTablet ? 120 : 80,
            right: isTablet ? 80 : 50,
            bottom: isTablet ? 200 : 150,
            left: isTablet ? 80 : 50,
          },
          animated: true,
        });
      }
    },
    animateToRegion: (region, duration) => {
      if (mapRef.current) {
        mapRef.current.animateToRegion(region, duration);
      }
    },
  }));

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={INITIAL_REGION}
      mapType="none"
      rotateEnabled={true}
      zoomEnabled={true}
      scrollEnabled={true}
      pitchEnabled={false}
    >
      {/* Tiles do OpenStreetMap */}
      <UrlTile
        urlTemplate={OSM_TILE_URL}
        maximumZ={19}
        flipY={false}
        tileSize={256}
      />

      {/* Polyline da rota aceita */}
      {routeCoordinates && routeCoordinates.length > 0 && (
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#E53935"
          strokeWidth={5}
          lineDashPattern={[0]}
        />
      )}

      {/* Marker de origem */}
      {routeCoordinates && routeCoordinates.length > 0 && (
        <Marker
          coordinate={routeCoordinates[0]}
          title="Origem"
          description="Ponto de partida"
          pinColor="#4CAF50"
        />
      )}

      {/* Marker de destino */}
      {destination && routeCoordinates && routeCoordinates.length > 0 && (
        <Marker
          coordinate={routeCoordinates[routeCoordinates.length - 1]}
          title={destination}
          description="Destino final"
          pinColor="#E53935"
        >
          <View style={styles.destinationMarker}>
            <View style={styles.destinationMarkerInner}>
              <Ionicons name="school" size={18} color="#FFF" />
            </View>
          </View>
        </Marker>
      )}

      {children}
    </MapView>
  );
});

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  destinationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5393540',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationMarkerInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MapViewOSM;
