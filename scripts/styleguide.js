import { buildBlock, decorateBlock, loadBlock } from './aem.js';

export default async function loadStyleGuide() {
  const styleGuideBlock = buildBlock('styleguide', '');
  document.querySelector('main').append(styleGuideBlock);
  decorateBlock(styleGuideBlock);

  return loadBlock(styleGuideBlock);
}
