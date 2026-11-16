# Role permission editor

## Intent

Reduce the repetitive work required to configure a role without changing the API, supported permission registry, delegation ceiling or system administrator policy. The role form keeps the customer-style container, tabs and explicit Save action.

## Presentation and behavior

Replace the wide checkbox matrix with full-width module cards. Provide module search, per-module No access / Read only / Custom / All allowed presets, and explicit global Read only / All allowed / Clear controls. Show concise Spanish action names and descriptions and omit unsupported actions. Report the selection using supported permission counts.

Preset and custom changes only update the form draft. Saving remains an explicit action. There is no automatic grant of permissions in other modules, no hardcoded department/job role and no backend policy change. Cross-module stock/export requirements remain explained without granting extra access silently.

## Acceptance

- Given an editable role and delegable registry, a module preset updates its supported actions in one operation and leaves unrelated modules unchanged.
- Given a global preset, only supported actions within the actor's ceiling can be added. READ is required for every nonempty module.
- Given a protected role, a read-only form or an in-flight save, every editing path is disabled, including direct preset and toggle handlers.
- Given an unsupported or nondelegable action, direct calls cannot add it to the draft. A module without delegable READ cannot receive any action.
- Given search results, bulk controls clearly retain their documented scope and do not silently operate on an ambiguous subset.
- Given desktop or mobile widths, cards and controls remain usable without the old horizontal checkbox table.

## Verification

Focused preset/security-boundary tests, production Angular build and browser checks of actual role creation/editing are required. Browser checks must not save grants or alter real roles. Verification results are recorded below. This request does not include a new commit or push.

## Executed verification — 2026-10-19

- Docker focused role/editor tests: 23 passed. Production Angular build passed; existing STOMP CommonJS optimization warning only.
- Read-only security review: no blocking findings; direct preset/toggle calls remain constrained by registry, actor ceiling, READ, protected roles and busy/read-only state.
- Browser: global read preset changed 0 to 10 accessible modules; search filtered Catálogo using `Catalogo`; custom CREATE retained READ; Personalizar opened/closed without changing grants; desktop 1440px and mobile 390px controls were checked. No role was saved or created.
- Screenshot retained in parent workspace: `artifacts/design-check/role-permissions-editor.png`. Whitespace validation passed. No commit or push performed for this request.
