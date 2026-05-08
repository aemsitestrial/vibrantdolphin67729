export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    const cells = [...row.children];
    // Structure: [badge, text+cta, image, variant-keyword]
    const variantCell = cells[cells.length - 1];
    const variant = variantCell ? variantCell.textContent.trim().toLowerCase() : '';
    variantCell.classList.add('variant-meta');

    if (variant === 'accent') row.classList.add('accent');
    else if (variant === 'dark') row.classList.add('dark');
    else if (variant === 'image') {
      row.classList.add('image-bg');
      const imgCell = cells[2];
      const img = imgCell ? imgCell.querySelector('img') : null;
      if (img) {
        row.style.backgroundImage = `url('${img.src}')`;
        imgCell.classList.add('variant-meta');
      }
    }
  });
}
