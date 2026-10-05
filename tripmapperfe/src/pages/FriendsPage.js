import React, { useEffect } from 'react';
import { Divider, Loader, Stack, Text, Title } from '@mantine/core';
import showError from '../modules/showError';
import showStatus from '../modules/showStatus';
import useFriends from '../hooks/useFriends';
import AddFriendForm from '../components/friends/AddFriendForm';
import FriendList from '../components/friends/FriendList';
import FriendRequestCard from '../components/friends/FriendRequestCard';

const FriendsPage = () => {
  const {
    friends,
    incomingRequests,
    outgoingRequests,
    loading,
    sending,
    responding,
    removing,
    error,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
  } = useFriends();

  const run = async (action, successMessage) => {
    try {
      await action();
      showStatus(successMessage);
    } catch (requestError) {
      showError(requestError.response?.data?.message || requestError.message || 'Request failed.');
    }
  };

  useEffect(() => {
    if (error) showError(error.response?.data?.message || error.message || 'Unable to load friends.');
  }, [error]);

  return (
    <Stack gap="lg">
      <Title order={3}>Friends</Title>
      <AddFriendForm
        loading={sending}
        onSubmit={(username) => run(() => sendRequest(username), 'Friend request sent')}
      />

      <Divider label="Incoming requests" labelPosition="left" />
      {loading ? <Loader size="sm" /> : incomingRequests.length ? (
        <Stack gap="xs">
          {incomingRequests.map((request) => (
            <FriendRequestCard
              key={request.id}
              request={request}
              incoming
              responding={responding}
              onAccept={(id) => run(() => acceptRequest(id), 'Friend request accepted')}
              onDecline={(id) => run(() => declineRequest(id), 'Friend request declined')}
            />
          ))}
        </Stack>
      ) : <Text size="sm" c="dimmed">No incoming requests.</Text>}

      <Divider label="Outgoing requests" labelPosition="left" />
      {loading ? <Loader size="sm" /> : outgoingRequests.length ? (
        <Stack gap="xs">
          {outgoingRequests.map((request) => (
            <FriendRequestCard key={request.id} request={request} incoming={false} responding={false} />
          ))}
        </Stack>
      ) : <Text size="sm" c="dimmed">No pending outgoing requests.</Text>}

      <Divider label="Your friends" labelPosition="left" />
      <FriendList
        friends={friends}
        loading={loading}
        removing={removing}
        onRemove={(friend) => run(() => removeFriend(friend.userId), `${friend.username} removed`)}
      />
    </Stack>
  );
};

export default FriendsPage;
