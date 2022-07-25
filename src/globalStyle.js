import { createGlobalStyle } from 'styled-components';
import breakpoints from './utils/breakpoints';

const buttonSidePadding = '0.8rem';
const buttonVerticalPadding = '0.4rem';
export const primaryAccent = 'blue';

export default createGlobalStyle`
  svg {
    vertical-align: -0.125em;
  }
  .btn.primary-accent {
    border: 1px solid ${primaryAccent};
    background: ${primaryAccent};
    color: #FFF;
  }
  .form-check-input:checked {
    background-color: ${primaryAccent};
    border-color: ${primaryAccent};
  }
  .btn-unstyled {
    border: none;
    background: none;
  }
`;
