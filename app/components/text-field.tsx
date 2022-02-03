import { FunctionComponent, ReactNode, ComponentPropsWithRef } from "react";
import styled from "styled-components";
import { SingleFormResult } from "~/utils/form";

type TextFieldProps = {
  start?: ReactNode;
  end?: ReactNode;
  formResult?: SingleFormResult;
};
type TextFieldCombinedProps = ComponentPropsWithRef<'input'> & TextFieldProps;

const TextField: FunctionComponent<TextFieldCombinedProps> = ({start, end, formResult, value, ...delegated}) => {

  const defaultValue = formResult ? formResult.value : value;
  const error = formResult?.error;

  return (
    <Wrapper className={error ? 'has-error' : ''}>
      {start ? start : undefined}
      <InputElement
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${delegated.name}-error` : undefined }
        {...delegated}
        ></InputElement>
      <InputOverlay></InputOverlay>
      {end ? end : undefined}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  display: flex;
  gap: 8px;
  padding: 8px;
  align-items: center;
  border: 1px solid var(--primary);
  color: var(--primary);
  background: var(--primary-contrast);

  & > * {
    flex-shrink: 0;
    position: relative;
    z-index: 2;
  }

  &:focus {
    outline: 1px solid red;
  }
`;

const InputElement = styled.input`
  position: relative;
  z-index: 2;
  background: transparent;
  flex-shrink: 1;
  width: 100%;
  border:none;

  &:focus {
    outline: none;
    color: var(--primary-very-light-contrast);
  }
`;

const InputOverlay = styled.div`
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  ${InputElement}:focus + & {
    outline-color: var(--primary);
    outline-width: 1px;
    outline-style: solid;
    background: var(--primary-very-light);
  }
`;

export default TextField;