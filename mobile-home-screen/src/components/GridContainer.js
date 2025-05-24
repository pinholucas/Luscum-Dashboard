import React from 'react';
import styled from 'styled-components';
import { Droppable } from 'react-beautiful-dnd';
import Icon from './Icon';
import Folder from './Folder';

const StyledGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 20px;
  padding: 20px;
  background-color: #f0f0f0;
  min-height: 100vh;
`;

const GridContainer = ({ homeScreenItems }) => {
  return (
    <Droppable droppableId="homeScreen">
      {(provided, snapshot) => (
        <StyledGridContainer
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {homeScreenItems.map((item, index) => {
            if (item.type === 'icon') {
              return <Icon key={item.id} id={item.id} name={item.name} iconUrl={item.iconUrl} index={index} />;
            } else if (item.type === 'folder') {
              return <Folder key={item.id} id={item.id} name={item.name} items={item.items} index={index} />;
            }
            return null;
          })}
          {provided.placeholder}
        </StyledGridContainer>
      )}
    </Droppable>
  );
};

export default GridContainer;
