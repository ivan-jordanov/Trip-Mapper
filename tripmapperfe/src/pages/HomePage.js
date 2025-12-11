import React, { useRef } from 'react';
import { Container, Title, Text, Button, Group } from '@mantine/core';
import MapView from '../components/map/MapView';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
	const navigate = useNavigate();
	const mapRef = useRef(null);
	return (
		<Container size="md" style={{ paddingTop: 24 }}>
			<Title order={2} mb="md">Welcome to Trip-Mapper</Title>
			<Text mb="md">Trip-Mapper lets you record places (pins) and organize them into trips. Use the map below to preview and create pins by clicking on the map. Double click on a pin to view its details</Text>
			<div style={{ flex: 1 }}>
				<MapView ref={mapRef} initialCenter={[51.5074, -0.1278]} initialZoom={10} />
			</div>
			<Group position="right" mt="sm">
				<Button onClick={() => {
					if (mapRef.current) {
						// Sample call to addPinFromPreview; we pass sample dto, in real app this would come from a form
						const newPin = mapRef.current.addPinFromPreview({ title: 'Pin from preview', description: 'Created from preview' });
						console.log('Created pin', newPin);
						navigate('/pins/create');
					}
				}}>Create pin from preview</Button>
			</Group>
		</Container>
	);
};

export default HomePage;
