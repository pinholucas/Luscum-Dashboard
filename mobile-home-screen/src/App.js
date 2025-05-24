import React, { useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import './App.css';
import GridContainer from './components/GridContainer';

const initialItems = [
  { id: 'app1', name: 'Photos', type: 'icon', iconUrl: 'https://via.placeholder.com/40/FFFF00/000000?Text=P' },
  { id: 'app2', name: 'Calculator', type: 'icon', iconUrl: 'https://via.placeholder.com/40/00FFFF/000000?Text=C' },
  { id: 'folder1', name: 'Productivity', type: 'folder', items: [] },
  { id: 'app3', name: 'Maps', type: 'icon', iconUrl: 'https://via.placeholder.com/40/FF00FF/000000?Text=M' },
  { id: 'app4', name: 'Weather', type: 'icon' },
  { id: 'folder2', name: 'Social', type: 'folder', items: [] },
];

function App() {
  const [homeScreenItems, setHomeScreenItems] = useState(initialItems);

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    const sourceIndex = source.index;
    const destinationIndex = destination.index;

    if (destination.droppableId === source.droppableId && destinationIndex === sourceIndex) {
      return;
    }

    const currentItems = Array.from(homeScreenItems);
    const draggedItem = currentItems[sourceIndex];
    const targetItem = currentItems[destinationIndex];

    // Case 1: Icon dropped on Icon (Create Folder)
    if (draggedItem && targetItem && draggedItem.type === 'icon' && targetItem.type === 'icon' && draggedItem.id !== targetItem.id) {
      const newFolderId = `folder-${Date.now()}`;
      const newFolder = {
        id: newFolderId,
        name: 'New Folder',
        type: 'folder',
        items: [draggedItem.id, targetItem.id],
      };

      let updatedItems = currentItems.filter(item => item.id !== draggedItem.id && item.id !== targetItem.id);
      let insertionIndex = destinationIndex;
      if (sourceIndex < destinationIndex) {
        insertionIndex--;
      }
      updatedItems.splice(insertionIndex, 0, newFolder);
      setHomeScreenItems(updatedItems);

    // Case 2: Icon dropped on Folder (Add to Folder)
    } else if (draggedItem && targetItem && draggedItem.type === 'icon' && targetItem.type === 'folder') {
      // Ensure icon is not already in the folder (though current logic should prevent this)
      if (targetItem.items.includes(draggedItem.id)) {
        return; 
      }

      const updatedFolder = {
        ...targetItem,
        items: [...targetItem.items, draggedItem.id],
      };

      let newHomeScreenItems = currentItems.filter(item => item.id !== draggedItem.id);
      newHomeScreenItems = newHomeScreenItems.map(item => 
        item.id === targetItem.id ? updatedFolder : item
      );
      setHomeScreenItems(newHomeScreenItems);
      
    } else {
      // Case 3: Normal Reorder
      const reorderedItems = Array.from(homeScreenItems);
      const [movedItem] = reorderedItems.splice(sourceIndex, 1);
      reorderedItems.splice(destinationIndex, 0, movedItem);
      setHomeScreenItems(reorderedItems);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <GridContainer homeScreenItems={homeScreenItems} />
    </DragDropContext>
  );
}

export default App;
