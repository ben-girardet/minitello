import { Step  as StepModel } from '@prisma/client';
import { Circle, CircleCheck, CircleMinus, Dots, Copy, Trash, DragDrop2, Edit } from 'tabler-icons-react';
import { useFetcher } from 'remix';
import styled from 'styled-components';
import React, { useState, MouseEvent, TouchEvent, useEffect, useRef } from 'react';
import ContextualMenu from './contextual-menu';
import ContextualMenuButton from './contextual-menu-button';
import StepCreator from './step-creator';
import { DropTargetMonitor, useDrag, useDrop } from 'react-dnd';
import PubSub from 'pubsub-js';

export interface StepWithChildren extends StepModel {
  children?: StepWithChildren[];
}

export function Step({step}: {step: StepWithChildren}) {

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isDraggingRight, setIsDraggingRight] = useState<boolean>(false);

  // drag-and-drop (DND) implementation
  const [{ opacity }, dragRef] = useDrag(
    () => ({
      type: 'STEP',
      item: { step },
      collect: (monitor) => {
        setIsDragging(monitor.isDragging());
        return {opacity: monitor.isDragging() ? 0.5 : 1};
      },
    }),
    [step, step.order]
  );

  useEffect(() => {
    document.body.classList.toggle('step-dragging', isDragging);
  }, [isDragging]);

  const dragHover = (position: 'above' | 'below') => {
    return (item: unknown, monitor: DropTargetMonitor<unknown, void>) => {
      const i: any = item;
      const hasChildren = !!step.children?.length;
      setIsDraggingRight((monitor.getDifferenceFromInitialOffset()?.x || 0) > 40 && !hasChildren && position === 'below');
      const clientX = monitor.getClientOffset()?.x;
      const clientY = monitor.getClientOffset()?.y;
      const hasMoved = (
        i._dragHoverClientX !== undefined
        && i._dragHoverClientY !== undefined
        && i._dragHoverClientX !== clientX
        && i._dragHoverClientY !== clientY
      );
      if (i._dragHoverTimeout !== undefined && hasMoved) {
        clearTimeout(i._dragHoverTimeout);
        i._dragHoverTimeout = undefined;
      }
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect || clientY === undefined) {
        return;
      }
      const isNotCloseToTheEdge = clientY > rect.y + 5 && clientY < rect.y + rect.height - 5;
      if (!opened && rect && isNotCloseToTheEdge && !i._dragHoverTimeout) {
        const t = setTimeout(() => {
          // checking isOver here ensure that the timeout happens when the drag is still active
          if (monitor.isOver()) {
            setOpened(true);
          }
        }, 2000);
        i._dragHoverTimeout = t;
        i._dragHoverClientX = clientX;
        i._dragHoverClientY = clientY;
      } else if (!isNotCloseToTheEdge) {
        clearTimeout(i._dragHoverTimeout);
        i._dragHoverTimeout = undefined;
        i._dragHoverClientX = undefined;
        i._dragHoverClientY = undefined;
      }
    };
  }

  const drop = (position: 'above' | 'below') => {
    return (item: unknown, monitor: DropTargetMonitor<unknown, void>) => {
      const i: any = item;
      clearTimeout(i._dragHoverTimeout);
      i._dragHoverTimeout = undefined;
      i._dragHoverClientX = undefined;
      i._dragHoverClientY = undefined;

      const hasChildren = !!step.children?.length;
      const localIsDraggingRight = (monitor.getDifferenceFromInitialOffset()?.x || 0) > 40 && !hasChildren && position === 'below';

      if (localIsDraggingRight) {
        move(i.step.id, step.id, 0);
      } else {
        let newOrder = -1;
        const isSameParent = step.parentStepId === i.step.parentStepId;
        if (position === 'above') {
          newOrder = !isSameParent || i.step.order >= step.order ? step.order : step.order - 1;
        } else {
          newOrder = !isSameParent || i.step.order > step.order ? step.order + 1 : step.order;
        }

        if (!step.parentStepId) {
          throw new Error('Missing parentStepId');
        }
        if (step.parentStepId === i.step.parentStepId && i.step.order === newOrder) {
          // if the drop happens in a place where it does not
          // implies a move, return silently
          return;
        }

        move(i.step.id, step.parentStepId, newOrder);
      }
    };
  };

  const [{ opacityAbove }, dropAboveRef] = useDrop(
    () => ({
      accept: 'STEP',
      drop: drop('above'),
      hover: dragHover('above'),
      // canDrop: () => {},
      collect: (monitor) => {
        return {
          opacityAbove: monitor.isOver({shallow: true}) ? 1 : 0
        }
      },
    }),
    [step.order]
  );

  const [{ opacityBelow }, dropBelowRef] = useDrop(
    () => ({
      accept: 'STEP',
      drop: drop('below'),
      hover: dragHover('below'),
      // canDrop: () => {},
      collect: (monitor) => ({
        opacityBelow: monitor.isOver({shallow: true}) ? 1 : 0
      }),
    }),
    [step.order]
  );

  const fetcher = useFetcher();
  const [opened, setOpened] = useState<boolean>(false);

  function toggleProgress(event: MouseEvent) {
    event.stopPropagation();
    const _action = 'toggle-progress';
    const projectId = step.projectId as string;
    const stepId = step.id;
    fetcher.submit({_action, projectId, stepId}, {method: 'put', action: `/projects/${projectId}`});
  }

  function move(stepId: string, newParentStepId: string, newOrder: number) {
    const _action = 'move-step';
    const projectId = step.projectId as string;

    fetcher.submit({
      _action,
      projectId,
      stepId,
      newParentStepId,
      newOrder: `${newOrder}`
    }, {
      method: 'put', 
      action: `/projects/${projectId}`
    });
  }

  function toggleStepDetails() {
    setOpened(!opened);
  }

  function deleteStep() {
    const _action = 'delete-step';
    const projectId = step.projectId as string;
    const stepId = step.id;

    fetcher.submit({
      _action,
      projectId,
      stepId,
    }, {
      method: 'put', 
      action: `/projects/${projectId}`
    });
  }

  function duplicateStep() {
    const _action = 'duplicate-step';
    const projectId = step.projectId as string;
    const stepId = step.id;

    fetcher.submit({
      _action,
      projectId,
      stepId,
    }, {
      method: 'put', 
      action: `/projects/${projectId}`
    });
  }

  function editStep() {
    PubSub.publish('edit-step', step);
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
    <Wrapper ref={dragRef} style={{ opacity }}>
      <BoxRef ref={containerRef}></BoxRef>
      <Main onClick={toggleStepDetails}>
        <Indicator onClick={toggleProgress}>
         {step.progress === 1 ?
          <CircleCheck />
          :
          undefined
         }
         {step.progress === 0 ?
          <Circle />
          :
          undefined
         }
         {step.progress !== 0 && step.progress !== 1 ?
          <CircleMinus />
          :
          undefined
         }
        </Indicator>
        <Name>
          {step.name}
          {step.children?.length ? (
            <NbChildren>{step.children?.length}</NbChildren>
          ) : undefined}
        </Name>
        <More onClick={openMoreMenu}>
          <Dots className="icon" />
        </More>
      </Main>
      {opened ? (
        <WhenOpenedWrapper>
          <Children>
            {step.children ? step.children.map((child) => (
              <Step step={child} key={child.id}></Step>
              )) : undefined}
          </Children>
          <StepCreator projectId={step.projectId!} parentStepId={step.id}></StepCreator>
        </WhenOpenedWrapper>
      ) : undefined}
      <ContextualMenu hidden={!isMenuOpened} onHide={hideMoreMenu} anchor={menuAnchor} pointerPosition={pointerPosition}>
        <ContextualMenuButton onClick={editStep}>
          <Edit></Edit>
          Edit
        </ContextualMenuButton>
        <ContextualMenuButton onClick={duplicateStep}>
          <Copy></Copy>
          Duplicate
        </ContextualMenuButton>
        <ContextualMenuButton onClick={deleteStep}>
          <Trash></Trash>
          Delete
        </ContextualMenuButton>
      </ContextualMenu>
      <DropAbove ref={dropAboveRef} style={{opacity: opacityAbove, marginLeft: isDraggingRight ? '40px' : '0px'}}></DropAbove>
      <DropBelow ref={dropBelowRef} style={{opacity: opacityBelow, marginLeft: isDraggingRight ? '40px' : '0px'}}></DropBelow>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: relative;
  padding: 0 8px;
  gap: 8px;
  background: hsl(0, 0%, 100%);
  margin: 1px 0;
  display: flex;
  flex-direction: column;
  color: var(--color-foreground);
  cursor: pointer;
`;
const BoxRef = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;
const Main = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
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
const Name = styled.button`

  background-color: transparent;
  color: var(--foreground);
  border: 0;
  text-align: left;
  cursor: pointer;

  width: 100%;
  min-height: 50px;
  padding: 8px 8px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  margin-left: -8px;
  margin-right: -8px;
`;
const NbChildren = styled.span`
  font-size: 0.8rem;
  padding: 0.15rem 0.4rem;
  border-radius: 1.5rem;
  background-color: var(--primary-very-light);
  margin-left: 8px;
  color: var(--primary-very-light-contrast);
`
const More = styled.button`
  display: flex;
  align-items: center;
  margin-left: auto;
  background: transparent;
  color: var(--foreground);
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

const DropBase = styled.div`
  position: absolute;
  width: 100%;
  left: 0;
  height: 25px;
  pointer-events: none;

  body.step-dragging & {
    pointer-events: revert;
  }

  ::before {
    content: ' ';
    position: absolute;
    border-top: 2px solid red;
    width: 100%;
    left: 0;
    width: 100%;
    height: 1px;
  }
`;
const DropAbove = styled(DropBase)`
  top: 0;

  // dropAbove and DropBelow have different offset so they collapse visuallly
  ::before {
    // the fact that DropAbove have a bigger number is because it comes after in the
    // DOM and is therefore place above in terms of z-index. This ensure that 
    // the DropBelow is also perfectly visible
    top: -2px;
  }
  `;
const DropBelow = styled(DropBase)`
  bottom: 0;

  // dropAbove and DropBelow have different offset so they collapse visuallly
  ::before {
    bottom: -1px;
  }
`;