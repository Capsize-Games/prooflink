# Architecture decision records

Status of all decisions: **proposed**, 2026-10-16, except the owner's explicit
privacy/license decision. Compatibility spikes and security review can change
proposals. See [references](REFERENCES.md) for source status and limitations.

## ADR-001 — Signature container

Options: JWS, COSE, DSSE, or a custom signed JSON structure. Recommend constrained
General JWS: JSON tooling and multi-signature envelopes fit public web records,
and protected type/algorithm/key identifiers are established mechanisms. COSE
is a sound alternative with compact CBOR and belongs in WebAuthn/media adapters;
requiring CBOR in the plain-text MVP adds a second data representation. DSSE
provides domain-separated payload signing in supply-chain applications but adds
another envelope/profile dependency here. A custom format has no compelling gain.
JWS is verbose and needs strict parsing; constrain headers and sign exact bytes.
Sources: [JWS](https://www.rfc-editor.org/rfc/rfc7515.html),
[COSE](https://www.rfc-editor.org/rfc/rfc9052.html),
[DSSE](https://github.com/secure-systems-lab/dsse/blob/master/protocol.md).

## ADR-002 — Algorithm and key custody

Options: Ed25519, ECDSA P-256, RSA, or negotiable multiple algorithms. Recommend
one Ed25519 JWS profile with the fully specified RFC 9864 algorithm identifier.
P-256 has useful hardware and compliance deployment compatibility; RSA increases
key/signature size. Algorithm negotiation expands confusion and test scope.
Ed25519 support is not universal in HSMs or JOSE library APIs. A Phase 0 spike
must prove the actual runtime, library and key custody path; otherwise revise
this ADR and wire profile before implementation. No custom primitive or unreviewed
fallback is allowed. Passkey credential algorithms are a separate layer.
Source: [RFC 9864](https://www.rfc-editor.org/rfc/rfc9864.html).

## ADR-003 — Signed bytes and identifiers

Options: sign reserialized objects, require JCS, sign exact UTF-8 bytes, or use
content hashes without signatures. Recommend exact payload bytes in JWS and
SHA-256 payload IDs; no reserialization during verification. JCS is appropriate
when independent serializers must derive the same object bytes, but the MVP
freezes one publisher representation. Semantically equivalent differently encoded
JSON gets a different ID; that is acceptable and must be documented. Content
hashes identify bytes but do not establish who authorized them. JWK thumbprints
use their own existing standard. Source: [JCS](https://www.rfc-editor.org/rfc/rfc8785.html).

## ADR-004 — Identity bootstrap

Options: domain-only trust, one global registry/CA, DID/VC requirements, or local
institutional bindings with optional federated attestations. Recommend the latter.
Domain trust is convenient but vulnerable to institutional/domain compromise;
a monopoly registry creates capture and continuity risks. DID syntax resolves
identifiers/keys within a method but does not independently confer real-world
office authority. VCs can carry future portable binding attestations; they do
not choose trusted issuers for a verifier. The local approach makes trust explicit
at the cost of enrollment work and possible policy disagreement. Sources:
[DID Core](https://www.w3.org/TR/did/),
[VC Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/).

## ADR-005 — Approval classes

Options: server assertion only, public credential evidence, direct personal
signatures, or claiming all are personal approval. Recommend an honest baseline
organization-workflow class, with stronger independently checkable classes only
in later reviewed profiles. Ordinary publishing can need one fresh passkey step;
high-impact communications require distinct approvers. WebAuthn authentication
does not prove informed approval by a particular human. A compromised service
may lie in a workflow attestation; public evidence and independent approval
surfaces improve some threats with added privacy/UX cost. Source:
[WebAuthn Level 3](https://www.w3.org/TR/2026/REC-webauthn-3-20260825/).

## ADR-006 — Transparency without global consensus

Options: no log, signed publisher index, a generic transparency log with witnesses,
Sigstore as mandatory identity infrastructure, or a blockchain. Recommend a
small dedicated generic tiled log with independent witnesses and monitors.
No log cannot demonstrate shared history; a publisher index can equivocate.
Sigstore/Rekor supplies relevant tooling and operational lessons, but its software
identity model does not establish government office authority, and its public
service is not assumed to accept this application. Blockchain adds consensus,
fees/governance and data-distribution complexity without solving approval or
identity binding. A per-issuer log still has admission/censorship risk; record it.
Sources: [Rekor](https://docs.sigstore.dev/logging/overview/),
[tiled logs](https://c2sp.org/tlog-tiles@v1.0.0).

## ADR-007 — Fresh control-state completeness

Options: use one inclusion proof, trust a latest-state server, use authenticated
maps, or replay a bounded complete log. Recommend complete replay in the pilot.
Inclusion is insufficient to prove no later retirement/withdrawal exists. A
signed latest-state server introduces extra trust. Authenticated maps need a
carefully reviewed construction and completeness semantics. Complete replay is
simple to audit and naturally orders controls and statements, but it is not a
large-scale solution. Enforce hard pilot bounds and explicitly reopen scaling
before expansion. Cached verified prefixes improve repeated reads without
changing the argument. Source: [tlog-tiles](https://c2sp.org/tlog-tiles@v1.0.0).

## ADR-008 — Witnesses and clock assumptions

Options: one log timestamp, one independent witness, majority without analysis,
or a reviewed quorum with persistent state. Recommend one named independent
witness in the pilot, then consider 3-of-4 with at most one Byzantine member and
fixed membership. A log signature alone is single-party chronology. Witness
continuity checking does not vouch for content or timely submission. Freshness
also needs an accepted clock model; do not equate a cosignature with exact
publication time. Quorum membership transition is a separate deferred protocol.
Sources: [witness protocol](https://c2sp.org/tlog-witness@v1.1.0),
[cosignatures](https://c2sp.org/tlog-cosignature@v1.1.0).

## ADR-009 — Storage and discovery

Options: proprietary central API, static content-addressed HTTPS/mirrors, IPFS
as a requirement, or storing all bytes on a ledger. Recommend immutable static
files with ordinary HTTPS and independent copies. A mutable index is only a
search aid. Static hosting reduces service requirements and can survive loss
of the publisher application. Mirrors need operational funding and full bytes;
hashes do not provide retention. IPFS is an optional transport with explicit
pinning commitments, not an availability guarantee. Source:
[IPFS addressing](https://docs.ipfs.tech/concepts/content-addressing/).

## ADR-010 — Rotation, recovery and incident scope

Options: one online root, email support reset, precommitted offline quorums, or
irrecoverable identities. Recommend separate governance and recovery signature
quorums, scoped online keys, an independently sequenced emergency chain and
conservative safe-checkpoint boundaries. This adds key custody and ceremony work
but prevents one compromised service from restoring itself through a password
reset. No recovery mechanism can preserve justified trust after all authorized
roots are compromised. TUF is useful precedent for separating authority roles,
not a drop-in implementation of the proposed issuer record semantics. Source:
[TUF overview](https://theupdateframework.io/docs/overview/).

## ADR-011 — Implementation and service scope

Options: many language microservices, one full-stack monolith, or a shared small
verification core with isolated security boundaries. Recommend TypeScript core,
CLI, static verifier and small Node publisher, with SQLite/outbox and a separate
signer. Candidate libraries are jose and SimpleWebAuthn, pending compatibility,
maintenance and license checks at pinning time. Full custom PKI, mandatory OIDC
providers, brokers and replicated databases add costs before a need is proven.
The shared language helps a solo engineer but does not establish independent
interoperability; fund a second implementation. A future Capsize UI must use
the shared capsize-web workspace and `@capsize/ui` conventions.

## ADR-012 — Media and content comparison

Options: claim all similar media verified, add exact attachment hashes, require
C2PA now, or defer media entirely. Recommend text plus exact-byte attachment
descriptors for the MVP, with no automatic deepfake determination. A later C2PA
adapter should use reviewed provenance semantics and state its certificate/trust
profile. Metadata stripping and transcoding break simple byte comparison;
perceptual matches locate candidates but do not prove signed provenance. Source:
[C2PA 2.3 baseline](https://spec.c2pa.org/specifications/specifications/2.3/specs/C2PA_Specification.html).

## ADR-013 — Public result and privacy

Options: a universal green badge, detailed crypto-only diagnostics, or layered
plain-language status with inspectable evidence. Recommend four public status
classes with explicit authorization type, evidence freshness and independent
export. Unknown or unsigned is Unverified; factual truth is separate. No reader
account, third-party analytics or remote fonts is needed. Hosting still exposes
IP/path to operators; an anonymity claim would be false. Design for WCAG 2.2 AA
and validate comprehension with actual recruited users. Source:
[WCAG 2.2](https://www.w3.org/TR/WCAG22/).

## ADR-014 — License and public adoption

**Accepted owner constraint:** private `Capsize-Games` repository and Capsize LLC
restrictive proprietary license, 2026-10-16. This supersedes the pasted brief's
open-source requirement. The exact HQ license is in [LICENSE](../LICENSE).

Alternatives for a future owner decision include a permissive public specification
and verifier, separately licensed publisher hosting, or retaining everything as
private research. Public independent implementation/adoption requires suitable
reuse and patent rights; the present notice grants none. No license switch,
public repository, public package or implied grant is authorized by the design.
Third-party component rights remain their own and must be preserved on reuse.
