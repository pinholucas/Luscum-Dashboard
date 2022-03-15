import { theme } from "./styles/global";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";
import Home from "./components/Home";

const queryClient = new QueryClient();

export function App() {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>
    </ChakraProvider>
  );
}
