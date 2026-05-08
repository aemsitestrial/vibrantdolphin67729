/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-service
 * Base block: cards
 * Source: https://www2.telenet.be
 * Selector: #experiencefragment-199f2b4490 .cmp-responsivegrid
 * Generated: 2026-05-08
 *
 * Block model (xwalk):
 *   Container block "Cards" with "Card" items
 *   Card fields: image (reference), text (richtext)
 *   Each card = one row with [image, text] columns
 *
 * Source structure:
 *   Experience fragment with a .cmp-grouping > .grouping--full-height wrapper.
 *   Contains a two-column unequal layout (.grouping--2cols-unequal):
 *     - Left column (8/12): text paragraph in .cmp-text
 *     - Right column (4/12): CTA button via tg-button > a.button or tg-lazy-loading attrs
 *   The entire grouping represents ONE service card with text + CTA.
 *   Note: segment-driven-content with display--none is valid (user-targeted content).
 */
export default function parse(element, { document }) {
  // Only process if this element contains the full card grouping structure
  // (avoids processing nested .cmp-responsivegrid sub-containers)
  const grouping = element.querySelector('.cmp-grouping .grouping--full-height');
  if (!grouping) {
    // This is a nested sub-container, not the main card element - create minimal block
    const cells = [['', '']];
    const block = WebImporter.Blocks.createBlock(document, { name: 'cards-service', cells });
    element.replaceWith(block);
    return;
  }

  const cells = [];

  // Extract image/icon if present (may not exist for this service card variant)
  const imageCell = buildImageCell(grouping, document);

  // Extract all text content: paragraphs, headings, and CTAs into one richtext cell
  const textCell = buildTextCell(grouping, document);

  // Single card row: [image, text]
  cells.push([imageCell, textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-service', cells });
  element.replaceWith(block);
}

/**
 * Build the image cell for a card.
 * Returns a DocumentFragment with field hint and image, or empty fragment if no image.
 */
function buildImageCell(container, document) {
  const frag = document.createDocumentFragment();

  // Look for image elements - skip icons inside CTAs
  const picture = container.querySelector('picture');
  const img = container.querySelector('img:not([src=""]):not(a img)');
  const svg = container.querySelector('svg:not(a svg)');

  if (picture) {
    frag.appendChild(document.createComment(' field:image '));
    frag.appendChild(picture);
  } else if (img) {
    frag.appendChild(document.createComment(' field:image '));
    const parentPicture = img.closest('picture');
    frag.appendChild(parentPicture || img);
  } else if (svg) {
    frag.appendChild(document.createComment(' field:image '));
    frag.appendChild(svg);
  }
  // No hint for empty cells per xwalk hinting rules

  return frag;
}

/**
 * Build the text cell for a card.
 * Combines headings, paragraphs, and CTA links into a single richtext cell.
 * Returns a DocumentFragment with field hint and content.
 */
function buildTextCell(container, document) {
  const frag = document.createDocumentFragment();
  let hasContent = false;

  // Add field hint before content
  frag.appendChild(document.createComment(' field:text '));

  // 1. Extract headings (h1-h6)
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach((heading) => {
    const text = heading.textContent.trim();
    if (text) {
      frag.appendChild(heading);
      hasContent = true;
    }
  });

  // 2. Extract text paragraphs from .cmp-text
  const cmpTextParagraphs = container.querySelectorAll('.cmp-text p');
  if (cmpTextParagraphs.length > 0) {
    cmpTextParagraphs.forEach((p) => {
      const text = p.textContent.trim();
      if (text && text !== ' ') {
        frag.appendChild(p);
        hasContent = true;
      }
    });
  }

  // 3. Extract CTA links - try multiple strategies for Angular component rendering
  const addedHrefs = new Set();

  // Strategy A: Find rendered links inside tg-button (when Angular has rendered)
  const renderedLinks = container.querySelectorAll('tg-button a[href], .cmp-button a[href]');
  renderedLinks.forEach((link) => {
    const href = link.getAttribute('href');
    const linkText = link.textContent.trim();
    if (!linkText || !href || isPermanentlyHidden(link) || addedHrefs.has(href)) return;
    addedHrefs.add(href);
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = linkText;
    p.appendChild(a);
    frag.appendChild(p);
    hasContent = true;
  });

  // Strategy B: If no rendered links found, extract from tg-lazy-loading attributes
  if (addedHrefs.size === 0) {
    const lazyLoaders = container.querySelectorAll('tg-lazy-loading[inputs]');
    lazyLoaders.forEach((loader) => {
      try {
        const inputsAttr = loader.getAttribute('inputs');
        const pathsAttr = loader.getAttribute('paths-href');
        if (!inputsAttr || !pathsAttr) return;

        const inputs = JSON.parse(inputsAttr);
        const paths = JSON.parse(pathsAttr);
        const title = inputs.title;
        const href = paths.defaultPath || paths.loginPath || paths.salesPath;

        if (title && href && !addedHrefs.has(href)) {
          addedHrefs.add(href);
          const p = document.createElement('p');
          const a = document.createElement('a');
          a.href = href;
          a.textContent = title;
          p.appendChild(a);
          frag.appendChild(p);
          hasContent = true;
        }
      } catch (e) {
        // JSON parse failed, skip this loader
      }
    });
  }

  // Strategy C: Fallback - any visible a.button links not yet captured
  if (addedHrefs.size === 0) {
    const buttonLinks = container.querySelectorAll('a.button[href]');
    buttonLinks.forEach((link) => {
      const href = link.getAttribute('href');
      const linkText = link.textContent.trim();
      if (!linkText || linkText === ' ' || !href || isPermanentlyHidden(link) || addedHrefs.has(href)) return;
      addedHrefs.add(href);
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = linkText;
      p.appendChild(a);
      frag.appendChild(p);
      hasContent = true;
    });
  }

  // If no content found, return empty fragment (no hint for empty cells)
  if (!hasContent) {
    return document.createDocumentFragment();
  }

  return frag;
}

/**
 * Check if an element is permanently hidden (skeleton UI / placeholder).
 * Does NOT filter segment-driven-content which is valid targeted content.
 */
function isPermanentlyHidden(el) {
  return !!(
    el.closest('.display--none-important') ||
    el.classList.contains('visibility--hide-only') ||
    el.closest('.visibility--hide-only')
  );
}
