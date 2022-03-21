import {
  Flex,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { WebsiteDataType } from 'entities';
import React from 'react';

import { BiDotsHorizontalRounded } from 'react-icons/bi';
import { FiTrash, FiEdit2 } from 'react-icons/fi';
import { getIconURL } from 'utils';

import WebsiteManagementModal from '../Modals/WebsiteManagement';

interface WebsiteContainerProps {
  websiteData: WebsiteDataType;
}

export default function WebsiteContainer({
  websiteData,
}: WebsiteContainerProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };
  return (
    <>
      <WebsiteManagementModal
        type="edit"
        websiteData={websiteData}
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={() => {}}
      />

      <Flex
        position="relative"
        height="80px"
        width="90px"
        maxHeight="80px"
        maxWidth="105px"
        backgroundColor="secondaryBackground"
        border="1px solid"
        borderColor="gray.600"
        borderRadius={8}
        cursor="pointer"
        _hover={{
          borderColor: 'gray.500',
          '& > button': {
            visibility: 'visible',
          },
        }}
      >
        <Menu>
          <MenuButton
            visibility="collapse"
            position="absolute"
            top={1}
            right={1}
            borderRadius="4px"
            color="gray.400"
            _hover={{
              bgColor: 'background.600',
            }}
            _expanded={{
              bgColor: 'background.600',
            }}
            onClick={handleClick}
          >
            <BiDotsHorizontalRounded />
          </MenuButton>
          <MenuList>
            <MenuItem icon={<FiEdit2 />} onClick={onOpen}>
              Editar
            </MenuItem>
            <MenuItem icon={<FiTrash />}>Remover</MenuItem>
          </MenuList>
        </Menu>

        <Link
          href={websiteData.url}
          width="100%"
          h="100%"
          textDecoration="none"
          _focus={{ outline: 'none' }}
        >
          <Flex
            padding={2}
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
          >
            <Image
              width="40px"
              height="40px"
              src={websiteData.icon ?? getIconURL(websiteData.url)}
            />
            <Text color="white" fontSize="xs">
              {websiteData.title}
            </Text>
          </Flex>
        </Link>
      </Flex>
    </>
  );
}
