/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-brand.js
  function parse(element, { document }) {
    const heading = element.querySelector('h1, h2, [class*="heading--0"], [class*="heading--1"]');
    const description = element.querySelector(".cmp-text p, .text p");
    const ctaLink = element.querySelector("tg-button a[href], a.button--primary[href], a.button[href]");
    const image = element.querySelector("img.cmp-image__image, .cmp-image img, img[src]");
    const cells = [];
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(" field:image "));
    if (image) {
      imageCell.appendChild(image);
    }
    cells.push([imageCell]);
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(" field:text "));
    if (heading) textCell.appendChild(heading);
    if (description) textCell.appendChild(description);
    if (ctaLink) textCell.appendChild(ctaLink);
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-brand", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-service.js
  function parse2(element, { document }) {
    const grouping = element.querySelector(".cmp-grouping .grouping--full-height");
    if (!grouping) {
      const cells2 = [["", ""]];
      const block2 = WebImporter.Blocks.createBlock(document, { name: "cards-service", cells: cells2 });
      element.replaceWith(block2);
      return;
    }
    const cells = [];
    const imageCell = buildImageCell(grouping, document);
    const textCell = buildTextCell(grouping, document);
    cells.push([imageCell, textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-service", cells });
    element.replaceWith(block);
  }
  function buildImageCell(container, document) {
    const frag = document.createDocumentFragment();
    const picture = container.querySelector("picture");
    const img = container.querySelector('img:not([src=""]):not(a img)');
    const svg = container.querySelector("svg:not(a svg)");
    if (picture) {
      frag.appendChild(document.createComment(" field:image "));
      frag.appendChild(picture);
    } else if (img) {
      frag.appendChild(document.createComment(" field:image "));
      const parentPicture = img.closest("picture");
      frag.appendChild(parentPicture || img);
    } else if (svg) {
      frag.appendChild(document.createComment(" field:image "));
      frag.appendChild(svg);
    }
    return frag;
  }
  function buildTextCell(container, document) {
    const frag = document.createDocumentFragment();
    let hasContent = false;
    frag.appendChild(document.createComment(" field:text "));
    const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6");
    headings.forEach((heading) => {
      const text = heading.textContent.trim();
      if (text) {
        frag.appendChild(heading);
        hasContent = true;
      }
    });
    const cmpTextParagraphs = container.querySelectorAll(".cmp-text p");
    if (cmpTextParagraphs.length > 0) {
      cmpTextParagraphs.forEach((p) => {
        const text = p.textContent.trim();
        if (text && text !== "\xA0") {
          frag.appendChild(p);
          hasContent = true;
        }
      });
    }
    const addedHrefs = /* @__PURE__ */ new Set();
    const renderedLinks = container.querySelectorAll("tg-button a[href], .cmp-button a[href]");
    renderedLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const linkText = link.textContent.trim();
      if (!linkText || !href || isPermanentlyHidden(link) || addedHrefs.has(href)) return;
      addedHrefs.add(href);
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = href;
      a.textContent = linkText;
      p.appendChild(a);
      frag.appendChild(p);
      hasContent = true;
    });
    if (addedHrefs.size === 0) {
      const lazyLoaders = container.querySelectorAll("tg-lazy-loading[inputs]");
      lazyLoaders.forEach((loader) => {
        try {
          const inputsAttr = loader.getAttribute("inputs");
          const pathsAttr = loader.getAttribute("paths-href");
          if (!inputsAttr || !pathsAttr) return;
          const inputs = JSON.parse(inputsAttr);
          const paths = JSON.parse(pathsAttr);
          const title = inputs.title;
          const href = paths.defaultPath || paths.loginPath || paths.salesPath;
          if (title && href && !addedHrefs.has(href)) {
            addedHrefs.add(href);
            const p = document.createElement("p");
            const a = document.createElement("a");
            a.href = href;
            a.textContent = title;
            p.appendChild(a);
            frag.appendChild(p);
            hasContent = true;
          }
        } catch (e) {
        }
      });
    }
    if (addedHrefs.size === 0) {
      const buttonLinks = container.querySelectorAll("a.button[href]");
      buttonLinks.forEach((link) => {
        const href = link.getAttribute("href");
        const linkText = link.textContent.trim();
        if (!linkText || linkText === "\xA0" || !href || isPermanentlyHidden(link) || addedHrefs.has(href)) return;
        addedHrefs.add(href);
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = href;
        a.textContent = linkText;
        p.appendChild(a);
        frag.appendChild(p);
        hasContent = true;
      });
    }
    if (!hasContent) {
      return document.createDocumentFragment();
    }
    return frag;
  }
  function isPermanentlyHidden(el) {
    return !!(el.closest(".display--none-important") || el.classList.contains("visibility--hide-only") || el.closest(".visibility--hide-only"));
  }

  // tools/importer/parsers/columns-feature.js
  function parse3(element, { document }) {
    let leftCol = null;
    let rightCol = null;
    const isColumnElement = element.classList && element.classList.contains("grouping--2cols-unequal");
    if (isColumnElement) {
      const parent = element.parentElement;
      const siblings = parent ? Array.from(parent.querySelectorAll(":scope > .grouping--2cols-unequal")) : [];
      if (siblings.length >= 2) {
        leftCol = siblings[0];
        rightCol = siblings[1];
      } else {
        leftCol = element;
      }
    } else {
      const columns = Array.from(element.querySelectorAll(".grouping--2cols-unequal"));
      if (columns.length >= 2) {
        leftCol = columns[0];
        rightCol = columns[1];
      } else if (columns.length === 1) {
        leftCol = columns[0];
      }
    }
    const leftContent = document.createDocumentFragment();
    if (leftCol) {
      const mainImage = leftCol.querySelector("img.cmp-image__image, .cmp-image img, img[src]");
      if (mainImage) {
        leftContent.appendChild(mainImage);
      }
    }
    const rightContent = document.createDocumentFragment();
    if (rightCol) {
      const heading = rightCol.querySelector('h2, h1, [class*="heading--1"], [class*="heading--0"]');
      if (heading) {
        rightContent.appendChild(heading);
      }
      const featureItems = Array.from(
        rightCol.querySelectorAll(".cmp-image-title-text")
      );
      featureItems.forEach((item) => {
        const container = document.createElement("div");
        const icon = item.querySelector("img.cmp-image__image, .cmp-image img, img[src]");
        if (icon) {
          container.appendChild(icon);
        }
        const title = item.querySelector('[class*="heading--3"], .cmp-title [class*="heading"]');
        if (title) {
          container.appendChild(title);
        }
        const desc = item.querySelector(".cmp-text p");
        if (desc) {
          container.appendChild(desc);
        } else {
          const descContainer = item.querySelector(".cmp-text");
          if (descContainer) {
            container.appendChild(descContainer);
          }
        }
        if (container.childNodes.length > 0) {
          rightContent.appendChild(container);
        }
      });
      const ctaButtons = Array.from(
        rightCol.querySelectorAll("a[href].button, a[href].button--primary, tg-button a[href], .cmp-button a[href]")
      );
      ctaButtons.forEach((btn) => {
        rightContent.appendChild(btn);
      });
    }
    const cells = [[leftContent, rightContent]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  function parse4(element, { document }) {
    const cardWrappers = element.querySelectorAll('.box--hoverable, [class*="box--hoverable"]');
    const cells = [];
    cardWrappers.forEach((card) => {
      const badgeEl = card.querySelector(".cmp-badge .hidden-mobile p, .cmp-badge p.font--body-small");
      const headingContainer = card.querySelector('[class*="heading--2"], .cmp-title div[class*="heading"]');
      const headingEl = headingContainer ? headingContainer.querySelector("b") || headingContainer : null;
      const descEl = card.querySelector(".cmp-text p, .cmp-text");
      const ctaEl = card.querySelector('.cmp-button a, a.cmp-button__link, .cmp-button [href], a[class*="button"]');
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      if (badgeEl) {
        const badgePara = document.createElement("p");
        badgePara.textContent = badgeEl.textContent.trim();
        badgePara.setAttribute("class", "badge");
        textFrag.appendChild(badgePara);
      }
      if (headingEl) {
        const headingPara = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = headingEl.textContent.trim();
        headingPara.appendChild(strong);
        textFrag.appendChild(headingPara);
      }
      if (descEl) {
        const descPara = document.createElement("p");
        descPara.textContent = descEl.textContent.trim();
        textFrag.appendChild(descPara);
      }
      if (ctaEl) {
        const link = document.createElement("a");
        link.href = ctaEl.href || ctaEl.getAttribute("href") || "";
        link.textContent = ctaEl.textContent.trim() || "Meer info";
        textFrag.appendChild(link);
      }
      cells.push(["", textFrag]);
    });
    if (cells.length === 0) {
      const altCards = element.querySelectorAll('.cmp-responsivegrid > [class*="background--accent"], .cmp-responsivegrid [class*="tg-grid--padding-y-large"]');
      altCards.forEach((card) => {
        const badgeEl = card.querySelector(".cmp-badge p");
        const headingEl = card.querySelector('[class*="heading--2"] b, [class*="heading--2"]');
        const descEl = card.querySelector(".cmp-text p");
        const ctaEl = card.querySelector('.cmp-button a, a[class*="button"]');
        const textFrag = document.createDocumentFragment();
        textFrag.appendChild(document.createComment(" field:text "));
        if (badgeEl) {
          const badgePara = document.createElement("p");
          badgePara.textContent = badgeEl.textContent.trim();
          badgePara.setAttribute("class", "badge");
          textFrag.appendChild(badgePara);
        }
        if (headingEl) {
          const headingPara = document.createElement("p");
          const strong = document.createElement("strong");
          strong.textContent = headingEl.textContent.trim();
          headingPara.appendChild(strong);
          textFrag.appendChild(headingPara);
        }
        if (descEl) {
          const descPara = document.createElement("p");
          descPara.textContent = descEl.textContent.trim();
          textFrag.appendChild(descPara);
        }
        if (ctaEl) {
          const link = document.createElement("a");
          link.href = ctaEl.href || ctaEl.getAttribute("href") || "";
          link.textContent = ctaEl.textContent.trim() || "Meer info";
          textFrag.appendChild(link);
        }
        cells.push(["", textFrag]);
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function parse5(element, { document }) {
    const columns = element.querySelectorAll('[class*="aem-GridColumn--default--3"]');
    const cells = [];
    columns.forEach((col) => {
      const img = col.querySelector("img");
      const textContainer = col.querySelector(".cmp-text");
      if (!img || !textContainer) return;
      const imageLink = col.querySelector("a.cmp-image__link, .cmp-image a, .box--hoverable a");
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      if (imageLink) {
        imageCell.appendChild(imageLink.cloneNode(true));
      } else {
        imageCell.appendChild(img.cloneNode(true));
      }
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      const paragraphs = textContainer.querySelectorAll("p");
      paragraphs.forEach((p) => {
        textCell.appendChild(p.cloneNode(true));
      });
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-contact.js
  function parse6(element, { document }) {
    var _a;
    if (element.getAttribute("data-columns-contact-processed")) {
      element.remove();
      return;
    }
    let partner = null;
    let next = element.nextElementSibling;
    if (next && (next.classList.contains("cmp-image-title-text") || next.querySelector(".cmp-image-title-text"))) {
      partner = next.classList.contains("cmp-image-title-text") ? next : next.querySelector(".cmp-image-title-text");
    }
    if (!partner) {
      const searchRoot = ((_a = element.parentElement) == null ? void 0 : _a.parentElement) || element.parentElement || element;
      const allItems = Array.from(searchRoot.querySelectorAll(".cmp-image-title-text"));
      const idx = allItems.indexOf(element);
      if (idx >= 0 && idx + 1 < allItems.length) {
        const candidate = allItems[idx + 1];
        if (!candidate.getAttribute("data-columns-contact-processed")) {
          partner = candidate;
        }
      }
    }
    if (!partner) {
      const allItems = Array.from(document.querySelectorAll(".cmp-image-title-text"));
      const idx = allItems.indexOf(element);
      if (idx >= 0 && idx + 1 < allItems.length) {
        const candidate = allItems[idx + 1];
        if (!candidate.getAttribute("data-columns-contact-processed")) {
          partner = candidate;
        }
      }
    }
    if (partner) {
      partner.setAttribute("data-columns-contact-processed", "true");
    }
    function extractColumnContent(item) {
      const cellContent = [];
      const img = item.querySelector(".cmp-image__image, img");
      if (img) {
        cellContent.push(img);
      }
      const link = item.querySelector("a");
      if (link) {
        cellContent.push(link);
      } else {
        const heading = item.querySelector("h3, .heading--2, .heading--3, .cmp-title div, .cmp-title h3");
        if (heading) {
          cellContent.push(heading);
        }
        const text = item.querySelector(".cmp-text p, .cmp-text");
        if (text) {
          cellContent.push(text);
        }
      }
      return cellContent;
    }
    const col1 = extractColumnContent(element);
    const col2 = partner ? extractColumnContent(partner) : [];
    const cells = [[col1, col2]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-contact", cells });
    element.replaceWith(block);
    if (partner && partner.parentNode) {
      partner.remove();
    }
  }

  // tools/importer/transformers/telenet-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#lightningjs-usabilla_live",
        ".chat-overlay",
        ".display--none"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "ndc-dynamic",
        "tg-nba-monitor",
        "tg-redirection",
        "tg-config",
        "ocapi-config",
        "omapi-config",
        "form-config",
        "tg-contexthub-stores",
        "tg-contact-touchpoint-scripts-dependency",
        "tg-engagement-support-embedded-chat",
        "tg-lazy-loading-standalone",
        "iframe",
        "link",
        "noscript",
        'input[id="AmeliaUrl"]',
        'input[id="AmeliaBundle"]',
        'input[id="AmeliaDomainCode"]',
        'input[id="pageLanguage"]',
        'input[id="environment"]'
      ]);
    }
  }

  // tools/importer/transformers/telenet-sections.js
  var H2 = { after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const { document } = payload;
      const sections = payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        let selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
        if (section.id === "section-3") {
          selectors = [".divider-curve.divider-curve__up-at-top"];
        }
        let sectionEl = null;
        for (const sel of selectors) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) continue;
        const parentSection = sectionEl.closest(".cmp-section");
        const targetEl = parentSection || sectionEl;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          targetEl.after(metaBlock);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          targetEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-brand": parse,
    "cards-service": parse2,
    "columns-feature": parse3,
    "cards-promo": parse4,
    "cards-product": parse5,
    "columns-contact": parse6
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Telenet homepage with hero, promotional content, and product offerings",
    urls: ["https://www2.telenet.be"],
    blocks: [
      {
        name: "hero-brand",
        instances: [".divider-curve.divider-curve__up-at-bottom .background--accent .template-section"]
      },
      {
        name: "cards-service",
        instances: ["#experiencefragment-199f2b4490 .cmp-responsivegrid"]
      },
      {
        name: "columns-feature",
        instances: [".divider-curve.divider-curve__up-at-top .background--neutral .grouping--2cols-unequal"]
      },
      {
        name: "cards-promo",
        instances: [".divider-curve.divider-curve__down-at-bottom .cmp-grouping .grouping--full-height"]
      },
      {
        name: "cards-product",
        instances: [".cmp-grouping > .grouping--4cols"]
      },
      {
        name: "columns-contact",
        instances: [".cmp-image-title-text"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero",
        selector: ".divider-curve.divider-curve__up-at-bottom",
        style: "accent",
        blocks: ["hero-brand"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Service Finder",
        selector: [".cmp-section:has(.heading--1:first-of-type)", ".cmp-section:nth-of-type(2)"],
        style: null,
        blocks: ["cards-service"],
        defaultContent: [".cmp-title .heading--1"]
      },
      {
        id: "section-3",
        name: "Features",
        selector: ".divider-curve.divider-curve__up-at-top .background--neutral",
        style: "neutral",
        blocks: ["columns-feature"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Promotions",
        selector: ".divider-curve.divider-curve__down-at-bottom",
        style: null,
        blocks: ["cards-promo"],
        defaultContent: [".cmp-title .heading--1", ".cmp-button"]
      },
      {
        id: "section-5",
        name: "Products",
        selector: [".cmp-section:has(.heading--1)", ".cmp-section:nth-of-type(5)"],
        style: null,
        blocks: ["cards-product"],
        defaultContent: [".cmp-title .heading--1", ".text .cmp-text", ".cmp-button"]
      },
      {
        id: "section-6",
        name: "Help",
        selector: [".cmp-section:has(.heading--2)", ".cmp-section:last-of-type"],
        style: null,
        blocks: ["columns-contact"],
        defaultContent: [".cmp-title .heading--2", ".text .cmp-text"]
      }
    ]
  };
  var transformers = [
    transform,
    transform2
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      try {
        WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      } catch (e) {
        console.warn("adjustImageUrls failed (malformed URI), skipping:", e.message);
      }
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
