import React, { useState, useEffect } from 'react';
import { Button, Flex, Group, TextInput, Textarea, Stack, Card, Title, FileInput, Image, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUpload, IconX } from '@tabler/icons-react';

const TripForm = ({ onSubmit, initialTrip = null, isLoading = false }) => {
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      title: initialTrip?.title || '',
      description: initialTrip?.description || '',
      dateFrom: initialTrip?.dateFrom ? new Date(initialTrip.dateFrom).toISOString().split('T')[0] : '',
      dateVisited: initialTrip?.dateVisited ? new Date(initialTrip.dateVisited).toISOString().split('T')[0] : '',
      pins: '',
      sharedWith: '',
      photo: null,
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

  useEffect(() => {
    if (initialTrip?.photos && initialTrip.photos.length > 0) {
      setPhotoPreview(initialTrip.photos[0].url);
    }
  }, [initialTrip]);

  const handlePhotoChange = (file) => {
    setPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleClearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    form.setFieldValue('photo', null);
  };

  const handleSubmit = (values) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description || '');
    formData.append('dateFrom', values.dateFrom || '');
    formData.append('dateVisited', values.dateVisited || '');
    
    if (values.pins) {
      const pinIds = values.pins.split(',').map(p => p.trim()).filter(p => p);
      formData.append('pins', JSON.stringify(pinIds));
    }
    
    if (values.sharedWith) {
      const usernames = values.sharedWith.split(',').map(u => u.trim()).filter(u => u);
      formData.append('sharedWith', JSON.stringify(usernames));
    }
    
    if (photoFile) formData.append('photo', photoFile);

    // Very important todo: backend for now doesn't check for existing photo & doesn't allow multiple photos per trip
    // so fix it later
    if(initialTrip && initialTrip.id) {
      formData.append('id', initialTrip.id);
      // dummy update trip backend call placeholder
    } else {
      // dummy create trip backend call placeholder
    }
  };

  return (
    <Flex justify="center" align="center" direction="column" py="xl">
      <Card w="55%" p="lg" radius="lg" withBorder>
        <Stack spacing="md">
          <Title order={2}>{initialTrip ? 'Edit Trip' : 'Create New Trip'}</Title>

          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <Stack spacing="md">
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Cover Photo</label>
                {photoPreview ? (
                  <Card p="xs" radius="md" withBorder mb="md">
                    <Card.Section>
                      <Image src={photoPreview} alt="cover" height={180} fit="cover" />
                    </Card.Section>
                    <Group position="apart" mt="xs">
                      <Text size="sm">Photo selected</Text>
                      <Button size="xs" variant="light" color="red" leftIcon={<IconX size={14} />} onClick={handleClearPhoto}>Clear</Button>
                    </Group>
                  </Card>
                ) : (
                  <FileInput
                    placeholder="Choose cover image"
                    icon={<IconUpload size={14} />}
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                )}
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
                  {initialTrip ? 'Update Trip' : 'Create Trip'}
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
