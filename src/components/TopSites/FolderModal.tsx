import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Grid,
} from '@chakra-ui/react';
import { ReactSortable } from 'react-sortablejs';
import WebsiteContainer from './WebsiteContainer';
import { WebsiteDataType } from 'entities';
import { forwardRef, useRef } from 'react';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: WebsiteDataType;
  onChange: (list: WebsiteDataType[]) => void;
  onMoveOut: (item: WebsiteDataType) => void;
  onEdit: (data: WebsiteDataType, index: number) => void;
  onRemove: (index: number) => void;
}

export default function FolderModal({
  isOpen,
  onClose,
  folder,
  onChange,
  onMoveOut,
  onEdit,
  onRemove,
}: FolderModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const FolderGrid = forwardRef<HTMLDivElement, any>((props, ref) => (
    <Grid
      templateColumns="repeat(4, 90px)"
      justifyContent="center"
      gap={4}
      ref={ref}
    >
      {props.children}
    </Grid>
  ));


  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent ref={modalRef}>
        <ModalHeader>{folder.title ?? 'Pasta'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <ReactSortable
            group="websites"
            list={folder.children || []}
            setList={onChange}
            tag={FolderGrid}
            draggable="#website-container"
            onEnd={(evt: any) => {
              const rect = modalRef.current?.getBoundingClientRect();
              const e = evt.originalEvent as MouseEvent;
              if (
                rect &&
                (e.clientX < rect.left ||
                  e.clientX > rect.right ||
                  e.clientY < rect.top ||
                  e.clientY > rect.bottom)
              ) {
                const index = evt.oldIndex;
                const item = folder.children?.[index];
                if (item) {
                  onMoveOut(item);
                }
                return;
              }

              if (
                typeof evt.oldIndex === 'number' &&
                typeof evt.newIndex === 'number' &&
                evt.oldIndex !== evt.newIndex
              ) {
                const children = [...(folder.children || [])];
                const [moved] = children.splice(evt.oldIndex, 1);
                children.splice(evt.newIndex, 0, moved);
                onChange(children);
              }
            }}
          >
            {folder.children?.map((site, idx) => (
              <WebsiteContainer
                key={idx}
                id="website-container"
                dataId={site.id}
                onOpenEditModal={() => onEdit(site, idx)}
                onRemove={() => onRemove(idx)}
                websiteData={site}
              />
            ))}
          </ReactSortable>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
