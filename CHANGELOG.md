# Changelog

All notable changes to this repository are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). The entries below are taken from the
commit history; the project has no tagged releases yet.

## [Unreleased]

### Added

- README top block, contributing guide, issue forms and this changelog.
- `.env` files are git-ignored (`.env.example` stays trackable).
- MIT license (2026-07-11).
- Link to the hackathon presentation in the README (2025-12-04).

### Changed

- README restructured around verified features and the current tree state (2026-07-18); badges link to
  their targets (2026-07-22).
- The original Python files were replaced by the current TypeScript project (2025-11-10 to 2025-11-11).

### Removed

- `replit.md` (2026-11-07) and the earlier `.replit` files.

### Known issues

- The Express server entry point, routes, optimizer and chat endpoints are not in the current tree (they
  are preserved in the git history), so the app does not run from a fresh checkout. See the Repository
  status note in the README.
