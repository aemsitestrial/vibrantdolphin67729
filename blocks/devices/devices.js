export default async function decorate(block) {
  const rows = [...block.children];

  // Identify card rows (rows with 2 cells: image + text)
  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length === 2) {
      const imgCell = cells[0];
      const textCell = cells[1];
      // If first cell has an image, mark as product card
      if (imgCell.querySelector('img')) {
        row.classList.add('device-card');
        imgCell.classList.add('device-card-image');
        textCell.classList.add('device-card-info');
      }
    }
  });
}
