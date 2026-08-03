---
name: OpenAPI Zod v3 constraints
description: Rules for writing OpenAPI specs that codegen correctly with Orval + Zod v3.
---

**Rule:** Always use `type: number` instead of `type: integer` for numeric fields. Never add `format: email` or `format: uri` to string fields.

**Why:** Orval generates `zod.int()` for `integer` types and `zod.email()` / `zod.url()` for `format: email` / `format: uri`. These methods do not exist in Zod v3 (they are v4 additions), causing TS build errors.

**How to apply:** When writing or editing `lib/api-spec/openapi.yaml`, check every field typed as `integer` and every string field with a format annotation. Replace `type: integer` with `type: number`, and remove any `format: email` or `format: uri` lines entirely.
