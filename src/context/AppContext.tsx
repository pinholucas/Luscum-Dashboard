import { SettingsType, WebsiteDataType } from 'entities';
import { useState } from 'react';
import { createContext } from 'use-context-selector';
import { getSettingsData } from 'utils';

type AppContextType = {
  websitesList: WebsiteDataType[];
  onWebsitesListChange: (websitesList: WebsiteDataType[]) => void;
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
};

export const AppContext = createContext({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [websitesList, setWebsitesList] = useState<WebsiteDataType[]>(() => {
    if (!localStorage.getItem('websitesList')) {
      localStorage.setItem('websitesList', JSON.stringify([]));
    }

    const initialValue = localStorage.getItem('websitesList') ?? '';

    return JSON.parse(initialValue);
  });

  const onWebsiteListChange = (websitesList: WebsiteDataType[]) => {
    setWebsitesList(websitesList);
  };

  const [settings, setSettings] = useState<SettingsType>(() => {
    return getSettingsData();
  });

  const onSettingsChange = (settings: SettingsType) => {
    setSettings(settings);
  };

  return (
    <AppContext.Provider
      value={{
        websitesList,
        onWebsitesListChange: onWebsiteListChange,
        settings,
        onSettingsChange,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
