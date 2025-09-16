# Artifacts Management Commands

## Quick Session Documentation Command

### Complete Session Artifact Creation
```bash
# Create a new session artifact (replace YYYY-MM-DD with actual date)
mkdir -p artifacts/sessions/$(date +%Y-%m-%d)-session-name
```

### Session Documentation Template Command
```bash
# Function to create a new session (add to ~/.bashrc or ~/.zshrc)
create_session_artifact() {
    local session_name="$1"
    local date=$(date +%Y-%m-%d)
    local session_dir="artifacts/sessions/${date}-${session_name}"

    # Create session directory
    mkdir -p "${session_dir}"

    # Create session summary from template
    cp artifacts/sessions/session-template.md "${session_dir}/session-summary.md"

    # Create other artifact files
    touch "${session_dir}/commits.md"
    touch "${session_dir}/decisions.md"
    touch "${session_dir}/files-created.md"

    echo "Created session artifact: ${session_dir}"
    echo "Files created:"
    echo "  - session-summary.md (from template)"
    echo "  - commits.md"
    echo "  - decisions.md"
    echo "  - files-created.md"

    # Open session summary for editing
    if command -v code &> /dev/null; then
        code "${session_dir}/session-summary.md"
    fi
}

# Usage:
# create_session_artifact "feature-implementation"
# create_session_artifact "bug-fixes"
# create_session_artifact "refactoring"
```

## Quick Add All Artifacts Command

### Add Artifacts to Git
```bash
# Add all artifacts and documentation
git add artifacts/ .claude/ CLAUDE.md README.md

# Or more specific
git add artifacts/sessions/$(date +%Y-%m-%d)*
git add .claude/
```

### Complete Session Commit
```bash
# Function for committing session artifacts
commit_session_artifacts() {
    local session_name="$1"
    local date=$(date +%Y-%m-%d)

    # Add all artifacts
    git add artifacts/ .claude/ CLAUDE.md README.md

    # Create commit message
    git commit -m "docs: add session artifacts for ${date} ${session_name}

- Document session work and decisions
- Update project documentation
- Add new artifacts and guidelines
- Track development progress

Session: ${date}-${session_name}
🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

    echo "Committed session artifacts for ${date}-${session_name}"
}

# Usage:
# commit_session_artifacts "initial-setup"
```

## Session Management Scripts

### One-Command Session Start
```bash
# Start new session with full setup
start_session() {
    local session_name="$1"

    if [ -z "$session_name" ]; then
        echo "Usage: start_session <session-name>"
        return 1
    fi

    echo "🚀 Starting new session: $session_name"

    # Create session artifacts
    create_session_artifact "$session_name"

    # Check git status
    echo "📊 Current git status:"
    git status --short

    # Show recent commits
    echo "📝 Recent commits:"
    git log --oneline -5

    echo "✅ Session setup complete!"
    echo "📁 Edit session files in: artifacts/sessions/$(date +%Y-%m-%d)-${session_name}/"
}
```

### End Session Command
```bash
# End session with artifacts commit
end_session() {
    local session_name="$1"

    if [ -z "$session_name" ]; then
        echo "Usage: end_session <session-name>"
        return 1
    fi

    echo "🏁 Ending session: $session_name"

    # Show what will be committed
    echo "📄 Files to be committed:"
    git status --porcelain artifacts/ .claude/ CLAUDE.md README.md

    # Commit artifacts
    commit_session_artifacts "$session_name"

    # Show session summary
    local date=$(date +%Y-%m-%d)
    local session_dir="artifacts/sessions/${date}-${session_name}"

    if [ -f "${session_dir}/session-summary.md" ]; then
        echo "📋 Session summary available at: ${session_dir}/session-summary.md"
    fi

    echo "✅ Session artifacts committed successfully!"
}
```

## Installation Instructions

### 1. Add to Shell Profile
Add these functions to your `~/.bashrc`, `~/.zshrc`, or `~/.profile`:

```bash
# Add to ~/.bashrc or ~/.zshrc
source /path/to/socratic-dialogue-ai/.claude/commands/artifacts.md

# Or add functions directly to your shell profile
```

### 2. Make Functions Available
```bash
# Reload shell configuration
source ~/.bashrc  # or ~/.zshrc

# Or restart terminal
```

### 3. Verify Installation
```bash
# Test function availability
type create_session_artifact
type commit_session_artifacts
type start_session
type end_session
```

## Usage Examples

### Complete Workflow
```bash
# 1. Start new session
start_session "conversation-improvements"

# 2. Do development work...
# (create components, write tests, implement features)

# 3. Update session artifacts as you work
# Edit artifacts/sessions/2025-09-16-conversation-improvements/session-summary.md

# 4. End session and commit artifacts
end_session "conversation-improvements"
```

### Quick Session Documentation
```bash
# Create session artifacts only
create_session_artifact "quick-fixes"

# Add specific files to session documentation
echo "- Fixed message rendering bug" >> artifacts/sessions/$(date +%Y-%m-%d)-quick-fixes/session-summary.md

# Commit just this session
commit_session_artifacts "quick-fixes"
```

### Manual Artifact Management
```bash
# List all sessions
ls artifacts/sessions/

# Edit specific session
code artifacts/sessions/2025-09-15-initial-setup/session-summary.md

# Add all artifacts manually
git add artifacts/ .claude/
git commit -m "docs: update session artifacts and guidelines"
```

## Advanced Commands

### Session Statistics
```bash
# Count sessions
session_count() {
    echo "Total sessions: $(ls -1 artifacts/sessions/ | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}' | wc -l)"
}

# List recent sessions
recent_sessions() {
    echo "Recent sessions:"
    ls -1t artifacts/sessions/ | head -5
}
```

### Search Sessions
```bash
# Find sessions by name pattern
find_session() {
    local pattern="$1"
    echo "Sessions matching '$pattern':"
    ls artifacts/sessions/ | grep "$pattern"
}

# Search session content
search_sessions() {
    local term="$1"
    echo "Sessions containing '$term':"
    grep -r "$term" artifacts/sessions/ | cut -d: -f1 | sort -u
}
```

### Backup and Archive
```bash
# Create session archive
archive_sessions() {
    local archive_name="sessions-backup-$(date +%Y%m%d).tar.gz"
    tar -czf "$archive_name" artifacts/sessions/
    echo "Created archive: $archive_name"
}

# Export session as markdown
export_session() {
    local session_dir="$1"
    if [ -d "artifacts/sessions/$session_dir" ]; then
        cat artifacts/sessions/$session_dir/*.md > "${session_dir}-export.md"
        echo "Exported session to: ${session_dir}-export.md"
    fi
}
```

These commands provide a complete workflow for managing session artifacts efficiently and consistently.