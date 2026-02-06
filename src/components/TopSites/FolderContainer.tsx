import {
  Box,
  Editable,
  EditableInput,
  EditablePreview,
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
  Tooltip,
  useDisclosure,
  useEditableControls,
} from '@chakra-ui/react';
import { BiDotsHorizontalRounded } from 'react-icons/bi';
import { FiEdit2, FiTrash } from 'react-icons/fi';

import { FolderDataType, WebsiteDataType } from 'entities';
import { getIconURL } from 'utils';
import { forwardRef, useCallback, useRef } from 'react';
import { ReactSortable } from 'react-sortablejs';
import Sortable from 'sortablejs';

function EditableControls() {
  const { getEditButtonProps } = useEditableControls();

  return (
    <Box
      position="absolute"
      visibility="collapse"
      alignSelf="center"
      justifySelf="center"
      {...getEditButtonProps()}
    >
      <FiEdit2 size="14" />
    </Box>
  );
}

const FolderWebsitesGrid = forwardRef<HTMLDivElement, any>((props, ref) => (
  <Grid
    templateColumns="repeat(4, minmax(90px, 90px))"
    gap={4}
    justifyItems="center"
    ref={ref}
  >
    {props.children}
  </Grid>
));

interface FolderContainerProps {
  id: string;
  folderData: FolderDataType;
  onRemove: () => void;
  onEditWebsite: (website: WebsiteDataType) => void;
  onRemoveWebsite: (websiteId: string) => void;
  onMoveWebsiteToRoot: (folderId: string, websiteId: string) => void;
  onReorderWebsites: (folderId: string, websites: WebsiteDataType[]) => void;
  onRenameFolder: (folderId: string, newTitle: string) => void;
  isDropTarget?: boolean;
}

export default function FolderContainer({
  id,
  folderData,
  onRemove,
  onEditWebsite,
  onRemoveWebsite,
  onMoveWebsiteToRoot,
  onReorderWebsites,
  onRenameFolder,
  isDropTarget = false,
}: FolderContainerProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const modalContentRef = useRef<HTMLDivElement>(null);
  const lastFolderPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const folderIcons = folderData.websites.slice(0, 4);

  // Track pointer via 'drag' event (same pattern as main grid)
  const onFolderDragEvent = useCallback((e: Event) => {
    const de = e as DragEvent;
    if (de.clientX === 0 && de.clientY === 0) return;
    lastFolderPointerRef.current = { x: de.clientX, y: de.clientY };
  }, []);

  // Allow dropping anywhere (prevents "forbidden" cursor outside modal)
  const onAllowDrop = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  function handleFolderSortStart() {
    lastFolderPointerRef.current = { x: 0, y: 0 };
    document.addEventListener('drag', onFolderDragEvent);
    document.addEventListener('dragover', onAllowDrop);
  }

  function handleFolderSortEnd(evt: Sortable.SortableEvent) {
    document.removeEventListener('drag', onFolderDragEvent);
    document.removeEventListener('dragover', onAllowDrop);

    if (!modalContentRef.current) return;

    const rect = modalContentRef.current.getBoundingClientRect();
    const { x, y } = lastFolderPointerRef.current;

    // (0,0) means drag was cancelled (e.g. Escape key)
    if (x === 0 && y === 0) return;

    const isOutside =
      x < rect.left || x > rect.right || y < rect.top || y > rect.bottom;

    if (isOutside) {
      const draggedItem = folderData.websites[evt.oldIndex ?? 0];
      if (draggedItem) {
        onMoveWebsiteToRoot(folderData.id, draggedItem.id);
        if (folderData.websites.length <= 1) {
          onClose();
        }
      }
    }
  }

  return (
    <>
      <Flex
        id={id}
        data-folder-id={folderData.id}
        position="relative"
        height="80px"
        width="90px"
        maxHeight="80px"
        maxWidth="105px"
        backgroundColor="secondaryBackground"
        border="1px solid"
        borderColor={isDropTarget ? 'blue.400' : 'gray.600'}
        borderRadius={8}
        cursor="pointer"
        userSelect="none"
        transform={isDropTarget ? 'scale(1.08)' : undefined}
        boxShadow={
          isDropTarget ? '0 0 16px 2px rgba(66,153,225,0.45)' : undefined
        }
        transition="transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease"
        _hover={{
          borderColor: isDropTarget ? 'blue.400' : 'gray.500',
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
            minHeight="40px"
            borderRadius="10px"
            overflow="hidden"
            backgroundColor="rgba(255, 255, 255, 0.08)"
            padding="4px"
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
                <Box
                  key={`empty-${index}`}
                  bg="rgba(255, 255, 255, 0.18)"
                  borderRadius="4px"
                />
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

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        size="xl"
        autoFocus={false}
      >
        <ModalOverlay backdropFilter="blur(8px)" bg="rgba(0,0,0,0.45)" />
        <ModalContent
          ref={modalContentRef}
          border="1px solid"
          borderColor="gray.600"
          borderRadius="3xl"
          bg="primaryBackground"
          backdropFilter="blur(8px)"
          overflow="hidden"
          width="auto"
        >
          <ModalHeader
            color="gray.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Editable
              defaultValue={folderData.title}
              display="grid"
              onSubmit={(value) => {
                const trimmed = value.trim();
                if (trimmed && trimmed !== folderData.title) {
                  onRenameFolder(folderData.id, trimmed);
                }
              }}
            >
              <Tooltip label="Clique para alterar">
                <Flex alignItems="center" justifyContent="center">
                  <EditablePreview cursor="pointer" />
                  <EditableControls />
                </Flex>
              </Tooltip>
              <EditableInput textAlign="center" />
            </Editable>
          </ModalHeader>
          <ModalBody pb={6}>
            <ReactSortable
              tag={FolderWebsitesGrid}
              list={folderData.websites}
              setList={(newList) =>
                onReorderWebsites(folderData.id, newList as WebsiteDataType[])
              }
              animation={150}
              onStart={handleFolderSortStart}
              onEnd={handleFolderSortEnd}
            >
              {folderData.websites.map((website) => (
                <Flex
                  key={website.id}
                  position="relative"
                  height="80px"
                  width="90px"
                  maxHeight="80px"
                  maxWidth="105px"
                  backgroundColor="secondaryBackground"
                  border="1px solid"
                  borderColor="gray.600"
                  borderRadius={8}
                  cursor="grab"
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
                      color="gray.400"
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
                      <MenuItem
                        icon={<FiEdit2 />}
                        onClick={() => onEditWebsite(website)}
                      >
                        Editar
                      </MenuItem>
                      <MenuItem
                        icon={<FiTrash />}
                        onClick={() => onRemoveWebsite(website.id)}
                      >
                        Remover
                      </MenuItem>
                    </MenuList>
                  </Menu>

                  <Link
                    href={website.url}
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
                        src={website.icon ?? getIconURL(website.url!)}
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
                        {website.title}
                      </Text>
                    </Flex>
                  </Link>
                </Flex>
              ))}
            </ReactSortable>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
