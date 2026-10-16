# Technical references and research status

Checked against primary sources on 2026-10-16. These sources support technology
properties and terminology; the proposed ProofLink record semantics, limits,
quorums, costs, roadmap and pilot targets are design judgments. A source's
existence is not evidence that this repository implements it or that a selected
library has passed interoperability checks. Links may advance; pin the versions
actually implemented and record new research when changing a design decision.

## Standards and technology comparisons

| Source | Status and relevance | Design consequence |
|---|---|---|
| [RFC 7515 — JWS](https://www.rfc-editor.org/rfc/rfc7515.html) | IETF Standards Track; signed byte container with JSON/compact serializations | Constrained General JWS profile; no unprotected headers |
| [RFC 8032 — EdDSA](https://www.rfc-editor.org/rfc/rfc8032.html) | IRTF Informational specification of Ed25519/Ed448 | Use maintained Ed25519 implementation, not new crypto |
| [RFC 8037 — CFRG curves for JOSE](https://www.rfc-editor.org/rfc/rfc8037.html) | IETF Standards Track; OKP key representation | Public Ed25519 JWKs and standard thumbprints |
| [RFC 9864 — fully specified algorithms](https://www.rfc-editor.org/rfc/rfc9864.html) | IETF Standards Track; JOSE `Ed25519`, deprecates polymorphic `EdDSA` | Verify actual library support before committing to the profile |
| [RFC 7638 — JWK thumbprints](https://www.rfc-editor.org/rfc/rfc7638.html) | IETF Standards Track; stable public key fingerprinting operation | Opaque key IDs, not proof of real-world identity |
| [RFC 8259 — JSON](https://www.rfc-editor.org/rfc/rfc8259.html) | IETF Internet Standard; JSON interchange format | Stricter application constraints reject duplicate members and malformed encodings |
| [RFC 4648 — base encodings](https://www.rfc-editor.org/rfc/rfc4648.html) | IETF Standards Track; base64 and base64url | Explicit different encodings for JWS and bundle binary fields |
| [RFC 8785 — JCS](https://www.rfc-editor.org/rfc/rfc8785.html) | Independent-stream Informational JSON canonicalization scheme | Compared; unnecessary for verification of frozen JWS payload bytes |
| [RFC 8725 — JWT best current practices](https://www.rfc-editor.org/rfc/rfc8725.html) | IETF BCP; relevant JOSE algorithm/type confusion defenses | Allowlist algorithm and use disjoint record validators; this protocol is not a JWT login token |
| [RFC 9052 — COSE](https://www.rfc-editor.org/rfc/rfc9052.html) | IETF Standards Track; CBOR signed-message structures | Alternative container; retain in passkey/media layers rather than duplicate MVP wire formats |
| [WebAuthn Level 3](https://www.w3.org/TR/2026/REC-webauthn-3-20260825/) | W3C Recommendation, 2026-08-25, confirmed from current TR page | Authentication/credential evidence; not an arbitrary institutional signature or guarantee of human intent |
| [VC Data Model 2.0](https://www.w3.org/TR/vc-data-model-2.0/) | W3C Recommendation; credentials model leaves choice of trusted issuers to verifiers | Potential later portable enrollment attestations; no mandatory VC stack |
| [DID Core](https://www.w3.org/TR/did/) | W3C Recommendation; identifiers and verification methods, with method-specific resolution/trust | Identifier syntax does not establish office authority; no mandatory DID method |
| [RFC 5280 — X.509 PKI](https://www.rfc-editor.org/rfc/rfc5280.html) | IETF Standards Track; certificate/path validation profile | TLS transport/endpoint trust is distinct from publisher authorization |
| [RFC 4033 — DNSSEC](https://www.rfc-editor.org/rfc/rfc4033.html) | IETF Standards Track; DNS data authentication and limits | Useful discovery protection; compromised domain administration remains a threat |
| [RFC 3161 — timestamp protocol](https://www.rfc-editor.org/rfc/rfc3161.html) | IETF Standards Track; trusted timestamp authority protocol | Optional extra archival time evidence with explicit trusted-clock dependency |
| [RFC 9162 — CT v2](https://www.rfc-editor.org/rfc/rfc9162.html) | IETF Experimental; certificate transparency format, obsoletes RFC 6962 | Do not claim generic statements are CT v2 certificate entries |
| [RFC 6962 — CT v1](https://www.rfc-editor.org/rfc/rfc6962.html) | Experimental, obsoleted by RFC 9162; tree construction referenced by tiled-log profile | Use the selected generic log library/profile, not mixed leaf encodings |
| [C2SP tlog-tiles v1.0.0](https://c2sp.org/tlog-tiles@v1.0.0) | Community specification; static tiled log reads with bounded entry representation | Pilot generic log read profile; submission is a separate adapter |
| [C2SP tlog-checkpoint v1.1.0](https://c2sp.org/tlog-checkpoint@v1.1.0) | Community checkpoint/note profile | Retain native signed note bytes |
| [C2SP tlog-witness v1.1.0](https://c2sp.org/tlog-witness@v1.1.0) | Community synchronous consistency/cosigning protocol | Independent persistent-state witnesses; not semantic approval |
| [C2SP tlog-cosignature v1.1.0](https://c2sp.org/tlog-cosignature@v1.1.0) | Community timed cosignature profile | Freshness depends on accepted clocks and witness policy |
| [Rekor documentation](https://docs.sigstore.dev/logging/overview/) | Maintained Sigstore project documentation; signature transparency tooling | Reuse concepts/libraries; public instance suitability/admission not assumed |
| [Sigstore security model](https://docs.sigstore.dev/about/security/) | Project trust and transparency assumptions | Monitoring and explicit identity/trust roots matter; software OIDC identity is not office identity |
| [TUF overview](https://theupdateframework.io/docs/overview/) | Established update-security framework documentation | Candidate later trust-policy update distribution and role separation |
| [DSSE protocol](https://github.com/secure-systems-lab/dsse/blob/master/protocol.md) | Project-defined signing envelope, not an IETF standard | Compared as alternative; no requirement in the minimum profile |
| [C2PA 2.3 technical specification](https://spec.c2pa.org/specifications/specifications/2.3/specs/C2PA_Specification.html) | Industry specification, pinned research baseline, not asserted latest | Future media adapter with separate trust/asset semantics and review |
| [get.gov eligibility](https://get.gov/domains/eligibility/) | Official U.S. government registration rules | Supports government domain evidence, not personal message approval |
| [NIST identity proofing guidance](https://pages.nist.gov/800-63-4/sp800-63a.html) | SP 800-63-4 series official guidance for individuals | Distinguish identity proofing from organizational office entitlement; no compliance claim |
| [IPFS content addressing](https://docs.ipfs.tech/concepts/content-addressing/) | Official project documentation | Optional transport; bytes still require hosting/pinning and publisher authority |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | W3C Recommendation | Target AA, then perform actual accessibility/comprehension checks |

## Candidate implementation sources

- [jose](https://github.com/panva/jose): maintained JOSE library candidate for
  compatible web runtimes. Exact RFC 9864 algorithm support must be demonstrated;
  no dependency is installed or approved by this document.
- [SimpleWebAuthn server documentation](https://simplewebauthn.dev/docs/packages/server):
  candidate for RP ceremony verification; production origin/UV/challenge policies
  and independent signer validation still need application design and tests.
- [Node.js release table](https://nodejs.org/en/about/previous-releases): Node 24
  and 22 listed LTS at research time. Proposed implementation targets Node 24;
  the bootstrap documentation check was designed for Node 22+.

No third-party implementation code, media, datasets, or standard text was copied
into this bootstrap. Dependency licenses and notices must be reviewed and kept
when adding actual components. Cited source copyrights remain their own.

## Questions requiring implementation evidence

Library/actual hardware support, log write/admission receipts, complete-history
performance on inexpensive devices, approval binding, independent witness operation,
pilot identity enrollment, recovery-key ceremony, independent interoperability,
and reproducible build outputs have not been tested. No pilot participant,
operating contract, public license, or deployment exists. The roadmap supplies
specific acceptance gates rather than treating these questions as resolved.
