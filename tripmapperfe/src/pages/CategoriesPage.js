import { useEffect, useState } from 'react';
import { Container, Grid, Title, Box } from '@mantine/core';
import { IconCategory } from '@tabler/icons-react';
import CategoryList from '../components/categories/CategoryList';
import CategoryForm from '../components/categories/CategoryForm';
import useCategories from '../hooks/useCategories';

const CategoriesPage = () => {
  const {
    categories,
    loading,
    createCategory,
    fetchCategories,
    deleteCategory,
  } = useCategories();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#228be6');

  useEffect(() => {
    fetchCategories();
    
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('colorCode', color);

    await createCategory(formData);

    setName('');
    setColor('#228be6');
  };

  const handleDelete = async (id) => {
    await deleteCategory(id);
    await fetchCategories();
  };

  return (
    <Container size="lg" py="md">
      <Box mb="md" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <IconCategory size={28} color="#228be6" />
        <Title order={2}>Categories</Title>
      </Box>

      <Grid gutter="md">
        <Grid.Col span={6}>
          <CategoryList
            categories={categories}
            loading={loading}
            onDelete={handleDelete}
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <CategoryForm
            handleSubmit={handleSubmit}
            name={name}
            setName={setName}
            color={color}
            setColor={setColor}
            loading={loading}
          />
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default CategoriesPage;
