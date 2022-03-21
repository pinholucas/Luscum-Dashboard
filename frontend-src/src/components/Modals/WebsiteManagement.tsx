import {
  Image,
  Button,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { WebsiteDataType } from 'entities';
import { getIconURL } from 'utils';

interface WebsiteManagementModalProps {
  type: 'add' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  websiteData?: WebsiteDataType;
}

export default function WebsiteManagementModal({
  type,
  websiteData,
  isOpen,
  onClose,
}: WebsiteManagementModalProps) {
  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {`${type === 'add' ? 'Adicionar' : 'Editar'} site`}
        </ModalHeader>
        <ModalBody pb={6}>
          {(websiteData?.url || websiteData?.icon) && (
            <Image
              width="40px"
              height="40px"
              src={
                type === 'add'
                  ? ''
                  : websiteData!.icon ?? getIconURL(websiteData!.url)
              }
            />
          )}

          <FormControl mt={4}>
            <FormLabel>Título</FormLabel>
            <Input placeholder="Título do ícone" value={websiteData?.title} />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Url</FormLabel>
            <Input placeholder="Url do site" value={websiteData?.url} />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button
            border="2px solid"
            borderColor="alert"
            bg="none"
            color="alert"
            mr={3}
            _hover={{
              bgColor: 'alert',
              color: 'gray.200',
            }}
          >
            {type === 'add' ? 'Adicionar' : 'Alterar'}
          </Button>

          <Button
            border="1px solid"
            borderColor="gray.300"
            bg="none"
            _hover={{
              color: 'gray.800',
              bgColor: 'gray.300',
            }}
            onClick={onClose}
          >
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
