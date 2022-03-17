import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        bgColor: 'gray.900',
      },
    },
  },

  fonts: {
    body: '"Varela Round", sans-serif',
    heading: '"Varela Round", sans-serif',
  },

  textStyles: {},

  colors: {
    primaryBackground: 'rgba(35, 35, 35, 0.35)',
    secondaryBackground: 'rgba(75, 75, 75, 0.5)',

    background: {
      400: 'rgba(75, 75, 75, 0.5)',
      500: 'rgba(35, 35, 35, 0.35)',
      600: 'rgba(35, 35, 35, 0.55)',
    },

    error: '#ff0000',
    alert: '#E67E22',
    warning: '#ffd700',
  },

  components: {},
});
