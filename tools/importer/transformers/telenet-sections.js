/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Telenet section breaks and section metadata.
 * Inserts <hr> section dividers and Section Metadata blocks based on template sections.
 * All selectors verified against captured DOM (migration-work/cleaned.html).
 *
 * Template sections (from page-templates.json):
 *   1. Hero - selector: .divider-curve.divider-curve__up-at-bottom (line 1284) - style: accent
 *   2. Service Finder - selector: .cmp-section:nth-of-type(2) (line 1452) - style: null
 *   3. Features - selector: .divider-curve.divider-curve__up-at-top (line 2107) - style: neutral
 *   4. Promotions - selector: .divider-curve.divider-curve__down-at-bottom (line 2331) - style: null
 *   5. Products - selector: .cmp-section:nth-of-type(5) (line 2782) - style: null
 *   6. Help - selector: .cmp-section:last-of-type (line 3723) - style: null
 */
const H = { after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.after) {
    const { document } = payload;
    const sections = payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    // Process sections in reverse order to avoid position shifts
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      let selectors = Array.isArray(section.selector) ? section.selector : [section.selector];

      // For section-3 (Features), use the parent divider-curve element instead of nested descendant
      // The .background--neutral is a child of .divider-curve__up-at-top, not a separate section
      if (section.id === 'section-3') {
        selectors = ['.divider-curve.divider-curve__up-at-top'];
      }

      // Find the first matching element for this section
      let sectionEl = null;
      for (const sel of selectors) {
        sectionEl = element.querySelector(sel);
        if (sectionEl) break;
      }

      if (!sectionEl) continue;

      // For nested selectors, walk up to the nearest .cmp-section parent if available
      const parentSection = sectionEl.closest('.cmp-section');
      const targetEl = parentSection || sectionEl;

      // Add Section Metadata block if section has a style
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        targetEl.after(metaBlock);
      }

      // Insert <hr> before every section except the first one
      if (i > 0) {
        const hr = document.createElement('hr');
        targetEl.before(hr);
      }
    }
  }
}
