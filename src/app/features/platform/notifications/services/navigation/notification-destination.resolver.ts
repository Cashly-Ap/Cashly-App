import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

export type NotificationReferenceType = 'PAYMENT' | 'QUOTE' | 'ORDER';

interface NotificationDestination {
  collection: string;
  resourceId: string | null;
}

const COLLECTION_BY_REFERENCE_TYPE: Record<NotificationReferenceType, string> = {
  PAYMENT: '/finance/treasury/receivables',
  QUOTE: '/sales/quotes',
  ORDER: '/sales/orders',
};

@Injectable({ providedIn: 'root' })
export class NotificationDestinationResolver {
  private readonly router = inject(Router);

  async navigate(referenceType: string | null, referenceId: string | null): Promise<void> {
    if (referenceType === 'PAYMENT') {
      await this.navigateToReceivables(referenceId);
      return;
    }

    const destination = this.resolve(referenceType, referenceId);
    if (!destination) return;

    if (!destination.resourceId) {
      await this.navigateToCollection(destination.collection);
      return;
    }

    try {
      const navigated = await this.router.navigate([
        destination.collection,
        destination.resourceId,
      ]);
      if (!navigated) await this.navigateToCollection(destination.collection);
    } catch {
      await this.navigateToCollection(destination.collection);
    }
  }

  private resolve(
    referenceType: string | null,
    resourceId: string | null,
  ): NotificationDestination | null {
    if (!this.isSupportedReferenceType(referenceType)) return null;
    return { collection: COLLECTION_BY_REFERENCE_TYPE[referenceType], resourceId };
  }

  private async navigateToCollection(collection: string): Promise<void> {
    try {
      await this.router.navigate([collection]);
    } catch {
      return;
    }
  }

  private async navigateToReceivables(resourceId: string | null): Promise<void> {
    const queryParams = resourceId ? { tab: 'pending', focus: resourceId } : { tab: 'pending' };
    try {
      await this.router.navigate(['/finance/treasury/receivables'], { queryParams });
    } catch {
      return;
    }
  }

  private isSupportedReferenceType(
    referenceType: string | null,
  ): referenceType is NotificationReferenceType {
    return referenceType === 'PAYMENT' || referenceType === 'QUOTE' || referenceType === 'ORDER';
  }
}
