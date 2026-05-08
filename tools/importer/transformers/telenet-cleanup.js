/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Telenet site-wide cleanup.
 * Removes non-authorable content from www2.telenet.be pages.
 * All selectors verified against captured DOM (migration-work/cleaned.html).
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie consent banner (found: #onetrust-consent-sdk at line 4274)
    // Remove Usabilla feedback widget (found: #lightningjs-usabilla_live at line 2)
    // Remove chat overlay widget (found: .chat-overlay at line 3855)
    // Remove hidden elements that block parsing (found: .display--none at lines 26, 63, 3928)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#lightningjs-usabilla_live',
      '.chat-overlay',
      '.display--none',
    ]);
  }

  if (hookName === H.after) {
    // Remove header (found: <header> at line 69, contains wink-global-header)
    // Remove footer (found: <footer> at lines 4008, 4012)
    // Remove framework custom elements (found throughout DOM)
    // Remove iframes (found: various at lines 4, 3910, 4533, 4540, 4548, 4552, 4555)
    // Remove link elements (found: CSS links at lines 71, 2500, 3941, 4078)
    // Remove hidden inputs used by chat/tracking (found: #AmeliaUrl etc. at lines 3934-3938)
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'ndc-dynamic',
      'tg-nba-monitor',
      'tg-redirection',
      'tg-config',
      'ocapi-config',
      'omapi-config',
      'form-config',
      'tg-contexthub-stores',
      'tg-contact-touchpoint-scripts-dependency',
      'tg-engagement-support-embedded-chat',
      'tg-lazy-loading-standalone',
      'iframe',
      'link',
      'noscript',
      'input[id="AmeliaUrl"]',
      'input[id="AmeliaBundle"]',
      'input[id="AmeliaDomainCode"]',
      'input[id="pageLanguage"]',
      'input[id="environment"]',
    ]);
  }
}
