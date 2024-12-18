export default function decorateButtons(fragment) {
  const rows = fragment.querySelectorAll('.columns.block.columns-5-cols > div');

  rows.forEach((row) => {
    const buttonContainers = row.querySelectorAll('.button-container');

    if (buttonContainers.length > 0) {
      const sourceButtonContainer = buttonContainers[0];
      const sourceButton = sourceButtonContainer.querySelector('a');

      const columns = row.children;
      const states = ['hover', 'active', 'disabled'];

      states.forEach((state, index) => {
        const column = columns[index + 2];

        if (column) {
          const newButtonContainer = document.createElement('p');
          newButtonContainer.className = 'button-container';

          const clonedButton = sourceButton.cloneNode(true);

          clonedButton.classList.add(state);

          if (state === 'disabled') {
            clonedButton.setAttribute('disabled', 'true');
            clonedButton.classList.add('disabled');
            clonedButton.style.pointerEvents = 'none';
          }

          newButtonContainer.appendChild(clonedButton);
          column.appendChild(newButtonContainer);
        }
      });
    }
  });
}
