import { Card, Text, Stack, Group, Badge, ActionIcon, Loader } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

const CategoryList = ({ categories, loading, onDelete }) => {
  console.log(categories);
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
          style={{ backgroundColor: c.colorCode }}
          w={250}
        >
          <Group justify="space-between" align="center">
            <Text fw={500}>{c.name}</Text>

            {c.isDefault === false && <ActionIcon
              size="sm"
              color="red"
              variant="subtle"
              disabled={c.isDefault === true}
              onClick={() => onDelete(c.id)}
            >
              <IconX size={14} />
            </ActionIcon>}
          </Group>
        </Card>
      ))}
    </Stack>
  );
};

export default CategoryList;
