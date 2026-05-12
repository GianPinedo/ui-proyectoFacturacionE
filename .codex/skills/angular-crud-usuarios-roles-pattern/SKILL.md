---
name: angular-crud-usuarios-roles-pattern
description: "Use when implementing, extending, or reviewing Angular feature CRUD screens in ui-proyectoFacturacionE that should follow the existing usuarios-roles pattern: standalone Angular components, reactive forms, signals, typed core models/services, shared app-ui-table/app-ui-pagination, SweetAlert confirmations, and NestJS backend DTO/controller contracts from proyectoFacturacionE."
---

# Angular CRUD Usuarios Roles Pattern

## Workflow

Use the existing `src/app/features/usuarios-roles` implementation as the source of truth for UX and code shape. Before editing, inspect:

- The target feature `.ts`, `.html`, and `.css`.
- `src/app/features/usuarios-roles/usuarios-roles.ts` and `.html`.
- `src/app/core/services/usuarios.service.ts`.
- `src/app/core/models/usuario.model.ts`.
- Backend controller and DTOs for the target entity in `../proyectoFacturacionE`.
- Shared components used by the screen, especially `app-ui-table`, `app-ui-pagination`, `app-ui-card`, `app-ui-button`, and `app-page-title`.

For details and checklist, read `references/crud-pattern.md`.

## Implementation Rules

Implement real behavior, not static placeholder rows. Prefer this structure:

- `src/app/core/models/<entity>.model.ts` for typed payloads, list items, response envelopes, params, and state payloads.
- `src/app/core/services/<entities>.service.ts` for HTTP methods and `x-user-id` headers using `AuthService` on write operations.
- `src/app/features/<entity>/<entity>.ts` as the orchestration component.
- `src/app/features/<entity>/<entity>.html` for page title, filters, modal, table, and pagination.
- `src/app/features/<entity>/components/create-<entity>-modal/` for create/edit modal component.

Use Angular signals for page state (`rows`, `isLoading`, `isSaving`, modal state, editing id, initial data, pagination). Use `ReactiveFormsModule` with `FormBuilder.nonNullable.group` for filters and modal forms.

Use `SweetAlert2` for success, error, and destructive confirmations. Extract backend validation messages from `error.error.message`, including arrays.

Do not invent endpoints. Derive them from the NestJS controller. If a requested delete does not exist but there is a state endpoint, implement delete as deactivate and state the assumption in the final response.

## UI Rules

Match `usuarios-roles`:

- Page title at top.
- Primary action button on the right.
- Filter card above the data table.
- Data table inside `app-ui-card`.
- Pagination via `app-ui-pagination`.
- Create/edit modal with `fixed inset-0`, white header, rounded panel, skeletons for loading initial edit data, and form fields matching DTO validation.
- Table actions through `app-ui-table`; extend the shared table only with optional inputs/outputs that preserve existing screens.

For action icons, use `lucide-angular`.

## Validation

Run type checking first:

```bash
npx tsc -p tsconfig.app.json --noEmit
```

Then run the Angular build. This repo may need Node 20:

```bash
PATH=/Users/grsmc1749/.nvm/versions/node/v20.19.6/bin:$PATH npm run build:ng
```

If the sandbox kills the build after `Building...`, rerun with escalated permission. Report any remaining warnings separately from errors.
