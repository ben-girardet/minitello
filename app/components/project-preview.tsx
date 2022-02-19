// 

import { Step  as StepModel } from '@prisma/client';
import { Dots, Copy, Trash, Edit } from 'tabler-icons-react';
import { useFetcher } from 'remix';
import styled from 'styled-components';
import ProgressIndicator from "~/components/progress-indicator";
import { useState, MouseEvent, TouchEvent } from 'react';
import ContextualMenu from './contextual-menu';
import ContextualMenuButton from './contextual-menu-button';

interface ProjectPreviewData {
  progress: number;
  id: string;
  name: string;
  description: string | null;
}

interface ProjectPreviewProps {
  project: ProjectPreviewData;
  onDelete?: (event: MouseEvent) => void;
  onEdit?: (event: MouseEvent) => void;
  onDuplicate?: (event: MouseEvent) => void;
}

export function ProjectPreview({project, onDuplicate, onDelete, onEdit}: ProjectPreviewProps) {

  const [isMenuOpened, setIsMenuOpened] = useState<boolean>(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [pointerPosition, setPointerPosition] = useState<{x: number, y: number} | null>(null);

  function openMoreMenu(event: MouseEvent | TouchEvent) {
    stopPropagation(event);
    setMenuAnchor(event.target as HTMLElement | null);
    setIsMenuOpened(true);
    if (event.type === 'click') {
      setPointerPosition({x: (event as MouseEvent).pageX, y: (event as MouseEvent).pageY});
    } else {
      setPointerPosition({x: (event as TouchEvent).touches[0].pageX, y: (event as TouchEvent).touches[0].pageY});
    }
  }

  function hideMoreMenu() {
    setIsMenuOpened(false);
  }

  function _onEdit(event: MouseEvent) {
    if (onEdit) {
      onEdit.call(null, event);
    }
  }

  function _onDuplicate(event: MouseEvent) {
    if (onDuplicate) {
      onDuplicate.call(null, event);
    }
  }
  
  function _onDelete(event: MouseEvent) {
    if (onDelete) {
      onDelete.call(null, event);
    }
  }

  function stopPropagation(event: MouseEvent | TouchEvent) {
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    event.nativeEvent.stopPropagation();
    event.preventDefault();
  }

  return (
    <Wrapper>
      <Indicator progress={project.progress} size={3}></Indicator>
      <Label>
        <Name>{project.name}</Name>
        <Description>{project.description}</Description>
      </Label>
      {onDelete || onDuplicate ? (
        <More onClick={openMoreMenu}>
          <Dots className="icon" />
        </More>
      ) : undefined}
      <ContextualMenu hidden={!isMenuOpened} onHide={hideMoreMenu} anchor={menuAnchor} pointerPosition={pointerPosition}>
        {onEdit ? (
          <ContextualMenuButton onClick={_onEdit}>
            <Edit></Edit>
            Edit
          </ContextualMenuButton>
        ) : undefined}
        {onDuplicate ? (
          <ContextualMenuButton onClick={_onDuplicate}>
            <Copy></Copy>
            Duplicate
          </ContextualMenuButton>
        ) : undefined}
        {onDelete ? (
          <ContextualMenuButton onClick={_onDelete} className="test">
            <Trash></Trash>
            Delete
          </ContextualMenuButton>
        ) : undefined}
      </ContextualMenu>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;

const Indicator = styled(ProgressIndicator)`
  flex: 0 0 3rem;
`;
const Label = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: var(--foreground);
`;
const Name = styled.div`
  font-weight: bold;
`;
const Description = styled.div`
  font-size: 0.8rem;
`; 
const More = styled.button`
  display: flex;
  align-items: center;
  margin-left: auto;
  background: transparent;
  color: var(--foreground);
  border: none;
  cursor: pointer;
`;