---
name: replit-auth-web lib setup
description: Required config for the replit-auth-web workspace lib to compile correctly.
---

**Rule:** `lib/replit-auth-web` needs three things beyond the base template:
1. `vite` installed as a devDependency (`pnpm add -D vite` inside the lib)
2. `"types": ["vite/client"]` in `compilerOptions` of its `tsconfig.json`
3. `"composite": true`, `"declarationMap": true`, `"emitDeclarationOnly": true` in its `compilerOptions`

**Why:** The lib uses `import.meta.env.BASE_URL` (a Vite-specific API). Without vite as a devDep and its client types declared, TypeScript errors with `Property 'env' does not exist on type 'ImportMeta'`. Composite is needed for `tsc --build` project references to work correctly in the monorepo.

**How to apply:** Any time this lib is added to a new project or recreated from template, apply all three config changes before running `tsc --build`.
