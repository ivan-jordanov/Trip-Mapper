import React from "react";
import { Container, Box, Title, Grid } from "@mantine/core";
import { IconMapPin } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import PinList from "../components/pins/PinList";

const PinsPage = () => {
  const small = useMediaQuery("(max-width: 768px)");
  const width = small ? '90%' : '50%';
  const maxWidth = small ? '90%' : '50%';

  return (
    <Container size="xl" py="md" style={{ width, maxWidth }}>
    <Box mb="md" style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <IconMapPin size={28} color="#228be6" />
      <Title order={2}>Pins</Title>
    </Box>

    <PinList />
  </Container>
  );
};

export default PinsPage;
