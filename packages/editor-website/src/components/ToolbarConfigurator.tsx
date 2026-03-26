import { ClippyEditor } from '@nl-design-system-community/editor-react';
import { TOOLBAR_ITEM, type ToolbarConfig } from '@nl-design-system-community/editor/toolbar';
import clipboardCheckIconSvg from '@tabler/icons/outline/clipboard-check.svg?raw';
import clipboardCopyIconSvg from '@tabler/icons/outline/clipboard-copy.svg?raw';
import plusIconSvg from '@tabler/icons/outline/plus.svg?raw';
import xIconSvg from '@tabler/icons/outline/x.svg?raw';
import { useState } from 'react';
import './ToolbarConfigurator.css';

const ITEM_LABELS: Record<string, string> = {
  [TOOLBAR_ITEM.ACCESSIBILITY_NOTIFICATIONS]: 'Toegankelijkheidsmeldingen',
  [TOOLBAR_ITEM.BOLD]: 'Vet',
  [TOOLBAR_ITEM.BULLET_LIST]: 'Ongenummerde lijst',
  [TOOLBAR_ITEM.CODE]: 'Code',
  [TOOLBAR_ITEM.DEFINITION_LIST]: 'Definitielijst',
  [TOOLBAR_ITEM.FORMAT_SELECT]: 'Opmaak selectie',
  [TOOLBAR_ITEM.HIGHLIGHT]: 'Markeren',
  [TOOLBAR_ITEM.HORIZONTAL_RULE]: 'Horizontale lijn',
  [TOOLBAR_ITEM.IMAGE_UPLOAD]: 'Afbeelding uploaden',
  [TOOLBAR_ITEM.INSERT_TABLE]: 'Tabel invoegen',
  [TOOLBAR_ITEM.ITALIC]: 'Cursief',
  [TOOLBAR_ITEM.KEYBOARD_SHORTCUTS]: 'Sneltoetsen',
  [TOOLBAR_ITEM.LANGUAGE_SELECT]: 'Taal selectie',
  [TOOLBAR_ITEM.LINK]: 'Link',
  [TOOLBAR_ITEM.ORDERED_LIST]: 'Genummerde lijst',
  [TOOLBAR_ITEM.REDO]: 'Opnieuw',
  [TOOLBAR_ITEM.STRIKE]: 'Doorhalen',
  [TOOLBAR_ITEM.SUBSCRIPT]: 'Subscript',
  [TOOLBAR_ITEM.SUPERSCRIPT]: 'Superscript',
  [TOOLBAR_ITEM.TEXT_ALIGN]: 'Uitlijning',
  [TOOLBAR_ITEM.TEXT_DIRECTION_LTR]: 'Tekstrichting LTR',
  [TOOLBAR_ITEM.TEXT_DIRECTION_RTL]: 'Tekstrichting RTL',
  [TOOLBAR_ITEM.UNDERLINE]: 'Onderstrepen',
  [TOOLBAR_ITEM.UNDO]: 'Ongedaan maken',
};

const ALL_ITEMS = Object.values(TOOLBAR_ITEM) as string[];

const INITIAL_GROUP: string[] = [
  TOOLBAR_ITEM.BOLD,
  TOOLBAR_ITEM.ITALIC,
  TOOLBAR_ITEM.UNDERLINE,
  TOOLBAR_ITEM.UNDO,
  TOOLBAR_ITEM.REDO,
];

export function ToolbarConfigurator() {
  const [groups, setGroups] = useState<string[][]>([INITIAL_GROUP]);
  const [copied, setCopied] = useState(false);

  const config: ToolbarConfig = groups.filter((items) => items.length > 0) as ToolbarConfig;
  const configJson = JSON.stringify(config, null, 2);

  function addGroup() {
    setGroups((prev) => [...prev, []]);
  }

  function handleClick(groupIndex: number) {
    setGroups((prev) => prev.filter((_, index) => index !== groupIndex));
  }

  function handleOnChange(groupIndex: number, e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = Array.from(e.currentTarget.selectedOptions).map(({ value }) => value);
    setGroups((prev) => prev.map((group, index) => (index === groupIndex ? selected : group)));
  }

  async function copyToClipboard() {
    await navigator.clipboard.writeText(configJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }

  return (
    <>
      <div className="clippy-toolbar-config-layout">
        <div className="clippy-toolbar-config-demo">
          <p className="utrecht-form-label" id="toolbar-config-label">
            Toolbar configuratie
          </p>

          <div className="clippy-toolbar-groups" aria-labelledby="toolbar-config-label">
            {groups.map((group, index) => (
              <div key={`${group.toString()}-${index}`} className="clippy-toolbar-group">
                <div className="clippy-toolbar-group__field">
                  <label className="clippy-toolbar-group__label" htmlFor={`clippy-group-${index}`}>
                    Groep {index + 1}
                  </label>

                  <select
                    id={`clippy-group-${index}`}
                    className="clippy-toolbar-group__select"
                    multiple
                    size={1}
                    value={group}
                    onChange={(e) => handleOnChange(index, e)}
                  >
                    {ALL_ITEMS.map((item) => (
                      <option key={item} value={item}>
                        {`${ITEM_LABELS[item] ?? item} (${item})`}
                      </option>
                    ))}
                  </select>

                  <clippy-button
                    type="button"
                    purpose="secondary"
                    size="small"
                    icon-only=""
                    className="clippy-toolbar-group__remove"
                    aria-label={`Verwijder groep ${index + 1}`}
                    onClick={() => handleClick(index)}
                  >
                    <clippy-icon slot="iconStart" dangerouslySetInnerHTML={{ __html: xIconSvg }} />
                  </clippy-button>
                </div>
              </div>
            ))}

            <clippy-button type="button" purpose="secondary" onClick={addGroup}>
              <clippy-icon slot="iconStart" dangerouslySetInnerHTML={{ __html: plusIconSvg }} />
              Groep toevoegen
            </clippy-button>
          </div>
        </div>

        <div className="clippy-config-snippet">
          <div className="clippy-config-snippet__header">
            <span className="clippy-config-snippet__label">toolbarConfig</span>

            <clippy-button type="button" purpose="secondary" size="small" onClick={copyToClipboard}>
              <clippy-icon
                slot="iconStart"
                dangerouslySetInnerHTML={{
                  __html: copied ? clipboardCheckIconSvg : clipboardCopyIconSvg,
                }}
              />
              Kopiëren
            </clippy-button>
          </div>

          <pre className="clippy-config-snippet__pre">
            <code>{configJson}</code>
          </pre>
        </div>
      </div>
      <ClippyEditor toolbarConfig={config}>
        <div slot="value">
          <h1>Live configuratie demo</h1>
          <p>Pas de opties aan om de toolbar live te wijzigen.</p>
        </div>
      </ClippyEditor>
    </>
  );
}
