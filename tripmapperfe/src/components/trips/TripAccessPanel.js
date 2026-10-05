import React, { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Loader,
  Stack,
  Text,
  Select,
  TextInput,
} from '@mantine/core';
import { IconLogout, IconUserMinus, IconX } from '@tabler/icons-react';
import showError from '../../modules/showError';
import showStatus from '../../modules/showStatus';
import { usePresence } from '../../context/PresenceContext';
import useTripCollaborators from '../../hooks/useTripCollaborators';
import useUserSearch from '../../hooks/useUserSearch';

const TripAccessPanel = ({ tripId, isOwner = false, currentUserId, selectedUsernames = [], onSelectedUsernamesChange }) => {
  const isCreateMode = !tripId;
  const canManage = isCreateMode || isOwner;
  const { isOnline } = usePresence();
  const [username, setUsername] = useState('');
  const [searchText, setSearchText] = useState('');
  const [accessLevel, setAccessLevel] = useState('View');
  const { collaborators, loading, grant, revoke, leave, granting: submitting } = useTripCollaborators(isCreateMode ? null : tripId);
  const { users: searchedUsers, loading: searching } = useUserSearch(searchText);
  const userOptions = searchedUsers.map((user) => user.username);

  const handleGrant = async () => {
    if (!username.trim()) return;

    try {
      await grant({ username: username.trim(), accessLevel });
      setUsername('');
      setSearchText('');
      showStatus('Trip access granted');
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Unable to grant trip access.');
    }
  };

  const handleCreateUserOption = (value) => {
    if (!selectedUsernames.includes(value)) {
      onSelectedUsernamesChange([...selectedUsernames, value]);
    }
    setUsername('');
    setSearchText('');
  };

  const handleGrantUserOption = (value) => {
    setUsername(value);
    setSearchText('');
  };

  const handleRevoke = async (userId) => {
    try {
      await revoke(userId);
      showStatus('Trip access revoked');
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Unable to revoke trip access.');
    }
  };

  const handleLeave = async () => {
    try {
      await leave();
      showStatus('You left the trip');
      window.location.href = '/trips';
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Unable to leave trip.');
    }
  };
  return (
    <Stack gap="sm">
      <Text fw={600} size="sm">Trip collaborators</Text>

      {!isCreateMode && (loading ? <Loader size="sm" /> : collaborators.map((collaborator) => (
        <Group key={collaborator.userId} justify="space-between">
          <Group gap="xs">
            <Box
              component="span"
              title={isOnline(collaborator.userId) ? 'Online' : 'Offline'}
              w={8}
              h={8}
              style={{
                borderRadius: '50%',
                backgroundColor: isOnline(collaborator.userId) ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-gray-5)',
              }}
            />
            <Text size="sm">{collaborator.knownAs || collaborator.username}</Text>
          </Group>
          <Group gap="xs">
            <Badge color={collaborator.accessLevel === 'Owner' ? 'blue' : collaborator.accessLevel === 'Editor' ? 'teal' : 'gray'}>
              {collaborator.accessLevel}
            </Badge>
            {isOwner && collaborator.userId !== currentUserId && collaborator.accessLevel !== 'Owner' && (
              <Button
                size="xs"
                variant="subtle"
                color="red"
                leftSection={<IconUserMinus size={14} />}
                onClick={() => handleRevoke(collaborator.userId)}
              >
                Remove
              </Button>
            )}
          </Group>
        </Group>
      )))}

      {canManage && (
        <Group align="flex-end">
          {isCreateMode ? (
            <Stack gap="xs" style={{ flex: 1 }}>
              <TextInput
                label="Share with users"
                placeholder="Search by username"
                value={username}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setUsername(value);
                  setSearchText(value);
                }}
                rightSection={searching ? <Loader size="xs" /> : null}
              />
              {userOptions.length > 0 && (
                <Stack gap={4}>
                  {userOptions.map((option) => (
                    <Button
                      key={option}
                      variant={selectedUsernames.includes(option) ? 'light' : 'subtle'}
                      color={selectedUsernames.includes(option) ? 'teal' : 'gray'}
                      justify="flex-start"
                      disabled={selectedUsernames.includes(option)}
                      onClick={() => handleCreateUserOption(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </Stack>
              )}
              {selectedUsernames.length > 0 && (
                <Group gap="xs">
                  {selectedUsernames.map((selectedUsername) => (
                    <Badge
                      key={selectedUsername}
                      rightSection={(
                        <ActionIcon
                          size="xs"
                          variant="transparent"
                          color="gray"
                          title={`Remove ${selectedUsername}`}
                          onClick={() => onSelectedUsernamesChange(
                            selectedUsernames.filter((value) => value !== selectedUsername)
                          )}
                        >
                          <IconX size={12} />
                        </ActionIcon>
                      )}
                    >
                      {selectedUsername}
                    </Badge>
                  ))}
                </Group>
              )}
            </Stack>
          ) : (
            <Stack gap="xs" style={{ flex: 1 }}>
              <TextInput
                label="Add collaborator"
                placeholder="Search by username"
                value={username}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setUsername(value);
                  setSearchText(value);
                }}
                rightSection={searching ? <Loader size="xs" /> : null}
              />
              {userOptions.length > 0 && (
                <Stack gap={4}>
                  {userOptions.map((option) => (
                    <Button
                      key={option}
                      variant="subtle"
                      color="gray"
                      justify="flex-start"
                      onClick={() => handleGrantUserOption(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </Stack>
              )}
            </Stack>
          )}
          {!isCreateMode && (
            <>
              <Select
                label="Role"
                data={[{ value: 'View', label: 'View' }, { value: 'Editor', label: 'Editor' }]}
                value={accessLevel}
                onChange={setAccessLevel}
                w={110}
              />
              <Button loading={submitting} onClick={handleGrant}>Add</Button>
            </>
          )}
        </Group>
      )}

      {!isCreateMode && !isOwner && (
        <Button variant="light" color="red" leftSection={<IconLogout size={14} />} onClick={handleLeave}>
          Leave trip
        </Button>
      )}
    </Stack>
  );
};

export default TripAccessPanel;