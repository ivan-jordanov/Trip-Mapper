import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Box, Button } from '@mantine/core';
import MapMarker from './MapMarker'; // Assuming MapMarker component exists

// fix marker icon paths for CRA and bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const ClickHandler = ({ onSetPreview }) => {
  useMapEvents({
    click(e) {
      onSetPreview([e.latlng.lat, e.latlng.lng]);
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
    } catch (err) {}
    try {
      // prefer setView without animation to avoid odd pans
      map.setView(viewCenter, zoom, { animate: false });
    } catch (err) {
      /* ignore errors */
    }
  }, [viewCenter, zoom, map]);
  return null;
};

const MapView = forwardRef(({ initialCenter = [51.5074, -0.1278], initialZoom = 13 }, ref) => {
  const mapRef = useRef(null);
  // viewCenter: controls the map's visible center (initial geolocation only)
  const [viewCenter, setViewCenter] = useState(initialCenter);
  const [markers, setMarkers] = useState([
    { id: 1, position: initialCenter, title: 'Default marker' }
  ]);
  const [previewMarker, setPreviewMarker] = useState(null);

  const [permissionState, setPermissionState] = useState(null);

  const mapContainerRef = useRef(null);

  const requestPosition = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        // only move the map if the user grants geolocation on first load
        setViewCenter(coords);
        setMarkers([{ id: 'user-default', position: coords, title: 'Your location', meta: { createdBy: 'user-default' } }]);
      },
      (err) => { /* ignore */ },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  useEffect(() => {
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
  }, []);

  // Watch for resizes of the map container and trigger invalidateSize on the map instance
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    let ro;
    try {
      ro = new ResizeObserver(() => {
        try { mapRef.current?.invalidateSize?.(true); } catch {}
      });
      ro.observe(el);
    } catch (err) {
      // ResizeObserver might not be supported; ignore
    }
    // also trigger an initial invalidate to ensure proper sizing when mapRef exists
    try { mapRef.current?.invalidateSize?.(true); } catch {}
    return () => { try { ro?.disconnect?.(); } catch {} };
  }, []);

  // NOTE: Recenter component handles syncing the map view. No legacy setView effect.

  useImperativeHandle(ref, () => ({
    // Confirm the preview marker and add it to persistent markers
    addPinFromPreview: (dto) => {
      if (!previewMarker) return null;
      const newMarker = {
        id: Date.now(),
        position: previewMarker,
        title: dto?.title ?? 'New pin',
        meta: { ...(dto ?? {}), createdBy: 'createdByPreview' }
      };
      // remove the previous created-by-preview markers before adding a new one
      setMarkers((m) => [...m.filter(x => x?.meta?.createdBy !== 'createdByPreview'), newMarker]);
      // No auto-centering when creating a new pin - app-level policy
      setPreviewMarker(null);
      return newMarker;
    },
    getPreviewLocation: () => previewMarker
  }));

  const onSetPreview = (pos) => {
    // replace previous preview - do not change the map view
    try {
      setPreviewMarker(pos);
    } catch (err) {
      // ignore
    }
  };

  return (
    <Box id="map" ref={mapContainerRef} sx={{ height: '100%', position: 'relative' }}>
      <MapContainer center={viewCenter} whenCreated={(m) => { mapRef.current = m; try { m.invalidateSize(true); } catch (err) {} }} zoom={initialZoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onSetPreview={onSetPreview} />
        {markers.map((m) => (
          <MapMarker key={m.id} position={m.position} title={m.title} />
        ))}
        {previewMarker && (
          <MapMarker key={'preview'} position={previewMarker} title={'Preview pin'} />
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
});

export default MapView;