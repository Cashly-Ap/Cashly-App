import { MenuItem } from '@core/layouts/models';
import { PermissionAction } from '@features/platform/auth/authorization/models/access.model';
import { BusinessModule } from '@features/platform/auth/user/models/enums/business-module.enum';
import { buildMenuItems, MenuCallbacks } from '@core/layouts/config/menu.config';

export interface MenuAreaOrder {
  area: string;
  modules: readonly BusinessModule[];
}

export interface MenuUseCase {
  label: string;
  module: BusinessModule;
  action: PermissionAction;
}

const noop = (): void => undefined;

const contractCallbacks: MenuCallbacks = {
  openListAction: noop,
  openCustomerEditPicker: noop,
  openCustomerBalancePicker: noop,
  openSupplierBalancePicker: noop,
  openCatalogModal: noop,
  openCommercialCatalogModal: noop,
  openStockModal: noop,
  openMovementsModal: noop,
  openOrdersPdfModal: noop,
  openInvoicesPdfModal: noop,
  openQuotesPdfModal: noop,
  openAccountsReceivablePdfModal: noop,
  openAccountsPayablePdfModal: noop,
  openCashRegisterModal: noop,
  openPurchasesPdfModal: noop,
  openCompanyAuditHistory: noop,
};

function collectModules(items: MenuItem[]): BusinessModule[] {
  return items.flatMap((item) => [
    ...(item.requiredModule ? [item.requiredModule] : []),
    ...collectModules(item.children ?? []),
  ]);
}

function pageModules(items: MenuItem[]): BusinessModule[] {
  return items.flatMap((item) => [
    ...(item.routerLink && item.requiredModule ? [item.requiredModule] : []),
    ...pageModules(item.children ?? []),
  ]);
}

const navbar = buildMenuItems(contractCallbacks);
const ownedByPage = new Set(navbar.flatMap((area) => pageModules(area.children ?? [])));

export const MENU_AREA_ORDER: readonly MenuAreaOrder[] = navbar.map((area) => {
  const own = new Set(pageModules(area.children ?? []));
  const modules = collectModules(area.children ?? []).filter(
    (module) => own.has(module) || !ownedByPage.has(module),
  );
  return { area: area.label, modules: [...new Set(modules)] };
});
