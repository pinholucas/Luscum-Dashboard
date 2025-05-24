import {
  Image,
  Button,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
// nanoid is not strictly needed if adding new items is handled by the parent, 
// but can be kept if the modal itself is responsible for generating ID for new 'website' types.
// For this refactor, we'll assume parent (TopSites.tsx) handles ID generation for new items.

import { getIconURL } from 'utils';
import { WebsiteDataType, FolderDataType, TopSiteItemType } from 'entities'; // Import FolderDataType and TopSiteItemType

// The data submitted can be for a new website (no id), or an existing website/folder (with id)
export type WebsiteManagementSubmitData = 
  | (Omit<WebsiteDataType, 'id' | 'type'> & { type: 'website' }) // For adding a new website
  | (Pick<WebsiteDataType, 'id' | 'title' | 'url' | 'icon'> & { type: 'website' }) // For editing a website
  | (Pick<FolderDataType, 'id' | 'title'> & { type: 'folder' }); // For editing a folder


interface WebsiteManagementModalProps {
  type: 'add' | 'edit'; // 'add' is always for websites
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WebsiteManagementSubmitData) => void;
  itemData?: TopSiteItemType; // Changed from websiteData to itemData, can be Website or Folder
}

export default function WebsiteManagementModal({
  type,
  isOpen,
  onClose,
  onSubmit,
  itemData, // Changed from websiteData
}: WebsiteManagementModalProps) {
  // Internal state can hold parts of WebsiteDataType or FolderDataType
  const [currentItem, setCurrentItem] = useState<Partial<TopSiteItemType> & { title?: string; url?: string; icon?: string }>({});

  useEffect(() => {
    if (type === 'edit' && itemData) {
      setCurrentItem({
        id: itemData.id,
        title: itemData.title,
        type: itemData.type,
        url: itemData.type === 'website' ? (itemData as WebsiteDataType).url : undefined,
        icon: itemData.type === 'website' ? (itemData as WebsiteDataType).icon : undefined,
      });
    } else if (type === 'add') {
      // For 'add', initialize with type 'website' and empty fields
      setCurrentItem({ type: 'website', title: '', url: '', icon: '' });
    } else {
      // Reset if opened in a weird state or for 'edit' without itemData
      setCurrentItem({ type: 'website', title: '', url: '', icon: '' }); 
    }
  }, [itemData, type, isOpen]); // isOpen ensures reset when modal reopens

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value, name } = event.currentTarget;
    setCurrentItem(prev => ({
      ...prev,
      [name]: value, // value can be empty string, parent should handle null if needed
    }));
  }

  function handleSubmit() {
    if (!currentItem.title && currentItem.type === 'website') {
      // Basic validation: Title is required for websites
      // Potentially add more validation here or inform user
      console.error("Title is required for websites.");
      return;
    }
    if (!currentItem.title && currentItem.type === 'folder') {
       console.error("Title is required for folders.");
      return;
    }


    if (type === 'add') { // Always adding a website
      onSubmit({
        title: currentItem.title || '',
        url: currentItem.url || '',
        icon: currentItem.icon || undefined, // Ensure icon can be undefined
        type: 'website',
      });
    } else if (type === 'edit' && currentItem.id) { // Editing existing item
      if (currentItem.type === 'folder') {
        onSubmit({
          id: currentItem.id,
          title: currentItem.title || 'Untitled Folder',
          type: 'folder',
        });
      } else if (currentItem.type === 'website') {
        onSubmit({
          id: currentItem.id,
          title: currentItem.title || 'Untitled Website',
          url: currentItem.url || '',
          icon: currentItem.icon || undefined,
          type: 'website',
        });
      }
    }
    // Clear state for next opening, though useEffect handles this too
    // setCurrentItem({}); // Not strictly necessary due to useEffect
    onClose(); // Close modal after submit
  }
  
  function handleCancel() {
    onClose();
    // setCurrentItem({}); // Reset state on cancel, though useEffect handles this too
  }

  const modalTitle = type === 'add' 
    ? 'Add New Website' 
    : `Edit ${currentItem.type === 'folder' ? 'Folder' : 'Site'}`;
  
  const showUrlField = currentItem.type !== 'folder';
  const showIconField = currentItem.type !== 'folder';
  const showIconPreview = currentItem.type !== 'folder' && (currentItem.url || currentItem.icon);

  return (
    <Modal isCentered isOpen={isOpen} onClose={handleCancel}> {/* Changed onClose to handleCancel */}
      <ModalOverlay />
      <ModalContent bg="gray.800" color="whiteAlpha.900"> {/* Enhanced styling */}
        <ModalHeader borderBottomWidth="1px" borderColor="gray.700">
          {modalTitle}
        </ModalHeader>
        <ModalBody pb={6}>
          {showIconPreview && (
            <Image
              mb={4} // Add some margin
              width="48px" // Slightly larger
              height="48px"
              src={currentItem.icon || getIconURL(currentItem.url || '')}
              alt="Site Icon Preview"
              objectFit="contain"
              fallbackSrc="https://via.placeholder.com/48" // Generic fallback
            />
          )}

          {showIconField && (
            <FormControl mt={4}>
              <FormLabel>Custom Icon URL (optional)</FormLabel>
              <Input
                name="icon"
                placeholder="e.g., https://example.com/icon.png"
                value={currentItem.icon || ''}
                onChange={handleInputChange}
              />
            </FormControl>
          )}

          <FormControl mt={4}>
            <FormLabel>Title</FormLabel>
            <Input
              name="title"
              placeholder={currentItem.type === 'folder' ? 'Folder Title' : 'Site Title'}
              value={currentItem.title || ''}
              onChange={handleInputChange}
              isRequired // Title is generally required
            />
          </FormControl>

          {showUrlField && (
            <FormControl mt={4}>
              <FormLabel>URL</FormLabel>
              <Input
                name="url"
                placeholder="e.g., https://example.com"
                value={currentItem.url || ''}
                onChange={handleInputChange}
                isRequired={currentItem.type === 'website'} // URL is required for websites
              />
            </FormControl>
          )}
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor="gray.700">
          <Button 
            colorScheme="blue" // More standard color scheme
            mr={3} 
            onClick={handleSubmit}
            // Disable button if title is empty, basic validation
            isDisabled={!currentItem.title || (currentItem.type === 'website' && !currentItem.url && type === 'add')}
          >
            {type === 'add' ? 'Add' : 'Save Changes'}
          </Button>
          <Button variant="ghost" onClick={handleCancel} _hover={{ bg: 'whiteAlpha.100' }}> {/* Ghost variant for cancel */}
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
