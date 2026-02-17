import React from 'react';
import { Card, Image, Text, Stack, Group } from '@mantine/core';
import { IconCalendar, IconMapPin } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const placeholder = 'https://images.pexels.com/photos/8058392/pexels-photo-8058392.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

const TripCard = ({ trip }) => {
  const navigate = useNavigate();
  // Could be optimized by storing thumbnail URL in trip data, but this is simpler for now and doesn't require backend changes
  const thumb = trip?.photos && trip.photos.length > 0 ? trip.photos.find(el => !el.pinId)?.url || trip.photos[0].url : placeholder;
  const pinCount = trip?.pins?.length || 0;

  return (
    <Card shadow="md" p="md" radius="lg" withBorder onClick={() => navigate(`/trips/${trip.id}`)} style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Card.Section mb="md">
        <Image src={thumb} alt={trip?.title || 'trip'} height={200} fit="cover" />
      </Card.Section>

      <Stack gap="sm" style={{ flex: 1 }}>
        <Text fw={700} size="lg" lineClamp={2}>{trip?.title || 'Untitled Trip'}</Text>

        {trip?.description && (
          <Text size="sm" c="dimmed" lineClamp={2}>{trip.description}</Text>
        )}

        <Group gap="xs" mt="auto">
          {trip?.dateFrom && (
            <Group gap={4} style={{ fontSize: '12px' }}>
              <IconCalendar size={14} />
              <Text size="xs">{new Date(trip.dateFrom).toLocaleDateString()}</Text>
            </Group>
          )}
          {pinCount > 0 && (
            <Group gap={4} style={{ fontSize: '12px' }}>
              <IconMapPin size={14} />
              <Text size="xs">{pinCount} pin{pinCount !== 1 ? 's' : ''}</Text>
            </Group>
          )}
        </Group>
      </Stack>
    </Card>
  );
};

export default TripCard;
