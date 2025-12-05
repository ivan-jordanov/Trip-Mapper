import React from 'react';
import { useMap } from 'react-leaflet';
import { ActionIcon, Box, Tooltip } from '@mantine/core';
import { IconCrosshair } from '@tabler/icons-react';

const MapControls = ({ onCenter }) => {
  const map = useMap();

  const handleCenter = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 13);
      });
    } else if (onCenter) {
      onCenter();
    }
  };

  return (
    <Box sx={{ position: 'absolute', right: 12, top: 12, zIndex: 1000 }}>
      <Tooltip label="Center to your location">
        <ActionIcon onClick={handleCenter} variant="filled">
          <IconCrosshair size={18} />
        </ActionIcon>
      </Tooltip>
    </Box>
  );
};

export default MapControls;
