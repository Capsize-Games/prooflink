# ProofLink

Architecture and draft protocol for verifying the origin and authorization of
public communications across publishing platforms. ProofLink is a working name.

This repository currently contains a design, the original brief, and documentation
checks. It has no signing service, verifier, website, or deployed infrastructure.
The protocol is a review draft, not a production security claim or a published
standard.

- [Architecture recommendation and system design](docs/ARCHITECTURE.md)
- [Draft protocol, data formats, and verification rules](docs/PROTOCOL.md)
- [Threat model](docs/THREAT_MODEL.md)
- [Architecture decisions](docs/DECISIONS.md)
- [Implementation roadmap and first ten tasks](docs/ROADMAP.md)
- [Technical sources and research status](docs/REFERENCES.md)
- [Original brief](docs/source/original-brief.md)
- [Security review requirements](SECURITY.md)

Run the repository checks with Node.js 22 or newer; no dependencies are needed:

```sh
npm run check
```

The checks validate documentation links, JSON examples, required deliverables,
and repository metadata. They do not test a protocol implementation.

## Ownership and release status

Copyright (c) 2026 Capsize LLC. Proprietary and confidential. All rights reserved.
See [LICENSE](LICENSE); metadata uses `LicenseRef-Capsize-Proprietary`.

The owner requested a private repository under `Capsize-Games` on 2026-10-16.
That instruction overrides the source brief's open-source licensing requirement.
The open protocol and public implementation described in the brief remain future
release objectives requiring an explicit owner licensing decision. This repository
grants no implementation, redistribution, or public specification license.
