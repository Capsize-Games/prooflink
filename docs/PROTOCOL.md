# ProofLink protocol draft

Profile: `prooflink/0.1-draft`. Date: 2026-10-16. Unimplemented and subject to
security review. This is an application protocol proposal, not a registered
standard. Normative words describe the proposed profile, not implemented behavior.

The current proprietary license applies. Public reuse rights have not been
granted. See [README.md](../README.md) and [architecture](ARCHITECTURE.md).

## 1. Conformance and boundaries

Separate three functions:

1. **Core evidence check:** signed bytes, recognized record types, authorization
   chain, and accepted event order for a supplied snapshot.
2. **Trust policy:** which real-world issuer binding, genesis, logs, witnesses,
   approval classes, and freshness assumptions the verifier accepts.
3. **Retrieval and presentation:** obtaining evidence and displaying the result.

The minimum Phase 0 profile verifies offline core evidence under a pinned fixture
policy. It MUST state that current withdrawal state was not checked. The Phase 1
pilot profile adds complete log replay and a selected independent witness. It
supports organization-workflow statements only. A verifier MUST NOT advertise a
stronger approval or decentralization class than it actually checks.

The protocol authenticates public records, not accounts, people in video,
truthfulness, or all content visually adjacent to a record. Unsigned messages
are Unverified, not presumptively fraudulent.

## 2. Cryptographic and encoding profile

| Item | Draft requirement |
|---|---|
| Envelope | RFC 7515 General JWS JSON Serialization, constrained below |
| Signature | Ed25519, JOSE `alg: "Ed25519"` from RFC 9864 |
| Public key | RFC 8037 OKP JWK, `kty: "OKP"`, `crv: "Ed25519"`, 32-byte `x`; never `d` |
| Key identifier | `pl-key-` plus base64url SHA-256 JWK thumbprint under RFC 7638 |
| Issuer identifier | `pl-issuer-` plus thumbprint of the genesis identity public JWK |
| Payload | Strict RFC 8259 JSON encoded as UTF-8 without BOM |
| Object identifier | `sha256:` plus 64 lowercase hex digits over exact payload bytes |
| Envelope identifier | `sha256:` plus 64 lowercase hex digits over exact envelope bytes |
| JWS encodings | Canonical unpadded base64url; reject noncanonical encodings |
| Hash | SHA-256; no algorithm negotiation in this draft |

The JSON and base-encoding references are
[RFC 8259](https://www.rfc-editor.org/rfc/rfc8259.html) and
[RFC 4648](https://www.rfc-editor.org/rfc/rfc4648.html).

Use the exact signing input prescribed by [JWS](https://www.rfc-editor.org/rfc/rfc7515.html).
Use a maintained library for signatures and JWS handling; the parser must also
enforce this stricter profile. The
[Ed25519 primitive](https://www.rfc-editor.org/rfc/rfc8032.html),
[OKP key representation](https://www.rfc-editor.org/rfc/rfc8037.html), and
[JWK thumbprints](https://www.rfc-editor.org/rfc/rfc7638.html) are existing standards.
Thumbprint serialization is that standard's operation, not the application's
general JSON serialization rule.

RFC 9864 supplies a fully specified `Ed25519` identifier and deprecates the
polymorphic `EdDSA` identifier for new use. Do not silently accept an alternate
`alg`, change protected bytes before checking a signature, or assume a library's
older EdDSA API supports this profile. Algorithm support is an implementation
spike and release gate. See [RFC 9864](https://www.rfc-editor.org/rfc/rfc9864.html).

### 2.1 Exact-byte signing and canonical content

The publisher freezes one UTF-8 payload. Its signed plain text is the canonical
statement. It MUST show that text and attachments before approval and keep the
same bytes through signing and publication. Publisher input converts line endings
to LF before preview/approval; the verifier never normalizes a signed payload.
Do not apply whitespace folding, Unicode normalization, OCR correction, or HTML
rendering to obtain bytes for signature verification.

The verifier checks the decoded JWS payload bytes directly. It MUST NOT parse
and reserialize JSON to construct the signature input or record identifier.
Different JSON serialization yields a different record ID, even if objects are
semantically equivalent. This avoids requiring JCS for payloads. If future
cross-system editing requires canonical object serialization, introduce a new
profile using [JCS](https://www.rfc-editor.org/rfc/rfc8785.html) with vectors;
do not retrofit it into signatures over existing bytes.

Render `content.text` as inert text, with escaped markup and visible treatment
of suspicious direction/control characters. URLs are signed text, not automatic
authority anchors or permission to fetch resources. Exact quotation comparison
is over decoded signed text; a match does not authenticate the surrounding post.

### 2.2 Envelope constraints

The envelope has exactly `payload` and `signatures`. Every signature has exactly
`protected` and `signature`. Unprotected headers, detached payloads, `b64:false`,
embedded keys/certificates, `jku`, `x5u`, shared secrets, and `alg:none` are forbidden.
Reject duplicate JSON members in payload, envelope and protected headers. Apply
an explicit algorithm allowlist and type checking, consistent with the relevant
defenses in [JOSE security guidance](https://www.rfc-editor.org/rfc/rfc8725.html).

The protected header has exactly these fields:

```json
{
  "alg": "Ed25519",
  "kid": "pl-key-EXAMPLE_THUMBPRINT",
  "typ": "prooflink-record+jws"
}
```

`typ` is a private application type label, not a registered media-type claim.
The body `kind` selects a further disjoint record validator; statements cannot
be consumed as grants. `kid` only selects a key already established by accepted
authority; it is not an instruction to resolve a URL.

Wire shape, with explanatory placeholder strings:

```json
{
  "payload": "BASE64URL_OF_EXACT_UTF8_PAYLOAD",
  "signatures": [
    {
      "protected": "BASE64URL_OF_PROTECTED_HEADER",
      "signature": "BASE64URL_OF_ED25519_SIGNATURE"
    }
  ]
}
```

All signatures cover the same payload. Count distinct authorized keys, never
signature count alone. The required signers depend on record kind and prior
state. Extra signatures do not turn staff workflow approval into personal
approval. A threshold-complete envelope is logged as one immutable byte string.
Additional envelopes over the same payload have distinct envelope IDs and must
be evaluated separately. Do not merge signature sets from unlogged envelopes
and pretend the combined envelope existed at an earlier checkpoint.

### 2.3 Limits

| Resource | Pilot limit |
|---|---|
| Decoded payload | 32 KiB |
| Exact envelope/log entry | 60,000 bytes, below tiled-entry uint16 limit |
| Text content | 16 KiB UTF-8 |
| JSON nesting | 16 |
| Signatures per envelope | 8 |
| Attachments | 16, by digest/size/type; do not fetch automatically |
| Normal grant depth | 1; no staff subdelegation |
| Entries per issuer pilot log | 512 |
| Complete log envelope data | 8 MiB |
| Downloaded evidence bundle | 16 MiB uncompressed, including metadata |
| Mirror hints | 8 |
| Allowed clock skew | 60 seconds in pilot trust policy |
| Fresh checkpoint observation | At most 5 minutes old in pilot trust policy |

Counts and sequences are nonnegative safe integers at most `2^53-1`. Every
signature, nested object, fetch, decompression, and chain traversal has a bound.
Reject malformed UTF-8, unpaired surrogates, NaN-like non-JSON values, and unsafe
object-property handling. A limit failure yields a specific Unverified resource
reason without claiming fraud. The pilot MUST stop growing before its history
exceeds these bounds; a new scaling/transition profile requires review.

## 3. Issuers and trust policy

The issuer ID anchors to a genesis identity key. It does not encode a human name,
domain, country, or office. Pin the genesis record hash alongside the ID: a key
thumbprint alone does not fix which genesis governance/recovery policy was
accepted. Changing display names or hosting domains never changes the identity
binding automatically. Replacing the original identity after unrecoverable loss
creates a new issuer ID and requires new institutional enrollment.

A verifier policy contains:

- Its own identifier, version, and authenticated content digest.
- Accepted issuer ID, exact genesis record ID and envelope ID, recognized
  institutional name/jurisdiction and binding evidence references.
- Accepted log origin, public verification key and pinned C2SP format versions.
- Accepted independent witness keys, required quorum, and membership epoch.
- Supported record and approval classes, scope restrictions and safety limits.
- Freshness/skew limits, evaluation clock requirements, checkpoint high-water
  marks if available, and incident/dispute suspensions.

A downloaded issuer list cannot nominate itself as trusted. Domain discovery is
a locator. Trust enrollment is an explicit local action or a choice of an
authenticated third-party policy. A signed binding attestation from another
institution is accepted only when the verifier policy trusts that attester for
that binding scope. There is no mandatory central registry.

## 4. Record types

All normal payloads contain `profile`, `kind`, `issuer`, `authority_epoch`, and
`claimed_at`. Dates use RFC 3339 UTC `YYYY-MM-DDTHH:mm:ssZ`, but `claimed_at` is
the author's claim, never trustworthy ordering evidence. Each kind has a closed
schema except explicitly noncritical `extensions`; signature validity does not
override a schema or authority failure.

### 4.1 Genesis

`kind: "genesis"` contains the identity JWK, issuer ID, governance and recovery
public key sets and threshold rules, initial log identity/profile, and a public
institutional description. It starts authority epoch 0 and normal sequence 0.
Enrollment pins the whole genesis record, including disjoint identity, governance
and recovery key sets. The genesis envelope requires identity-key, governance-quorum,
and recovery-quorum possession signatures. This establishes internal possession,
not real-world institutional identity. External enrollment provides that binding.

Illustrative payload fragment; all placeholder key strings must be replaced:

```json
{
  "profile": "prooflink/0.1-draft",
  "kind": "genesis",
  "issuer": "pl-issuer-EXAMPLE_IDENTITY_THUMBPRINT",
  "authority_epoch": 0,
  "claimed_at": "2026-10-16T18:00:00Z",
  "identity_key": {"kty": "OKP", "crv": "Ed25519", "x": "EXAMPLE_PUBLIC_KEY"},
  "governance": {"threshold": 2, "keys": ["PUBLIC_JWK_A", "PUBLIC_JWK_B", "PUBLIC_JWK_C"]},
  "recovery": {"threshold": 2, "keys": ["PUBLIC_JWK_D", "PUBLIC_JWK_E", "PUBLIC_JWK_F"]},
  "log": {"origin": "log.example.org/pilot", "public_key": "PINNED_NOTE_KEY"},
  "institution": {"name": "Example public office", "jurisdiction": "Example jurisdiction"}
}
```

This fragment uses strings in place of full public JWK objects for readability.
It is not a schema-valid conformance fixture. The declared key sets must contain
full public JWKs with distinct thumbprints and no private fields in actual records.

### 4.2 Governance, grants and normal control chain

Normal controls contain `control_seq` and `previous_control` in addition to the
common fields. Sequence 1 extends genesis in epoch 0; later controls increment
by one and reference the exact preceding accepted control payload ID. Statements
do not increment this counter. The selected log orders all records.

| Kind | Required authority | Effect |
|---|---|---|
| `authority-update` | Current governance quorum AND new governance quorum | Rotate governance keys and update permitted scopes/policies within epoch |
| `grant` | Current governance quorum | Authorize a key for specific record kinds, role, channels and approval class |
| `retire-grant` | Current governance quorum | End future grant use, preserving earlier eligible statements |
| `withdraw` | Governance quorum or explicitly scoped withdrawal grant | Terminally withdraw a statement; cannot erase it |
| `supersede` | Governance quorum or explicitly scoped supersession grant | Terminally link an old statement to an already eligible replacement |
| `locator-update` | Governance quorum | Add hosting/mirror hints without changing identity or log identity |

The pilot log identity, witness membership and recovery policy cannot be changed
by an ordinary authority update. Those require a reviewed transition profile;
changing a URL hint does not transfer authority to a new log key.

A grant includes its subject public JWK and derived key ID, role ID, list of
allowed kinds, `channels`, `approval_classes`, and `allow_subdelegation: false`.
All scopes must be subsets of the active governance policy. Root policy may
restrict high-impact channels to a stronger approval procedure. A service cannot
select a weaker policy merely by labeling an emergency statement "routine";
organizational process and independent review still enforce content classification.

Illustrative grant payload:

```json
{
  "profile": "prooflink/0.1-draft",
  "kind": "grant",
  "issuer": "pl-issuer-EXAMPLE_IDENTITY_THUMBPRINT",
  "authority_epoch": 0,
  "control_seq": 1,
  "previous_control": "sha256:0000000000000000000000000000000000000000000000000000000000000000",
  "claimed_at": "2026-10-16T18:05:00Z",
  "subject": {"kty": "OKP", "crv": "Ed25519", "x": "EXAMPLE_SERVICE_PUBLIC_KEY"},
  "role": "communications-staff",
  "allowed_kinds": ["statement"],
  "channels": ["public-notices"],
  "approval_classes": ["organization-workflow"],
  "allow_subdelegation": false
}
```

Grants become eligible for subsequent log entries when admitted and validated;
retirement ends their use at its admitted index. The draft uses log position for
authority intervals, not publisher-supplied wall-clock dates. The institution
must issue retirement controls for staff departure or end of term. Informational
term dates do not enforce themselves. A later expiry profile must define trusted
time bounds and reject ambiguous boundary cases rather than trusting `claimed_at`.

### 4.3 Statement

```json
{
  "profile": "prooflink/0.1-draft",
  "kind": "statement",
  "issuer": "pl-issuer-EXAMPLE_IDENTITY_THUMBPRINT",
  "authority_epoch": 0,
  "claimed_at": "2026-10-16T18:10:00Z",
  "nonce": "EXAMPLE_128_BIT_RANDOM_BASE64URL",
  "authority_head": "sha256:1111111111111111111111111111111111111111111111111111111111111111",
  "grant": "sha256:1111111111111111111111111111111111111111111111111111111111111111",
  "channel": "public-notices",
  "authorization": {
    "class": "organization-workflow",
    "role": "communications-staff",
    "approval_policy": "routine-one-approver",
    "approval_receipt_digest": "sha256:2222222222222222222222222222222222222222222222222222222222222222"
  },
  "content": {
    "media_type": "text/plain; charset=utf-8",
    "language": "en",
    "text": "The public meeting starts at 18:00 on 20 October 2026."
  },
  "attachments": [],
  "extensions": {}
}
```

The statement requires an allowed current statement-signing key and exactly the
current authority head immediately before its first eligible log occurrence.
If another control intervenes, re-evaluate and obtain approval for a new frozen
payload; do not alter signed fields after approval. The `grant` must be active,
same issuer/epoch, and cover the role, channel, kind, and approval class. A random
128-bit nonce distinguishes separately issued statements with identical content;
republication of an identical record is idempotent, not a new communication.

An attachment descriptor has `digest`, byte `size`, `media_type` and an optional
locator. Its exact bytes can be checked independently. A digest alone does not
prove that a transcoded video, photographed page, or screenshot is the original.
No HTML, JavaScript, remote embedded content, or unbounded data URLs are permitted
in the pilot content type. Language and dates are metadata claims, not external
facts verified by the protocol.

### 4.4 Approval evidence

For `organization-workflow`, the public signature means that the organization
attests its workflow accepted the required approvals. The private receipt binds
the frozen digest, issuer, authority head, approval policy, approver pseudonymous
IDs, ceremony nonces, issue/expiry times, and recorded results. Keep staff
identifiers and raw authentication data private. The public receipt digest may
support an authorized audit, but readers cannot independently prove the receipt's
contents or human approval from that digest.

The approval challenge binds a fresh 32-byte random nonce, the exact candidate
payload digest, issuer, authority head, RP ID and policy using an unambiguous
versioned application structure. The approval service stores the complete
challenge-to-digest association and validates origin, RP ID hash, challenge,
UP/UV flags, signature, credential enrollment, expiry and single-use state.
This binding MUST be specified and reviewed with vectors before implementation.
The signer receives and independently verifies this association; a bare
`approved: true` boolean is insufficient.

There is a potential digest cycle: the final statement includes a receipt digest,
while approval must bind the statement. Avoid it by defining the candidate payload
as the final statement with `approval_receipt_digest` omitted. Approval binds
those exact candidate bytes. The receipt includes that digest. The isolated
signer constructs the final payload from the stored candidate plus the receipt
digest, verifies that this is the only added field, and signs it. Both candidate
and final bytes are retained privately. The preview displays every substantive
signed field. This transform needs conformance vectors; it is not arbitrary JSON
reserialization by verifiers, which check final bytes unchanged.

For a future public `credential-evidence` profile, publish sufficient enrolled
credential and assertion evidence to verify that binding without exposing unrelated
personal data. WebAuthn may use COSE credential keys and ES256 assertions even
though the institution's JWS key is Ed25519; they are different layers. Require
an exact binding profile, privacy review and supported RP/origin policy before
enabling this class. UV or hardware presence does not prove an identified person
read or intended the content. See [WebAuthn](https://www.w3.org/TR/2026/REC-webauthn-3-20260825/).

### 4.5 Withdrawal and supersession

```json
{
  "profile": "prooflink/0.1-draft",
  "kind": "supersede",
  "issuer": "pl-issuer-EXAMPLE_IDENTITY_THUMBPRINT",
  "authority_epoch": 0,
  "control_seq": 2,
  "previous_control": "sha256:1111111111111111111111111111111111111111111111111111111111111111",
  "claimed_at": "2026-10-16T19:00:00Z",
  "target": "sha256:3333333333333333333333333333333333333333333333333333333333333333",
  "replacement": "sha256:4444444444444444444444444444444444444444444444444444444444444444",
  "reason": "Meeting time corrected."
}
```

The target must be an eligible statement by the same issuer. A replacement must
already be eligible, use the same issuer, and not introduce a cycle. The first
valid terminal withdrawal/supersession action wins; subsequent corrections extend
the replacement record's history. There is no unwithdraw or mutation operation.
All original bytes remain available. An untrusted service's 404 is not a signed
withdrawal. If replacement evidence is unavailable, show the authenticated
withdrawal/supersession fact and clearly mark the replacement as unavailable.

### 4.6 Emergency recovery

`kind: "recovery"` is signed by the precommitted current recovery quorum. It
contains `recovery_seq`, `previous_recovery` (null for first recovery),
`new_authority_epoch` (exactly current epoch + 1), replacement governance policy,
`freeze_epoch`, and a conservative `last_safe_checkpoint` reference (or null).
It is admitted without requiring an unbroken normal control chain. It freezes
the old epoch and starts the new normal chain with sequence 0 at this recovery
record. All normal signing grants must be reissued in the new epoch.

`last_safe_checkpoint` contains an accepted log size/root and its witness
evidence; it does not name a publisher-controlled date. Statements in the frozen
epoch after that boundary become Unverified due to compromise uncertainty,
including any that were previously displayed as Verified. If no safe boundary
can be established, do not assert historical authorization for that epoch.
A signature remains mathematically checkable; the authorization claim changes.

Recovery key replacement is a distinct `recovery-update` control requiring both
old and new recovery quorums, sequenced in the recovery chain. Normal governance
keys cannot delete or weaken recovery authority. Without an accepted recovery
quorum, freeze the issuer in local trust policy and re-enroll a new issuer;
network support staff cannot restore continuity through an email password reset.
The detailed transition schema and vector coverage are a Phase 0 requirement,
not permission to improvise recovery behavior in a production service.

## 5. Log and proof format

### 5.1 Selected evidence log

The pilot uses one dedicated log per issuer with a pinned origin, key, and
profile. The log contains full exact JWS envelope bytes as entries, including
genesis, controls and statements. Do not log only a digest or an unsigned type
label and then infer control-state completeness by filtering those labels.
No pruning is permitted for the pilot. Log clients use the pinned
[C2SP tiled profile](https://c2sp.org/tlog-tiles@v1.0.0) and its standard tree and
entry representation. Proof algorithms come from maintained implementations of
that profile. Do not mix RFC 9162 certificate-leaf encodings with generic entries.

The log operator need not endorse an issuer or approve semantics. Verifiers
validate signatures and apply controls in increasing log index. Bad entries do
not gain authority because they were logged. Bound admission to authenticated
publisher submissions for abuse control while allowing independently submitted
threshold-signed recovery controls through an emergency admission procedure.
Monitor signed admission receipts and agreed deadlines; the write adapter must
be pinned in the compatibility spike because C2SP tiled reads do not define it.

### 5.2 Complete-prefix evidence

A current result requires the complete log prefix through the accepted
checkpoint, or a locally cached prefix already verified against a previous
accepted checkpoint plus a consistency-verified complete suffix. Check all
entry bytes and reconstruct/check the tree root. Every referenced key and
authority record must be available. This deliberately trades scale for a simple
completeness argument in a small pilot.

Inclusion of one statement proves neither absence of a withdrawal nor the latest
root state. A provider's signed latest-head assertion is not an independently
proven complete history. Phase 2 can investigate authenticated maps or reviewed
monitor snapshots, but any additional trusted monitor must be explicit. Never
claim generic Merkle inclusion proves non-revocation.

### 5.3 Bundle shape

The following is a logical shape with placeholders; base64 strings, checksums
and signatures are not valid test vectors:

```json
{
  "profile": "prooflink/0.1-draft",
  "record_id": "sha256:3333333333333333333333333333333333333333333333333333333333333333",
  "envelope_id": "sha256:5555555555555555555555555555555555555555555555555555555555555555",
  "envelope_base64": "BASE64_OF_EXACT_ENVELOPE_BYTES",
  "trust_policy_digest": "sha256:6666666666666666666666666666666666666666666666666666666666666666",
  "log": {
    "origin": "log.example.org/pilot",
    "entry_index": 12,
    "tree_size": 15,
    "checkpoint_note_base64": "BASE64_OF_C2SP_SIGNED_NOTE",
    "inclusion_path": ["BASE64_OF_32_BYTE_NODE"],
    "consistency_from_cached": null,
    "entries_base64": ["BASE64_OF_EACH_EXACT_LOG_ENTRY_IN_ORDER"]
  },
  "mirrors": ["https://mirror.example.org/prooflink/"]
}
```

Bundle binary fields named `*_base64` use canonical padded RFC 4648 standard
base64, independent of JWS base64url. Hash path nodes are standard padded base64
of 32-byte hashes. Checkpoint/note bytes and witness cosignatures retain their
native pinned C2SP encodings; never convert them into invented JWS timestamps.
Use [checkpoint](https://c2sp.org/tlog-checkpoint@v1.1.0) and
[cosignature](https://c2sp.org/tlog-cosignature@v1.1.0) specifications.

All prefix entries must be included in increasing order unless an authenticated
local prefix cache is explicitly supplied to the verifier. The illustrative
array above abbreviates them. A standalone offline bundle cannot depend on an
unknown cache. `trust_policy_digest` selects an independently obtained policy;
the bundle cannot supply its own authority by naming a digest.

An inclusion proof is useful for compact archival checks and cross-checking the
target entry. Complete replay can recompute it without that field. Neither
removes the requirement for current-state evidence when the UI claims current
Verified status.

## 6. Ordered authorization evaluation

Start with the exact enrolled genesis and selected log/witness identities. Confirm
that log entry 0 contains the accepted threshold-complete genesis envelope.
Process entries in increasing index. For each recognized record:

1. Strictly parse and digest the exact bytes. Validate the envelope under the
   keys authorized for that kind by the state immediately before that entry.
2. Apply normal controls only when issuer/epoch, sequence and previous-control
   reference match the current chain. Check scope and all required signature
   quorums. Repeated identical records are idempotent.
3. A statement becomes eligible only under its exact current authority head and
   active same-epoch grant. Record its first eligible occurrence. Replaying it
   after retirement does not create a new eligible publication.
4. Apply terminal content actions only under their allowed scope and chain.
   A valid old signature cannot authorize a new control after its grant retired.
5. Recovery controls use the separate precommitted recovery chain, have priority
   over the normal chain, and cannot be blocked by a normal-head mismatch.
6. A control signed by a currently active required quorum that intentionally
   branches from an earlier head instead of extending the current head creates
   `authority_conflict`; suspend current authorization for that epoch until a
   valid recovery resolution. Random unsigned junk cannot force this condition.
7. Apply accepted incident safe boundaries to historical eligibility; keep the
   mathematical signature result separate from authorization confidence.

The log order supplies a total order **within this issuer's chosen log**. It
does not supply a global wall clock. Identity/legal-role disputes, private
unreported compromise, unsubmitted revocations, and censorship remain outside
the complete-prefix claim. Root/key rotation preserves history; it does not
make a historical key trustworthy forever after credible compromise evidence.

## 7. Verification results

Return a structured result with `status`, `reason_codes`, `record_id`, `issuer`,
`signature`, `authorization`, `content_state`, `identity_binding`, `log_snapshot`,
`observed_by`, `evaluated_at`, `freshness`, and `policy_digest`.

| Status | Required semantics |
|---|---|
| `verified` | Exact bytes/signature valid; accepted institutional binding and allowed authority/class; eligible ordered publication; complete accepted fresh history; no applicable terminal action or unresolved compromise/conflict |
| `unverified` | Required evidence, trust, supported semantics, current state, or authorization cannot be established; does not mean fraudulent |
| `invalid_or_altered` | A specific supplied artifact fails strict encoding/digest/signature or an exact claimed text comparison; evidence failure is not proof of motive |
| `revoked_or_superseded` | Previously eligible statement has an authenticated terminal withdrawal/supersession under accepted authority; original signature result remains separate |

Credential compromise alone does not mean the issuer withdrew every statement;
use Unverified for uncertain authorization. An unchanged signature can coexist
with a terminal content status. A current statement key need not still be active
for a historically eligible statement to remain valid after routine retirement.

Recommended reason codes include `no_record`, `unknown_issuer`,
`binding_disputed`, `unsupported_profile`, `unsupported_approval_class`,
`unsupported_algorithm`, `malformed_encoding`, `digest_mismatch`,
`signature_mismatch`, `text_mismatch`, `grant_inactive`, `scope_denied`,
`authority_stale`, `authority_conflict`, `compromise_interval`, `missing_entry`,
`inclusion_failed`, `consistency_failed`, `witness_quorum_missing`,
`status_stale`, `clock_untrusted`, `resource_limit`, `withdrawn`, and `superseded`.

Decision precedence:

- No record: Unverified. A missing URL or unsigned post is not Invalid.
- Unknown profile/algorithm/class: Unverified unsupported; never attempt a
  weaker fallback and display Verified.
- Supplied supported evidence fails an actual cryptographic/encoding check:
  Invalid or altered for that artifact, naming the failed check.
- Missing recognized binding or authority: Unverified, even for a valid signature.
- Credible unresolved compromise, fork or binding dispute: Unverified.
- Authenticated terminal action: Revoked or superseded; a previously established
  irreversible withdrawal can be shown even when current network access fails,
  with the snapshot date and current freshness limitation stated.
- Otherwise require full fresh policy-compliant evidence for Verified. An old
  valid signature without current history is Unverified with archival details.

Do not let a malformed untrusted extra attachment downgrade a separately checked
canonical statement silently. Report checks per artifact and make the scope of
the primary result visible. A text mismatch result concerns the supplied text,
not the signed canonical statement whose signature may be valid.

## 8. Time, freshness and partitions

The verifier evaluates freshness using its own credible evaluation clock, not
an attacker-supplied `now`. A missing/untrusted clock yields archival verification
details and `clock_untrusted` for a current result. Check witness observation
times within the policy's skew and max-age window; check all quorum assumptions.
Stored high-water marks prevent rollback below previously seen log size/root.
First-use clients still depend on fresh honest witness observation and policy
distribution. Witness signatures without trustworthy clocks establish continuity,
not fresh real-world time.

An entry included in an independently observed checkpoint existed by that
observation, assuming the observer's clock. A previously witnessed prefix that
does not contain it constrains when it was added, not when it was first drafted
or signed privately. Publisher dates cannot create trusted historical evidence.
Three colluding timestamp sources are not independent chronology.

During a partition, caches can show exact historical signatures and already
known terminal status. They MUST state the last evidence snapshot and cannot
assert fresh absence of withdrawals. Availability failures are not signature
failures. Once a fresh complete suffix is available, replay and update results.
Never rewrite the original record to conceal a previous failure or withdrawal.

## 9. Signing and verification pseudocode

These are orchestration algorithms, not implementations of cryptographic
primitives. All crypto/log operations delegate to maintained profile libraries.

```text
publish(candidateBytes, staffSession, localPolicy):
    candidate = strictParseAndValidateCandidate(candidateBytes)
    assert sessionMayPropose(staffSession, candidate)
    assert candidate.authority_head == currentAcceptedAuthorityHead()
    candidateDigest = standardSHA256(candidateBytes)
    approvals = approvalService.obtainFreshApprovals(candidateDigest, localPolicy)
    receipt = independentlyValidateApprovalBinding(approvals, candidateBytes)
    finalBytes = auditedAddReceiptDigestOnly(candidateBytes, digest(receipt))
    signer.recheckCurrentGrantsAndPolicy(candidate, receipt)
    envelopeBytes = standardJWS.signGeneral(finalBytes, allowedSigningKey)
    persistDurableOutbox(finalBytes, envelopeBytes, receipt)
    receiptFromLog = selectedLogAdapter.submit(envelopeBytes)
    proof = waitForActualInclusionAndRequiredWitnesses(receiptFromLog)
    replicateAndReadBack(envelopeBytes, proof)
    return immutableVerificationLink(digest(finalBytes))

verify(bundle, independentlySelectedPolicy, evaluationTime, optionalPrefixCache):
    enforceSizeAndFetchBudgets(bundle)
    envelope, payloadBytes = strictDecodeProfileJWS(bundle)
    requireExpectedDigests(bundle, envelope, payloadBytes)
    record = strictParseAndValidatePayload(payloadBytes)
    policy = selectAlreadyTrustedPolicy(independentlySelectedPolicy, record.issuer)
    if policy is absent: return unverified(unknown_issuer)
    checkpoint = standardCheckpointLibrary.verify(bundle.log, policy.logKeys)
    standardWitnessLibrary.verify(checkpoint, policy.witnessQuorum)
    completePrefix = standardTiledLog.verifyAllEntriesAndConsistency(
        bundle, checkpoint, optionalPrefixCache)
    state = replayAuthorizedRecords(completePrefix, policy.pinnedGenesis)
    signatureResult = standardJWS.verify(envelope, state.allowedHistoricalKeys)
    authResult = evaluateTargetFirstEligibleOccurrence(record, state, policy)
    terminalResult = evaluateAuthenticatedContentActions(record, state)
    freshness = evaluateObservationTimes(checkpoint, policy, evaluationTime)
    return applyStatusPrecedence(signatureResult, authResult, terminalResult,
                                 freshness, policy.digest, checkpoint)
```

All failures map to explicit reason codes; exceptions do not become a green
default result. The real implementation must separate parsing from signature
checks and delay consuming untrusted claims until checks complete. Replay verifies
each entry's signatures before applying it. The target signature result is
retained independently so a malformed bundle can be diagnosed precisely.

## 10. Versioning and implementation gaps

The exact profile string is mandatory. No negotiation, network-fetched schema,
or dynamic algorithm choice occurs during verification. Unknown fields outside
`extensions` fail schema validation. Unknown optional extension data is ignored
for security decisions. A future profile can define critical extensions, but
this draft has none; any record claiming unsupported critical semantics is
Unverified. New authority classes, media types or crypto algorithms require
an explicit reviewed profile/version and conformance vectors.

Before calling this interoperable, finish strict machine-readable schemas,
signed known-answer vectors, approval transform/challenge encoding, recovery
transition vectors, selected log submission/receipt adapter, exact C2SP package
version pins, and independent implementation comparison. No sample in this
document contains a real signature. The examples must not be used as production
fixtures. Public protocol publication also requires the owner's licensing decision.
