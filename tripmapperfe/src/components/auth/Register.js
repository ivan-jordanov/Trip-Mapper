import React from 'react';
import { Button, Checkbox, Flex, Group, TextInput, Select } from '@mantine/core';
import { useForm } from '@mantine/form';

const Register = () => {
    const form = useForm({
      mode: 'uncontrolled',
      initialValues: {
        username: '',
        password: '',
        confirmPassword: '',
        knownAs: '',
        gender: 'Prefer not to say',
        city: '',
        country: '',
        terms: false
      },
  
      validate: {
        username: (value) => (value.length >= 4 ? null : 'Username must be at least 4 characters long'),
        password: (value) => (value.length >= 8 ? null : 'Password must be at least 8 characters long'),
        confirmPassword: (value, values) => (value === values.password ? null : 'Passwords do not match'),
        terms: (value) => (value ? null : 'You must agree to the terms and conditions')
      },
    });

    function handleSubmit(values) {
      console.log(values);
    }
  
    return (
      <form  onSubmit={form.onSubmit((values) => handleSubmit(values))}>
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
            
            label="Nickname"
            placeholder="Your nickname"
            key={form.key('knownAs')}
            {...form.getInputProps('knownAs')}
          />

          <Select
            w="83%"
            label="Gender"
            placeholder="Your gender"
            key={form.key('gender')}
            data={['Male', 'Female', 'Prefer not to say']}
            {...form.getInputProps('gender')}
          />

          <TextInput
            
            label="City"
            placeholder="Your city"
            key={form.key('city')}
            {...form.getInputProps('city')}
          />

          <TextInput
            
            label="Country"
            placeholder="Your country"
            key={form.key('country')}
            {...form.getInputProps('country')}
          />
  
          <TextInput
            
            label="Password"
            placeholder="Your password"
            key={form.key('password')}
            type='password'
            {...form.getInputProps('password')}
          />

          <TextInput
            
            withAsterisk
            label="Confirm Password"
            placeholder="Confirm your password"
            key={form.key('confirmPassword')}
            type='password'
            {...form.getInputProps('confirmPassword')}
          />

          <Checkbox
          mt={20}
            label="I agree to the terms and conditions"
            key={form.key('terms')}
            {...form.getInputProps('terms', { type: 'checkbox' })}
          />
  
          <Group  mt="md">
            <Button type="submit">Register</Button>
          </Group>
  
        </Flex>
  
      </form>
    );
};

export default Register;
