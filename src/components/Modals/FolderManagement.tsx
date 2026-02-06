import {
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { nanoid } from 'nanoid';

import { FolderDataType, WebsiteDataType } from 'entities';

interface FolderManagementModalProps {
  type: 'add' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FolderDataType) => void;
  websites: WebsiteDataType[];
  folderData?: FolderDataType;
}

export default function FolderManagementModal({
  type,
  isOpen,
  onClose,
  onSubmit,
  websites,
  folderData,
}: FolderManagementModalProps) {
  const [folderName, setFolderName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const websiteMap = useMemo(
    () => new Map(websites.map((website) => [website.id, website])),
    [websites],
  );

  function handleSubmit() {
    const selectedWebsites = selectedIds
      .map((id) => websiteMap.get(id))
      .filter(Boolean) as WebsiteDataType[];

    onSubmit({
      type: 'folder',
      id: folderData?.id ?? nanoid(),
      title: folderName.trim() || 'Nova pasta',
      websites: selectedWebsites,
    });

    setFolderName('');
    setSelectedIds([]);
  }

  function handleCancel() {
    onClose();
    setFolderName('');
    setSelectedIds([]);
  }

  useEffect(() => {
    if (type === 'edit' && folderData) {
      setFolderName(folderData.title);
      setSelectedIds(folderData.websites.map((website) => website.id));
      return;
    }

    if (type === 'add') {
      setFolderName('');
      setSelectedIds([]);
    }
  }, [folderData, type, isOpen]);

  return (
    <Modal isCentered isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {`${type === 'add' ? 'Adicionar' : 'Editar'} pasta`}
        </ModalHeader>
        <ModalBody pb={6}>
          <FormControl>
            <FormLabel>Nome da pasta</FormLabel>
            <Input
              value={folderName}
              onChange={(event) => setFolderName(event.currentTarget.value)}
              placeholder="Ex: Trabalho"
            />
          </FormControl>

          <FormControl mt={4}>
            <FormLabel>Sites dentro da pasta</FormLabel>
            {websites.length === 0 ? (
              <Text color="gray.400" fontSize="sm">
                Nenhum site disponível para adicionar.
              </Text>
            ) : (
              <CheckboxGroup
                value={selectedIds}
                onChange={(values) => setSelectedIds(values as string[])}
              >
                <Stack spacing={2} maxHeight="220px" overflowY="auto">
                  {websites.map((website) => (
                    <Checkbox key={website.id} value={website.id} colorScheme="orange">
                      {website.title}
                    </Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            )}
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
            isDisabled={!folderName.trim() || selectedIds.length === 0}
          >
            {type === 'add' ? 'Adicionar' : 'Salvar'}
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
