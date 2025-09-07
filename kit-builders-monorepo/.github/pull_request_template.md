<!--
Pull Request Template
Keep sections concise. Remove anything not applicable.
Editing the PR description will retrigger any automation.
-->

## Summary

<!-- What & why in 2–4 sentences. Link issues (e.g. Fixes #123) -->

## Scope / Components

<!-- Tick all that apply -->

- [ ] Web (Next.js)
- [ ] API (Rails)
- [ ] Design System
- [ ] Database / Migration
- [ ] Background Jobs
- [ ] Infra / DevOps
- [ ] Docs / Config
- [ ] Other (specify below)

## Changes

<!-- Bullet list of notable changes / new endpoints / schema mods -->

## Screenshots / GIF (UI changes)

<!-- Before / After if visual -->

## Risk & Rollout

- Risk Level: ☐ Low ☐ Medium ☐ High
- Rollout Strategy: ☐ Standard ☐ Behind Feature Flag ☐ Gradual / Canary ☐ Dark Launch
- Feature Flag(s): <!-- name(s) or N/A -->
- Revert Plan: <!-- how to rollback safely -->

## Testing

- [ ] Unit tests added / updated
- [ ] Integration / API tests
- [ ] E2E / Playwright (if UI critical path)
- [ ] Manual tested locally
- [ ] Verified in staging / preview env
- [ ] Performance impact assessed (N/A if trivial)

## Accessibility (A11y)

- [ ] Labels / ARIA
- [ ] Keyboard navigation
- [ ] Color contrast
- [ ] Focus states
- [ ] Reduced motion (if animated content)

## Documentation

- [ ] Updated README / docs
- [ ] Added or updated API docs / OpenAPI
- [ ] Added code comments where complex
- [ ] Migration / operational notes added

## Security / Privacy

- [ ] No secrets committed
- [ ] Input validation / sanitization
- [ ] Auth / authorization changes reviewed
- [ ] PII handled correctly / minimized

## Performance

- [ ] Avoided N+1 / unnecessary loops
- [ ] Query plans inspected (if new queries)
- [ ] Bundle size impact reviewed (web)

## AI Assistance Disclosure

- [ ] No AI assistance
- [ ] Draft generated then heavily modified
- [ ] Small snippets / refactors suggested
- [ ] Large blocks generated (reviewed & adapted)
  - Tool(s):
    ☐ GitHub Copilot
    ☐ Other: **\_\_**

## Related Work

<!-- Links to design docs / tickets / ADRs / external resources -->

## Migration / Deployment Notes

<!-- e.g. run rake task, backfill script, queue drain, infra change -->

## Checklist (Gate to Merge)

- [ ] CI green (tests + lint + typecheck)
- [ ] No debug / console noise
- [ ] All TODO/FIXME resolved or ticketed
- [ ] Reviewer approvals met
- [ ] QA sign-off (if required)
- [ ] Version / changelog updated (if published package)

## Follow-ups (Optional)

<!-- Future improvements intentionally deferred -->
