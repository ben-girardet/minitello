// Inspired from https://codepen.io/alvaromontoro/pen/LYjZqzP

import { FunctionComponent } from "react";
import styled from "styled-components";

const ProgressIndicator: FunctionComponent<{progress: number, size: number}> = ({children, progress, size}) => {

  const _progress = Math.floor(progress * 100);

  return (<Wrapper
    role="progressbar"
    aria-valuenow={_progress}
    aria-valuemin={0}
    aria-valuemax={100}
    style={{"--value": _progress, "--size": size + 'rem'}}
    >
      {children}
    </Wrapper>);
}

const Wrapper = styled.div<{style: any}>`
  
  @keyframes growProgressBar {
    0%, 33% { --pgPercentage: 0; }
    100% { --pgPercentage: var(--value); }
  }

  @property --pgPercentage {
    syntax: '<number>';
    inherits: false;
    initial-value: 0;
  }

  /* --size: 12rem; */
  --fg: var(--primary);
  --bg: var(--primary-very-light);
  --pgPercentage: var(--value);
  animation: growProgressBar 1s 1 forwards;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: 
    radial-gradient(closest-side, white 80%, transparent 0 99.9%, white 0),
    conic-gradient(var(--fg) calc(var(--pgPercentage) * 1%), var(--bg) 0)
    ;
  // font-family: Helvetica, Arial, sans-serif;
  font-size: calc(var(--size) / 4);
  color: var(--fg);

  &::before {
    counter-reset: percentage var(--value);
    content: counter(percentage) '%';
  }
`;

export default ProgressIndicator;