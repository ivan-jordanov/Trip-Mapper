import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Image,
  Title,
  Text,
  Badge,
  Stack,
  Group,
  Loader,
  Alert,
} from '@mantine/core';
import {
  IconMapPin,
  IconCalendar,
  IconUser,
  IconAlertCircle,
} from '@tabler/icons-react';

const PinDetail = ({ id }) => {
  const [pin, setPin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPinDetails = async () => {
      try {
        setLoading(true);
        // Dummy backend call placeholder
        const response = await fetch(`/api/pins/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch pin details');
        }
        const data = await response.json();
        setPin(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.log(id);
        // Dummy data for development
        setPin({
          id: id,
          title: 'Sample Pin',
          description: 'This is a sample pin description',
          dateVisited: new Date('2025-12-05'),
          categoryId: 1,
          userId: 1,
          category: { id: 1, name: 'Landmarks', color: '#FF5733' },
          user: { id: 1, username: 'john_doe', email: 'john@example.com' },
          photos: [{ id: 1, url: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png' }],
          trip: { id: 1, name: 'Summer Vacation' }
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPinDetails();
    } else {
      // If no ID is provided, reset state or redirect to error page, as appropriate
    }
  }, [id]);

  if (loading) {
    return (
      <Container size="sm" py="xl">
        <Group justify="center">
          <Loader />
        </Group>
      </Container>
    );
  }

  // Can replace with proper error component or redirect
  if (error && !pin) {
    return (
      <Container size="sm" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!pin) {
    return (
      <Container size="sm" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Not Found" color="gray">
          No pin found
        </Alert>
      </Container>
    );
  }

  const photo = pin.photos && pin.photos.length > 0 ? pin.photos[0] : null;

  return (
    <Container size="sm" py="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="lg">
          {/* Header with Title and Category */}
          <div>
            <Group justify="space-between" mb="sm">
              <Title order={2}>{pin.title}</Title>
              {pin.category && (
                <Badge color={pin.category.color} variant="filled">
                  {pin.category.name}
                </Badge>
              )}
            </Group>
          </div>

          {/* Photo Section */}
          {photo && (
            <Card.Section>
              <Image
                src={photo.url}
                alt={pin.title}
                height={300}
                fit="cover"
              />
            </Card.Section>
          )}

          {/* Description */}
          {pin.description && (
            <div>
              <Text fw={600} size="sm" mb="xs">
                Description
              </Text>
              <Text size="sm" c="dimmed">
                {pin.description}
              </Text>
            </div>
          )}

          {/* Info Grid */}
          <Stack gap="md">
            {pin.dateVisited && (
              <Group gap="xs">
                <IconCalendar size={18} stroke={1.5} />
                <div>
                  <Text fw={500} size="sm">
                    Date Visited
                  </Text>
                  <Text size="sm" c="dimmed">
                    {new Date(pin.dateVisited).toLocaleDateString()}
                  </Text>
                </div>
              </Group>
            )}

            {pin.trip && (
              <Group gap="xs">
                <IconMapPin size={18} stroke={1.5} />
                <div>
                  <Text fw={500} size="sm">
                    Trip
                  </Text>
                  <Text size="sm" c="dimmed">
                    {pin.trip.name}
                  </Text>
                </div>
              </Group>
            )}

            {pin.user && (
              <Group gap="xs">
                <IconUser size={18} stroke={1.5} />
                <div>
                  <Text fw={500} size="sm">
                    Added By
                  </Text>
                  <Text size="sm" c="dimmed">
                    {pin.user.username}
                  </Text>
                </div>
              </Group>
            )}
          </Stack>
        </Stack>
      </Card>
    </Container>
  );
};

export default PinDetail;
