# Implementation roadmap

Status: proposed plan, 2026-10-16. The repository bootstrap supplies architecture
and documentation checks only. No phase below is implemented. Estimates assume
one experienced engineer using coding assistance; independent reviews and pilot
coordination still need other people and cannot be replaced by passing tests.

Read [architecture](ARCHITECTURE.md), [protocol](PROTOCOL.md),
[threat model](THREAT_MODEL.md), and [decisions](DECISIONS.md) together.

## Estimation assumptions

Effort is focused person-weeks, not a delivery commitment. Allow additional
elapsed time for review, institution approvals and operator coordination. Costs
are USD planning allowances for small pilot workloads, not researched vendor
quotes: a few hundred text statements, low traffic, 1-3 small service hosts,
static storage, backups, and independent operators. They exclude developer
compensation, taxes, insurance, legal work, accessibility recruitment, and partner
staff time unless stated. No account, service purchase, paid CI, security review,
or infrastructure deployment is authorized by this plan.

Reserve a provisional $10,000-40,000 external review budget before public use;
obtain actual scoped quotes later. Use $300-1,500 as a provisional hardware/key
custody rehearsal allowance, subject to the actual selected supported equipment.
These are budgeting assumptions, not claims about market pricing or assurance
that any budget purchases an adequate review.

## Phase 0 — Proof of concept

**Scope:** one synthetic issuer, signed plain-text statements, a CLI and independent
offline evidence verification. Prove library/key custody and log-profile feasibility
before committing to service architecture. No real official identity or public badge.

**Dependencies:** finalized schemas and test semantics, available maintained JWS
implementation for RFC 9864 Ed25519, an actual candidate signer, and selected
C2SP/log/witness libraries. Resolve the approval-digest transform and recovery
records before building services around them.

**Tasks:** implement strict parsing and fixture key generation; create positive
and negative signed vectors; implement pure offline verification; build a second
small verifier through a different library/runtime; demonstrate ordered control
replay, key retirement and emergency epoch freeze; integrate one local log/witness
and archive the exact engine versions and command results.

**Effort and operations:** 3-5 person-weeks; $0-30/month incremental laboratory
hosting allowance if local equipment is available. Hardware rehearsal and external
review are separate. Do not acquire equipment until requirements are concrete.

**Security:** fixture-only keys; no custom cryptographic primitives; no network
fetch from arbitrary JOSE URLs; no current-state Verified claim from offline
signature evidence alone. Threat-model review before accepting the format.

**Acceptance:** both implementations agree on exact signed bytes, algorithm/type
allowlists, issuer/grant mismatch, changed text, duplicate JSON keys, stale heads,
replay, retirement, compromise boundaries, and missing evidence. Actual signer
support is demonstrated, and a single replayable evidence bundle includes exact
tool versions and hashes. Disagreements block the next phase.

**Deferred:** real institutional enrollment, production key custody, public UI,
live freshness guarantees, staff passkeys, multiple institutions and media.

## Phase 1 — Usable MVP and bounded pilot

**Scope:** one enrolled institution, routine organization-workflow notices, private
publishing UI, passkey approval, isolated signer, public accessible verifier,
one bounded issuer log, independent witness and mirror. Retain existing CMS and
social accounts; sharing a URL is sufficient for distribution.

**Dependencies:** Phase 0 compatibility and interoperability gates, a willing
pilot institution and independent operators, reviewed enrollment/custody, owner
decision permitting any public code/specification distribution required for the
pilot. Restricted private testing can proceed under the existing license.

**Tasks:** implement durable SQLite/outbox workflow and idempotency; freeze and
preview exact text; bind fresh approvals to candidate digests and validate them
inside the signing boundary; implement static records and bundle export; replay
all pilot log entries; implement withdrawal and recovery UI/procedures; add local
text comparison, status reasons, accessibility and privacy checks; exercise backups
and operator incident communications.

**Effort and operations:** 10-16 person-weeks plus review/partner delays;
$30-150/month total small-pilot infrastructure allowance, split across independent
operators where possible. Reserve external review separately. A witness operated
by the same engineer on the same account does not satisfy independence.

**Security:** independent review of enrollment, signer/approval separation,
current-state completeness, recovery and UI claims; no SMS recovery bypass;
production key custody validated on the actual chosen mechanism. Cap logs at
512 entries and 8 MiB of envelope data; stop routine admission at 448 entries or
7 MiB to preserve emergency control capacity. Test cutoff, reserve authorization,
retry deduplication and full-reserve exhaustion. Pause onboarding before capacity
is reached.

**Acceptance:** publish and verify routine notices through actual passkeys;
editing invalidates approvals; origin outage still permits archival checks from
the mirror; stale witness/history never yields current Verified; withdrawal and
compromise drills show the expected result; two implementations agree under the
same policy/snapshot/time; target-device p95, keyboard/screen-reader and reader
comprehension tests meet the [pilot criteria](ARCHITECTURE.md#j-pilot-deployment).

**Deferred:** public credential-evidence class, generic DID/VC integrations,
global discovery, automatic social-feed annotation, multi-issuer federation,
log migration, quorum membership changes, and scalability beyond the pilot bound.

## Phase 2 — Federated infrastructure

**Scope:** multiple enrolled publishers, independently selectable verifier policies,
multiple mirror operators, audited delegation/recovery ceremonies, and stronger
witness assumptions. Make protocol evidence portable before expanding traffic.

**Dependencies:** successful bounded pilot, independent maintainers/operators,
explicit public reuse/license/patent decision if pursuing open adoption, stable
schemas and conformance suite, and security review of transitions/scaling.

**Tasks:** define and test 3-of-4 witness operation under the selected fault model;
specify overlapping membership/log transitions; distribute signed rollback-resistant
policies; support multiple accepted binding attesters without a mandatory registry;
build monitors for admission censorship and conflicting histories; improve offline
archive transfer; choose a reviewed scalable state-completeness profile if needed.
Investigate TUF for policy updates and authenticated-state evidence without claiming
either automatically proves institutional authority or revocation absence.

**Effort and operations:** 12-20 person-weeks plus independent review; $100-500/month
small-federation infrastructure planning allowance. Long-term independent operator
funding is additional governance work. Replication and availability work scale with
real traffic and archive commitments.

**Security:** prove quorum intersection and persistent witness state; test all
membership/log transitions under partition, fork, stale policy, rollback and
recovery; independent review of any authenticated map/monitor-snapshot trust model.
Do not weaken full-prefix semantics simply to pass performance tests.

**Acceptance:** at least two independently administered issuers/verifiers/mirrors;
one issuer or vendor outage does not prevent checking retained evidence; fault
injection confirms declared witness assumptions; policy disagreement is visible;
reviewed transition/scaling vectors pass two independent implementations.

**Deferred:** universal identity legitimacy decisions, public credential evidence
without its own review, platform-wide discovery, and arbitrary unbounded histories
under the small-pilot profile.

## Phase 3 — Distribution integrations

**Scope:** CMS adapters, SDKs, optional browser extensions and media provenance
adapters; preserve the basic no-install verification path.

**Dependencies:** stable public wire profile and rights for distributed code,
conformance tests, selected platform API access/terms, and each adapter's privacy
and security review. No platform cooperation or API approval is assumed.

**Tasks:** one CMS integration first; scoped social sharing adapters; CLI/SDK
release packages with pinned dependencies and rebuild evidence; opt-in extension
with minimum permissions; local candidate matching; C2PA adapter with explicit
asset/transcoding/trust semantics; accessible QR/print and email workflows.

**Effort and operations:** 8-16 person-weeks for a limited set, not all networks;
$100-750/month infrastructure planning allowance excluding paid platform API
fees, video processing and unpredictable media bandwidth. Re-estimate from actual
integration/provider requirements before implementation.

**Security:** sanitize platform content; never verify a whole account from one
record; prevent extension tracking and token leakage; validate media parser and
trust-list boundaries; reproducible packaging and independent verifier tests.

**Acceptance:** one real CMS round trip, one chosen social distribution round
trip if API access is available, and browser-only fallback all preserve the same
signed payload; stripped links or metadata degrade to explicit missing evidence;
extension/media results never overstate authorization or factual truth.

**Deferred:** guaranteed behavior on noncooperating platforms, universal deepfake
detection, automatic browser trusted UI, and integrations with unavailable APIs.

## Phase 4 — Adoption and maintenance

**Scope:** expand only after the institution, operator and review processes work.
Proposed audiences are civic organizations, governments, universities, journalists
and other institutions; none is an existing customer or participant.

**Dependencies:** owner-approved release rights and governance, independent
implementations/maintainers, sustainable archive/operator funding, accessible
onboarding and established security contacts/support responsibilities.

**Tasks:** publish versioned proposals and vectors under approved rights; recruit
institutions without trusted-placement sales; run observed usability and recovery
exercises; establish maintainer succession and incident funding; document policy
appeals, operator retention and exit procedures; commission periodic reviews.

**Effort and operations:** 8-16 person-weeks for initial adoption work, then ongoing
maintenance; $250-2,000/month infrastructure planning allowance for a small network,
excluding staff/support, audits, large media and high-volume traffic. Community
independence requires more than a Capsize-operated set of servers.

**Security:** maintain dependency/security response, authorization offboarding,
recovery rehearsals, trust-policy review, and honest verified-origin copy. Track
actual operational results, never infer trust from adoption counts.

**Acceptance:** independently run deployments, verified export/exit procedures,
published compatibility results, measured reader comprehension, funded maintenance
ownership, and no vendor endpoint required to verify retained records under an
accepted policy. Public/open governance is only claimable after it exists.

**Deferred:** guarantees of factual truth, unanimous legal identity judgments,
universal reader adoption, and automatic detection of every unsigned impersonation.

## First ten engineering tasks

These are the next engineering tasks after this documentation bootstrap, in order.
Each produces reviewable evidence before the dependent task starts.

1. Freeze the initial threat model and result semantics in executable acceptance
   scenarios, including the six-month account takeover and stale-withdrawal cases.
2. Prove RFC 9864 Ed25519 JWS support across the chosen maintained library,
   browser/CLI runtimes and actual candidate key custody mechanism; record exact
   versions and revise ADR-002 if the proposal is unsupported.
3. Define closed machine-readable schemas for every record, envelope, bundle and
   result, including complete recovery sequencing and strict encoding/size rules.
4. Specify the candidate-to-final approval transform and versioned challenge
   encoding without a digest cycle; produce exact-byte positive/negative vectors.
5. Generate fixture-only genesis, grants, statements, retirement, withdrawal and
   recovery envelopes with deterministic expected hashes and documented signing keys.
6. Implement a bounded pure verification core and offline CLI that distinguishes
   signature checks, identity policy, authority, content state and freshness.
7. Build an independent verifier using a different library/runtime and compare
   all fixtures, parser edge cases and failure reason semantics.
8. Integrate a selected maintained tiled-log/witness engine in isolation; pin
   versions and prove admission receipts, full-prefix replay, inclusion,
   consistency, witness persistence, fork detection and censorship monitoring.
9. Implement the private frozen-draft/approval/outbox/signing workflow with actual
   passkeys, independent signer validation, idempotency and explicit pending states.
10. Prepare the bounded institutional pilot: reviewed enrollment/custody, public
    static evidence and accessible verifier, independent mirror/witness, attack
    and recovery drills, target-device measurements, and independent security
    review before any real public use.
