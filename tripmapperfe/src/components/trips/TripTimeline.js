import React, { useState } from 'react';
import { Box, Card, Group, Image, Modal, Stack, Text, Timeline } from '@mantine/core';
import { IconCalendar, IconMapPin, IconPhoto } from '@tabler/icons-react';

const parseDate = (value) => {
  if (!value) return null;

  const dateValue = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00`
    : value;
  const date = new Date(dateValue);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (date) => date
  ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  : 'Undated';

const getDateKey = (date) => date
  ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  : 'undated';

const sortByDate = (first, second) => {
  if (!first.date && !second.date) return 0;
  if (!first.date) return 1;
  if (!second.date) return -1;
  return first.date - second.date;
};

const TimelineEvent = ({ event, onPhotoClick }) => {
  if (event.type === 'trip-marker') {
    return (
      <Group gap="xs">
        <IconCalendar size={16} />
        <Text size="sm">{event.label}</Text>
      </Group>
    );
  }

  if (event.type === 'pin') {
    return (
      <Stack gap={2}>
        <Group gap="xs">
          <IconMapPin size={16} />
          <Text fw={600} size="sm">{event.title}</Text>
        </Group>
        {event.description && <Text size="sm" c="dimmed">{event.description}</Text>}
        {event.categoryName && <Text size="xs" c="dimmed">{event.categoryName}</Text>}
      </Stack>
    );
  }

  return (
    <Card
      withBorder
      padding="xs"
      radius="sm"
      onClick={() => onPhotoClick(event.url)}
      style={{ cursor: 'pointer', maxWidth: 360 }}
    >
      <Group gap="sm" wrap="nowrap">
        <Image src={event.url} alt="Trip event" w={88} h={60} fit="cover" radius="sm" />
        <Stack gap={2}>
          <Group gap="xs">
            <IconPhoto size={16} />
            <Text size="sm" fw={500}>Photo added</Text>
          </Group>
          <Text size="xs" c="dimmed">Click to view</Text>
        </Stack>
      </Group>
    </Card>
  );
};

const TripTimeline = ({ tripDetails }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const events = [];

  const tripStart = parseDate(tripDetails?.dateFrom);
  const tripEnd = parseDate(tripDetails?.dateVisited);

  if (tripStart) {
    events.push({
      type: 'trip-marker',
      date: tripStart,
      label: 'Trip started',
    });
  }

  if (tripEnd) {
    events.push({
      type: 'trip-marker',
      date: tripEnd,
      label: 'Trip ended',
    });
  }

  (tripDetails?.pins || []).forEach((pin) => {
    const date = parseDate(pin.dateVisited || pin.createdAt);
    events.push({
      type: 'pin',
      date,
      title: pin.title || 'Pin',
      description: pin.description,
      categoryName: pin.category?.name,
      categoryColor: pin.category?.colorCode,
    });

    (pin.photos || []).forEach((photo) => {
      events.push({
        type: 'photo',
        date: parseDate(photo.uploadedAt),
        url: photo.url,
      });
    });
  });

  (tripDetails?.photos || [])
    .filter((photo) => photo.pinId == null)
    .forEach((photo) => {
      events.push({
        type: 'photo',
        date: parseDate(photo.uploadedAt),
        url: photo.url,
      });
    });

  events.sort(sortByDate);

  const groupedEvents = events.reduce((groups, event) => {
    const dateKey = getDateKey(event.date);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(event);
    return groups;
  }, {});

  const groupedEntries = Object.entries(groupedEvents);

  if (groupedEntries.length === 0) {
    return (
      <Card withBorder>
        <Text size="sm" c="dimmed">No dated events are available for this trip yet.</Text>
      </Card>
    );
  }

  return (
    <Box>
      <Timeline active={groupedEntries.length} bulletSize={28} lineWidth={2}>
        {groupedEntries.flatMap(([dateKey, dateEvents]) => dateEvents.map((event, eventIndex) => (
          <Timeline.Item
            key={`${dateKey}-${event.type}-${eventIndex}`}
            title={eventIndex === 0 ? formatDate(event.date) : undefined}
            bullet={(
              <Box
                w={12}
                h={12}
                style={{
                  backgroundColor: event.categoryColor || 'var(--mantine-color-blue-6)',
                  borderRadius: '50%',
                }}
              />
            )}
          >
            <TimelineEvent event={event} onPhotoClick={setSelectedPhoto} />
          </Timeline.Item>
        )))}
      </Timeline>

      <Modal
        opened={selectedPhoto !== null}
        onClose={() => setSelectedPhoto(null)}
        closeOnClickOutside
        centered
        size="xl"
        withCloseButton={false}
        padding={0}
        styles={{
          content: { backgroundColor: 'transparent' },
          body: { padding: 0 },
        }}
      >
        {selectedPhoto && (
          <Image
            src={selectedPhoto}
            alt="Trip photo"
            fit="contain"
            mah="75vh"
          />
        )}
      </Modal>
    </Box>
  );
};

export default TripTimeline;
