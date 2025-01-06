function decorateButtonsWithImg(element) {
  element.querySelectorAll('a').forEach((a) => {
    a.title = a.title || a.textContent;
    if (a.href !== a.textContent) {
      const up = a.parentElement;
      const twoup = a.parentElement.parentElement;
      if (a.querySelector('svg')) {
        if (up.childNodes.length === 1 && (up.tagName === 'P' || up.tagName === 'DIV')) {
          a.className = 'button'; // default
          up.classList.add('button-container');
        }
        if (
          up.childNodes.length === 1
          && up.tagName === 'STRONG'
          && twoup.childNodes.length === 1
          && twoup.tagName === 'P'
        ) {
          a.className = 'button primary';
          twoup.classList.add('button-container');
        }
        if (
          up.childNodes.length === 1
          && up.tagName === 'EM'
          && twoup.childNodes.length === 1
          && twoup.tagName === 'P'
        ) {
          a.className = 'button secondary';
          twoup.classList.add('button-container');
        }
      }
    }
  });
}

export default function decorateButtonsBlock(fragment) {
  const rows = fragment.querySelectorAll('.columns.block.columns-5-cols > div');

  rows.forEach((row) => {
    decorateButtonsWithImg(row);
    const buttonContainers = row.querySelectorAll('.button-container');

    if (buttonContainers.length > 0) {
      const sourceButtonContainer = buttonContainers[0];

      const columns = row.children;
      const states = ['hover', 'active', 'disabled'];

      states.forEach((state, index) => {
        const column = columns[index + 2];

        if (column) {
          const clonedButton = sourceButtonContainer.cloneNode(true);
          const sourceButton = clonedButton.querySelector('a');
          sourceButton.classList.add(state);

          if (state === 'disabled') {
            sourceButton.setAttribute('disabled', 'true');
            sourceButton.style.pointerEvents = 'none';
          }

          column.appendChild(clonedButton);
        }
      });
    }
  });
}
