import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Grid,
} from '@chakra-ui/react';
import WebsiteContainer from './WebsiteContainer';
import { WebsiteDataType } from 'entities';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: WebsiteDataType;
}

export default function FolderModal({ isOpen, onClose, folder }: FolderModalProps) {
  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{folder.title ?? 'Pasta'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Grid templateColumns="repeat(4, 90px)" justifyContent="center" gap={4}>
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
          </Grid>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
