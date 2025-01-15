export default function decorate(block) {
  const innerDiv = block.firstElementChild;

  if (innerDiv) {
    console.log(innerDiv)
    // const childDiv = innerDiv.firstElementChild;
    //
    // if (childDiv) {
    //   let value = childDiv.innerText.trim();
    //
    //   // eslint-disable-next-line no-restricted-globals
    //   if (!isNaN(value) && value >= 0) {
    //     if (value > 100) {
    //       value = 100;
    //     }
    //     innerDiv.style.width = `${value}%`;
    //   }
    //
    //   childDiv.remove();
    // }
  }
}
