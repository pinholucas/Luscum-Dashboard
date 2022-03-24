import {
  Flex,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import { BiDotsHorizontalRounded } from 'react-icons/bi';
import { FiTrash, FiEdit2 } from 'react-icons/fi';
import { getIconURL } from 'utils';

import { WebsiteDataType } from 'entities';

interface WebsiteContainerProps {
  onOpenEditModal: () => void;
  onRemove: () => void;
  websiteData: WebsiteDataType;
}

export default function WebsiteContainer({
  onOpenEditModal,
  onRemove,
  websiteData,
}: WebsiteContainerProps) {
  return (
    <>
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
          >
            <BiDotsHorizontalRounded />
          </MenuButton>
          <MenuList>
            <MenuItem icon={<FiEdit2 />} onClick={onOpenEditModal}>
              Editar
            </MenuItem>
            <MenuItem icon={<FiTrash />} onClick={onRemove}>
              Remover
            </MenuItem>
          </MenuList>
        </Menu>

        <Link
          href={websiteData.url}
          width="100%"
          h="100%"
          textDecoration="none"
          overflow="hidden"
          boxSizing="border-box"
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
              src={websiteData.icon ?? getIconURL(websiteData.url!)}
            />
            <Text
              width="75px"
              color="white"
              fontSize="xs"
              textAlign="center"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              overflow="hidden"
            >
              {websiteData.title}
            </Text>
          </Flex>
        </Link>
      </Flex>
    </>
  );
}
