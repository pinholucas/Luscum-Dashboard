import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
    styles: {
        global: {
            'html, body': {
                bgColor: 'gray.900',   
            }
        }
    },

    fonts: {
        body: '"Varela Round", sans-serif',
        heading: '"Varela Round", sans-serif',
    },

    textStyles: {

    },

    colors: {
        primaryBackground: 'rgba(45, 45, 45, 0.35)',
        secondaryBackground: 'rgba(95, 95, 95, 0.5)',
    },
    
    components: {

    }
});