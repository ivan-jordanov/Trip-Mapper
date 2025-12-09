import React from 'react';
import { Button, Checkbox, Flex, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

const Login = () => {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      password: ''
    },

    validate: {
      username: (value) => {
      // 1. Check for empty username
      if (value.length === 0) {
        return 'Username is required';
      }
      // 2. Check minimum length
      if (value.length < 4) {
        return 'Username must be at least 4 characters long';
      }
      
      return null;
    },
      password: (value) => {
      // 1. Check for empty password
      if (value.length === 0) {
        return 'Password is required';
      }
      // 2. Check minimum length
      if (value.length < 8) {
        return 'Password must be at least 8 characters long';
      }
      
      // 3. Check for complexity (at least one uppercase, one lowercase, and one digit or symbol)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).*$/;
      
      if (!passwordRegex.test(value)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number or symbol';
      }
      
      return null;
    }
  }});

  function handleSubmit(values) {
      console.log(values);
    }

  return (
    <form   onSubmit={form.onSubmit((values) => handleSubmit(values))}>
      <Flex       justify="center"
      align="center"
      direction="column"
      >
        <TextInput
          withAsterisk
          label="Username"
          placeholder="Your username"
          key={form.key('username')}
          {...form.getInputProps('username')}
        />

        <TextInput
          withAsterisk
          label="Password"
          placeholder="Your password"
          key={form.key('password')}
          type='password'
          {...form.getInputProps('password')}
        />

        <Group  mt="md">
          <Button type="submit">Log in</Button>
        </Group>

      </Flex>

    </form>
  );
};

export default Login;
