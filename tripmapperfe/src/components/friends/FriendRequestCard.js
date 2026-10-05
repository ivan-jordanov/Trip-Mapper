import React from 'react';
import { Button, Card, Group, Stack, Text } from '@mantine/core';

const FriendRequestCard = ({ request, incoming, responding, onAccept, onDecline }) => {
  const user = incoming
    ? { username: request.requesterUsername, knownAs: request.requesterKnownAs }
    : { username: request.addresseeUsername, knownAs: request.addresseeKnownAs };

  return (
    <Card withBorder padding="sm" radius="md">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={0}>
          <Text size="sm" fw={600}>{user.knownAs || user.username}</Text>
          {user.knownAs && <Text size="xs" c="dimmed">@{user.username}</Text>}
        </Stack>
        {incoming ? (
          <Group gap="xs" wrap="nowrap">
            <Button size="xs" color="green" loading={responding} onClick={() => onAccept(request.id)}>Accept</Button>
            <Button size="xs" variant="subtle" color="red" loading={responding} onClick={() => onDecline(request.id)}>Decline</Button>
          </Group>
        ) : <Text size="xs" c="dimmed">Pending</Text>}
      </Group>
    </Card>
  );
};

export default FriendRequestCard;
