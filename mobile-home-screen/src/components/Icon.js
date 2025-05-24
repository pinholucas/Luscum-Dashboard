import React from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';

const StyledIcon = styled.div`
  width: 80px;
  height: 80px;
  background-color: #ffffff;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: grab; /* To indicate it's draggable */

  img {
    width: 40px; /* Adjust size as needed */
    height: 40px;
    margin-bottom: 5px;
  }

  p {
    font-size: 12px;
    text-align: center;
    margin: 0;
  }
`;

const Icon = ({ id, name, iconUrl, index }) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <StyledIcon
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {iconUrl ? <img src={iconUrl} alt={name} /> : <p>{name}</p>}
          {!iconUrl && <p style={{ marginTop: '5px' }}> (No Icon)</p>}
          {iconUrl && <p>{name}</p>}
        </StyledIcon>
      )}
    </Draggable>
  );
};

export default Icon;
