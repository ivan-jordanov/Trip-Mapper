import React, { useMemo } from 'react';
import { Alert, Box, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconMapPin } from '@tabler/icons-react';
import MapView from '../map/MapView';

const PinVisualization = ({ pin }) => {
	const validPin = useMemo(() => {
		if (!pin) return null;
		if (pin.latitude == null || pin.longitude == null) return null;
		return pin;
	}, [pin]);

	if (!validPin) {
		return (
			<Alert icon={<IconAlertCircle size={16} />} title="No location available" color="gray">
				This pin does not have valid coordinates yet.
			</Alert>
		);
	}

	const pinTitle = validPin.title || 'Pin';
	const mapCenter = [validPin.latitude, validPin.longitude];

	return (
		<Stack gap="sm">
			<Text size="sm" c="dimmed">
				<IconMapPin size={14} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />
				Showing location for {pinTitle}
			</Text>

			<Box style={{ height: 420 }}>
				<MapView
					initialCenter={mapCenter}
					initialZoom={13}
					pins={[validPin]}
				/>
			</Box>
		</Stack>
	);
};

export default PinVisualization;
