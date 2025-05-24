import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  styles: {
    global: {
      '*': {
        fontSize: '1rem',
      },

      'html, body': {
        bgColor: 'gray.900',
      },

      // Drag and drop styles
      '.sortable-ghost': {
        opacity: '0.4',
        transform: 'rotate(5deg)',
      },

      '.sortable-chosen': {
        opacity: '0.8',
      },

      '.sortable-drag': {
        opacity: '0.8',
        transform: 'rotate(5deg)',
      },

      '.draggable-item': {
        transition: 'transform 0.2s ease, opacity 0.2s ease',
        cursor: 'grab',
      },

      '.draggable-item:active': {
        cursor: 'grabbing',
      },

      // Folder drop zone highlight
      '[id^="folder-"]:hover': {
        borderColor: 'rgba(230, 126, 34, 0.8) !important',
        boxShadow: '0 0 10px rgba(230, 126, 34, 0.3)',
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

  components: {
    Input: {
      variants: {
        outline: {
          field: {
            _focus: {
              borderColor: 'alert',
              boxShadow: '0 0 0 1px #E67E22',
            },
          },
        },
      },
    },

    Editable: {
      baseStyle: {
        input: {
          _focus: {
            borderColor: 'alert',
            boxShadow: '0 0 0 2px #E67E22',
          },
        },
      },
    },

    Menu: {
      baseStyle: {
        list: {
          '--menu-bg': 'colors.background.500',
          padding: 0,
          minWidth: 'max-content',
          borderColor: 'secondaryBackground',
          backdropFilter: 'blur(8px)',
          color: 'gray.300',
        },
        item: {
          _focus: {
            bgColor: 'background.400',
          },
          _hover: {
            bgColor: 'background.400',
          },
        },
      },
    },

    Modal: {
      baseStyle: {
        bg: 'red',
        overlay: {
          backdropFilter: 'blur(8px)',
        },
        dialog: {
          border: '1px solid',
          borderColor: 'secondaryBackground',
          bg: 'background.600',
          color: 'gray.300',
        },
      },
    },
  },
});
