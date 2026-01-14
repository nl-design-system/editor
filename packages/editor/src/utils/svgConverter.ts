export const addSlotNameAndAriaHidden = (svg: string, slotName: string = 'iconStart') =>
  svg.replace('<svg', `<svg aria-hidden="true" slot="${slotName}" `);
