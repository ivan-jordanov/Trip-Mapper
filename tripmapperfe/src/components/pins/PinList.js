import React, { useState, useEffect, useCallback } from 'react';
import { Container, SimpleGrid, Loader, Group, Text, Stack, Button } from '@mantine/core';
import { IconSearch, IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import PinCard from './PinCard';
import PinFilters from './PinFilters';

const pageSize = 20; // 5 per row * 4 rows

const generateDummyPins = (count = 40) => {
  const images = [
    'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png',
    'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-9.png',
    'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-5.png',
    'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-3.png',
  ];
  return Array.from({ length: count }).map((_, i) => ({
    id: i + 1,
    title: `Pin ${i + 1}`,
    description: `Sample description for pin ${i + 1}`,
    photos: [{ id: i + 1, url: images[i % images.length], fileName: `photo${i + 1}.jpg` }],
    category: { id: (i % 4) + 1, name: ['Food','Landmarks','Nature','Other'][i % 4], color: ['blue','orange','green','gray'][i % 4] }
  }));
}

const PinList = () => {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ query: '', category: null });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPins = useCallback(async (f = filters, p = page) => {
    try {
      setLoading(true);
      // Dummy backend call placeholder
      // Now im pretty sure the backend returns all the pins instead of per page, so i either need to change that
      // or modify this component to do pagination client-side
      const response = await fetch(`/api/pins?query=${encodeURIComponent(f.query || '')}&category=${f.category || ''}&page=${p}&pageSize=${pageSize}`);
      if (!response.ok) {
        throw new Error('Failed to fetch pins');
      }
      const data = await response.json();
      setPins(data.items || data || []);
      setTotal(data.total || (data.length || 0));
      setError(null);
    } catch (err) {
      // fallback to dummy data
      const all = generateDummyPins(45);
      const filtered = all.filter(pin => {
        const matchesQuery = !f.query || pin.title.toLowerCase().includes(f.query.toLowerCase());
        const matchesCategory = !f.category || pin.category.name === f.category;
        return matchesQuery && matchesCategory;
      });
      setTotal(filtered.length);
      const start = (p - 1) * pageSize;
      setPins(filtered.slice(start, start + pageSize));
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchPins(filters, page);
  }, [fetchPins, filters, page]);

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Container>
      <Stack spacing="md">
        <PinFilters onSearch={handleSearch} initialFilters={filters} />

        {loading ? (
          <Container size="md" py="xl">
                  <Group justify="center">
                    <Loader />
                  </Group>
                </Container>
        ) : (
          <>
            {pins.length === 0 ? (
              <Text align="center" color="dimmed">No pins found</Text>
            ) : (
              <SimpleGrid cols={5} spacing="md" breakpoints={[{ maxWidth: 1200, cols: 4 }, { maxWidth: 900, cols: 3 }, { maxWidth: 600, cols: 2 }] }>
                {pins.map(pin => (
                  <PinCard key={pin.id} pin={pin} />
                ))}
              </SimpleGrid>
            )}

            <Group position="apart" mt="md">
              <Group>
                <Button leftSection={<IconArrowLeft size={16} />} variant="default" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                <Text size="sm">Page {page} / {totalPages}</Text>
                <Button rightSection={<IconArrowRight size={16} />} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
              </Group>
              <Text size="sm" color="dimmed">{total} results</Text>
            </Group>
          </>
        )}
      </Stack>
    </Container>
  );
};

export default PinList;
