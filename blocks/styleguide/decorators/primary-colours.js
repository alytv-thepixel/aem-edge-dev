/**
 * Process each colour in the list and produce and object we can use to render the colours markup.
 * @param {HTMLUListElement} listItem
 * @returns {Object}
 */
function getColourObject(listItem) {
  const value = listItem.innerText;
  const colour = value.includes('-') ? value.split('-').map((part) => part.trim()) : [];

  return {
    colourLabel: colour[0],
    class: `${colour[0].toLowerCase().replaceAll(' ', '-')}-bg`,
    hexCode: colour[1],
  };
}

/**
 * @param {Object} colour
 * @param {string} colour.colourLabel
 * @param {string} colour.colourClass
 * @param {string} colour.hexCode
 * @param {boolean} showOpacity
 * @param {Array} opacities
 * @returns {HTMLLIElement}
 */
function createColourList(colour, showOpacity = false, opacities = [80, 60, 40, 20]) {
  const liElement = document.createElement('li');
  const colourLabel = document.createElement('p');
  const colourBox = document.createElement('div');
  const hexLabel = document.createElement('p');

  colourLabel.innerText = colour.colourLabel;
  hexLabel.innerText = colour.hexCode;
  colourBox.className = `${colour.class} colour-box`;

  const elements = [colourLabel, colourBox, hexLabel];
  elements.forEach((element) => liElement.append(element));

  // only show opacities for the first column.
  if (showOpacity) {
    const opacityContainer = document.createElement('div');
    opacityContainer.classList = 'opacity-container';
    opacities.forEach((opacity) => {
      const colourBoxSmall = document.createElement('div');
      colourBoxSmall.className = `${colour.class} colour-box-small op-${opacity}`;

      opacityContainer.append(colourBoxSmall);
    });

    liElement.append(opacityContainer);
  }

  return liElement;
}

/**
 * @param {Array} columns
 * @returns {HTMLUListElement}
 */
function generateDom(columns) {
  const container = document.createElement('div');
  container.className = 'primary-colours';

  columns.forEach((col, index) => {
    const ulElement = document.createElement('ul');
    ulElement.className = `col-${index + 1}`;

    col.forEach((colour) => {
      const liElement = createColourList(colour, index === 0);
      ulElement.append(liElement);
    });

    container.append(ulElement);
  });

  return container;
}

export default function decoratePrimaryColours(fragment) {
  const colourLists = fragment.querySelectorAll('ul');
  const cols = [];

  colourLists.forEach((colourList) => {
    const colours = [];
    [...colourList.children].forEach((item) => {
      colours.push(getColourObject(item));
    });

    cols.push(colours);
    colourList.remove();
  });

  const domElement = generateDom(cols);
  fragment.firstElementChild.firstElementChild.append(domElement);
}
