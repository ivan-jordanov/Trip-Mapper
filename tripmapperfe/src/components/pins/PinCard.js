import React from 'react';
import { Card, Image, Text, Badge, Group } from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

const placeholder = 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png';

const PinCard = ({ pin, onClick }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClick) return onClick(pin.id);
    navigate(`/pins/${pin.id}`);
  };

  const thumb = pin?.photos && pin.photos.length > 0 ? pin.photos[0].url : placeholder;

  return (
    <Card shadow="sm" p="xs" radius="md" withBorder onClick={handleClick} style={{ cursor: 'pointer' }}>
      <Card.Section>
        <Image src={thumb} height={140} alt={pin?.title || 'pin'} fit="cover" />
      </Card.Section>

      <Group position="apart" mt="xs" mb="xs">
        <Text weight={600} size="sm" lineClamp={1}>{pin?.title || 'Untitled'}</Text>
        {pin?.category && (
          <Badge color={pin.category.color || 'gray'} variant="filled" size="xs">
            {pin.category.name}
          </Badge>
        )}
      </Group>

      {pin?.description && (
        <Text size="xs" color="dimmed" lineClamp={2}>{pin.description}</Text>
      )}
    </Card>
  );
};

export default PinCard;
