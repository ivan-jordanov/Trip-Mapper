import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Group,
  Stack,
  Title,
  Text,
  TextInput,
  Button,
  Loader,
  Center,
  Avatar,
  SimpleGrid,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconUser,
  IconAt,
  IconMapPin,
  IconRefresh,
  IconLogout,
} from '@tabler/icons-react';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AccountDetails = () => {
  const small = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const { user, loading, logout, refreshUser, updateAccount } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    knownAs: '',
    gender: '',
    city: '',
    country: '',
  });
  const [draftValues, setDraftValues] = useState({
    knownAs: '',
    gender: '',
    city: '',
    country: '',
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormValues({
      knownAs: user.knownAs || '',
      gender: user.gender || '',
      city: user.city || '',
      country: user.country || '',
    });
  }, [user]);

  const handleChange = (field) => (event) => {
    const { value } = event.currentTarget;
    setDraftValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = () => {
    setDraftValues(formValues);
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateAccount({
      knownAs: draftValues.knownAs,
      gender: draftValues.gender,
      city: draftValues.city,
      country: draftValues.country,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftValues(formValues);
    setIsEditing(false);
  };

  const initials = user?.knownAs?.[0] || user?.username?.[0] || 'U';

  if ((loading && !user) || !user) {
    return (
      <Container size="sm" py="xl">
        <Group justify="center">
          <Loader />
        </Group>
      </Container>
    );
  }

  return (
    <Container size="sm" py="md">
      <Paper withBorder radius="md" p={small ? 'md' : 'lg'}>
        <Stack gap="lg">
          <Group justify="space-between" align="center" wrap="wrap">
            <Group>
              <Avatar color="blue" radius="xl" size="lg">
                {initials.toUpperCase()}
              </Avatar>
              <div>
                <Title order={3}>Account Details</Title>
                <Text size="sm" c="dimmed">
                  Your profile information from Trip-Mapper
                </Text>
              </div>
            </Group>

            <Group grow={small} w={small ? '100%' : 'auto'}>
              <Button onClick={isEditing ? handleSave : handleEdit} loading={loading}>
                {isEditing ? 'Save' : 'Edit'}
              </Button>
              {isEditing && (
                <Button variant="default" onClick={handleCancel} disabled={loading}>
                  Cancel
                </Button>
              )}
              <Button
                variant="light"
                leftSection={<IconRefresh size={16} />}
                loading={loading}
                onClick={refreshUser}
              >
                Refresh
              </Button>
              <Button
                color="red"
                variant="outline"
                leftSection={<IconLogout size={16} />}
                onClick={handleLogout}
              >
                Log out
              </Button>
            </Group>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              readOnly
              label="Username"
              value={user?.username || ''}
              leftSection={<IconUser size={16} />}
            />

            <TextInput
              label="Nickname"
              readOnly={!isEditing}
              value={isEditing ? draftValues.knownAs : formValues.knownAs}
              maxLength={100}
              onChange={handleChange('knownAs')}
              leftSection={<IconUser size={16} />}
            />

            <TextInput
              readOnly
              label="Email"
              value={user?.email || ''}
              leftSection={<IconAt size={16} />}
            />

            <TextInput
              label="Gender"
              readOnly={!isEditing}
              value={isEditing ? draftValues.gender : formValues.gender}
              maxLength={20}
              onChange={handleChange('gender')}
              leftSection={<IconUser size={16} />}
            />

            <TextInput
              label="City"
              readOnly={!isEditing}
              value={isEditing ? draftValues.city : formValues.city}
              maxLength={100}
              onChange={handleChange('city')}
              leftSection={<IconMapPin size={16} />}
            />

            <TextInput
              label="Country"
              readOnly={!isEditing}
              value={isEditing ? draftValues.country : formValues.country}
              maxLength={100}
              onChange={handleChange('country')}
              leftSection={<IconMapPin size={16} />}
            />
          </SimpleGrid>
        </Stack>
      </Paper>
    </Container>
  );
};

export default AccountDetails;
