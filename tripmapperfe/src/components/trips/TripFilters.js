import React, { useState } from 'react';
import { Group, TextInput, Button, Stack, Container } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

const TripFilters = ({ onSearch, initialFilters = {} }) => {
  const [query, setQuery] = useState(initialFilters.query || '');
  const [dateFrom, setDateFrom] = useState(initialFilters.dateFrom || '');
  const [dateTo, setDateTo] = useState(initialFilters.dateTo || '');

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSearch({
      query: query.trim(),
      dateFrom: dateFrom || null,
      dateTo: dateTo || null
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Container fluid p={0}>
        <Stack gap={{ base: 'sm', sm: 'md' }}>
          <TextInput
            placeholder="Search trips by title..."
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            style={{ width: '100%' }}
          />

          <Group gap={{ base: 'xs', sm: 'md' }} wrap="wrap" align="flex-end">
            <TextInput
              type="date"
              label="From Date"
              placeholder="Start date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.currentTarget.value)}
              style={{ minWidth: '150px', flex: 1 }}
            />
            <TextInput
              type="date"
              label="To Date"
              placeholder="End date"
              value={dateTo}
              onChange={(e) => setDateTo(e.currentTarget.value)}
              style={{ minWidth: '150px', flex: 1 }}
            />
            <Button 
              type="submit" 
              leftSection={<IconSearch size={16} />}
            >
              Search
            </Button>
          </Group>
        </Stack>
      </Container>
    </form>
  );
};

export default TripFilters;
