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
  id: string;
  onOpenEditModal: () => void;
  onRemove: () => void;
  websiteData: WebsiteDataType;
  isMergeTarget?: boolean;
}

export default function WebsiteContainer({
  id,
  onOpenEditModal,
  onRemove,
  websiteData,
  isMergeTarget = false,
}: WebsiteContainerProps) {
  return (
    <>
      <Flex
        id={id}
        data-website-id={websiteData.id}
        position="relative"
        height="80px"
        width="90px"
        maxHeight="80px"
        maxWidth="105px"
        backgroundColor="secondaryBackground"
        border="1px solid"
        borderColor={isMergeTarget ? 'blue.400' : 'gray.600'}
        borderRadius={8}
        cursor="pointer"
        userSelect={'none'}
        transform={isMergeTarget ? 'scale(1.08)' : undefined}
        boxShadow={
          isMergeTarget ? '0 0 16px 2px rgba(66,153,225,0.45)' : undefined
        }
        transition="transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease"
        _hover={{
          borderColor: isMergeTarget ? 'blue.400' : 'gray.500',
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
          _hover={{
            textDecoration: 'none',
          }}
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
