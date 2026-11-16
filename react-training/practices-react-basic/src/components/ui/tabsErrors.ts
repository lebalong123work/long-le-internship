export const TABS_ERRORS = {
  emptyItems: 'Tabs needs at least one item',
  blankLabel: 'Tabs label and every tab label must be non-empty strings',
  duplicateId: 'Tabs item ids must be unique',
  unknownActiveId: 'Tabs activeId must be the id of one of the items',
} as const
