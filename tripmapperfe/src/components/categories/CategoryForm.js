import {React} from "react";
import {
  Card,
  TextInput,
  Button,
  Stack,
  Title,
  ColorPicker,
  Group,
  Box,
  Container,
  Loader
} from "@mantine/core";
import { IconCategory, IconPalette } from '@tabler/icons-react';


const CategoryForm = ({handleSubmit, name, setName, color, setColor, loading }) => {

  

  return (
    <Card shadow="xs" padding="md">
      <form onSubmit={handleSubmit} autoComplete="off">
        <Stack spacing="sm">
          <Group spacing={8} align="center">
            <Box bg="gray.1" p={4} radius="sm" style={{ display: 'flex', alignItems: 'center' }}>
              <IconCategory size={20} color="#228be6" />
            </Box>
            <Title order={4} fw={600}>New Category</Title>
          </Group>
          <TextInput
            placeholder="Category name"
            leftSection={<IconCategory size={16} color="#868e96" />}
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <Group spacing={8} align="center">
            <Box bg="gray.1" p={4} radius="sm" style={{ display: 'flex', alignItems: 'center' }}>
              <IconPalette size={18} color="#be4bdb" />
            </Box>
            <ColorPicker
              size="xs"
              format="hex"
              swatches={['#2e2e2e', '#868e96', '#fa5252', '#e64980', '#be4bdb', '#7950f2', '#4c6ef5', '#228be6', '#15aabf', '#12b886', '#40c057', '#82c91e', '#fab005', '#fd7e14']}
              value={color}
              onChange={setColor}
            />
          </Group>
          {loading ? (
        <Container>
          <Group justify="center">
            <Loader />
          </Group>
        </Container>
          ) : <Button type="submit" leftSection={<IconCategory size={16} />} loading={loading} disabled={loading}>
            Save
          </Button>}
          
        </Stack>
      </form>
    </Card>
  );
};

export default CategoryForm;
