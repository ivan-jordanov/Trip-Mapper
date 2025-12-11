import React, { useState } from 'react';
import { Group, TextInput, Button, Stack, Flex } from '@mantine/core';
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

      <Flex  mih={50}
      gap="md"
      
      justify="center"
      align="flex-start"
      direction="row"
      wrap="nowrap">
        <Stack>
          <TextInput
            placeholder="Search trips by title..."
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            sx={{ flex: 1 }}
          />

          <Group>

            <TextInput
              type="date"
              label="From Date"
              placeholder="Start date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.currentTarget.value)}
              sx={{ flex: 1 }}
            />
            <TextInput
              type="date"
              label="To Date"
              placeholder="End date"
              value={dateTo}
              onChange={(e) => setDateTo(e.currentTarget.value)}
              sx={{ flex: 1 }}
            />
          </Group>
        </Stack>

        <Button type="submit" leftIcon={<IconSearch size={16} />}>
          Search
        </Button>
      </Flex>

    </form>
  );
};

export default TripFilters;
