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
import { forwardRef } from 'react';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: WebsiteDataType;
  onChange: (list: WebsiteDataType[]) => void;
}

export default function FolderModal({
  isOpen,
  onClose,
  folder,
  onChange,
}: FolderModalProps) {
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
      <ModalContent>
        <ModalHeader>{folder.title ?? 'Pasta'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <ReactSortable
            group="websites"
            list={folder.children || []}
            setList={onChange}
            tag={FolderGrid}
          >
            {folder.children?.map((site, idx) => (
              <WebsiteContainer
                key={idx}
                id="website-container"
                dataId={site.id}
                onOpenEditModal={() => {}}
                onRemove={() => {}}
                websiteData={site}
              />
            ))}
          </ReactSortable>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
