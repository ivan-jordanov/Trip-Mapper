import React, { useState } from 'react';
import { Group, TextInput, Select, Button, Flex } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

const PinFilters = ({ onSearch, initialFilters = {}, categories }) => {
  const [query, setQuery] = useState(initialFilters.query || '');
  const [category, setCategory] = useState(initialFilters.category || null);
  const [dateFrom, setDateFrom] = useState(initialFilters.dateFrom || '');
  const [dateTo, setDateTo] = useState(initialFilters.dateTo || '');

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSearch({ query: query.trim(), category, dateFrom, dateTo });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Group noWrap justify='center'>
          <TextInput
            placeholder="Search pins by title..."
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            sx={{ flex: 1 }}
          />


          <Select
            data={categories.map(cat => ({ value: cat.id.toString(), label: cat.name }))}
            placeholder="Category"
            value={category}
            onChange={setCategory}
            clearable
            sx={{ width: 180 }}
          />

          {/* Place under the other filters later */}
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

          <Button type="submit" leftSection={<IconSearch size={16} />}>
            Search
          </Button>

      </Group>
    </form>
  );
};

export default PinFilters;
