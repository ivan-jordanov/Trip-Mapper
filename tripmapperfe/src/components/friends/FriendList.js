import React from 'react';
import { ActionIcon, Avatar, Group, Loader, Stack, Text } from '@mantine/core';
import { IconUserMinus } from '@tabler/icons-react';

const FriendList = ({ friends, loading, removing, onRemove }) => {
  if (loading) return <Loader size="sm" />;
  if (!friends.length) return <Text c="dimmed" size="sm">You have no friends yet.</Text>;

  return (
    <Stack gap="xs">
      {friends.map((friend) => (
        <Group key={friend.userId} justify="space-between" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Avatar color="green" radius="xl">{(friend.knownAs || friend.username).charAt(0).toUpperCase()}</Avatar>
            <div>
              <Text size="sm" fw={600}>{friend.knownAs || friend.username}</Text>
              {friend.knownAs && <Text size="xs" c="dimmed">@{friend.username}</Text>}
            </div>
          </Group>
          <ActionIcon
            variant="subtle"
            color="red"
            aria-label={`Remove ${friend.username}`}
            title={`Remove ${friend.username}`}
            loading={removing}
            onClick={() => onRemove(friend)}
          >
            <IconUserMinus size={17} />
          </ActionIcon>
        </Group>
      ))}
    </Stack>
  );
};

export default FriendList;
