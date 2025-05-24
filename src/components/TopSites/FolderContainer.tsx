import React from 'react';
import {
  Flex,
  Grid,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Icon,
  IconButton,
} from '@chakra-ui/react';
import { BiDotsHorizontalRounded } from 'react-icons/bi';
import { FiTrash, FiEdit2 } from 'react-icons/fi';
import { FaFolder } from 'react-icons/fa';
import { FolderDataType, WebsiteDataType } from '../../entities'; // Adjusted import path
import { getIconURL } from '../../utils'; // Adjusted import path

interface FolderContainerProps {
  id: string;
  folderData: FolderDataType;
  onOpenFolder: () => void;
  onRenameFolder: () => void;
  onRemoveFolder: () => void;
  onWebsiteDroppedIntoFolder?: (websiteData: WebsiteDataType, folderId: string) => void;
  className?: string;
}

export default function FolderContainer({
  id,
  folderData,
  onOpenFolder,
  onRenameFolder,
  onRemoveFolder,
  onWebsiteDroppedIntoFolder,
  className,
}: FolderContainerProps) {
  const { title, children } = folderData;
  const displayChildren = children.slice(0, 4);
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleMouseEnter = () => {
    setIsMenuVisible(true);
  };

  const handleMouseLeave = () => {
    setIsMenuVisible(false);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedElement = document.querySelector('[data-dragging-type="website"]');
    if (draggedElement) {
      const draggedItemData = (draggedElement as any)._draggedItemData;
      if (draggedItemData && draggedItemData.type === 'website') {
        setIsDragOver(true);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedElement = document.querySelector('[data-dragging-type="website"]');
    if (draggedElement) {
      const draggedItemData = (draggedElement as any)._draggedItemData;
      if (draggedItemData && draggedItemData.type === 'website') {
        e.dataTransfer.dropEffect = 'move';
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only clear drag over if we're actually leaving the container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    console.log('Drop event triggered on FolderContainer');

    // Get the dragged element from the drag event
    let draggedItemData = null;
    const draggedElement = document.querySelector('[data-dragging-type="website"]');
    
    if (draggedElement) {
      draggedItemData = (draggedElement as any)._draggedItemData;
    }
    
    // Fallback to global variable
    if (!draggedItemData) {
      draggedItemData = (window as any)._currentlyDraggedItem;
    }

    if (draggedItemData && onWebsiteDroppedIntoFolder) {
      if (draggedItemData.type === 'website') {
        console.log('Dropping website into folder:', draggedItemData, folderData.id);
        onWebsiteDroppedIntoFolder(draggedItemData, folderData.id);
      }
    } else {
      console.log('No dragged element found or handler missing', { draggedItemData, onWebsiteDroppedIntoFolder });
    }
  };

  return (
    <Flex
      id={id} // Important for ReactSortable
      className={className}
      data-type="folder" // Add data attribute for easier detection
      data-folder-id={folderData.id} // Add folder ID as data attribute
      h="120px" // Same as WebsiteContainer
      w="120px" // Same as WebsiteContainer
      bg="rgba(32, 33, 36, 0.8)" // Slightly different or same as WebsiteContainer
      border="1px solid rgba(255, 255, 255, 0.1)"
      borderRadius="md"
      cursor="pointer"
      userSelect="none"
      flexDirection="column"
      alignItems="center"
      justifyContent="center" // Center content vertically and horizontally
      position="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onOpenFolder}
      gap={2} // Gap between thumbnail area and title
      p={2} // Padding for the container
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      _hover={{
        borderColor: 'rgba(230, 126, 34, 0.6)',
        boxShadow: '0 0 8px rgba(230, 126, 34, 0.3)',
      }}
      // Visual feedback when dragging over
      style={{
        borderColor: isDragOver ? 'rgba(230, 126, 34, 1)' : undefined,
        boxShadow: isDragOver ? '0 0 12px rgba(230, 126, 34, 0.6)' : undefined,
        backgroundColor: isDragOver ? 'rgba(230, 126, 34, 0.1)' : undefined,
      }}
    >
      {/* Context Menu */}
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<BiDotsHorizontalRounded />}
          size="xs"
          variant="ghost"
          color="whiteAlpha.700"
          aria-label="Options"
          position="absolute"
          top="4px"
          right="4px"
          visibility={isMenuVisible ? 'visible' : 'hidden'}
          onClick={(e) => e.stopPropagation()} // Prevent onOpenFolder
          _hover={{ bg: 'whiteAlpha.200' }}
          _active={{ bg: 'whiteAlpha.300' }}
        />
        <MenuList minW="150px" bg="gray.700" borderColor="gray.600">
          <MenuItem
            icon={<FiEdit2 size={16} />}
            onClick={(e) => {
              e.stopPropagation();
              onRenameFolder();
            }}
            _hover={{ bg: 'gray.600' }}
            _focus={{ bg: 'gray.600' }}
          >
            Rename
          </MenuItem>
          <MenuItem
            icon={<FiTrash size={16} />}
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFolder();
            }}
            color="red.400"
            _hover={{ bg: 'gray.600', color: 'red.300' }}
            _focus={{ bg: 'gray.600', color: 'red.300' }}
          >
            Remove
          </MenuItem>
        </MenuList>
      </Menu>

      {/* Folder Thumbnail Area & Title */}
      <Flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        flexGrow={1}
        gap={1}
      >
        {children.length === 0 ? (
          <Icon as={FaFolder} boxSize="48px" color="gray.400" /> // Empty folder icon, slightly larger
        ) : (
          <Grid
            templateColumns="repeat(2, 1fr)"
            gap={1.5} // Small gap between icons
            p={1}
            bg="rgba(0,0,0,0.2)" // Slight background for the grid area
            borderRadius="sm"
            width="56px" // Fixed width for the grid (20px * 2 + 1.5 gap * 1 + 1 padding * 2 + border?) ~50px
            height="56px" // Fixed height for the grid
            alignItems="center"
            justifyContent="center"
          >
            {displayChildren.map((childSite: WebsiteDataType) => (
              <Image
                key={childSite.id}
                boxSize="20px" // Smaller icon size
                src={childSite.icon || getIconURL(childSite.url!)}
                alt={childSite.title || 'Site Icon'}
                fallbackSrc="https://via.placeholder.com/20" // Placeholder for broken/missing child icons
                objectFit="contain"
                borderRadius="xs" // Slight rounding for mini icons
              />
            ))}
          </Grid>
        )}
        {/* Folder Title */}
        <Text
          fontSize="xs"
          color="whiteAlpha.900"
          textAlign="center"
          w="100%"
          px={1} // Padding for text to prevent touching edges
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap" // Ensure title is on one line
          mt="auto" // Push title towards the bottom if space allows
        >
          {title}
        </Text>
      </Flex>
    </Flex>
  );
}
