import { css } from 'styled-components';

export default css`
:root {

  --primary-hue: 165deg;
  --error-hue: 0deg;
  --intense: 87% 36%;
  --intense-contrast: white;
  --light: 87% 45%;
  --light-contrast: black;
  --very-light: 87% 95%;
  --very-light-contrast: black;
  --dark: 87% 25%;
  --dark-contrast: white;
  --very-dark: 87% 5%;
  --very-dark-contrast: white;
  


  --primary: hsl(var(--primary-hue) var(--intense));
  --primary-contrast: var(--intense-contrast);
  --primary-light: hsl(var(--primary-hue) var(--light));
  --primary-light-contrast: var(--light-contrast);
  --primary-dark: hsl(var(--primary-hue) var(--dark));
  --primary-dark-contrast: var(--dark-contrast);
  --primary-very-light: hsl(var(--primary-hue) var(--very-light));
  --primary-very-light-contrast: var(--very-light-contrast);
  --primary-very-dark: hsl(var(--primary-hue) var(--very-dark));
  --primary-very-dark-contrast: var(--very-dark-contrast);

  --error: hsl(var(--error-hue) var(--intense));
  --error-contrast: var(--intense-contrast);

  --background: hsl(var(--primary-hue) var(--very-light));
  --foreground: var(--very-light-contrast);

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

}
`;