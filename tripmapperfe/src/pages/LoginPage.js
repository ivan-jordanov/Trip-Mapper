import React from 'react';
import { Container, Box, Title } from '@mantine/core';
import { IconLogin } from '@tabler/icons-react';
import Login from '../components/auth/Login';

const LoginPage = () => (
  <Container size="sm" py="md">
    <Box mb="md" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <IconLogin size={28} color="#228be6" />
      <Title order={2}>Log In</Title>
    </Box>
    <Login />
  </Container>
);

export default LoginPage;
