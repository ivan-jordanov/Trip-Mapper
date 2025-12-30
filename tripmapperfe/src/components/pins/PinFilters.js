import React, { useState } from 'react';
import { Group, TextInput, Select, Button, Stack, Container } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

const PinFilters = ({ onSearch, initialFilters = {}, categories }) => {
  const [query, setQuery] = useState(initialFilters.query || '');
  const [category, setCategory] = useState(initialFilters.category || null);
  const [dateFrom, setDateFrom] = useState(initialFilters.dateFrom || '');
  const [createdFrom, setCreatedFrom] = useState(initialFilters.createdFrom || '');

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSearch({ query: query.trim(), category, dateFrom, createdFrom });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Container fluid p={0}>
        <Stack gap={{ base: 'sm', sm: 'md' }}>
          <Group grow gap={{ base: 'xs', sm: 'md' }} wrap="wrap">
            <TextInput
              placeholder="Search pins by title..."
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              style={{ minWidth: '150px', flex: 1 }}
            />

            <Select
              data={categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))}
              placeholder="Category"
              value={category}
              onChange={setCategory}
              clearable
              style={{ minWidth: '150px', flex: 1 }}
            />
          </Group>

          <Group gap={{ base: 'xs', sm: 'md' }} wrap="wrap" align="flex-end">
            <TextInput
              type="date"
              label="Visited from"
              placeholder="Visited from"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.currentTarget.value)}
              style={{ minWidth: '150px', flex: 1 }}
            />
            <TextInput
              type="date"
              label="Created from"
              placeholder="Created from"
              value={createdFrom}
              onChange={(e) => setCreatedFrom(e.currentTarget.value)}
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

export default PinFilters;
