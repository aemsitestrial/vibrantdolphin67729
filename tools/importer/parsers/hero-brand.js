/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-brand
 * Base block: hero
 * Source: https://www2.telenet.be
 * Generated: 2026-05-08
 *
 * UE Model fields:
 *   - image (reference) -> Row 1
 *   - imageAlt (collapsed into image - no separate row)
 *   - text (richtext) -> Row 2: heading + description + CTA
 */
export default function parse(element, { document }) {
  // Extract heading (validated: h1.heading--0 in source)
  const heading = element.querySelector('h1, h2, [class*="heading--0"], [class*="heading--1"]');

  // Extract description paragraph (validated: .cmp-text p in source)
  const description = element.querySelector('.cmp-text p, .text p');

  // Extract CTA link (validated: tg-button a.button--primary with href, skip hidden placeholder)
  const ctaLink = element.querySelector('tg-button a[href], a.button--primary[href], a.button[href]');

  // Extract product image (validated: img.cmp-image__image in source)
  const image = element.querySelector('img.cmp-image__image, .cmp-image img, img[src]');

  // Build cells to match UE model structure (2 rows: image, text)
  const cells = [];

  // Row 1: image field
  const imageCell = document.createDocumentFragment();
  imageCell.appendChild(document.createComment(' field:image '));
  if (image) {
    imageCell.appendChild(image);
  }
  cells.push([imageCell]);

  // Row 2: text field (richtext - heading + description + CTA)
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  if (heading) textCell.appendChild(heading);
  if (description) textCell.appendChild(description);
  if (ctaLink) textCell.appendChild(ctaLink);
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-brand', cells });
  element.replaceWith(block);
}
