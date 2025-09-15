# Git Commit Conventions

## Overview
This document establishes consistent Git commit message conventions for the Socratic AI Chat Application, following the Conventional Commits specification with project-specific guidelines.

## Commit Message Format

### Basic Structure
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Example
```
feat(conversation): add message streaming functionality

Implement real-time message streaming for AI responses using Server-Sent Events.
Includes proper error handling and connection recovery.

Closes #123
```

## Commit Types

### Primary Types
- **`feat`**: A new feature for the user
- **`fix`**: A bug fix for the user
- **`docs`**: Documentation only changes
- **`style`**: Changes that do not affect the meaning of the code (white-space, formatting)
- **`refactor`**: A code change that neither fixes a bug nor adds a feature
- **`test`**: Adding missing tests or correcting existing tests
- **`chore`**: Changes to the build process or auxiliary tools

### Secondary Types
- **`perf`**: A code change that improves performance
- **`ci`**: Changes to CI configuration files and scripts
- **`build`**: Changes that affect the build system or external dependencies
- **`revert`**: Reverts a previous commit

## Scope Guidelines

### Component Scopes
- **`conversation`**: ConversationView and related message components
- **`ui`**: UI components and design system
- **`auth`**: Authentication and authorization
- **`api`**: API routes and external service integration
- **`db`**: Database schema and operations
- **`ai`**: AI service integration and model management

### Technical Scopes
- **`deps`**: Dependency updates
- **`config`**: Configuration file changes
- **`types`**: TypeScript type definitions
- **`testing`**: Test infrastructure and utilities

### Examples by Scope
```bash
feat(conversation): add message editing functionality
fix(ui): resolve button accessibility issues
docs(api): update endpoint documentation
test(conversation): add comprehensive message tests
chore(deps): update React to v19.1.0
```

## TDD-Specific Commit Patterns

### TDD Cycle Commits
```bash
# Red phase - write failing tests
test(conversation): add tests for message streaming

# Green phase - minimal implementation
feat(conversation): implement basic message streaming
# or
fix(conversation): make message streaming tests pass

# Refactor phase - improve code quality
refactor(conversation): optimize message streaming performance
```

### Complete Feature Commits
```bash
feat(conversation): implement message streaming with TDD approach

- Add comprehensive test suite for streaming functionality
- Implement Server-Sent Events for real-time updates
- Include error handling and connection recovery
- Follow established component patterns and accessibility guidelines

Tests: All streaming scenarios covered including error cases
Performance: Optimized for large conversation histories
Accessibility: Screen reader announcements for new messages
```

## Message Description Guidelines

### Description Rules
- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize the first letter
- No period at the end
- Limit to 50 characters
- Be specific and descriptive

### Good Examples
```bash
feat: add user authentication system
fix: resolve memory leak in message component
docs: update component usage examples
refactor: extract message validation logic
test: add edge cases for empty conversations
```

### Bad Examples
```bash
feat: Added some stuff                    # Too vague
fix: Fixed the bug.                       # Not imperative, has period
feat: Add User Authentication System      # Capitalized
refactor: refactored the code for better performance # Too long, not imperative
```

## Body Guidelines

### When to Include Body
- Explain the motivation for the change
- Contrast with previous behavior
- Include technical details if complex
- Reference issues or requirements

### Body Format
```bash
feat(conversation): add message reactions

Allow users to react to messages with emoji reactions.
This improves user engagement and provides quick feedback
without requiring a full response.

Technical implementation:
- Uses React state for immediate UI updates
- Persists reactions to database via API
- Includes optimistic updates with rollback on errors

Closes #145
Refs #123, #124
```

## Footer Guidelines

### Issue References
```bash
# Closes issues
Closes #123
Closes #123, #124, #125

# References issues
Refs #123
See also #124

# Breaking changes
BREAKING CHANGE: authentication now requires OAuth2
```

### Co-authorship
```bash
Co-authored-by: Claude <noreply@anthropic.com>
Co-authored-by: Developer Name <dev@example.com>
```

## Breaking Changes

### Format
```bash
feat(api)!: change message API response format

BREAKING CHANGE: Message API now returns ISO timestamps instead of Unix timestamps.

Migration guide:
- Update client code to parse ISO timestamps
- Use new `createdAt` field instead of `timestamp`
- See migration guide in docs/migration.md
```

### Indicators
- Add `!` after scope: `feat(api)!:`
- Include `BREAKING CHANGE:` in footer
- Explain migration path

## Specific Project Patterns

### Component Development
```bash
# Complete component with TDD
feat(ui): implement Button component following TDD

- Create comprehensive test suite covering all variants
- Implement accessible button with proper ARIA attributes
- Support size, variant, and disabled states
- Include keyboard navigation and focus management
- Follow shadcn/ui patterns and Tailwind styling

# Component updates
fix(conversation): improve message list performance
feat(conversation): add message search functionality
refactor(ui): extract common button styles
```

### Documentation Updates
```bash
docs: update README with new feature overview
docs(api): add endpoint usage examples
docs(tdd): create component development workflow guide
docs: fix typos in installation instructions
```

### Testing
```bash
test(conversation): add comprehensive message tests
test: increase coverage for utility functions
test(ui): add accessibility tests for all components
test: fix flaky integration tests
```

### Dependencies and Configuration
```bash
chore(deps): update testing libraries to latest versions
build: configure Jest for better TypeScript support
ci: add automated accessibility testing
config: update ESLint rules for new patterns
```

## Automation Integration

### Conventional Commits Benefits
- Automated changelog generation
- Semantic version bumping
- Release note generation
- Issue linking and closing

### Tools Integration
```bash
# Use commitizen for guided commits
npm install -g commitizen
git cz

# Lint commit messages
npm install -D @commitlint/cli @commitlint/config-conventional
```

## Examples from Project History

### Actual Project Commits
```bash
# Initial setup
docs: Update CLAUDE.md with comprehensive project context and TDD guidelines

# Feature implementation
feat: Set up Next.js app with comprehensive tooling and testing infrastructure

# Documentation
docs: create artifacts folder with session tracking
```

### Future Commit Examples
```bash
feat(conversation): implement real-time message streaming
fix(ui): resolve dark mode toggle accessibility issues
test(api): add comprehensive integration tests for chat endpoints
refactor(conversation): optimize message rendering performance
docs(deployment): add production deployment guide
chore(deps): update all dependencies to latest stable versions
```

## Commit Message Checklist

Before committing, verify:
- [ ] Type is appropriate and accurate
- [ ] Scope is relevant (if used)
- [ ] Description is imperative and under 50 characters
- [ ] Body explains "why" if needed
- [ ] Breaking changes are clearly marked
- [ ] Issues are properly referenced
- [ ] Co-authors are credited if applicable
- [ ] Message follows conventional commits format

Following these conventions ensures clear project history, enables automation, and improves collaboration across the development team.