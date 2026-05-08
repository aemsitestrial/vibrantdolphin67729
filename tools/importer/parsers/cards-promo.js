/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-promo variant.
 * Base block: cards (container block with card children)
 * Source: https://www2.telenet.be
 * Generated: 2026-05-08
 *
 * Extracts promotional cards with badge labels, headings, description text,
 * and CTA links from a 3-card grid with accent/yellow backgrounds.
 *
 * UE Model (cards/_cards.json):
 *   Container: cards -> children: card
 *   Card fields: image (reference), text (richtext)
 *
 * Source structure:
 *   .grouping--full-height > .aem-Grid > .cmp.cmp-responsivegrid (per card)
 *     Each card: .box--hoverable.background--accent
 *       .cmp-badge -> badge label text
 *       .heading--2 -> bold heading
 *       .cmp-text -> description paragraph
 *       .cmp-button -> CTA link
 */
export default function parse(element, { document }) {
  // Find individual card containers within the grouping
  // Each card is a .cmp-responsivegrid with a .box--hoverable child
  const cardWrappers = element.querySelectorAll('.box--hoverable, [class*="box--hoverable"]');

  const cells = [];

  cardWrappers.forEach((card) => {
    // Extract badge label (e.g., "Nu of nooit")
    // Badge has both hidden-mobile and hidden-desktop versions; take the first visible one
    const badgeEl = card.querySelector('.cmp-badge .hidden-mobile p, .cmp-badge p.font--body-small');

    // Extract heading (bold title inside .heading--2 container)
    const headingContainer = card.querySelector('[class*="heading--2"], .cmp-title div[class*="heading"]');
    const headingEl = headingContainer ? headingContainer.querySelector('b') || headingContainer : null;

    // Extract description text
    const descEl = card.querySelector('.cmp-text p, .cmp-text');

    // Extract CTA link - the button component contains an anchor link
    // Source structure: .cmp-button > div > ... > a (nested structure)
    const ctaEl = card.querySelector('.cmp-button a, a.cmp-button__link, .cmp-button [href], a[class*="button"]');

    // Build the text cell content (richtext field)
    // Container block: each card = one row with [image, text] columns
    const textFrag = document.createDocumentFragment();

    // Add field hint for text (xwalk requirement)
    textFrag.appendChild(document.createComment(' field:text '));

    // Badge as a styled paragraph
    if (badgeEl) {
      const badgePara = document.createElement('p');
      badgePara.textContent = badgeEl.textContent.trim();
      badgePara.setAttribute('class', 'badge');
      textFrag.appendChild(badgePara);
    }

    // Heading as bold text in a paragraph
    if (headingEl) {
      const headingPara = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = headingEl.textContent.trim();
      headingPara.appendChild(strong);
      textFrag.appendChild(headingPara);
    }

    // Description paragraph
    if (descEl) {
      const descPara = document.createElement('p');
      descPara.textContent = descEl.textContent.trim();
      textFrag.appendChild(descPara);
    }

    // CTA link
    if (ctaEl) {
      const link = document.createElement('a');
      link.href = ctaEl.href || ctaEl.getAttribute('href') || '';
      link.textContent = ctaEl.textContent.trim() || 'Meer info';
      textFrag.appendChild(link);
    }

    // Each card row: [image (empty - no images in promo cards), text (richtext content)]
    // image cell is empty, no field hint needed for empty cells
    cells.push(['', textFrag]);
  });

  // If no cards found via .box--hoverable, try alternative selector
  if (cells.length === 0) {
    const altCards = element.querySelectorAll('.cmp-responsivegrid > [class*="background--accent"], .cmp-responsivegrid [class*="tg-grid--padding-y-large"]');
    altCards.forEach((card) => {
      const badgeEl = card.querySelector('.cmp-badge p');
      const headingEl = card.querySelector('[class*="heading--2"] b, [class*="heading--2"]');
      const descEl = card.querySelector('.cmp-text p');
      const ctaEl = card.querySelector('.cmp-button a, a[class*="button"]');

      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(' field:text '));

      if (badgeEl) {
        const badgePara = document.createElement('p');
        badgePara.textContent = badgeEl.textContent.trim();
        badgePara.setAttribute('class', 'badge');
        textFrag.appendChild(badgePara);
      }
      if (headingEl) {
        const headingPara = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = headingEl.textContent.trim();
        headingPara.appendChild(strong);
        textFrag.appendChild(headingPara);
      }
      if (descEl) {
        const descPara = document.createElement('p');
        descPara.textContent = descEl.textContent.trim();
        textFrag.appendChild(descPara);
      }
      if (ctaEl) {
        const link = document.createElement('a');
        link.href = ctaEl.href || ctaEl.getAttribute('href') || '';
        link.textContent = ctaEl.textContent.trim() || 'Meer info';
        textFrag.appendChild(link);
      }

      cells.push(['', textFrag]);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
