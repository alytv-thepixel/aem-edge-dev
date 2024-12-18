export default function decorateButtonsBlock(fragment) {
  const rows = fragment.querySelectorAll('.columns.block.columns-5-cols > div');

  rows.forEach((row) => {
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
