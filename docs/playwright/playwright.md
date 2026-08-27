---
title: Playwright integratie
intro: Met de Playwright-integratie controleer je de gepubliceerde editor-uitvoer in een echte browser. De validator wordt in de pagina geïnjecteerd en draait tegen de live DOM, op dezelfde manier waarop @axe-core/playwright axe-core injecteert.
---

## Installatie

De integratie zit in het `@nl-design-system-community/clippy-a11y-validator` pakket, onder het
`/playwright` subpad. `@playwright/test` is een peer dependency: je gebruikt je eigen versie
(1.50 of hoger).

```bash
npm install --save-dev @nl-design-system-community/clippy-a11y-validator @playwright/test
```

> **Nog niet op npm:** het pakket is nog niet gepubliceerd. Binnen deze monorepo verwijs je ernaar met
> `"@nl-design-system-community/clippy-a11y-validator": "workspace:*"`; het commando hierboven werkt
> zodra de eerste versie is uitgebracht.

## Snel starten

`ClippyBuilder` is een fluent API in de stijl van `AxeBuilder`. Je geeft de Playwright `page` mee,
bakent optioneel het te controleren gebied af, en roept `validate()` aan.

```ts
import { test, expect } from '@playwright/test';
import ClippyBuilder from '@nl-design-system-community/clippy-a11y-validator/playwright';

test('editor-uitvoer is toegankelijk', async ({ page }) => {
  await page.goto('http://localhost:5173/preview');

  const results = await new ClippyBuilder({ page }).include('.clippy-content').validate();

  expect(results.validationItems).toEqual([]);
});
```

## De builder API

Alle instelmethoden geven de builder terug, dus je kunt ze aan elkaar rijgen. `validate()` sluit de
keten af en levert het rapport op.

```ts
const results = await new ClippyBuilder({ page })
  .include('.clippy-content') // beperk tot dit gebied (standaard: document.body)
  .enableRules(['image-must-have-alt-text']) // alleen deze regels (standaard: alle)
  .disableRules(['paragraph-should-not-resemble-list']) // sluit regels uit
  .settings({ topHeadingLevel: 2 }) // hoogst toegestane startkopniveau (standaard: 1)
  .validate();
```

| Methode               | Doel                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `include(selector)`   | Beperkt de validatie tot het eerste element dat op `selector` past. Zonder `include` wordt `document.body` gecontroleerd. |
| `enableRules(rules)`  | Beperkt de validatie tot de opgegeven regels. Accepteert kebab-case of SCREAMING_SNAKE_CASE.                              |
| `disableRules(rules)` | Sluit de opgegeven regels uit.                                                                                            |
| `settings(settings)`  | Instellingen die geen regel zijn, zoals `topHeadingLevel`.                                                                |
| `validate()`          | Injecteert de validator, draait deze tegen de live DOM en geeft een `ValidationReport`.                                   |

## Het rapport

`validate()` geeft een `ValidationReport` met één `validationItems` array. Elk item is gegroepeerd per
regel en somt de gevonden plekken op, net als bij axe-core:

```ts
{
  id: 'heading-must-not-be-empty',
  severity: 'error',
  description: 'Heading must not be empty',
  href: 'https://nldesignsystem.nl/...',
  nodes: [{ target: 'h1', html: '<h1></h1>' }],
}
```

`severity` is `'error'`, `'warning'` of `'info'`. `target` is een CSS-selector ten opzichte van de
gevalideerde root, `html` de afgekapte `outerHTML` van het element.

## Rapporteren en de build afkeuren

Dezelfde rapportage-helpers uit het hoofdpakket worden ook vanuit `/playwright` geëxporteerd, dus één
import dekt zowel het draaien als het rapporteren.

```ts
import ClippyBuilder, {
  assertNoValidationItems,
  countBySeverity,
  formatValidationItems,
  hasSeverityAtLeast,
} from '@nl-design-system-community/clippy-a11y-validator/playwright';

const results = await new ClippyBuilder({ page }).include('.clippy-content').validate();

// Leesbaar, terminal-vriendelijk overzicht.
console.info(formatValidationItems(results));

// Aantallen per severity, bijvoorbeeld { error: 1, warning: 0, info: 2 }.
countBySeverity(results);

// True zodra er een item op of boven deze drempel staat.
hasSeverityAtLeast(results, 'warning');

// Gooit een error met het opgemaakte rapport als bericht: de build-poort.
assertNoValidationItems(results, { failOn: 'error' });
```

`assertNoValidationItems` faalt standaard op `'error'`. Zet `failOn` op `'warning'` of `'info'` om
strenger te zijn. Omdat de foutmelding het volledige rapport is, staat in de Playwright-uitvoer
direct welke elementen het probleem veroorzaken.

## Playwright configuratie

Als je specs de pagina met `page.setContent()` vullen is er geen dev-server nodig:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  reporter: 'list',
  testDir: './tests',
});
```

Controleer je een draaiende applicatie, gebruik dan `webServer` en `use.baseURL` zoals gebruikelijk
bij Playwright, en navigeer met `page.goto()` naar de pagina die de editor-uitvoer rendert.

## Hoe het werkt

`validate()` leest in Node de dependency-vrije ESM-bundle van de validator, injecteert die als
object-URL module in de pagina, en draait `ClippyValidator` tegen het afgebakende element in de
browser. Omdat de validatie in de browser gebeurt, wordt de daadwerkelijk gerenderde DOM
gecontroleerd, inclusief wat client-side scripts hebben aangepast.

> **Content Security Policy:** de injectie gebruikt een `blob:` module. Pagina's die
> `script-src blob:` verbieden blokkeren dit. Controleer zulke pagina's tegen een build die zonder
> die restrictie wordt geserveerd, of via `page.setContent()`.

Omdat de validator zelf geen editor-, ProseMirror- of localisatie-afhankelijkheden heeft, kun je met
deze integratie ook uitvoer controleren die niet door de Clippy Editor is gemaakt.
