import { FunctionComponent, KeyboardEvent, MouseEvent } from 'react';
import * as ReactDOM from 'react-dom';
import styled from 'styled-components';
import VisuallyHidden from './visually-hidden';
import FocusTrap from 'focus-trap-react'

type ContextualMenuProps = {
  hidden?: boolean;
  onHide: () => void;
  anchor: HTMLElement | null;
  title?: string;
  pointerPosition: {x: number, y: number} | null;
};

const ContextualMenu: FunctionComponent<ContextualMenuProps> = ({hidden, onHide, anchor, pointerPosition, title, children}) => {

  function hide(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    onHide();
  };

  const keyboardHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      hide();
    }
  }

  if (hidden || !anchor) {
    return null;
  }

  const rect = anchor.getBoundingClientRect();
  const w = window.innerWidth;
  const h = window.innerHeight;
  const scrollTop = window.screenTop;
  const scrollLeft = window.screenLeft;

  // we require the pointerPosition to be different than 0
  // to differentiate with a keyboard "Enter" on focusable element
  // which would also trigger this event but with a x and y position of 0
  const anchorX = typeof pointerPosition?.x === 'number' && pointerPosition.x !== 0
    ? pointerPosition.x
    : rect.x + (rect.width / 2);
  const anchorY = typeof pointerPosition?.y === 'number' && pointerPosition.y !== 0
    ? pointerPosition.y
    : rect.y + (rect.height / 2);

  const position = {
    left: 'auto',
    right: 'auto',
    top: 'auto',
    bottom: 'auto'
  };

  // has more room on top or bottom ?
  if (anchorY - scrollTop < h / 2) {
    // more room on bottom
    position.top = `${anchorY}px`;
  } else {
    // more room on top
    position.bottom = `${h - anchorY}px`;
  }

  // has more room on left or right ?
  if (anchorX - scrollLeft < w / 2) {
    // more room on right
    position.left = `${anchorX}px`;
  } else {
    // more room on left
    position.right = `${w - anchorX}px`;
  }

  return ReactDOM.createPortal(
    <>
    <Overlay onClick={hide}></Overlay>
    <FocusTrap active={true} focusTrapOptions={{allowOutsideClick: true}}>
      <Wrapper 
        style={{left: position.left, right: position.right, top: position.top, bottom: position.bottom}}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contextual-menu-title"
        onKeyDown={keyboardHandler}
        >
      
        <VisuallyHidden id="contextual-menu-title">{title || 'Menu'}</VisuallyHidden>
        <ButtonsList onClick={hide}>
          {children}
        </ButtonsList>
      </Wrapper>
    </FocusTrap>
    </>
  , document.body);
}

const Overlay = styled.div`
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.1);
`;

const Wrapper = styled.dialog`
  display: block;
  position: absolute;
  border: none;
  background-color: var(--modal-layer-background);
  color: var(--modal-layer-foreground);
  box-shadow: var(--elevation-shadow);
  padding: 2px;
  min-width: 150px;
`;

const ButtonsList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
`;

export default ContextualMenu;