import { Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ArrowBackIcon } from '@chakra-ui/icons';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/')}
      position="absolute"
      top={4}
      left={4}
      zIndex={10}
      size="lg"
      colorScheme="gray"
      leftIcon={<ArrowBackIcon />}
    >
      Back
    </Button>
  );
};

export default BackButton;
