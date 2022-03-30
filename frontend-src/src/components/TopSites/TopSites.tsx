import { Flex, Grid, Icon, useDisclosure } from '@chakra-ui/react';
import { IoIosAdd } from 'react-icons/io';
import { WebsiteDataType } from 'entities';
import { forwardRef, useEffect, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';

import WebsiteContainer from './WebsiteContainer';
import WebsiteManagementModal from 'components/Modals/WebsiteManagement';
import { useSettings } from 'hooks/useSettings';

const WebsitesGrid = forwardRef<HTMLDivElement, any>((props, ref) => {
  const { settings } = useSettings();

  return (
    <Grid
      padding={4}
      gridTemplateColumns={`repeat(${settings.columns}, minmax(90px, 90px))`}
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

  const [websitesList, setWebsitesList] = useState<WebsiteDataType[]>(() => {
    if (!localStorage.getItem('websitesList')) {
      localStorage.setItem('websitesList', JSON.stringify([]));
    }

    const initialValue = localStorage.getItem('websitesList') ?? '';

    return JSON.parse(initialValue);
  });
  const [editWebsiteData, setEditWebsiteData] = useState<WebsiteDataType>();
  const [editWebsiteDataKey, setEditWebsiteDataKey] = useState<number>();

  function handleOnOpenEditModal(websiteData: WebsiteDataType, key: number) {
    onOpenEditModal();

    setEditWebsiteData(websiteData);
    setEditWebsiteDataKey(key);
  }

  function handleAdd(websiteData: WebsiteDataType) {
    setWebsitesList([...websitesList, websiteData]);

    onCloseAddModal();
  }

  function handleEdit(websiteData: WebsiteDataType) {
    const newWebsitesList = websitesList.map((website, index) =>
      index === editWebsiteDataKey ? websiteData : website,
    );

    setWebsitesList(newWebsitesList);

    onCloseEditModal();
  }

  function handleRemove(key: number) {
    const newWebsitesList = websitesList.filter(
      (website, index) => index !== key,
    );

    setWebsitesList(newWebsitesList);
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
        setList={setWebsitesList}
        draggable="#website-container"
      >
        {websitesList?.map((website, key) => (
          <WebsiteContainer
            id="website-container"
            key={key}
            onOpenEditModal={() => handleOnOpenEditModal(website, key)}
            onRemove={() => handleRemove(key)}
            websiteData={website}
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
    </Flex>
  );
}
