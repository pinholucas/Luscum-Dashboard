import { createGlobalStyle } from 'styled-components';

interface GlobalStyleProps {
    background: {
        url: string;
        copyright: string;
    }
}

export const GlobalStyle = createGlobalStyle<GlobalStyleProps>`
    :root {
        --background: #121214;
    }

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    html {
        @media (max-width: 1080px) {
            font-size: 93.75%;
        }

        @media (max-width: 720px) {
            font-size: 87.5%;
        }
    }

    body {
        min-height: 100vh;
        
        background-color: var(--background);
        background-image: url('https://bing.com${props => props.background.url}');
        background-position: center;
        background-size: cover;

        -webkit-font-smoothing: antialiased;
    }

    body, input, textarea, button {
        font-family: 'Poppins', sans-serif;
        font-weight: 400;        
    }

    h1, h2, h3, h4, h5, h6, strong {
        font-weight: 600;
    }

    button {
        cursor: pointer;
    }
    
    [disabled] {
        opacity: 0.6;
        cursor: not-allowed;
    }
`