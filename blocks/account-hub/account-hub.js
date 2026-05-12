export default async function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row, index) => {
    const cells = [...row.children];

    if (index === 0) {
      // Links card: single cell with heading + list
      row.classList.add('links-card');
    } else if (index === 1) {
      // Compose card: icon cell + text cell
      row.classList.add('compose-card');
      if (cells.length >= 2) {
        cells[0].classList.add('icon-cell');
        cells[1].classList.add('text-cell');
      }
    } else if (index === 2) {
      // Combos card: image cell + text cell
      row.classList.add('combos-card');
      if (cells.length >= 2) {
        cells[0].classList.add('image-cell');
        cells[1].classList.add('text-cell');
      }
    }
  });
}
