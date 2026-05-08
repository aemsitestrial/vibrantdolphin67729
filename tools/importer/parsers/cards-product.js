/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-product
 * Base block: cards
 * Source: https://www2.telenet.be
 * Generated: 2026-05-08
 * Validated: selectors verified against live DOM via Playwright - 4 cards extracted correctly
 *
 * Container block: each card item becomes one row with [image, text] columns.
 * UE model fields: image (reference), text (richtext)
 * Source structure: .grouping--4cols grid with 4 column containers (3-col width),
 * each containing a .box--hoverable (image link) and sibling .cmp-text (product info)
 */
export default function parse(element, { document }) {
  // Find the column containers that hold individual product cards
  // Each column is a 3-wide grid item containing both image and text
  const columns = element.querySelectorAll('[class*="aem-GridColumn--default--3"]');

  const cells = [];

  columns.forEach((col) => {
    // Validate this column has product content (image + text)
    const img = col.querySelector('img');
    const textContainer = col.querySelector('.cmp-text');
    if (!img || !textContainer) return;

    // Extract product image - may be wrapped in a link
    const imageLink = col.querySelector('a.cmp-image__link, .cmp-image a, .box--hoverable a');

    // Build image cell with field hint
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (imageLink) {
      imageCell.appendChild(imageLink.cloneNode(true));
    } else {
      imageCell.appendChild(img.cloneNode(true));
    }

    // Build text cell with field hint
    // Text contains: product name (bold link), specs, price (bold), original price (strikethrough/caption)
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    const paragraphs = textContainer.querySelectorAll('p');
    paragraphs.forEach((p) => {
      textCell.appendChild(p.cloneNode(true));
    });

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
