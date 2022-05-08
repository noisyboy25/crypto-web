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
  Icon,
  theme,
} from '@chakra-ui/react';
import {
  faClockRotateLeft,
  faKey,
  faUserGroup,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import { UploadForm } from './UploadForm';

export const App = () => (
  <ChakraProvider theme={theme}>
    <Tabs variant="solid-rounded" colorScheme="blue" orientation="vertical">
      <Grid minH="100vh" templateColumns="repeat(5, 1fr)" p={6} gap={10}>
        <GridItem colSpan={1}>
          <Flex flexDirection="column" minH="100%" pt={3}>
            <TabList gap={4}>
              <Tab justifyContent="left">
                <Icon as={FontAwesomeIcon} icon={faKey} m={2} />
                Encryption
              </Tab>
              <Tab justifyContent="left">
                <Icon as={FontAwesomeIcon} icon={faClockRotateLeft} m={2} />
                History
              </Tab>
              <Tab justifyContent="left">
                <Icon as={FontAwesomeIcon} icon={faUserGroup} m={2} />
                Users
              </Tab>
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
