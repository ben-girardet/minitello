import { FunctionComponent, MouseEvent } from 'react';
import styled from 'styled-components';
import VisuallyHidden from './visually-hidden';
import { DialogOverlay, DialogContent } from '@reach/dialog';
import Button from './button';
import { Step } from '@prisma/client';
import { Form, useSubmit } from 'remix';
import Stack from './stack';
import FormLabel from './form-label';
import TextField from './text-field';
import FormError from './form-error';
import { FormResult } from '~/utils/form';

type StepEditorProps = {
  isOpen: boolean;
  step: Step;
  actionData?: FormResult;
  onDismiss(event: MouseEvent): void;
  onSave(event: MouseEvent): void;
}

const StepEditor: FunctionComponent<StepEditorProps> = ({isOpen, actionData, step, onDismiss, onSave, children}) => {

  function dismiss(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    onDismiss(event);
  };

  function save(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    onSave(event);
    submit(event.currentTarget as HTMLInputElement);
  }

  const submit = useSubmit();

  return (
    <Overlay isOpen={isOpen} onDismiss={dismiss}>
      <Content aria-labelledby="step-editor-title">
        <h3 id="step-editor-title">Edit step</h3>
        <Form
          method="put"
          aria-describedby={
            actionData?._global?.error
              ? "form-error-message"
              : undefined
          }
        >

          <input
            type="hidden"
            name="_action"
            value="edit-step"
          />
          <input
            type="hidden"
            name="stepId"
            value={step?.id}
          />
          <input
            type="hidden"
            name="projectId"
            value={step?.projectId}
          />

            <Stack size="medium">
              <Stack size="small">
                <FormLabel htmlFor="name">Name</FormLabel>
                <TextField formResult={actionData?.name} name="name" defaultValue={step?.name}></TextField>
                <FormError formResult={actionData?.name} name="name"></FormError>
              </Stack>
              <Stack size="small">
                <FormLabel htmlFor="description">Description</FormLabel>
                <TextField formResult={actionData?.description} name="description" defaultValue={step?.description || ''}></TextField>
                <FormError formResult={actionData?.description} name="description"></FormError>
              </Stack>
              <FormError formResult={actionData?._global} name="_global"></FormError>
            </Stack>
          <Buttons>
            <Button variant="ghost" size="small" onClick={dismiss}>Cancel</Button>
            <Button type="submit" variant="fill" size="small" onClick={save}>Confirm</Button>
          </Buttons>
        </Form>
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