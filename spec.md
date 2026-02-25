# Specification

## Summary
**Goal:** Fix all backend and frontend compilation/runtime errors that caused the Version 20 deployment to fail, and redeploy successfully.

**Planned changes:**
- Fix `backend/main.mo` so the paginated `listProducts(offset: Nat, limit: Nat)` endpoint compiles cleanly, has no authorization guard, returns `{ products: [Product]; total: Nat }`, and removes any unbounded no-parameter `listProducts` call.
- Fix TypeScript errors in `useQueries.ts`, `AdminProductsSection.tsx`, and `Collection.tsx` so they correctly call the paginated `listProducts(offset, limit)` endpoint and handle the `{ products, total }` response shape.
- Fix authenticated actor construction so `createActor` is never called with both `agent` and `agentOptions` simultaneously; use the correct parameter based on whether an Internet Identity is present or not.

**User-visible outcome:** The application deploys successfully without errors. Admin panel product add/edit/delete operations work without "Actor not available" errors, and paginated product listing works correctly on both the Collection page and Admin Products section.
