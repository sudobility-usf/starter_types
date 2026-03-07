# @sudobility/starter_types

Shared TypeScript type definitions for the Starter API ecosystem.

## Installation

```bash
bun add @sudobility/starter_types
```

Peer dependency:

```bash
bun add @sudobility/types
```

## Usage

```ts
import {
  History,
  HistoryCreateRequest,
  HistoryUpdateRequest,
  HistoryTotalResponse,
  successResponse,
  errorResponse,
  BaseResponse,
  NetworkClient,
} from "@sudobility/starter_types";

// Wrap API responses
const ok = successResponse({ items: [] }); // { success: true, data: { items: [] } }
const err = errorResponse("Not found"); // { success: false, error: "Not found" }
```

## Types

| Type | Description |
|------|-------------|
| `History` | Core data type (`id`, `user_id`, `datetime`, `value`, timestamps) |
| `HistoryCreateRequest` | `{ datetime, value }` |
| `HistoryUpdateRequest` | `{ datetime?, value? }` |
| `HistoryTotalResponse` | `{ total }` |
| `successResponse<T>` | Wraps data in `BaseResponse<T>` with `success: true` |
| `errorResponse` | Wraps error string in `BaseResponse<never>` with `success: false` |

Re-exports from `@sudobility/types`: `ApiResponse`, `BaseResponse`, `NetworkClient`, `Optional`.

## Development

```bash
bun run build          # Build dual ESM/CJS output
bun run dev            # Watch mode
bun test               # Run Vitest tests
bun run typecheck      # TypeScript check
bun run lint           # ESLint
bun run verify         # All checks + build (use before commit)
```

## Related Packages

- **starter_api** -- Backend API server (Hono + PostgreSQL)
- **starter_client** -- API client SDK with TanStack Query hooks
- **starter_lib** -- Business logic library with Zustand stores
- **starter_app** -- React web application
- **starter_app_rn** -- React Native mobile app

All other starter_* projects depend on this package.

## License

BUSL-1.1
