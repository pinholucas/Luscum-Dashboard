import { Button, Flex, Grid, Icon, useDisclosure } from '@chakra-ui/react';
import { IoIosAdd } from 'react-icons/io';
import { TopSiteDataType, FolderDataType, WebsiteDataType } from 'entities';
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ReactSortable } from 'react-sortablejs';
import Sortable from 'sortablejs';
import { nanoid } from 'nanoid';

import WebsiteContainer from './WebsiteContainer';
import FolderContainer from './FolderContainer';
import WebsiteManagementModal from 'components/Modals/WebsiteManagement';
import { useSettings } from 'hooks/useSettings';
import { useStorageData } from 'hooks/useStorageData';
import { useFolderDropZone } from 'hooks/useFolderDropZone';
import { DragIntent } from './dragIntent';

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

  const { websitesList, onWebsitesListChange } = useStorageData();

  const [editWebsiteData, setEditWebsiteData] = useState<WebsiteDataType>();
  const [editItemKey, setEditItemKey] = useState<number>();
  const [editFolderId, setEditFolderId] = useState<string>();

  const {
    handlePointerMove,
    handleDragStart,
    handleDragEnd,
    isFolderArmed,
    isWebsiteArmed,
  } = useFolderDropZone();

  // Ref to store snapshot of data before drag for cancel restoration
  const preDragDataRef = useRef<TopSiteDataType[]>([]);
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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

  // ─── Pointer tracking during drag ────────────────────────────────────────
  const onPointerMoveDuringDrag = useCallback(
    (e: MouseEvent | PointerEvent | DragEvent) => {
      // During HTML5 DnD, 'drag' events sometimes report (0,0) — skip those
      if (e.clientX === 0 && e.clientY === 0) return;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      handlePointerMove({ x: e.clientX, y: e.clientY });
    },
    [handlePointerMove],
  );

  // ─── SortableJS event handlers ───────────────────────────────────────────

  /**
   * onMove fires every time SortableJS is about to swap the dragged item
   * with another element. Returning false blocks the swap.
   *
   * - If the target is a folder → ALWAYS block (folder drop mode)
   * - If the target is a website → only allow reorder when the pointer
   *   has crossed the horizontal midpoint of the target element
   */
  function onSortMove(
    evt: Sortable.MoveEvent,
    _originalEvent: Event,
  ): boolean | -1 | 1 {
    const related = evt.related as HTMLElement;
    const folderId = related?.dataset?.folderId;

    // Target is a folder → block only when armed (drop-into-folder mode)
    if (folderId) {
      if (isFolderArmed(folderId)) {
        return false;
      }
      // Not armed → allow reorder past the folder
      const { x } = lastPointerRef.current;
      if (x !== 0) {
        const rect = related.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        return x > midX ? 1 : -1;
      }
      return evt.willInsertAfter ? 1 : -1;
    }

    // Target is a website → check if pointer is in inner zone (merge mode)
    const websiteId = related?.dataset?.websiteId;
    if (websiteId) {
      const { x } = lastPointerRef.current;
      if (x !== 0) {
        const rect = related.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        // Only allow reorder when pointer passes horizontal midpoint
        // Otherwise block to let website merge (create folder) handle it
        return x > midX ? 1 : -1;
      }
    }

    return evt.willInsertAfter ? 1 : -1;
  }

  function onSortStart(evt: Sortable.SortableEvent) {
    preDragDataRef.current = [...topSitesData];
    isDraggingRef.current = true;

    const draggedId = topSitesData[evt.oldIndex ?? 0]?.id;
    if (draggedId) {
      handleDragStart(draggedId);
    }

    // 'drag' event fires continuously during native HTML5 DnD
    // (pointermove/mousemove do NOT fire during HTML5 DnD)
    document.addEventListener('drag', onPointerMoveDuringDrag);
  }

  function onSortEnd(evt: Sortable.SortableEvent) {
    isDraggingRef.current = false;
    document.removeEventListener('drag', onPointerMoveDuringDrag);

    const finalState = handleDragEnd();

    if (
      finalState.intent === DragIntent.DROP_IN_FOLDER &&
      finalState.targetFolderId
    ) {
      // Restore pre-drag order (SortableJS may have already reordered)
      const originalData = preDragDataRef.current;
      const draggedIndex = evt.oldIndex ?? -1;
      const draggedItem = originalData[draggedIndex];

      if (
        draggedItem &&
        draggedItem.type === 'website' &&
        draggedItem.id !== finalState.targetFolderId
      ) {
        // Build new list: remove dragged item from root, add to folder
        const newList = originalData
          .filter((_, idx) => idx !== draggedIndex)
          .map((item) => {
            if (
              item.type === 'folder' &&
              item.id === finalState.targetFolderId
            ) {
              return {
                ...item,
                websites: [...item.websites, draggedItem],
              };
            }
            return item;
          });

        onWebsitesListChange(newList);
        return;
      }
    }

    // ─── CREATE_FOLDER: website dropped on another website ───────────────
    if (
      finalState.intent === DragIntent.CREATE_FOLDER &&
      finalState.targetWebsiteId
    ) {
      const originalData = preDragDataRef.current;
      const draggedIndex = evt.oldIndex ?? -1;
      const draggedItem = originalData[draggedIndex];

      if (
        draggedItem &&
        draggedItem.type === 'website' &&
        draggedItem.id !== finalState.targetWebsiteId
      ) {
        const targetItem = originalData.find(
          (item): item is WebsiteDataType =>
            item.type === 'website' && item.id === finalState.targetWebsiteId,
        );

        if (targetItem) {
          const newFolder: FolderDataType = {
            type: 'folder',
            id: nanoid(),
            title: 'Nova pasta',
            websites: [targetItem, draggedItem],
          };

          // Remove both websites and insert folder at target's position
          const removeIds = new Set([draggedItem.id, targetItem.id]);
          const newList: TopSiteDataType[] = [];
          for (let i = 0; i < originalData.length; i++) {
            const item = originalData[i];
            if (item.type === 'website' && removeIds.has(item.id)) {
              // Insert folder where the target was
              if (item.id === targetItem.id) {
                newList.push(newFolder);
              }
              continue;
            }
            newList.push(item);
          }

          onWebsitesListChange(newList);
          return;
        }
      }
    }

    // Normal reorder — SortableJS already updated via setList
  }

  function handleOnOpenEditWebsiteModal(
    websiteData: WebsiteDataType,
    key: number,
  ) {
    setEditWebsiteData(websiteData);
    setEditItemKey(key);
    setEditFolderId(undefined);

    onOpenEditWebsiteModal();
  }

  function handleOnOpenEditWebsiteInFolder(
    websiteData: WebsiteDataType,
    folderId: string,
  ) {
    setEditWebsiteData(websiteData);
    setEditFolderId(folderId);
    setEditItemKey(undefined);

    onOpenEditWebsiteModal();
  }

  function handleAddWebsite(websiteData: WebsiteDataType) {
    onWebsitesListChange([...topSitesData, websiteData]);

    onCloseAddWebsiteModal();
  }

  function handleEditWebsite(websiteData: WebsiteDataType) {
    if (editFolderId !== undefined) {
      const newList = topSitesData.map((item) => {
        if (item.type === 'folder' && item.id === editFolderId) {
          return {
            ...item,
            websites: item.websites.map((w) =>
              w.id === websiteData.id ? websiteData : w,
            ),
          };
        }
        return item;
      });
      onWebsitesListChange(newList);
      setEditFolderId(undefined);
    } else {
      const newWebsitesList = topSitesData.map((site, index) =>
        index === editItemKey ? websiteData : site,
      );
      onWebsitesListChange(newWebsitesList);
    }

    onCloseEditWebsiteModal();
  }

  function handleRenameFolder(folderId: string, newTitle: string) {
    const newList = topSitesData.map((item) => {
      if (item.type === 'folder' && item.id === folderId) {
        return { ...item, title: newTitle };
      }
      return item;
    });
    onWebsitesListChange(newList);
  }

  function handleRemove(key: number) {
    const newWebsitesList = topSitesData.filter((site, index) => index !== key);

    onWebsitesListChange(newWebsitesList);
  }

  function handleRemoveWebsiteFromFolder(folderId: string, websiteId: string) {
    const newList = topSitesData.map((item) => {
      if (item.type === 'folder' && item.id === folderId) {
        return {
          ...item,
          websites: item.websites.filter((w) => w.id !== websiteId),
        };
      }
      return item;
    });
    onWebsitesListChange(newList);
  }

  function handleReorderWebsitesInFolder(
    folderId: string,
    websites: WebsiteDataType[],
  ) {
    const newList = topSitesData.map((item) => {
      if (item.type === 'folder' && item.id === folderId) {
        return { ...item, websites };
      }
      return item;
    });
    onWebsitesListChange(newList);
  }

  function handleMoveWebsiteToRoot(folderId: string, websiteId: string) {
    let movedWebsite: WebsiteDataType | undefined;
    const newList: TopSiteDataType[] = [];

    for (const item of topSitesData) {
      if (item.type === 'folder' && item.id === folderId) {
        movedWebsite = item.websites.find((w) => w.id === websiteId);
        const remainingWebsites = item.websites.filter(
          (w) => w.id !== websiteId,
        );

        // If folder has remaining websites, keep it; otherwise remove it
        if (remainingWebsites.length > 0) {
          newList.push({ ...item, websites: remainingWebsites });
        }
      } else {
        newList.push(item);
      }
    }

    if (movedWebsite) {
      newList.push(movedWebsite);
    }

    onWebsitesListChange(newList);
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

      <ReactSortable
        tag={WebsitesGrid}
        list={topSitesData}
        setList={onWebsitesListChange}
        draggable="#website-container"
        onStart={onSortStart}
        onEnd={onSortEnd}
        onMove={onSortMove}
        animation={150}
      >
        {topSitesData.map((item, key) =>
          item.type === 'folder' ? (
            <FolderContainer
              id="website-container"
              key={item.id}
              folderData={item}
              onRemove={() => handleRemove(key)}
              onEditWebsite={(website) =>
                handleOnOpenEditWebsiteInFolder(website, item.id)
              }
              onRemoveWebsite={(websiteId) =>
                handleRemoveWebsiteFromFolder(item.id, websiteId)
              }
              onMoveWebsiteToRoot={handleMoveWebsiteToRoot}
              onReorderWebsites={handleReorderWebsitesInFolder}
              onRenameFolder={handleRenameFolder}
              isDropTarget={isFolderArmed(item.id)}
            />
          ) : (
            <WebsiteContainer
              id="website-container"
              key={item.id}
              onOpenEditModal={() => handleOnOpenEditWebsiteModal(item, key)}
              onRemove={() => handleRemove(key)}
              websiteData={item}
              isMergeTarget={isWebsiteArmed(item.id)}
            />
          ),
        )}

        <Button
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
          backgroundColor="transparent"
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
          onClick={onOpenAddWebsiteModal}
        >
          <Icon
            as={IoIosAdd}
            boxSize="40px"
            color="gray.400"
            fontWeight="light"
          />
        </Button>
      </ReactSortable>
    </Flex>
  );
}
