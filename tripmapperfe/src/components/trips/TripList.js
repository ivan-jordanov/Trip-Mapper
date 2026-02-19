import React, { useState, useEffect, useCallback } from 'react';
import { Container, SimpleGrid, Loader, Group, Text, Stack, Button } from '@mantine/core';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import TripCard from './TripCard';
import TripFilters from './TripFilters';
import useTrips from '../../hooks/useTrips';

const pageSize = 12; // 3 per row * 4 rows



const TripList = () => {
  const { trips, tripsCount, loading, fetchTrips, fetchTripsCount } = useTrips();
  const [filters, setFilters] = useState({ query: '', dateFrom: null, dateTo: null });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTripsCount(filters.query, filters.dateFrom, filters.dateTo);
    fetchTrips(filters.query, filters.dateFrom, filters.dateTo, page, pageSize);
  }, []);



  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil((tripsCount || 0) / pageSize)));
    setPage(1);
  }, [tripsCount]);

  const handleSearch = async (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    await fetchTripsCount(newFilters.query, newFilters.dateFrom, newFilters.dateTo);
    await fetchTrips(newFilters.query, newFilters.dateFrom, newFilters.dateTo, 1, pageSize);
  };

  const handlePagination = async (newPage) => {
    setPage(newPage);
    await fetchTrips(filters.query, filters.dateFrom, filters.dateTo, newPage, pageSize);
  };

  return (
    <Container fluid p={{ base: 'sm', sm: 'md', md: 'lg' }} style={{ width: '100%' }}>
      <Stack gap={{ base: 'md', sm: 'lg' }}>
        <TripFilters onSearch={handleSearch} initialFilters={filters} />

        {loading ? (
          <Group justify="center" py={{ base: 'lg', sm: 'xl' }}>
            <Loader />
          </Group>
        ) : (
          <>
            {trips.length === 0 ? (
              <Text align="center" c="dimmed" py={{ base: 'lg', sm: 'xl' }} size="sm">
                No trips found
              </Text>
            ) : (
              <SimpleGrid
                cols={{ base: 1, xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
                spacing={{ base: 'sm', sm: 'md', md: 'lg' }}
              >
                {trips.map(trip => (
                  <TripCard key={trip.id} trip={trip} />
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
                {tripsCount} result(s)
              </Text>
            </Group>
          </>
        )}
      </Stack>
    </Container>
  );
};

export default TripList;
