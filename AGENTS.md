# Project instructions

## Scope and owner decisions

- Project: ProofLink, a temporary name for authenticated public communications.
  `Capsize-Games` is the GitHub organization; this is not a game project.
- Owner decision, 2026-10-16: keep the repository private and use the exact Capsize
  LLC proprietary license from HQ. Use `LicenseRef-Capsize-Proprietary` metadata
  and `private: true` for packages. Do not publish packages, enable Pages, or
  change visibility/licensing without an explicit owner instruction.
- The source brief's open-source requirement is overridden for this repository.
  Preserve this conflict in design and handoff material. Do not imply that the
  current specification is publicly licensed for independent implementation.
- Preserve `docs/source/original-brief.md` verbatim. Record changed requirements
  separately. Architecture recommendations are proposals, not owner approvals of
  a stack, vendor, budget, pilot partner, or production deployment.
- This bootstrap contains documentation and documentation checks only. Do not
  report protocol functionality as implemented until it exists and passes checks.

## Engineering

- Read `COPY_POLICY.md` before drafting or editing documentation or product copy.
- Read the architecture, protocol, threat model, and decisions before implementing
  security-sensitive behavior. Preserve the distinction between signature,
  institutional authorization, evidence of credential use, and factual truth.
- Use standard cryptographic primitives and maintained libraries. No custom
  signature, hash, Merkle proof, or passkey implementation.
- Pin accepted dependencies and exact transparency profiles after compatibility
  spikes. Fail closed on unsupported critical semantics; never silently downgrade
  a verification profile or display unsupported certainty.
- Keep verification core deterministic and independent from network retrieval,
  presentation, and local trust policy. Verification results must name the policy,
  evidence snapshot, freshness, and reason codes.
- Never commit production credentials, enrollment identity documents, private
  keys, or unredacted reader/staff logs. Test keys must be unmistakably fixtures.
- Use `uv` for any new Python project environment, preserving shared cache and
  hardlink settings. No Python environment is required for current checks.
- Any future Capsize website/dashboard must follow the HQ brand guide and
  capsize-web architecture, use `@capsize/ui`, and keep square corners. Create
  dashboards with the shared workspace generator. No website is created here.
- Run `npm run check` after documentation changes. State exactly what ran and
  distinguish documentation checks from security, browser, interoperability, and
  deployment tests. Add meaningful implementation tests when functionality exists.
- Do not add optional AI vendor footers or AI co-author commit trailers. Preserve
  required disclosures and third-party attribution.
