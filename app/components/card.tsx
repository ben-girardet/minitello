import { FunctionComponent } from "react";
import styled from "styled-components";

const Card: FunctionComponent = ({children}) => {
  return (<Wrapper>{children}</Wrapper>);
}

const Wrapper = styled.div`
  background: var(--card-layer-background);
  foreground: var(--card-layer-foreground);
  box-shadow: var(--elevation-shadow);
  padding: var(--gutter);
`;

export default Card;