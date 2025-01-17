export default function decorate(block) {
  const [linkElementBlock, linkTextBlock, linkTitleBlock, buttonClassBlock] = [...block.querySelectorAll('p')];
  const textContent = linkTextBlock?.textContent?.trim(),
    linkElement = linkElementBlock.querySelector('a'),
    classList = buttonClassBlock?.textContent?.trim() ?? 'button primary',
    buttonType = classList.split(' ').pop();

  linkElement.title = linkTitleBlock?.textContent?.trim() ?? textContent;
  linkElement.textContent = textContent;
  linkElement.className = '';
  linkElement.classList.add(...classList.split(' '));
  linkElementBlock.replaceChildren(createButtonWrapper(linkElement, buttonType));
  block.replaceChildren(linkElementBlock);
}

function createButtonWrapper(
  linkElement,
  buttonType = 'primary'
) {
  let wrapper;

  switch (buttonType) {
    case 'primary':
    case 'tertiary-bold':
      wrapper = document.createElement('strong');
      wrapper.appendChild(linkElement);

      return wrapper;
    case 'secondary':
      wrapper = document.createElement('em');
      wrapper.appendChild(linkElement);

      return wrapper;
    default:
      return linkElement;
  }
}