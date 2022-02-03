import { css } from 'styled-components';

export default css`
:root {

  --primary: hsl(165deg 87% 36%);
  --primary-contrast: white;
  --primary-light: hsl(165deg 87% 45%);
  --primary-light-contrast: white;
  --primary-dark: hsl(165deg 87% 25%);
  --primary-dark-contrast: white;
  --primary-very-light: hsl(165deg 87% 95%);
  --primary-very-light-contrast: black;
  --primary-very-dark: hsl(165deg 87% 15%);
  --primary-very-dark-contrast: white;

  --error: hsl(0deg 50% 50%);
  --error-contrast: white;

  --background: hsl(165deg 87% 95%);
  --foreground: black;

  --modal-layer-background: white;
  --modal-layer-foreground: var(--foreground);

  --card-layer-background: white;
  --card-layer-foreground: var(--foreground);

  --large-container-width: 1024px;
  --medium-container-width: 768px;
  --small-container-width: 512px;
  --gutter: 16px;
  --elevation-shadow:
    2.8px 2.8px 2.2px rgba(0, 0, 0, 0.02),
    6.7px 6.7px 5.3px rgba(0, 0, 0, 0.028),
    12.5px 12.5px 10px rgba(0, 0, 0, 0.035),
    22.3px 22.3px 17.9px rgba(0, 0, 0, 0.042),
    41.8px 41.8px 33.4px rgba(0, 0, 0, 0.05),
    100px 100px 80px rgba(0, 0, 0, 0.07);
;

}
`;