import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Card,
  Image,
  Title,
  Text,
  Stack,
  Group,
  Loader,
  Alert,
  Spoiler,
  SimpleGrid,
  Button,
  Modal,
} from '@mantine/core';
import {
  IconCalendar,
  IconMapPin,
  IconPhoto,
  IconAlertCircle,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import useTrips from '../../hooks/useTrips';
import showError from '../../modules/showError';

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const {
    tripDetails: trip,
    tripAccess,
    fetchTripDetails,
    fetchTripAccess,
    deleteTrip,
    loading
  } = useTrips();

  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const altImageTrip = 'https://images.pexels.com/photos/8058392/pexels-photo-8058392.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  const altImagePin = 'https://images.pexels.com/photos/68704/pexels-photo-68704.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

  // useEffect(() => {
  //   const fetchTripDetails = async () => {
  //     try {
  //       setLoading(true);
  //       // Dummy backend call for trip details
  //       const response = await fetch(`/api/trips/${id}`);
  //       if (!response.ok) {
  //         throw new Error('Failed to fetch trip details');
  //       }
  //       const data = await response.json();
  //       setTrip(data);
        
  //       // Dummy call to check ownership
  //       const ownerResponse = await fetch(`/api/trips/${id}/is-owner`);
  //       if (ownerResponse.ok) {
  //         const ownerData = await ownerResponse.json();
  //         setIsOwner(ownerData.isOwner || false);
  //       } else {
  //         // Fallback: assume user 1 is owner for demo (dummy data)
  //         setIsOwner(true);
  //       }
  //       setError(null);
  //     } catch (err) {
  //       setError(err.message);
  //       // Dummy data for development
  //       setTrip({
  //         id: id,
  //         title: 'Summer Vacation 2025',
  //         description: 'An amazing summer trip to the mountains',
  //         dateVisited: '2025-06-15',
  //         dateFrom: '2025-06-01',
  //         pins: [
  //           {
  //             id: 1,
  //             title: 'Mountain Peak',
  //             description: 'Beautiful mountain view',
  //             photos: [{ id: 1, url: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-5.png'}],
  //           },
  //           {
  //             id: 2,
  //             title: 'Forest Trail',
  //             description: 'Scenic hiking trail',
  //             photos: [{ id: 2, url: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-9.png'}],
  //           },
  //         ],
  //         photos: [
  //           { id: 1, url: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-3.png' },
  //           { id: 2, url: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-4.png'},
  //           { id: 3, url: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-1.png'},
  //           { id: 4, url: 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-6.png'}
  //         ],
  //       });
  //       setIsOwner(true); // Assume ownership for dummy data
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (id) {
  //     fetchTripDetails();
  //   }
  // }, [id]);

  useEffect(() => {
  
      if (id) {
        fetchTripDetails(id);
        fetchTripAccess(id);
      } else {
        showError('No trip ID provided');
      }
    }, [id]);

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Group justify="center">
          <Loader />
        </Group>
      </Container>
    );
  }

  if (!trip) {
    return (
      <Container size="md" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Not Found" color="gray">
          No trip found
        </Alert>
      </Container>
    );
  }

  // Collect all photos from trip and pins
  const tripPhotos = trip.photos || [];
  const showTripPhotoSpoiler = tripPhotos.length > 3;
  const isOwner = tripAccess ? tripAccess.AccessLevel === 'Owner' : false;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteTrip(id);
    }  finally {
      setDeleting(false);
      setDeleteModalOpened(false);
      navigate('/trips');
    }
  };

  const handleEdit = () => {
    navigate(`/trips/${id}/edit`);
  };

  return (
    <Container size="md" py="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="lg">
          {/* Header with Title and Action Buttons */}
          <Group justify="space-between" align="flex-start">
            <Title order={2}>{trip.title}</Title>
            {isOwner && (
              <Group gap="sm">
                <Button 
                  variant="light" 
                  color="blue" 
                  leftIcon={<IconEdit size={16} />} 
                  onClick={handleEdit}
                >
                  Edit
                </Button>
                <Button 
                  variant="light" 
                  color="red" 
                  leftIcon={<IconTrash size={16} />} 
                  onClick={() => setDeleteModalOpened(true)}
                >
                  Delete
                </Button>
              </Group>
            )}
          </Group>

          {/* Trip Photos */}
          {tripPhotos.length > 0 && (
            <div>
              <Group gap="xs" mb="sm">
                <IconPhoto size={18} stroke={1.5} />
                <Text fw={600} size="sm">
                  Trip Photos
                </Text>
              </Group>
              {showTripPhotoSpoiler ? (
                <Spoiler maxHeight={200} showLabel="Show all trip photos" hideLabel="Hide trip photos">
                  <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                    {tripPhotos.map(photo => (
                      <Card key={photo.id} p="xs" radius="md" withBorder>
                        <Card.Section>
                          <Image
                            src={photo.url}
                            fallbackSrc={altImageTrip}
                            height={200}
                            fit="cover"
                          />
                        </Card.Section>
                      </Card>
                    ))}
                  </SimpleGrid>
                </Spoiler>
              ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                  {tripPhotos.map(photo => (
                    <Card key={photo.id} p="xs" radius="md" withBorder>
                      <Card.Section>
                        <Image
                          src={photo.url}
                          fallbackSrc={altImageTrip}
                          height={200}
                          fit="cover"
                        />
                      </Card.Section>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </div>
          )}

          {/* Description */}
          {trip.description && (
            <div>
              <Text fw={600} size="sm" mb="xs">
                Description
              </Text>
              <Text size="sm" c="dimmed">
                {trip.description}
              </Text>
            </div>
          )}

          {/* Trip Info */}
          <Stack gap="md">
            {trip.dateFrom && (
              <Group gap="xs">
                <IconCalendar size={18} stroke={1.5} />
                <div>
                  <Text fw={500} size="sm">
                    Date From
                  </Text>
                  <Text size="sm" c="dimmed">
                    {new Date(trip.dateFrom).toLocaleDateString()}
                  </Text>
                </div>
              </Group>
            )}

            {trip.dateVisited && (
              <Group gap="xs">
                <IconCalendar size={18} stroke={1.5} />
                <div>
                  <Text fw={500} size="sm">
                    Date To
                  </Text>
                  <Text size="sm" c="dimmed">
                    {new Date(trip.dateVisited).toLocaleDateString()}
                  </Text>
                </div>
              </Group>
            )}
          </Stack>

          {/* Pins Section */}
          {trip.pins && trip.pins.length > 0 && (
            <div>
              <Group gap="xs" mb="sm">
                <IconMapPin size={18} stroke={1.5} />
                <Text fw={600} size="sm">
                  Pins ({trip.pins.length})
                </Text>
              </Group>
              <Stack gap="md">
                {trip.pins.map(pin => (
                  <Card 
                    key={pin.id} 
                    p="md" 
                    radius="md" 
                    withBorder
                    onClick={() => navigate(`/pins/${pin.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Stack gap="sm">
                      <Text fw={500}>{pin.title}</Text>
                      {pin.description && (
                        <Text size="sm" c="dimmed">
                          {pin.description}
                        </Text>
                      )}
                      {pin.photos && pin.photos.length > 0 && (
                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                          {pin.photos.map(photo => (
                            <Image
                              key={photo.id}
                              src={photo.url}
                              fallbackSrc={altImagePin}
                              height={150}
                              fit="cover"
                              radius="sm"
                            />
                          ))}
                        </SimpleGrid>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </div>
          )}
        </Stack>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpened} onClose={() => setDeleteModalOpened(false)} title="Delete Trip" centered>
        <Stack spacing="md">
          <Alert icon={<IconAlertCircle size={16} />} title="Confirm Deletion" color="red">
            Are you sure you want to delete this trip? This action cannot be undone.
          </Alert>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteModalOpened(false)}>
              Cancel
            </Button>
            <Button color="red" loading={deleting} onClick={handleDelete}>
              Delete Trip
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default TripDetail;
