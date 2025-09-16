# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product Overview

**Socratic AI Chat Application** - A full-stack application that uses AI to conduct Socratic dialogues, helping users explore complex questions through guided questioning rather than direct answers.

### Core Features
1. **AI-Powered Socratic Dialogue**: AI asks probing questions to help users discover insights
2. **Model Switching**: Users can switch between different AI models (GPT-4, Claude, etc.)
3. **Persistent Sessions**: Conversations are saved and can be resumed
4. **Question Evolution Tracking**: System tracks how questions evolve and deepen during dialogue
5. **Streaming Responses**: Real-time display of AI responses as they generate

## Development Commands

- **Dev server**: `npm run dev` - Starts Next.js development server on http://localhost:3000
- **Build**: `npm run build` - Creates production build
- **Start**: `npm run start` - Starts production server
- **Lint**: `npm run lint` - Runs ESLint for code linting
- **Test**: `npm run test` - Runs Jest test suite

## UI Testing & Quality Assurance

### Playwright Integration

The project includes **Playwright MCP Server** for advanced UI testing and quality assurance:

**Available Capabilities:**
- **Browser Automation**: Navigate, interact, and test web interfaces
- **Screenshot Testing**: Capture visual snapshots for UI regression testing
- **Element Interaction**: Click, type, select, and interact with UI elements
- **Network Monitoring**: Track requests and responses for debugging
- **Accessibility Testing**: Verify accessibility compliance and standards

**Common Use Cases:**
- Take screenshots of chat interface implementations
- Test responsive design across different viewport sizes
- Verify user interaction flows (message sending, copying, retrying)
- Validate accessibility features and ARIA labels
- Monitor performance and network requests during chat interactions

**Usage Guidelines:**
- Use Playwright for end-to-end UI testing scenarios
- Take screenshots when implementing new UI components
- Verify chat message layouts and styling across devices
- Test interaction flows to ensure proper UX behavior
- Always test both light and dark theme variations

## Development Methodology: Test-Driven Development (TDD)

**CRITICAL: We are following strict TDD methodology:**

1. **Write failing tests FIRST** - Always create comprehensive test cases before any implementation
2. **Write minimal code to make tests pass** - Implement only what's needed to satisfy tests
3. **Refactor only after tests pass** - Clean up code while maintaining passing tests
4. **DO NOT write implementation code before tests exist** - This is non-negotiable

### TDD Workflow for Components

1. **First**: Create the test file with comprehensive test cases covering:
   - Happy path scenarios
   - Edge cases (empty data, undefined values)
   - Error states
   - User interactions
   - Accessibility requirements

2. **Run tests** to confirm they fail (no implementation exists)
3. **Only then** create minimal implementation to pass tests
4. **Refactor** while keeping tests green
5. **Commit** with descriptive message following TDD approach

### Testing Philosophy
- Test behavior, not implementation details
- Cover happy path and edge cases
- Test user interactions and accessibility
- Mock external dependencies appropriately
- Use clear, descriptive test names
- Add comments explaining complex test scenarios

## Tech Stack & Architecture

This is a Next.js 15 project using the App Router architecture with:

- **Frontend**: React with TypeScript, Next.js
- **Backend**: Next.js API routes
- **Database**: PostgreSQL (conversations, users, question progressions)
- **AI Integration**: Multiple AI API providers (OpenAI, Anthropic)
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS 4 with custom design tokens
- **UI Components**: shadcn/ui components (configured via `components.json`)
- **TypeScript**: Strict mode enabled
- **Testing**: Jest with React Testing Library
- **Fonts**: Geist Sans and Geist Mono via next/font

## Project Structure

- `src/app/` - App Router pages and layouts
- `src/components/` - React components (organized by feature/component name)
- `src/lib/` - Utility functions (includes `cn()` for className merging)
- `@/` - TypeScript path alias pointing to `src/`

### Expected Component Structure
```
src/
  components/
    ComponentName/
      ComponentName.tsx
      ComponentName.test.tsx
      index.ts
```

## UI Component System & Design Guidelines

The project uses **shadcn/ui** as the primary design system with:

### Configuration
- **Style**: "new-york" variant
- **Base color**: neutral
- **CSS variables**: Enabled for theming
- **Icon library**: Lucide React
- **Component aliases** configured for easy imports:
  - `@/components` - General components
  - `@/components/ui` - UI primitives (Button, Input, Textarea, Card, etc.)
  - `@/lib/utils` - Utility functions (including `cn()` for className merging)
  - `@/hooks` - Custom React hooks

### Design System Guidelines

**CRITICAL: Always use shadcn/ui components for consistency:**

1. **UI Components**: Use shadcn/ui components instead of raw HTML elements
   - `Button` instead of `<button>`
   - `Input`, `Textarea` instead of `<input>`, `<textarea>`
   - `Card` for content containers
   - Import from `@/components/ui/[component-name]`

2. **Chat Interface Styling**:
   - User messages: Right-aligned, `bg-primary text-primary-foreground`
   - Assistant messages: Left-aligned, `bg-muted text-foreground`
   - Message bubbles: `rounded-2xl` with appropriate corner adjustments
   - Maximum message width: `max-w-[70%]`
   - Input area: Fixed to bottom with backdrop blur effect

3. **Component Structure**:
   ```
   src/components/
     ui/               # shadcn/ui components
     ComponentName/    # Custom components
       ComponentName.tsx
       ComponentName.test.tsx
       index.ts
   ```

4. **Styling Patterns**:
   - Use `cn()` utility for conditional classes
   - Follow Tailwind CSS conventions
   - Prefer semantic color tokens (`primary`, `muted`, `foreground`)
   - Use consistent spacing (`px-4 py-2` for inputs, `mb-4` for messages)
   - Implement responsive design with mobile-first approach

### Modern Chat UI Standards
- **Message Layout**: Flexbox with proper alignment and spacing
- **Input Design**: Textarea with integrated send button using `Send` icon from Lucide
- **Action Buttons**: Icon buttons for copy (`Copy`) and retry (`RotateCcw`) actions
- **Loading States**: Animated dots using CSS animation delays
- **Accessibility**: Proper ARIA labels and semantic HTML structure

## Development Guidelines

### Before Starting Development:
1. Read existing project files to understand current structure
2. Check if testing framework is already configured
3. Look for existing component patterns to follow
4. Review package.json for available dependencies

### During Development:
- Use modern React patterns (hooks, functional components)
- Implement responsive design (mobile-first)
- Use semantic HTML for accessibility
- Handle edge cases (empty messages, undefined content)
- Style with Tailwind CSS following existing patterns
- Consider performance for large data sets
- Use proper TypeScript types throughout
- Follow existing code style and patterns

### Code Quality Requirements:
- Write clear, descriptive test names
- Add comments explaining complex scenarios
- Test user interactions and accessibility
- Mock external dependencies appropriately
- Handle edge cases gracefully
- Use semantic HTML for screen reader support

## Styling

- Uses Tailwind CSS 4 with PostCSS
- Custom CSS variables for light/dark theme support
- Color system based on OKLCH color space
- Design tokens include sidebar, chart, and UI component colors
- Custom animation library: tw-animate-css
- Mobile-first responsive design approach

## Configuration Files

- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration with path aliases
- `eslint.config.mjs` - ESLint with Next.js and TypeScript rules
- `postcss.config.mjs` - PostCSS with Tailwind CSS plugin
- `components.json` - shadcn/ui component configuration
- `jest.config.js` - Jest testing configuration
- `jest.setup.js` - Jest setup and global test configuration

## Documentation Structure

### Artifacts and Session Tracking
- `artifacts/sessions/` - Development session documentation
- `artifacts/decisions/` - Technical decision records
- `artifacts/research/` - Research notes and analysis
- `artifacts/templates/` - Templates for components and tests

### Claude AI Assistant Context
- `.claude/prompts/` - Context and requirement documents
- `.claude/commands/` - Development command references
- `.claude/workflows/` - Development workflow guides
- `.claude/guidelines/` - Code style and commit conventions

### Key Documentation Files
- `README.md` - Project overview and getting started guide
- `CLAUDE.md` - This file - AI assistant guidance and project context
- [TDD Workflow](.claude/workflows/tdd-cycle.md) - Complete TDD methodology guide
- [Code Style Guidelines](.claude/guidelines/code-style.md) - Coding standards and patterns
- [Commit Conventions](.claude/guidelines/commit-conventions.md) - Git commit message standards
- [Development Commands](.claude/commands/development.md) - Available development commands
- [Artifact Management](.claude/commands/artifacts.md) - Session documentation commands

## Session Management

### Quick Session Commands
Use these commands to manage development sessions:

```bash
# Start new session
start_session "feature-name"

# End session and commit artifacts
end_session "feature-name"

# Create session artifacts manually
create_session_artifact "session-name"

# Commit session artifacts
commit_session_artifacts "session-name"
```

### Session Documentation Pattern
Each session should be documented in `artifacts/sessions/YYYY-MM-DD-session-name/`:
- `session-summary.md` - Complete overview of work done
- `commits.md` - Git commit analysis and history
- `decisions.md` - Technical decisions made during session
- `files-created.md` - Detailed list of files created/modified

For complete session management instructions, see [Artifact Management Commands](.claude/commands/artifacts.md).