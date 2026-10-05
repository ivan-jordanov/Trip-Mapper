import React, { useState } from 'react';
import { Button, Group, TextInput } from '@mantine/core';

const AddFriendForm = ({ loading, onSubmit }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const value = username.trim();
    if (!value) return;
    await onSubmit(value);
    setUsername('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Group align="flex-end" wrap="nowrap">
        <TextInput
          label="Add a friend"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Button type="submit" loading={loading}>Send</Button>
      </Group>
    </form>
  );
};

export default AddFriendForm;
