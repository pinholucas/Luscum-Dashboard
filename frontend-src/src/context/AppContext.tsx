import { SettingsType } from 'entities';
import { useState } from 'react';
import { createContext } from 'use-context-selector';
import { getSettingsData } from 'utils';

type AppContextType = {
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
};

export const AppContext = createContext({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsType>(() => {
    return getSettingsData();
  });

  const onSettingsChange = (settings: SettingsType) => {
    setSettings(settings);
  };

  return (
    <AppContext.Provider value={{ settings, onSettingsChange }}>
      {children}
    </AppContext.Provider>
  );
}
