import {
  ChakraProvider,
  Flex,
  Grid,
  GridItem,
  Spacer,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Tabs,
  Text,
  theme,
} from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { UploadForm } from './UploadForm';

export const App = () => (
  <ChakraProvider theme={theme}>
    <Tabs variant="solid-rounded" colorScheme="blue" orientation="vertical">
      <Grid minH="100vh" templateColumns="repeat(5, 1fr)">
        <GridItem colSpan={1} p={4}>
          <Flex flexDirection="column" minH="100%" gap={4}>
            <TabList gap={4}>
              <Tab>Encrypt</Tab>
              <Tab>Tab 2</Tab>
              <Tab>Tab 3</Tab>
            </TabList>
            <Spacer />
            <ColorModeSwitcher alignSelf="start" />
          </Flex>
        </GridItem>
        <GridItem colSpan={4}>
          <TabPanels>
            <TabPanel>
              <UploadForm />
            </TabPanel>
            <TabPanel>
              <Text>Tab 2</Text>
            </TabPanel>
            <TabPanel>Tab 3</TabPanel>
          </TabPanels>
        </GridItem>
      </Grid>
    </Tabs>
  </ChakraProvider>
);
