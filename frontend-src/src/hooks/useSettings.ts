import { AppContext } from 'context/AppContext';
import { useContextSelector } from 'use-context-selector';

export function useSettings() {
  const settings = useContextSelector(AppContext, (app) => app.settings);
  const onSettingsChange = useContextSelector(
    AppContext,
    (app) => app.onSettingsChange,
  );

  return {
    settings,
    onSettingsChange,
  };
}
