/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature
 * Base block: columns
 * Source: https://www2.telenet.be
 * Generated: 2026-05-08
 *
 * Structure: 2-column unequal layout (4/8 grid)
 *   - Left column (narrow): feature image
 *   - Right column (wide): heading + feature items (icon + title + description) + optional CTAs
 *
 * Columns blocks do NOT require field hint comments (per xwalk hinting rules).
 * Selector from page-templates.json: .divider-curve.divider-curve__up-at-top .background--neutral .grouping--2cols-unequal
 */
export default function parse(element, { document }) {
  // The element may be the section/parent containing both columns,
  // or it may be one of the .grouping--2cols-unequal column elements itself.
  // Navigate to find both columns reliably.
  let leftCol = null;
  let rightCol = null;

  const isColumnElement = element.classList && element.classList.contains('grouping--2cols-unequal');

  if (isColumnElement) {
    // Element is one of the columns - find sibling columns via parent
    const parent = element.parentElement;
    const siblings = parent ? Array.from(parent.querySelectorAll(':scope > .grouping--2cols-unequal')) : [];
    if (siblings.length >= 2) {
      leftCol = siblings[0];
      rightCol = siblings[1];
    } else {
      // Only one column found, treat element as left if narrow, right if wide
      leftCol = element;
    }
  } else {
    // Element is a parent container - find columns within
    const columns = Array.from(element.querySelectorAll('.grouping--2cols-unequal'));
    if (columns.length >= 2) {
      leftCol = columns[0];
      rightCol = columns[1];
    } else if (columns.length === 1) {
      leftCol = columns[0];
    }
  }

  // === LEFT COLUMN: Extract the main feature image ===
  const leftContent = document.createDocumentFragment();
  if (leftCol) {
    const mainImage = leftCol.querySelector('img.cmp-image__image, .cmp-image img, img[src]');
    if (mainImage) {
      leftContent.appendChild(mainImage);
    }
  }

  // === RIGHT COLUMN: Extract heading + feature items + CTAs ===
  const rightContent = document.createDocumentFragment();
  if (rightCol) {
    // Main heading (validated: h2.heading--1 in source)
    const heading = rightCol.querySelector('h2, h1, [class*="heading--1"], [class*="heading--0"]');
    if (heading) {
      rightContent.appendChild(heading);
    }

    // Feature items (validated: .cmp-image-title-text in source)
    // Each has: icon image + bold title (.heading--3) + description (.cmp-text p)
    const featureItems = Array.from(
      rightCol.querySelectorAll('.cmp-image-title-text')
    );

    featureItems.forEach((item) => {
      const container = document.createElement('div');

      // Icon image
      const icon = item.querySelector('img.cmp-image__image, .cmp-image img, img[src]');
      if (icon) {
        container.appendChild(icon);
      }

      // Feature title (validated: .heading--3 div with bold text in source)
      const title = item.querySelector('[class*="heading--3"], .cmp-title [class*="heading"]');
      if (title) {
        container.appendChild(title);
      }

      // Feature description (validated: .cmp-text p in source)
      const desc = item.querySelector('.cmp-text p');
      if (desc) {
        container.appendChild(desc);
      } else {
        // Fallback: get the .cmp-text container
        const descContainer = item.querySelector('.cmp-text');
        if (descContainer) {
          container.appendChild(descContainer);
        }
      }

      if (container.childNodes.length > 0) {
        rightContent.appendChild(container);
      }
    });

    // CTA buttons if present
    const ctaButtons = Array.from(
      rightCol.querySelectorAll('a[href].button, a[href].button--primary, tg-button a[href], .cmp-button a[href]')
    );
    ctaButtons.forEach((btn) => {
      rightContent.appendChild(btn);
    });
  }

  // Build cells: single row with 2 columns (left = image, right = content)
  const cells = [[leftContent, rightContent]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
