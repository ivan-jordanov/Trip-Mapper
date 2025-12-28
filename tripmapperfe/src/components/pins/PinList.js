import React, { useState, useEffect, useCallback } from 'react';
import { Container, SimpleGrid, Loader, Group, Text, Stack, Button } from '@mantine/core';
import { IconSearch, IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import PinCard from './PinCard';
import PinFilters from './PinFilters';
import usePins from '../../hooks/usePins';
import useCategories from '../../hooks/useCategories';

const pageSize = 20; // 5 per row * 4 rows

// const generateDummyPins = (count = 40) => {
//   const images = [
//     'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png',
//     'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-9.png',
//     'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-5.png',
//     'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-3.png',
//   ];
//   return Array.from({ length: count }).map((_, i) => ({
//     id: i + 1,
//     title: `Pin ${i + 1}`,
//     description: `Sample description for pin ${i + 1}`,
//     photos: [{ id: i + 1, url: images[i % images.length], fileName: `photo${i + 1}.jpg` }],
//     category: { id: (i % 4) + 1, name: ['Food','Landmarks','Nature','Other'][i % 4], color: ['blue','orange','green','gray'][i % 4] }
//   }));
// }

const PinList = () => {
  const {
    pins,
    loading,
    fetchPins,
  } = usePins();
  const{categories, fetchCategories} = useCategories();

  const [filters, setFilters] = useState({ query: '', category: null, dateFrom: '', dateTo: '' });
  const [curPins, setCurPins] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categoriesMap, setCategoriesMap] = useState({});

  // const fetchPins = useCallback(async (f = filters, p = page) => {
  //   try {
  //     setLoading(true);
  //     // Dummy backend call placeholder
  //     // Now im pretty sure the backend returns all the pins instead of per page, so i either need to change that
  //     // or modify this component to do pagination client-side
  //     const response = await fetch(`/api/pins?query=${encodeURIComponent(f.query || '')}&category=${f.category || ''}&page=${p}&pageSize=${pageSize}`);
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch pins');
  //     }
  //     const data = await response.json();
  //     setPins(data.items || data || []);
  //     setTotal(data.total || (data.length || 0));
  //     setError(null);
  //   } catch (err) {
  //     // fallback to dummy data
  //     const all = generateDummyPins(45);
  //     const filtered = all.filter(pin => {
  //       const matchesQuery = !f.query || pin.title.toLowerCase().includes(f.query.toLowerCase());
  //       const matchesCategory = !f.category || pin.category.name === f.category;
  //       return matchesQuery && matchesCategory;
  //     });
  //     setTotal(filtered.length);
  //     const start = (p - 1) * pageSize;
  //     setPins(filtered.slice(start, start + pageSize));
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [filters, page]);

  useEffect(() => {
    // Potential to do, handle backend pagination later
    fetchPins(filters.query, filters.dateFrom, filters.dateTo, filters.category);
    fetchCategories();
  }, []);

  useEffect(() => {
    setCategoriesMap(categories.reduce((map, cat) => { map[cat.id] = cat; return map; }, {}));
  }, [categories]);

  useEffect(() => {
    setTotal(pins.length);
    setTotalPages(Math.max(1, Math.ceil(pins.length / pageSize)));
    setPage(1);
    setCurPins(pins.slice(0, pageSize));
  }, [pins]);

  const handleSearch = async (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    await fetchPins(newFilters.query, newFilters.dateFrom, newFilters.dateTo, newFilters.category);
  };

  const handlePagination = (newPage) => {
    setPage(newPage);
    const start = (newPage - 1) * pageSize;
    setCurPins(pins.slice(start, start + pageSize));
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
            {curPins.length === 0 ? (
              <Text align="center" c="dimmed" py={{ base: 'lg', sm: 'xl' }} size="sm">
                No pins found
              </Text>
            ) : (
              <SimpleGrid
                cols={{ base: 1, xs: 2, sm: 2, md: 3, lg: 4, xl: 5 }}
                spacing={{ base: 'sm', sm: 'md', md: 'md', lg: 'lg' }}
              >
                {curPins.map(pin => (
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
                {total} result(s)
              </Text>
            </Group>
          </>
        )}
      </Stack>
    </Container>
  );
};

export default PinList;
