# Claude Code Session 2: Core Chat Interface Development

## Session Context & Continuation

### Previous Session Achievements ✅
- **ConversationView component** complete with 37 passing tests
- **TDD methodology** established and working well
- **GitHub repo** initialized with proper structure
- **Artifacts system** in place for knowledge capture

### Current Session Goals 🎯
1. **Enhance ConversationView** with missing UX features
2. **Build MessageInput component** with proper form handling
3. **Create complete chat interface** that's ready for streaming integration
4. **Maintain TDD approach** - tests first, always

---

## Technical Requirements

### ConversationView Enhancements Needed

**Missing UX Features to Add:**
```typescript
// Enhanced ConversationView props
interface ConversationViewProps {
  messages: Message[];
  isLoading?: boolean;
  onRetry?: (messageId: string) => void;  // NEW: Handle retry functionality
  autoScroll?: boolean;                   // NEW: Auto-scroll to latest messages
  maxHeight?: string;                     // NEW: Scrollable container
}
```

**Required Enhancements:**
1. **Auto-scrolling** to newest messages (with user control)
2. **Proper retry handling** for failed messages
3. **Scrollable container** with fixed height
4. **Message grouping** by timestamp/user (optional)
5. **Copy message functionality** for user convenience

### MessageInput Component (New)

**Core Requirements:**
```typescript
interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  showCharCount?: boolean;
}
```

**Features to Implement:**
1. **Multi-line text input** with auto-resize
2. **Send on Enter** (Shift+Enter for new line)
3. **Character count** with visual feedback near limit
4. **Disabled state** when AI is responding
5. **Input validation** and sanitization
6. **Keyboard shortcuts** (Ctrl/Cmd+Enter alternative send)
7. **Accessibility** - proper labels and focus management

### Parent Chat Container (New)

**Integration Component:**
```typescript
interface ChatContainerProps {
  conversationId?: string;
  initialMessages?: Message[];
}
```

**Responsibilities:**
1. **State management** for messages array
2. **Message handling** - send, retry, update
3. **Loading states** coordination
4. **Error boundaries** for graceful failure
5. **Layout management** between input and conversation view

---

## Development Instructions

### TDD Workflow (CRITICAL)
**MAINTAIN STRICT TDD - No exceptions:**

1. **MessageInput Component:**
   - Write comprehensive tests FIRST
   - Test all keyboard interactions
   - Test validation scenarios
   - Test accessibility features
   - ONLY implement after tests fail properly

2. **ConversationView Enhancements:**
   - Add tests for new features before implementing
   - Test auto-scroll behavior
   - Test retry functionality
   - Test scrollable container edge cases

3. **ChatContainer Integration:**
   - Test message flow between components
   - Test state management
   - Test error scenarios

### File Structure to Create
```
src/
  components/
    ConversationView/          # Already exists
      ConversationView.tsx
      ConversationView.test.tsx
    MessageInput/              # NEW
      MessageInput.tsx
      MessageInput.test.tsx
      index.ts
    ChatContainer/             # NEW
      ChatContainer.tsx
      ChatContainer.test.tsx
      index.ts
  hooks/                       # NEW
    useAutoScroll.ts
    useMessageInput.ts
  utils/                       # NEW
    messageValidation.ts
```

---

## Implementation Priorities

### Phase 1: MessageInput Foundation
1. **Create test file** with all interaction scenarios
2. **Basic input component** - text area, send button
3. **Keyboard handling** - Enter, Shift+Enter, Ctrl+Enter
4. **Input validation** - length, empty messages, sanitization

### Phase 2: MessageInput Polish
1. **Auto-resize** text area based on content
2. **Character counter** with visual feedback
3. **Disabled states** with proper UX feedback
4. **Accessibility** - ARIA labels, focus management

### Phase 3: ConversationView Enhancements
1. **Auto-scroll functionality** with user control
2. **Proper retry button** integration
3. **Scrollable container** with performance optimization
4. **Message actions** - copy, timestamp display

### Phase 4: Integration
1. **ChatContainer component** connecting everything
2. **State management** for message flow
3. **Error boundaries** and graceful degradation
4. **Layout responsive** design testing

---

## Key Technical Considerations

### Auto-Scroll Strategy
```typescript
// Consider these scenarios in tests:
- New message added → auto-scroll
- User scrolled up manually → don't auto-scroll
- User at bottom → resume auto-scroll
- Streaming message updating → maintain scroll position
```

### Input UX Patterns
```typescript
// Test these interaction patterns:
- Empty message → disable send button
- Long message → show character count
- Max length reached → prevent further input
- Disabled state → show loading indicator
- Focus management → proper tab order
```

### Performance Considerations
- **Virtual scrolling** for large conversation histories (future)
- **Debounced input** for character count updates
- **Optimized re-renders** when streaming updates arrive

---

## Session Success Criteria

### Must Have ✅
1. **MessageInput component** with full test coverage
2. **Enhanced ConversationView** with auto-scroll and retry
3. **Working chat interface** that looks and feels complete
4. **All tests passing** with good coverage
5. **Responsive design** working on mobile/desktop

### Nice to Have 🎯
1. **Keyboard shortcuts** working smoothly
2. **Message actions** (copy, etc.) implemented
3. **Character count** with smooth UX
4. **Error states** properly handled

### Ready for Next Session 🚀
- **Complete UI** that's ready for streaming integration
- **State management** patterns established
- **Component boundaries** clear for AI integration
- **Test coverage** comprehensive enough to refactor safely

---

## Claude Code Specific Instructions

### Before Starting
1. **Read previous session artifacts** to understand context
2. **Review existing ConversationView** to understand patterns
3. **Check test setup** and ensure it's ready for new components
4. **Plan the development** using thinking modes if needed

### During Development
- **Use `npm run test`** frequently to ensure TDD compliance
- **Commit after each major milestone** with descriptive messages
- **Update artifacts** with decisions and learnings
- **Test manually** in browser for UX validation

### Quality Checks
- **All tests pass** before moving to next phase
- **TypeScript strict** mode compliance
- **Accessibility** testing with screen reader
- **Mobile responsive** testing
- **Performance** check for large message arrays

---

## Questions to Explore During Development

1. **Auto-scroll UX**: When should we auto-scroll vs respect user's scroll position?
2. **Input validation**: Should we prevent send on empty/whitespace-only messages?
3. **State management**: Local state vs props for message input content?
4. **Error recovery**: How should retry functionality integrate with parent state?
5. **Accessibility**: What screen reader experience do we want for real-time chat?

---

*Ready to build a polished chat interface that will make streaming implementation much more satisfying to test and develop!*