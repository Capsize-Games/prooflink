# Threat model

Status: design analysis, 2026-10-16. No defenses listed here have been implemented
or penetration-tested in this repository. Read with the
[architecture](ARCHITECTURE.md) and [protocol](PROTOCOL.md).

## Assets and boundaries

Protect exact public content, institutional key bindings, authorized scope and
roles, approval evidence, private draft confidentiality, signing/recovery keys,
ordered historical records, current known withdrawals, reader privacy, and the
accuracy of verification labels. Availability and truthful uncertainty are
security properties: a timeout must not become a successful verification.

Trust boundaries are reader-to-verifier UI, verifier-to-untrusted retrieval,
retrieval-to-core parser, local policy-to-issuer discovery, staff-to-publisher,
publisher-to-approval service, approval-to-isolated signer, governance-to-online
signer, log-to-independent witness, mirror-to-original bytes, and recovery-to-
ordinary administration. The chosen trust policy, accepted enrollment and honest
witness quorum are explicit assumptions, not consequences of a valid signature.

Adversaries may control a social account, a staff account or endpoint, one server,
a DNS/domain administrator, a mirror, a verification website, a log operator, or
some witness keys. They can produce arbitrary convincing text/media and conduct
phishing, suppression, replay and denial of service. Do not assume attackers
announce a compromise. An attacker with all root and recovery authority can
impersonate the institution until independent enrollment/policy processes intervene.

## Threat register

| Threat | Impact | Applicable defenses | Detection and residual risk |
|---|---|---|---|
| Social media account takeover | Convincing unauthorized public persona and false posts | Signing/approval credentials independent from social credentials; official signed feed; immutable share links | Checked posts lack matching authorized evidence; readers who never check may not discover takeover; absence does not prove fraud |
| SIM swapping | Account recovery or approval hijack | No SMS-only approval or governance reset; passkeys and separately held recovery keys | Logs may show recovery attempts; compromised telecom remains a discovery/social-engineering threat |
| Phishing staff credentials | Unauthorized drafts or approvals | RP-bound passkeys, fresh digest-bound approval, origin checks, no reader login | Does not defeat a compromised real approval origin, endpoint malware or coerced approval |
| Stolen session or staff account | Attacker proposes content or reuses authentication | Fresh per-payload approval, short session lifetime, CSRF protection, grant checks at sign and admission | Alert on unusual signing; authorized malicious approval can still look legitimate |
| Compromised publisher service | Modified preview, forged workflow attestations, draft theft | Isolated signer revalidates full binding; separate approval origin for sensitive use; minimal service privileges | Organization-workflow is limited assurance; colluding approval/signer or malicious UI can fool approvers |
| Compromised routine signing key | Valid signatures on unauthorized statements | Scoped grants, isolated custody, monitoring, retirement/freeze and safe-checkpoint review | Cryptography alone cannot distinguish legitimate from stolen-key use; uncertain interval becomes Unverified |
| Insider or unauthorized delegation | Abuse of legitimate role or escalation | No staff subdelegation, least-privilege channels/kinds, two approvers for sensitive content, quorum governance | Scope violations detectable; a duly authorized insider can sign lies or approve harmful content |
| Fraudulent issuer registration | Attacker registers official-looking identity | Independent institutional enrollment, official directories and callback/attended evidence, explicit trust policies | Self-asserted keys never get recognized labels; reviewer fraud and legal ambiguity remain |
| Compromised official domain or DNS | False discovery keys, malicious verifier JavaScript or suppression | Pin genesis/binding independent from domain, signed locator continuity, independent mirrors/verifiers | First-time visitors can still be deceived; DNSSEC/TLS do not undo authorized domain compromise |
| Compromised verifier website | Fabricated green result, false content, reader tracking | Independent verifier/bundle export, official entry points, locally verifiable evidence | Web UI is a trusted presentation surface; no universal in-browser trustworthy badge exists |
| Malicious log equivocation | Different histories shown to different readers | Persistent independent witnesses, consistency proofs, checkpoint gossip, reviewed quorum intersection | Detectable on honest quorum intersection/gossip; colluding accepted quorum can hide a fork |
| Log censorship or selective admission | Suppressed revocation or statement | Independent receipt/deadline monitor, emergency admission path, alternate communication, suspend unhealthy log in policy | Fresh checkpoint cannot prove all valid submissions were admitted; targeted refusal may only be exposed by external evidence |
| Log/mirror deletion | Historical bodies or proof material unavailable | Multiple custodians retain full envelopes/tiles/checkpoints, tested offline backups | Missing bodies cause Unverified availability state; hashes do not restore deleted records |
| AI text impersonation and deepfakes | Highly plausible unauthorized messages or media | Exact signed text/attachment comparison; explicit media provenance profile later | Style, face or voice are not authority evidence; convincing unsigned material remains socially effective |
| Forged screenshots and badges | Fake appearance of verification or account context | Open actual record on known verifier, show exact canonical statement, independent export | A screenshot can copy any badge; visual inspection alone cannot prove its origin |
| Modified quotations or link substitution | Valid URL used to endorse altered nearby text | Verify the record only; local exact text comparison; show full statement and context | Truncation and interpretation require reader judgment; an unrelated genuine link remains possible |
| Replay of old signed statements | Old authorized message presented as current | Immutable IDs, claimed versus observed times, full context and terminal status, no duplicate new-publication semantics | A valid old record can still mislead; signatures do not determine relevance to today's events |
| Backdating | False claims of prior approval/publication | Author times labeled claims, accepted log order, independent observation bounds | Can establish existence by observation, not original drafting/signing time; colluding clocks weaken dating |
| Normal control-chain equivocation | Conflicting grants or histories | Quorum checks, sequenced previous-control references, complete log replay, emergency recovery | Active-authority signed branch triggers Unverified conflict; an all-compromised root quorum can issue malicious consistent policy |
| Lost governance or recovery keys | Unable to revoke, rotate or recover safely | Separate recovery quorum, encrypted backups, rehearsal and offboarding | Loss of all authorized recovery material requires visible new enrollment; availability can be permanently lost |
| Institutional capture or office succession dispute | Cryptographically valid but contested authority | Distinct office/person IDs, documented term changes, independent binding review and dispute suspension | Legal legitimacy cannot be computed from a signature; independent authorities may disagree |
| Downgrade or algorithm confusion | Acceptance under a weaker rule | Fixed profile/algorithm/type allowlists; no dynamic header key fetch; unsupported means Unverified | Parser/library defects remain; cover mixed key/alg/profile fixtures and fuzzing |
| Resource exhaustion and malicious URLs | Reader/server denial of service or internal network access | Bounded bodies, depth, signatures, log history and decompression; safe retrieval policy; rate limits | Large history hits pilot capacity; public distribution remains susceptible to volumetric DoS |
| Exhausting the bounded log before an incident | Routine publishing prevents admission of recovery or retirement | Stop routine admission at 448 entries or 7 MiB; reserve remaining capacity for validated governance/recovery controls; idempotent retries | The reserve is finite and a malicious log can still censor; suspend current results if capacity prevents trustworthy state updates |
| Draft/reader privacy leakage | Staff disclosure, profiling of controversial reads | Private draft storage, minimal logs, no third-party scripts, offline bundles, local text comparison | Origin/mirror still sees client IP/path; no network anonymity claim |
| Authentic but misleading statements | False confidence in political or factual claims | Separate origin from truth, show full context, explicit limitation text | Cannot be solved by signatures; protocol must not become a truth-rating service |
| Supply-chain compromise | Malicious signer/verifier binaries or dependencies | Minimal pinned dependencies, lockfiles/SBOM, independent rebuilds, code review, isolated keys | A malicious build can lie or steal approval; reproducible malicious source is still malicious |

## Required abuse-case verification

Implementation acceptance requires reproducible evidence for these cases:

1. A test social account attacker cannot obtain a valid publisher signature with
   social credentials, copied cookies, or an old approval receipt.
2. A valid old statement plus an omitted later withdrawal never gets a current
   Verified result from an incomplete prefix.
3. A revoked staff grant cannot issue a new statement by choosing an earlier
   `claimed_at`, referencing an earlier head, or replaying an old signature as new.
4. A forged or unrelated badge/link cannot cause the product to label adjacent
   unchecked text as verified.
5. An active-authority signed fork is detected; random unauthenticated log junk
   cannot freeze an issuer by pretending to be a control record.
6. A log with a split view cannot obtain the required honest witness quorum under
   the actual deployed membership assumptions. Restarting a witness preserves state.
7. A recovery event is accepted despite a blocked normal control chain; the
   ordinary administration API cannot replace recovery keys by itself.
8. Origin/witness/mirror outages produce dated archival results or pending
   publication, with no fabricated fresh state.
9. Changing any substantive field after an approval invalidates the binding;
   receipt-digest insertion cannot conceal another payload change.
10. Two independent implementations agree on the same evidence and policy and
    expose policy/snapshot differences when they disagree for legitimate reasons.

## Risks that remain outside cryptography

Institutional identity proofing, legal succession, trusted displays, meaningful
human approval, coercion, unreported compromise, undiscovered linkless posts,
factual truth, user attention and civic adoption remain operational/social trust
problems. Threshold keys reduce some single-person failure modes; they do not
remove collusion, capture, censorship or the need for incident response.

The highest-priority independent review targets are enrollment, approval display
and digest binding, complete-prefix/current-state semantics, recovery precedence,
witness state persistence/quorum assumptions, and UI interpretation. Signature
test vectors alone do not review any of those properties.
