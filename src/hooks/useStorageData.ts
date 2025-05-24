import { AppContext } from 'context/AppContext';
import { useContext } from 'react';

export function useStorageData() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useStorageData must be used within an AppProvider');
  }

  return {
    websitesList: context.websitesList,
    onWebsitesListChange: context.onWebsitesListChange,
  };
}
