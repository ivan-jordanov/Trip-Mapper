import React from 'react';
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
  const { user, loading, logout, refreshUser } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.knownAs?.[0] || user?.username?.[0] || 'U';

  if (loading || !user) {
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
              readOnly
              label="Nickname"
              value={user?.knownAs || ''}
              leftSection={<IconUser size={16} />}
            />

            <TextInput
              readOnly
              label="Email"
              value={user?.email || ''}
              leftSection={<IconAt size={16} />}
            />

            <TextInput
              readOnly
              label="Gender"
              value={user?.gender || ''}
              leftSection={<IconUser size={16} />}
            />

            <TextInput
              readOnly
              label="City"
              value={user?.city || ''}
              leftSection={<IconMapPin size={16} />}
            />

            <TextInput
              readOnly
              label="Country"
              value={user?.country || ''}
              leftSection={<IconMapPin size={16} />}
            />
          </SimpleGrid>
        </Stack>
      </Paper>
    </Container>
  );
};

export default AccountDetails;
