import React, { useState } from 'react';
import { Group, TextInput, Select, Button } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

const categories = [
  { value: 'Food', label: 'Food' },
  { value: 'Landmarks', label: 'Landmarks' },
  { value: 'Nature', label: 'Nature' },
  { value: 'Other', label: 'Other' },
];

const PinFilters = ({ onSearch, initialFilters = {} }) => {
  const [query, setQuery] = useState(initialFilters.query || '');
  const [category, setCategory] = useState(initialFilters.category || null);

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSearch({ query: query.trim(), category });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Group noWrap>
        <TextInput
          placeholder="Search pins by title..."
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          sx={{ flex: 1 }}
        />

        <Select
          data={categories}
          placeholder="Category"
          value={category}
          onChange={setCategory}
          clearable
          sx={{ width: 180 }}
        />

        <Button type="submit" leftSection={<IconSearch size={16} />}>
          Search
        </Button>
      </Group>
    </form>
  );
};

export default PinFilters;
