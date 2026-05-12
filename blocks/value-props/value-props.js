export default async function decorate(block) {
  const rows = [...block.children];

  // First row: illustration + heading
  // Rows 2-4: icon + title/description
  // The heading is in the second cell of row 1; move it to be a standalone heading row
  // and keep the illustration image in its own row

  if (rows.length >= 1) {
    const firstRow = rows[0];
    const cells = [...firstRow.children];

    // cells[0] = illustration image, cells[1] = heading text
    if (cells.length === 2) {
      const illustrationCell = cells[0];
      const headingCell = cells[1];

      // Create a new row for the heading
      const headingRow = document.createElement('div');
      headingRow.append(...headingCell.children);

      // Keep illustration in its own row
      const illustrationRow = document.createElement('div');
      illustrationRow.append(...illustrationCell.children);

      // Replace the first row with illustration row, insert heading row after
      firstRow.replaceWith(illustrationRow);
      illustrationRow.after(headingRow);
    }
  }
}
