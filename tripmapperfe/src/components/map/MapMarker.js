import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Ensure marker icon is set
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapMarker = ({ position, title = 'Pin' }) => {
  return (
    <Marker position={position}>
      <Popup>{title}</Popup>
    </Marker>
  );
};

export default MapMarker;
