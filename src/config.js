/* eslint-disable import/prefer-default-export */
import smLogo from './img/sm-logo-retina.webp';
import aria from './img/aria.png';

// header will not take up vertical height when transparent, so you need to be mindful of overlap
export const transparentHeader = true;
export const headerHeight = '3.5rem';
export const logo = smLogo;
export const logoAltText = 'Soul Machines logo';
export const logoLink = '/';

// background image is positioned in a way that is best for pictures of the persona's face.
// adjust spacing as necessary in Landing.js for different images
export const landingBackground = aria;
