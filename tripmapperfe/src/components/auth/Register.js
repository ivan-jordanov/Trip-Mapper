import React from "react";
import {
  Button,
  Checkbox,
  Flex,
  Group,
  TextInput,
  Select,
  Box,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useAuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const { loading, register } = useAuthContext();
  const navigate = useNavigate();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      password: "",
      confirmPassword: "",
      knownAs: "",
      gender: "Prefer not to say",
      city: "",
      country: "",
      terms: false,
    },

    validate: {
      username: (value) =>
        value.length >= 4
          ? null
          : "Username must be at least 4 characters long",
      password: (value) => {
        if (value.length === 0) {
          return "Password is required";
        }
        if (value.length < 8) {
          return "Password must be at least 8 characters long";
        }

        // Check for complexity (at least one uppercase, one lowercase, and one digit or symbol)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).*$/;

        if (!passwordRegex.test(value)) {
          return "Password must contain at least one uppercase letter, one lowercase letter, and one number or symbol";
        }

        return null;
      },
      confirmPassword: (value, values) =>
        value === values.password ? null : "Passwords do not match",
      terms: (value) =>
        value ? null : "You must agree to the terms and conditions",
    },
  });

  async function handleSubmit(values) {
    await register(values);
    navigate("/login");
  }

  return (
    <Flex justify="center" align="flex-start" direction="column">
      <Box w={300} mx="auto">
        <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
          <Stack>
            <TextInput
              withAsterisk
              label="Username"
              placeholder="Your username"
              key={form.key("username")}
              {...form.getInputProps("username")}
            />

            <TextInput
              label="Nickname"
              placeholder="Your nickname"
              key={form.key("knownAs")}
              {...form.getInputProps("knownAs")}
            />

            <Select
              label="Gender"
              placeholder="Your gender"
              key={form.key("gender")}
              data={["Male", "Female", "Prefer not to say"]}
              {...form.getInputProps("gender")}
            />

            <TextInput
              label="City"
              placeholder="Your city"
              key={form.key("city")}
              {...form.getInputProps("city")}
            />

            <TextInput
              label="Country"
              placeholder="Your country"
              key={form.key("country")}
              {...form.getInputProps("country")}
            />

            <TextInput
              label="Password"
              placeholder="Your password"
              key={form.key("password")}
              type="password"
              {...form.getInputProps("password")}
            />

            <TextInput
              withAsterisk
              label="Confirm Password"
              placeholder="Confirm your password"
              key={form.key("confirmPassword")}
              type="password"
              {...form.getInputProps("confirmPassword")}
            />
          </Stack>

          <Checkbox
            mt="md"
            label="I agree to the terms and conditions"
            key={form.key("terms")}
            {...form.getInputProps("terms", { type: "checkbox" })}
          />

          <Group mt="xl" justify="center" w="100%">
            <Button loading={loading} disabled={loading} type="submit">
              Register
            </Button>
          </Group>
        </form>
      </Box>
    </Flex>
  );
};

export default Register;
