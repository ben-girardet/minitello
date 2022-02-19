import { FunctionComponent, MouseEvent } from 'react';
import styled from 'styled-components';
import VisuallyHidden from './visually-hidden';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import Button from './button';
import { Step } from '@prisma/client';

type StepEditorProps = {
  isOpen: boolean;
  step: Step;
  onDismiss(event: MouseEvent): void;
  onSave(event: MouseEvent): void;
}

const StepEditor: FunctionComponent<StepEditorProps> = ({isOpen, step, onDismiss, onSave, children}) => {

  function dismiss(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    onDismiss(event);
  };

  function save(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    onSave(event);
  }

  return (
    <Overlay isOpen={isOpen} onDismiss={dismiss}>
      <Content aria-labelledby="step-editor-title">
        <h3 id="step-editor-title">Edit step</h3>

        
        
        <Buttons>
          <Button variant="ghost" size="small" onClick={dismiss}>Cancel</Button>
          <Button variant="fill" size="small" onClick={save}>Confirm</Button>
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

export default StepEditor;