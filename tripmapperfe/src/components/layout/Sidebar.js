import React, { useState } from 'react';
import { Drawer, Group, Stack, Anchor, Text, Button, Box } from '@mantine/core';
import { IconMenu2, IconHome, IconMapPin, IconCategory, IconLogin, IconDoorEnter, IconBus, IconLogout } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const [opened, setOpened] = useState(false);
  const { user, isAuthenticated, logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    setOpened(false);
  };

  const navLinks = [
    { icon: IconHome, label: 'Home', to: '/' },
    { icon: IconMapPin, label: 'Pins', to: '/pins' },
    { icon: IconBus, label: 'Trips', to: '/trips' },
    { icon: IconCategory, label: 'Categories', to: '/categories' },
  ];

  return (
    <>
      <Box component="button" onClick={() => setOpened(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <IconMenu2 size={24} />
      </Box>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Menu"
        position="left"
        size="xs"
        zIndex={1000}
      >
        <Stack gap="md">
          <Stack gap="xs">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Anchor
                  key={link.to}
                  component={Link}
                  to={link.to}
                  c="gray.8"
                  onClick={() => setOpened(false)}
                  style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                >
                  <Icon size={18} style={{ marginRight: 8 }} />
                  {link.label}
                </Anchor>
              );
            })}
          </Stack>

          {isAuthenticated ? (
            <Stack gap="xs">
              <Text size="sm" c="dimmed">
                Welcome, <strong>{user.username}</strong>
              </Text>
              <Button
                color="red"
                variant="outline"
                fullWidth
                leftSection={<IconLogout size={16} />}
                onClick={handleLogout}
              >
                Log out
              </Button>
            </Stack>
          ) : (
            <Stack gap="xs">
              <Anchor
                component={Link}
                to="/login"
                c="green.6"
                onClick={() => setOpened(false)}
                style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
              >
                <IconLogin size={18} style={{ marginRight: 8 }} />
                Log in
              </Anchor>
              <Anchor
                component={Link}
                to="/register"
                c="green.6"
                onClick={() => setOpened(false)}
                style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
              >
                <IconDoorEnter size={18} style={{ marginRight: 8 }} />
                Register
              </Anchor>
            </Stack>
          )}
        </Stack>
      </Drawer>
    </>
  );
};

export default Sidebar;
