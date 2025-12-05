import React, { useState, useEffect } from 'react';
import { Button, Flex, Group, TextInput, Textarea, Select, Stack, Card, Title, FileInput, Image, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUpload, IconX } from '@tabler/icons-react';

const categories = [
  { value: 'Food', label: 'Food' },
  { value: 'Landmarks', label: 'Landmarks' },
  { value: 'Nature', label: 'Nature' },
  { value: 'Other', label: 'Other' },
];

const PinForm = ({ onSubmit, initialPin = null, isLoading = false }) => {
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      title: initialPin?.title || '',
      description: initialPin?.description || '',
      dateVisited: initialPin?.dateVisited ? new Date(initialPin.dateVisited).toISOString().split('T')[0] : '',
      categoryId: initialPin?.category?.id?.toString() || '',
      tripId: initialPin?.trip?.id?.toString() || '',
      photo: null,
    },

    validate: {
      title: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Title is required';
        }
        if (value.length < 3) {
          return 'Title must be at least 3 characters long';
        }
        if (value.length > 100) {
          return 'Title must not exceed 100 characters';
        }
        return null;
      },
      description: (value) => {
        if (value && value.length > 500) {
          return 'Description must not exceed 500 characters';
        }
        return null;
      },
      dateVisited: (value) => {
        if (value && new Date(value) > new Date()) {
          return 'Date cannot be in the future';
        }
        return null;
      },
      categoryId: (value) => {
        if (!value) {
          return 'Category is required';
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (initialPin?.photos && initialPin.photos.length > 0) {
      setPhotoPreview(initialPin.photos[0].url);
    }
  }, [initialPin]);

  const handlePhotoChange = (file) => {
    setPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
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
    formData.append('dateVisited', values.dateVisited || '');
    formData.append('categoryId', values.categoryId);
    if (values.tripId) {
      formData.append('tripId', values.tripId);
    }
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    // Dummy backend call placeholder
    fetch(`/api/pins${initialPin ? `/${initialPin.id}` : ''}`, {
      method: initialPin ? 'PUT' : 'POST',
      body: formData,
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to save pin');
        return response.json();
      })
      .then(data => {
        console.log('Pin saved:', data);
        if (onSubmit) onSubmit(data);
      })
      .catch(err => {
        console.error('Error saving pin:', err);
        // Fallback: just call onSubmit with form values
        if (onSubmit) onSubmit(values);
      });
  };

  return (
    <Flex justify="center" align="center" direction="column" py="xl">
      <Card w="50%" p="lg" radius="md" withBorder>
        <Stack spacing="md">
          <Title order={2}>{initialPin ? 'Edit Pin' : 'Create New Pin'}</Title>

          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <Stack spacing="md">
              {/* Title */}
              <TextInput
                withAsterisk
                label="Title"
                placeholder="Enter pin title"
                key={form.key('title')}
                {...form.getInputProps('title')}
              />

              {/* Description */}
              <Textarea
                label="Description"
                placeholder="Describe this pin (optional)"
                rows={4}
                key={form.key('description')}
                {...form.getInputProps('description')}
              />

              {/* Category */}
              <Select
                withAsterisk
                label="Category"
                placeholder="Select a category"
                data={categories}
                key={form.key('categoryId')}
                {...form.getInputProps('categoryId')}
              />

              {/* Date Visited */}
              <TextInput
                type="date"
                label="Date Visited"
                placeholder="When did you visit this place?"
                key={form.key('dateVisited')}
                {...form.getInputProps('dateVisited')}
              />

              {/* Photo Upload */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>
                  Photo
                </label>
                {photoPreview ? (
                  <Card p="xs" radius="md" withBorder mb="md">
                    <Card.Section>
                      <Image src={photoPreview} alt="preview" height={200} fit="cover" />
                    </Card.Section>
                    <Group position="apart" mt="xs">
                      <Text size="sm">Photo selected</Text>
                      <Button size="xs" variant="light" color="red" leftSection={<IconX size={14} />} onClick={handleClearPhoto}>
                        Clear
                      </Button>
                    </Group>
                  </Card>
                ) : (
                  <FileInput
                    placeholder="Choose image"
                    icon={<IconUpload size={14} />}
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                )}
              </div>

              {/* Submit Button */}
              <Group position="center" mt="md">
                <Button type="submit" loading={isLoading}>
                  {initialPin ? 'Update Pin' : 'Create Pin'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Flex>
  );
};

export default PinForm;
