export default async function decorate(block) {
  const rows = [...block.children];

  // Row 0: heading, Row 1: subtitle, Rows 2+: icon+link pairs
  const iconRows = rows.slice(2);

  // Create icons container
  const iconsContainer = document.createElement('div');
  iconsContainer.classList.add('help-links-icons');

  iconRows.forEach((row) => {
    const cells = [...row.children];
    const item = document.createElement('div');
    item.classList.add('help-links-item');

    // Cell 0: image, Cell 1: link text
    if (cells[0]) {
      const img = cells[0].querySelector('img');
      if (img) {
        item.appendChild(img.cloneNode(true));
      }
    }
    if (cells[1]) {
      const link = cells[1].querySelector('a');
      if (link) {
        item.appendChild(link.cloneNode(true));
      }
    }

    iconsContainer.appendChild(item);
    row.remove();
  });

  block.appendChild(iconsContainer);
}
