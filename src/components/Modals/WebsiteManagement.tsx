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
import { nanoid } from 'nanoid';

import { getIconURL } from 'utils';
import { WebsiteDataType } from 'entities';

interface WebsiteManagementModalProps {
  type: 'add' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WebsiteDataType) => void;
  websiteData?: WebsiteDataType;
}

export default function WebsiteManagementModal({
  type,
  isOpen,
  onClose,
  onSubmit,
  websiteData,
}: WebsiteManagementModalProps) {
  const [website, setWebsite] = useState<WebsiteDataType | null>();

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value, name } = event.currentTarget;
    const id = website?.id ?? nanoid();

    setWebsite({
      ...website,
      type: 'website',
      id: id,
      [name]: value === '' ? null : value,
    });
  }

  function handleSubmit() {
    onSubmit(website!);

    setWebsite(null);
  }

  function handleCancel() {
    onClose();

    setWebsite(null);
  }

  useEffect(() => {
    if (type === 'add') {
      setWebsite({
        type: 'website',
        id: nanoid(),
      });

      return;
    }

    setWebsite(websiteData);
  }, [type, websiteData]);

  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {`${type === 'add' ? 'Adicionar' : 'Editar'} site`}
        </ModalHeader>
        <ModalBody pb={6}>
          {(website?.url || website?.icon) && (
            <Image
              width="40px"
              height="40px"
              src={website?.icon ?? getIconURL(website?.url!)}
            />
          )}

          <FormControl mt={4}>
            <FormLabel>Ícone Personalizado (opcional)</FormLabel>
            <Input
              name="icon"
              placeholder="ex: https://example.com"
              value={website?.icon}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Título</FormLabel>
            <Input
              name="title"
              placeholder="Título do ícone"
              value={website?.title}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Url</FormLabel>
            <Input
              name="url"
              placeholder="ex: https://example.com"
              value={website?.url}
              onChange={handleInputChange}
            />
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
            onClick={handleSubmit}
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
            onClick={handleCancel}
          >
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
