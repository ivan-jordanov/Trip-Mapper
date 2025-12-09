import React from 'react';
import { Card, Text, Stack, Group, Badge, Box } from '@mantine/core';
import { IconCategory } from '@tabler/icons-react';

const CategoryList = () => {
  // Placeholder list visual only
  const placeholder = [
    { id: 1, title: 'Food', color: 'blue' },
    { id: 2, title: 'Museums', color: 'red' },
    { id: 3, title: 'Parks', color: 'green' },
  ];

  return (
    <Stack spacing="sm">
      {placeholder.map((c) => (
        <Card style={{backgroundColor: c.color}} key={c.id} shadow="xs" padding="sm">
          <Group position="apart">
            <Group spacing={6} align="center">
              <Text fw={500}>{c.title}</Text>
            </Group>
            <Badge color="black" variant="light">3</Badge>
          </Group>
        </Card>
      ))}
    </Stack>
  );
};

export default CategoryList;
