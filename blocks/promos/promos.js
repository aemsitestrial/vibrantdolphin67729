export default async function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    const cells = [...row.children];
    // Expect: [badge, text+cta, image, variant]
    // Last cell contains variant keyword: accent, dark, image
    const variantCell = cells[cells.length - 1];
    const variant = variantCell ? variantCell.textContent.trim().toLowerCase() : '';
    variantCell.classList.add('variant-meta');

    if (variant === 'accent') {
      row.classList.add('accent');
    } else if (variant === 'dark') {
      row.classList.add('dark');
    } else if (variant === 'image') {
      row.classList.add('image-bg');
      // Use the image from cell 3 as background
      const imgCell = cells[2];
      const img = imgCell ? imgCell.querySelector('img') : null;
      if (img) {
        row.style.backgroundImage = `url('${img.src}')`;
        imgCell.classList.add('variant-meta');
      }
    }
  });
}
