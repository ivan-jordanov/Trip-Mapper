import React, { useState, useEffect, useCallback } from 'react';
import { Container, SimpleGrid, Loader, Group, Text, Stack, Button } from '@mantine/core';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import TripCard from './TripCard';
import TripFilters from './TripFilters';

const pageSize = 12; // 3 per row * 4 rows

const generateDummyTrips = (count = 30) => {
  const images = [
    'https://images.pexels.com/photos/8058392/pexels-photo-8058392.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'https://images.pexels.com/photos/4551152/pexels-photo-4551152.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  ];
  return Array.from({ length: count }).map((_, i) => ({
    id: i + 1,
    title: `Trip ${i + 1}`,
    description: `Explore beautiful destinations on trip ${i + 1}`,
    dateFrom: new Date(2025, 0, 1 + (i % 365)).toISOString().split('T')[0],
    dateVisited: new Date(2025, 0, 15 + (i % 350)).toISOString().split('T')[0],
    photos: [{ id: i + 1, url: images[i % images.length] }],
    pins: Array.from({ length: Math.floor(Math.random() * 5) + 1 }).map((_, j) => ({ id: j + 1, title: `Pin ${j + 1}` }))
  }));
};

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ query: '', dateFrom: null, dateTo: null });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTrips = useCallback(async (f = filters, p = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        query: f.query || '',
        page: p,
        pageSize: pageSize,
        ...(f.dateFrom && { dateFrom: f.dateFrom }),
        ...(f.dateTo && { dateTo: f.dateTo }),
      });
      const response = await fetch(`/api/trips?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch trips');
      const data = await response.json();
      setTrips(data.items || data || []);
      setTotal(data.total || data.length || 0);
    } catch (err) {
      const all = generateDummyTrips(40);
      const filtered = all.filter(trip => {
        const matchesQuery = !f.query || trip.title.toLowerCase().includes(f.query.toLowerCase());
        const matchesDateFrom = !f.dateFrom || new Date(trip.dateFrom) >= new Date(f.dateFrom);
        const matchesDateTo = !f.dateTo || new Date(trip.dateFrom) <= new Date(f.dateTo);
        return matchesQuery && matchesDateFrom && matchesDateTo;
      });
      setTotal(filtered.length);
      const start = (p - 1) * pageSize;
      setTrips(filtered.slice(start, start + pageSize));
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  // Handle fetch on filters or page change, backend returns all trips instead of paginated
  useEffect(() => {
    fetchTrips(filters, page);
  }, [fetchTrips, filters, page]);

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Container>
      <Stack>
        <TripFilters onSearch={handleSearch} initialFilters={filters} />

        {loading ? (
          <Group justify="center" py="xl"><Loader /></Group>
        ) : (
          <>
            {trips.length === 0 ? (
              <Text align="center" c="dimmed" py="xl">No trips found</Text>
            ) : (
              <SimpleGrid cols={3} spacing="lg" breakpoints={[{ maxWidth: 1200, cols: 2 }, { maxWidth: 768, cols: 1 }]}>
                {trips.map(trip => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </SimpleGrid>
            )}

            <Group justify="apart" mt="xl">
              <Group>
                <Button leftIcon={<IconArrowLeft size={16} />} variant="default" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                <Text size="sm">Page {page} / {totalPages}</Text>
                <Button rightIcon={<IconArrowRight size={16} />} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
              </Group>
              <Text size="sm" c="dimmed">{total} results</Text>
            </Group>
          </>
        )}
      </Stack>
    </Container>
  );
};

export default TripList;
