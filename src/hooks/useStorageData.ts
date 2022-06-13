import { AppContext } from 'context/AppContext';
import { useContextSelector } from 'use-context-selector';

export function useStorageData() {
  const websitesList = useContextSelector(
    AppContext,
    (app) => app.websitesList,
  );
  const onWebsitesListChange = useContextSelector(
    AppContext,
    (app) => app.onWebsitesListChange,
  );

  return {
    websitesList,
    onWebsitesListChange,
  };
}
