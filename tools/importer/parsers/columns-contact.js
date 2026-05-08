/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-contact
 * Base block: columns
 * Variant: columns-contact
 * Source selector: .cmp-image-title-text
 * Structure: 2 columns, 1 row - each column has icon image + heading/link + text
 * xwalk note: Columns blocks do NOT require field hint comments per hinting rules
 * Generated: 2026-05-08
 */
export default function parse(element, { document }) {
  // Skip if this element was already consumed as a partner in a previous pair
  if (element.getAttribute('data-columns-contact-processed')) {
    element.remove();
    return;
  }

  // Find partner: walk up to find a common container, then locate the next
  // .cmp-image-title-text element after this one
  let partner = null;

  // Strategy 1: direct nextElementSibling check
  let next = element.nextElementSibling;
  if (next && (next.classList.contains('cmp-image-title-text') || next.querySelector('.cmp-image-title-text'))) {
    partner = next.classList.contains('cmp-image-title-text') ? next : next.querySelector('.cmp-image-title-text');
  }

  // Strategy 2: search in parent and grandparent for all matching elements
  if (!partner) {
    const searchRoot = element.parentElement?.parentElement || element.parentElement || element;
    const allItems = Array.from(searchRoot.querySelectorAll('.cmp-image-title-text'));
    const idx = allItems.indexOf(element);
    if (idx >= 0 && idx + 1 < allItems.length) {
      const candidate = allItems[idx + 1];
      if (!candidate.getAttribute('data-columns-contact-processed')) {
        partner = candidate;
      }
    }
  }

  // Strategy 3: search in document body as last resort
  if (!partner) {
    const allItems = Array.from(document.querySelectorAll('.cmp-image-title-text'));
    const idx = allItems.indexOf(element);
    if (idx >= 0 && idx + 1 < allItems.length) {
      const candidate = allItems[idx + 1];
      if (!candidate.getAttribute('data-columns-contact-processed')) {
        partner = candidate;
      }
    }
  }

  // Mark partner as consumed
  if (partner) {
    partner.setAttribute('data-columns-contact-processed', 'true');
  }

  // Helper: extract content from a single .cmp-image-title-text item
  function extractColumnContent(item) {
    const cellContent = [];

    // Extract icon image
    const img = item.querySelector('.cmp-image__image, img');
    if (img) {
      cellContent.push(img);
    }

    // Extract link (contact items have links instead of headings+text)
    const link = item.querySelector('a');
    if (link) {
      cellContent.push(link);
    } else {
      // Extract heading (h3, div.heading--2, div.heading--3)
      const heading = item.querySelector('h3, .heading--2, .heading--3, .cmp-title div, .cmp-title h3');
      if (heading) {
        cellContent.push(heading);
      }

      // Extract text/description paragraph
      const text = item.querySelector('.cmp-text p, .cmp-text');
      if (text) {
        cellContent.push(text);
      }
    }

    return cellContent;
  }

  // Build cells: one row with 2 columns
  const col1 = extractColumnContent(element);
  const col2 = partner ? extractColumnContent(partner) : [];

  const cells = [[col1, col2]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-contact', cells });
  element.replaceWith(block);

  // Remove the consumed partner element from DOM
  if (partner && partner.parentNode) {
    partner.remove();
  }
}
