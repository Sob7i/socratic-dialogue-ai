# Claude Code Context Setup

## Product Requirements Document (PRD)

### Product Overview
**Socratic AI Chat Application** - A full-stack application that uses AI to conduct Socratic dialogues, helping users explore complex questions through guided questioning rather than direct answers.

### Core Features
1. **AI-Powered Socratic Dialogue**: AI asks probing questions to help users discover insights
2. **Model Switching**: Users can switch between different AI models (GPT-4, Claude, etc.)
3. **Persistent Sessions**: Conversations are saved and can be resumed
4. **Question Evolution Tracking**: System tracks how questions evolve and deepen during dialogue
5. **Streaming Responses**: Real-time display of AI responses as they generate

### Technical Stack
- **Frontend**: React with TypeScript, Next.js
- **Backend**: Next.js API routes
- **Database**: PostgreSQL (conversations, users, question progressions)
- **AI Integration**: Multiple AI API providers (OpenAI, Anthropic)

### User Stories
- As a user, I want to ask a question and receive Socratic questions back that help me think deeper
- As a user, I want to see my conversation history and resume previous dialogues
- As a user, I want to switch between AI models to get different questioning styles
- As a user, I want to see responses stream in real-time for better UX

---

## Current Development Phase: Foundation

We're building the core conversation UI component using **Test-Driven Development (TDD)**.

### TDD Instructions for Claude Code

**IMPORTANT: We are following strict TDD methodology:**
1. Write failing tests FIRST
2. Write minimal code to make tests pass
3. Refactor only after tests pass
4. DO NOT write implementation code before tests exist

### Current Task: ConversationView Component

**Component Requirements:**
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: 'complete' | 'streaming' | 'failed';
  timestamp: Date;
}

interface ConversationViewProps {
  messages: Message[];
  isLoading?: boolean;
}
```

**Test Requirements:**
1. Renders list of messages correctly
2. Shows different styling for user vs assistant messages
3. Displays typing indicator when message status is "streaming"
4. Shows partial content when streaming with existing content
5. Handles failed message states
6. Shows loading state when isLoading is true

**File Structure Expected:**
```
src/
  components/
    ConversationView/
      ConversationView.tsx
      ConversationView.test.tsx
      index.ts
```

### Steps to Execute:

1. **First**: Create the test file with comprehensive test cases
2. **Run tests** to confirm they fail (no implementation exists)
3. **Only then** create minimal implementation to pass tests
4. **Commit** with descriptive message following our TDD approach

### Context for Implementation:
- Use modern React patterns (hooks, functional components)
- Implement responsive design (mobile-first)
- Use semantic HTML for accessibility
- Handle edge cases (empty messages, undefined content)
- Style with Tailwind CSS or CSS modules
- Consider performance for large message lists

---

## Claude Code Specific Instructions:

**Before starting development:**
1. Read any existing project files to understand current structure
2. Check if testing framework is already configured
3. Look for existing component patterns to follow
4. Review package.json for available dependencies

**During development:**
- Use `npm run test` to run tests
- Follow existing code style and patterns
- Write clear, descriptive test names
- Add comments explaining complex test scenarios
- Use proper TypeScript types throughout

**Testing Philosophy:**
- Test behavior, not implementation details
- Cover happy path and edge cases
- Test user interactions and accessibility
- Mock external dependencies appropriately

---

## Questions to Consider During Development:

1. How should we handle message ordering when messages arrive out of sequence?
2. What happens if a streaming message never completes?
3. Should we auto-scroll to new messages?
4. How do we handle very long conversations (virtualization)?
5. What accessibility features are needed for screen readers?

Please start by creating the test file first, ensuring all scenarios are covered before writing any implementation code.