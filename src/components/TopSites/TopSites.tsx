import {
  Flex,
  Grid,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from '@chakra-ui/react';
import { IoIosAdd } from 'react-icons/io';
import { TopSiteDataType, FolderDataType, WebsiteDataType } from 'entities';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';

import WebsiteContainer from './WebsiteContainer';
import FolderContainer from './FolderContainer';
import WebsiteManagementModal from 'components/Modals/WebsiteManagement';
import FolderManagementModal from 'components/Modals/FolderManagement';
import { useSettings } from 'hooks/useSettings';
import { useStorageData } from 'hooks/useStorageData';

const WebsitesGrid = forwardRef<HTMLDivElement, any>((props, ref) => {
  const { settings } = useSettings();
  const { websitesList } = useStorageData();

  const columns =
    websitesList.length < settings.columns && settings.adaptTopSitesWidth
      ? websitesList.length + 1
      : settings.columns;

  return (
    <Grid
      padding={4}
      gridTemplateColumns={`repeat(${columns}, minmax(90px, 90px))`}
      justifyItems="center"
      gap={4}
      border="1px solid"
      borderColor="gray.600"
      borderRadius={8}
      backgroundColor="primaryBackground"
      backdropFilter="blur(8px)"
      ref={ref}
    >
      {props.children}
    </Grid>
  );
});

export default function TopSites() {
  const {
    isOpen: isAddWebsiteModalOpen,
    onOpen: onOpenAddWebsiteModal,
    onClose: onCloseAddWebsiteModal,
  } = useDisclosure();
  const {
    isOpen: isEditWebsiteModalOpen,
    onOpen: onOpenEditWebsiteModal,
    onClose: onCloseEditWebsiteModal,
  } = useDisclosure();
  const {
    isOpen: isAddFolderModalOpen,
    onOpen: onOpenAddFolderModal,
    onClose: onCloseAddFolderModal,
  } = useDisclosure();
  const {
    isOpen: isEditFolderModalOpen,
    onOpen: onOpenEditFolderModal,
    onClose: onCloseEditFolderModal,
  } = useDisclosure();

  const { websitesList, onWebsitesListChange } = useStorageData();

  const [editWebsiteData, setEditWebsiteData] = useState<WebsiteDataType>();
  const [editItemKey, setEditItemKey] = useState<number>();
  const [editFolderData, setEditFolderData] = useState<FolderDataType>();

  const topSitesData = useMemo(
    () =>
      websitesList.map((item) => {
        if ((item as TopSiteDataType).type) {
          return item as TopSiteDataType;
        }

        return {
          ...item,
          type: 'website',
        } as WebsiteDataType;
      }),
    [websitesList],
  );

  const rootWebsites = useMemo(
    () => topSitesData.filter((item): item is WebsiteDataType => item.type === 'website'),
    [topSitesData],
  );

  const folderEditableWebsites = useMemo(() => {
    const merged = [...rootWebsites, ...(editFolderData?.websites ?? [])];

    return merged.filter(
      (website, index, arr) => arr.findIndex((item) => item.id === website.id) === index,
    );
  }, [editFolderData?.websites, rootWebsites]);

  function handleOnOpenEditWebsiteModal(websiteData: WebsiteDataType, key: number) {
    onOpenEditWebsiteModal();

    setEditWebsiteData(websiteData);
    setEditItemKey(key);
  }

  function handleOnOpenEditFolderModal(folderData: FolderDataType, key: number) {
    onOpenEditFolderModal();

    setEditFolderData(folderData);
    setEditItemKey(key);
  }

  function handleAddWebsite(websiteData: WebsiteDataType) {
    onWebsitesListChange([...topSitesData, websiteData]);

    onCloseAddWebsiteModal();
  }

  function handleEditWebsite(websiteData: WebsiteDataType) {
    const newWebsitesList = topSitesData.map((site, index) =>
      index === editItemKey ? websiteData : site,
    );

    onWebsitesListChange(newWebsitesList);

    onCloseEditWebsiteModal();
  }

  function handleAddFolder(folderData: FolderDataType) {
    const selectedIds = new Set(folderData.websites.map((website) => website.id));
    const websitesOutsideFolder = topSitesData.filter(
      (item) => item.type === 'folder' || !selectedIds.has(item.id),
    );

    onWebsitesListChange([...websitesOutsideFolder, folderData]);

    onCloseAddFolderModal();
  }

  function handleEditFolder(folderData: FolderDataType) {
    const currentFolder = topSitesData[editItemKey ?? -1] as FolderDataType;
    const selectedIds = new Set(folderData.websites.map((website) => website.id));
    const currentFolderIds = new Set(currentFolder.websites.map((website) => website.id));

    const websitesOutsideFolder = topSitesData.filter((item, index) => {
      if (index === editItemKey || item.type === 'folder') {
        return true;
      }

      if (currentFolderIds.has(item.id)) {
        return selectedIds.has(item.id);
      }

      return !selectedIds.has(item.id);
    });

    const updated = websitesOutsideFolder.map((item, index) =>
      index === editItemKey ? folderData : item,
    );

    onWebsitesListChange(updated);
    onCloseEditFolderModal();
  }

  function handleRemove(key: number) {
    const newWebsitesList = topSitesData.filter((site, index) => index !== key);

    onWebsitesListChange(newWebsitesList);
  }

  useEffect(() => {
    localStorage.setItem('websitesList', JSON.stringify(topSitesData));
  }, [topSitesData]);

  return (
    <Flex
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
      position="absolute"
      zIndex={2}
    >
      <WebsiteManagementModal
        type="add"
        isOpen={isAddWebsiteModalOpen}
        onClose={onCloseAddWebsiteModal}
        onSubmit={handleAddWebsite}
      />

      <WebsiteManagementModal
        type="edit"
        isOpen={isEditWebsiteModalOpen}
        onClose={onCloseEditWebsiteModal}
        onSubmit={handleEditWebsite}
        websiteData={editWebsiteData}
      />

      <FolderManagementModal
        type="add"
        isOpen={isAddFolderModalOpen}
        onClose={onCloseAddFolderModal}
        onSubmit={handleAddFolder}
        websites={rootWebsites}
      />

      <FolderManagementModal
        type="edit"
        isOpen={isEditFolderModalOpen}
        onClose={onCloseEditFolderModal}
        onSubmit={handleEditFolder}
        folderData={editFolderData}
        websites={folderEditableWebsites}
      />

      <ReactSortable
        tag={WebsitesGrid}
        list={topSitesData}
        setList={onWebsitesListChange}
        draggable="#website-container"
      >
        {topSitesData.map((item, key) =>
          item.type === 'folder' ? (
            <FolderContainer
              id="website-container"
              key={item.id}
              folderData={item}
              onOpenEditModal={() => handleOnOpenEditFolderModal(item, key)}
              onRemove={() => handleRemove(key)}
            />
          ) : (
            <WebsiteContainer
              id="website-container"
              key={item.id}
              onOpenEditModal={() => handleOnOpenEditWebsiteModal(item, key)}
              onRemove={() => handleRemove(key)}
              websiteData={item}
            />
          ),
        )}

        <Menu>
          <MenuButton
            as={Flex}
            padding={2}
            height="80px"
            width="90px"
            maxHeight="80px"
            maxWidth="105px"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
            borderRadius={8}
            cursor="pointer"
            _hover={{
              backgroundColor: 'secondaryBackground',
              backdropFilter: 'blur(3px)',
              border: '1px solid',
              borderColor: 'gray.500',
              opacity: 0.85,
              '& > *': {
                color: 'gray.50',
              },
            }}
          >
            <Icon
              as={IoIosAdd}
              boxSize="40px"
              color="gray.400"
              fontWeight="light"
            />
          </MenuButton>
          <MenuList>
            <MenuItem onClick={onOpenAddWebsiteModal}>Adicionar site</MenuItem>
            <MenuItem onClick={onOpenAddFolderModal}>Criar pasta</MenuItem>
          </MenuList>
        </Menu>
      </ReactSortable>
    </Flex>
  );
}
