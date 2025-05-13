// theme.ts
import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  components: {
    Menu: {
      baseStyle: {
        item: {
          bg: 'white',        // default background
          color: 'black',     // default text color
          _hover: {
            bg: 'gray.100',   // hover background
          },
          _focus: {
            bg: 'gray.200',   // focused background
          },
        },
      },
    },
  },
});

export default theme;
