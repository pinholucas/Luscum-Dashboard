import { SettingsType, WebsiteDataType, TopSiteItemType } from 'entities'; // Import TopSiteItemType
import { useState } from 'react';
import { createContext } from 'use-context-selector';
import { getSettingsData } from 'utils';

type AppContextType = {
  websitesList: TopSiteItemType[]; // Updated type
  onWebsitesListChange: (items: TopSiteItemType[]) => void; // Updated type and param name
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
};

export const AppContext = createContext({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [websitesList, setWebsitesList] = useState<TopSiteItemType[]>(() => { // Updated type
    if (!localStorage.getItem('websitesList')) {
      localStorage.setItem('websitesList', JSON.stringify([]));
    }

    const initialValue = localStorage.getItem('websitesList') ?? '';
    try {
      const parsedValue = JSON.parse(initialValue);
      // Basic validation to ensure it's an array; could be more robust
      return Array.isArray(parsedValue) ? parsedValue : [];
    } catch (error) {
      console.error("Error parsing websitesList from localStorage", error);
      return []; // Fallback to empty array on error
    }
  });

  // Renamed and updated function
  const onTopSiteItemsChange = (items: TopSiteItemType[]) => {
    setWebsitesList(items);
    localStorage.setItem('websitesList', JSON.stringify(items)); // Added persistence
  };

  const [settings, setSettings] = useState<SettingsType>(() => {
    return getSettingsData();
  });

  const onSettingsChange = (settings: SettingsType) => {
    setSettings(settings);
    localStorage.setItem('settings', JSON.stringify(settings)); // Assuming settings should also persist
  };

  return (
    <AppContext.Provider
      value={{
        websitesList,
        onWebsitesListChange: onTopSiteItemsChange, // Updated name
        settings,
        onSettingsChange,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
