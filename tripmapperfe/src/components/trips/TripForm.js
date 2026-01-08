import React, { useState, useEffect } from 'react';
import { Button, Flex, Group, TextInput, Textarea, Stack, Card, Title, FileInput, Image, Text, SimpleGrid, Loader } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUpload, IconX } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import useTrips from '../../hooks/useTrips';
import { useNavigate } from 'react-router-dom';

const TripForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const {
    tripDetails,
    loading: isLoading,
    createTrip,
    updateTrip,
    fetchTripDetails,
  } = useTrips();

  const [existingPhotos, setExistingPhotos] = useState([]);
  const [photosToDelete, setPhotosToDelete] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState([]);
  const [photoError, setPhotoError] = useState('');

  const formatDateForInput = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      title: '',
      description: '',
      dateFrom: '',
      dateVisited: '',
      pins: '',
      sharedWith: '',
    },

    validate: {
      title: (value) => {
        if (!value || value.trim().length === 0) return 'Title is required';
        if (value.length < 3) return 'Title must be at least 3 characters';
        if (value.length > 100) return 'Title must not exceed 100 characters';
        return null;
      },
      description: (value) => {
        if (value && value.length > 500) return 'Description must not exceed 500 characters';
        return null;
      },
      dateFrom: (value) => {
        if (value && new Date(value) > new Date()) return 'Date cannot be in the future';
        return null;
      },
      dateVisited: (value) => {
        if (value && new Date(value) > new Date()) return 'Date cannot be in the future';
        return null;
      },
      sharedWith: (value) => {
        if (value) {
          const usernames = value.split(',').map(u => u.trim()).filter(u => u);
          for (let u of usernames) {
            if (u.length < 4) return 'Each username must be at least 4 characters';
          }
        }
        return null;
      },
    },
  });

  // Fetch trip if editing
  useEffect(() => {
    if (id && !tripDetails) {
      fetchTripDetails(id);
    }
  }, [id, tripDetails, fetchTripDetails]);

  // Update form when tripDetails changes
  useEffect(() => {
    if (tripDetails) {
      form.setValues({
        title: tripDetails.title || '',
        description: tripDetails.description || '',
        dateFrom: tripDetails.dateFrom ? formatDateForInput(tripDetails.dateFrom) : '',
        dateVisited: tripDetails.dateVisited ? formatDateForInput(tripDetails.dateVisited) : '',
        pins: tripDetails.pins ? tripDetails.pins.map(p => p.title).join(', ') : '',
        sharedWith: tripDetails.sharedWith ? tripDetails.sharedWith.join(', ') : '',
      });
      setExistingPhotos(tripDetails.photos || []);
      setPhotosToDelete([]);
      setNewPhotos([]);
    }
  }, [tripDetails]);

  // Generate previews for new photos
  useEffect(() => {
    const previews = newPhotos.map(file => ({
      name: file.name,
      preview: URL.createObjectURL(file),
    }));
    
    setNewPhotoPreviews(previews);
    
    return () => {
      previews.forEach(p => URL.revokeObjectURL(p.preview));
    };
  }, [newPhotos]);

  const remainingSlots = Math.max(0, 5 - (existingPhotos.length + newPhotos.length));

  const handleNewPhotosChange = (files) => {
    const selectedFiles = Array.isArray(files) ? files : [];
    const total = existingPhotos.length + selectedFiles.length;
    if (total > 5) {
      setPhotoError('You can attach up to 5 photos per trip.');
      return;
    }
    setPhotoError('');
    setNewPhotos(selectedFiles);
  };

  const handleRemoveExistingPhoto = (photoId) => {
    setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId));
    setPhotosToDelete((prev) => (prev.includes(photoId) ? prev : [...prev, photoId]));
  };

  const handleRemoveNewPhoto = (fileName) => {
    setNewPhotos((prev) => prev.filter((file) => file.name !== fileName));
  };

  const handleSubmit = async (values) => {
    if (existingPhotos.length + newPhotos.length > 5) {
      setPhotoError('You can attach up to 5 photos per trip.');
      return;
    }

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description || '');
    formData.append('dateFrom', values.dateFrom || '');
    formData.append('dateVisited', values.dateVisited || '');
    
    if (values.pins) {
      const pinTitles = values.pins.split(',').map(p => p.trim()).filter(p => p);
      pinTitles.forEach(pinTitle => {
        formData.append('pins', pinTitle);
      });
    }
    
    if (values.sharedWith) {
      const usernames = values.sharedWith.split(',').map(u => u.trim()).filter(u => u);
      usernames.forEach(username => {
        formData.append('sharedUsernames', username);
      });
    }
    
    if (photosToDelete.length > 0) {
      photosToDelete.forEach((photoId) => formData.append('photoIdsToDelete', photoId));
    }

    newPhotos.forEach((file) => formData.append('photos', file));

    if (id) {
      formData.append('id', id);
      if (tripDetails?.rowVersion) {
        formData.append('rowVersion', tripDetails.rowVersion);
      }
      await updateTrip(id, formData);
      navigate(`/trips/${id}`);
    } else {
      await createTrip(formData);
      navigate('/trips');
    }
  };

  if (isLoading && id) {
    return (
      <Flex justify="center" align="center" py="xl">
        <Loader />
      </Flex>
    );
  }

  return (
    <Flex justify="center" align="center" direction="column" py="xl">
      <Card w="55%" p="lg" radius="lg" withBorder>
        <Stack gap="md">
          <Title order={2}>{id ? 'Edit Trip' : 'Create New Trip'}</Title>

          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <Stack gap="md">
              <TextInput
                withAsterisk
                label="Trip Title"
                placeholder="Name your adventure"
                key={form.key('title')}
                {...form.getInputProps('title')}
              />

              <Textarea
                label="Description"
                placeholder="Tell us about this trip (optional)"
                rows={4}
                key={form.key('description')}
                {...form.getInputProps('description')}
              />

              <Group grow>
                <TextInput
                  type="date"
                  label="Start Date"
                  key={form.key('dateFrom')}
                  {...form.getInputProps('dateFrom')}
                />
                <TextInput
                  type="date"
                  label="End Date"
                  key={form.key('dateVisited')}
                  {...form.getInputProps('dateVisited')}
                />
              </Group>

              <TextInput
                label="Add Pins to Trip"
                placeholder="Enter pin titles separated by commas"
                description="You can add existing pins to this trip"
                key={form.key('pins')}
                {...form.getInputProps('pins')}
              />

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Photos (max 5)</label>
                {existingPhotos.length > 0 && (
                  <Stack gap="xs" mb="sm">
                    <Text size="sm" c="dimmed">Existing photos</Text>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                      {existingPhotos.map((photo) => (
                        <Card key={photo.id} p="xs" radius="md" withBorder>
                          <Card.Section>
                            <Image src={photo.url} alt={`trip-${photo.id}`} height={150} fit="cover" />
                          </Card.Section>
                          <Button
                            mt="xs"
                            size="xs"
                            variant="light"
                            color="red"
                            leftSection={<IconX size={14} />}
                            onClick={() => handleRemoveExistingPhoto(photo.id)}
                          >
                            Remove from trip
                          </Button>
                        </Card>
                      ))}
                    </SimpleGrid>
                  </Stack>
                )}

                <Stack gap="xs">
                  <FileInput
                    placeholder={remainingSlots > 0 ? `You can add ${remainingSlots} more photo${remainingSlots === 1 ? '' : 's'}` : 'Photo limit reached'}
                    leftSection={<IconUpload size={14} />}
                    accept="image/*"
                    multiple
                    clearable
                    value={newPhotos}
                    onChange={handleNewPhotosChange}
                    disabled={remainingSlots === 0}
                  />
                  {photoError && <Text size="sm" c="red">{photoError}</Text>}

                  {newPhotoPreviews.length > 0 && (
                    <Stack gap="xs">
                      <Text size="sm" c="dimmed">New photos to upload</Text>
                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                        {newPhotoPreviews.map((item) => (
                          <Card key={item.name} p="xs" radius="md" withBorder>
                            <Card.Section>
                              <Image src={item.preview} alt={item.name} height={150} fit="cover" />
                            </Card.Section>
                            <Group justify="space-between" mt="xs" gap="xs">
                              <Text size="xs" truncate>{item.name}</Text>
                              <Button
                                size="xs"
                                variant="light"
                                color="red"
                                leftSection={<IconX size={12} />}
                                onClick={() => handleRemoveNewPhoto(item.name)}
                              >
                                Remove
                              </Button>
                            </Group>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </Stack>
                  )}
                </Stack>
              </div>

              <TextInput
                label="Share with users"
                placeholder="Enter usernames separated by commas"
                description="Leave empty to keep private"
                key={form.key('sharedWith')}
                {...form.getInputProps('sharedWith')}
              />

              <Group position="center" mt="md">
                <Button type="submit" size="md" loading={isLoading}>
                  {id ? 'Update Trip' : 'Create Trip'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Flex>
  );
};

export default TripForm;
