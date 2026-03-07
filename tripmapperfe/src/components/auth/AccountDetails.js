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
  Avatar,
  SimpleGrid,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconUser,
  IconMapPin,
  IconRefresh,
  IconLogout,
} from '@tabler/icons-react';
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AccountDetails = () => {
  const small = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const { user, loading, logout, refreshUser, updateAccount, changePassword } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({
    knownAs: '',
    gender: '',
    city: '',
    country: '',
  });
  const [passwordValues, setPasswordValues] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showPasswordErrors, setShowPasswordErrors] = useState(false);
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

  const handlePasswordChange = (field) => (event) => {
    const { value } = event.currentTarget;
    setPasswordValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateNewPassword = (value) => {
    if (value.length === 0) {
      return 'Password is required';
    }
    if (value.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).*$/;

    if (!passwordRegex.test(value)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number or symbol';
    }

    return null;
  };

  const newPasswordError = validateNewPassword(passwordValues.newPassword);
  const confirmNewPasswordError =
    passwordValues.confirmNewPassword.length === 0
      ? 'Please confirm your new password'
      : passwordValues.confirmNewPassword !== passwordValues.newPassword
        ? 'New passwords do not match'
        : null;
  const canSubmitPasswordChange =
    !!passwordValues.currentPassword && !newPasswordError && !confirmNewPasswordError;

  const handleChangePassword = async () => {
    setShowPasswordErrors(true);

    if (!canSubmitPasswordChange) {
      return;
    }

    try {
      await changePassword({
        CurrentPassword: passwordValues.currentPassword,
        NewPassword: passwordValues.newPassword,
      });
    } catch {
      return;
    }

    setPasswordValues({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setShowPasswordErrors(false);
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

          <Stack gap="sm">
            <Title order={4}>Change Password</Title>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                label="Current Password"
                type="password"
                value={passwordValues.currentPassword}
                onChange={handlePasswordChange('currentPassword')}
              />
              <TextInput
                label="New Password"
                type="password"
                value={passwordValues.newPassword}
                onChange={handlePasswordChange('newPassword')}
                error={showPasswordErrors ? newPasswordError : null}
              />
              <TextInput
                label="Confirm New Password"
                type="password"
                value={passwordValues.confirmNewPassword}
                onChange={handlePasswordChange('confirmNewPassword')}
                error={showPasswordErrors ? confirmNewPasswordError : null}
              />
            </SimpleGrid>
            <Group justify="flex-end">
              <Button
                onClick={handleChangePassword}
                loading={loading}
              >
                Change Password
              </Button>
            </Group>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default AccountDetails;
