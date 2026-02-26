import React, { useMemo } from 'react';
import { Alert, Box, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconMapPin } from '@tabler/icons-react';
import MapView from '../map/MapView';

const DEFAULT_CENTER = [51.5074, -0.1278];

const TripVisualization = ({ pins = [] }) => {
	const validPins = useMemo(
		() => pins.filter((pin) => pin.latitude != null && pin.longitude != null),
		[pins]
	);

	const mapCenter = useMemo(() => {
		if (validPins.length === 0) return DEFAULT_CENTER;

		const total = validPins.reduce(
			(acc, pin) => ({
				latitude: acc.latitude + pin.latitude,
				longitude: acc.longitude + pin.longitude,
			}),
			{ latitude: 0, longitude: 0 }
		);

		return [total.latitude / validPins.length, total.longitude / validPins.length];
	}, [validPins]);

	if (validPins.length === 0) {
		return (
			<Alert icon={<IconAlertCircle size={16} />} title="No mappable pins" color="gray">
				This trip does not contain pins with valid coordinates yet.
			</Alert>
		);
	}

	return (
		<Stack gap="sm" mb={50} backgroundColor="lightgray" radius="md" p="md">
			<Text size="sm" c="dimmed">
				<IconMapPin size={14} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} />
				Showing {validPins.length} pin{validPins.length !== 1 ? 's' : ''} on the map
			</Text>

			<Box style={{ height: 420 }}>
				<MapView initialCenter={mapCenter} initialZoom={8} pins={validPins} />
			</Box>
		</Stack>
	);
};

export default TripVisualization;
