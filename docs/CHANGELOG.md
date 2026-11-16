# Changelog

Notable changes to the Cashly frontend. The project does not publish versioned releases yet; entries are grouped by change type.

## Unreleased

### Added

- Authorization guide documenting the permission model, directive, guards, and URL-to-module mapping.
- Company module documentation, including company/PDF logo endpoints and preview flow.
- Frontend infrastructure guide for core and shared code.
- Internationalization guide.
- Consolidated API reference.
- Documentation index, contribution guide, and changelog.
- Shared reusable UI patterns: list filters, panel cards, status badges, metric cards, back/cancel/submit buttons, paginator, skeletons, and report modals.
- Purchase cancellation for draft and confirmed purchases.

### Changed

- Documentation aligned with the business-area feature structure (`analytics`, `catalog`, `finance`, `inventory`, `partners`, `platform`, `procurement`, `sales`).
- Route documentation updated to area-prefixed URLs with legacy redirects.
- Detail actions aligned with list actions across modules.
- Path aliases used consistently across imports.
- Payment terms and form actions unified and translated.

### Fixed

- Module root permissions enforced in the role editor.
- Titled panel cards project their content correctly.
- Pending-tabs tooltip translated.
- Composite stock details neutralized in inventory.
- Remaining user-facing texts translated.

### Removed

- Deprecated module docs: merchants, differentials, collections, and payables.
- Duplicate agent specs under `.codex/agents` and `docs/agents`.
- Dead components and legacy code.
- Unused SSR setup.

---

## Related documentation

- [Documentation index](README.md)
- [Contributing](CONTRIBUTING.md)
- [Architecture](ARCHITECTURE.md)
