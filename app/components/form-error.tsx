import { FunctionComponent } from "react";
import styled from "styled-components";
import { SingleFormResult } from "~/utils/form";

const FormError: FunctionComponent<{formResult?: SingleFormResult, name: string}> = ({name, formResult}) => {

  if (!formResult?.error) {
    return null;
  }

  return <Wrapper role="alert" id={`${name}-error`}>{formResult.error}</Wrapper>
}

const Wrapper = styled.p`
  color: var(--error);
`;

export default FormError;