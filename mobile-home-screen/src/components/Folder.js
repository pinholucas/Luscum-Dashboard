import React from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';

const StyledFolder = styled.div`
  width: 80px;
  height: 80px;
  background-color: #cce5ff; /* Light blue, to distinguish from icons */
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: grab; /* To indicate it's draggable */
  padding: 5px; /* Add some padding for the content */
  position: relative; /* For pseudo-element positioning if used */

  p {
    font-size: 12px;
    text-align: center;
    margin: 0;
    font-weight: bold; /* Make folder name bold */
  }

  /* Optional: Add a simple visual cue for a folder, like a pseudo-element tab */
  /* &::before {
    content: '';
    width: 30px;
    height: 5px;
    background-color: #a0c4e2; /* Darker blue for tab */
    border-radius: 2px 2px 0 0;
    position: absolute;
    top: -5px; /* Position it slightly above the folder */
    left: 10px;
  } */
`;

const Folder = ({ id, name, items, index }) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <StyledFolder
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <p>{name}</p>
        </StyledFolder>
      )}
    </Draggable>
  );
};

export default Folder;
