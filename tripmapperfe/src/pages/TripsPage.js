import React from 'react';
import { Container, Box, Title, Button, Group } from '@mantine/core';
import { IconMap, IconPlus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import TripList from '../components/trips/TripList';
import { useMediaQuery } from '@mantine/hooks';

const TripsPage = () => {
	const small = useMediaQuery("(max-width: 768px)");
	const navigate = useNavigate();
	const width = small ? '90%' : '50%';
	const maxWidth = small ? '90%' : '50%';

	return (
    	<Container size="xl" py="md" style={{ width, maxWidth }}>
			<Group mb="md" justify="space-between" align="center">
				<Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
					<IconMap size={28} color="#228be6" />
					<Title order={2}>Trips</Title>
				</Box>
				<Button
					leftSection={<IconPlus size={16} />}
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
