# Architect an Open, Decentralized Protocol for Verifying Public Communications

## Your role

Act as a principal software architect, security researcher, cryptography engineer, distributed-systems engineer, and open-source protocol designer.

Your assignment is to research, design, and architect a production-grade, platform-independent system that enables anyone to verify the authenticity and authorization of public communications.

Approach this as a real engineering project intended for implementation and public adoption, not a theoretical exercise or startup pitch.

Challenge assumptions, identify unsolved problems, compare existing technologies, and recommend the simplest technically sound architecture.

## 1. Problem statement

Society increasingly treats possession of a social media account as proof of identity and authority.

This is a dangerous assumption.

Government officials, institutions, journalists, scientists, businesses, and public figures communicate through privately controlled social media platforms.

An adversary who compromises an account could impersonate its owner without the public recognizing the compromise.

Generative AI amplifies this vulnerability by allowing adversaries to imitate a person's writing style, vocabulary, behavior, images, audio, and video with increasing fidelity.

A compromised account might continue producing entirely believable communications for an extended period.

We need a system that separates:

1. **Identity:** Who does a communication claim to represent?
2. **Control:** Who controls the account or publishing mechanism?
3. **Authorization:** Who actually approved the specific communication?
4. **Authenticity and integrity:** Can we independently establish that the communication came from an authorized source and hasn't been altered?
5. **Truth:** Are the claims factually correct? This is a separate problem that cryptographic authentication alone cannot solve.

The objective is to make unauthorized impersonation easier to identify, without requiring ordinary people to understand cryptography or cybersecurity.

## 2. Product vision

Working project name: **ProofLink** (temporary; do not assume this name is final).

Core principle:

**Publish once. Verify anywhere.**

A person or organization should be able to publish an authenticated statement once and distribute it across any medium:

- X, Facebook, Instagram, Bluesky, Mastodon, and other social networks
- Government and institutional websites
- Blogs, news publications, and content management systems
- Email and messaging applications
- Documents, PDFs, and press releases
- Images, audio, and video where technically feasible
- Physical documents through QR codes or equivalent mechanisms

Anyone encountering the communication should be able to establish its verification status with minimal effort.

### Nonnegotiable design principles

1. **Platform independence.** The protocol must not require cooperation from any social media company.
2. **Decentralization.** No single company, government, blockchain operator, or organization should control the verification infrastructure.
3. **Open source.** The protocol, reference implementation, and verification tools should be publicly inspectable.
4. **Zero friction for readers.** No account, application installation, wallet, or technical knowledge required for basic verification.
5. **Minimal friction for publishers.** Publishing should resemble an ordinary content management workflow, with secure approval integrated naturally.
6. **Cryptographic verifiability.** Statements must be verifiable independently of the organization hosting the verification website.
7. **Accessibility.** The interface must work for nontechnical users, people with disabilities, and users on inexpensive devices.
8. **Privacy.** Reading or verifying public statements must not require identifying or tracking readers.
9. **Resilience.** Verification should survive social media outages, publisher outages, compromised accounts, and the disappearance of individual service providers where feasible.
10. **Minimal complexity.** Prefer mature standards and simple protocols over custom cryptography or unnecessary infrastructure.

Do not introduce blockchain, cryptocurrency, NFTs, tokens, or decentralized identifiers simply because the system is described as decentralized. Use those technologies only if a rigorous analysis demonstrates a concrete necessity and advantage.

## 3. Primary user experiences

Design the system around three experiences.

### A. Publishing

An authorized official writes a statement, approves it using a secure authentication mechanism, and clicks Publish.

The system automatically:

- Creates a canonical representation of the statement.
- Establishes which individual or organizational role authorized it.
- Cryptographically signs the content.
- Records relevant metadata and publication time.
- Publishes an independently verifiable record.
- Provides a permanent shareable verification URL.
- Allows distribution to existing social media accounts.

Sensitive announcements may require multiple independent approvals.

Distinguish personal authorization from delegated organizational authorization.

### B. Verification

A citizen sees a controversial statement attributed to a government official.

They open its verification link and receive a clear result:

- **Verified:** The statement matches a signed record issued under recognized authorization.
- **Unverified:** The system cannot establish its authorized origin.
- **Invalid or altered:** Available evidence demonstrates a signature mismatch, alteration, or other specific failure.
- **Revoked or superseded:** The issuer has formally withdrawn or replaced the statement.

These statuses must have rigorously defined semantics. In particular, an unsigned statement must not automatically be labeled fraudulent.

The user should also see the canonical statement, its issuer, the type of authorization established, and a link to independent supporting evidence.

### C. Independent verification

Advanced users, journalists, third-party websites, and automated systems must be able to verify statements without trusting the original platform or any single ProofLink server.

Provide a machine-readable, documented verification interface and support independent implementations.

## 4. Required architectural research

Investigate relevant existing technologies and standards, including:

- Public-key cryptography and digital signatures
- Ed25519, WebAuthn, passkeys, and hardware-backed keys
- JSON Web Signatures, COSE, and other appropriate signed-message formats
- W3C Verifiable Credentials and decentralized identity standards
- Sigstore, Rekor, and transparency logs
- Merkle trees, append-only logs, and independent witnesses
- Certificate authorities, Web PKI, DNS, and DNSSEC
- C2PA Content Credentials for media provenance
- Key rotation, credential revocation, and delegation
- Content-addressed storage and distributed replication
- Existing official government identity verification mechanisms
- Comparable protocols for secure publishing and supply-chain provenance

Use authoritative, current technical documentation where available. Clearly distinguish established standards from experimental proposals.

Determine which technologies can be combined into the smallest viable implementation.

Do not reinvent an existing standard without a strong justification.

## 5. Essential architecture questions

Provide detailed answers to the following.

**Identity and trust**
- How do we establish that a cryptographic key actually belongs to a government office, institution, or public figure?
- Who verifies that binding initially?
- How do we avoid creating a centralized authority that controls public identity?
- How are publisher roles delegated and revoked?
- How do we distinguish a statement personally approved by an elected official from one approved by authorized staff?
- What happens when an official leaves office, an institution changes control, or a government domain is compromised?

**Cryptographic security**
- What exactly is signed?
- How is canonicalization handled?
- How are keys created, stored, rotated, recovered, and revoked?
- How do we limit the damage from compromised keys or signing infrastructure?
- How do independent witnesses prevent a publisher or log operator from silently rewriting publication history?
- How do we establish a trustworthy timeline without assuming a timestamp alone proves when an event occurred?

**Platform independence**
- How can users verify a post on X or Facebook if those platforms refuse to integrate the protocol?
- How do we deal with copy-pasted text, screenshots, modified quotations, reposts, and missing verification links?
- Can verification work from a normal browser without an extension?
- What becomes possible with optional browser extensions or native platform integrations?
- What technical limitations cannot be overcome without platform cooperation?

**Decentralization and resilience**
- Where do authoritative statements live?
- What happens if the publisher's website goes offline?
- Can multiple independent verifiers produce the same result?
- How do we avoid a single central registry or verification service?
- How are historical statements archived and retrieved?
- What happens during network partitions, infrastructure failures, and institutional compromise?

**Usability**
- Can publishing require no more than one additional approval step for routine authorized statements?
- Can basic verification require only one tap?
- How do we prevent phishing through fake verification websites and misleading lookalike badges?
- How do we communicate uncertainty honestly without confusing people?
- How do we ensure usability for people who know nothing about digital signatures?

## 6. Formal threat model

Develop a rigorous threat model covering:

- Social media account takeover
- SIM swapping and phishing
- Stolen credentials and compromised staff accounts
- Compromised signing keys
- Insider threats and unauthorized delegated publishing
- Fraudulent issuer registration
- Compromised official domains
- Compromised verification services
- Malicious transparency log operators
- AI-generated impersonation and deepfakes
- Forged screenshots and manipulated statements
- Replay attacks, equivocation, and backdated claims
- Suppression, selective publication, and deletion of records
- Denial-of-service attacks
- Coordinated misinformation using authentic but misleading statements

For each threat, document its impact, applicable defenses, residual risk, and whether detection is possible.

Explicitly identify threats that cannot be solved through cryptography alone.

## 7. Deliverables

Produce a comprehensive, implementation-oriented architecture document with the following sections.

### A. Executive architecture recommendation

Explain the recommended design in plain English, emphasizing the minimum infrastructure necessary.

### B. System architecture

Create diagrams showing:

- The publishing workflow
- Authorization and signing
- Identity and trust establishment
- Public record storage and replication
- Verification and independent auditing
- Key rotation and emergency revocation

Use Mermaid diagrams.

### C. Architecture decision records

For every major technical choice, document:

- Options considered
- Advantages and disadvantages
- Security and operational tradeoffs
- Recommended option
- Reason for the recommendation

### D. Data and protocol specification

Define an initial interoperable protocol, including:

- Signed statement format
- Issuer identifiers
- Authorization and delegation records
- Cryptographic metadata
- Verification proof format
- Publication and transparency-log records
- Revocation and supersession records
- Verification status definitions
- Protocol versioning and extensibility

Provide illustrative JSON payloads and signing/verification pseudocode.

Do not invent cryptographic primitives.

### E. API design

Specify minimal APIs for:

- Registering and validating issuers
- Publishing statements
- Retrieving statements
- Verifying signatures and authorization
- Querying logs
- Revoking credentials
- Rotating keys
- Discovering historical records

Determine which operations should be ordinary static resources and which actually require API services.

### F. User experience

Design extremely simple publishing and verification interfaces.

Include user journeys for:

- A government communications employee
- An elected official
- A journalist
- An ordinary citizen
- An independent verification service

Include accessibility considerations, failure states, and warnings that avoid overstating certainty.

### G. Open-source implementation architecture

Recommend:

- Programming languages and frameworks
- Repository and package structure
- Core libraries
- Storage architecture
- Signing infrastructure
- Hosting and deployment strategies
- Automated security testing
- Reproducible builds
- SDKs and integrations
- Licensing

Favor a small, maintainable codebase with minimal dependencies.

### H. MVP implementation roadmap

Break development into practical phases.

**Phase 0 — Proof of concept:** One publisher, signed statements, and independent verification.

**Phase 1 — Usable MVP:** Simple publishing UI, verification website, protected authentication, and reliable records.

**Phase 2 — Federated infrastructure:** Multiple publishers, independent verifiers, delegation, witnesses, and recovery mechanisms.

**Phase 3 — Distribution integrations:** Browser extensions, CMS plugins, APIs, media support, and publisher integrations.

**Phase 4 — Adoption:** Civic organizations, government offices, journalists, universities, and other institutions.

For every phase specify:

- Scope
- Dependencies
- Concrete implementation tasks
- Estimated engineering effort and operating costs
- Security requirements
- Acceptance criteria
- Explicitly deferred functionality

### I. Governance and sustainability

Propose a governance model that keeps the protocol open, prevents vendor capture, permits independent implementations, and supports long-term maintenance.

Evaluate sustainable funding options without introducing fees or business arrangements that undermine independent verification.

### J. Pilot deployment

Design a practical small-scale pilot with a willing local government office, civic organization, university, or public-interest institution.

The pilot must not require replacing any existing social media accounts or publishing systems.

Define measurable success criteria, including ease of use, independent interoperability, resistance to simulated account compromise, verification latency, and reliability.

## 8. Engineering constraints

Assume the initial implementation may be developed by one experienced software engineer using AI coding agents.

Design accordingly:

- Keep the first iteration realistic for a solo developer.
- Minimize infrastructure cost.
- Favor established open-source components.
- Avoid unnecessary distributed-system complexity.
- Separate protocol requirements from optional enhancements.
- Do not sacrifice core security properties for a quick demonstration.
- Identify components requiring independent security review before public deployment.
- Treat the system as potentially security-critical public infrastructure.

## 9. Critical design challenge

Before finalizing the architecture, aggressively test the proposal against this scenario:

**An adversary takes over the official X account of a prominent government representative and uses AI to maintain an entirely convincing public persona for six months.**

Assume the attacker controls the social media account and can publish arbitrary posts, respond to users, and remove verification links.

Explain precisely:

1. What the system can establish.
2. What it cannot establish.
3. How an ordinary citizen would discover the problem.
4. Which attacks would remain possible.
5. Whether the user experience is genuinely simpler than manually checking an official website.
6. What additional capabilities would require cooperation from browsers or social media platforms.

If the proposed architecture fails this scenario, revise it.

## 10. Final instruction

I do not want a superficial product concept or a list of technologies.

I want a technically defensible architecture from which an engineering team—or a coordinated set of AI coding agents—could begin implementation.

Prioritize:

**Security → Independent verifiability → Simplicity → Interoperability → Decentralization → Adoption.**

Identify conflicts between these priorities rather than pretending every objective can be perfectly satisfied.

Separate the minimal viable protocol from the full long-term vision.

Be skeptical of unnecessary blockchain technology, proprietary verification authorities, mandatory client installations, and complicated identity systems.

Most importantly, do not confuse verification of a cryptographic signature with proof that a particular human personally authorized a statement, or with proof that the statement is factually true.

Start by identifying the hardest architectural and trust-model problems, recommend how to resolve them, and then present the complete proposed architecture.

Conclude with the exact first ten engineering tasks needed to begin the project.
