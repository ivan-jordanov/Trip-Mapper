import React, { useState } from 'react';
import { Container, Title, Text, Button, Group, Badge } from '@mantine/core';
import MapView from '../components/map/MapView';
import { useNavigate } from 'react-router-dom';
import usePins from '../hooks/usePins';

const HomePage = () => {
	const navigate = useNavigate();
	const { pins, loading } = usePins();
	const [previewCoords, setPreviewCoords] = useState(null);

	const handleMapClick = (latlng) => {
		setPreviewCoords([latlng.lat, latlng.lng]);
	};

	const handleCreate = () => {
		if (!previewCoords) return;
		const [lat, lng] = previewCoords;
		navigate('/pins/create', { state: { initialPin: { latitude: lat, longitude: lng } } });
	};

	return (
		<Container size="md" style={{ paddingTop: 24 }}>
			<Title order={2} mb="md">Welcome to Trip-Mapper</Title>
			<Text mb="md">Trip-Mapper lets you record places (pins) and organize them into trips. Use the map below to preview and create pins by clicking on the map. Double click on a pin to view its details</Text>
			<div style={{ flex: 1 }}>
				<MapView
					initialCenter={[51.5074, -0.1278]}
					initialZoom={10}
					onMapClick={handleMapClick}
					previewMarker={previewCoords}
				/>
			</div>
			<Group position="apart" mt="sm">
				<Group spacing="xs">
					{previewCoords && (
						<Badge color="teal" variant="light">
							{previewCoords[0].toFixed(5)}, {previewCoords[1].toFixed(5)}
						</Badge>
					)}
				</Group>
				<Button onClick={handleCreate} disabled={!previewCoords || loading}>
					Create pin from preview
				</Button>
			</Group>
		</Container>
	);
};

export default HomePage;
