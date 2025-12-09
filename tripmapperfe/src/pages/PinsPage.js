import React from "react";
import { Container, Box, Title, Grid } from "@mantine/core";
import { IconMapPin } from "@tabler/icons-react";
import PinList from "../components/pins/PinList";
import PinForm from "../components/pins/PinForm";

const PinsPage = () => (
  <Container size="lg" py="md">
    <Box mb="md" style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <IconMapPin size={28} color="#228be6" />
      <Title order={2}>Pins</Title>
    </Box>

    <PinList />
  </Container>
);

export default PinsPage;
