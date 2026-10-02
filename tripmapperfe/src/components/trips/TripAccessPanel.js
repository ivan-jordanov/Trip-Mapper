import React, { useEffect, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Loader,
  Stack,
  Text,
  Select,
  TextInput,
} from '@mantine/core';
import { IconLogout, IconUserMinus, IconX } from '@tabler/icons-react';
import tripService from '../../services/tripService';
import usersService from '../../services/usersService';
import showError from '../../modules/showError';
import showStatus from '../../modules/showStatus';

const TripAccessPanel = ({ tripId, isOwner = false, currentUserId, selectedUsernames = [], onSelectedUsernamesChange }) => {
  const isCreateMode = !tripId;
  const canManage = isCreateMode || isOwner;
  const [collaborators, setCollaborators] = useState([]);
  const [username, setUsername] = useState('');
  const [accessLevel, setAccessLevel] = useState('View');
  const [userOptions, setUserOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (isCreateMode) return;

    const fetchCollaborators = async () => {
      setLoading(true);
      try {
        setCollaborators(await tripService.getCollaborators(tripId));
      } catch (err) {
        showError(err.response?.data?.message || err.message || 'Unable to load trip collaborators.');
      } finally {
        setLoading(false);
      }
    };

    fetchCollaborators();
  }, [isCreateMode, tripId]);

  useEffect(() => {
    if (username.trim().length < 2) {
      setUserOptions([]);
      return undefined;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const users = await usersService.searchUsers(username.trim());
        if (active) setUserOptions(users.map((user) => user.username));
      } catch (err) {
        if (active) showError(err.response?.data?.message || err.message || 'Unable to search users.');
      } finally {
        if (active) setSearching(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [username]);

  const handleGrant = async () => {
    if (!username.trim()) return;

    setSubmitting(true);
    try {
      const granted = await tripService.grantAccess(tripId, username.trim(), accessLevel);
      setCollaborators((current) => [...current, granted]);
      setUsername('');
      showStatus('Trip access granted');
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Unable to grant trip access.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateUserOption = (value) => {
    if (!selectedUsernames.includes(value)) {
      onSelectedUsernamesChange([...selectedUsernames, value]);
    }
    setUsername('');
  };

  const handleGrantUserOption = (value) => {
    setUsername(value);
    setUserOptions([]);
  };

  const handleRevoke = async (userId) => {
    try {
      await tripService.revokeAccess(tripId, userId);
      setCollaborators((current) => current.filter((collaborator) => collaborator.userId !== userId));
      showStatus('Trip access revoked');
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Unable to revoke trip access.');
    }
  };

  const handleLeave = async () => {
    try {
      await tripService.leaveTrip(tripId);
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
          <Text size="sm">{collaborator.knownAs || collaborator.username}</Text>
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
                onChange={(event) => setUsername(event.currentTarget.value)}
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
                onChange={(event) => setUsername(event.currentTarget.value)}
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