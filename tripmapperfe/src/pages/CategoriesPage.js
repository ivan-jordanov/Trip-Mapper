import React from 'react';
import { Container, Grid, Title, Box } from '@mantine/core';
import { IconCategory } from '@tabler/icons-react';
import CategoryList from '../components/categories/CategoryList';
import CategoryForm from '../components/categories/CategoryForm';

const CategoriesPage = () => {
	return (
		<Container size="lg" py="md">
			<Box mb="md" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
				<IconCategory size={28} color="#228be6" />
				<Title order={2}>Categories</Title>
			</Box>
			<Grid gutter="md">
				<Grid.Col span={6}>
					<CategoryList />
				</Grid.Col>
				<Grid.Col span={6}>
					<CategoryForm />
				</Grid.Col>
			</Grid>
		</Container>
	);
};

export default CategoriesPage;
