import { Box, ChakraProvider, Flex, Grid, theme } from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { UploadForm } from './UploadForm';

export const App = () => (
  <ChakraProvider theme={theme}>
    <Grid gap={2}>
      <Box flex="1"></Box>
      <ColorModeSwitcher justifySelf="flex-end" />
    </Grid>
    <Grid minH="100vh" p={3}>
      <UploadForm />
    </Grid>
  </ChakraProvider>
);
