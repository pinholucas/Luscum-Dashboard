import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TopSites from './TopSites';
import { AppContext } from '../../context/AppContext';
import {
  SettingsType,
  TopSiteItemType,
  WebsiteDataType,
  FolderDataType,
} from '../../entities';

// Mock child components to isolate TopSites logic
jest.mock('./WebsiteContainer', () => (props: any) => (
  <div
    data-testid={`website-container-${props.id.replace('website-', '')}`}
    onClick={props.onOpenEditModal}
  >
    {props.websiteData.title}
    <button onClick={props.onRemove}>Remove Website</button>
  </div>
));

jest.mock('./FolderContainer', () => (props: any) => (
  <div
    data-testid={`folder-container-${props.id.replace('folder-', '')}`}
    onClick={() => props.onOpenFolder(props.folderData.id)}
  >
    {props.folderData.title}
    <button onClick={() => props.onRenameFolder(props.folderData.id)}>
      Rename Folder
    </button>
    <button onClick={() => props.onRemoveFolder(props.folderData.id)}>
      Remove Folder
    </button>
  </div>
));

jest.mock('react-sortablejs', () => ({
  ReactSortable: jest.fn(({ list, setList, children, ...props }) => {
    return (
      <div {...props} data-testid="react-sortable">
        {children}
      </div>
    );
  }),
}));

const mockSettings: SettingsType = {
  adaptTopSitesWidth: false,
  columns: 4,
  appID: 'test-app',
  apikey: 'test-key',
};

const initialWebsitesList: TopSiteItemType[] = [
  {
    id: 'site-101',
    title: 'Main Site 1',
    url: 'http://main1.com',
    type: 'website',
  },
  { id: 'folder-102', title: 'Main Folder 1', children: [], type: 'folder' },
];

describe('TopSites Component', () => {
  let mockWebsitesList: TopSiteItemType[];
  let mockOnWebsitesListChange: jest.Mock;

  const renderTopSites = () => {
    return render(
      <AppContext.Provider
        value={{
          websitesList: mockWebsitesList,
          onWebsitesListChange: mockOnWebsitesListChange,
          settings: mockSettings,
          onSettingsChange: jest.fn(),
        }}
      >
        <TopSites />
      </AppContext.Provider>,
    );
  };

  beforeEach(() => {
    mockWebsitesList = JSON.parse(JSON.stringify(initialWebsitesList));
    mockOnWebsitesListChange = jest.fn((newList) => {
      mockWebsitesList = newList;
    });
  });

  it('renders initial websites and folders', () => {
    renderTopSites();
    expect(screen.getByText('Main Site 1')).toBeInTheDocument();
    expect(screen.getByText('Main Folder 1')).toBeInTheDocument();
  });

  it('adds a new folder when "Add Folder" button is clicked', () => {
    renderTopSites();
    const addFolderButton = screen.getByTitle('Add new folder');
    fireEvent.click(addFolderButton);

    expect(mockOnWebsitesListChange).toHaveBeenCalledTimes(1);
    const lastCall = mockOnWebsitesListChange.mock.calls[0][0];
    expect(lastCall.length).toBe(initialWebsitesList.length + 1);
    const newFolder = lastCall.find(
      (item: TopSiteItemType) =>
        item.type === 'folder' && item.title === 'New Folder',
    );
    expect(newFolder).toBeDefined();
  });

  it('removes a folder when onRemoveFolder is triggered from FolderContainer', () => {
    renderTopSites();
    const folderContainer = screen.getByTestId('folder-container-folder-102');
    const removeButton = Array.from(
      folderContainer.querySelectorAll('button'),
    ).find((btn) => btn.textContent === 'Remove Folder');

    expect(removeButton).toBeDefined();
    fireEvent.click(removeButton!);

    expect(mockOnWebsitesListChange).toHaveBeenCalledTimes(1);
    const lastCall = mockOnWebsitesListChange.mock.calls[0][0];
    expect(
      lastCall.find((item: TopSiteItemType) => item.id === 'folder-102'),
    ).toBeUndefined();
  });
});
