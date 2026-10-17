# Public repository review

Date: 2026-10-16. Scope: the original bootstrap commit `b2ebd5d`, the repository's
complete initial Git history, and the corrections described below. This was an
agent review with automated checks; no independent human security audit occurred.

## Findings corrected

- The documentation checker counted headings inside fenced examples as real
  anchors and checked example links as live destinations. It now separates fenced
  code from prose and ignores inline-code link examples.
- Local-link checks used lexical paths alone. They now resolve symlinks and
  reject targets outside the repository before reading the target document.
- The six-diagram requirement applied to the whole repository, so an additional
  diagram in another document failed the check. It now applies to the architecture
  document specifically.
- The proposed bounded log had no emergency admission reserve. Routine publishing
  now stops at a projected total of 448 entries or 7 MiB, preserving capacity
  within the 512-entry/8-MiB bounds for validated governance/recovery controls.
  Retry deduplication and reserve exhaustion are explicit acceptance cases.
- Authority-conflict semantics depended on inferred intent. The draft now defines
  an objective conflicting-control tuple and requires otherwise active authority.
  Unsupported controls signed by applicable governance/recovery authority also
  prevent a current result, instead of being silently skipped.
- Repository-status wording still required private visibility. It now records the
  owner's subsequent authorization to make the repository public after review,
  while preserving the exact restrictive license and npm publication guard.

## Validation

- `npm run check`: documentation links/anchors, seven syntactic JSON examples,
  six architecture diagram blocks, required sections/tasks, package publication
  guard, and exact license/source-brief checks pass.
- `npm test`: ten documentation-checker regression tests pass, with zero skipped.
  Tests use temporary repository copies, including a contained outside-target
  symlink fixture; they do not mutate the working documents.
- `node --check` passes for both JavaScript files; `git diff --check` passes.
- Gitleaks 8.30.1 reports zero findings for Git history with `--log-opts=--all`
  and for the working directory. The downloaded scanner archive matched its
  official release checksum before execution. No baseline exclusions were used.
- GitHub inspection found no Actions workflows or self-hosted runners attached
  to this repository. No deployed application or GitHub Pages site exists.
- The original user brief and exact HQ Capsize LLC license remain unchanged.

## Limits and release scope

Only documentation tooling is implemented. The protocol changes above are design
corrections with future acceptance cases, not tested protocol behavior. No signing,
passkey, Merkle, interoperability, browser, deployment or production security tests
can be claimed. Mermaid block presence is checked; diagrams were not rendered.
The Markdown checker covers this repository's inline-link/fenced-code conventions;
it is not a complete CommonMark implementation. Secret scanning cannot guarantee
the absence of every sensitive value.

Public visibility is authorized for inspection under the existing Capsize LLC
restrictive license. It grants no open-source or independent reuse license, npm
release, production deployment approval, or claim of protocol security. The
[roadmap](ROADMAP.md) retains the implementation and independent-review gates.
