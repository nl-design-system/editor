const registeredIdentifiers = new Set<string>();

export const hasIdentifier = (identifier: string): boolean => registeredIdentifiers.has(identifier);

export const addIdentifier = (identifier: string): void => {
  registeredIdentifiers.add(identifier);
};

export const removeIdentifier = (identifier: string): void => {
  registeredIdentifiers.delete(identifier);
};

export const generateUniqueIdentifier = (candidate: string): string => {
  const base = candidate.replace(/-\d+$/, '');
  let counter = 1;
  let resolved = `${base}-${counter}`;
  while (registeredIdentifiers.has(resolved)) {
    resolved = `${base}-${++counter}`;
  }
  return resolved;
};
