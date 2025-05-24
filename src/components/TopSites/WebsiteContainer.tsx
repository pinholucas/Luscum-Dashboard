import React from 'react';
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
  onWebsiteDroppedOntoWebsite?: (draggedWebsite: WebsiteDataType, targetWebsite: WebsiteDataType) => void;
  className?: string;
}

export default function WebsiteContainer({
  id,
  onOpenEditModal,
  onRemove,
  websiteData,
  onWebsiteDroppedOntoWebsite,
  className,
}: WebsiteContainerProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isNearCenter, setIsNearCenter] = React.useState(false);
  const [hoverTimeoutId, setHoverTimeoutId] = React.useState<NodeJS.Timeout | null>(null);

  const checkIfDraggedCenterIsOverTargetCenter = (e: React.DragEvent): boolean => {
    // Get the dragged element
    const draggedElement = document.querySelector('[data-dragging-type="website"]');
    if (!draggedElement) return false;

    // Get the dragged element's dimensions
    const draggedRect = draggedElement.getBoundingClientRect();
    const draggedCenterX = draggedRect.left + draggedRect.width / 2;
    const draggedCenterY = draggedRect.top + draggedRect.height / 2;

    // Get target element's dimensions
    const targetRect = e.currentTarget.getBoundingClientRect();
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    // Calculate distance between centers
    const distanceX = Math.abs(draggedCenterX - targetCenterX);
    const distanceY = Math.abs(draggedCenterY - targetCenterY);

    // Consider "near center" if dragged center is within 40% of target's dimensions from target center
    const thresholdX = targetRect.width * 0.2; // 20% from center = 40% total width
    const thresholdY = targetRect.height * 0.2; // 20% from center = 40% total height

    return distanceX < thresholdX && distanceY < thresholdY;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedElement = document.querySelector('[data-dragging-type="website"]');
    if (draggedElement) {
      const draggedItemData = (draggedElement as any)._draggedItemData;
      if (draggedItemData && draggedItemData.type === 'website' && draggedItemData.id !== websiteData.id) {
        setIsDragOver(true);
        
        // Clear any existing timeout
        if (hoverTimeoutId) {
          clearTimeout(hoverTimeoutId);
        }

        // Check if we're near center and set a delay before showing folder creation intent
        const nearCenter = checkIfDraggedCenterIsOverTargetCenter(e);
        if (nearCenter) {
          const timeoutId = setTimeout(() => {
            setIsNearCenter(true);
            console.log('Showing folder creation intent for:', websiteData.title);
          }, 300); // 300ms delay before showing folder creation intent
          setHoverTimeoutId(timeoutId);
        } else {
          setIsNearCenter(false);
        }
        
        console.log('Drag enter on website:', websiteData.title, 'Near center:', nearCenter);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedElement = document.querySelector('[data-dragging-type="website"]');
    if (draggedElement) {
      const draggedItemData = (draggedElement as any)._draggedItemData;
      if (draggedItemData && draggedItemData.type === 'website' && draggedItemData.id !== websiteData.id) {
        const nearCenter = checkIfDraggedCenterIsOverTargetCenter(e);
        
        // If we moved away from center, clear the timeout and folder creation intent
        if (!nearCenter) {
          if (hoverTimeoutId) {
            clearTimeout(hoverTimeoutId);
            setHoverTimeoutId(null);
          }
          setIsNearCenter(false);
        } else if (!isNearCenter && !hoverTimeoutId) {
          // If we're near center but don't have timeout running, start it
          const timeoutId = setTimeout(() => {
            setIsNearCenter(true);
            console.log('Showing folder creation intent for:', websiteData.title);
          }, 300);
          setHoverTimeoutId(timeoutId);
        }
        
        // Set appropriate drop effect
        if (isNearCenter) {
          e.dataTransfer.dropEffect = 'copy';
        } else {
          e.dataTransfer.dropEffect = 'move';
        }
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
      setIsNearCenter(false);
      
      // Clear timeout when leaving
      if (hoverTimeoutId) {
        clearTimeout(hoverTimeoutId);
        setHoverTimeoutId(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Clear timeout
    if (hoverTimeoutId) {
      clearTimeout(hoverTimeoutId);
      setHoverTimeoutId(null);
    }
    
    const wasNearCenter = isNearCenter;
    setIsDragOver(false);
    setIsNearCenter(false);

    console.log('Drop event triggered on WebsiteContainer, near center:', wasNearCenter);

    // Only handle folder creation if we were showing folder creation intent
    if (!wasNearCenter) {
      console.log('Drop not showing folder creation intent, allowing reordering instead');
      return; // Let ReactSortable handle reordering
    }

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

    if (draggedItemData && onWebsiteDroppedOntoWebsite) {
      if (draggedItemData.type === 'website' && draggedItemData.id !== websiteData.id) {
        console.log('Creating folder from two websites:', draggedItemData, websiteData);
        onWebsiteDroppedOntoWebsite(draggedItemData, websiteData);
      } else {
        console.log('Drop conditions not met:', {
          draggedItemData,
          targetWebsiteId: websiteData.id,
          sameId: draggedItemData?.id === websiteData.id
        });
      }
    } else {
      console.log('No dragged element found or handler missing', { draggedItemData, onWebsiteDroppedOntoWebsite });
    }
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutId) {
        clearTimeout(hoverTimeoutId);
      }
    };
  }, [hoverTimeoutId]);
  return (
    <>
      <Flex
        id={id}
        className={className}
        data-type="website" // Add data attribute for easier detection
        data-website-id={websiteData.id} // Add website ID as data attribute
        position="relative"
        height="120px"
        width="120px"
        maxHeight="120px"
        maxWidth="120px"
        backgroundColor="secondaryBackground"
        border="1px solid"
        borderColor="gray.600"
        borderRadius={8}
        cursor="pointer"
        userSelect={'none'}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        _hover={{
          borderColor: 'gray.500',
          '& > button': {
            visibility: 'visible',
          },
        }}
        // Visual feedback when dragging over
        style={{
          borderColor: isDragOver && isNearCenter ? 'rgba(230, 126, 34, 1)' : 
                      isDragOver ? 'rgba(74, 144, 226, 0.8)' : undefined,
          boxShadow: isDragOver && isNearCenter ? '0 0 12px rgba(230, 126, 34, 0.6)' : 
                    isDragOver ? '0 0 8px rgba(74, 144, 226, 0.4)' : undefined,
          backgroundColor: isDragOver && isNearCenter ? 'rgba(230, 126, 34, 0.1)' : 
                          isDragOver ? 'rgba(74, 144, 226, 0.05)' : undefined,
          transform: isDragOver && isNearCenter ? 'scale(1.05)' : undefined,
          transition: 'all 0.2s ease',
        }}
        title={isDragOver && isNearCenter ? "Drop here to create a folder" : 
              isDragOver ? "Drop near center to create folder, or near edges to reorder" : undefined}
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
          pointerEvents={isDragOver ? 'none' : 'auto'} // Disable pointer events when dragging over
          _hover={{
            textDecoration: 'none',
          }}
          _focus={{ outline: 'none' }}
          onClick={(e) => {
            // Prevent navigation if we're in the middle of a drag operation
            if (isDragOver || document.querySelector('[data-dragging-type]')) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
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
