import { Flex, Grid, Icon, useDisclosure } from '@chakra-ui/react';
import WebsiteContainer from './WebsiteContainer';
import { IoIosAdd } from 'react-icons/io';
import WebsiteManagementModal from 'components/Modals/WebsiteManagement';
import { WebsiteDataType } from 'entities';
import { useState } from 'react';

export default function TopSites() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [websitesList, setWebsiteList] = useState<WebsiteDataType[]>([]);

  return (
    <Flex
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
      position="absolute"
      zIndex={2}
    >
      <WebsiteManagementModal
        type="add"
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={() => {}}
      />

      <Grid
        w="75%"
        padding={4}
        gridTemplateColumns="repeat(auto-fit, minmax(90px, 1fr))"
        justifyItems="center"
        gap={4}
        border="1px solid"
        borderColor="gray.600"
        borderRadius={8}
        backgroundColor="primaryBackground"
        backdropFilter="blur(8px)"
      >
        {websitesList.map((website, key) => (
          <WebsiteContainer key={key} websiteData={website} />
        ))}

        <Flex
          padding={2}
          height="80px"
          width="90px"
          maxHeight="80px"
          maxWidth="105px"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={2}
          borderRadius={8}
          cursor="pointer"
          _hover={{
            backgroundColor: 'secondaryBackground',
            backdropFilter: 'blur(3px)',
            border: '1px solid',
            borderColor: 'gray.500',
            opacity: 0.85,
            '& > *': {
              color: 'gray.50',
            },
          }}
          onClick={onOpen}
        >
          <Icon
            as={IoIosAdd}
            boxSize="40px"
            color="gray.400"
            fontWeight="light"
          />
        </Flex>
      </Grid>
    </Flex>
  );
}
