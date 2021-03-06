import { FunctionComponent, ComponentPropsWithoutRef } from "react";
import styled from 'styled-components';

const ContextualMenuButton: FunctionComponent<ComponentPropsWithoutRef<'button'>> = ({children, ...delegated}) => {
  return <Wrapper {...delegated}>{children}</Wrapper>
}

const Wrapper = styled.button`
  background: var(--primary-contrast);
  color: var(--primary);
  border: none;
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  cursor: pointer;

  :hover {
    background: var(--primary-very-light);
  }
`;

export default ContextualMenuButton;