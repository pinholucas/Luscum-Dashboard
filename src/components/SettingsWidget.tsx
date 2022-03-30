import { Icon, useDisclosure } from '@chakra-ui/react';
import { FiSettings } from 'react-icons/fi';
import SettingsManagementModal from './Modals/SettingsManagement';

export default function SettingsWidget() {
  const {
    isOpen: isSettingsModalOpen,
    onOpen: onOpenSettingsModal,
    onClose: onCloseSettingsModal,
  } = useDisclosure();

  return (
    <>
      <SettingsManagementModal
        isOpen={isSettingsModalOpen}
        onClose={onCloseSettingsModal}
      />

      <Icon
        as={FiSettings}
        position="absolute"
        top={4}
        right={4}
        boxSize={5}
        color="white"
        filter="drop-shadow(0 0 1px rgb(0 0 0 / 1))"
        zIndex="3"
        cursor="pointer"
        transition="all 0.8s ease-in-out"
        _hover={{
          transform: 'rotate(180deg)',
        }}
        onClick={onOpenSettingsModal}
      />
    </>
  );
}
