import { Flex, Grid, Icon, useDisclosure } from '@chakra-ui/react';
import { IoIosAdd } from 'react-icons/io';
import { WebsiteDataType } from 'entities';
import { forwardRef, useEffect, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { nanoid } from 'nanoid';

import WebsiteContainer from './WebsiteContainer';
import FolderModal from './FolderModal';
import WebsiteManagementModal from 'components/Modals/WebsiteManagement';
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
    isOpen: isAddModalOpen,
    onOpen: onOpenAddModal,
    onClose: onCloseAddModal,
  } = useDisclosure();
  const {
    isOpen: isEditModalOpen,
    onOpen: onOpenEditModal,
    onClose: onCloseEditModal,
  } = useDisclosure();

  const { websitesList, onWebsitesListChange } = useStorageData();
  const [editWebsiteData, setEditWebsiteData] = useState<WebsiteDataType>();
  const [editWebsiteDataKey, setEditWebsiteDataKey] = useState<number>();
  const [previousList, setPreviousList] = useState<WebsiteDataType[]>([]);
  const [openedFolder, setOpenedFolder] = useState<WebsiteDataType | null>(null);

  function handleOnOpenEditModal(websiteData: WebsiteDataType, key: number) {
    onOpenEditModal();

    setEditWebsiteData(websiteData);
    setEditWebsiteDataKey(key);
  }

  function handleAdd(websiteData: WebsiteDataType) {
    onWebsitesListChange([...websitesList, websiteData]);

    onCloseAddModal();
  }

  function handleEdit(websiteData: WebsiteDataType) {
    const newWebsitesList = websitesList.map((website, index) =>
      index === editWebsiteDataKey ? websiteData : website,
    );

    onWebsitesListChange(newWebsitesList);

    onCloseEditModal();
  }

  function handleRemove(key: number) {
    const newWebsitesList = websitesList.filter(
      (website, index) => index !== key,
    );

    onWebsitesListChange(newWebsitesList);
  }

  function handleOpenFolder(folder: WebsiteDataType) {
    setOpenedFolder(folder);
  }

  function handleCloseFolder() {
    setOpenedFolder(null);
  }

  function handleDragStart() {
    setPreviousList(websitesList);
  }

  function handleDragEnd(evt: any) {
    const e = evt.originalEvent as MouseEvent;
    const targetEl = document
      .elementFromPoint(e.clientX, e.clientY)?.closest('#website-container');
    const dragId = evt.item?.getAttribute('data-id');
    const targetId = targetEl?.getAttribute('data-id');

    if (!targetEl || !dragId || !targetId || dragId === targetId) {
      return;
    }

    const rect = targetEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);

    if (distance > Math.min(rect.width, rect.height) * 0.4) {
      return;
    }

    const oldList = [...previousList];
    const dragIndex = oldList.findIndex((w) => w.id === dragId);
    const targetIndex = oldList.findIndex((w) => w.id === targetId);
    if (dragIndex === -1 || targetIndex === -1) return;

    const folder: WebsiteDataType = {
      id: nanoid(),
      title: 'Pasta',
      children: [oldList[targetIndex], oldList[dragIndex]],
    };

    if (dragIndex > targetIndex) {
      oldList.splice(dragIndex, 1);
      oldList.splice(targetIndex, 1, folder);
    } else {
      oldList.splice(targetIndex, 1);
      oldList.splice(dragIndex, 1);
      oldList.splice(targetIndex, 0, folder);
    }

    onWebsitesListChange(oldList);
  }

  useEffect(() => {
    localStorage.setItem('websitesList', JSON.stringify(websitesList));
  }, [websitesList]);

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
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        onSubmit={handleAdd}
      />

      <WebsiteManagementModal
        type="edit"
        isOpen={isEditModalOpen}
        onClose={onCloseEditModal}
        onSubmit={handleEdit}
        websiteData={editWebsiteData}
      />

      <ReactSortable
        tag={WebsitesGrid}
        list={websitesList}
        setList={onWebsitesListChange}
        draggable="#website-container"
        onStart={handleDragStart}
        onEnd={handleDragEnd}
      >
        {websitesList?.map((website, key) => (
          <WebsiteContainer
            id="website-container"
            dataId={website.id}
            key={key}
            onOpenEditModal={() => handleOnOpenEditModal(website, key)}
            onRemove={() => handleRemove(key)}
            websiteData={website}
            onOpenFolder={() => handleOpenFolder(website)}
          />
        ))}

        <Flex
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
          onClick={onOpenAddModal}
        >
          <Icon
            as={IoIosAdd}
            boxSize="40px"
            color="gray.400"
            fontWeight="light"
          />
        </Flex>
      </ReactSortable>
      {openedFolder && (
        <FolderModal
          isOpen={!!openedFolder}
          onClose={handleCloseFolder}
          folder={openedFolder}
        />
      )}
    </Flex>
  );
}
