# Git Workflow

## Overview

This document defines the Git workflow for the AI Agent Platform using a **trunk-based development** approach with short-lived feature branches.

---

## Branch Strategy

### Main Branches

| Branch | Purpose | Protection |
|--------|---------|------------|
| `main` | Production-ready code | Protected, requires PR |
| `staging` | Pre-production testing | Protected, auto-deploy |

### Feature Branches

```
feature/<ticket>-<short-description>
bugfix/<ticket>-<short-description>
hotfix/<ticket>-<short-description>
```

Examples:
- `feature/AP-123-add-linkedin-integration`
- `bugfix/AP-456-fix-token-refresh`
- `hotfix/AP-789-critical-auth-fix`

---

## Workflow Diagram

```
main ─────●─────●─────●─────●─────●─────●───> (production)
          │     ↑     │     ↑     │     ↑
          │     │     │     │     │     │
          └──●──┘     └──●──┘     └──●──┘
         feature/   feature/   bugfix/
         AP-123     AP-124     AP-125
```

---

## Development Flow

### 1. Start New Feature

```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/AP-123-add-linkedin-integration
```

### 2. Make Changes

```bash
# Make changes
git add .
git commit -m "feat(integrations): add linkedin oauth flow"

# Push to remote
git push -u origin feature/AP-123-add-linkedin-integration
```

### 3. Create Pull Request

```bash
# Using GitHub CLI
gh pr create --title "feat(integrations): Add LinkedIn integration" \
  --body "## Summary
- Adds LinkedIn OAuth flow
- Implements post creation API
- Adds LinkedIn connector

## Testing
- [ ] OAuth flow tested
- [ ] Post creation tested

Closes #123"
```

### 4. Code Review

- At least 1 approval required
- All CI checks must pass
- No unresolved comments

### 5. Merge

```bash
# Squash and merge (preferred)
gh pr merge --squash

# Or rebase (for clean history)
gh pr merge --rebase
```

### 6. Cleanup

```bash
# Delete local branch
git checkout main
git pull origin main
git branch -d feature/AP-123-add-linkedin-integration

# Delete remote branch (usually automatic)
git push origin --delete feature/AP-123-add-linkedin-integration
```

---

## Commit Message Format

### Structure

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(agents): add clone functionality` |
| `fix` | Bug fix | `fix(auth): resolve token expiry issue` |
| `docs` | Documentation | `docs(api): update endpoint documentation` |
| `style` | Formatting | `style: fix linting errors` |
| `refactor` | Code refactoring | `refactor(db): optimize query performance` |
| `perf` | Performance | `perf(api): add response caching` |
| `test` | Tests | `test(agents): add unit tests for executor` |
| `chore` | Maintenance | `chore(deps): update dependencies` |
| `ci` | CI/CD | `ci: add staging deployment workflow` |

### Scopes

```
agents, auth, marketplace, integrations, billing,
api, ui, db, infra, deps, docs
```

### Examples

```bash
# Feature
feat(agents): add agent versioning support

Allows users to create and manage multiple versions of agents.
- Add version field to agents table
- Implement version comparison logic
- Add UI for version management

Closes #123

# Bug fix
fix(auth): prevent race condition in token refresh

Multiple concurrent requests were causing duplicate refresh
token generation. Added mutex lock to prevent concurrent access.

Fixes #456

# Breaking change
feat(api)!: change agent config schema

BREAKING CHANGE: The agent config schema has been updated.
The `tools` field is now an array of objects instead of strings.

Migration guide: docs/migrations/agent-config-v2.md
```

---

## Branch Protection Rules

### main Branch

```yaml
# .github/settings.yml
branches:
  - name: main
    protection:
      required_pull_request_reviews:
        required_approving_review_count: 1
        dismiss_stale_reviews: true
        require_code_owner_reviews: true
      required_status_checks:
        strict: true
        contexts:
          - "ci/test"
          - "ci/lint"
          - "ci/build"
      enforce_admins: true
      required_linear_history: true
      allow_force_pushes: false
      allow_deletions: false
```

---

## Pull Request Template

```markdown
<!-- .github/PULL_REQUEST_TEMPLATE.md -->

## Summary
<!-- Brief description of changes -->

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues
<!-- Link to related issues: Closes #123, Fixes #456 -->

## Changes Made
<!-- List the specific changes made -->
-
-
-

## Testing
<!-- Describe how to test these changes -->
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] My code follows the project style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)
<!-- Add screenshots for UI changes -->
```

---

## Hotfix Process

For critical production issues:

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/AP-999-critical-security-fix

# 2. Make fix
git add .
git commit -m "fix(auth): patch critical security vulnerability"

# 3. Create PR with expedited review
gh pr create --title "HOTFIX: Critical security vulnerability" \
  --label "hotfix,urgent" \
  --reviewer "tech-lead,security-team"

# 4. After approval, merge immediately
gh pr merge --squash

# 5. Deploy to production
# (automated via CI/CD)
```

---

## Release Process

### Semantic Versioning

```
MAJOR.MINOR.PATCH
1.2.3

MAJOR: Breaking changes
MINOR: New features (backward compatible)
PATCH: Bug fixes (backward compatible)
```

### Creating a Release

```bash
# 1. Update version
# Update version in pyproject.toml, package.json, etc.

# 2. Create changelog
git log --oneline v1.2.0..HEAD > CHANGELOG_draft.md
# Edit CHANGELOG.md

# 3. Commit version bump
git add .
git commit -m "chore(release): bump version to 1.3.0"

# 4. Create tag
git tag -a v1.3.0 -m "Release v1.3.0"

# 5. Push
git push origin main --tags

# 6. Create GitHub release
gh release create v1.3.0 --title "v1.3.0" --notes-file CHANGELOG.md
```

---

## Git Hooks

### Pre-commit

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
        args: ['--maxkb=1000']
      - id: no-commit-to-branch
        args: ['--branch', 'main']

  - repo: local
    hooks:
      - id: lint
        name: lint
        entry: make lint
        language: system
        pass_filenames: false

      - id: test
        name: test
        entry: make test-quick
        language: system
        pass_filenames: false
```

### Commit-msg (Commitlint)

```bash
#!/bin/sh
# .husky/commit-msg
npx --no -- commitlint --edit $1
```

---

## Code Owners

```
# .github/CODEOWNERS

# Default owners
* @tech-lead

# Backend
/backend/ @backend-team
/backend/app/api/ @backend-team @api-reviewers

# Frontend
/frontend/ @frontend-team

# Infrastructure
/infrastructure/ @devops-team
/.github/ @devops-team

# Security-sensitive
/backend/app/core/security.py @security-team
/backend/app/api/v1/auth.py @security-team

# Documentation
/docs/ @tech-writers @tech-lead
```

---

## Common Git Commands

### Daily Operations

```bash
# Update local main
git checkout main && git pull

# Create feature branch
git checkout -b feature/AP-123-description

# Check status
git status

# Stage changes
git add .
git add -p  # Interactive staging

# Commit
git commit -m "feat(scope): description"

# Push
git push -u origin feature/AP-123-description

# Rebase on main (keep branch up to date)
git fetch origin
git rebase origin/main
```

### Fixing Mistakes

```bash
# Amend last commit
git commit --amend

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Revert a merged commit
git revert <commit-hash>

# Stash changes
git stash
git stash pop
```

### Branch Management

```bash
# List branches
git branch -a

# Delete local branch
git branch -d feature/old-branch

# Delete remote branch
git push origin --delete feature/old-branch

# Rename branch
git branch -m old-name new-name
```

---

## Best Practices

### DO

- Keep branches short-lived (< 1 week)
- Write descriptive commit messages
- Squash commits when merging
- Delete branches after merging
- Pull/rebase frequently
- Use meaningful branch names

### DON'T

- Commit directly to main
- Force push to shared branches
- Commit large binary files
- Leave branches open for weeks
- Commit secrets or credentials
- Use vague commit messages like "fix bug"
