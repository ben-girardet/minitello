import { createGlobalStyle } from 'styled-components';
import reset from './reset';
import settings from './settings';

const GlobalStyles = createGlobalStyle`
${reset}
${settings}
`;
export default GlobalStyles;