import { loadFragment } from '../fragment/fragment.js';
import decoratePrimaryColours from './decorators/primary-colours.js';

const fragmentConfig = {
  '/style-guide/primary-colours': decoratePrimaryColours,
  '/style-guide/titles': null,
};

async function loadAndDecorateFragment(path, decorator) {
  const fragment = await loadFragment(path);
  if (decorator) decorator(fragment);
  return fragment;
}

export default async function decorate(block) {
  const fragmentPromises = Object.entries(fragmentConfig).map(
    async ([path, decorator]) => loadAndDecorateFragment(path, decorator),
  );

  const fragments = await Promise.all(fragmentPromises);

  fragments.forEach((fragment) => {
    block.append(fragment);
  });
}
