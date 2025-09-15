# TDD Workflow Cycle

## Overview
This document outlines the strict Test-Driven Development (TDD) workflow that must be followed for all component development in the Socratic AI Chat Application.

## The Red-Green-Refactor Cycle

### 🔴 RED: Write Failing Tests First
**CRITICAL**: Never write implementation code before tests exist.

#### Step 1: Create Test File
```bash
# Create component directory and test file
mkdir src/components/ComponentName
touch src/components/ComponentName/ComponentName.test.tsx
```

#### Step 2: Write Comprehensive Tests
```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('should render without crashing', () => {
    render(<ComponentName />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('should display required content', () => {
    render(<ComponentName title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  // Add more comprehensive tests...
})
```

#### Step 3: Run Tests to Confirm Failure
```bash
npm test ComponentName.test.tsx
# Should see: Cannot resolve module './ComponentName'
```

### 🟢 GREEN: Write Minimal Implementation
**Goal**: Make tests pass with the simplest possible code.

#### Step 4: Create Component File
```bash
touch src/components/ComponentName/ComponentName.tsx
```

#### Step 5: Write Minimal Implementation
```typescript
// ComponentName.tsx
interface ComponentNameProps {
  title?: string
}

export function ComponentName({ title }: ComponentNameProps) {
  return (
    <main>
      {title && <h1>{title}</h1>}
    </main>
  )
}
```

#### Step 6: Run Tests to Confirm Pass
```bash
npm test ComponentName.test.tsx
# Should see: All tests passing
```

### 🔵 REFACTOR: Improve Code Quality
**Goal**: Clean up code while maintaining passing tests.

#### Step 7: Refactor Implementation
- Improve code structure
- Add proper TypeScript types
- Enhance accessibility
- Optimize performance
- Add documentation

#### Step 8: Run Tests After Each Refactor
```bash
npm test ComponentName.test.tsx -- --watch
# Keep tests running during refactoring
```

#### Step 9: Create Index Export
```typescript
// index.ts
export { ComponentName } from './ComponentName'
export type { ComponentNameProps } from './ComponentName'
```

## TDD Workflow Checklist

### Before Starting Implementation
- [ ] Requirements clearly defined
- [ ] Component interface designed
- [ ] Test scenarios identified
- [ ] Test file created
- [ ] Comprehensive tests written
- [ ] Tests run and confirmed failing

### During Implementation
- [ ] Write minimal code to pass tests
- [ ] Run tests after each small change
- [ ] Only add features that have tests
- [ ] Refactor only with passing tests
- [ ] Maintain test coverage

### After Implementation
- [ ] All tests passing
- [ ] Code is clean and readable
- [ ] TypeScript types are proper
- [ ] Accessibility requirements met
- [ ] Documentation updated
- [ ] Component exported properly

## Test Writing Guidelines

### Test Structure
```typescript
describe('ComponentName', () => {
  // Happy path tests
  describe('when used normally', () => {
    it('should render correctly', () => {})
    it('should handle props properly', () => {})
  })

  // Edge cases
  describe('edge cases', () => {
    it('should handle empty props', () => {})
    it('should handle undefined values', () => {})
  })

  // User interactions
  describe('user interactions', () => {
    it('should respond to clicks', () => {})
    it('should handle keyboard input', () => {})
  })

  // Accessibility
  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {})
    it('should support keyboard navigation', () => {})
  })
})
```

### Test Categories to Cover
1. **Rendering Tests**: Component displays correctly
2. **Props Tests**: Component handles all prop variations
3. **State Tests**: Component state changes work correctly
4. **Interaction Tests**: User interactions trigger expected behavior
5. **Edge Cases**: Unusual inputs and error conditions
6. **Accessibility Tests**: Screen reader and keyboard support

## Common TDD Patterns

### Pattern 1: Props-Driven Component
```typescript
// Test first
it('should display message when provided', () => {
  render(<Message text="Hello World" />)
  expect(screen.getByText('Hello World')).toBeInTheDocument()
})

// Then implement
export function Message({ text }: { text: string }) {
  return <div>{text}</div>
}
```

### Pattern 2: State-Driven Component
```typescript
// Test first
it('should toggle visibility when clicked', () => {
  render(<Collapsible title="Click me" />)
  fireEvent.click(screen.getByText('Click me'))
  expect(screen.getByText('Content')).toBeVisible()
})

// Then implement
export function Collapsible({ title }: { title: string }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>{title}</button>
      {isOpen && <div>Content</div>}
    </div>
  )
}
```

### Pattern 3: API-Driven Component
```typescript
// Test first with mocks
it('should load and display data', async () => {
  const mockData = { id: 1, name: 'Test' }
  jest.mocked(fetchData).mockResolvedValue(mockData)

  render(<DataDisplay id={1} />)

  await waitFor(() => {
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

## TDD Best Practices

### DO:
- ✅ Write tests before implementation
- ✅ Write descriptive test names
- ✅ Test behavior, not implementation
- ✅ Cover edge cases and error states
- ✅ Keep tests simple and focused
- ✅ Run tests frequently during development
- ✅ Refactor both tests and code

### DON'T:
- ❌ Write implementation before tests
- ❌ Skip tests for "simple" code
- ❌ Test implementation details
- ❌ Write overly complex tests
- ❌ Let tests become outdated
- ❌ Ignore failing tests
- ❌ Skip the refactor step

## Integration with Project Workflow

### Component Development Process
1. **Planning**: Define component requirements
2. **Test Design**: Plan test scenarios
3. **TDD Cycle**: Follow Red-Green-Refactor
4. **Integration**: Add to parent components
5. **Documentation**: Update relevant docs
6. **Commit**: Use conventional commit messages

### Git Integration
```bash
# After completing TDD cycle
git add src/components/ComponentName/
git commit -m "feat: implement ComponentName following TDD approach

- Add comprehensive test suite covering all scenarios
- Implement component with proper TypeScript types
- Include accessibility features and error handling
- Follow established component patterns"
```

This TDD workflow ensures high code quality, comprehensive test coverage, and maintainable components for the Socratic AI Chat Application.