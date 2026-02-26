import { React } from 'react';
import { Button, Flex, Group, TextInput, Box, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuthContext } from '../../context/AuthContext';

const Login = () => {
    const { loading, isAuthenticated, login } = useAuthContext();

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            username: '',
            password: ''
        },

        validate: {
            username: (value) => {
                if (value.length === 0) {
                    return 'Username is required';
                }
                if (value.length < 4) {
                    return 'Username must be at least 4 characters long';
                }

                return null;
            },
            password: (value) => {
                if (value.length === 0) {
                    return 'Password is required';
                }
                if (value.length < 8) {
                    return 'Password must be at least 8 characters long';
                }

                // Check for complexity (at least one uppercase, one lowercase, and one digit or symbol)
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).*$/;

                if (!passwordRegex.test(value)) {
                    return 'Password must contain at least one uppercase letter, one lowercase letter, and one number or symbol';
                }

                return null;
            }
        }
    });

    async function handleSubmit(values) {
        await login(values.username, values.password);
    }

    return (
        // Outer Flex remains to center the form block vertically/horizontally on the page (if desired)
        <Flex justify="center" align="flex-start" direction="column">
            {/* Box controls the maximum width of the form (e.g., 300px) and centers it horizontally */}
            <Box w={300} mx="auto">
                <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
                    {/* Stack ensures consistent vertical spacing between form elements */}
                    <Stack>
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
                    </Stack>

                    <Group mt="xl" justify="center" w="100%">
                        <Button loading={loading} disabled={loading || isAuthenticated} type="submit">Log in</Button>
                    </Group>
                </form>
            </Box>
        </Flex>
    );
};

export default Login;