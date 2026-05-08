/* eslint-disable */
/* global WebImporter */

import heroBrandParser from './parsers/hero-brand.js';
import cardsServiceParser from './parsers/cards-service.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import cardsPromoParser from './parsers/cards-promo.js';
import cardsProductParser from './parsers/cards-product.js';
import columnsContactParser from './parsers/columns-contact.js';

import cleanupTransformer from './transformers/telenet-cleanup.js';
import sectionsTransformer from './transformers/telenet-sections.js';

const parsers = {
  'hero-brand': heroBrandParser,
  'cards-service': cardsServiceParser,
  'columns-feature': columnsFeatureParser,
  'cards-promo': cardsPromoParser,
  'cards-product': cardsProductParser,
  'columns-contact': columnsContactParser,
};

const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Telenet homepage with hero, promotional content, and product offerings',
  urls: ['https://www2.telenet.be'],
  blocks: [
    {
      name: 'hero-brand',
      instances: ['.divider-curve.divider-curve__up-at-bottom .background--accent .template-section'],
    },
    {
      name: 'cards-service',
      instances: ['#experiencefragment-199f2b4490 .cmp-responsivegrid'],
    },
    {
      name: 'columns-feature',
      instances: ['.divider-curve.divider-curve__up-at-top .background--neutral .grouping--2cols-unequal'],
    },
    {
      name: 'cards-promo',
      instances: ['.divider-curve.divider-curve__down-at-bottom .cmp-grouping .grouping--full-height'],
    },
    {
      name: 'cards-product',
      instances: ['.cmp-grouping > .grouping--4cols'],
    },
    {
      name: 'columns-contact',
      instances: ['.cmp-image-title-text'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Hero',
      selector: '.divider-curve.divider-curve__up-at-bottom',
      style: 'accent',
      blocks: ['hero-brand'],
      defaultContent: [],
    },
    {
      id: 'section-2',
      name: 'Service Finder',
      selector: ['.cmp-section:has(.heading--1:first-of-type)', '.cmp-section:nth-of-type(2)'],
      style: null,
      blocks: ['cards-service'],
      defaultContent: ['.cmp-title .heading--1'],
    },
    {
      id: 'section-3',
      name: 'Features',
      selector: '.divider-curve.divider-curve__up-at-top .background--neutral',
      style: 'neutral',
      blocks: ['columns-feature'],
      defaultContent: [],
    },
    {
      id: 'section-4',
      name: 'Promotions',
      selector: '.divider-curve.divider-curve__down-at-bottom',
      style: null,
      blocks: ['cards-promo'],
      defaultContent: ['.cmp-title .heading--1', '.cmp-button'],
    },
    {
      id: 'section-5',
      name: 'Products',
      selector: ['.cmp-section:has(.heading--1)', '.cmp-section:nth-of-type(5)'],
      style: null,
      blocks: ['cards-product'],
      defaultContent: ['.cmp-title .heading--1', '.text .cmp-text', '.cmp-button'],
    },
    {
      id: 'section-6',
      name: 'Help',
      selector: ['.cmp-section:has(.heading--2)', '.cmp-section:last-of-type'],
      style: null,
      blocks: ['columns-contact'],
      defaultContent: ['.cmp-title .heading--2', '.text .cmp-text'],
    },
  ],
};

const transformers = [
  cleanupTransformer,
  sectionsTransformer,
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    try {
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    } catch (e) {
      console.warn('adjustImageUrls failed (malformed URI), skipping:', e.message);
    }

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index'
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
