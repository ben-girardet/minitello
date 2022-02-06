import { Step  as StepModel } from '@prisma/client';
import { Circle, CircleCheck, Dots, Copy, Trash, DragDrop2 } from 'tabler-icons-react';
import { useFetcher } from 'remix';
import styled from 'styled-components';
import React, { useState, MouseEvent, TouchEvent } from 'react';
import ContextualMenu from './contextual-menu';
import ContextualMenuButton from './contextual-menu-button';
import StepCreator from './step-creator';

export interface StepWithChildren extends StepModel {
  children?: StepWithChildren[];
}

export function Step({step}: {step: StepWithChildren}) {

  const fetcher = useFetcher();
  const [opened, setOpened] = useState<boolean>(false);

  function toggleProgress(event: MouseEvent) {
    event.stopPropagation();
    const _action = 'toggle-progress';
    const projectId = step.projectId as string;
    const stepId = step.id;
    fetcher.submit({_action, projectId, stepId}, {method: 'put', action: `/projects/${projectId}`});
  }

  function toggleStepDetails() {
    console.log('toggleStepDetails');
    setOpened(!opened);
  }

  const [isMenuOpened, setIsMenuOpened] = useState<boolean>(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [pointerPosition, setPointerPosition] = useState<{x: number, y: number} | null>(null);
  
  function openMoreMenu(event: MouseEvent | TouchEvent) {
    setMenuAnchor(event.target as HTMLElement | null);
    setIsMenuOpened(true);
    if (event.type === 'click') {
      setPointerPosition({x: (event as MouseEvent).pageX, y: (event as MouseEvent).pageY});
    } else {
      setPointerPosition({x: (event as TouchEvent).touches[0].pageX, y: (event as TouchEvent).touches[0].pageY});
    }
    event.stopPropagation();
  }

  function hideMoreMenu() {
    setIsMenuOpened(false);
  }

  return (
    <Wrapper>
      <Main tabIndex={0} onClick={toggleStepDetails}>
        <Indicator onClick={toggleProgress}>
         {step.progress === 1 ?
          <CircleCheck className="icon" />
          :
          <Circle></Circle>
         }
        </Indicator>
        <Name>{step.name}</Name>
        <More onClick={openMoreMenu}>
          <Dots className="icon" />
        </More>
      </Main>
      {opened ? (
        <WhenOpenedWrapper>
          <Children>
            {step.children ? step.children.map((child) => (
              <Step step={child}></Step>
              )) : undefined}
          </Children>
          <StepCreator projectId={step.projectId!} parentStepId={step.id}></StepCreator>
        </WhenOpenedWrapper>
      ) : undefined}
      <ContextualMenu hidden={!isMenuOpened} onHide={hideMoreMenu} anchor={menuAnchor} pointerPosition={pointerPosition}>
        <ContextualMenuButton>
          <Copy></Copy>
          Duplicate
          </ContextualMenuButton>
        <ContextualMenuButton>
          <DragDrop2></DragDrop2>
          Move
          </ContextualMenuButton>
        <ContextualMenuButton>
          <Trash></Trash>
          Delete
          </ContextualMenuButton>
      </ContextualMenu>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  padding: 8px;
  gap: 8px;
  background: hsl(0, 0%, 100%);
  margin: 1px 0;
  display: flex;
  flex-direction: column;
  color: var(--color-foreground);
  cursor: pointer;
`;
const Main = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  outline-offset: 4px;
`;
const Indicator = styled.button`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  text-align: center;
  color: var(--primary);
  background: var(--primary-contrast);
  border: none;
  cursor: pointer;
`;
const Name = styled.div`
  width: 100%;
`;
const More = styled.button`
  display: flex;
  align-items: center;
  margin-left: auto;
  background: transparent;
  border: none;
  cursor: pointer;
`;
const WhenOpenedWrapper = styled.div`
  padding-left: 32px;
  margin-right: -8px;

  & > form {
    opacity: 0.4;
  }
  & > form:hover {
    opacity: 1;
  }
`;
const Children = styled.div``;