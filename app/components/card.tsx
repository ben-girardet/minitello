import { FunctionComponent } from "react";
import styled from "styled-components";

const Card: FunctionComponent = ({children}) => {
  return (<Wrapper>{children}</Wrapper>);
}

const Wrapper = styled.div`
  background: var(--card-layer-background);
  color: var(--card-layer-foreground);
  box-shadow: var(--elevation-shadow);
  padding: var(--gutter);
  border-radius: 2px;
`;

export default Card;