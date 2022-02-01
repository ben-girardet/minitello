import { css } from 'styled-components';

export default css`
:root {
  --primary: hsl(165deg 87% 36%);
  --secondary: hsl(224deg 87% 36%);

  --background: hsl(165deg 87% 95%);
  --foreground: black;

  --modal-layer-background: white;
  --modal-layer-foreground: var(--foreground);
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