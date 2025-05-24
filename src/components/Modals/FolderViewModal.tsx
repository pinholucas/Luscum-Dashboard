import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Flex,
  Image,
  IconButton,
  Grid,
  Box,
} from '@chakra-ui/react';
import { FiTrash2, FiExternalLink } from 'react-icons/fi'; // Using FiExternalLink for launch
import { FolderDataType, WebsiteDataType } from '../../entities';
import { getIconURL } from '../../utils';
import React from 'react'; // Needed for React.FC if used, or general JSX

interface FolderViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: FolderDataType | null;
  // onUpdateFolderChildren: (folderId: string, newChildren: WebsiteDataType[]) => void; // For reordering, defer
  onLaunchWebsite: (url: string) => void;
  onEditWebsiteInFolder: (website: WebsiteDataType, folderId: string) => void; // Defer actual button for now
  onRemoveWebsiteFromFolder: (websiteId: string, folderId: string) => void;
}

const FolderViewModal: React.FC<FolderViewModalProps> = ({
  isOpen,
  onClose,
  folder,
  onLaunchWebsite,
  onEditWebsiteInFolder, // Deferring button
  onRemoveWebsiteFromFolder,
}) => {
  if (!folder) {
    return null; // Or some minimal modal content if preferred when folder is null
  }

  const handleRemove = (websiteId: string) => {
    onRemoveWebsiteFromFolder(websiteId, folder.id);
  };

  // const handleEdit = (website: WebsiteDataType) => {
  //   onEditWebsiteInFolder(website, folder.id);
  // };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent bg="gray.800" color="whiteAlpha.900">
        <ModalHeader borderBottomWidth="1px" borderColor="gray.700">
          {folder.title}
        </ModalHeader>
        <ModalCloseButton _focus={{ boxShadow: 'outline' }} />
        <ModalBody py={6}>
          {folder.children.length === 0 ? (
            <Text textAlign="center" color="gray.400">
              This folder is empty.
            </Text>
          ) : (
            <Grid
              templateColumns="repeat(auto-fill, minmax(180px, 1fr))"
              gap={4}
            >
              {folder.children.map((website) => (
                <Flex
                  key={website.id}
                  direction="column"
                  align="center"
                  p={3}
                  bg="gray.700"
                  borderRadius="md"
                  boxShadow="sm"
                  position="relative"
                  _hover={{ bg: 'gray.600' }}
                >
                  <Flex
                    align="center"
                    justify="center"
                    w="100%"
                    h="80px" // Fixed height for icon area
                    cursor="pointer"
                    onClick={() => onLaunchWebsite(website.url || '')}
                    mb={2}
                  >
                    <Image
                      boxSize="48px"
                      src={website.icon || getIconURL(website.url || '')}
                      alt={website.title || 'Website icon'}
                      objectFit="contain"
                      fallbackSrc="https://via.placeholder.com/48"
                    />
                  </Flex>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    textAlign="center"
                    w="100%"
                    isTruncated
                    title={website.title}
                    mb={3}
                  >
                    {website.title || 'Untitled Website'}
                  </Text>
                  <Flex position="absolute" bottom="5px" right="5px" gap={1}>
                    {/* Edit button - deferred for now
                    <IconButton
                      aria-label="Edit website"
                      icon={<FiEdit2 />}
                      size="xs"
                      variant="ghost"
                      color="blue.300"
                      onClick={() => handleEdit(website)}
                      _hover={{ bg: 'whiteAlpha.200' }}
                    />
                    */}
                    <IconButton
                      aria-label="Remove website from folder"
                      icon={<FiTrash2 />}
                      size="xs"
                      variant="ghost"
                      color="red.400"
                      onClick={() => handleRemove(website.id)}
                      _hover={{ bg: 'whiteAlpha.200' }}
                    />
                  </Flex>
                  <Box
                    as={FiExternalLink}
                    position="absolute"
                    top="5px"
                    right="5px"
                    cursor="pointer"
                    color="gray.400"
                    _hover={{ color: 'whiteAlpha.800' }}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation(); // Prevent Flex click if icon is part of it
                      onLaunchWebsite(website.url || '');
                    }}
                  />
                </Flex>
              ))}
            </Grid>
          )}
        </ModalBody>
        <ModalFooter borderTopWidth="1px" borderColor="gray.700">
          <Button
            onClick={onClose}
            variant="outline"
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FolderViewModal;
