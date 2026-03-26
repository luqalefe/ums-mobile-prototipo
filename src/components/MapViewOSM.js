import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

const INITIAL_LAT = -9.9747;
const INITIAL_LNG = -67.8100;
const INITIAL_ZOOM = 14;

const generateHTML = () => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
    }).setView([${INITIAL_LAT}, ${INITIAL_LNG}], ${INITIAL_ZOOM});

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    var routePolyline = null;
    var originMarker = null;
    var destMarker = null;
    var userMarker = null;

    var greenIcon = L.divIcon({
      className: '',
      html: '<div style="width:24px;height:24px;border-radius:50%;background:#1A5C38;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    var redIcon = L.divIcon({
      className: '',
      html: '<div style="width:32px;height:32px;border-radius:50%;background:#E52207;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-size:16px;">🏫</span></div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // 🚗 Icone de Carro para quando estiver na rota
    var carIcon = L.divIcon({
      className: '',
      html: '<div style="width:44px;height:44px;border-radius:50%;background:#fff;border:3px solid #1A5C38;box-shadow:0 4px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:24px;">🚘</div>',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    // 🔵 Icone de Ponto Azul para modo ocioso
    var dotIcon = L.divIcon({
      className: '',
      html: '<div style="width:20px;height:20px;border-radius:50%;background:#4285F4;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    function clearRoute() {
      if (routePolyline) { map.removeLayer(routePolyline); routePolyline = null; }
      if (originMarker) { map.removeLayer(originMarker); originMarker = null; }
      if (destMarker) { map.removeLayer(destMarker); destMarker = null; }
      if (userMarker) { userMarker.setIcon(dotIcon); }
    }

    function drawRoute(coords, destName) {
      clearRoute();
      if (!coords || coords.length === 0) return;

      var latlngs = coords.map(function(c) { return [c.latitude, c.longitude]; });

      routePolyline = L.polyline(latlngs, { color: '#E52207', weight: 5 }).addTo(map);
      originMarker = L.marker(latlngs[0], { icon: greenIcon }).addTo(map).bindPopup('Origem');
      destMarker = L.marker(latlngs[latlngs.length - 1], { icon: redIcon }).addTo(map).bindPopup(destName || 'Destino');

      if (userMarker) { userMarker.setIcon(carIcon); userMarker.bringToFront(); }

      map.fitBounds(routePolyline.getBounds(), { padding: [60, 60] });
    }

    function fitToRoute() {
      if (routePolyline) {
        map.fitBounds(routePolyline.getBounds(), { padding: [60, 60] });
      } else if (userMarker) {
        map.setView(userMarker.getLatLng(), 16);
      }
    }

    function updateLocation(lat, lng) {
      var latlng = [lat, lng];
      if (!userMarker) {
        userMarker = L.marker(latlng, { icon: dotIcon, zIndexOffset: 1000 }).addTo(map);
        if (!routePolyline) map.setView(latlng, 16);
      } else {
        userMarker.setLatLng(latlng);
      }
    }

    // Listen for messages from React Native
    var handler = function(event) {
      try {
        var msg = JSON.parse(event.data);
        if (msg.type === 'drawRoute') {
          drawRoute(msg.coordinates, msg.destination);
        } else if (msg.type === 'clearRoute') {
          clearRoute();
        } else if (msg.type === 'fitToRoute') {
          fitToRoute();
        } else if (msg.type === 'updateLocation') {
          updateLocation(msg.lat, msg.lng);
        }
      } catch(e) {}
    };

    window.addEventListener('message', handler);
    document.addEventListener('message', handler);
  </script>
</body>
</html>
`;

const MapViewOSM = forwardRef(({ routeCoordinates, destination, children }, ref) => {
  const webViewRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useImperativeHandle(ref, () => ({
    fitToRoute: () => {
      sendMessage({ type: 'fitToRoute' });
    },
    animateToRegion: () => {
      // No-op for compatibility, fitToRoute handles this
    },
  }));

  const sendMessage = (msg) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(msg));
    }
  };

  useEffect(() => {
    if (!isReady) return;
    if (routeCoordinates && routeCoordinates.length > 0) {
      sendMessage({
        type: 'drawRoute',
        coordinates: routeCoordinates,
        destination: destination || 'Destino',
      });
    } else {
      sendMessage({ type: 'clearRoute' });
    }
  }, [routeCoordinates, destination, isReady]);

  // Live GPS tracking specifically for the map user marker
  useEffect(() => {
    let subscriber = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      
      subscriber = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 3000, distanceInterval: 5 },
        (loc) => {
          if (isReady) {
            sendMessage({
              type: 'updateLocation',
              lat: loc.coords.latitude,
              lng: loc.coords.longitude
            });
          }
        }
      );
    })();
    return () => { if (subscriber) subscriber.remove(); };
  }, [isReady]);

  return (
    <WebView
      ref={webViewRef}
      source={{ html: generateHTML() }}
      style={styles.map}
      originWhitelist={['*']}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      onMessage={() => {}}
      onLoadEnd={() => setIsReady(true)}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      mixedContentMode="compatibility"
      allowFileAccess={true}
      setSupportMultipleWindows={false}
    />
  );
});

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default MapViewOSM;
