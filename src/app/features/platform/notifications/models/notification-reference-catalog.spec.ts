import { describe, expect, it } from 'vitest';
import {
  getNotificationReference,
  NOTIFICATION_REFERENCE_CATALOG,
} from '@features/platform/notifications/models/notification-reference-catalog';

describe('notification reference catalog', () => {
  it('maps every supported reference to an area and module', () => {
    expect(getNotificationReference('CATEGORY')).toEqual({
      areaKey: 'navigation.labels.catalog',
      sectionKey: null,
      moduleKey: 'navigation.labels.categories',
    });
    expect(getNotificationReference('INVOICE')).toEqual({
      areaKey: 'navigation.labels.finance',
      sectionKey: 'navigation.labels.billing',
      moduleKey: 'navigation.labels.invoices',
    });
    expect(getNotificationReference('PAYMENT')).toEqual({
      areaKey: 'navigation.labels.finance',
      sectionKey: 'navigation.labels.treasury',
      moduleKey: 'navigation.labels.accountsReceivable',
    });
  });

  it('returns no reference for an unknown type', () => {
    expect(getNotificationReference('UNKNOWN')).toBeNull();
  });

  it('allows aliases for the same module', () => {
    const values = Object.values(NOTIFICATION_REFERENCE_CATALOG);
    expect(new Set(values.map((value) => value.moduleKey)).size).toBe(20);
  });
});
