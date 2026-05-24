# CRUD Pattern Reference

## Source Pattern

Use `usuarios-roles` as the live example:

- `src/app/features/usuarios-roles/usuarios-roles.ts`
- `src/app/features/usuarios-roles/usuarios-roles.html`
- `src/app/features/usuarios-roles/components/create-user-modal/`
- `src/app/features/usuarios-roles/components/create-rol-modal/`
- `src/app/core/services/usuarios.service.ts`
- `src/app/core/models/usuario.model.ts`

## Backend Contract Discovery

For a target entity, inspect these backend files when available:

- Controller: route prefix, methods, path params, query params, write headers.
- Create DTO: required/optional fields and validators.
- Update DTO: fields allowed during edit.
- Response DTO: table/detail shape.
- List query/list response DTO: pagination, filtering, sorting.
- State/patch DTO: activate/deactivate payload.

Expected backend response envelope comes from the interceptor:

```ts
{
  status?: string;
  code?: number;
  message?: string;
  data: T | T[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

Backend list DTOs may return `{ items, page, size, total, totalPages }`, but the frontend receives `data` and `meta`.

## Frontend Model Checklist

Create model interfaces for:

- `<Entity>Payload`: create/update body.
- `<Entity>ListItem`: response row/detail body.
- `<Entity>Response`: envelope with `data: <Entity>ListItem`.
- `<Entities>ListParams`: list filters and pagination.
- `<Entities>ListResponse`: envelope with `data: <Entity>ListItem[]` and `meta`.
- `<Entity>EstadoPayload` or equivalent when state changes exist.

Do not extend payload interfaces from response interfaces when backend returns nullable fields. Keep write payloads optional with `undefined`; keep read models faithful to `null`.

## Service Checklist

Create an injectable service in `src/app/core/services`.

Use `HttpParams` for list filters and pagination. Trim optional string filters before sending.

Use `AuthService.getUserId()` and send `x-user-id` for create, update, patch, reset, or other mutating requests:

```ts
const xUserId = this.authService.getUserId() || '0';
return this.http.post<Response>(url, payload, {
  headers: { 'x-user-id': String(xUserId) },
});
```

## Feature Component Checklist

The feature component should:

- Import standalone dependencies directly in `imports`.
- Implement `OnInit`.
- Define `title`, `subtitle`, `columns`, `pageSizeOptions`, `defaultPageSize`.
- Define `filtersForm`.
- Maintain `rows`, loading/saving flags, modal flags, edit id, initial modal data, and `pagination` as signals.
- Load first page in `ngOnInit`.
- Implement `onSearch`, `clearFilters`, `onPageSizeChange`, and `goToPage`.
- Implement create, edit, and delete/deactivate handlers.
- Map API rows to `Record<string, string>[]` for `app-ui-table`.
- Format dates with `toLocaleDateString('es-PE')`.
- Format statuses so badges receive readable values like `Activo` and `INACTIVO`.

## Modal Checklist

Use a standalone modal component with:

- `mode = input<'create' | 'edit'>('create')`
- `initialData = input<... | null>(null)`
- `isSaving = input(false)`
- `isLoadingInitialData = input(false)`
- `cancelRequested = output<void>()`
- `saveRequested = output<Payload>()`
- Reactive form validators matching DTOs.
- `effect` to reset/patch form when `initialData` changes.
- `emptyToUndefined` helper for optional write fields.
- Skeleton loading for edit data.

## Shared Table Extension Rule

If a new action is needed, add optional inputs/outputs with defaults that preserve existing screens. Example:

- `@Input() showDeleteAction = false`
- `@Output() deleteRequested = new EventEmitter<Record<string, string>>()`

Never change default behavior for `usuarios-roles`.

## Final Response Checklist

Mention:

- Main files changed.
- Whether delete is real `DELETE` or implemented as state change.
- Validation commands and result.
- Any warnings that remain.

