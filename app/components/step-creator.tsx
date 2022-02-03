import { ChevronRight } from 'tabler-icons-react';
import { Form } from 'remix';
import styled from 'styled-components';
import { FunctionComponent, ComponentPropsWithRef } from 'react';
import { SingleFormResult } from '~/utils/form';
import Spinner from './spinner';

type StepCreatorProp = {
  projectId: string;
  parentStepId: string;
  formResult?: SingleFormResult;
  processing?: boolean;
}
const StepCreator: FunctionComponent<ComponentPropsWithRef<'form'> & StepCreatorProp> = ({projectId, parentStepId, formResult, processing, ref}) => {

  return (
      <Form method="post">
        <Wrapper>
            <input type="hidden" name="projectId" value={projectId}></input>
            <input type="hidden" name="parentStepId" value={parentStepId}></input>
            <InputField className="step-creator" placeholder='Write your next step' name="name"></InputField>
            {processing ? (
              <div style={{"width": '32px', "height": '26px', opacity: 0.5}}>
                <Spinner></Spinner>
              </div>
              ) : (
              <Save type="submit" name="_action" value="create-step">
                <ChevronRight></ChevronRight>
              </Save>
            )}
        </Wrapper>
        {formResult?.error ? (
          <Wrapper>
            <ErrorContainer>{formResult?.error}</ErrorContainer>
          </Wrapper>
        ) : undefined }
        
      </Form>
  )
}

const Wrapper = styled.div`
  padding: 8px;
  background: hsl(0, 0%, 95%);
  margin: 1px 0;
  display: grid;
  grid-template-columns: 1fr 32px;
  justify-content: space-between;
  align-items: center;
  color: var(--color-foreground);
  cursor: pointer;
  gap: 16px;
`;
const InputField = styled.input`
  background: transparent;
  border: none;
  margin-left: 42px;
  outline-offset: 4px;
`;
const Save = styled.button`
  border: none;
  background: none;
`;
const ErrorContainer = styled.div`
  margin-top: -8px;
  margin-left: 42px;
  color: var(--error);
`;

export default StepCreator;