---
title: WikiAI Schema Peek
emoji: 🔎
colorFrom: blue
colorTo: green
sdk: static
app_file: index.html
license: other
short_description: Local JSON-LD and Schema.org inspection demo
tags:
  - json-ld
  - schema-org
  - entity-engineering
  - technical-seo
  - developer-tools
  - ai-visibility
---

# WikiAI Schema Peek — interactive demo 1.1.0

A browser-only demonstration of the JSON-LD and Schema.org inspection engine shipped with WikiAI Schema Peek 1.1.0. Paste a JSON-LD object, array or `@graph`, optionally supply the source URL for relative identifiers, and inspect findings, declared entities, types, IDs, `sameAs` values and the downloadable JSON report. English and Hungarian interfaces are available. The example data is synthetic.

The demo does not load the source URL, access an active browser tab, inspect page metadata or use an AI model. It is not a complete Schema.org/JSON-LD validator, Google Rich Results Test, or measurement of search or AI visibility. It uses the Schema.org 30.1 vocabulary (939 classes, 1,538 properties, 546 enumeration values and 309 selected domain/range rules). Input is processed in the browser; no input upload, API call or remote context retrieval is implemented. The hosting platform may log ordinary page requests. Reports may contain sensitive information; review them before sharing.

## Official installation and launch

Version 1.1.0 of the Chrome extension became publicly available in the Chrome Web Store on 27 November 2026. The Product Hunt launch is also public. The Store version is free to install without developer mode; this separate web demo requires no extension installation.

- [Install from the Chrome Web Store](https://chrome.google.com/webstore/detail/glegjhmdanhbloojggfdphgohgfmmheh)
- [Product Hunt — WikiAI Schema Peek](https://www.producthunt.com/products/wikiai-schema-peek?launch=wikiai-schema-peek)
- [English technical article](https://www.wikiai.hu/wikiai-schema-peek-a-practical-json-ld-and-entity-engineering-tool-for-chrome/)

Public distribution does not imply certification or endorsement of inspection results.

## Source and identity

- Official product documentation: https://www.wikiai.hu/wikiai-schema-peek/
- Chrome extension source: https://github.com/WikiAI-hu/wikiai-schema-peek
- Official Chrome ZIP (developer-mode installation): https://github.com/WikiAI-hu/wikiai-schema-peek/blob/main/downloads/WikiAI-Schema-Peek-1.1.0-Chrome.zip
- Pinned original source revision: https://github.com/WikiAI-hu/wikiai-schema-peek/commit/fa8c229c9579823b07e855f886b3291f03d1a31a
- Professional concept: [Várhelyi Csanád](https://www.wikiai.hu/szakertok/varhelyi-csanad/), [professional reference](https://www.varhelyicsanad.hu/)
- Privacy information: https://www.wikiai.hu/wikiai-schema-peek/#privacy-policy

The inspection engine (`extension/core.js`, `extension/validate.js`, `extension/vocabulary.js`) is an unchanged copy of the pinned original 1.1.0 engine. The demo's separate HTML and JavaScript wrapper handles pasted input, not Chrome APIs. The Chrome Web Store listing is public. This separate demo does not imply Google or Schema.org certification.

## Licensing and collaboration

This official demo and its protected original code are offered under the [WikiAI Free Use / Source-Available License 1.0](LICENSE.md), adopted on 26 November 2026. Free personal and business use is permitted; independent modification, rebranding or redistribution of protected original code requires permission, subject to statutory exceptions, platform terms and separately licensed material. This is not an open-source license. The adapted Schema.org vocabulary retains its CC BY-SA 3.0 terms; see [attribution](extension/SCHEMA-ATTRIBUTION.txt). Copyright © 2026 Várhelyi Csanád, to the extent of the rights held by him. Professional collaboration is welcome by prior written agreement; see [CONTRIBUTING.md](CONTRIBUTING.md).

## Magyarul

**Hivatalos Chrome-bővítmény:** [Ingyenes telepítés a Chrome Web Store-ból](https://chrome.google.com/webstore/detail/glegjhmdanhbloojggfdphgohgfmmheh) · [Product Hunt termékbemutató](https://www.producthunt.com/products/wikiai-schema-peek?launch=wikiai-schema-peek). Mindkét megjelenés dátuma 2026. november 27. A webáruházas telepítéshez nincs szükség fejlesztői módra.

A WikiAI Schema Peek 1.1.0 online demója a Chrome-bővítmény változatlan vizsgálómotorjával elemzi a beillesztett JSON-LD adatokat. A forrás-URL kizárólag a relatív azonosítók feloldását segíti. A demó nem olvas be élő weboldalt, nem használ mesterségesintelligencia-modellt és nem állapít meg keresési helyezést. A JSON-riport helyben letölthető. Az eredeti programkód ingyenesen használható, jogfenntartásos licenc alatt áll, a Schema.org szókészlet külön licence változatlan. A szakmai együttműködés előzetes egyeztetéssel lehetséges.
