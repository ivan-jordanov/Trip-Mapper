import React, { useState, useEffect, useCallback } from 'react';
import { Container, SimpleGrid, Loader, Group, Text, Stack, Button } from '@mantine/core';
import { IconSearch, IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import PinCard from './PinCard';
import PinFilters from './PinFilters';
import usePins from '../../hooks/usePins';
import useCategories from '../../hooks/useCategories';

const pageSize = 20; // 5 per row * 4 rows

const PinList = () => {
  const {
    pins,
    pinsCount,
    loading,
    fetchPins,
    fetchPinsCount
  } = usePins();
  const{categories, fetchCategories} = useCategories();

  const [filters, setFilters] = useState({ query: '', category: null, dateFrom: '', createdFrom: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoriesMap, setCategoriesMap] = useState({});

  useEffect(() => {
    fetchPinsCount(filters.query, filters.dateFrom, filters.dateTo, filters.category);
    fetchPins(filters.query, filters.dateFrom, filters.dateTo, filters.category, page, pageSize);
    fetchCategories();
  }, []);

  useEffect(() => {
    setCategoriesMap(categories.reduce((map, cat) => { map[cat.id] = cat; return map; }, {}));
  }, [categories]);

  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(pinsCount / pageSize)));
    setPage(1);
  }, [pinsCount]);

  const handleSearch = async (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    await fetchPinsCount(newFilters.query, newFilters.dateFrom, newFilters.createdFrom, newFilters.category);
    await fetchPins(newFilters.query, newFilters.dateFrom, newFilters.createdFrom, newFilters.category, 1, pageSize);
  };

  const handlePagination = async(newPage) => {
    setPage(newPage);
    await fetchPins(filters.query, filters.dateFrom, filters.createdFrom, filters.category, newPage, pageSize);
  };

  return (
    <Container fluid p={{ base: 'sm', sm: 'md', md: 'lg' }} style={{ width: '100%' }}>
      <Stack gap={{ base: 'md', sm: 'lg' }}>
        <PinFilters onSearch={handleSearch} initialFilters={filters} categories={categories} />

        {loading ? (
          <Group justify="center" py={{ base: 'lg', sm: 'xl' }}>
            <Loader />
          </Group>
        ) : (
          <>
            {pins.length === 0 ? (
              <Text align="center" c="dimmed" py={{ base: 'lg', sm: 'xl' }} size="sm">
                No pins found
              </Text>
            ) : (
              <SimpleGrid
                cols={{ base: 1, xs: 2, sm: 2, md: 3, lg: 4, xl: 5 }}
                spacing={{ base: 'sm', sm: 'md', md: 'md', lg: 'lg' }}
              >
                {pins.map(pin => (
                  <PinCard key={pin.id} pin={pin} category={categoriesMap[pin.categoryId]} />
                ))}
              </SimpleGrid>
            )}

            <Group justify="center" mt={{ base: 'lg', sm: 'xl' }} wrap="wrap" gap={{ base: 'xs', sm: 'sm' }}>
              <Button
                leftSection={<IconArrowLeft size={16} />}
                variant="default"
                onClick={() => handlePagination(Math.max(1, page - 1))}
                disabled={page === 1}
                size="sm"
              >
                Prev
              </Button>
              <Text size="sm" fw={500}>
                Page {page} / {totalPages}
              </Text>
              <Button
                rightSection={<IconArrowRight size={16} />}
                onClick={() => handlePagination(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                size="sm"
              >
                Next
              </Button>
            </Group>
            <Group justify="flex-start" mt={{ base: 'sm', sm: 'md' }} style={{ width: '100%' }}>
              <Text size="sm" c="dimmed">
                {pinsCount} result(s)
              </Text>
            </Group>
          </>
        )}
      </Stack>
    </Container>
  );
};

export default PinList;
