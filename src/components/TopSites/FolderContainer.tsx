import { Flex, Grid, Image, Menu, MenuButton, MenuItem, MenuList, Text, Icon, IconButton } from '@chakra-ui/react';
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
}

export default function FolderContainer({
  id,
  folderData,
  onOpenFolder,
  onRenameFolder,
  onRemoveFolder,
}: FolderContainerProps) {
  const { title, children } = folderData;
  const displayChildren = children.slice(0, 4);
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);

  const handleMouseEnter = () => {
    setIsMenuVisible(true);
  };

  const handleMouseLeave = () => {
    setIsMenuVisible(false);
  };

  return (
    <Flex
      id={id} // Important for ReactSortable
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
      <Flex flexDirection="column" alignItems="center" justifyContent="center" flexGrow={1} gap={1}>
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

// Need to import React for useState
import React from 'react';
