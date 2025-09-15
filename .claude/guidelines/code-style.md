# Code Style Guidelines

## Overview
This document establishes consistent code style and patterns for the Socratic AI Chat Application to ensure maintainable, readable, and high-quality code.

## TypeScript Guidelines

### Type Definitions
```typescript
// ✅ DO: Use explicit interfaces for props
interface ComponentProps {
  title: string
  isVisible?: boolean
  onClick: (id: string) => void
}

// ✅ DO: Use proper generic constraints
interface ApiResponse<T extends Record<string, unknown>> {
  data: T
  status: number
}

// ❌ DON'T: Use any type
function handleData(data: any) {} // Avoid this

// ✅ DO: Use unknown for truly unknown data
function handleData(data: unknown) {
  if (typeof data === 'string') {
    // Type narrowing
  }
}
```

### Import Organization
```typescript
// 1. React and Next.js imports
import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'

// 2. Third-party library imports
import { clsx } from 'clsx'
import { motion } from 'framer-motion'

// 3. Internal imports (absolute paths)
import { Button } from '@/components/ui/Button'
import { useApiCall } from '@/hooks/useApiCall'
import { cn } from '@/lib/utils'

// 4. Type-only imports (separate section)
import type { ComponentProps } from '@/types/components'
import type { ApiResponse } from '@/types/api'
```

### Variable and Function Naming
```typescript
// ✅ DO: Use descriptive names
const isUserAuthenticated = checkAuthStatus()
const handleMessageSubmit = (message: string) => {}

// ✅ DO: Use consistent naming patterns
const [isLoading, setIsLoading] = useState(false)
const [messages, setMessages] = useState<Message[]>([])

// ✅ DO: Use proper boolean naming
const isVisible = true
const hasError = false
const shouldRender = computed()

// ❌ DON'T: Use unclear abbreviations
const usr = getUser() // Use 'user' instead
const btn = document.querySelector() // Use 'button' instead
```

## React Component Guidelines

### Component Structure
```typescript
// File: ComponentName.tsx
import React from 'react'
import { cn } from '@/lib/utils'

// 1. Types and interfaces
interface ComponentNameProps {
  title: string
  className?: string
  children?: React.ReactNode
}

// 2. Main component
export function ComponentName({
  title,
  className,
  children
}: ComponentNameProps) {
  // 3. Hooks (in order: state, effects, custom hooks)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Effect logic
  }, [])

  // 4. Event handlers
  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  // 5. Computed values
  const computedClasses = cn(
    'base-classes',
    isOpen && 'open-classes',
    className
  )

  // 6. Render
  return (
    <div className={computedClasses} onClick={handleClick}>
      <h1>{title}</h1>
      {children}
    </div>
  )
}

// 7. Default export (if needed)
export default ComponentName
```

### Props Patterns
```typescript
// ✅ DO: Use object destructuring with defaults
interface Props {
  title: string
  isVisible?: boolean
  variant?: 'primary' | 'secondary'
}

function Component({
  title,
  isVisible = false,
  variant = 'primary'
}: Props) {}

// ✅ DO: Use proper children typing
interface Props {
  children: React.ReactNode // For any renderable content
  // OR
  children: (data: Data) => React.ReactNode // For render props
}

// ✅ DO: Use forwarded refs properly
const Component = React.forwardRef<
  HTMLDivElement,
  ComponentProps
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("base-styles", className)} {...props} />
))
Component.displayName = "Component"
```

### Hook Usage
```typescript
// ✅ DO: Custom hooks for reusable logic
function useApiData(url: string) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch logic
  }, [url])

  return { data, loading, error }
}

// ✅ DO: Proper dependency arrays
useEffect(() => {
  fetchData(userId)
}, [userId]) // Include all dependencies

// ✅ DO: Cleanup functions
useEffect(() => {
  const subscription = subscribe()
  return () => subscription.unsubscribe()
}, [])
```

## CSS and Styling Guidelines

### Tailwind CSS Patterns
```typescript
// ✅ DO: Use consistent spacing scale
<div className="p-4 m-2 space-y-4">

// ✅ DO: Group related classes
<div className={cn(
  // Layout
  "flex items-center justify-between",
  // Spacing
  "px-4 py-2 gap-2",
  // Appearance
  "bg-white border border-gray-200 rounded-lg",
  // States
  "hover:bg-gray-50 focus:outline-none focus:ring-2",
  // Responsive
  "sm:px-6 md:px-8"
)}>

// ✅ DO: Use semantic color names
<div className="bg-primary text-primary-foreground">
<div className="bg-destructive text-destructive-foreground">
```

### Responsive Design
```typescript
// ✅ DO: Mobile-first approach
<div className={cn(
  "grid grid-cols-1",    // Mobile: 1 column
  "sm:grid-cols-2",      // Small: 2 columns
  "lg:grid-cols-3",      // Large: 3 columns
  "xl:grid-cols-4"       // Extra large: 4 columns
)}>

// ✅ DO: Consistent breakpoint usage
const breakpoints = {
  sm: '640px',   // Small devices
  md: '768px',   // Medium devices
  lg: '1024px',  // Large devices
  xl: '1280px',  // Extra large devices
  '2xl': '1536px' // 2X large devices
}
```

## Testing Style Guidelines

### Test Structure
```typescript
// File: ComponentName.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  // Setup helpers
  const defaultProps = {
    title: 'Test Title',
    onSubmit: jest.fn()
  }

  const renderComponent = (props = {}) => {
    return render(<ComponentName {...defaultProps} {...props} />)
  }

  // Reset mocks
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render with required props', () => {
      renderComponent()
      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('should handle click events', async () => {
      const user = userEvent.setup()
      renderComponent()

      await user.click(screen.getByRole('button'))

      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1)
    })
  })
})
```

### Test Naming
```typescript
// ✅ DO: Descriptive test names
it('should display error message when validation fails')
it('should disable submit button while form is submitting')
it('should navigate to next page when form is valid')

// ✅ DO: Group related tests
describe('when user is authenticated', () => {
  it('should show user dashboard')
  it('should allow access to protected features')
})

describe('when user is not authenticated', () => {
  it('should redirect to login page')
  it('should show authentication required message')
})
```

## File Organization Guidelines

### Component Files
```
ComponentName/
├── ComponentName.tsx           # Main component
├── ComponentName.test.tsx      # Test file
├── ComponentName.stories.tsx   # Storybook stories (if used)
├── index.ts                    # Export file
└── types.ts                    # Component-specific types (if complex)
```

### Import/Export Patterns
```typescript
// index.ts - Clean exports
export { ComponentName } from './ComponentName'
export type { ComponentNameProps } from './ComponentName'

// Component file - Named export
export function ComponentName(props: ComponentNameProps) {}

// Usage - Import from index
import { ComponentName } from '@/components/ComponentName'
```

## Error Handling Guidelines

### Component Error Boundaries
```typescript
// ✅ DO: Graceful error handling
function ComponentName({ data }: Props) {
  if (!data) {
    return <div>Loading...</div>
  }

  if (data.error) {
    return <div>Error: {data.error.message}</div>
  }

  return <div>{data.content}</div>
}

// ✅ DO: Use error boundaries for component trees
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  // Error boundary implementation
}
```

### Async Operations
```typescript
// ✅ DO: Proper async/await patterns
async function handleSubmit(data: FormData) {
  try {
    setLoading(true)
    setError(null)

    const result = await submitData(data)

    setSuccess(true)
    onSuccess?.(result)
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Unknown error')
  } finally {
    setLoading(false)
  }
}
```

## Performance Guidelines

### React Performance
```typescript
// ✅ DO: Use React.memo for expensive components
const ExpensiveComponent = React.memo(function ExpensiveComponent({
  data
}: Props) {
  // Component logic
})

// ✅ DO: Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])

// ✅ DO: Use useCallback for stable function references
const handleClick = useCallback((id: string) => {
  onItemClick(id)
}, [onItemClick])
```

### Bundle Optimization
```typescript
// ✅ DO: Dynamic imports for code splitting
const LazyComponent = lazy(() => import('./LazyComponent'))

// ✅ DO: Import only what you need
import { debounce } from 'lodash/debounce' // Not entire lodash
```

## Accessibility Guidelines

### Semantic HTML
```typescript
// ✅ DO: Use proper semantic elements
<main>
  <header>
    <h1>Page Title</h1>
  </header>
  <section>
    <h2>Section Title</h2>
    <article>Content</article>
  </section>
</main>

// ✅ DO: Proper form elements
<form onSubmit={handleSubmit}>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    required
    aria-describedby="email-error"
  />
  <div id="email-error" role="alert">
    {emailError}
  </div>
</form>
```

### ARIA Attributes
```typescript
// ✅ DO: Proper ARIA usage
<button
  aria-expanded={isOpen}
  aria-controls="dropdown-menu"
  aria-label="Open user menu"
>
  Menu
</button>

<div
  id="dropdown-menu"
  role="menu"
  aria-hidden={!isOpen}
>
  {/* Menu items */}
</div>
```

These guidelines ensure consistent, maintainable, and accessible code across the Socratic AI Chat Application.