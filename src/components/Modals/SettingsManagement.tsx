import {
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
  ModalCloseButton,
  useToast,
  Switch,
} from '@chakra-ui/react';
import { SettingsType } from 'entities';
import { useSettings } from 'hooks/useSettings';
import { useRef, useState } from 'react';

interface SettingsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsManagementModal({
  isOpen,
  onClose,
}: SettingsManagementModalProps) {
  const { settings, onSettingsChange } = useSettings();

  const [newSettings, setNewSettings] = useState<SettingsType>(settings);

  const toast = useToast();
  const initialRef = useRef<HTMLDivElement>(null);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value, checked, name } = event.currentTarget;

    setNewSettings({ ...newSettings, [name]: checked ?? value });
  }

  function handleSave() {
    localStorage.setItem('settings', JSON.stringify(newSettings));

    onSettingsChange(newSettings);

    onClose();

    toast({
      title: 'Configurações alteradas!',
      description: 'As configurações foram alteradas com sucesso.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }

  return (
    <Modal
      isCentered
      isOpen={isOpen}
      onClose={onClose}
      initialFocusRef={initialRef}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader>Configurações</ModalHeader>
        <ModalBody
          tabIndex={-1}
          ref={initialRef}
          display="flex"
          flexDirection="column"
          pb={6}
          gap={4}
          _focusVisible={{
            outline: 'none',
          }}
        >
          <FormControl
            display="flex"
            width="full"
            justifyContent="space-between"
          >
            <FormLabel fontSize="lg">
              Ajustar tamanho a quantidade de sites
            </FormLabel>
            <Switch
              size="lg"
              colorScheme="orange"
              name="adaptTopSitesWidth"
              isChecked={newSettings.adaptTopSitesWidth}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Número de colunas</FormLabel>
            <Input
              name="columns"
              placeholder="ex: 3"
              value={newSettings.columns}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>AppID (AutoSugest)</FormLabel>
            <Input
              name="appID"
              placeholder="ex: EF564EGE1616E5BE4B5E4654E46G5E6F4E64F6E4"
              value={newSettings.appID}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>APIKey (Weather)</FormLabel>
            <Input
              name="apikey"
              placeholder="ex: UH92h982Hj20920Hh930H3h030Voo939j3HJ383hKD"
              value={newSettings.apikey}
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
            _hover={{
              bgColor: 'alert',
              color: 'gray.200',
            }}
            onClick={handleSave}
          >
            Salvar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
