import { FunctionComponent } from "react";
import styled from 'styled-components';

const ContextualMenuButton: FunctionComponent = ({children}) => {
  return <Wrapper>{children}</Wrapper>
}

const Wrapper = styled.button`
  background: white;
  color: var(--primary);
  border: none;
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

export default ContextualMenuButton;