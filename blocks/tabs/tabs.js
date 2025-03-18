import { loadFragment } from '../fragment/fragment.js';

/**
 * Binds event listeners to tabs for switching content between desktop and mobile views.
 * @param {HTMLElement} block - The container element for the tabs component.
 */
function bind(block) {
  let index = 0;
  const navDesktopTabs = block.querySelectorAll('.desktop-nav .tab');
  const mobileTabs = block.querySelectorAll('.tabs-wrap .tab');
  const contents = block.querySelectorAll('.content');

  if (contents.length === 0) return;

  /**
   * Updates the active tab and corresponding content.
   * @param {number} newIndex - The index of the new active tab.
   */
  function updateActiveTab(newIndex) {
    index = newIndex < 0 ? contents.length - 1 : newIndex % contents.length;

    // Remove 'active' class from all tabs & content
    contents.forEach((content, i) => content.classList.toggle('active', i === index));
    navDesktopTabs.forEach((tab, i) => tab.classList.toggle('active', i === index));
    mobileTabs.forEach((tab, i) => tab.classList.toggle('active', i === index));
  }

  // Click on Title to Change Slide
  block.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;

    const ref = tab.getAttribute('data-ref');
    if (!ref) return;

    e.preventDefault();

    const targetIndex = [...navDesktopTabs].findIndex((t) => t.getAttribute('data-ref') === ref);
    if (targetIndex !== -1) {
      updateActiveTab(targetIndex);
    }
  });
}
/**
 * @param {HTMLElement} block - The container element for the tabs component.
 */
export default async function decorate(block) {
  const MAX_TABS = 6;
  const hasExcessTabs = block.children.length > MAX_TABS;
  const isEditor = block.closest('.section').hasAttribute('data-aue-resource') ?? false;
  const existingWarning = block.querySelector('.tabs-warning');
  let index = 1;

  const navDesktop = document.createElement('div');
  navDesktop.classList.add('desktop-nav');
  const tabsWrap = document.createElement('div');
  tabsWrap.classList.add('tabs-wrap');

  /**
   * Limits the number of child elements based on editor mode.
   * @param {NodeList} children - List of child elements.
   * @returns {Array} Limited array of elements.
   */
  const limitedChildren = isEditor ? [...block.children] : [...block.children].slice(0, MAX_TABS);

  // eslint-disable-next-line no-restricted-syntax
  for (const tabContent of limitedChildren) {
    const [tabLabel, contentHolder] = tabContent.children;
    // eslint-disable-next-line no-continue
    if (!tabLabel || !contentHolder) continue;

    const tabId = `tab-${index}`;
    const link = tabContent.querySelector('a');
    const path = link ? link.getAttribute('href') : block.textContent.trim();
    // eslint-disable-next-line no-await-in-loop
    const fragment = await loadFragment(path);

    // Create a tab for the desktop navigation
    const desktopTab = tabLabel.cloneNode(true);
    desktopTab.classList.add('tab');
    desktopTab.setAttribute('data-ref', tabId);

    tabLabel.classList.add('tab');
    tabLabel.setAttribute('data-ref', tabId);

    tabContent.setAttribute('id', tabId);
    tabContent.className = 'content';
    contentHolder.className = 'content-holder';

    navDesktop.append(desktopTab);
    if (!isEditor) tabsWrap.append(tabLabel);
    tabsWrap.append(tabContent);

    if (fragment) {
      const fragmentSection = fragment.querySelector(':scope .section');
      if (fragmentSection) {
        contentHolder.classList.add(...fragmentSection.classList);
        contentHolder.replaceChildren(...fragmentSection.childNodes);
      }
    }

    // Set the first tab as active by default
    if (index === 1) {
      desktopTab.classList.add('active');
      tabLabel.classList.add('active');
      tabContent.classList.add('active');
    }

    // eslint-disable-next-line no-plusplus
    index++;
  }

  block.innerHTML = '';

  if (isEditor && hasExcessTabs && !existingWarning) {
    const warning = document.createElement('p');
    warning.className = 'tabs-warning';
    warning.textContent = `Maximum of ${MAX_TABS} tabs allowed. Excess tabs are ignored.`;
    block.appendChild(warning);
  } else if (!hasExcessTabs && existingWarning) {
    existingWarning.remove();
  }

  block.append(navDesktop, tabsWrap);

  bind(block);
}
