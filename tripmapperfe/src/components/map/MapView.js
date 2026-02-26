import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Box, Button } from '@mantine/core';
import MapMarker from './MapMarker';
import usePins from '../../hooks/usePins'; 
import showError from '../../modules/showError';

// fix marker icon paths for CRA and bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const ClickHandler = ({ onMapClick, onSetPreview }) => {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng);
      } else if (onSetPreview) {
        onSetPreview([e.latlng.lat, e.latlng.lng]);
      }
    }
  });
  return null;
};

// Recenter component ensures the map view is set whenever viewCenter changes
const Recenter = ({ viewCenter, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (!viewCenter || !map) return;
    try {
      map.invalidateSize(true);
    } catch (err) {
      showError('Failed to invalidate map size');
    }
    try {
      // prefer setView without animation to avoid odd pans
      map.setView(viewCenter, zoom, { animate: false });
    } catch (err) {
      showError('Failed to recenter map');
    }
  }, [viewCenter, zoom, map]);
  return null;
};

const MapView = ({ initialCenter = [51.5074, -0.1278], initialZoom = 13, pins, previewMarker, onMapClick }) => {
  const mapRef = useRef(null);
  // viewCenter: controls the map's visible center (initial geolocation only)
  const [viewCenter, setViewCenter] = useState(initialCenter);
  const [localPreview, setLocalPreview] = useState(null);

  const [permissionState, setPermissionState] = useState(null);

  const mapContainerRef = useRef(null);

  // Fetch pins from backend
  const { pins: backendPins, loading, fetchPins } = usePins();

  const hasProvidedPins = Array.isArray(pins);

  // Fetch pins on mount when pins are not supplied by parent
  useEffect(() => {
    if (!hasProvidedPins) {
      fetchPins();
    }
  }, [hasProvidedPins]);

  const requestPosition = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        // only move the map if the user grants geolocation on first load
        setViewCenter(coords);
      },
      (err) => { showError('Failed to get user location'); },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  useEffect(() => {
    if (hasProvidedPins) return;
    if (!navigator.geolocation) return;
    // always request position on mount to prompt permission and center map
    requestPosition();
    if (!navigator.permissions) return;
    let mounted = true;
    navigator.permissions.query({ name: 'geolocation' }).then((status) => {
      if (!mounted) return;
      setPermissionState(status.state);
      status.onchange = () => setPermissionState(status.state);
    }).catch(() => {
      // ignore permission query failures
    });
    return () => { mounted = false; };
  }, [hasProvidedPins]);

  // Watch for resizes of the map container and trigger invalidateSize on the map instance
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    let ro;
    try {
      ro = new ResizeObserver(() => {
        try { mapRef.current?.invalidateSize?.(true); } catch (err) { showError('Failed to resize map'); }
      });
      ro.observe(el);
    } catch (err) {
      // ResizeObserver might not be supported; ignore
    }
    // also trigger an initial invalidate to ensure proper sizing when mapRef exists
    try { mapRef.current?.invalidateSize?.(true); } catch (err) { showError('Failed to resize map'); }
    return () => { try { ro?.disconnect?.(); } catch (err) { showError('Failed to disconnect resize observer'); } };
  }, []);

  // NOTE: Recenter component handles syncing the map view. No legacy setView effect.

  const onSetPreview = (pos) => {
    // replace previous preview - do not change the map view
    try {
      setLocalPreview(pos);
    } catch (err) {
      showError('Failed to set preview marker');
    }
  };

  const effectivePreview = previewMarker ?? localPreview;

  const markerSource = hasProvidedPins ? pins : backendPins;
  const shouldAllowPreviewCreation = !hasProvidedPins;

  // Filter pins with valid coordinates only
  const markersToRender = markerSource.filter(
    (pin) => pin.latitude != null && pin.longitude != null
  );

  return (
    <Box id="map" ref={mapContainerRef} sx={{ height: '100%', position: 'relative' }}>
      <MapContainer center={viewCenter} whenCreated={(m) => { mapRef.current = m; try { m.invalidateSize(true); } catch (err) {} }} zoom={initialZoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <ClickHandler
          onSetPreview={shouldAllowPreviewCreation ? onSetPreview : null}
          onMapClick={onMapClick}
        />
        {markersToRender.map((pin) => (
          <MapMarker 
            key={pin.id} 
            id={pin.id} 
            position={[pin.latitude, pin.longitude]} 
            title={pin.title || 'Pin'} 
          />
        ))}
        {effectivePreview && (
          <MapMarker key={'preview'} id={null} position={effectivePreview} title={'Preview pin'} />
        )}
        {/* ensure recenter happens when viewCenter state changes */}
        <Recenter viewCenter={viewCenter} zoom={initialZoom} />
      </MapContainer>
      {permissionState === 'prompt' && (
        <Box sx={{ position: 'absolute', right: 12, top: 12, zIndex: 1000 }}>
          <Button size="xs" onClick={requestPosition}>Enable location</Button>
        </Box>
      )}
      
    </Box>
  );
};

export default MapView;