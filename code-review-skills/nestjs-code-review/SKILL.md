---
name: nestjs-code-review
description: Code review for NestJS/TypeScript backend changes: review the git diff against dev for bugs, DI/module issues, validation, auth, DB/transactions, security and tests. Use when asked to review NestJS code or a PR.
---

# NestJS Code Review

You are reviewing a NestJS (TypeScript) backend change. Your goal is to find REAL problems: bugs, security holes, data integrity issues, and things that will fail in production — not to restyle the code.

## Golden rules
1. Review only what changed. Never review the whole repo.
2. Every finding MUST include a concrete failure scenario: "when a request with X arrives, Y happens". If you cannot describe one, drop the finding.
3. Before reporting a finding, READ the surrounding code: the DTO, the entity/schema, the module that provides the service, global pipes/guards/interceptors in `main.ts` and `app.module.ts`. Do not guess — open the file.
4. No style nitpicks (naming, formatting, import order) unless it causes a real bug or confusion.
5. If there are no real issues, say "No issues found". Never invent findings.
6. Follow project conventions in CLAUDE.md if it exists — read it first.

## Step 1 — Get the scope
The base branch is `dev` (unless the user explicitly names a different one).
- Run `git fetch origin dev` so the comparison is against the latest dev.
- Run `git diff --stat origin/dev...HEAD`. If there is no remote, use the local branch: `git diff --stat dev...HEAD`.
- Then `git diff origin/dev...HEAD`. If the diff is large (> ~400 lines), review ONE FILE AT A TIME with `git diff origin/dev...HEAD -- <file>`.
- Never compare against `main` / `master` unless the user asks.
- Check once what is global: open `main.ts` (global `ValidationPipe`? its `whitelist` / `forbidNonWhitelisted` / `transform` options? global guards, filters, interceptors?). Many findings depend on this.
- Write one sentence: what is this change trying to do?

## Step 2 — Review each changed file against this checklist

### Correctness & logic
- Logic matches intent: wrong conditions, inverted checks, off-by-one, wrong status codes.
- Missing `await` on async calls (especially DB writes and `save`) — errors get swallowed and responses return before work finishes.
- Edge cases: entity not found (should throw `NotFoundException`, not return `null` / crash), empty arrays, duplicates, pagination limits.
- Unhandled promise rejections in fire-and-forget calls.

### Validation & DTOs
- Every `@Body()`, `@Query()`, `@Param()` uses a DTO class with `class-validator` decorators — not a plain interface or `any` (interfaces are not validated at runtime).
- Nested objects need `@ValidateNested()` + `@Type(() => X)`; arrays need `{ each: true }`.
- Numeric/ID params parsed (`ParseIntPipe`, `ParseUUIDPipe`) or `transform: true` is enabled.
- Mass assignment: DTO fields passed straight into an entity can let a user set `role`, `isAdmin`, `ownerId`, etc. Check `whitelist` is on and the DTO doesn't expose those fields.

### Auth & authorization
- New endpoints are protected by the right guard (or are intentionally `@Public()`). Check whether guards are global or per-controller.
- Ownership checks: the user can only read/modify their OWN resources (IDOR) — e.g. `findOne(id)` must also filter by the current user / tenant when relevant.
- Role checks (`@Roles`) actually enforced by a guard that is registered.

### Dependency injection & modules
- New providers are registered in the module's `providers` and exported if used by other modules; the consuming module imports the providing module.
- Circular dependencies (`forwardRef` added as a band-aid — flag if it hides a design issue).
- Request-scoped providers introduced unintentionally (performance cost, cascades scope to dependents).
- Stateful data stored on a singleton service field (shared across all requests/users = bug).

### Database (TypeORM / Prisma / Mongoose)
- Multiple writes that must succeed together are wrapped in a transaction (`dataSource.transaction`, `prisma.$transaction`, session in Mongoose). Inside a TypeORM transaction, ALL queries use the transaction's `manager`.
- N+1 queries: queries inside loops; missing `relations` / `include` / joins.
- Raw queries with string interpolation of user input = SQL injection. Must use parameters.
- Unbounded queries (no `take`/`limit`) on tables that can grow.
- Migrations: schema/entity change without a migration; migration that drops/renames a column with data, or is not reversible.
- Race conditions on read-then-write (e.g. checking a balance or stock, then updating) without locking or an atomic update.
- Unique constraints relied on in code but missing in the DB.

### Error handling
- Throw Nest HTTP exceptions (`BadRequestException`, `NotFoundException`, ...) rather than generic `Error`, which becomes a 500.
- DB / third-party errors leaking internal details (stack traces, SQL, internal IDs) to the client.
- `try/catch` that swallows errors silently or logs and continues when it shouldn't.

### Security
- Secrets, keys, or connection strings hard-coded instead of coming from `ConfigService` / env.
- Sensitive fields (password hash, tokens) returned in responses — check entity serialization (`@Exclude()` + `ClassSerializerInterceptor`, or explicit select/mapping).
- Logging of passwords, tokens, or personal data.
- File uploads without size/type limits; user-controlled paths (path traversal).
- Outgoing requests to user-supplied URLs (SSRF).
- Missing rate limiting on sensitive endpoints (login, OTP, password reset) when the project uses `@nestjs/throttler`.

### Async jobs, events, external calls
- Queue jobs / event handlers that are not idempotent when they may be retried.
- External HTTP calls without timeout or error handling.
- Cron jobs that can overlap or run on every instance in a multi-instance deployment.

### Tests
- New business logic or bug fix with no unit/e2e test, when the project tests similar code.
- Tests that mock the very thing they're supposed to test, or don't assert behavior.

## Step 3 — Verify before reporting
For EACH candidate finding, ask yourself:
- Did I read the actual DTO / entity / module / global config, or am I assuming?
- Is it already handled globally (global pipe, guard, filter, interceptor) or in a base class?
- Can I describe the exact request or sequence of events that triggers it?
Drop anything that fails these checks.

## Step 4 — Output format
Start with a one-line summary of the change and an overall verdict: `Approve`, `Approve with comments`, or `Request changes`.

Then list findings sorted by severity:

```
### [CRITICAL|MAJOR|MINOR] <short title>
**File:** src/path/to/file.ts:42
**Problem:** what is wrong, in one or two sentences.
**Scenario:** concrete request / case where it breaks.
**Fix:** a short suggested fix (code snippet if helpful).
```

Severity guide:
- CRITICAL — security hole (auth bypass, injection, IDOR, secret leak), data loss/corruption, crash of a core flow.
- MAJOR — real bug in a realistic case, missing transaction, N+1 on a hot path, missing validation on input.
- MINOR — edge-case bug, missing test, small improvement with a real benefit.

End with at most 3 short optional suggestions (non-blocking), or none.

If the user writes in Hebrew, write the review in Hebrew (keep code, file paths and technical terms in English).
