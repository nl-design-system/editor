const releaseTagPrefixes: Record<string, string> = {
  '@nl-design-system-community/drupal-ckeditor-plugin': 'clippy-drupal',
  '@nl-design-system-community/typo3-ckeditor-plugin': 'clippy-typo3',
};

export const releaseUrl = ({ name, version }: { name: string; version: string }): string | undefined => {
  const prefix = releaseTagPrefixes[name];
  if (!prefix) return undefined;
  const tag = encodeURIComponent(`${prefix}@${version}`);
  return `https://github.com/nl-design-system/editor/releases/tag/${tag}`;
};
