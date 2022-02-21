import { FunctionComponent, KeyboardEvent, MouseEvent, ReactNode, useState } from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import VisuallyHidden from './visually-hidden';
import FocusTrap from 'focus-trap-react'
import { DialogOverlay, DialogContent } from '@reach/dialog';
import Button from './button';
import { string } from 'prop-types';

type Handler = (event: MouseEvent) => void;

type ConfirmDialogProps = {
  isOpen: boolean;
  title?: string;
  onDismiss: Handler;
  onConfirm: Handler;
}

export const ConfirmDialog: FunctionComponent<ConfirmDialogProps> = ({isOpen, title, onDismiss, onConfirm, children}) => {

  const [_isOpen, setIsOpen] = useState<boolean>(isOpen);

  function dismiss(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    setIsOpen(false);
    onDismiss(event);
  };

  function confirm(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    setIsOpen(false);
    onConfirm(event);
  }

  return (
    <Overlay isOpen={_isOpen} onDismiss={dismiss}>
      <Content aria-label={title}>
        <h3>{title || ''}</h3>
        {children}
        <Buttons>
          <Button variant="ghost" size="small" onClick={dismiss}>Cancel</Button>
          <Button variant="fill" size="small" onClick={confirm}>Confirm</Button>
        </Buttons>
      </Content>
    </Overlay>
  );
}

const Overlay = styled(DialogOverlay)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: hsl(0deg 0% 0% / 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Content = styled(DialogContent)`
  width: min-content;
  min-width: 300px;
  height: min-content;
  min-height: 200px;
  margin: auto;
  background: var(--modal-layer-background);
  color: var(--modal-layer-foreground);
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export function openConfirmDialog(title: string, onDismiss: Handler, onConfirm: Handler, children: ReactNode) {
  const target = document.createElement('div');
  document.body.appendChild(target);

  const _onDismiss = (event: MouseEvent) => {
    document.body.removeChild(target);
    onDismiss.call(null, event);
  }
  const _onConfirm = (event: MouseEvent) => {
    document.body.removeChild(target);
    onConfirm.call(null, event);
  }

  render(<ConfirmDialog isOpen={true} title={title} onDismiss={_onDismiss} onConfirm={_onConfirm} children={children}/>, target)
}

export default ConfirmDialog;