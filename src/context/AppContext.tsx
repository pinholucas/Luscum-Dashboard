import React, { useState, createContext } from 'react';
import { SettingsType, TopSiteItemType } from 'entities'; // Import TopSiteItemType
import { getSettingsData } from 'utils';

type AppContextType = {
  websitesList: TopSiteItemType[]; // Updated type
  onWebsitesListChange: (items: TopSiteItemType[]) => void; // Updated type and param name
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [websitesList, setWebsitesList] = useState<TopSiteItemType[]>(() => { // Updated type
    if (!localStorage.getItem('websitesList')) {
      // Add some sample websites for testing drag and drop
      const sampleWebsites: TopSiteItemType[] = [
        {
          id: 'website-1',
          title: 'Google',
          url: 'https://google.com',
          type: 'website',
          icon: undefined
        },
        {
          id: 'website-2',
          title: 'GitHub',
          url: 'https://github.com',
          type: 'website',
          icon: undefined
        },
        {
          id: 'website-3',
          title: 'YouTube',
          url: 'https://youtube.com',
          type: 'website',
          icon: undefined
        },
        {
          id: 'website-4',
          title: 'Stack Overflow',
          url: 'https://stackoverflow.com',
          type: 'website',
          icon: undefined
        }
      ];
      localStorage.setItem('websitesList', JSON.stringify(sampleWebsites));
      return sampleWebsites;
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
