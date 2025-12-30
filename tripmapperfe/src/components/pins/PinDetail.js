import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePins from '../../hooks/usePins';
import showError from '../../modules/showError';
import useCategories from '../../hooks/useCategories';
import {
  Container,
  Card,
  Image,
  Title,
  Text,
  Badge,
  Stack,
  Group,
  Loader,
  Alert,
  Button,
  Modal,
} from '@mantine/core';
import {
  IconMapPin,
  IconCalendar,
  IconUser,
  IconAlertCircle,
} from '@tabler/icons-react';

const PinDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const {categories, fetchCategories} = useCategories();

  useEffect(() => {
    fetchCategories();
  }, []);

  const {
    pinDetails: pin,
    loading,
    fetchPinDetails,
    deletePin,
  } = usePins();
  const altImage = 'https://images.pexels.com/photos/68704/pexels-photo-68704.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deletePin(id);
    }  finally {
      setDeleting(false);
      setDeleteModalOpened(false);
      navigate('/pins');
    }
  };

  useEffect(() => {

    if (id) {
      fetchPinDetails(id);
    } else {
      showError('No pin ID provided');
    }
  }, [id]);
  
  if (loading) {
    return (
      <Container size="sm" py="xl">
        <Group justify="center">
          <Loader />
        </Group>
      </Container>
    );
  }

  if (!pin) {
    return (
      <Container size="sm" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Not Found" color="gray">
          No pin found
        </Alert>
      </Container>
    );
  }

  const photo = pin.photos && pin.photos.length > 0 ? pin.photos[0] : null;

  return (
    <Container size="sm" py="xl">
      <Modal opened={deleteModalOpened} onClose={() => setDeleteModalOpened(false)} title="Delete Pin" centered>
              <Stack spacing="md">
                <Alert icon={<IconAlertCircle size={16} />} title="Confirm Deletion" color="red">
                  Are you sure you want to delete this pin? This action cannot be undone.
                </Alert>
                <Group justify="flex-end">
                  <Button variant="default" onClick={() => setDeleteModalOpened(false)}>
                    Cancel
                  </Button>
                  <Button color="red" loading={deleting} onClick={handleDelete}>
                    Delete Pin
                  </Button>
                </Group>
              </Stack>
            </Modal>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="lg">
          {/* Header with Title and Category */}
          <div>
            <Group justify="space-between" mb="sm">
              <Title order={2}>{pin.title}</Title>
              {pin.categoryId && (
                <Badge color={categories.find(cat => cat.id === pin.categoryId)?.colorCode || 'gray'} variant="filled">
                  {categories.find(cat => cat.id === pin.categoryId)?.name || 'Unknown'}
                </Badge>
              )}
            </Group>
          </div>

          {/* Photo Section */}
          {photo && (
            <Card.Section>
              <Image
                src={photo.url}
                fallbackSrc={altImage}
                alt={pin.title}
                height={300}
                fit="cover"
              />
            </Card.Section>
          )}

          {/* Description */}
          {pin.description && (
            <div>
              <Text fw={600} size="sm" mb="xs">
                Description
              </Text>
              <Text size="sm" c="dimmed">
                {pin.description}
              </Text>
            </div>
          )}

          {/* Info Grid */}
          <Stack gap="md">
            {pin.dateVisited && (
              <Group gap="xs">
                <IconCalendar size={18} stroke={1.5} />
                <div>
                  <Text fw={500} size="sm">
                    Date Visited
                  </Text>
                  <Text size="sm" c="dimmed">
                    {new Date(pin.dateVisited).toLocaleDateString()}
                  </Text>
                </div>
              </Group>
            )}

            {pin.createdAt && (
              <Group gap="xs">
                <IconCalendar size={18} stroke={1.5} />
                <div>
                  <Text fw={500} size="sm">
                    Date Created
                  </Text>
                  <Text size="sm" c="dimmed">
                    {new Date(pin.createdAt).toLocaleDateString()}
                  </Text>
                </div>
              </Group>
            )}

            {pin.trip && (
              <Group gap="xs">
                <IconMapPin size={18} stroke={1.5} />
                <div>
                  <Text fw={500} size="sm">
                    Trip
                  </Text>
                  <Text size="sm" c="dimmed">
                    {pin.trip.name}
                  </Text>
                </div>
              </Group>
            )}

            {pin.user && (
              <Group gap="xs">
                <IconUser size={18} stroke={1.5} />
                <div>
                  <Text fw={500} size="sm">
                    Added By
                  </Text>
                  <Text size="sm" c="dimmed">
                    {pin.user.username}
                  </Text>
                </div>
              </Group>
            )}
          </Stack>

          <Group justify="flex-end">
            <Button color="red" variant="light" onClick={() => setDeleteModalOpened(true)}>Delete</Button>
          </Group>
        </Stack>
      </Card>
    </Container>
  );
};

export default PinDetail;
