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

## UI Component System

The project uses shadcn/ui with:
- Style: "new-york" variant
- Base color: neutral
- CSS variables enabled for theming
- Component aliases configured for easy imports:
  - `@/components` - General components
  - `@/components/ui` - UI primitives
  - `@/lib/utils` - Utility functions
  - `@/hooks` - Custom React hooks

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