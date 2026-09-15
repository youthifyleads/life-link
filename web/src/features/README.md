# Feature module conventions

Each business feature owns its API calls, domain model, validation, and feature-specific UI. Pages compose features; shared modules contain only domain-agnostic infrastructure.

Planned modules for later phases are blood requests, request tracking, inventory, blood units, documents, notifications, QR tracking, users, organizations, roles and permissions, and audit activity. Phase 1 implements only authentication.

Dependency direction:

```text
app/pages/layouts -> features -> shared
```

`shared` must not import from a feature or page. Generated OpenAPI types will live in `shared/api/generated` and must not be edited manually.
