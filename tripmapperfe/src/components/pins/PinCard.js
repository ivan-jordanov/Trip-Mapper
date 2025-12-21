import React from 'react';
import { Card, Image, Text, Badge, Group } from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';

const placeholder = 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png';

const PinCard = ({ pin, category, onClick }) => {
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
        {category && (
          <Badge color={category.colorCode || 'gray'} variant="filled" size="xs">
            {category.name}
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
