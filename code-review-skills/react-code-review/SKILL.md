---
name: react-code-review
description: Code review for React/TypeScript changes: review the git diff against dev for bugs, hooks misuse, rendering/perf issues, security and missing tests. Use when asked to review React code or a PR.
---

# React Code Review

You are reviewing a React (usually TypeScript) change. Your goal is to find REAL problems that would break, mislead, or slow the app — not to restyle the code.

## Golden rules
1. Review only what changed. Never review the whole repo.
2. Every finding MUST include a concrete failure scenario: "when X happens, Y breaks". If you cannot describe one, drop the finding.
3. Before reporting a finding, READ the surrounding code: the component's props/types, its callers, the hook or util it uses. Do not guess how something is defined — open it.
4. No style nitpicks (naming, formatting, import order) unless it genuinely causes confusion or a bug. Linters handle style.
5. If there are no real issues, say "No issues found". Never invent findings to fill space.
6. Follow project conventions in CLAUDE.md if it exists — read it first.

## Step 1 — Get the scope
The base branch is `dev` (unless the user explicitly names a different one).
- Run `git fetch origin dev` so the comparison is against the latest dev.
- Run `git diff --stat origin/dev...HEAD`. If there is no remote, use the local branch: `git diff --stat dev...HEAD`.
- Then `git diff origin/dev...HEAD` for the full diff. If the diff is large (> ~400 lines), review it ONE FILE AT A TIME with `git diff origin/dev...HEAD -- <file>`.
- Never compare against `main` / `master` unless the user asks.
- Write one sentence: what is this change trying to do? Use that to judge whether the code actually does it.

## Step 2 — Review each changed file against this checklist

### Correctness & logic
- Does the logic match the intent? Off-by-one, wrong condition, inverted boolean, wrong comparison (`==` vs `===`, comparing objects by reference).
- Edge cases: empty arrays, `null`/`undefined` data, loading and error states, zero, very long strings.
- Async: missing `await`, unhandled promise rejections, race conditions (a slow old request overwriting newer state), state updates after unmount.

### Hooks
- Rules of hooks: no hooks inside conditions, loops, or after early returns.
- `useEffect` / `useMemo` / `useCallback` dependency arrays: missing deps (stale closures) or deps that change every render (infinite loops, effect running every render).
- Effects that fetch or subscribe MUST clean up (AbortController, unsubscribe, clearTimeout/clearInterval).
- `useEffect` used for derived state that should just be computed during render.
- State updates based on previous state should use the functional form `setX(prev => ...)`.

### State & rendering
- Mutating state or props directly (`arr.push`, `obj.x = ...` on state) instead of creating new references.
- Duplicated/derived state that can get out of sync with its source.
- List `key`s: missing, using array index on lists that reorder/insert/delete, or non-unique keys.
- Controlled vs uncontrolled input mix (`value` without `onChange`, or switching from undefined to a value).

### Performance (only report if it plausibly matters)
- New object/array/function created inline and passed to a memoized child or used as an effect dependency, defeating memoization.
- Expensive computation on every render without `useMemo` in a hot component.
- Fetching in a loop / waterfall requests that could be parallel.
- Large lists rendered without virtualization when the data can be big.

### Data fetching (React Query / SWR / RTK Query if used)
- Query keys missing variables the query depends on (stale/shared cache bugs).
- Mutations that don't invalidate or update the related queries.
- Loading and error states not handled in the UI.

### Security
- `dangerouslySetInnerHTML` with any user-controlled or API data without sanitization (XSS).
- User input placed into `href`/`src` without validating the protocol (`javascript:` URLs).
- Secrets, API keys or tokens in frontend code or committed `.env` files.
- Tokens stored in `localStorage` when the project uses a different pattern.

### TypeScript
- `any`, `as` casts, or non-null assertions `!` that hide a real possible `undefined`.
- Props types that don't match how the component is actually called.

### Accessibility (report only clear problems)
- Clickable `div`/`span` without role, keyboard handler, or focusability — should usually be a `button`.
- Images without `alt`, inputs without labels.

### Tests
- New logic or bug fixes with no test, when the project has tests for similar code.
- Tests that don't actually assert the behavior (only snapshot, or always pass).

## Step 3 — Verify before reporting
For EACH candidate finding, ask yourself:
- Did I read the actual definition/caller, or am I assuming?
- Is it already handled elsewhere (a parent error boundary, a wrapper hook, a validation layer)?
- Can I state the exact input or user action that triggers the bug?
Drop anything that fails these checks.

## Step 4 — Output format
Start with a one-line summary of the change and an overall verdict: `Approve`, `Approve with comments`, or `Request changes`.

Then list findings sorted by severity:

```
### [CRITICAL|MAJOR|MINOR] <short title>
**File:** path/to/file.tsx:42
**Problem:** what is wrong, in one or two sentences.
**Scenario:** concrete case where it breaks.
**Fix:** a short suggested fix (code snippet if helpful).
```

Severity guide:
- CRITICAL — security hole, data loss, crash, or broken core flow.
- MAJOR — real bug in a realistic case, memory leak, significant perf issue.
- MINOR — edge-case bug, missing test, small improvement with a real benefit.

End with at most 3 short optional suggestions (non-blocking), or none.

If the user writes in Hebrew, write the review in Hebrew (keep code, file paths and technical terms in English).
