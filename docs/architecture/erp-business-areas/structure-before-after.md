# Angular complete source structures

## Before

```text
└── src
    ├── app
    │   ├── core
    │   │   ├── exceptions
    │   │   │   ├── http-error.handler.spec.ts
    │   │   │   ├── http-error.handler.ts
    │   │   │   └── index.ts
    │   │   ├── forms
    │   │   │   ├── base
    │   │   │   │   ├── base-form.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── components
    │   │   │   │   ├── cards
    │   │   │   │   │   ├── field-group
    │   │   │   │   │   │   ├── field-group.component.html
    │   │   │   │   │   │   ├── field-group.component.spec.ts
    │   │   │   │   │   │   └── field-group.component.ts
    │   │   │   │   │   ├── form-card
    │   │   │   │   │   │   ├── form-card.component.html
    │   │   │   │   │   │   ├── form-card.component.spec.ts
    │   │   │   │   │   │   └── form-card.component.ts
    │   │   │   │   │   ├── form-container
    │   │   │   │   │   │   ├── form-container.component.html
    │   │   │   │   │   │   ├── form-container.component.spec.ts
    │   │   │   │   │   │   └── form-container.component.ts
    │   │   │   │   │   ├── section-card
    │   │   │   │   │   │   ├── section-card.component.html
    │   │   │   │   │   │   ├── section-card.component.spec.ts
    │   │   │   │   │   │   └── section-card.component.ts
    │   │   │   │   │   ├── tab-content
    │   │   │   │   │   │   ├── tab-content.component.html
    │   │   │   │   │   │   ├── tab-content.component.spec.ts
    │   │   │   │   │   │   └── tab-content.component.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── dynamic-lists
    │   │   │   │   │   ├── list-item
    │   │   │   │   │   │   ├── list-item.component.html
    │   │   │   │   │   │   ├── list-item.component.spec.ts
    │   │   │   │   │   │   └── list-item.component.ts
    │   │   │   │   │   ├── list-section
    │   │   │   │   │   │   ├── list-section.component.html
    │   │   │   │   │   │   ├── list-section.component.spec.ts
    │   │   │   │   │   │   └── list-section.component.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── headers
    │   │   │   │   │   ├── form-actions
    │   │   │   │   │   │   ├── form-actions.component.html
    │   │   │   │   │   │   ├── form-actions.component.spec.ts
    │   │   │   │   │   │   └── form-actions.component.ts
    │   │   │   │   │   ├── form-header
    │   │   │   │   │   │   ├── form-header.component.html
    │   │   │   │   │   │   ├── form-header.component.spec.ts
    │   │   │   │   │   │   └── form-header.component.ts
    │   │   │   │   │   ├── section-header
    │   │   │   │   │   │   ├── section-header.component.html
    │   │   │   │   │   │   ├── section-header.component.spec.ts
    │   │   │   │   │   │   └── section-header.component.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── inputs
    │   │   │   │   │   ├── checkbox-input
    │   │   │   │   │   │   ├── checkbox-input.component.html
    │   │   │   │   │   │   ├── checkbox-input.component.spec.ts
    │   │   │   │   │   │   └── checkbox-input.component.ts
    │   │   │   │   │   ├── file-input
    │   │   │   │   │   │   ├── file-input.component.html
    │   │   │   │   │   │   ├── file-input.component.spec.ts
    │   │   │   │   │   │   └── file-input.component.ts
    │   │   │   │   │   ├── number-input
    │   │   │   │   │   │   ├── number-input.component.html
    │   │   │   │   │   │   ├── number-input.component.spec.ts
    │   │   │   │   │   │   └── number-input.component.ts
    │   │   │   │   │   ├── select-input
    │   │   │   │   │   │   ├── select-input.component.html
    │   │   │   │   │   │   ├── select-input.component.spec.ts
    │   │   │   │   │   │   └── select-input.component.ts
    │   │   │   │   │   ├── text-input
    │   │   │   │   │   │   ├── text-input.component.html
    │   │   │   │   │   │   ├── text-input.component.spec.ts
    │   │   │   │   │   │   └── text-input.component.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── enums
    │   │   │   │   ├── form-mode.enum.ts
    │   │   │   │   ├── index.ts
    │   │   │   │   └── message-action.enum.ts
    │   │   │   └── index.ts
    │   │   ├── layouts
    │   │   │   ├── config
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── menu.config.spec.ts
    │   │   │   │   └── menu.config.ts
    │   │   │   ├── models
    │   │   │   │   ├── index.ts
    │   │   │   │   └── menu-item.model.ts
    │   │   │   ├── index.ts
    │   │   │   ├── main-layout.component.html
    │   │   │   ├── main-layout.component.spec.ts
    │   │   │   └── main-layout.component.ts
    │   │   ├── notifications
    │   │   │   ├── components
    │   │   │   │   └── notification-bell
    │   │   │   │       ├── notification-bell.component.html
    │   │   │   │       ├── notification-bell.component.spec.ts
    │   │   │   │       └── notification-bell.component.ts
    │   │   │   └── services
    │   │   │       ├── api
    │   │   │       │   ├── notification-api.service.spec.ts
    │   │   │       │   └── notification-api.service.ts
    │   │   │       ├── navigation
    │   │   │       │   ├── notification-destination.resolver.spec.ts
    │   │   │       │   └── notification-destination.resolver.ts
    │   │   │       └── websocket
    │   │   │           └── notification-websocket.service.ts
    │   │   ├── pdf-viewer
    │   │   │   ├── components
    │   │   │   │   ├── pdf-viewer-dialog
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── pdf-viewer-dialog.component.html
    │   │   │   │   │   └── pdf-viewer-dialog.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── models
    │   │   │   │   ├── index.ts
    │   │   │   │   └── pdf-viewer.model.ts
    │   │   │   ├── services
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── pdf-viewer.service.spec.ts
    │   │   │   │   └── pdf-viewer.service.ts
    │   │   │   └── index.ts
    │   │   ├── pending-tabs
    │   │   │   ├── components
    │   │   │   │   ├── pending-tabs-dropdown
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── pending-tabs-dropdown.component.html
    │   │   │   │   │   ├── pending-tabs-dropdown.component.spec.ts
    │   │   │   │   │   └── pending-tabs-dropdown.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── constants
    │   │   │   │   ├── index.ts
    │   │   │   │   └── pending-tabs.constants.ts
    │   │   │   ├── models
    │   │   │   │   ├── index.ts
    │   │   │   │   └── pending-tab.interface.ts
    │   │   │   ├── index.ts
    │   │   │   ├── pending-tabs.service.spec.ts
    │   │   │   └── pending-tabs.service.ts
    │   │   └── theme
    │   │       ├── components
    │   │       │   ├── theme-toggle
    │   │       │   │   ├── index.ts
    │   │       │   │   ├── theme-toggle.component.html
    │   │       │   │   ├── theme-toggle.component.spec.ts
    │   │       │   │   ├── theme-toggle.component.ts
    │   │       │   │   ├── theme.service.spec.ts
    │   │       │   │   └── theme.service.ts
    │   │       │   └── index.ts
    │   │       ├── presets
    │   │       │   ├── index.ts
    │   │       │   └── theme.preset.ts
    │   │       └── index.ts
    │   ├── features
    │   │   ├── auth
    │   │   │   ├── guards
    │   │   │   │   ├── admin.guard.spec.ts
    │   │   │   │   ├── admin.guard.ts
    │   │   │   │   ├── auth.guard.spec.ts
    │   │   │   │   ├── auth.guard.ts
    │   │   │   │   ├── home-redirect.guard.spec.ts
    │   │   │   │   ├── home-redirect.guard.ts
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── module-permission.guard.spec.ts
    │   │   │   │   └── module-permission.guard.ts
    │   │   │   ├── interceptors
    │   │   │   │   ├── auth.interceptor.spec.ts
    │   │   │   │   ├── auth.interceptor.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── messages
    │   │   │   │   ├── error-messages.spec.ts
    │   │   │   │   ├── error-messages.ts
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── success-messages.spec.ts
    │   │   │   │   └── success-messages.ts
    │   │   │   ├── models
    │   │   │   │   ├── interfaces
    │   │   │   │   │   ├── auth-request.interface.spec.ts
    │   │   │   │   │   ├── auth-request.interface.ts
    │   │   │   │   │   ├── auth-response.interface.spec.ts
    │   │   │   │   │   ├── auth-response.interface.ts
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── user.interface.spec.ts
    │   │   │   │   │   └── user.interface.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── pages
    │   │   │   │   ├── change-commission-deduction
    │   │   │   │   │   ├── change-commission-deduction-page.component.html
    │   │   │   │   │   ├── change-commission-deduction-page.component.spec.ts
    │   │   │   │   │   ├── change-commission-deduction-page.component.ts
    │   │   │   │   │   └── change-commission-deduction-page.config.ts
    │   │   │   │   ├── change-password
    │   │   │   │   │   ├── change-password-page.component.html
    │   │   │   │   │   ├── change-password-page.component.spec.ts
    │   │   │   │   │   ├── change-password-page.component.ts
    │   │   │   │   │   └── change-password-page.config.ts
    │   │   │   │   ├── change-username
    │   │   │   │   │   ├── change-username-page.component.html
    │   │   │   │   │   ├── change-username-page.component.spec.ts
    │   │   │   │   │   ├── change-username-page.component.ts
    │   │   │   │   │   └── change-username-page.config.ts
    │   │   │   │   ├── configuration
    │   │   │   │   │   ├── configuration-page.component.html
    │   │   │   │   │   ├── configuration-page.component.spec.ts
    │   │   │   │   │   └── configuration-page.component.ts
    │   │   │   │   ├── login
    │   │   │   │   │   ├── login-page.component.html
    │   │   │   │   │   ├── login-page.component.spec.ts
    │   │   │   │   │   └── login-page.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── router
    │   │   │   │   ├── auth.routes.spec.ts
    │   │   │   │   ├── auth.routes.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── services
    │   │   │   │   ├── api
    │   │   │   │   │   ├── auth-api.service.spec.ts
    │   │   │   │   │   ├── auth-api.service.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── application
    │   │   │   │   │   ├── auth-application.service.spec.ts
    │   │   │   │   │   ├── auth-application.service.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── tests
    │   │   │   │   └── manual-integration.spec.ts
    │   │   │   ├── validators
    │   │   │   │   ├── auth-validators.spec.ts
    │   │   │   │   ├── auth-validators.ts
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   ├── cash-register
    │   │   │   ├── models
    │   │   │   │   ├── enums
    │   │   │   │   │   ├── cash-movement-type.enum.spec.ts
    │   │   │   │   │   ├── cash-movement-type.enum.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── interfaces
    │   │   │   │   │   └── closure.interface.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── pages
    │   │   │   │   ├── cash-register-history-page
    │   │   │   │   │   ├── cash-register-history-page.component.html
    │   │   │   │   │   ├── cash-register-history-page.component.spec.ts
    │   │   │   │   │   ├── cash-register-history-page.component.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   └── cash-register-page
    │   │   │   │       ├── cash-register-page.component.html
    │   │   │   │       ├── cash-register-page.component.spec.ts
    │   │   │   │       └── cash-register-page.component.ts
    │   │   │   ├── router
    │   │   │   │   ├── cash-register.routes.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── services
    │   │   │   │   ├── api
    │   │   │   │   │   ├── cash-register-api.service.spec.ts
    │   │   │   │   │   └── cash-register-api.service.ts
    │   │   │   │   ├── application
    │   │   │   │   │   └── cash-register-application.service.ts
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   ├── categories
    │   │   │   ├── models
    │   │   │   │   ├── interfaces
    │   │   │   │   │   ├── category-create.interface.spec.ts
    │   │   │   │   │   ├── category-create.interface.ts
    │   │   │   │   │   ├── category-details.interface.spec.ts
    │   │   │   │   │   ├── category-details.interface.ts
    │   │   │   │   │   ├── category-list.interface.spec.ts
    │   │   │   │   │   ├── category-list.interface.ts
    │   │   │   │   │   ├── category-update.interface.spec.ts
    │   │   │   │   │   ├── category-update.interface.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── pages
    │   │   │   │   ├── categories-details-page
    │   │   │   │   │   ├── categories-details-page.component.html
    │   │   │   │   │   ├── categories-details-page.component.spec.ts
    │   │   │   │   │   └── categories-details-page.component.ts
    │   │   │   │   ├── categories-form-page
    │   │   │   │   │   ├── categories-form-page.component.html
    │   │   │   │   │   ├── categories-form-page.component.spec.ts
    │   │   │   │   │   └── categories-form-page.component.ts
    │   │   │   │   ├── categories-list-page
    │   │   │   │   │   ├── categories-list-page.component.html
    │   │   │   │   │   ├── categories-list-page.component.spec.ts
    │   │   │   │   │   └── categories-list-page.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── router
    │   │   │   │   ├── category.routes.spec.ts
    │   │   │   │   ├── category.routes.ts
    │   │   │   │   └── index.ts
    │   │   │   └── services
    │   │   │       ├── api
    │   │   │       │   ├── category-api.service.spec.ts
    │   │   │       │   ├── category-api.service.ts
    │   │   │       │   └── index.ts
    │   │   │       ├── application
    │   │   │       │   ├── category-application.service.spec.ts
    │   │   │       │   ├── category-application.service.ts
    │   │   │       │   └── index.ts
    │   │   │       └── index.ts
    │   │   ├── credit-notes
    │   │   │   ├── models
    │   │   │   │   ├── enums
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── interfaces
    │   │   │   │   │   ├── credit-note.interface.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── pages
    │   │   │   │   ├── credit-note-detail-page
    │   │   │   │   │   ├── credit-note-detail-page.component.html
    │   │   │   │   │   └── credit-note-detail-page.component.ts
    │   │   │   │   ├── credit-note-form-page
    │   │   │   │   │   ├── credit-note-form-page.component.html
    │   │   │   │   │   ├── credit-note-form-page.component.spec.ts
    │   │   │   │   │   └── credit-note-form-page.component.ts
    │   │   │   │   └── credit-note-list-page
    │   │   │   │       ├── credit-note-list-page.component.html
    │   │   │   │       └── credit-note-list-page.component.ts
    │   │   │   ├── router
    │   │   │   │   ├── credit-notes.routes.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── services
    │   │   │   │   ├── api
    │   │   │   │   │   └── credit-note-api.service.ts
    │   │   │   │   ├── application
    │   │   │   │   │   └── credit-note-application.service.ts
    │   │   │   │   └── mappers
    │   │   │   │       └── credit-note.mapper.ts
    │   │   │   └── index.ts
    │   │   ├── customers
    │   │   │   ├── components
    │   │   │   │   ├── balance-summary-card
    │   │   │   │   │   ├── balance-summary-card.component.html
    │   │   │   │   │   └── balance-summary-card.component.ts
    │   │   │   │   ├── balance-transactions-table
    │   │   │   │   │   ├── balance-transactions-table.component.html
    │   │   │   │   │   ├── balance-transactions-table.component.spec.ts
    │   │   │   │   │   └── balance-transactions-table.component.ts
    │   │   │   │   ├── customer-addresses-section
    │   │   │   │   │   ├── customer-addresses-section.component.html
    │   │   │   │   │   ├── customer-addresses-section.component.spec.ts
    │   │   │   │   │   └── customer-addresses-section.component.ts
    │   │   │   │   ├── customer-contact-section
    │   │   │   │   │   ├── customer-contact-section.component.html
    │   │   │   │   │   ├── customer-contact-section.component.spec.ts
    │   │   │   │   │   └── customer-contact-section.component.ts
    │   │   │   │   ├── customer-general-section
    │   │   │   │   │   ├── customer-general-section.component.html
    │   │   │   │   │   ├── customer-general-section.component.spec.ts
    │   │   │   │   │   └── customer-general-section.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── data
    │   │   │   │   └── venezuela-geo.data.ts
    │   │   │   ├── messages
    │   │   │   │   ├── error-messages.spec.ts
    │   │   │   │   ├── error-messages.ts
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── success-messages.spec.ts
    │   │   │   │   └── success-messages.ts
    │   │   │   ├── models
    │   │   │   │   ├── enums
    │   │   │   │   │   ├── balance-type.enum.ts
    │   │   │   │   │   ├── customer-type.enum.spec.ts
    │   │   │   │   │   ├── customer-type.enum.ts
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── payment-type.enum.spec.ts
    │   │   │   │   │   └── payment-type.enum.ts
    │   │   │   │   ├── interfaces
    │   │   │   │   │   ├── balance-transaction.interface.ts
    │   │   │   │   │   ├── customer-balance.interface.ts
    │   │   │   │   │   ├── customer-create.interface.spec.ts
    │   │   │   │   │   ├── customer-create.interface.ts
    │   │   │   │   │   ├── customer-details.interface.spec.ts
    │   │   │   │   │   ├── customer-details.interface.ts
    │   │   │   │   │   ├── customer-edit.interface.spec.ts
    │   │   │   │   │   ├── customer-edit.interface.ts
    │   │   │   │   │   ├── customer-list.interface.spec.ts
    │   │   │   │   │   ├── customer-list.interface.ts
    │   │   │   │   │   ├── customer-warehouse-access.interface.spec.ts
    │   │   │   │   │   ├── customer-warehouse-access.interface.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── pages
    │   │   │   │   ├── customer-balance-page
    │   │   │   │   │   ├── customer-balance-page.component.html
    │   │   │   │   │   ├── customer-balance-page.component.spec.ts
    │   │   │   │   │   └── customer-balance-page.component.ts
    │   │   │   │   ├── customers-details-page
    │   │   │   │   │   ├── customers-details-page.component.html
    │   │   │   │   │   ├── customers-details-page.component.spec.ts
    │   │   │   │   │   └── customers-details-page.component.ts
    │   │   │   │   ├── customers-form-page
    │   │   │   │   │   ├── customers-form-page.component.html
    │   │   │   │   │   ├── customers-form-page.component.spec.ts
    │   │   │   │   │   └── customers-form-page.component.ts
    │   │   │   │   ├── customers-list-page
    │   │   │   │   │   ├── customers-list-page.component.html
    │   │   │   │   │   ├── customers-list-page.component.spec.ts
    │   │   │   │   │   └── customers-list-page.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── router
    │   │   │   │   ├── customer-balance.routes.ts
    │   │   │   │   ├── customer.routes.spec.ts
    │   │   │   │   ├── customer.routes.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── services
    │   │   │   │   ├── api
    │   │   │   │   │   ├── customer-api.service.spec.ts
    │   │   │   │   │   ├── customer-api.service.ts
    │   │   │   │   │   ├── customer-balance-api.service.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── application
    │   │   │   │   │   ├── customer-application.service.spec.ts
    │   │   │   │   │   ├── customer-application.service.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── mappers
    │   │   │   │   │   ├── customer.mapper.spec.ts
    │   │   │   │   │   ├── customer.mapper.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── validators
    │   │   │   │   ├── customer.validators.spec.ts
    │   │   │   │   ├── customer.validators.ts
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   ├── dashboard
    │   │   │   ├── pages
    │   │   │   │   └── dashboard-page
    │   │   │   │       ├── dashboard-page.component.html
    │   │   │   │       ├── dashboard-page.component.spec.ts
    │   │   │   │       └── dashboard-page.component.ts
    │   │   │   └── services
    │   │   │       └── api
    │   │   │           └── dashboard-api.service.ts
    │   │   ├── debit-notes
    │   │   │   ├── models
    │   │   │   │   ├── enums
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── interfaces
    │   │   │   │   │   ├── debit-note.interface.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── pages
    │   │   │   │   ├── debit-note-detail-page
    │   │   │   │   │   ├── debit-note-detail-page.component.html
    │   │   │   │   │   └── debit-note-detail-page.component.ts
    │   │   │   │   ├── debit-note-form-page
    │   │   │   │   │   ├── debit-note-form-page.component.html
    │   │   │   │   │   └── debit-note-form-page.component.ts
    │   │   │   │   └── debit-note-list-page
    │   │   │   │       ├── debit-note-list-page.component.html
    │   │   │   │       └── debit-note-list-page.component.ts
    │   │   │   ├── router
    │   │   │   │   ├── debit-notes.routes.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── services
    │   │   │   │   ├── api
    │   │   │   │   │   └── debit-note-api.service.ts
    │   │   │   │   ├── application
    │   │   │   │   │   └── debit-note-application.service.ts
    │   │   │   │   └── mappers
    │   │   │   │       └── debit-note.mapper.ts
    │   │   │   └── index.ts
    │   │   ├── invoices
    │   │   │   ├── components
    │   │   │   │   ├── cancel-invoice-dialog
    │   │   │   │   │   ├── cancel-invoice-dialog.component.html
    │   │   │   │   │   ├── cancel-invoice-dialog.component.spec.ts
    │   │   │   │   │   └── cancel-invoice-dialog.component.ts
    │   │   │   │   ├── duplicate-invoice-dialog
    │   │   │   │   │   ├── duplicate-invoice-dialog.component.html
    │   │   │   │   │   ├── duplicate-invoice-dialog.component.spec.ts
    │   │   │   │   │   └── duplicate-invoice-dialog.component.ts
    │   │   │   │   └── invoice-source-picker-dialog
    │   │   │   │       ├── invoice-source-picker-dialog.component.html
    │   │   │   │       └── invoice-source-picker-dialog.component.ts
    │   │   │   ├── messages
    │   │   │   │   ├── error-messages.spec.ts
    │   │   │   │   ├── error-messages.ts
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── success-messages.spec.ts
    │   │   │   │   └── success-messages.ts
    │   │   │   ├── models
    │   │   │   │   ├── enums
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── invoice-status.enum.spec.ts
    │   │   │   │   │   ├── invoice-status.enum.ts
    │   │   │   │   │   ├── payment-type.enum.spec.ts
    │   │   │   │   │   └── payment-type.enum.ts
    │   │   │   │   ├── interfaces
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── invoice-create.interface.spec.ts
    │   │   │   │   │   ├── invoice-create.interface.ts
    │   │   │   │   │   ├── invoice-details.interface.spec.ts
    │   │   │   │   │   ├── invoice-details.interface.ts
    │   │   │   │   │   ├── invoice-edit.interface.spec.ts
    │   │   │   │   │   ├── invoice-edit.interface.ts
    │   │   │   │   │   ├── invoice-form-data.interface.spec.ts
    │   │   │   │   │   ├── invoice-form-data.interface.ts
    │   │   │   │   │   ├── invoice-list.interface.spec.ts
    │   │   │   │   │   └── invoice-list.interface.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── pages
    │   │   │   │   ├── invoice-detail-page
    │   │   │   │   │   ├── invoice-detail-page.component.html
    │   │   │   │   │   ├── invoice-detail-page.component.spec.ts
    │   │   │   │   │   └── invoice-detail-page.component.ts
    │   │   │   │   ├── invoice-form-page
    │   │   │   │   │   ├── invoice-form-page.component.html
    │   │   │   │   │   ├── invoice-form-page.component.spec.ts
    │   │   │   │   │   └── invoice-form-page.component.ts
    │   │   │   │   └── invoice-list-page
    │   │   │   │       ├── invoice-list-page.component.html
    │   │   │   │       ├── invoice-list-page.component.spec.ts
    │   │   │   │       └── invoice-list-page.component.ts
    │   │   │   ├── router
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── invoices.routes.spec.ts
    │   │   │   │   └── invoices.routes.ts
    │   │   │   ├── services
    │   │   │   │   ├── api
    │   │   │   │   │   ├── invoice-api.service.spec.ts
    │   │   │   │   │   └── invoice-api.service.ts
    │   │   │   │   ├── application
    │   │   │   │   │   ├── invoice-application.service.spec.ts
    │   │   │   │   │   └── invoice-application.service.ts
    │   │   │   │   └── mappers
    │   │   │   │       ├── invoice.mapper.spec.ts
    │   │   │   │       └── invoice.mapper.ts
    │   │   │   └── index.ts
    │   │   ├── orders
    │   │   │   ├── components
    │   │   │   │   ├── cancel-order-dialog
    │   │   │   │   │   ├── cancel-order-dialog.component.html
    │   │   │   │   │   ├── cancel-order-dialog.component.spec.ts
    │   │   │   │   │   └── cancel-order-dialog.component.ts
    │   │   │   │   ├── convert-to-invoice-dialog
    │   │   │   │   │   ├── convert-to-invoice-dialog.component.html
    │   │   │   │   │   ├── convert-to-invoice-dialog.component.spec.ts
    │   │   │   │   │   └── convert-to-invoice-dialog.component.ts
    │   │   │   │   ├── customer-picker-dialog
    │   │   │   │   │   ├── customer-picker-dialog.component.html
    │   │   │   │   │   ├── customer-picker-dialog.component.spec.ts
    │   │   │   │   │   └── customer-picker-dialog.component.ts
    │   │   │   │   ├── order-items-table
    │   │   │   │   │   ├── order-items-table.component.html
    │   │   │   │   │   ├── order-items-table.component.spec.ts
    │   │   │   │   │   └── order-items-table.component.ts
    │   │   │   │   ├── product-picker-dialog
    │   │   │   │   │   ├── product-picker-dialog.component.html
    │   │   │   │   │   ├── product-picker-dialog.component.spec.ts
    │   │   │   │   │   └── product-picker-dialog.component.ts
    │   │   │   │   └── warehouse-stock-popover
    │   │   │   │       ├── warehouse-stock-entry.interface.spec.ts
    │   │   │   │       ├── warehouse-stock-entry.interface.ts
    │   │   │   │       ├── warehouse-stock-popover.component.html
    │   │   │   │       ├── warehouse-stock-popover.component.spec.ts
    │   │   │   │       └── warehouse-stock-popover.component.ts
    │   │   │   ├── messages
    │   │   │   │   ├── error-messages.spec.ts
    │   │   │   │   ├── error-messages.ts
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── success-messages.spec.ts
    │   │   │   │   └── success-messages.ts
    │   │   │   ├── models
    │   │   │   │   ├── enums
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── order-status.enum.spec.ts
    │   │   │   │   │   └── order-status.enum.ts
    │   │   │   │   └── interfaces
    │   │   │   │       ├── index.ts
    │   │   │   │       ├── order-create.interface.spec.ts
    │   │   │   │       ├── order-create.interface.ts
    │   │   │   │       ├── order-details.interface.spec.ts
    │   │   │   │       ├── order-details.interface.ts
    │   │   │   │       ├── order-edit.interface.spec.ts
    │   │   │   │       ├── order-edit.interface.ts
    │   │   │   │       ├── order-form-data.interface.spec.ts
    │   │   │   │       ├── order-form-data.interface.ts
    │   │   │   │       ├── order-item-allocation.interface.spec.ts
    │   │   │   │       ├── order-item-allocation.interface.ts
    │   │   │   │       ├── order-list.interface.spec.ts
    │   │   │   │       ├── order-list.interface.ts
    │   │   │   │       ├── order-product.interface.spec.ts
    │   │   │   │       └── order-product.interface.ts
    │   │   │   ├── pages
    │   │   │   │   ├── order-detail-page
    │   │   │   │   │   ├── order-detail-page.component.html
    │   │   │   │   │   ├── order-detail-page.component.spec.ts
    │   │   │   │   │   └── order-detail-page.component.ts
    │   │   │   │   ├── order-form-page
    │   │   │   │   │   ├── order-form-page.component.html
    │   │   │   │   │   ├── order-form-page.component.spec.ts
    │   │   │   │   │   └── order-form-page.component.ts
    │   │   │   │   └── order-list-page
    │   │   │   │       ├── order-list-page.component.html
    │   │   │   │       ├── order-list-page.component.spec.ts
    │   │   │   │       └── order-list-page.component.ts
    │   │   │   ├── router
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── orders.routes.spec.ts
    │   │   │   │   └── orders.routes.ts
    │   │   │   ├── services
    │   │   │   │   ├── api
    │   │   │   │   │   ├── order-api.service.spec.ts
    │   │   │   │   │   └── order-api.service.ts
    │   │   │   │   ├── application
    │   │   │   │   │   ├── order-application.service.spec.ts
    │   │   │   │   │   └── order-application.service.ts
    │   │   │   │   └── mappers
    │   │   │   │       ├── order.mapper.spec.ts
    │   │   │   │       └── order.mapper.ts
    │   │   │   └── index.ts
    │   │   ├── payment-methods
    │   │   │   ├── models
    │   │   │   │   ├── enums
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── interfaces
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   └── payment-method.interface.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── pages
    │   │   │   │   ├── payment-method-detail-page
    │   │   │   │   │   ├── payment-method-detail-page.component.html
    │   │   │   │   │   └── payment-method-detail-page.component.ts
    │   │   │   │   ├── payment-method-form-page
    │   │   │   │   │   ├── payment-method-form-page.component.html
    │   │   │   │   │   └── payment-method-form-page.component.ts
    │   │   │   │   └── payment-method-list-page
    │   │   │   │       ├── payment-method-list-page.component.html
    │   │   │   │       └── payment-method-list-page.component.ts
    │   │   │   ├── router
    │   │   │   │   ├── index.ts
    │   │   │   │   └── payment-methods.routes.ts
    │   │   │   ├── services
    │   │   │   │   ├── api
    │   │   │   │   │   └── payment-method-api.service.ts
    │   │   │   │   ├── application
    │   │   │   │   │   └── payment-method-application.service.ts
    │   │   │   │   └── mappers
    │   │   │   │       └── payment-method.mapper.ts
    │   │   │   └── index.ts
    │   │   ├── price-types
    │   │   │   ├── models
    │   │   │   │   └── interfaces
    │   │   │   │       ├── index.ts
    │   │   │   │       ├── price-type-create.interface.spec.ts
    │   │   │   │       ├── price-type-create.interface.ts
    │   │   │   │       ├── price-type-details.interface.spec.ts
    │   │   │   │       ├── price-type-details.interface.ts
    │   │   │   │       ├── price-type-list.interface.spec.ts
    │   │   │   │       ├── price-type-list.interface.ts
    │   │   │   │       ├── price-type-update.interface.spec.ts
    │   │   │   │       └── price-type-update.interface.ts
    │   │   │   ├── pages
    │   │   │   │   ├── price-types-details-page
    │   │   │   │   │   ├── price-types-details-page.component.html
    │   │   │   │   │   ├── price-types-details-page.component.spec.ts
    │   │   │   │   │   └── price-types-details-page.component.ts
    │   │   │   │   ├── price-types-form-page
    │   │   │   │   │   ├── price-types-form-page.component.html
    │   │   │   │   │   ├── price-types-form-page.component.spec.ts
    │   │   │   │   │   └── price-types-form-page.component.ts
    │   │   │   │   ├── price-types-list-page
    │   │   │   │   │   ├── price-types-list-page.component.html
    │   │   │   │   │   ├── price-types-list-page.component.spec.ts
    │   │   │   │   │   └── price-types-list-page.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── router
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── price-type.routes.spec.ts
    │   │   │   │   └── price-type.routes.ts
    │   │   │   └── services
    │   │   │       ├── api
    │   │   │       │   ├── price-type-api.service.spec.ts
    │   │   │       │   └── price-type-api.service.ts
    │   │   │       └── application
    │   │   │           ├── price-type-application.service.spec.ts
    │   │   │           └── price-type-application.service.ts
    │   │   ├── products
    │   │   │   ├── components
    │   │   │   │   ├── product-composition-section
    │   │   │   │   │   ├── product-composition-section.component.html
    │   │   │   │   │   ├── product-composition-section.component.spec.ts
    │   │   │   │   │   └── product-composition-section.component.ts
    │   │   │   │   ├── product-general-section
    │   │   │   │   │   ├── product-general-section.component.html
    │   │   │   │   │   ├── product-general-section.component.spec.ts
    │   │   │   │   │   └── product-general-section.component.ts
    │   │   │   │   └── product-prices-section
    │   │   │   │       ├── product-prices-section.component.html
    │   │   │   │       ├── product-prices-section.component.spec.ts
    │   │   │   │       └── product-prices-section.component.ts
    │   │   │   ├── models
    │   │   │   │   ├── enums
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── product-type.enum.spec.ts
    │   │   │   │   │   └── product-type.enum.ts
    │   │   │   │   ├── interfaces
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── product-create-update.interface.spec.ts
    │   │   │   │   │   ├── product-create-update.interface.ts
    │   │   │   │   │   ├── product-details.interface.spec.ts
    │   │   │   │   │   ├── product-details.interface.ts
    │   │   │   │   │   ├── product-list.interface.spec.ts
    │   │   │   │   │   ├── product-list.interface.ts
    │   │   │   │   │   ├── product-price-form-item.interface.spec.ts
    │   │   │   │   │   ├── product-price-form-item.interface.ts
    │   │   │   │   │   ├── product-price-item.interface.spec.ts
    │   │   │   │   │   ├── product-price-item.interface.ts
    │   │   │   │   │   ├── product-stock-by-warehouse.interface.spec.ts
    │   │   │   │   │   └── product-stock-by-warehouse.interface.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── pages
    │   │   │   │   ├── products-details-page
    │   │   │   │   │   ├── products-details-page.component.html
    │   │   │   │   │   ├── products-details-page.component.spec.ts
    │   │   │   │   │   └── products-details-page.component.ts
    │   │   │   │   ├── products-form-page
    │   │   │   │   │   ├── products-form-page.component.html
    │   │   │   │   │   ├── products-form-page.component.spec.ts
    │   │   │   │   │   └── products-form-page.component.ts
    │   │   │   │   ├── products-list-page
    │   │   │   │   │   ├── products-list-page.component.html
    │   │   │   │   │   ├── products-list-page.component.spec.ts
    │   │   │   │   │   └── products-list-page.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── router
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── product.routes.spec.ts
    │   │   │   │   └── product.routes.ts
    │   │   │   └── services
    │   │   │       ├── api
    │   │   │       │   ├── index.ts
    │   │   │       │   ├── product-api.service.spec.ts
    │   │   │       │   ├── product-api.service.ts
    │   │   │       │   ├── product-photo.service.spec.ts
    │   │   │       │   └── product-photo.service.ts
    │   │   │       ├── application
    │   │   │       │   ├── index.ts
    │   │   │       │   ├── product-application.service.spec.ts
    │   │   │       │   └── product-application.service.ts
    │   │   │       └── index.ts
    │   │   ├── purchases
    │   │   │   ├── components
    │   │   │   │   ├── cancel-purchase-dialog
    │   │   │   │   │   ├── cancel-purchase-dialog.component.html
    │   │   │   │   │   └── cancel-purchase-dialog.component.ts
    │   │   │   │   ├── confirm-purchase-dialog
    │   │   │   │   │   ├── confirm-purchase-dialog.component.html
    │   │   │   │   │   └── confirm-purchase-dialog.component.ts
    │   │   │   │   ├── purchase-items-table
    │   │   │   │   │   ├── purchase-items-table.component.html
    │   │   │   │   │   └── purchase-items-table.component.ts
    │   │   │   │   ├── purchase-product-picker-dialog
    │   │   │   │   │   ├── purchase-product-picker-dialog.component.html
    │   │   │   │   │   └── purchase-product-picker-dialog.component.ts
    │   │   │   │   └── supplier-picker-dialog
    │   │   │   │       ├── supplier-picker-dialog.component.html
    │   │   │   │       └── supplier-picker-dialog.component.ts
    │   │   │   ├── messages
    │   │   │   │   ├── error-messages.ts
    │   │   │   │   ├── index.ts
    │   │   │   │   └── success-messages.ts
    │   │   │   ├── models
    │   │   │   │   ├── enums
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   └── purchase-status.enum.ts
    │   │   │   │   └── interfaces
    │   │   │   │       ├── index.ts
    │   │   │   │       ├── purchase-create.interface.ts
    │   │   │   │       ├── purchase-details.interface.ts
    │   │   │   │       ├── purchase-edit.interface.ts
    │   │   │   │       ├── purchase-form-data.interface.ts
    │   │   │   │       ├── purchase-list.interface.ts
    │   │   │   │       ├── purchase-product.interface.ts
    │   │   │   │       └── purchase-warehouse.interface.ts
    │   │   │   ├── pages
    │   │   │   │   ├── purchase-detail-page
    │   │   │   │   │   ├── purchase-detail-page.component.html
    │   │   │   │   │   └── purchase-detail-page.component.ts
    │   │   │   │   ├── purchase-form-page
    │   │   │   │   │   ├── purchase-form-page.component.html
    │   │   │   │   │   └── purchase-form-page.component.ts
    │   │   │   │   └── purchase-list-page
    │   │   │   │       ├── purchase-list-page.component.html
    │   │   │   │       └── purchase-list-page.component.ts
    │   │   │   ├── router
    │   │   │   │   ├── index.ts
    │   │   │   │   └── purchase.routes.ts
    │   │   │   ├── services
    │   │   │   │   ├── api
    │   │   │   │   │   └── purchase-api.service.ts
    │   │   │   │   ├── application
    │   │   │   │   │   └── purchase-application.service.ts
    │   │   │   │   └── mappers
    │   │   │   │       └── purchase.mapper.ts
    │   │   │   └── index.ts
    │   │   ├── quotes
    │   │   │   ├── components
    │   │   │   │   ├── convert-to-invoice-dialog
    │   │   │   │   │   ├── convert-to-invoice-dialog.component.html
    │   │   │   │   │   ├── convert-to-invoice-dialog.component.spec.ts
    │   │   │   │   │   └── convert-to-invoice-dialog.component.ts
    │   │   │   │   └── convert-to-order-dialog
    │   │   │   │       ├── convert-to-order-dialog.component.html
    │   │   │   │       ├── convert-to-order-dialog.component.spec.ts
    │   │   │   │       └── convert-to-order-dialog.component.ts
    │   │   │   ├── messages
    │   │   │   │   ├── error-messages.spec.ts
    │   │   │   │   ├── error-messages.ts
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── success-messages.spec.ts
    │   │   │   │   └── success-messages.ts
    │   │   │   ├── models
    │   │   │   │   ├── enums
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── quote-status.enum.spec.ts
    │   │   │   │   │   └── quote-status.enum.ts
    │   │   │   │   └── interfaces
    │   │   │   │       ├── index.ts
    │   │   │   │       ├── quote-create.interface.spec.ts
    │   │   │   │       ├── quote-create.interface.ts
    │   │   │   │       ├── quote-details.interface.spec.ts
    │   │   │   │       ├── quote-details.interface.ts
    │   │   │   │       ├── quote-edit.interface.spec.ts
    │   │   │   │       ├── quote-edit.interface.ts
    │   │   │   │       ├── quote-form-data.interface.spec.ts
    │   │   │   │       ├── quote-form-data.interface.ts
    │   │   │   │       ├── quote-list.interface.spec.ts
    │   │   │   │       ├── quote-list.interface.ts
    │   │   │   │       ├── quote-product.interface.spec.ts
    │   │   │   │       ├── quote-product.interface.ts
    │   │   │   │       ├── quote-warehouse.interface.spec.ts
    │   │   │   │       └── quote-warehouse.interface.ts
    │   │   │   ├── pages
    │   │   │   │   ├── quote-detail-page
    │   │   │   │   │   ├── quote-detail-page.component.html
    │   │   │   │   │   ├── quote-detail-page.component.spec.ts
    │   │   │   │   │   └── quote-detail-page.component.ts
    │   │   │   │   ├── quote-form-page
    │   │   │   │   │   ├── quote-form-page.component.html
    │   │   │   │   │   ├── quote-form-page.component.spec.ts
    │   │   │   │   │   └── quote-form-page.component.ts
    │   │   │   │   └── quote-list-page
    │   │   │   │       ├── quote-list-page.component.html
    │   │   │   │       ├── quote-list-page.component.spec.ts
    │   │   │   │       └── quote-list-page.component.ts
    │   │   │   ├── router
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── quotes.routes.spec.ts
    │   │   │   │   └── quotes.routes.ts
    │   │   │   ├── services
    │   │   │   │   ├── api
    │   │   │   │   │   ├── quote-api.service.spec.ts
    │   │   │   │   │   └── quote-api.service.ts
    │   │   │   │   ├── application
    │   │   │   │   │   ├── quote-application.service.spec.ts
    │   │   │   │   │   └── quote-application.service.ts
    │   │   │   │   └── mappers
    │   │   │   │       ├── quote.mapper.spec.ts
    │   │   │   │       └── quote.mapper.ts
    │   │   │   └── index.ts
    │   │   ├── receivables
    │   │   │   ├── components
    │   │   │   │   ├── customer-debt-dialog
    │   │   │   │   │   ├── customer-debt-dialog.component.html
    │   │   │   │   │   └── customer-debt-dialog.component.ts
    │   │   │   │   ├── invoice-pending-payments-dialog
    │   │   │   │   │   ├── invoice-pending-payments-dialog.component.html
    │   │   │   │   │   └── invoice-pending-payments-dialog.component.ts
    │   │   │   │   ├── merchant-payments-tab
    │   │   │   │   │   ├── merchant-payments-tab.component.html
    │   │   │   │   │   └── merchant-payments-tab.component.ts
    │   │   │   │   ├── payment-detail-dialog
    │   │   │   │   │   ├── payment-detail-dialog.component.html
    │   │   │   │   │   └── payment-detail-dialog.component.ts
    │   │   │   │   ├── payment-form-dialog
    │   │   │   │   │   ├── payment-form-dialog.component.html
    │   │   │   │   │   └── payment-form-dialog.component.ts
    │   │   │   │   ├── payment-history-dialog
    │   │   │   │   │   ├── payment-history-dialog.component.html
    │   │   │   │   │   └── payment-history-dialog.component.ts
    │   │   │   │   ├── pending-payments-tab
    │   │   │   │   │   ├── pending-payments-tab.component.html
    │   │   │   │   │   ├── pending-payments-tab.component.spec.ts
    │   │   │   │   │   └── pending-payments-tab.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── messages
    │   │   │   │   ├── error-messages.ts
    │   │   │   │   ├── index.ts
    │   │   │   │   └── success-messages.ts
    │   │   │   ├── models
    │   │   │   │   ├── interfaces
    │   │   │   │   │   ├── credit-status.interface.ts
    │   │   │   │   │   ├── customer-debt-list.interface.ts
    │   │   │   │   │   ├── customer-debt-summary.interface.ts
    │   │   │   │   │   ├── customer-invoice-debt.interface.ts
    │   │   │   │   │   ├── global-debt-summary.interface.ts
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── payment-request.interface.ts
    │   │   │   │   │   ├── payment-result.interface.ts
    │   │   │   │   │   └── pending-payment.interface.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── pages
    │   │   │   │   └── receivables-page
    │   │   │   │       ├── receivables-page.component.html
    │   │   │   │       └── receivables-page.component.ts
    │   │   │   ├── router
    │   │   │   │   ├── index.ts
    │   │   │   │   └── receivables.routes.ts
    │   │   │   ├── services
    │   │   │   │   ├── api
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   └── receivables-api.service.ts
    │   │   │   │   ├── application
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   └── receivables-application.service.ts
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   ├── reports
    │   │   │   ├── finance
    │   │   │   │   ├── components
    │   │   │   │   │   ├── accounts-receivable-pdf-modal
    │   │   │   │   │   │   ├── accounts-receivable-pdf-modal.component.html
    │   │   │   │   │   │   └── accounts-receivable-pdf-modal.component.ts
    │   │   │   │   │   ├── cash-register-report-modal
    │   │   │   │   │   │   ├── cash-register-report-modal.component.html
    │   │   │   │   │   │   ├── cash-register-report-modal.component.spec.ts
    │   │   │   │   │   │   └── cash-register-report-modal.component.ts
    │   │   │   │   │   └── payment-pdf-modal
    │   │   │   │   │       ├── payment-pdf-modal.component.html
    │   │   │   │   │       ├── payment-pdf-modal.component.spec.ts
    │   │   │   │   │       └── payment-pdf-modal.component.ts
    │   │   │   │   ├── models
    │   │   │   │   │   ├── interfaces
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── services
    │   │   │   │   │   ├── api
    │   │   │   │   │   │   ├── finance-pdf-api.service.spec.ts
    │   │   │   │   │   │   ├── finance-pdf-api.service.ts
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── inventory
    │   │   │   │   ├── components
    │   │   │   │   │   ├── catalog-pdf-modal
    │   │   │   │   │   │   ├── catalog-pdf-modal.component.html
    │   │   │   │   │   │   ├── catalog-pdf-modal.component.spec.ts
    │   │   │   │   │   │   ├── catalog-pdf-modal.component.ts
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   ├── commercial-catalog-pdf-modal
    │   │   │   │   │   │   ├── commercial-catalog-pdf-modal.component.html
    │   │   │   │   │   │   ├── commercial-catalog-pdf-modal.component.spec.ts
    │   │   │   │   │   │   ├── commercial-catalog-pdf-modal.component.ts
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   ├── movements-pdf-modal
    │   │   │   │   │   │   ├── index.ts
    │   │   │   │   │   │   ├── movements-pdf-modal.component.html
    │   │   │   │   │   │   ├── movements-pdf-modal.component.spec.ts
    │   │   │   │   │   │   └── movements-pdf-modal.component.ts
    │   │   │   │   │   ├── pdf-viewer-modal
    │   │   │   │   │   │   ├── index.ts
    │   │   │   │   │   │   ├── pdf-viewer-modal.component.html
    │   │   │   │   │   │   ├── pdf-viewer-modal.component.spec.ts
    │   │   │   │   │   │   └── pdf-viewer-modal.component.ts
    │   │   │   │   │   ├── stock-pdf-modal
    │   │   │   │   │   │   ├── index.ts
    │   │   │   │   │   │   ├── stock-pdf-modal.component.html
    │   │   │   │   │   │   ├── stock-pdf-modal.component.spec.ts
    │   │   │   │   │   │   └── stock-pdf-modal.component.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── models
    │   │   │   │   │   ├── interfaces
    │   │   │   │   │   │   ├── catalog-filters.interface.spec.ts
    │   │   │   │   │   │   ├── catalog-filters.interface.ts
    │   │   │   │   │   │   ├── catalog-item.interface.spec.ts
    │   │   │   │   │   │   ├── catalog-item.interface.ts
    │   │   │   │   │   │   ├── catalog-pdf-filters.interface.spec.ts
    │   │   │   │   │   │   ├── catalog-pdf-filters.interface.ts
    │   │   │   │   │   │   ├── commercial-catalog-pdf-filters.interface.ts
    │   │   │   │   │   │   ├── index.ts
    │   │   │   │   │   │   ├── movements-pdf-filters.interface.spec.ts
    │   │   │   │   │   │   ├── movements-pdf-filters.interface.ts
    │   │   │   │   │   │   ├── stock-pdf-filters.interface.spec.ts
    │   │   │   │   │   │   └── stock-pdf-filters.interface.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── pages
    │   │   │   │   │   ├── inventory-reports-page.component.html
    │   │   │   │   │   └── inventory-reports-page.component.ts
    │   │   │   │   ├── router
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── inventory-reports.routes.spec.ts
    │   │   │   │   │   └── inventory-reports.routes.ts
    │   │   │   │   └── services
    │   │   │   │       ├── api
    │   │   │   │       │   ├── catalog-api.service.spec.ts
    │   │   │   │       │   ├── catalog-api.service.ts
    │   │   │   │       │   ├── catalog-pdf-api.service.spec.ts
    │   │   │   │       │   ├── catalog-pdf-api.service.ts
    │   │   │   │       │   ├── commercial-catalog-pdf-api.service.spec.ts
    │   │   │   │       │   ├── commercial-catalog-pdf-api.service.ts
    │   │   │   │       │   ├── index.ts
    │   │   │   │       │   ├── movements-excel-api.service.ts
    │   │   │   │       │   ├── movements-pdf-api.service.spec.ts
    │   │   │   │       │   ├── movements-pdf-api.service.ts
    │   │   │   │       │   ├── stock-excel-api.service.ts
    │   │   │   │       │   ├── stock-pdf-api.service.spec.ts
    │   │   │   │       │   └── stock-pdf-api.service.ts
    │   │   │   │       ├── application
    │   │   │   │       │   ├── catalog-application.service.spec.ts
    │   │   │   │       │   ├── catalog-application.service.ts
    │   │   │   │       │   └── index.ts
    │   │   │   │       └── index.ts
    │   │   │   ├── invoices
    │   │   │   │   ├── components
    │   │   │   │   │   └── invoice-pdf-modal
    │   │   │   │   │       ├── invoice-pdf-modal.component.html
    │   │   │   │   │       ├── invoice-pdf-modal.component.spec.ts
    │   │   │   │   │       └── invoice-pdf-modal.component.ts
    │   │   │   │   ├── models
    │   │   │   │   │   └── interfaces
    │   │   │   │   │       ├── index.spec.ts
    │   │   │   │   │       └── index.ts
    │   │   │   │   └── services
    │   │   │   │       └── api
    │   │   │   │           ├── invoice-pdf-api.service.spec.ts
    │   │   │   │           └── invoice-pdf-api.service.ts
    │   │   │   ├── orders
    │   │   │   │   ├── components
    │   │   │   │   │   └── order-pdf-modal
    │   │   │   │   │       ├── order-pdf-modal.component.html
    │   │   │   │   │       ├── order-pdf-modal.component.spec.ts
    │   │   │   │   │       └── order-pdf-modal.component.ts
    │   │   │   │   ├── models
    │   │   │   │   │   └── interfaces
    │   │   │   │   │       ├── index.spec.ts
    │   │   │   │   │       └── index.ts
    │   │   │   │   └── services
    │   │   │   │       └── api
    │   │   │   │           ├── order-pdf-api.service.spec.ts
    │   │   │   │           └── order-pdf-api.service.ts
    │   │   │   ├── purchases
    │   │   │   │   ├── components
    │   │   │   │   │   └── purchase-pdf-modal
    │   │   │   │   │       ├── purchase-pdf-modal.component.html
    │   │   │   │   │       └── purchase-pdf-modal.component.ts
    │   │   │   │   └── services
    │   │   │   │       └── api
    │   │   │   │           └── purchase-pdf-api.service.ts
    │   │   │   ├── quotes
    │   │   │   │   ├── components
    │   │   │   │   │   └── quote-pdf-modal
    │   │   │   │   │       ├── quote-pdf-modal.component.html
    │   │   │   │   │       ├── quote-pdf-modal.component.spec.ts
    │   │   │   │   │       └── quote-pdf-modal.component.ts
    │   │   │   │   └── services
    │   │   │   │       └── api
    │   │   │   │           ├── quote-pdf-api.service.spec.ts
    │   │   │   │           └── quote-pdf-api.service.ts
    │   │   │   └── router
    │   │   │       ├── index.ts
    │   │   │       ├── reports.routes.spec.ts
    │   │   │       └── reports.routes.ts
    │   │   ├── returns
    │   │   │   ├── components
    │   │   │   │   ├── return-form-dialog
    │   │   │   │   │   └── return-form-dialog.component.ts
    │   │   │   │   └── return-lines-table
    │   │   │   │       ├── return-lines-table.component.html
    │   │   │   │       ├── return-lines-table.component.spec.ts
    │   │   │   │       └── return-lines-table.component.ts
    │   │   │   ├── models
    │   │   │   │   ├── enums
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   └── return-type.enum.ts
    │   │   │   │   ├── interfaces
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   └── return.interface.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── pages
    │   │   │   │   ├── return-detail-page
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── return-detail-page.component.html
    │   │   │   │   │   └── return-detail-page.component.ts
    │   │   │   │   ├── return-form-page
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── return-form-page.component.html
    │   │   │   │   │   └── return-form-page.component.ts
    │   │   │   │   └── return-list-page
    │   │   │   │       ├── index.ts
    │   │   │   │       ├── return-list-page.component.html
    │   │   │   │       └── return-list-page.component.ts
    │   │   │   ├── router
    │   │   │   │   ├── index.ts
    │   │   │   │   └── returns.routes.ts
    │   │   │   ├── services
    │   │   │   │   ├── api
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   └── return-api.service.ts
    │   │   │   │   ├── application
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   └── return-application.service.ts
    │   │   │   │   ├── mappers
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   └── return.mapper.ts
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   ├── suppliers
    │   │   │   ├── components
    │   │   │   │   ├── supplier-addresses-section
    │   │   │   │   │   ├── supplier-addresses-section.component.html
    │   │   │   │   │   └── supplier-addresses-section.component.ts
    │   │   │   │   ├── supplier-contact-section
    │   │   │   │   │   ├── supplier-contact-section.component.html
    │   │   │   │   │   └── supplier-contact-section.component.ts
    │   │   │   │   ├── supplier-general-section
    │   │   │   │   │   ├── supplier-general-section.component.html
    │   │   │   │   │   └── supplier-general-section.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── messages
    │   │   │   │   ├── error-messages.ts
    │   │   │   │   ├── index.ts
    │   │   │   │   └── success-messages.ts
    │   │   │   ├── models
    │   │   │   │   ├── enums
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   └── supplier-type.enum.ts
    │   │   │   │   ├── interfaces
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── supplier-create.interface.ts
    │   │   │   │   │   ├── supplier-details.interface.ts
    │   │   │   │   │   ├── supplier-edit.interface.ts
    │   │   │   │   │   └── supplier-list.interface.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── pages
    │   │   │   │   ├── suppliers-details-page
    │   │   │   │   │   ├── suppliers-details-page.component.html
    │   │   │   │   │   └── suppliers-details-page.component.ts
    │   │   │   │   ├── suppliers-form-page
    │   │   │   │   │   ├── suppliers-form-page.component.html
    │   │   │   │   │   └── suppliers-form-page.component.ts
    │   │   │   │   ├── suppliers-list-page
    │   │   │   │   │   ├── suppliers-list-page.component.html
    │   │   │   │   │   └── suppliers-list-page.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── router
    │   │   │   │   ├── index.ts
    │   │   │   │   └── supplier.routes.ts
    │   │   │   ├── services
    │   │   │   │   ├── api
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   └── supplier-api.service.ts
    │   │   │   │   ├── application
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   └── supplier-application.service.ts
    │   │   │   │   ├── mappers
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   └── supplier.mapper.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── validators
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── supplier.validators.spec.ts
    │   │   │   │   └── supplier.validators.ts
    │   │   │   └── index.ts
    │   │   ├── users
    │   │   │   ├── components
    │   │   │   │   ├── change-email-dialog
    │   │   │   │   │   ├── change-email-dialog.component.html
    │   │   │   │   │   ├── change-email-dialog.component.spec.ts
    │   │   │   │   │   └── change-email-dialog.component.ts
    │   │   │   │   ├── change-password-dialog
    │   │   │   │   │   ├── change-password-dialog.component.html
    │   │   │   │   │   ├── change-password-dialog.component.spec.ts
    │   │   │   │   │   └── change-password-dialog.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── messages
    │   │   │   │   ├── error-messages.spec.ts
    │   │   │   │   ├── error-messages.ts
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── success-messages.spec.ts
    │   │   │   │   └── success-messages.ts
    │   │   │   ├── models
    │   │   │   │   ├── enums
    │   │   │   │   │   ├── business-module.enum.spec.ts
    │   │   │   │   │   ├── business-module.enum.ts
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── user-type.enum.spec.ts
    │   │   │   │   │   └── user-type.enum.ts
    │   │   │   │   ├── interfaces
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── user-create.interface.spec.ts
    │   │   │   │   │   ├── user-create.interface.ts
    │   │   │   │   │   ├── user-details.interface.spec.ts
    │   │   │   │   │   ├── user-details.interface.ts
    │   │   │   │   │   ├── user-edit.interface.spec.ts
    │   │   │   │   │   ├── user-edit.interface.ts
    │   │   │   │   │   ├── user-list.interface.spec.ts
    │   │   │   │   │   └── user-list.interface.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── pages
    │   │   │   │   ├── users-details-page
    │   │   │   │   │   ├── users-details-page.component.html
    │   │   │   │   │   ├── users-details-page.component.spec.ts
    │   │   │   │   │   └── users-details-page.component.ts
    │   │   │   │   ├── users-form-page
    │   │   │   │   │   ├── users-form-page.component.html
    │   │   │   │   │   ├── users-form-page.component.spec.ts
    │   │   │   │   │   └── users-form-page.component.ts
    │   │   │   │   ├── users-list-page
    │   │   │   │   │   ├── users-list-page.component.html
    │   │   │   │   │   ├── users-list-page.component.spec.ts
    │   │   │   │   │   └── users-list-page.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── router
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── users.routes.spec.ts
    │   │   │   │   └── users.routes.ts
    │   │   │   ├── services
    │   │   │   │   ├── api
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── user-api.service.spec.ts
    │   │   │   │   │   └── user-api.service.ts
    │   │   │   │   ├── application
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── user-application.service.spec.ts
    │   │   │   │   │   └── user-application.service.ts
    │   │   │   │   ├── mappers
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── user.mapper.spec.ts
    │   │   │   │   │   └── user.mapper.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── validators
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── user.validators.spec.ts
    │   │   │   │   └── user.validators.ts
    │   │   │   └── index.ts
    │   │   └── warehouses
    │   │       ├── components
    │   │       │   ├── warehouse-stock-operation-dialog
    │   │       │   │   ├── warehouse-stock-operation-dialog.component.html
    │   │       │   │   ├── warehouse-stock-operation-dialog.component.spec.ts
    │   │       │   │   └── warehouse-stock-operation-dialog.component.ts
    │   │       │   └── index.ts
    │   │       ├── messages
    │   │       │   ├── error-messages.ts
    │   │       │   ├── index.ts
    │   │       │   └── success-messages.ts
    │   │       ├── models
    │   │       │   ├── enums
    │   │       │   │   ├── index.ts
    │   │       │   │   ├── movement-type.enum.spec.ts
    │   │       │   │   ├── movement-type.enum.ts
    │   │       │   │   └── reference-type.enum.ts
    │   │       │   ├── interfaces
    │   │       │   │   ├── index.ts
    │   │       │   │   ├── warehouse.interfaces.spec.ts
    │   │       │   │   └── warehouse.interfaces.ts
    │   │       │   └── index.ts
    │   │       ├── pages
    │   │       │   ├── warehouse-movements-page
    │   │       │   │   ├── warehouse-movements-page.component.html
    │   │       │   │   ├── warehouse-movements-page.component.spec.ts
    │   │       │   │   └── warehouse-movements-page.component.ts
    │   │       │   ├── warehouse-stock-page
    │   │       │   │   ├── warehouse-stock-page.component.html
    │   │       │   │   ├── warehouse-stock-page.component.spec.ts
    │   │       │   │   └── warehouse-stock-page.component.ts
    │   │       │   ├── warehouses-details-page
    │   │       │   │   ├── warehouses-details-page.component.html
    │   │       │   │   ├── warehouses-details-page.component.spec.ts
    │   │       │   │   └── warehouses-details-page.component.ts
    │   │       │   ├── warehouses-form-page
    │   │       │   │   ├── warehouses-form-page.component.html
    │   │       │   │   ├── warehouses-form-page.component.spec.ts
    │   │       │   │   └── warehouses-form-page.component.ts
    │   │       │   ├── warehouses-list-page
    │   │       │   │   ├── warehouses-list-page.component.html
    │   │       │   │   ├── warehouses-list-page.component.spec.ts
    │   │       │   │   └── warehouses-list-page.component.ts
    │   │       │   └── index.ts
    │   │       ├── router
    │   │       │   ├── index.ts
    │   │       │   ├── warehouse.routes.spec.ts
    │   │       │   └── warehouse.routes.ts
    │   │       └── services
    │   │           ├── api
    │   │           │   ├── index.ts
    │   │           │   ├── warehouse-api.service.spec.ts
    │   │           │   └── warehouse-api.service.ts
    │   │           ├── application
    │   │           │   ├── index.ts
    │   │           │   ├── warehouse-application.service.spec.ts
    │   │           │   └── warehouse-application.service.ts
    │   │           └── index.ts
    │   ├── shared
    │   │   ├── components
    │   │   │   ├── details
    │   │   │   │   ├── detail-actions-menu
    │   │   │   │   │   ├── detail-actions-menu.component.html
    │   │   │   │   │   ├── detail-actions-menu.component.spec.ts
    │   │   │   │   │   └── detail-actions-menu.component.ts
    │   │   │   │   ├── details-card
    │   │   │   │   │   ├── details-card.component.html
    │   │   │   │   │   ├── details-card.component.spec.ts
    │   │   │   │   │   └── details-card.component.ts
    │   │   │   │   ├── details-card-header
    │   │   │   │   │   ├── details-card-header.component.html
    │   │   │   │   │   ├── details-card-header.component.spec.ts
    │   │   │   │   │   └── details-card-header.component.ts
    │   │   │   │   ├── details-info-field
    │   │   │   │   │   ├── details-info-field.component.html
    │   │   │   │   │   ├── details-info-field.component.spec.ts
    │   │   │   │   │   └── details-info-field.component.ts
    │   │   │   │   ├── details-info-grid
    │   │   │   │   │   ├── details-info-grid.component.html
    │   │   │   │   │   ├── details-info-grid.component.spec.ts
    │   │   │   │   │   └── details-info-grid.component.ts
    │   │   │   │   ├── details-list-item
    │   │   │   │   │   ├── details-list-item.component.html
    │   │   │   │   │   ├── details-list-item.component.spec.ts
    │   │   │   │   │   └── details-list-item.component.ts
    │   │   │   │   ├── details-section-card
    │   │   │   │   │   ├── details-section-card.component.html
    │   │   │   │   │   ├── details-section-card.component.spec.ts
    │   │   │   │   │   └── details-section-card.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── list
    │   │   │   │   ├── list-action-buttons
    │   │   │   │   │   ├── list-action-buttons.component.html
    │   │   │   │   │   ├── list-action-buttons.component.spec.ts
    │   │   │   │   │   └── list-action-buttons.component.ts
    │   │   │   │   ├── list-container
    │   │   │   │   │   ├── list-container.component.html
    │   │   │   │   │   ├── list-container.component.spec.ts
    │   │   │   │   │   └── list-container.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── ui
    │   │   │   │   ├── content-card
    │   │   │   │   │   ├── content-card.component.html
    │   │   │   │   │   ├── content-card.component.spec.ts
    │   │   │   │   │   └── content-card.component.ts
    │   │   │   │   ├── empty-state
    │   │   │   │   │   ├── empty-state.component.html
    │   │   │   │   │   ├── empty-state.component.spec.ts
    │   │   │   │   │   └── empty-state.component.ts
    │   │   │   │   ├── image-viewer-dialog
    │   │   │   │   │   ├── image-viewer-dialog.component.html
    │   │   │   │   │   ├── image-viewer-dialog.component.spec.ts
    │   │   │   │   │   ├── image-viewer-dialog.component.ts
    │   │   │   │   │   └── README.md
    │   │   │   │   ├── loading-spinner
    │   │   │   │   │   ├── loading-spinner.component.html
    │   │   │   │   │   ├── loading-spinner.component.spec.ts
    │   │   │   │   │   └── loading-spinner.component.ts
    │   │   │   │   ├── page-header
    │   │   │   │   │   ├── page-header.component.html
    │   │   │   │   │   ├── page-header.component.spec.ts
    │   │   │   │   │   └── page-header.component.ts
    │   │   │   │   ├── search-field
    │   │   │   │   │   ├── search-field.component.html
    │   │   │   │   │   ├── search-field.component.spec.ts
    │   │   │   │   │   └── search-field.component.ts
    │   │   │   │   ├── status-badge
    │   │   │   │   │   ├── status-badge.component.html
    │   │   │   │   │   ├── status-badge.component.spec.ts
    │   │   │   │   │   └── status-badge.component.ts
    │   │   │   │   ├── text-badge
    │   │   │   │   │   ├── text-badge.component.html
    │   │   │   │   │   ├── text-badge.component.spec.ts
    │   │   │   │   │   └── text-badge.component.ts
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   ├── models
    │   │   │   ├── interfaces
    │   │   │   │   ├── index.ts
    │   │   │   │   └── paged-response.interface.ts
    │   │   │   └── index.ts
    │   │   ├── pipes
    │   │   │   ├── currency.pipe.spec.ts
    │   │   │   ├── currency.pipe.ts
    │   │   │   ├── date-format.pipe.spec.ts
    │   │   │   ├── date-format.pipe.ts
    │   │   │   └── index.ts
    │   │   ├── ui
    │   │   │   ├── invoice-picker-dialog
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── invoice-picker-dialog.component.html
    │   │   │   │   ├── invoice-picker-dialog.component.spec.ts
    │   │   │   │   └── invoice-picker-dialog.component.ts
    │   │   │   ├── note-form-dialog
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── note-form-dialog.component.html
    │   │   │   │   ├── note-form-dialog.component.spec.ts
    │   │   │   │   └── note-form-dialog.component.ts
    │   │   │   ├── payment-method-picker
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── payment-method-picker.component.html
    │   │   │   │   ├── payment-method-picker.component.spec.ts
    │   │   │   │   └── payment-method-picker.component.ts
    │   │   │   └── index.ts
    │   │   └── utils
    │   │       ├── date.utils.spec.ts
    │   │       ├── date.utils.ts
    │   │       ├── file-download.helper.spec.ts
    │   │       └── file-download.helper.ts
    │   ├── app.config.ts
    │   ├── app.routes.spec.ts
    │   ├── app.routes.ts
    │   └── app.ts
    ├── environments
    │   ├── environment.prod.ts
    │   └── environment.ts
    ├── index.html
    ├── main.ts
    ├── styles.css
    ├── test-helpers.ts
    └── test-setup.ts
```

## After

```text
└── src
    ├── app
    │   ├── core
    │   │   ├── exceptions
    │   │   │   ├── http-error.handler.spec.ts
    │   │   │   ├── http-error.handler.ts
    │   │   │   └── index.ts
    │   │   ├── forms
    │   │   │   ├── base
    │   │   │   │   ├── base-form.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── components
    │   │   │   │   ├── cards
    │   │   │   │   │   ├── field-group
    │   │   │   │   │   │   ├── field-group.component.html
    │   │   │   │   │   │   ├── field-group.component.spec.ts
    │   │   │   │   │   │   └── field-group.component.ts
    │   │   │   │   │   ├── form-card
    │   │   │   │   │   │   ├── form-card.component.html
    │   │   │   │   │   │   ├── form-card.component.spec.ts
    │   │   │   │   │   │   └── form-card.component.ts
    │   │   │   │   │   ├── form-container
    │   │   │   │   │   │   ├── form-container.component.html
    │   │   │   │   │   │   ├── form-container.component.spec.ts
    │   │   │   │   │   │   └── form-container.component.ts
    │   │   │   │   │   ├── section-card
    │   │   │   │   │   │   ├── section-card.component.html
    │   │   │   │   │   │   ├── section-card.component.spec.ts
    │   │   │   │   │   │   └── section-card.component.ts
    │   │   │   │   │   ├── tab-content
    │   │   │   │   │   │   ├── tab-content.component.html
    │   │   │   │   │   │   ├── tab-content.component.spec.ts
    │   │   │   │   │   │   └── tab-content.component.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── dynamic-lists
    │   │   │   │   │   ├── list-item
    │   │   │   │   │   │   ├── list-item.component.html
    │   │   │   │   │   │   ├── list-item.component.spec.ts
    │   │   │   │   │   │   └── list-item.component.ts
    │   │   │   │   │   ├── list-section
    │   │   │   │   │   │   ├── list-section.component.html
    │   │   │   │   │   │   ├── list-section.component.spec.ts
    │   │   │   │   │   │   └── list-section.component.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── headers
    │   │   │   │   │   ├── form-actions
    │   │   │   │   │   │   ├── form-actions.component.html
    │   │   │   │   │   │   ├── form-actions.component.spec.ts
    │   │   │   │   │   │   └── form-actions.component.ts
    │   │   │   │   │   ├── form-header
    │   │   │   │   │   │   ├── form-header.component.html
    │   │   │   │   │   │   ├── form-header.component.spec.ts
    │   │   │   │   │   │   └── form-header.component.ts
    │   │   │   │   │   ├── section-header
    │   │   │   │   │   │   ├── section-header.component.html
    │   │   │   │   │   │   ├── section-header.component.spec.ts
    │   │   │   │   │   │   └── section-header.component.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── inputs
    │   │   │   │   │   ├── checkbox-input
    │   │   │   │   │   │   ├── checkbox-input.component.html
    │   │   │   │   │   │   ├── checkbox-input.component.spec.ts
    │   │   │   │   │   │   └── checkbox-input.component.ts
    │   │   │   │   │   ├── file-input
    │   │   │   │   │   │   ├── file-input.component.html
    │   │   │   │   │   │   ├── file-input.component.spec.ts
    │   │   │   │   │   │   └── file-input.component.ts
    │   │   │   │   │   ├── number-input
    │   │   │   │   │   │   ├── number-input.component.html
    │   │   │   │   │   │   ├── number-input.component.spec.ts
    │   │   │   │   │   │   └── number-input.component.ts
    │   │   │   │   │   ├── select-input
    │   │   │   │   │   │   ├── select-input.component.html
    │   │   │   │   │   │   ├── select-input.component.spec.ts
    │   │   │   │   │   │   └── select-input.component.ts
    │   │   │   │   │   ├── text-input
    │   │   │   │   │   │   ├── text-input.component.html
    │   │   │   │   │   │   ├── text-input.component.spec.ts
    │   │   │   │   │   │   └── text-input.component.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── enums
    │   │   │   │   ├── form-mode.enum.ts
    │   │   │   │   ├── index.ts
    │   │   │   │   └── message-action.enum.ts
    │   │   │   └── index.ts
    │   │   ├── layouts
    │   │   │   ├── config
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── menu.config.spec.ts
    │   │   │   │   └── menu.config.ts
    │   │   │   ├── models
    │   │   │   │   ├── index.ts
    │   │   │   │   └── menu-item.model.ts
    │   │   │   ├── index.ts
    │   │   │   ├── main-layout.component.html
    │   │   │   ├── main-layout.component.spec.ts
    │   │   │   └── main-layout.component.ts
    │   │   ├── pdf-viewer
    │   │   │   ├── components
    │   │   │   │   ├── pdf-viewer-dialog
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── pdf-viewer-dialog.component.html
    │   │   │   │   │   └── pdf-viewer-dialog.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── models
    │   │   │   │   ├── index.ts
    │   │   │   │   └── pdf-viewer.model.ts
    │   │   │   ├── services
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── pdf-viewer.service.spec.ts
    │   │   │   │   └── pdf-viewer.service.ts
    │   │   │   └── index.ts
    │   │   ├── pending-tabs
    │   │   │   ├── components
    │   │   │   │   ├── pending-tabs-dropdown
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── pending-tabs-dropdown.component.html
    │   │   │   │   │   ├── pending-tabs-dropdown.component.spec.ts
    │   │   │   │   │   └── pending-tabs-dropdown.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── constants
    │   │   │   │   ├── index.ts
    │   │   │   │   └── pending-tabs.constants.ts
    │   │   │   ├── models
    │   │   │   │   ├── index.ts
    │   │   │   │   └── pending-tab.interface.ts
    │   │   │   ├── index.ts
    │   │   │   ├── pending-tabs.service.spec.ts
    │   │   │   └── pending-tabs.service.ts
    │   │   └── theme
    │   │       ├── components
    │   │       │   ├── theme-toggle
    │   │       │   │   ├── index.ts
    │   │       │   │   ├── theme-toggle.component.html
    │   │       │   │   ├── theme-toggle.component.spec.ts
    │   │       │   │   ├── theme-toggle.component.ts
    │   │       │   │   ├── theme.service.spec.ts
    │   │       │   │   └── theme.service.ts
    │   │       │   └── index.ts
    │   │       ├── presets
    │   │       │   ├── index.ts
    │   │       │   └── theme.preset.ts
    │   │       └── index.ts
    │   ├── features
    │   │   ├── analytics
    │   │   │   ├── dashboard
    │   │   │   │   ├── pages
    │   │   │   │   │   └── dashboard-page
    │   │   │   │   │       ├── dashboard-page.component.html
    │   │   │   │   │       ├── dashboard-page.component.spec.ts
    │   │   │   │   │       └── dashboard-page.component.ts
    │   │   │   │   └── services
    │   │   │   │       └── api
    │   │   │   │           └── dashboard-api.service.ts
    │   │   │   └── reporting
    │   │   │       └── routing
    │   │   │           ├── index.ts
    │   │   │           ├── reports.routes.spec.ts
    │   │   │           └── reports.routes.ts
    │   │   ├── catalog
    │   │   │   ├── categories
    │   │   │   │   ├── models
    │   │   │   │   │   ├── interfaces
    │   │   │   │   │   │   ├── category-create.interface.spec.ts
    │   │   │   │   │   │   ├── category-create.interface.ts
    │   │   │   │   │   │   ├── category-details.interface.spec.ts
    │   │   │   │   │   │   ├── category-details.interface.ts
    │   │   │   │   │   │   ├── category-list.interface.spec.ts
    │   │   │   │   │   │   ├── category-list.interface.ts
    │   │   │   │   │   │   ├── category-update.interface.spec.ts
    │   │   │   │   │   │   ├── category-update.interface.ts
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── pages
    │   │   │   │   │   ├── categories-details-page
    │   │   │   │   │   │   ├── categories-details-page.component.html
    │   │   │   │   │   │   ├── categories-details-page.component.spec.ts
    │   │   │   │   │   │   └── categories-details-page.component.ts
    │   │   │   │   │   ├── categories-form-page
    │   │   │   │   │   │   ├── categories-form-page.component.html
    │   │   │   │   │   │   ├── categories-form-page.component.spec.ts
    │   │   │   │   │   │   └── categories-form-page.component.ts
    │   │   │   │   │   ├── categories-list-page
    │   │   │   │   │   │   ├── categories-list-page.component.html
    │   │   │   │   │   │   ├── categories-list-page.component.spec.ts
    │   │   │   │   │   │   └── categories-list-page.component.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── routing
    │   │   │   │   │   ├── category.routes.spec.ts
    │   │   │   │   │   ├── category.routes.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   └── services
    │   │   │   │       ├── api
    │   │   │   │       │   ├── category-api.service.spec.ts
    │   │   │   │       │   ├── category-api.service.ts
    │   │   │   │       │   └── index.ts
    │   │   │   │       ├── application
    │   │   │   │       │   ├── category-application.service.spec.ts
    │   │   │   │       │   ├── category-application.service.ts
    │   │   │   │       │   └── index.ts
    │   │   │   │       └── index.ts
    │   │   │   ├── price-types
    │   │   │   │   ├── models
    │   │   │   │   │   └── interfaces
    │   │   │   │   │       ├── index.ts
    │   │   │   │   │       ├── price-type-create.interface.spec.ts
    │   │   │   │   │       ├── price-type-create.interface.ts
    │   │   │   │   │       ├── price-type-details.interface.spec.ts
    │   │   │   │   │       ├── price-type-details.interface.ts
    │   │   │   │   │       ├── price-type-list.interface.spec.ts
    │   │   │   │   │       ├── price-type-list.interface.ts
    │   │   │   │   │       ├── price-type-update.interface.spec.ts
    │   │   │   │   │       └── price-type-update.interface.ts
    │   │   │   │   ├── pages
    │   │   │   │   │   ├── price-types-details-page
    │   │   │   │   │   │   ├── price-types-details-page.component.html
    │   │   │   │   │   │   ├── price-types-details-page.component.spec.ts
    │   │   │   │   │   │   └── price-types-details-page.component.ts
    │   │   │   │   │   ├── price-types-form-page
    │   │   │   │   │   │   ├── price-types-form-page.component.html
    │   │   │   │   │   │   ├── price-types-form-page.component.spec.ts
    │   │   │   │   │   │   └── price-types-form-page.component.ts
    │   │   │   │   │   ├── price-types-list-page
    │   │   │   │   │   │   ├── price-types-list-page.component.html
    │   │   │   │   │   │   ├── price-types-list-page.component.spec.ts
    │   │   │   │   │   │   └── price-types-list-page.component.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── routing
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── price-type.routes.spec.ts
    │   │   │   │   │   └── price-type.routes.ts
    │   │   │   │   └── services
    │   │   │   │       ├── api
    │   │   │   │       │   ├── price-type-api.service.spec.ts
    │   │   │   │       │   └── price-type-api.service.ts
    │   │   │   │       └── application
    │   │   │   │           ├── price-type-application.service.spec.ts
    │   │   │   │           └── price-type-application.service.ts
    │   │   │   └── products
    │   │   │       ├── components
    │   │   │       │   ├── product-composition-section
    │   │   │       │   │   ├── product-composition-section.component.html
    │   │   │       │   │   ├── product-composition-section.component.spec.ts
    │   │   │       │   │   └── product-composition-section.component.ts
    │   │   │       │   ├── product-general-section
    │   │   │       │   │   ├── product-general-section.component.html
    │   │   │       │   │   ├── product-general-section.component.spec.ts
    │   │   │       │   │   └── product-general-section.component.ts
    │   │   │       │   └── product-prices-section
    │   │   │       │       ├── product-prices-section.component.html
    │   │   │       │       ├── product-prices-section.component.spec.ts
    │   │   │       │       └── product-prices-section.component.ts
    │   │   │       ├── models
    │   │   │       │   ├── enums
    │   │   │       │   │   ├── index.ts
    │   │   │       │   │   ├── product-type.enum.spec.ts
    │   │   │       │   │   └── product-type.enum.ts
    │   │   │       │   ├── interfaces
    │   │   │       │   │   ├── index.ts
    │   │   │       │   │   ├── product-create-update.interface.spec.ts
    │   │   │       │   │   ├── product-create-update.interface.ts
    │   │   │       │   │   ├── product-details.interface.spec.ts
    │   │   │       │   │   ├── product-details.interface.ts
    │   │   │       │   │   ├── product-list.interface.spec.ts
    │   │   │       │   │   ├── product-list.interface.ts
    │   │   │       │   │   ├── product-price-form-item.interface.spec.ts
    │   │   │       │   │   ├── product-price-form-item.interface.ts
    │   │   │       │   │   ├── product-price-item.interface.spec.ts
    │   │   │       │   │   ├── product-price-item.interface.ts
    │   │   │       │   │   ├── product-stock-by-warehouse.interface.spec.ts
    │   │   │       │   │   └── product-stock-by-warehouse.interface.ts
    │   │   │       │   └── index.ts
    │   │   │       ├── pages
    │   │   │       │   ├── products-details-page
    │   │   │       │   │   ├── products-details-page.component.html
    │   │   │       │   │   ├── products-details-page.component.spec.ts
    │   │   │       │   │   └── products-details-page.component.ts
    │   │   │       │   ├── products-form-page
    │   │   │       │   │   ├── products-form-page.component.html
    │   │   │       │   │   ├── products-form-page.component.spec.ts
    │   │   │       │   │   └── products-form-page.component.ts
    │   │   │       │   ├── products-list-page
    │   │   │       │   │   ├── products-list-page.component.html
    │   │   │       │   │   ├── products-list-page.component.spec.ts
    │   │   │       │   │   └── products-list-page.component.ts
    │   │   │       │   └── index.ts
    │   │   │       ├── reporting
    │   │   │       │   ├── components
    │   │   │       │   │   ├── catalog-pdf-modal
    │   │   │       │   │   │   ├── catalog-pdf-modal.component.html
    │   │   │       │   │   │   ├── catalog-pdf-modal.component.spec.ts
    │   │   │       │   │   │   ├── catalog-pdf-modal.component.ts
    │   │   │       │   │   │   └── index.ts
    │   │   │       │   │   └── commercial-catalog-pdf-modal
    │   │   │       │   │       ├── commercial-catalog-pdf-modal.component.html
    │   │   │       │   │       ├── commercial-catalog-pdf-modal.component.spec.ts
    │   │   │       │   │       ├── commercial-catalog-pdf-modal.component.ts
    │   │   │       │   │       └── index.ts
    │   │   │       │   ├── models
    │   │   │       │   │   └── interfaces
    │   │   │       │   │       ├── catalog-filters.interface.spec.ts
    │   │   │       │   │       ├── catalog-filters.interface.ts
    │   │   │       │   │       ├── catalog-item.interface.spec.ts
    │   │   │       │   │       ├── catalog-item.interface.ts
    │   │   │       │   │       ├── catalog-pdf-filters.interface.spec.ts
    │   │   │       │   │       ├── catalog-pdf-filters.interface.ts
    │   │   │       │   │       └── commercial-catalog-pdf-filters.interface.ts
    │   │   │       │   └── services
    │   │   │       │       ├── api
    │   │   │       │       │   ├── catalog-api.service.spec.ts
    │   │   │       │       │   ├── catalog-api.service.ts
    │   │   │       │       │   ├── catalog-pdf-api.service.spec.ts
    │   │   │       │       │   ├── catalog-pdf-api.service.ts
    │   │   │       │       │   ├── commercial-catalog-pdf-api.service.spec.ts
    │   │   │       │       │   └── commercial-catalog-pdf-api.service.ts
    │   │   │       │       └── application
    │   │   │       │           ├── catalog-application.service.spec.ts
    │   │   │       │           └── catalog-application.service.ts
    │   │   │       ├── routing
    │   │   │       │   ├── index.ts
    │   │   │       │   ├── product.routes.spec.ts
    │   │   │       │   └── product.routes.ts
    │   │   │       └── services
    │   │   │           ├── api
    │   │   │           │   ├── index.ts
    │   │   │           │   ├── product-api.service.spec.ts
    │   │   │           │   ├── product-api.service.ts
    │   │   │           │   ├── product-photo.service.spec.ts
    │   │   │           │   └── product-photo.service.ts
    │   │   │           ├── application
    │   │   │           │   ├── index.ts
    │   │   │           │   ├── product-application.service.spec.ts
    │   │   │           │   └── product-application.service.ts
    │   │   │           └── index.ts
    │   │   ├── finance
    │   │   │   ├── billing
    │   │   │   │   ├── credit-notes
    │   │   │   │   │   ├── models
    │   │   │   │   │   │   ├── enums
    │   │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   │   ├── interfaces
    │   │   │   │   │   │   │   ├── credit-note.interface.ts
    │   │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   ├── pages
    │   │   │   │   │   │   ├── credit-note-detail-page
    │   │   │   │   │   │   │   ├── credit-note-detail-page.component.html
    │   │   │   │   │   │   │   └── credit-note-detail-page.component.ts
    │   │   │   │   │   │   ├── credit-note-form-page
    │   │   │   │   │   │   │   ├── credit-note-form-page.component.html
    │   │   │   │   │   │   │   ├── credit-note-form-page.component.spec.ts
    │   │   │   │   │   │   │   └── credit-note-form-page.component.ts
    │   │   │   │   │   │   └── credit-note-list-page
    │   │   │   │   │   │       ├── credit-note-list-page.component.html
    │   │   │   │   │   │       └── credit-note-list-page.component.ts
    │   │   │   │   │   ├── routing
    │   │   │   │   │   │   ├── credit-notes.routes.ts
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   ├── services
    │   │   │   │   │   │   ├── api
    │   │   │   │   │   │   │   └── credit-note-api.service.ts
    │   │   │   │   │   │   ├── application
    │   │   │   │   │   │   │   └── credit-note-application.service.ts
    │   │   │   │   │   │   └── mappers
    │   │   │   │   │   │       └── credit-note.mapper.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── debit-notes
    │   │   │   │   │   ├── models
    │   │   │   │   │   │   ├── enums
    │   │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   │   ├── interfaces
    │   │   │   │   │   │   │   ├── debit-note.interface.ts
    │   │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   ├── pages
    │   │   │   │   │   │   ├── debit-note-detail-page
    │   │   │   │   │   │   │   ├── debit-note-detail-page.component.html
    │   │   │   │   │   │   │   └── debit-note-detail-page.component.ts
    │   │   │   │   │   │   ├── debit-note-form-page
    │   │   │   │   │   │   │   ├── debit-note-form-page.component.html
    │   │   │   │   │   │   │   └── debit-note-form-page.component.ts
    │   │   │   │   │   │   └── debit-note-list-page
    │   │   │   │   │   │       ├── debit-note-list-page.component.html
    │   │   │   │   │   │       └── debit-note-list-page.component.ts
    │   │   │   │   │   ├── routing
    │   │   │   │   │   │   ├── debit-notes.routes.ts
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   ├── services
    │   │   │   │   │   │   ├── api
    │   │   │   │   │   │   │   └── debit-note-api.service.ts
    │   │   │   │   │   │   ├── application
    │   │   │   │   │   │   │   └── debit-note-application.service.ts
    │   │   │   │   │   │   └── mappers
    │   │   │   │   │   │       └── debit-note.mapper.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── invoices
    │   │   │   │   │   ├── components
    │   │   │   │   │   │   ├── cancel-invoice-dialog
    │   │   │   │   │   │   │   ├── cancel-invoice-dialog.component.html
    │   │   │   │   │   │   │   ├── cancel-invoice-dialog.component.spec.ts
    │   │   │   │   │   │   │   └── cancel-invoice-dialog.component.ts
    │   │   │   │   │   │   ├── duplicate-invoice-dialog
    │   │   │   │   │   │   │   ├── duplicate-invoice-dialog.component.html
    │   │   │   │   │   │   │   ├── duplicate-invoice-dialog.component.spec.ts
    │   │   │   │   │   │   │   └── duplicate-invoice-dialog.component.ts
    │   │   │   │   │   │   └── invoice-source-picker-dialog
    │   │   │   │   │   │       ├── invoice-source-picker-dialog.component.html
    │   │   │   │   │   │       └── invoice-source-picker-dialog.component.ts
    │   │   │   │   │   ├── messages
    │   │   │   │   │   │   ├── error-messages.spec.ts
    │   │   │   │   │   │   ├── error-messages.ts
    │   │   │   │   │   │   ├── index.ts
    │   │   │   │   │   │   ├── success-messages.spec.ts
    │   │   │   │   │   │   └── success-messages.ts
    │   │   │   │   │   ├── models
    │   │   │   │   │   │   ├── enums
    │   │   │   │   │   │   │   ├── index.ts
    │   │   │   │   │   │   │   ├── invoice-status.enum.spec.ts
    │   │   │   │   │   │   │   ├── invoice-status.enum.ts
    │   │   │   │   │   │   │   ├── payment-type.enum.spec.ts
    │   │   │   │   │   │   │   └── payment-type.enum.ts
    │   │   │   │   │   │   ├── interfaces
    │   │   │   │   │   │   │   ├── index.ts
    │   │   │   │   │   │   │   ├── invoice-create.interface.spec.ts
    │   │   │   │   │   │   │   ├── invoice-create.interface.ts
    │   │   │   │   │   │   │   ├── invoice-details.interface.spec.ts
    │   │   │   │   │   │   │   ├── invoice-details.interface.ts
    │   │   │   │   │   │   │   ├── invoice-edit.interface.spec.ts
    │   │   │   │   │   │   │   ├── invoice-edit.interface.ts
    │   │   │   │   │   │   │   ├── invoice-form-data.interface.spec.ts
    │   │   │   │   │   │   │   ├── invoice-form-data.interface.ts
    │   │   │   │   │   │   │   ├── invoice-list.interface.spec.ts
    │   │   │   │   │   │   │   └── invoice-list.interface.ts
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   ├── pages
    │   │   │   │   │   │   ├── invoice-detail-page
    │   │   │   │   │   │   │   ├── invoice-detail-page.component.html
    │   │   │   │   │   │   │   ├── invoice-detail-page.component.spec.ts
    │   │   │   │   │   │   │   └── invoice-detail-page.component.ts
    │   │   │   │   │   │   ├── invoice-form-page
    │   │   │   │   │   │   │   ├── invoice-form-page.component.html
    │   │   │   │   │   │   │   ├── invoice-form-page.component.spec.ts
    │   │   │   │   │   │   │   └── invoice-form-page.component.ts
    │   │   │   │   │   │   └── invoice-list-page
    │   │   │   │   │   │       ├── invoice-list-page.component.html
    │   │   │   │   │   │       ├── invoice-list-page.component.spec.ts
    │   │   │   │   │   │       └── invoice-list-page.component.ts
    │   │   │   │   │   ├── reporting
    │   │   │   │   │   │   ├── components
    │   │   │   │   │   │   │   └── invoice-pdf-modal
    │   │   │   │   │   │   │       ├── invoice-pdf-modal.component.html
    │   │   │   │   │   │   │       ├── invoice-pdf-modal.component.spec.ts
    │   │   │   │   │   │   │       └── invoice-pdf-modal.component.ts
    │   │   │   │   │   │   ├── models
    │   │   │   │   │   │   │   └── interfaces
    │   │   │   │   │   │   │       ├── index.spec.ts
    │   │   │   │   │   │   │       └── index.ts
    │   │   │   │   │   │   └── services
    │   │   │   │   │   │       └── api
    │   │   │   │   │   │           ├── invoice-pdf-api.service.spec.ts
    │   │   │   │   │   │           └── invoice-pdf-api.service.ts
    │   │   │   │   │   ├── routing
    │   │   │   │   │   │   ├── index.ts
    │   │   │   │   │   │   ├── invoices.routes.spec.ts
    │   │   │   │   │   │   └── invoices.routes.ts
    │   │   │   │   │   ├── services
    │   │   │   │   │   │   ├── api
    │   │   │   │   │   │   │   ├── invoice-api.service.spec.ts
    │   │   │   │   │   │   │   └── invoice-api.service.ts
    │   │   │   │   │   │   ├── application
    │   │   │   │   │   │   │   ├── invoice-application.service.spec.ts
    │   │   │   │   │   │   │   └── invoice-application.service.ts
    │   │   │   │   │   │   └── mappers
    │   │   │   │   │   │       ├── invoice.mapper.spec.ts
    │   │   │   │   │   │       └── invoice.mapper.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   └── returns
    │   │   │   │       ├── components
    │   │   │   │       │   ├── return-form-dialog
    │   │   │   │       │   │   └── return-form-dialog.component.ts
    │   │   │   │       │   └── return-lines-table
    │   │   │   │       │       ├── return-lines-table.component.html
    │   │   │   │       │       ├── return-lines-table.component.spec.ts
    │   │   │   │       │       └── return-lines-table.component.ts
    │   │   │   │       ├── models
    │   │   │   │       │   ├── enums
    │   │   │   │       │   │   ├── index.ts
    │   │   │   │       │   │   └── return-type.enum.ts
    │   │   │   │       │   ├── interfaces
    │   │   │   │       │   │   ├── index.ts
    │   │   │   │       │   │   └── return.interface.ts
    │   │   │   │       │   └── index.ts
    │   │   │   │       ├── pages
    │   │   │   │       │   ├── return-detail-page
    │   │   │   │       │   │   ├── index.ts
    │   │   │   │       │   │   ├── return-detail-page.component.html
    │   │   │   │       │   │   └── return-detail-page.component.ts
    │   │   │   │       │   ├── return-form-page
    │   │   │   │       │   │   ├── index.ts
    │   │   │   │       │   │   ├── return-form-page.component.html
    │   │   │   │       │   │   └── return-form-page.component.ts
    │   │   │   │       │   └── return-list-page
    │   │   │   │       │       ├── index.ts
    │   │   │   │       │       ├── return-list-page.component.html
    │   │   │   │       │       └── return-list-page.component.ts
    │   │   │   │       ├── routing
    │   │   │   │       │   ├── index.ts
    │   │   │   │       │   └── returns.routes.ts
    │   │   │   │       ├── services
    │   │   │   │       │   ├── api
    │   │   │   │       │   │   ├── index.ts
    │   │   │   │       │   │   └── return-api.service.ts
    │   │   │   │       │   ├── application
    │   │   │   │       │   │   ├── index.ts
    │   │   │   │       │   │   └── return-application.service.ts
    │   │   │   │       │   ├── mappers
    │   │   │   │       │   │   ├── index.ts
    │   │   │   │       │   │   └── return.mapper.ts
    │   │   │   │       │   └── index.ts
    │   │   │   │       └── index.ts
    │   │   │   └── treasury
    │   │   │       ├── cash-register
    │   │   │       │   ├── models
    │   │   │       │   │   ├── enums
    │   │   │       │   │   │   ├── cash-movement-type.enum.spec.ts
    │   │   │       │   │   │   ├── cash-movement-type.enum.ts
    │   │   │       │   │   │   └── index.ts
    │   │   │       │   │   ├── interfaces
    │   │   │       │   │   │   └── closure.interface.ts
    │   │   │       │   │   └── index.ts
    │   │   │       │   ├── pages
    │   │   │       │   │   ├── cash-register-history-page
    │   │   │       │   │   │   ├── cash-register-history-page.component.html
    │   │   │       │   │   │   ├── cash-register-history-page.component.spec.ts
    │   │   │       │   │   │   ├── cash-register-history-page.component.ts
    │   │   │       │   │   │   └── index.ts
    │   │   │       │   │   └── cash-register-page
    │   │   │       │   │       ├── cash-register-page.component.html
    │   │   │       │   │       ├── cash-register-page.component.spec.ts
    │   │   │       │   │       └── cash-register-page.component.ts
    │   │   │       │   ├── reporting
    │   │   │       │   │   ├── components
    │   │   │       │   │   │   └── cash-register-report-modal
    │   │   │       │   │   │       ├── cash-register-report-modal.component.html
    │   │   │       │   │   │       ├── cash-register-report-modal.component.spec.ts
    │   │   │       │   │   │       └── cash-register-report-modal.component.ts
    │   │   │       │   │   └── models
    │   │   │       │   │       └── interfaces
    │   │   │       │   │           └── index.ts
    │   │   │       │   ├── routing
    │   │   │       │   │   ├── cash-register.routes.ts
    │   │   │       │   │   └── index.ts
    │   │   │       │   ├── services
    │   │   │       │   │   ├── api
    │   │   │       │   │   │   ├── cash-register-api.service.spec.ts
    │   │   │       │   │   │   └── cash-register-api.service.ts
    │   │   │       │   │   ├── application
    │   │   │       │   │   │   └── cash-register-application.service.ts
    │   │   │       │   │   └── index.ts
    │   │   │       │   └── index.ts
    │   │   │       ├── payment-methods
    │   │   │       │   ├── models
    │   │   │       │   │   ├── interfaces
    │   │   │       │   │   │   ├── index.ts
    │   │   │       │   │   │   └── payment-method.interface.ts
    │   │   │       │   │   └── index.ts
    │   │   │       │   ├── pages
    │   │   │       │   │   ├── payment-method-detail-page
    │   │   │       │   │   │   ├── payment-method-detail-page.component.html
    │   │   │       │   │   │   └── payment-method-detail-page.component.ts
    │   │   │       │   │   ├── payment-method-form-page
    │   │   │       │   │   │   ├── payment-method-form-page.component.html
    │   │   │       │   │   │   └── payment-method-form-page.component.ts
    │   │   │       │   │   └── payment-method-list-page
    │   │   │       │   │       ├── payment-method-list-page.component.html
    │   │   │       │   │       └── payment-method-list-page.component.ts
    │   │   │       │   ├── routing
    │   │   │       │   │   ├── index.ts
    │   │   │       │   │   └── payment-methods.routes.ts
    │   │   │       │   ├── services
    │   │   │       │   │   ├── api
    │   │   │       │   │   │   └── payment-method-api.service.ts
    │   │   │       │   │   ├── application
    │   │   │       │   │   │   └── payment-method-application.service.ts
    │   │   │       │   │   └── mappers
    │   │   │       │   │       └── payment-method.mapper.ts
    │   │   │       │   └── index.ts
    │   │   │       ├── payments
    │   │   │       │   └── reporting
    │   │   │       │       ├── components
    │   │   │       │       │   └── payment-pdf-modal
    │   │   │       │       │       ├── payment-pdf-modal.component.html
    │   │   │       │       │       ├── payment-pdf-modal.component.spec.ts
    │   │   │       │       │       └── payment-pdf-modal.component.ts
    │   │   │       │       ├── models
    │   │   │       │       │   ├── interfaces
    │   │   │       │       │   │   └── index.ts
    │   │   │       │       │   └── index.ts
    │   │   │       │       ├── services
    │   │   │       │       │   ├── api
    │   │   │       │       │   │   ├── index.ts
    │   │   │       │       │   │   ├── payment-pdf-api.service.spec.ts
    │   │   │       │       │   │   └── payment-pdf-api.service.ts
    │   │   │       │       │   └── index.ts
    │   │   │       │       └── index.ts
    │   │   │       └── receivables
    │   │   │           ├── components
    │   │   │           │   ├── customer-debt-dialog
    │   │   │           │   │   ├── customer-debt-dialog.component.html
    │   │   │           │   │   └── customer-debt-dialog.component.ts
    │   │   │           │   ├── invoice-pending-payments-dialog
    │   │   │           │   │   ├── invoice-pending-payments-dialog.component.html
    │   │   │           │   │   └── invoice-pending-payments-dialog.component.ts
    │   │   │           │   ├── merchant-payments-tab
    │   │   │           │   │   ├── merchant-payments-tab.component.html
    │   │   │           │   │   └── merchant-payments-tab.component.ts
    │   │   │           │   ├── payment-detail-dialog
    │   │   │           │   │   ├── payment-detail-dialog.component.html
    │   │   │           │   │   └── payment-detail-dialog.component.ts
    │   │   │           │   ├── payment-form-dialog
    │   │   │           │   │   ├── payment-form-dialog.component.html
    │   │   │           │   │   └── payment-form-dialog.component.ts
    │   │   │           │   ├── payment-history-dialog
    │   │   │           │   │   ├── payment-history-dialog.component.html
    │   │   │           │   │   └── payment-history-dialog.component.ts
    │   │   │           │   ├── pending-payments-tab
    │   │   │           │   │   ├── pending-payments-tab.component.html
    │   │   │           │   │   ├── pending-payments-tab.component.spec.ts
    │   │   │           │   │   └── pending-payments-tab.component.ts
    │   │   │           │   └── index.ts
    │   │   │           ├── messages
    │   │   │           │   ├── error-messages.ts
    │   │   │           │   ├── index.ts
    │   │   │           │   └── success-messages.ts
    │   │   │           ├── models
    │   │   │           │   ├── interfaces
    │   │   │           │   │   ├── credit-status.interface.ts
    │   │   │           │   │   ├── customer-debt-list.interface.ts
    │   │   │           │   │   ├── customer-debt-summary.interface.ts
    │   │   │           │   │   ├── customer-invoice-debt.interface.ts
    │   │   │           │   │   ├── global-debt-summary.interface.ts
    │   │   │           │   │   ├── index.ts
    │   │   │           │   │   ├── payment-request.interface.ts
    │   │   │           │   │   ├── payment-result.interface.ts
    │   │   │           │   │   └── pending-payment.interface.ts
    │   │   │           │   └── index.ts
    │   │   │           ├── pages
    │   │   │           │   └── receivables-page
    │   │   │           │       ├── receivables-page.component.html
    │   │   │           │       └── receivables-page.component.ts
    │   │   │           ├── reporting
    │   │   │           │   ├── components
    │   │   │           │   │   └── accounts-receivable-pdf-modal
    │   │   │           │   │       ├── accounts-receivable-pdf-modal.component.html
    │   │   │           │   │       └── accounts-receivable-pdf-modal.component.ts
    │   │   │           │   ├── models
    │   │   │           │   │   └── interfaces
    │   │   │           │   │       └── index.ts
    │   │   │           │   └── services
    │   │   │           │       └── api
    │   │   │           │           ├── receivables-pdf-api.service.spec.ts
    │   │   │           │           └── receivables-pdf-api.service.ts
    │   │   │           ├── routing
    │   │   │           │   ├── index.ts
    │   │   │           │   └── receivables.routes.ts
    │   │   │           ├── services
    │   │   │           │   ├── api
    │   │   │           │   │   ├── index.ts
    │   │   │           │   │   └── receivables-api.service.ts
    │   │   │           │   ├── application
    │   │   │           │   │   ├── index.ts
    │   │   │           │   │   └── receivables-application.service.ts
    │   │   │           │   └── index.ts
    │   │   │           └── index.ts
    │   │   ├── inventory
    │   │   │   └── warehouses
    │   │   │       ├── components
    │   │   │       │   ├── warehouse-stock-operation-dialog
    │   │   │       │   │   ├── warehouse-stock-operation-dialog.component.html
    │   │   │       │   │   ├── warehouse-stock-operation-dialog.component.spec.ts
    │   │   │       │   │   └── warehouse-stock-operation-dialog.component.ts
    │   │   │       │   └── index.ts
    │   │   │       ├── messages
    │   │   │       │   ├── error-messages.ts
    │   │   │       │   ├── index.ts
    │   │   │       │   └── success-messages.ts
    │   │   │       ├── models
    │   │   │       │   ├── enums
    │   │   │       │   │   ├── index.ts
    │   │   │       │   │   ├── movement-type.enum.spec.ts
    │   │   │       │   │   ├── movement-type.enum.ts
    │   │   │       │   │   └── reference-type.enum.ts
    │   │   │       │   ├── interfaces
    │   │   │       │   │   ├── index.ts
    │   │   │       │   │   ├── warehouse.interfaces.spec.ts
    │   │   │       │   │   └── warehouse.interfaces.ts
    │   │   │       │   └── index.ts
    │   │   │       ├── pages
    │   │   │       │   ├── warehouse-movements-page
    │   │   │       │   │   ├── warehouse-movements-page.component.html
    │   │   │       │   │   ├── warehouse-movements-page.component.spec.ts
    │   │   │       │   │   └── warehouse-movements-page.component.ts
    │   │   │       │   ├── warehouse-stock-page
    │   │   │       │   │   ├── warehouse-stock-page.component.html
    │   │   │       │   │   ├── warehouse-stock-page.component.spec.ts
    │   │   │       │   │   └── warehouse-stock-page.component.ts
    │   │   │       │   ├── warehouses-details-page
    │   │   │       │   │   ├── warehouses-details-page.component.html
    │   │   │       │   │   ├── warehouses-details-page.component.spec.ts
    │   │   │       │   │   └── warehouses-details-page.component.ts
    │   │   │       │   ├── warehouses-form-page
    │   │   │       │   │   ├── warehouses-form-page.component.html
    │   │   │       │   │   ├── warehouses-form-page.component.spec.ts
    │   │   │       │   │   └── warehouses-form-page.component.ts
    │   │   │       │   ├── warehouses-list-page
    │   │   │       │   │   ├── warehouses-list-page.component.html
    │   │   │       │   │   ├── warehouses-list-page.component.spec.ts
    │   │   │       │   │   └── warehouses-list-page.component.ts
    │   │   │       │   └── index.ts
    │   │   │       ├── reporting
    │   │   │       │   ├── components
    │   │   │       │   │   ├── movements-pdf-modal
    │   │   │       │   │   │   ├── index.ts
    │   │   │       │   │   │   ├── movements-pdf-modal.component.html
    │   │   │       │   │   │   ├── movements-pdf-modal.component.spec.ts
    │   │   │       │   │   │   └── movements-pdf-modal.component.ts
    │   │   │       │   │   ├── stock-pdf-modal
    │   │   │       │   │   │   ├── index.ts
    │   │   │       │   │   │   ├── stock-pdf-modal.component.html
    │   │   │       │   │   │   ├── stock-pdf-modal.component.spec.ts
    │   │   │       │   │   │   └── stock-pdf-modal.component.ts
    │   │   │       │   │   └── index.ts
    │   │   │       │   ├── models
    │   │   │       │   │   ├── interfaces
    │   │   │       │   │   │   ├── index.ts
    │   │   │       │   │   │   ├── movements-pdf-filters.interface.spec.ts
    │   │   │       │   │   │   ├── movements-pdf-filters.interface.ts
    │   │   │       │   │   │   ├── stock-pdf-filters.interface.spec.ts
    │   │   │       │   │   │   └── stock-pdf-filters.interface.ts
    │   │   │       │   │   └── index.ts
    │   │   │       │   ├── pages
    │   │   │       │   │   ├── inventory-reports-page.component.html
    │   │   │       │   │   └── inventory-reports-page.component.ts
    │   │   │       │   ├── routing
    │   │   │       │   │   ├── index.ts
    │   │   │       │   │   ├── inventory-reports.routes.spec.ts
    │   │   │       │   │   └── inventory-reports.routes.ts
    │   │   │       │   └── services
    │   │   │       │       ├── api
    │   │   │       │       │   ├── index.ts
    │   │   │       │       │   ├── movements-excel-api.service.ts
    │   │   │       │       │   ├── movements-pdf-api.service.spec.ts
    │   │   │       │       │   ├── movements-pdf-api.service.ts
    │   │   │       │       │   ├── stock-excel-api.service.ts
    │   │   │       │       │   ├── stock-pdf-api.service.spec.ts
    │   │   │       │       │   └── stock-pdf-api.service.ts
    │   │   │       │       └── index.ts
    │   │   │       ├── routing
    │   │   │       │   ├── index.ts
    │   │   │       │   ├── warehouse.routes.spec.ts
    │   │   │       │   └── warehouse.routes.ts
    │   │   │       └── services
    │   │   │           ├── api
    │   │   │           │   ├── index.ts
    │   │   │           │   ├── warehouse-api.service.spec.ts
    │   │   │           │   └── warehouse-api.service.ts
    │   │   │           ├── application
    │   │   │           │   ├── index.ts
    │   │   │           │   ├── warehouse-application.service.spec.ts
    │   │   │           │   └── warehouse-application.service.ts
    │   │   │           └── index.ts
    │   │   ├── partners
    │   │   │   ├── customers
    │   │   │   │   ├── components
    │   │   │   │   │   ├── balance-summary-card
    │   │   │   │   │   │   ├── balance-summary-card.component.html
    │   │   │   │   │   │   └── balance-summary-card.component.ts
    │   │   │   │   │   ├── balance-transactions-table
    │   │   │   │   │   │   ├── balance-transactions-table.component.html
    │   │   │   │   │   │   ├── balance-transactions-table.component.spec.ts
    │   │   │   │   │   │   └── balance-transactions-table.component.ts
    │   │   │   │   │   ├── customer-addresses-section
    │   │   │   │   │   │   ├── customer-addresses-section.component.html
    │   │   │   │   │   │   ├── customer-addresses-section.component.spec.ts
    │   │   │   │   │   │   └── customer-addresses-section.component.ts
    │   │   │   │   │   ├── customer-contact-section
    │   │   │   │   │   │   ├── customer-contact-section.component.html
    │   │   │   │   │   │   ├── customer-contact-section.component.spec.ts
    │   │   │   │   │   │   └── customer-contact-section.component.ts
    │   │   │   │   │   ├── customer-general-section
    │   │   │   │   │   │   ├── customer-general-section.component.html
    │   │   │   │   │   │   ├── customer-general-section.component.spec.ts
    │   │   │   │   │   │   └── customer-general-section.component.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── data
    │   │   │   │   │   └── venezuela-geo.data.ts
    │   │   │   │   ├── messages
    │   │   │   │   │   ├── error-messages.spec.ts
    │   │   │   │   │   ├── error-messages.ts
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── success-messages.spec.ts
    │   │   │   │   │   └── success-messages.ts
    │   │   │   │   ├── models
    │   │   │   │   │   ├── enums
    │   │   │   │   │   │   ├── balance-type.enum.ts
    │   │   │   │   │   │   ├── customer-type.enum.spec.ts
    │   │   │   │   │   │   ├── customer-type.enum.ts
    │   │   │   │   │   │   ├── index.ts
    │   │   │   │   │   │   ├── payment-type.enum.spec.ts
    │   │   │   │   │   │   └── payment-type.enum.ts
    │   │   │   │   │   ├── interfaces
    │   │   │   │   │   │   ├── balance-transaction.interface.ts
    │   │   │   │   │   │   ├── customer-balance.interface.ts
    │   │   │   │   │   │   ├── customer-create.interface.spec.ts
    │   │   │   │   │   │   ├── customer-create.interface.ts
    │   │   │   │   │   │   ├── customer-details.interface.spec.ts
    │   │   │   │   │   │   ├── customer-details.interface.ts
    │   │   │   │   │   │   ├── customer-edit.interface.spec.ts
    │   │   │   │   │   │   ├── customer-edit.interface.ts
    │   │   │   │   │   │   ├── customer-list.interface.spec.ts
    │   │   │   │   │   │   ├── customer-list.interface.ts
    │   │   │   │   │   │   ├── customer-warehouse-access.interface.spec.ts
    │   │   │   │   │   │   ├── customer-warehouse-access.interface.ts
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── pages
    │   │   │   │   │   ├── customer-balance-page
    │   │   │   │   │   │   ├── customer-balance-page.component.html
    │   │   │   │   │   │   ├── customer-balance-page.component.spec.ts
    │   │   │   │   │   │   └── customer-balance-page.component.ts
    │   │   │   │   │   ├── customers-details-page
    │   │   │   │   │   │   ├── customers-details-page.component.html
    │   │   │   │   │   │   ├── customers-details-page.component.spec.ts
    │   │   │   │   │   │   └── customers-details-page.component.ts
    │   │   │   │   │   ├── customers-form-page
    │   │   │   │   │   │   ├── customers-form-page.component.html
    │   │   │   │   │   │   ├── customers-form-page.component.spec.ts
    │   │   │   │   │   │   └── customers-form-page.component.ts
    │   │   │   │   │   ├── customers-list-page
    │   │   │   │   │   │   ├── customers-list-page.component.html
    │   │   │   │   │   │   ├── customers-list-page.component.spec.ts
    │   │   │   │   │   │   └── customers-list-page.component.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── routing
    │   │   │   │   │   ├── customer-balance.routes.ts
    │   │   │   │   │   ├── customer.routes.spec.ts
    │   │   │   │   │   ├── customer.routes.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── services
    │   │   │   │   │   ├── api
    │   │   │   │   │   │   ├── customer-api.service.spec.ts
    │   │   │   │   │   │   ├── customer-api.service.ts
    │   │   │   │   │   │   ├── customer-balance-api.service.ts
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   ├── application
    │   │   │   │   │   │   ├── customer-application.service.spec.ts
    │   │   │   │   │   │   ├── customer-application.service.ts
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   ├── mappers
    │   │   │   │   │   │   ├── customer.mapper.spec.ts
    │   │   │   │   │   │   ├── customer.mapper.ts
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── validators
    │   │   │   │   │   ├── customer.validators.spec.ts
    │   │   │   │   │   ├── customer.validators.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   └── index.ts
    │   │   │   └── suppliers
    │   │   │       ├── components
    │   │   │       │   ├── supplier-addresses-section
    │   │   │       │   │   ├── supplier-addresses-section.component.html
    │   │   │       │   │   └── supplier-addresses-section.component.ts
    │   │   │       │   ├── supplier-contact-section
    │   │   │       │   │   ├── supplier-contact-section.component.html
    │   │   │       │   │   └── supplier-contact-section.component.ts
    │   │   │       │   ├── supplier-general-section
    │   │   │       │   │   ├── supplier-general-section.component.html
    │   │   │       │   │   └── supplier-general-section.component.ts
    │   │   │       │   └── index.ts
    │   │   │       ├── messages
    │   │   │       │   ├── error-messages.ts
    │   │   │       │   ├── index.ts
    │   │   │       │   └── success-messages.ts
    │   │   │       ├── models
    │   │   │       │   ├── enums
    │   │   │       │   │   ├── index.ts
    │   │   │       │   │   └── supplier-type.enum.ts
    │   │   │       │   ├── interfaces
    │   │   │       │   │   ├── index.ts
    │   │   │       │   │   ├── supplier-create.interface.ts
    │   │   │       │   │   ├── supplier-details.interface.ts
    │   │   │       │   │   ├── supplier-edit.interface.ts
    │   │   │       │   │   └── supplier-list.interface.ts
    │   │   │       │   └── index.ts
    │   │   │       ├── pages
    │   │   │       │   ├── suppliers-details-page
    │   │   │       │   │   ├── suppliers-details-page.component.html
    │   │   │       │   │   └── suppliers-details-page.component.ts
    │   │   │       │   ├── suppliers-form-page
    │   │   │       │   │   ├── suppliers-form-page.component.html
    │   │   │       │   │   └── suppliers-form-page.component.ts
    │   │   │       │   ├── suppliers-list-page
    │   │   │       │   │   ├── suppliers-list-page.component.html
    │   │   │       │   │   └── suppliers-list-page.component.ts
    │   │   │       │   └── index.ts
    │   │   │       ├── routing
    │   │   │       │   ├── index.ts
    │   │   │       │   └── supplier.routes.ts
    │   │   │       ├── services
    │   │   │       │   ├── api
    │   │   │       │   │   ├── index.ts
    │   │   │       │   │   └── supplier-api.service.ts
    │   │   │       │   ├── application
    │   │   │       │   │   ├── index.ts
    │   │   │       │   │   └── supplier-application.service.ts
    │   │   │       │   ├── mappers
    │   │   │       │   │   ├── index.ts
    │   │   │       │   │   └── supplier.mapper.ts
    │   │   │       │   └── index.ts
    │   │   │       ├── validators
    │   │   │       │   ├── index.ts
    │   │   │       │   ├── supplier.validators.spec.ts
    │   │   │       │   └── supplier.validators.ts
    │   │   │       └── index.ts
    │   │   ├── platform
    │   │   │   ├── auth
    │   │   │   │   ├── guards
    │   │   │   │   │   ├── admin.guard.spec.ts
    │   │   │   │   │   ├── admin.guard.ts
    │   │   │   │   │   ├── auth.guard.spec.ts
    │   │   │   │   │   ├── auth.guard.ts
    │   │   │   │   │   ├── home-redirect.guard.spec.ts
    │   │   │   │   │   ├── home-redirect.guard.ts
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── module-permission.guard.spec.ts
    │   │   │   │   │   └── module-permission.guard.ts
    │   │   │   │   ├── interceptors
    │   │   │   │   │   ├── auth.interceptor.spec.ts
    │   │   │   │   │   ├── auth.interceptor.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── messages
    │   │   │   │   │   ├── error-messages.spec.ts
    │   │   │   │   │   ├── error-messages.ts
    │   │   │   │   │   ├── index.ts
    │   │   │   │   │   ├── success-messages.spec.ts
    │   │   │   │   │   └── success-messages.ts
    │   │   │   │   ├── models
    │   │   │   │   │   ├── interfaces
    │   │   │   │   │   │   ├── auth-request.interface.spec.ts
    │   │   │   │   │   │   ├── auth-request.interface.ts
    │   │   │   │   │   │   ├── auth-response.interface.spec.ts
    │   │   │   │   │   │   ├── auth-response.interface.ts
    │   │   │   │   │   │   ├── index.ts
    │   │   │   │   │   │   ├── user.interface.spec.ts
    │   │   │   │   │   │   └── user.interface.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── pages
    │   │   │   │   │   ├── change-commission-deduction
    │   │   │   │   │   │   ├── change-commission-deduction-page.component.html
    │   │   │   │   │   │   ├── change-commission-deduction-page.component.spec.ts
    │   │   │   │   │   │   ├── change-commission-deduction-page.component.ts
    │   │   │   │   │   │   └── change-commission-deduction-page.config.ts
    │   │   │   │   │   ├── change-password
    │   │   │   │   │   │   ├── change-password-page.component.html
    │   │   │   │   │   │   ├── change-password-page.component.spec.ts
    │   │   │   │   │   │   ├── change-password-page.component.ts
    │   │   │   │   │   │   └── change-password-page.config.ts
    │   │   │   │   │   ├── change-username
    │   │   │   │   │   │   ├── change-username-page.component.html
    │   │   │   │   │   │   ├── change-username-page.component.spec.ts
    │   │   │   │   │   │   ├── change-username-page.component.ts
    │   │   │   │   │   │   └── change-username-page.config.ts
    │   │   │   │   │   ├── configuration
    │   │   │   │   │   │   ├── configuration-page.component.html
    │   │   │   │   │   │   ├── configuration-page.component.spec.ts
    │   │   │   │   │   │   └── configuration-page.component.ts
    │   │   │   │   │   ├── login
    │   │   │   │   │   │   ├── login-page.component.html
    │   │   │   │   │   │   ├── login-page.component.spec.ts
    │   │   │   │   │   │   └── login-page.component.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── routing
    │   │   │   │   │   ├── auth.routes.spec.ts
    │   │   │   │   │   ├── auth.routes.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── services
    │   │   │   │   │   ├── api
    │   │   │   │   │   │   ├── auth-api.service.spec.ts
    │   │   │   │   │   │   ├── auth-api.service.ts
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   ├── application
    │   │   │   │   │   │   ├── auth-application.service.spec.ts
    │   │   │   │   │   │   ├── auth-application.service.ts
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── tests
    │   │   │   │   │   └── manual-integration.spec.ts
    │   │   │   │   ├── user
    │   │   │   │   │   ├── components
    │   │   │   │   │   │   ├── change-email-dialog
    │   │   │   │   │   │   │   ├── change-email-dialog.component.html
    │   │   │   │   │   │   │   ├── change-email-dialog.component.spec.ts
    │   │   │   │   │   │   │   └── change-email-dialog.component.ts
    │   │   │   │   │   │   ├── change-password-dialog
    │   │   │   │   │   │   │   ├── change-password-dialog.component.html
    │   │   │   │   │   │   │   ├── change-password-dialog.component.spec.ts
    │   │   │   │   │   │   │   └── change-password-dialog.component.ts
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   ├── messages
    │   │   │   │   │   │   ├── error-messages.spec.ts
    │   │   │   │   │   │   ├── error-messages.ts
    │   │   │   │   │   │   ├── index.ts
    │   │   │   │   │   │   ├── success-messages.spec.ts
    │   │   │   │   │   │   └── success-messages.ts
    │   │   │   │   │   ├── models
    │   │   │   │   │   │   ├── enums
    │   │   │   │   │   │   │   ├── business-module.enum.spec.ts
    │   │   │   │   │   │   │   ├── business-module.enum.ts
    │   │   │   │   │   │   │   ├── index.ts
    │   │   │   │   │   │   │   ├── user-type.enum.spec.ts
    │   │   │   │   │   │   │   └── user-type.enum.ts
    │   │   │   │   │   │   ├── interfaces
    │   │   │   │   │   │   │   ├── index.ts
    │   │   │   │   │   │   │   ├── user-create.interface.spec.ts
    │   │   │   │   │   │   │   ├── user-create.interface.ts
    │   │   │   │   │   │   │   ├── user-details.interface.spec.ts
    │   │   │   │   │   │   │   ├── user-details.interface.ts
    │   │   │   │   │   │   │   ├── user-edit.interface.spec.ts
    │   │   │   │   │   │   │   ├── user-edit.interface.ts
    │   │   │   │   │   │   │   ├── user-list.interface.spec.ts
    │   │   │   │   │   │   │   └── user-list.interface.ts
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   ├── pages
    │   │   │   │   │   │   ├── users-details-page
    │   │   │   │   │   │   │   ├── users-details-page.component.html
    │   │   │   │   │   │   │   ├── users-details-page.component.spec.ts
    │   │   │   │   │   │   │   └── users-details-page.component.ts
    │   │   │   │   │   │   ├── users-form-page
    │   │   │   │   │   │   │   ├── users-form-page.component.html
    │   │   │   │   │   │   │   ├── users-form-page.component.spec.ts
    │   │   │   │   │   │   │   └── users-form-page.component.ts
    │   │   │   │   │   │   ├── users-list-page
    │   │   │   │   │   │   │   ├── users-list-page.component.html
    │   │   │   │   │   │   │   ├── users-list-page.component.spec.ts
    │   │   │   │   │   │   │   └── users-list-page.component.ts
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   ├── routing
    │   │   │   │   │   │   ├── index.ts
    │   │   │   │   │   │   ├── users.routes.spec.ts
    │   │   │   │   │   │   └── users.routes.ts
    │   │   │   │   │   ├── services
    │   │   │   │   │   │   ├── api
    │   │   │   │   │   │   │   ├── index.ts
    │   │   │   │   │   │   │   ├── user-api.service.spec.ts
    │   │   │   │   │   │   │   └── user-api.service.ts
    │   │   │   │   │   │   ├── application
    │   │   │   │   │   │   │   ├── index.ts
    │   │   │   │   │   │   │   ├── user-application.service.spec.ts
    │   │   │   │   │   │   │   └── user-application.service.ts
    │   │   │   │   │   │   ├── mappers
    │   │   │   │   │   │   │   ├── index.ts
    │   │   │   │   │   │   │   ├── user.mapper.spec.ts
    │   │   │   │   │   │   │   └── user.mapper.ts
    │   │   │   │   │   │   └── index.ts
    │   │   │   │   │   ├── validators
    │   │   │   │   │   │   ├── index.ts
    │   │   │   │   │   │   ├── user.validators.spec.ts
    │   │   │   │   │   │   └── user.validators.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── validators
    │   │   │   │   │   ├── auth-validators.spec.ts
    │   │   │   │   │   ├── auth-validators.ts
    │   │   │   │   │   └── index.ts
    │   │   │   │   └── index.ts
    │   │   │   └── notifications
    │   │   │       ├── components
    │   │   │       │   └── notification-bell
    │   │   │       │       ├── notification-bell.component.html
    │   │   │       │       ├── notification-bell.component.spec.ts
    │   │   │       │       └── notification-bell.component.ts
    │   │   │       └── services
    │   │   │           ├── api
    │   │   │           │   ├── notification-api.service.spec.ts
    │   │   │           │   └── notification-api.service.ts
    │   │   │           ├── navigation
    │   │   │           │   ├── notification-destination.resolver.spec.ts
    │   │   │           │   └── notification-destination.resolver.ts
    │   │   │           └── websocket
    │   │   │               └── notification-websocket.service.ts
    │   │   ├── procurement
    │   │   │   └── purchases
    │   │   │       ├── components
    │   │   │       │   ├── cancel-purchase-dialog
    │   │   │       │   │   ├── cancel-purchase-dialog.component.html
    │   │   │       │   │   └── cancel-purchase-dialog.component.ts
    │   │   │       │   ├── confirm-purchase-dialog
    │   │   │       │   │   ├── confirm-purchase-dialog.component.html
    │   │   │       │   │   └── confirm-purchase-dialog.component.ts
    │   │   │       │   ├── purchase-items-table
    │   │   │       │   │   ├── purchase-items-table.component.html
    │   │   │       │   │   └── purchase-items-table.component.ts
    │   │   │       │   ├── purchase-product-picker-dialog
    │   │   │       │   │   ├── purchase-product-picker-dialog.component.html
    │   │   │       │   │   └── purchase-product-picker-dialog.component.ts
    │   │   │       │   └── supplier-picker-dialog
    │   │   │       │       ├── supplier-picker-dialog.component.html
    │   │   │       │       └── supplier-picker-dialog.component.ts
    │   │   │       ├── messages
    │   │   │       │   ├── error-messages.ts
    │   │   │       │   ├── index.ts
    │   │   │       │   └── success-messages.ts
    │   │   │       ├── models
    │   │   │       │   ├── enums
    │   │   │       │   │   ├── index.ts
    │   │   │       │   │   └── purchase-status.enum.ts
    │   │   │       │   └── interfaces
    │   │   │       │       ├── index.ts
    │   │   │       │       ├── purchase-create.interface.ts
    │   │   │       │       ├── purchase-details.interface.ts
    │   │   │       │       ├── purchase-edit.interface.ts
    │   │   │       │       ├── purchase-form-data.interface.ts
    │   │   │       │       ├── purchase-list.interface.ts
    │   │   │       │       ├── purchase-product.interface.ts
    │   │   │       │       └── purchase-warehouse.interface.ts
    │   │   │       ├── pages
    │   │   │       │   ├── purchase-detail-page
    │   │   │       │   │   ├── purchase-detail-page.component.html
    │   │   │       │   │   └── purchase-detail-page.component.ts
    │   │   │       │   ├── purchase-form-page
    │   │   │       │   │   ├── purchase-form-page.component.html
    │   │   │       │   │   └── purchase-form-page.component.ts
    │   │   │       │   └── purchase-list-page
    │   │   │       │       ├── purchase-list-page.component.html
    │   │   │       │       └── purchase-list-page.component.ts
    │   │   │       ├── reporting
    │   │   │       │   ├── components
    │   │   │       │   │   └── purchase-pdf-modal
    │   │   │       │   │       ├── purchase-pdf-modal.component.html
    │   │   │       │   │       └── purchase-pdf-modal.component.ts
    │   │   │       │   └── services
    │   │   │       │       └── api
    │   │   │       │           └── purchase-pdf-api.service.ts
    │   │   │       ├── routing
    │   │   │       │   ├── index.ts
    │   │   │       │   └── purchase.routes.ts
    │   │   │       ├── services
    │   │   │       │   ├── api
    │   │   │       │   │   └── purchase-api.service.ts
    │   │   │       │   ├── application
    │   │   │       │   │   └── purchase-application.service.ts
    │   │   │       │   └── mappers
    │   │   │       │       └── purchase.mapper.ts
    │   │   │       └── index.ts
    │   │   └── sales
    │   │       ├── orders
    │   │       │   ├── components
    │   │       │   │   ├── cancel-order-dialog
    │   │       │   │   │   ├── cancel-order-dialog.component.html
    │   │       │   │   │   ├── cancel-order-dialog.component.spec.ts
    │   │       │   │   │   └── cancel-order-dialog.component.ts
    │   │       │   │   ├── convert-to-invoice-dialog
    │   │       │   │   │   ├── convert-to-invoice-dialog.component.html
    │   │       │   │   │   ├── convert-to-invoice-dialog.component.spec.ts
    │   │       │   │   │   └── convert-to-invoice-dialog.component.ts
    │   │       │   │   ├── customer-picker-dialog
    │   │       │   │   │   ├── customer-picker-dialog.component.html
    │   │       │   │   │   ├── customer-picker-dialog.component.spec.ts
    │   │       │   │   │   └── customer-picker-dialog.component.ts
    │   │       │   │   ├── order-items-table
    │   │       │   │   │   ├── order-items-table.component.html
    │   │       │   │   │   ├── order-items-table.component.spec.ts
    │   │       │   │   │   └── order-items-table.component.ts
    │   │       │   │   ├── product-picker-dialog
    │   │       │   │   │   ├── product-picker-dialog.component.html
    │   │       │   │   │   ├── product-picker-dialog.component.spec.ts
    │   │       │   │   │   └── product-picker-dialog.component.ts
    │   │       │   │   └── warehouse-stock-popover
    │   │       │   │       ├── warehouse-stock-entry.interface.spec.ts
    │   │       │   │       ├── warehouse-stock-entry.interface.ts
    │   │       │   │       ├── warehouse-stock-popover.component.html
    │   │       │   │       ├── warehouse-stock-popover.component.spec.ts
    │   │       │   │       └── warehouse-stock-popover.component.ts
    │   │       │   ├── messages
    │   │       │   │   ├── error-messages.spec.ts
    │   │       │   │   ├── error-messages.ts
    │   │       │   │   ├── index.ts
    │   │       │   │   ├── success-messages.spec.ts
    │   │       │   │   └── success-messages.ts
    │   │       │   ├── models
    │   │       │   │   ├── enums
    │   │       │   │   │   ├── index.ts
    │   │       │   │   │   ├── order-status.enum.spec.ts
    │   │       │   │   │   └── order-status.enum.ts
    │   │       │   │   └── interfaces
    │   │       │   │       ├── index.ts
    │   │       │   │       ├── order-create.interface.spec.ts
    │   │       │   │       ├── order-create.interface.ts
    │   │       │   │       ├── order-details.interface.spec.ts
    │   │       │   │       ├── order-details.interface.ts
    │   │       │   │       ├── order-edit.interface.spec.ts
    │   │       │   │       ├── order-edit.interface.ts
    │   │       │   │       ├── order-form-data.interface.spec.ts
    │   │       │   │       ├── order-form-data.interface.ts
    │   │       │   │       ├── order-item-allocation.interface.spec.ts
    │   │       │   │       ├── order-item-allocation.interface.ts
    │   │       │   │       ├── order-list.interface.spec.ts
    │   │       │   │       ├── order-list.interface.ts
    │   │       │   │       ├── order-product.interface.spec.ts
    │   │       │   │       └── order-product.interface.ts
    │   │       │   ├── pages
    │   │       │   │   ├── order-detail-page
    │   │       │   │   │   ├── order-detail-page.component.html
    │   │       │   │   │   ├── order-detail-page.component.spec.ts
    │   │       │   │   │   └── order-detail-page.component.ts
    │   │       │   │   ├── order-form-page
    │   │       │   │   │   ├── order-form-page.component.html
    │   │       │   │   │   ├── order-form-page.component.spec.ts
    │   │       │   │   │   └── order-form-page.component.ts
    │   │       │   │   └── order-list-page
    │   │       │   │       ├── order-list-page.component.html
    │   │       │   │       ├── order-list-page.component.spec.ts
    │   │       │   │       └── order-list-page.component.ts
    │   │       │   ├── reporting
    │   │       │   │   ├── components
    │   │       │   │   │   └── order-pdf-modal
    │   │       │   │   │       ├── order-pdf-modal.component.html
    │   │       │   │   │       ├── order-pdf-modal.component.spec.ts
    │   │       │   │   │       └── order-pdf-modal.component.ts
    │   │       │   │   ├── models
    │   │       │   │   │   └── interfaces
    │   │       │   │   │       ├── index.spec.ts
    │   │       │   │   │       └── index.ts
    │   │       │   │   └── services
    │   │       │   │       └── api
    │   │       │   │           ├── order-pdf-api.service.spec.ts
    │   │       │   │           └── order-pdf-api.service.ts
    │   │       │   ├── routing
    │   │       │   │   ├── index.ts
    │   │       │   │   ├── orders.routes.spec.ts
    │   │       │   │   └── orders.routes.ts
    │   │       │   ├── services
    │   │       │   │   ├── api
    │   │       │   │   │   ├── order-api.service.spec.ts
    │   │       │   │   │   └── order-api.service.ts
    │   │       │   │   ├── application
    │   │       │   │   │   ├── order-application.service.spec.ts
    │   │       │   │   │   └── order-application.service.ts
    │   │       │   │   └── mappers
    │   │       │   │       ├── order.mapper.spec.ts
    │   │       │   │       └── order.mapper.ts
    │   │       │   └── index.ts
    │   │       └── quotes
    │   │           ├── components
    │   │           │   ├── convert-to-invoice-dialog
    │   │           │   │   ├── convert-to-invoice-dialog.component.html
    │   │           │   │   ├── convert-to-invoice-dialog.component.spec.ts
    │   │           │   │   └── convert-to-invoice-dialog.component.ts
    │   │           │   └── convert-to-order-dialog
    │   │           │       ├── convert-to-order-dialog.component.html
    │   │           │       ├── convert-to-order-dialog.component.spec.ts
    │   │           │       └── convert-to-order-dialog.component.ts
    │   │           ├── messages
    │   │           │   ├── error-messages.spec.ts
    │   │           │   ├── error-messages.ts
    │   │           │   ├── index.ts
    │   │           │   ├── success-messages.spec.ts
    │   │           │   └── success-messages.ts
    │   │           ├── models
    │   │           │   ├── enums
    │   │           │   │   ├── index.ts
    │   │           │   │   ├── quote-status.enum.spec.ts
    │   │           │   │   └── quote-status.enum.ts
    │   │           │   └── interfaces
    │   │           │       ├── index.ts
    │   │           │       ├── quote-create.interface.spec.ts
    │   │           │       ├── quote-create.interface.ts
    │   │           │       ├── quote-details.interface.spec.ts
    │   │           │       ├── quote-details.interface.ts
    │   │           │       ├── quote-edit.interface.spec.ts
    │   │           │       ├── quote-edit.interface.ts
    │   │           │       ├── quote-form-data.interface.spec.ts
    │   │           │       ├── quote-form-data.interface.ts
    │   │           │       ├── quote-list.interface.spec.ts
    │   │           │       ├── quote-list.interface.ts
    │   │           │       ├── quote-product.interface.spec.ts
    │   │           │       ├── quote-product.interface.ts
    │   │           │       ├── quote-warehouse.interface.spec.ts
    │   │           │       └── quote-warehouse.interface.ts
    │   │           ├── pages
    │   │           │   ├── quote-detail-page
    │   │           │   │   ├── quote-detail-page.component.html
    │   │           │   │   ├── quote-detail-page.component.spec.ts
    │   │           │   │   └── quote-detail-page.component.ts
    │   │           │   ├── quote-form-page
    │   │           │   │   ├── quote-form-page.component.html
    │   │           │   │   ├── quote-form-page.component.spec.ts
    │   │           │   │   └── quote-form-page.component.ts
    │   │           │   └── quote-list-page
    │   │           │       ├── quote-list-page.component.html
    │   │           │       ├── quote-list-page.component.spec.ts
    │   │           │       └── quote-list-page.component.ts
    │   │           ├── reporting
    │   │           │   ├── components
    │   │           │   │   └── quote-pdf-modal
    │   │           │   │       ├── quote-pdf-modal.component.html
    │   │           │   │       ├── quote-pdf-modal.component.spec.ts
    │   │           │   │       └── quote-pdf-modal.component.ts
    │   │           │   └── services
    │   │           │       └── api
    │   │           │           ├── quote-pdf-api.service.spec.ts
    │   │           │           └── quote-pdf-api.service.ts
    │   │           ├── routing
    │   │           │   ├── index.ts
    │   │           │   ├── quotes.routes.spec.ts
    │   │           │   └── quotes.routes.ts
    │   │           ├── services
    │   │           │   ├── api
    │   │           │   │   ├── quote-api.service.spec.ts
    │   │           │   │   └── quote-api.service.ts
    │   │           │   ├── application
    │   │           │   │   ├── quote-application.service.spec.ts
    │   │           │   │   └── quote-application.service.ts
    │   │           │   └── mappers
    │   │           │       ├── quote.mapper.spec.ts
    │   │           │       └── quote.mapper.ts
    │   │           └── index.ts
    │   ├── shared
    │   │   ├── components
    │   │   │   ├── details
    │   │   │   │   ├── detail-actions-menu
    │   │   │   │   │   ├── detail-actions-menu.component.html
    │   │   │   │   │   ├── detail-actions-menu.component.spec.ts
    │   │   │   │   │   └── detail-actions-menu.component.ts
    │   │   │   │   ├── details-card
    │   │   │   │   │   ├── details-card.component.html
    │   │   │   │   │   ├── details-card.component.spec.ts
    │   │   │   │   │   └── details-card.component.ts
    │   │   │   │   ├── details-card-header
    │   │   │   │   │   ├── details-card-header.component.html
    │   │   │   │   │   ├── details-card-header.component.spec.ts
    │   │   │   │   │   └── details-card-header.component.ts
    │   │   │   │   ├── details-info-field
    │   │   │   │   │   ├── details-info-field.component.html
    │   │   │   │   │   ├── details-info-field.component.spec.ts
    │   │   │   │   │   └── details-info-field.component.ts
    │   │   │   │   ├── details-info-grid
    │   │   │   │   │   ├── details-info-grid.component.html
    │   │   │   │   │   ├── details-info-grid.component.spec.ts
    │   │   │   │   │   └── details-info-grid.component.ts
    │   │   │   │   ├── details-list-item
    │   │   │   │   │   ├── details-list-item.component.html
    │   │   │   │   │   ├── details-list-item.component.spec.ts
    │   │   │   │   │   └── details-list-item.component.ts
    │   │   │   │   ├── details-section-card
    │   │   │   │   │   ├── details-section-card.component.html
    │   │   │   │   │   ├── details-section-card.component.spec.ts
    │   │   │   │   │   └── details-section-card.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── list
    │   │   │   │   ├── list-action-buttons
    │   │   │   │   │   ├── list-action-buttons.component.html
    │   │   │   │   │   ├── list-action-buttons.component.spec.ts
    │   │   │   │   │   └── list-action-buttons.component.ts
    │   │   │   │   ├── list-container
    │   │   │   │   │   ├── list-container.component.html
    │   │   │   │   │   ├── list-container.component.spec.ts
    │   │   │   │   │   └── list-container.component.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── pdf-viewer-modal
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── pdf-viewer-modal.component.html
    │   │   │   │   ├── pdf-viewer-modal.component.spec.ts
    │   │   │   │   └── pdf-viewer-modal.component.ts
    │   │   │   ├── ui
    │   │   │   │   ├── content-card
    │   │   │   │   │   ├── content-card.component.html
    │   │   │   │   │   ├── content-card.component.spec.ts
    │   │   │   │   │   └── content-card.component.ts
    │   │   │   │   ├── empty-state
    │   │   │   │   │   ├── empty-state.component.html
    │   │   │   │   │   ├── empty-state.component.spec.ts
    │   │   │   │   │   └── empty-state.component.ts
    │   │   │   │   ├── image-viewer-dialog
    │   │   │   │   │   ├── image-viewer-dialog.component.html
    │   │   │   │   │   ├── image-viewer-dialog.component.spec.ts
    │   │   │   │   │   ├── image-viewer-dialog.component.ts
    │   │   │   │   │   └── README.md
    │   │   │   │   ├── loading-spinner
    │   │   │   │   │   ├── loading-spinner.component.html
    │   │   │   │   │   ├── loading-spinner.component.spec.ts
    │   │   │   │   │   └── loading-spinner.component.ts
    │   │   │   │   ├── page-header
    │   │   │   │   │   ├── page-header.component.html
    │   │   │   │   │   ├── page-header.component.spec.ts
    │   │   │   │   │   └── page-header.component.ts
    │   │   │   │   ├── search-field
    │   │   │   │   │   ├── search-field.component.html
    │   │   │   │   │   ├── search-field.component.spec.ts
    │   │   │   │   │   └── search-field.component.ts
    │   │   │   │   ├── status-badge
    │   │   │   │   │   ├── status-badge.component.html
    │   │   │   │   │   ├── status-badge.component.spec.ts
    │   │   │   │   │   └── status-badge.component.ts
    │   │   │   │   ├── text-badge
    │   │   │   │   │   ├── text-badge.component.html
    │   │   │   │   │   ├── text-badge.component.spec.ts
    │   │   │   │   │   └── text-badge.component.ts
    │   │   │   │   └── index.ts
    │   │   │   └── index.ts
    │   │   ├── models
    │   │   │   ├── interfaces
    │   │   │   │   ├── index.ts
    │   │   │   │   └── paged-response.interface.ts
    │   │   │   └── index.ts
    │   │   ├── pipes
    │   │   │   ├── currency.pipe.spec.ts
    │   │   │   ├── currency.pipe.ts
    │   │   │   ├── date-format.pipe.spec.ts
    │   │   │   ├── date-format.pipe.ts
    │   │   │   └── index.ts
    │   │   ├── ui
    │   │   │   ├── invoice-picker-dialog
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── invoice-picker-dialog.component.html
    │   │   │   │   ├── invoice-picker-dialog.component.spec.ts
    │   │   │   │   └── invoice-picker-dialog.component.ts
    │   │   │   ├── note-form-dialog
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── note-form-dialog.component.html
    │   │   │   │   ├── note-form-dialog.component.spec.ts
    │   │   │   │   └── note-form-dialog.component.ts
    │   │   │   ├── payment-method-picker
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── payment-method-picker.component.html
    │   │   │   │   ├── payment-method-picker.component.spec.ts
    │   │   │   │   └── payment-method-picker.component.ts
    │   │   │   └── index.ts
    │   │   └── utils
    │   │       ├── date.utils.spec.ts
    │   │       ├── date.utils.ts
    │   │       ├── file-download.helper.spec.ts
    │   │       └── file-download.helper.ts
    │   ├── app.config.ts
    │   ├── app.routes.spec.ts
    │   ├── app.routes.ts
    │   ├── app.ts
    │   └── erp-area-structure.spec.ts
    ├── environments
    │   ├── environment.prod.ts
    │   └── environment.ts
    ├── index.html
    ├── main.ts
    ├── styles.css
    ├── test-helpers.ts
    └── test-setup.ts
```
