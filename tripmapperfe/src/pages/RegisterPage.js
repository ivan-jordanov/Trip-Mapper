import React from 'react';
import { Container, Box, Title } from '@mantine/core';
import { IconDoorEnter } from '@tabler/icons-react';
import Register from '../components/auth/Register';

const RegisterPage = () => (
    <Container size="sm" py="md">
        <Box mb="md" style={{ display: 'flex', gap: 10 }}>
          <IconDoorEnter size={28} color="#228be6" />
          <Title order={2}>Register</Title>
        </Box>
        <Register />
    </Container>
);

export default RegisterPage;
