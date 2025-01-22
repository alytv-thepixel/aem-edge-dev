import {
  sampleRUM,
  wrapTextNodes,
  decorateSections,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  loadBlock,
  buildBlock
} from './aem.js';

// Import the JSON with SVG mappings
import iconsMap from './icons.js';
import loadStyleGuide from './styleguide.js';

/**
 * @param {string} innerHtml
 * @returns {string}
 */
export function decodeBrElement(innerHtml) {
  return innerHtml.replaceAll('&lt;br&gt;', '<br>');
}

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  extendDecorateButtons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  extendDecorateBlocks(main);
  extendDecorateIcons(main);
}

/**
 * Override of aem.js core function 'decorateIcons' to include custom functionality:
 * - REPLACE function 'decorateIcon' with 'extendDecorateIcon'
 *
 * @param {Element} [element] Element containing icons
 * @param {string} [prefix] prefix to be added to icon the src
 */
export function extendDecorateIcons(element, prefix = '') {
  const icons = [...element.querySelectorAll('span.icon')];
  icons.forEach((span) => {
    extendDecorateIcon(span, prefix);
  });
}

/**
 * Override of aem.js core function 'decorateIcon' to include custom functionality:
 * - REPLACE logic which loads icon as 'img' tag. Now it parses pre-generated svg map and inserts into html
 *
 * @param {Element} [span] span element with icon classes
 */
function extendDecorateIcon(span) {
  const iconName = Array.from(span.classList)
    .find((c) => c.startsWith('icon-'))
    .substring(5);

  if (!iconName || !iconsMap[iconName]) {
    console.error('No icon class found on span:', span);
    return;
  }

  const svgContent = iconsMap[iconName];

  if (!svgContent) {
    console.error(`No SVG found for icon: ${iconName}`);
    return;
  }

  span.innerHTML = svgContent;
  const svgElement = span.querySelector('svg');

  if (svgElement) {
    const title = document.createElement('title');
    title.textContent = iconName; // Use the icon name as the title
    svgElement.prepend(title);
  }
}

/**
 * Override of aem.js core function 'decorateButtons' to include custom functionality:
 * - DELETED condition where is default class 'button' added. Now it acts like a link
 * - ADDED conditions to insert link-specific classes for 'a' tag
 *
 * @param {Element} element container element
 */
export function extendDecorateButtons(element) {
  element.querySelectorAll('a').forEach((a) => {
    a.title = a.title || a.textContent;

    if (a.href !== a.textContent) {
      const up = a.parentElement;
      const twoup = a.parentElement.parentElement;

      if (!a.querySelector('svg')) {
        // Tertiary default and contextual link handler
        if (up.tagName === 'P') {
          // If there is text node inside 'p' - it's contextual link
          const isContextualLink = Array.from(up.childNodes).some(
            (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ''
          );

          a.className = isContextualLink ? 'link tertiary-contextual' : 'link tertiary';
        }

        // Tertiary bold link handler
        if (
          up.tagName === 'EM'
          && twoup.tagName === 'STRONG'
        ) {
          a.className = 'link tertiary-bold';
        }

        // Primary button
        if (
          up.tagName === 'STRONG'
          && twoup.tagName === 'P'
        ) {
          a.className = 'button primary';
          twoup.classList.add('button-container');
        }

        // Secondary button
        if (
          up.tagName === 'EM'
          && twoup.tagName === 'P'
        ) {
          a.className = 'button secondary';
          twoup.classList.add('button-container');
        }
      }
    }
  });
}

/**
 * Override of aem.js core function 'decorateBlocks' to include custom functionality:
 * - REPLACE forEach callback function with extended
 *
 * @param {Element} main The container element
 */
export function extendDecorateBlocks(main) {
  main.querySelectorAll('div.section > div > div').forEach(extendDecorateBlock);
}

/**
 * Override of aem.js core function 'decorateBlock' to include custom functionality:
 * - REPLACE 'decorateButtons' with 'extendDecorateButtons' to handle additional link conditions and styling
 *
 * @param {Element} block The block element
 */
export function extendDecorateBlock(block) {
  const shortBlockName = block.classList[0];
  if (shortBlockName && !block.dataset.blockStatus) {
    block.classList.add('block');
    block.dataset.blockName = shortBlockName;
    block.dataset.blockStatus = 'initialized';
    wrapTextNodes(block);
    const blockWrapper = block.parentElement;
    blockWrapper.classList.add(`${shortBlockName}-wrapper`);
    const section = block.closest('.section');
    if (section) section.classList.add(`${shortBlockName}-container`);
    // eslint-disable-next-line no-use-before-define
    extendDecorateButtons(block);
  }
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  sampleRUM.enhance();

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads a block named 'header' into header
 *
 * @param {Element} header header element
 * @returns {Promise}
 */
async function loadHeader(header) {
  const headerBlock = buildBlock('header', '');
  header.append(headerBlock);
  extendDecorateBlock(headerBlock);

  return loadBlock(headerBlock);
}

/**
 * Loads a block named 'footer' into footer
 *
 * @param footer footer element
 * @returns {Promise}
 */
async function loadFooter(footer) {
  const footerBlock = buildBlock('footer', '');
  footer.append(footerBlock);
  extendDecorateBlock(footerBlock);

  return loadBlock(footerBlock);
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  if (window.location.pathname === '/style-guide') {
    loadStyleGuide();
  }

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
  import('./sidekick.js').then(({ initSidekick }) => initSidekick());
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
