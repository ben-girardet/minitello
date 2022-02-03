import { FunctionComponent, ComponentPropsWithRef } from "react";
import styled from "styled-components";

const SIZES = {
  small: {
    "--borderRadius": 2 + "px",
    "--fontSize": 16 / 16 + "rem",
    "--padding": "4px 12px"
  },
  medium: {
    "--borderRadius": 2 + "px",
    "--fontSize": 18 / 16 + "rem",
    "--padding": "12px 20px"
  },
  large: {
    "--borderRadius": 4 + "px",
    "--fontSize": 21 / 16 + "rem",
    "--padding": "16px 32px"
  }
};

type ButtonProps = {variant: 'fill' | 'outline' | 'ghost', size: 'small' | 'medium' | 'large'};
type CombinedButtonProps = ComponentPropsWithRef<'button'> & ButtonProps;

const Button: FunctionComponent<CombinedButtonProps> = ({variant, size, children, ...delegated}) => {

  const styles = SIZES[size];

  let Component;
  if (variant === "fill") {
    Component = FillButton;
  } else if (variant === "outline") {
    Component = OutlineButton;
  } else if (variant === "ghost") {
    Component = GhostButton;
  } else {
    throw new Error(`Unrecognized Button variant: ${variant}`);
  }

  return <Component style={styles} {...delegated}>{children}</Component>;
};

const ButtonBase = styled.button<{style: any}>`
  font-size: var(--fontSize);
  font-family: "Roboto", sans-serif;
  padding: var(--padding);
  border-radius: var(--borderRadius);
  border: 2px solid transparent;
  cursor: pointer;

  &:focus {
    outline-color: var(--primary);
    outline-offset: 4px;
  }
`;

const FillButton = styled(ButtonBase)`
  background-color: var(--primary);
  color: var(--primary-contrast);

  &:hover {
    background-color: var(--primary-light);
    color: var(--primary-light-contrast);
  }
`;
const OutlineButton = styled(ButtonBase)`
  background-color: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);

  &:hover {
    background-color: var(--primary-light);
    color: var(--primary-light-contrast);
  }
`;
const GhostButton = styled(ButtonBase)`
  color: var(--primary);
  background-color: transparent;

  &:focus {
    outline-color: var(--primary);
  }

  &:hover {
    background: var(--primary-light);
    color: var(--primary-light-contrast);
  }
`;

export default Button;