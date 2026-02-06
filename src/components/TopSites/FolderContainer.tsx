import {
  Box,
  Flex,
  Grid,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { BiDotsHorizontalRounded } from 'react-icons/bi';
import { FiEdit2, FiTrash } from 'react-icons/fi';

import { FolderDataType } from 'entities';
import { getIconURL } from 'utils';

interface FolderContainerProps {
  id: string;
  folderData: FolderDataType;
  onOpenEditModal: () => void;
  onRemove: () => void;
}

export default function FolderContainer({
  id,
  folderData,
  onOpenEditModal,
  onRemove,
}: FolderContainerProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const folderIcons = folderData.websites.slice(0, 4);

  return (
    <>
      <Flex
        id={id}
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
        userSelect="none"
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
            zIndex={1}
            borderRadius="4px"
            color="gray.300"
            _hover={{
              bgColor: 'background.600',
            }}
            _expanded={{
              bgColor: 'background.600',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <BiDotsHorizontalRounded />
          </MenuButton>
          <MenuList>
            <MenuItem icon={<FiEdit2 />} onClick={onOpenEditModal}>
              Editar pasta
            </MenuItem>
            <MenuItem icon={<FiTrash />} onClick={onRemove}>
              Remover pasta
            </MenuItem>
          </MenuList>
        </Menu>

        <Flex
          onClick={onOpen}
          width="100%"
          h="100%"
          padding={2}
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={2}
        >
          <Grid
            templateColumns="repeat(2, 1fr)"
            templateRows="repeat(2, 1fr)"
            gap={1}
            width="40px"
            height="40px"
            borderRadius="10px"
            overflow="hidden"
            backgroundColor="rgba(255, 255, 255, 0.08)"
            padding="2px"
          >
            {folderIcons.map((website) => (
              <Image
                key={website.id}
                width="100%"
                height="100%"
                objectFit="cover"
                borderRadius="4px"
                src={website.icon ?? getIconURL(website.url!)}
              />
            ))}
            {Array.from({ length: Math.max(0, 4 - folderIcons.length) }).map(
              (_, index) => (
                <Box key={`empty-${index}`} bg="rgba(255, 255, 255, 0.18)" borderRadius="4px" />
              ),
            )}
          </Grid>

          <Text
            width="75px"
            color="white"
            fontSize="xs"
            textAlign="center"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            overflow="hidden"
          >
            {folderData.title}
          </Text>
        </Flex>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
        <ModalOverlay backdropFilter="blur(14px)" bg="rgba(0,0,0,0.45)" />
        <ModalContent
          border="1px solid"
          borderColor="gray.600"
          borderRadius="3xl"
          bg="linear-gradient(145deg, rgba(36,36,36,0.86), rgba(20,36,60,0.88))"
          backdropFilter="blur(14px)"
          overflow="hidden"
        >
          <ModalHeader color="gray.100">{folderData.title}</ModalHeader>
          <ModalBody pb={6}>
            <Grid templateColumns="repeat(3, minmax(90px, 1fr))" gap={4}>
              {folderData.websites.map((website) => (
                <Link
                  key={website.id}
                  href={website.url}
                  _hover={{ textDecoration: 'none' }}
                  _focus={{ boxShadow: 'none' }}
                >
                  <Flex
                    padding={2}
                    borderRadius="xl"
                    backgroundColor="rgba(255,255,255,0.06)"
                    border="1px solid"
                    borderColor="rgba(255,255,255,0.12)"
                    flexDirection="column"
                    alignItems="center"
                    gap={2}
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateY(-1px)',
                      borderColor: 'rgba(255,255,255,0.28)',
                    }}
                  >
                    <Image
                      width="52px"
                      height="52px"
                      borderRadius="lg"
                      src={website.icon ?? getIconURL(website.url!)}
                    />
                    <Text
                      width="84px"
                      color="white"
                      fontSize="sm"
                      textAlign="center"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      overflow="hidden"
                    >
                      {website.title}
                    </Text>
                  </Flex>
                </Link>
              ))}
            </Grid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
