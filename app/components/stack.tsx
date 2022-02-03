import { FunctionComponent, CSSProperties } from "react";
import styled from "styled-components";

const SIZES = {
  small: {
    "--stack-gap": 4 + "px",
  },
  medium: {
    "--stack-gap": 8 + "px",
  },
  large: {
    "--stack-gap": 16 + "px",
  },
  "very-large": {
    "--stack-gap": 32 + "px",
  },
};

type Size = 'small' | 'medium' | 'large' | 'very-large';

const Stack: FunctionComponent<{size: Size}> = ({children, size}) => {
  const style = SIZES[size];
  return <Wrapper style={style}>{children}</Wrapper>;
}

const Wrapper = styled.div<{style: CSSProperties & {"--stack-gap": string}}>`
  display: flex;
  flex-direction: column;
  gap: var(--stack-gap, 8px);
`;

export default Stack;