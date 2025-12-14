import { Card, Text, Stack, Group, Badge, ActionIcon, Loader } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

const CategoryList = ({ categories, loading, onDelete }) => {
  if (loading) {
    return (
      <Group justify="center" py="xl">
        <Loader />
      </Group>
    );
  }

  if (!categories.length) {
    return (
      <Text align="center" c="dimmed" py="xl">
        No categories found
      </Text>
    );
  }

  return (
    <Stack spacing="sm">
      {categories.map((c) => (
        <Card
          key={c.id}
          shadow="xs"
          padding="sm"
          style={{ backgroundColor: c.color }}
        >
          <Group position="apart">
            <Text fw={500}>{c.title}</Text>

            <ActionIcon
              size="sm"
              color="red"
              variant="subtle"
              onClick={() => onDelete(c.id)}
            >
              <IconX size={14} />
            </ActionIcon>
          </Group>
        </Card>
      ))}
    </Stack>
  );
};

export default CategoryList;
