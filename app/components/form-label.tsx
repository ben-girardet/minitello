import { FunctionComponent, ComponentPropsWithRef } from "react";
import styled from "styled-components";

const FormLabel: FunctionComponent<ComponentPropsWithRef<'label'>> = ({children, ...delegated}) => {
  return <Wrapper {...delegated}>{children}</Wrapper>
}

const Wrapper = styled.label`
  font-weight: 500;
  color: var(--primary);
`;

export default FormLabel;