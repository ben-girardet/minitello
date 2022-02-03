import { FunctionComponent, ComponentProps } from "react";
import styled from "styled-components";

const Spinner: FunctionComponent<ComponentProps<'svg'>> = () => {
  return (
    <SpinnerSVG viewBox="0 0 50 50">
      <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
    </SpinnerSVG>
  )
};

const SpinnerSVG = styled.svg`

animation: rotate 2s linear infinite;
max-width: 100%;
max-height: 100%;

& .path {
  stroke: currentColor;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}
  


@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

`;

export default Spinner;