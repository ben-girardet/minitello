import { createGlobalStyle } from 'styled-components';
import reset from './reset';
import settings from './settings';
import identity from './identity';
import typography from './typography';

const GlobalStyles = createGlobalStyle`
${reset}
${settings}
${identity}
${typography}
`;
export default GlobalStyles;