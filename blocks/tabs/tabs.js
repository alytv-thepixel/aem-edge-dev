/*
 * Fragment Block
 * Include content on a page as a fragment.
 * https://www.aem.live/developer/block-collection/fragment
 */

import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadSections,
} from '../../scripts/aem.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    // eslint-disable-next-line no-param-reassign
    path = path.replace(/(\.plain)?\.html/, '');
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();

      // reset base path for media to fragment base
      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');

      decorateMain(main);
      await loadSections(main);
      return main;
    }
  }
  return null;
}

function bind(block) {
  let index = 0;
  const desktopTabs = block.querySelectorAll('.desktop-nav .tab');
  const mobileTabs = block.querySelectorAll('.tabs-wrap .tab');
  const contents = block.querySelectorAll('.content');

  if (contents.length === 0) return;

  function updateActiveSlide(newIndex) {
    index = newIndex < 0 ? contents.length - 1 : newIndex % contents.length;

    // Remove 'active' class from all tabs & content
    contents.forEach((content, i) => content.classList.toggle('active', i === index));
    desktopTabs.forEach((tab, i) => tab.classList.toggle('active', i === index));
    mobileTabs.forEach((tab, i) => tab.classList.toggle('active', i === index));
  }

  // Click on Title to Change Slide
  block.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;

    const ref = tab.getAttribute('data-ref');
    if (!ref) return;

    e.preventDefault();

    const targetIndex = [...desktopTabs].findIndex((t) => t.getAttribute('data-ref') === ref);
    if (targetIndex !== -1) {
      updateActiveSlide(targetIndex);
    }
  });
}
export default async function decorate(block) {
  const maxTabs = 6;
  const ifMoreTabs = block.children.length > maxTabs;
  let index = 1;
  const desktopNav = document.createElement('div');
  desktopNav.classList.add('desktop-nav');
  const tabsWrap = document.createElement('div');
  tabsWrap.classList.add('tabs-wrap');

  const limitedChildren = [...block.children].slice(0, maxTabs);

  // eslint-disable-next-line no-restricted-syntax
  for (const tabContent of limitedChildren) {
    const [tab, contentHolder] = tabContent.children;
    const tabId = `tab-${index}`;
    const link = tabContent.querySelector('a');
    const path = link ? link.getAttribute('href') : block.textContent.trim();
    // eslint-disable-next-line no-await-in-loop
    const fragment = await loadFragment(path);

    const desktopTab = tab.cloneNode(true);
    desktopTab.classList.add('tab');
    desktopTab.setAttribute('data-ref', tabId);

    tab.classList.add('tab');
    tab.setAttribute('data-ref', tabId);

    tabContent.setAttribute('id', tabId);
    tabContent.className = 'content';
    contentHolder.className = 'content-holder';

    desktopNav.append(desktopTab);
    tabsWrap.append(tab);
    tabsWrap.append(tabContent);

    if (fragment) {
      const fragmentSection = fragment.querySelector(':scope .section');
      if (fragmentSection) {
        contentHolder.classList.add(...fragmentSection.classList);
        contentHolder.replaceChildren(...fragmentSection.childNodes);
      }
    }

    if (index === 1) {
      desktopTab.classList.add('active');
      tab.classList.add('active');
      tabContent.classList.add('active');
    }

    // eslint-disable-next-line no-plusplus
    index++;
  }

  const isEditor = block.closest('#editor-app');
  const existingWarning = block.querySelector('.tabs-warning');

  block.innerHTML = '';

  console.log(block)

  if (isEditor) {
    if (ifMoreTabs) {
      if (!existingWarning) {
        const warning = document.createElement('p');
        warning.className = 'tabs-warning';
        warning.textContent = `Maximum of ${maxTabs} tabs allowed. Excess tabs are ignored.`;
        block.appendChild(warning);
      }
    } else if (existingWarning) {
      existingWarning.remove();
    }
  }

  block.append(desktopNav);
  block.append(tabsWrap);

  bind(block);
}
