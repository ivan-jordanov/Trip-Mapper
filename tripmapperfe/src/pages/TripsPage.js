import React from 'react';
import { Container, Box, Title, Button, Group } from '@mantine/core';
import { IconMap, IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import TripList from '../components/trips/TripList';

const TripsPage = () => {
	const navigate = useNavigate();

	return (
		<Container size="lg" py="md">
			<Group mb="md" justify="space-between" align="center">
				<Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
					<IconMap size={28} color="#228be6" />
					<Title order={2}>Trips</Title>
				</Box>
				<Button
					leftIcon={<IconPlus size={16} />}
					onClick={() => navigate('/trips/create')}
				>
					Create Trip
				</Button>
			</Group>

			<TripList />
		</Container>
	);
};

export default TripsPage;
