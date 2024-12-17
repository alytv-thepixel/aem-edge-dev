import { decodeBrElement } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const heading = block.querySelector('h1,h2,h3,h4,h5,h6');
  if (heading) {
    heading.innerHTML = decodeBrElement(heading.innerHTML);
  }
}
