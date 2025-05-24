import { Flex, Grid, Icon, useDisclosure, Text } from '@chakra-ui/react';
import { IoIosAdd } from 'react-icons/io';
import { FaFolder } from 'react-icons/fa';
import {
  WebsiteDataType,
  FolderDataType,
  TopSiteItemType,
} from '../../entities'; // Updated import
import { forwardRef, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { v4 as uuidv4 } from 'uuid'; // For unique IDs

import WebsiteContainer from './WebsiteContainer';
import FolderContainer from './FolderContainer'; // Import FolderContainer
import WebsiteManagementModal from 'components/Modals/WebsiteManagement';
import FolderViewModal from 'components/Modals/FolderViewModal';
import { WebsiteManagementSubmitData } from 'components/Modals/WebsiteManagement'; // Import the submit data type
import { useSettings } from 'hooks/useSettings';
import { useStorageData } from 'hooks/useStorageData';

type EditingItemContextType = // Renamed from EditingWebsiteContextType for clarity

    | { type: 'main'; itemId: string }
    | { type: 'folder_child'; folderId: string; itemId: string };

const WebsitesGrid = forwardRef<HTMLDivElement, any>((props, ref) => {
  const { settings } = useSettings();
  // Assuming websitesList from useStorageData will be TopSiteItemType[]
  const { websitesList }: { websitesList: TopSiteItemType[] } =
    useStorageData();

  const itemCount = websitesList.length + 2; // +1 for add website, +1 for add folder
  const columns =
    itemCount < settings.columns && settings.adaptTopSitesWidth
      ? itemCount
      : settings.columns;

  // Clamp columns to a minimum of 1 if itemCount is 0, to avoid invalid gridTemplateColumns
  const displayColumns = Math.max(1, columns);

  return (
    <Grid
      padding={4}
      gridTemplateColumns={`repeat(${displayColumns}, minmax(120px, 120px))`} // Increased minmax to accommodate FolderContainer
      justifyItems="center"
      gap={6} // Increased gap
      border="1px solid"
      borderColor="gray.600"
      borderRadius={8}
      backgroundColor="rgba(26, 27, 30, 0.75)" // primaryBackground with some transparency
      backdropFilter="blur(10px)" // Slightly more blur
      ref={ref}
      minHeight="150px" // Ensure grid has some min height
    >
      {props.children}
    </Grid>
  );
});

export default function TopSites() {
  const {
    isOpen: isAddModalOpen,
    onOpen: onOpenAddModal,
    onClose: onCloseAddModal,
  } = useDisclosure();
  const {
    isOpen: isEditModalOpen,
    onOpen: onOpenEditModal,
    onClose: onCloseEditModal,
  } = useDisclosure();
  const {
    isOpen: isFolderViewModalOpen,
    onOpen: onOpenFolderViewModal,
    onClose: onCloseFolderViewModal,
  } = useDisclosure();

  // websitesList is now TopSiteItemType[]
  const { websitesList, onWebsitesListChange } = useStorageData();

  // State for the item being edited (website or folder) in WebsiteManagementModal
  const [editingItemData, setEditingItemData] = useState<
    TopSiteItemType | undefined
  >(undefined);
  // Context for editing: 'main' for top-level items, 'folder_child' for items within a folder.
  // Includes itemId for clarity, though editingItemData?.id could also be used.
  const [editingItemContext, setEditingItemContext] =
    useState<EditingItemContextType | null>(null);

  const [viewingFolder, setViewingFolder] = useState<FolderDataType | null>(
    null,
  );

  // Opens the WebsiteManagementModal for editing an existing item (website or folder)
  function handleOpenEditItemModal(
    itemId: string,
    contextType: 'main' | 'folder_child',
    folderIdIfChild?: string,
  ) {
    const itemToEdit =
      contextType === 'main'
        ? websitesList.find((item) => item.id === itemId)
        : viewingFolder?.children.find((child) => child.id === itemId); // Assuming editing child from open folder view

    if (itemToEdit) {
      setEditingItemData(itemToEdit);
      if (contextType === 'main') {
        setEditingItemContext({ type: 'main', itemId: itemToEdit.id });
      } else if (contextType === 'folder_child' && folderIdIfChild) {
        setEditingItemContext({
          type: 'folder_child',
          folderId: folderIdIfChild,
          itemId: itemToEdit.id,
        });
      }
      onOpenEditModal(); // This opens the WebsiteManagementModal configured for 'edit'
    } else {
      console.error('Item to edit not found:', itemId);
    }
  }

  // Specifically for the "Rename" option on FolderContainer's context menu
  function handleRenameFolderTrigger(folderId: string) {
    const folderToRename = websitesList.find(
      (item) => item.id === folderId && item.type === 'folder',
    );
    if (folderToRename) {
      setEditingItemData(folderToRename);
      // When renaming a folder itself, the context is 'main' because it's a top-level item.
      setEditingItemContext({ type: 'main', itemId: folderToRename.id });
      onOpenEditModal();
    }
  }

  // Submit handler for adding a NEW website (from WebsiteManagementModal in 'add' mode)
  function handleAddWebsiteSubmit(data: WebsiteManagementSubmitData) {
    if (data.type === 'website' && !('id' in data)) {
      // Ensure it's for adding a new website
      const newWebsite: WebsiteDataType = {
        ...data, // title, url, icon from modal
        id: uuidv4(), // Generate new ID
        type: 'website', // Explicitly set type
      };
      onWebsitesListChange([...websitesList, newWebsite]);
      onCloseAddModal();
    } else {
      console.error(
        'handleAddWebsiteSubmit called with invalid data type or for an existing item',
        data,
      );
    }
  }

  function handleAddFolder() {
    // Adds a new folder to the main list
    const newFolder: FolderDataType = {
      id: uuidv4(),
      title: 'New Folder',
      children: [],
      type: 'folder',
    };
    onWebsitesListChange([...websitesList, newFolder]);
  }

  // Submit handler for editing an EXISTING item (website or folder)
  // (from WebsiteManagementModal in 'edit' mode)
  function handleEditItemSubmit(submittedData: WebsiteManagementSubmitData) {
    if (
      !editingItemContext ||
      !editingItemData ||
      !('id' in submittedData) ||
      submittedData.id !== editingItemData.id
    ) {
      console.error(
        'Editing context not set correctly or ID mismatch.',
        editingItemContext,
        editingItemData,
        submittedData,
      );
      onCloseEditModal();
      return;
    }

    if (submittedData.type === 'folder' && editingItemContext.type === 'main') {
      // Editing a Folder's Title
      const updatedWebsitesList = websitesList.map((item) =>
        item.id === submittedData.id && item.type === 'folder'
          ? { ...item, title: submittedData.title }
          : item,
      );
      onWebsitesListChange(updatedWebsitesList);
      if (viewingFolder?.id === submittedData.id) {
        setViewingFolder((prev) =>
          prev ? { ...prev, title: submittedData.title } : null,
        );
      }
    } else if (submittedData.type === 'website') {
      // Editing a Website (either main or in folder)
      const updatedWebsite = {
        ...editingItemData,
        ...submittedData,
        type: 'website',
      } as WebsiteDataType;

      if (editingItemContext.type === 'main') {
        const newWebsitesList = websitesList.map((item) =>
          item.id === updatedWebsite.id ? updatedWebsite : item,
        );
        onWebsitesListChange(newWebsitesList);
      } else if (editingItemContext.type === 'folder_child') {
        const { folderId } = editingItemContext;
        const folderToUpdate = websitesList.find(
          (item) => item.id === folderId && item.type === 'folder',
        ) as FolderDataType | undefined;
        if (folderToUpdate) {
          const updatedChildren = folderToUpdate.children.map((child) =>
            child.id === updatedWebsite.id ? updatedWebsite : child,
          );
          handleUpdateFolderChildren(folderId, updatedChildren);
        }
      }
    }
    onCloseEditModal();
  }

  function handleRemoveWebsite(websiteId: string) {
    // Removes from main list (not used for folder children here)
    const newWebsitesList = websitesList.filter(
      (item) => item.id !== websiteId,
    );
    onWebsitesListChange(newWebsitesList);
  }

  function handleRemoveFolder(folderId: string) {
    // Removes a folder from the main list
    const newWebsitesList = websitesList.filter((item) => item.id !== folderId);
    onWebsitesListChange(newWebsitesList);
    if (viewingFolder?.id === folderId) {
      onCloseFolderViewModal();
      setViewingFolder(null);
    }
  }

  // --- FolderViewModal Related Handlers ---

  function handleOpenFolderViewer(folderId: string) {
    // Renamed for clarity from handleOpenFolder
    const folderToView = websitesList.find(
      (item) => item.id === folderId && item.type === 'folder',
    ) as FolderDataType | undefined;
    if (folderToView) {
      setViewingFolder(folderToView);
      onOpenFolderViewModal();
    } else {
      console.error('Folder not found for ID:', folderId);
    }
  }

  const handleLaunchWebsite = (url: string) => {
    // Used by FolderViewModal
    if (url) {
      window.open(
        url.startsWith('http') ? url : `https://${url}`,
        '_blank',
        'noopener,noreferrer',
      );
    }
  };

  // This function is called by FolderViewModal to update its children (e.g., after reordering or removal)
  function handleUpdateFolderChildren(
    folderId: string,
    newChildren: WebsiteDataType[],
  ) {
    const updatedWebsitesList = websitesList.map((item) => {
      if (item.id === folderId && item.type === 'folder') {
        return { ...item, children: newChildren };
      }
      return item;
    });
    onWebsitesListChange(updatedWebsitesList);
    if (viewingFolder && viewingFolder.id === folderId) {
      setViewingFolder((prev) =>
        prev ? { ...prev, children: newChildren } : null,
      );
    }
  }

  // Called by FolderViewModal when removing a website from within the folder
  function handleRemoveWebsiteFromFolder(websiteId: string, folderId: string) {
    const folder = websitesList.find(
      (item) => item.id === folderId && item.type === 'folder',
    ) as FolderDataType | undefined;
    if (folder) {
      const updatedChildren = folder.children.filter(
        (child) => child.id !== websiteId,
      );
      handleUpdateFolderChildren(folderId, updatedChildren);
    }
  }

  // Called by FolderViewModal to trigger editing a website shown within the folder
  function handleEditWebsiteInFolderTrigger(
    website: WebsiteDataType,
    folderId: string,
  ) {
    setEditingItemData(website); // The website data is the item to edit
    setEditingItemContext({
      type: 'folder_child',
      folderId: folderId,
      itemId: website.id,
    });
    onOpenEditModal(); // Opens WebsiteManagementModal
  }

  // Handler for when a website is dropped into a folder via native drag and drop
  function handleWebsiteDroppedIntoFolder(websiteData: WebsiteDataType, folderId: string) {
    console.log('Website dropped into folder:', websiteData.id, 'into folder:', folderId);
    
    // Remove the website from the main list
    let processedList = websitesList.filter((i) => i.id !== websiteData.id);

    // Add it to the target folder
    processedList = processedList.map((item) => {
      if (item.id === folderId && item.type === 'folder') {
        const children = (item as FolderDataType).children || [];
        if (!children.find((child) => child.id === websiteData.id)) {
          // Avoid duplicates
          return {
            ...item,
            children: [...children, websiteData],
          };
        }
      }
      return item;
    });

    onWebsitesListChange(processedList);

    // Update viewingFolder if the website was dragged into it
    if (viewingFolder && viewingFolder.id === folderId) {
      const updatedFolder = processedList.find(
        (f) => f.id === folderId && f.type === 'folder',
      ) as FolderDataType | undefined;
      if (updatedFolder) setViewingFolder(updatedFolder);
    }
  }

  // Handler for when a website is dropped onto another website to create a new folder
  function handleWebsiteDroppedOntoWebsite(draggedWebsite: WebsiteDataType, targetWebsite: WebsiteDataType) {
    console.log('Creating new folder from two websites:', draggedWebsite.id, targetWebsite.id);
    
    // Create a new folder with both websites
    const newFolder: FolderDataType = {
      id: uuidv4(),
      title: 'New Folder',
      children: [targetWebsite, draggedWebsite],
      type: 'folder',
    };

    // Remove both websites from the main list and add the new folder
    let processedList = websitesList.filter(
      (i) => i.id !== draggedWebsite.id && i.id !== targetWebsite.id
    );

    // Find the position where the target website was and insert the folder there
    const targetIndex = websitesList.findIndex((i) => i.id === targetWebsite.id);
    if (targetIndex !== -1) {
      processedList.splice(targetIndex, 0, newFolder);
    } else {
      // Fallback: add at the end
      processedList.push(newFolder);
    }

    onWebsitesListChange(processedList);
  }

  // handleRenameFolder is now handleRenameFolderTrigger which calls handleOpenEditItemModal

  // Removed useEffect for localStorage persistence as it's now handled in AppContext.tsx

  return (
    <Flex
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
      position="absolute"
      zIndex={2}
      overflowY="auto"
      p={4}
    >
      {/* Modal for ADDING a new website */}
      <WebsiteManagementModal
        type="add"
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        onSubmit={handleAddWebsiteSubmit} // New specific handler for adding
      />

      {/* Modal for EDITING an existing website OR folder */}
      <WebsiteManagementModal
        type="edit"
        isOpen={isEditModalOpen}
        onClose={() => {
          onCloseEditModal();
          setEditingItemData(undefined);
          setEditingItemContext(null);
        }}
        onSubmit={handleEditItemSubmit} // New specific handler for editing
        itemData={editingItemData} // Pass the full item (website or folder)
      />

      <FolderViewModal
        isOpen={isFolderViewModalOpen}
        onClose={() => {
          onCloseFolderViewModal();
          setViewingFolder(null);
        }}
        folder={viewingFolder}
        onLaunchWebsite={handleLaunchWebsite}
        onEditWebsiteInFolder={handleEditWebsiteInFolderTrigger} // Changed to trigger
        onRemoveWebsiteFromFolder={handleRemoveWebsiteFromFolder}
      />

      <ReactSortable
        tag={WebsitesGrid}
        list={websitesList}
        setList={(newListProposedBySortable, sortableInstance, store) => {
          // Handle regular reordering only
          const reorderedList = newListProposedBySortable
            .map((sortedItem) => {
              const fullItem = websitesList.find(
                (originalItem) => originalItem.id === (sortedItem as any).id,
              );
              return fullItem ? fullItem : sortedItem;
            })
            .filter(Boolean) as TopSiteItemType[];
          onWebsitesListChange(reorderedList);
        }}
        draggable=".draggable-item"
        animation={200}
        delay={2}
        ghostClass="sortable-ghost"
        chosenClass="sortable-chosen"
        dragClass="sortable-drag"
        group={{
          name: 'top-sites',
          pull: true,
          put: true
        }}
        sort={true}
        swapThreshold={0.9}
        invertSwap={false}
        onStart={(evt) => {
          // Add visual feedback when dragging starts
          if (evt.item) {
            evt.item.style.opacity = '0.8';
            const draggedId = evt.item.id;
            const draggedType = draggedId.startsWith('website-') ? 'website' : 'folder';
            evt.item.setAttribute('data-dragging-type', draggedType);
            
            // Store original item data for folder drops
            const actualDraggedItemId = draggedId.replace(/^(website-|folder-)/, '');
            const actualDraggedItem = websitesList.find((i) => i.id === actualDraggedItemId);
            if (actualDraggedItem) {
              (evt.item as any)._draggedItemData = actualDraggedItem;
              // Also store in a global variable as backup
              (window as any)._currentlyDraggedItem = actualDraggedItem;
            }
          }
        }}
        onMove={(evt) => {
          // Allow most moves, only prevent when specifically targeting folder creation
          const related = evt.related;
          const dragged = evt.dragged;
          
          if (related && dragged) {
            const relatedIsFolderContainer = related.id?.startsWith('folder-') || 
                                           related.getAttribute?.('data-type') === 'folder';
            const relatedIsWebsiteContainer = related.id?.startsWith('website-') || 
                                             related.getAttribute?.('data-type') === 'website';
            const draggedIsWebsite = dragged.id?.startsWith('website-');
            
            // Always prevent moves onto folders
            if (draggedIsWebsite && relatedIsFolderContainer) {
              return false;
            }
            
            // For website-to-website, check if any website is showing center-targeting feedback
            if (draggedIsWebsite && relatedIsWebsiteContainer) {
              // Check if any website container is showing the center-targeting visual feedback
              const websiteShowingCenterFeedback = document.querySelector('[data-type="website"][style*="rgba(230, 126, 34"]');
              if (websiteShowingCenterFeedback) {
                // A website is showing folder creation feedback, prevent ReactSortable move
                return false;
              }
            }
          }
          return true; // Allow normal reordering in all other cases
        }}
        onEnd={(evt) => {
          // Reset visual feedback when dragging ends
          if (evt.item) {
            evt.item.style.opacity = '1';
            evt.item.removeAttribute('data-dragging-type');
            delete (evt.item as any)._draggedItemData;
            // Clean up global backup
            delete (window as any)._currentlyDraggedItem;
          }
        }}
      >
        {websitesList?.map((item) => {
          if (item.type === 'folder') {
            return (
              <FolderContainer
                className="draggable-item"
                id={`folder-${item.id}`}
                key={item.id}
                folderData={item as FolderDataType}
                onOpenFolder={() => handleOpenFolderViewer(item.id)} // Changed to Viewer
                onRenameFolder={() => handleRenameFolderTrigger(item.id)} // Changed to Trigger
                onRemoveFolder={() => handleRemoveFolder(item.id)}
                onWebsiteDroppedIntoFolder={handleWebsiteDroppedIntoFolder}
              />
            );
          } else {
            return (
              <WebsiteContainer
                className="draggable-item"
                id={`website-${item.id}`}
                key={item.id}
                onOpenEditModal={() => handleOpenEditItemModal(item.id, 'main')} // Updated to use new handler
                onRemove={() => handleRemoveWebsite(item.id)}
                websiteData={item as WebsiteDataType}
                onWebsiteDroppedOntoWebsite={handleWebsiteDroppedOntoWebsite}
              />
            );
          }
        })}

        {/* "Add New Website" Button - Triggers 'add' mode of WebsiteManagementModal */}
        <Flex
          className="add-button" // Not draggable
          h="120px" // Match FolderContainer/WebsiteContainer height
          w="120px" // Match FolderContainer/WebsiteContainer width
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={1} // Reduced gap
          borderRadius="md" // Match FolderContainer/WebsiteContainer
          cursor="pointer"
          border="1px dashed rgba(255, 255, 255, 0.2)"
          _hover={{
            bg: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.4)',
          }}
          onClick={onOpenAddModal}
          title="Add new website"
        >
          <Icon as={IoIosAdd} boxSize="32px" color="whiteAlpha.600" />
          <Text fontSize="xs" color="whiteAlpha.700">
            Add Website
          </Text>
        </Flex>

        {/* Add New Folder Button */}
        <Flex
          className="add-button" // Not draggable
          h="120px" // Match FolderContainer/WebsiteContainer height
          w="120px" // Match FolderContainer/WebsiteContainer width
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={1}
          borderRadius="md"
          cursor="pointer"
          border="1px dashed rgba(255, 255, 255, 0.2)"
          _hover={{
            bg: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.4)',
          }}
          onClick={handleAddFolder}
          title="Add new folder"
        >
          <Icon as={FaFolder} boxSize="28px" color="whiteAlpha.600" />
          <Text fontSize="xs" color="whiteAlpha.700">
            Add Folder
          </Text>
        </Flex>
      </ReactSortable>
    </Flex>
  );
}
