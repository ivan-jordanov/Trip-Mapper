import React, { useState, useEffect } from 'react';
import { Card, Text, Stack, Group, Badge, ActionIcon, Loader, Button, Container } from '@mantine/core';
import { IconX, IconArrowLeft, IconArrowRight } from '@tabler/icons-react';

const pageSize = 8;

const CategoryList = ({ categories, onDelete }) => {
  const [curCategories, setCurCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setTotal(categories.length);
    setTotalPages(Math.max(1, Math.ceil(categories.length / pageSize)));
    setPage(1);
    setCurCategories(categories.slice(0, pageSize));
  }, [categories]);

  const handlePagination = (newPage) => {
    setPage(newPage);
    const start = (newPage - 1) * pageSize;
    setCurCategories(categories.slice(start, start + pageSize));
  };

  if (!categories.length) {
    return (
      <Text align="center" c="dimmed" py="xl">
        No categories found
      </Text>
    );
  }

  return (
    <Container fluid p={0}>
      <Stack gap="sm">
        {curCategories.map((c) => (
          <Card
            key={c.id}
            shadow="xs"
            padding="sm"
            style={{ backgroundColor: c.colorCode }}
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

        <Group justify="center" mt="lg" wrap="nowrap" gap={{ base: 'xs', sm: 'sm' }}>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            variant="default"
            onClick={() => handlePagination(Math.max(1, page - 1))}
            disabled={page === 1}
            size="xs"
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
            size="xs"
          >
            Next
          </Button>
        </Group>
        <Group justify="flex-start" mt="sm" style={{ width: '100%' }}>
          <Text size="sm" c="dimmed">
            {total} result(s)
          </Text>
        </Group>
      </Stack>
    </Container>
  );
};

export default CategoryList;
