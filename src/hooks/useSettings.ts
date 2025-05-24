import { AppContext } from 'context/AppContext';
import { useContext } from 'react';

export function useSettings() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useSettings must be used within an AppProvider');
  }

  return {
    settings: context.settings,
    onSettingsChange: context.onSettingsChange,
  };
}
