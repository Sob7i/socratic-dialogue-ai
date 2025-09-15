# Development Commands

## Core Development Commands

### Development Server
```bash
npm run dev
```
- Starts Next.js development server on http://localhost:3000
- Hot reload enabled for rapid development
- TypeScript compilation and error checking
- Tailwind CSS processing

### Testing Commands
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test ConversationView.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should render messages"
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint -- --fix

# Type checking
npx tsc --noEmit
```

### Build Commands
```bash
# Create production build
npm run build

# Start production server
npm run start

# Analyze bundle size
npm run build -- --analyze
```

## Git Workflow Commands

### Development Workflow
```bash
# Check status
git status

# Add files
git add .
git add specific-file.tsx

# Commit with conventional commits
git commit -m "feat: add new component"
git commit -m "fix: resolve styling issue"
git commit -m "docs: update README"
git commit -m "test: add component tests"

# Push changes
git push origin main
```

### TDD Workflow Commands
```bash
# 1. Create test file first
touch src/components/NewComponent/NewComponent.test.tsx

# 2. Run tests to see failures
npm test NewComponent.test.tsx

# 3. Create minimal implementation
touch src/components/NewComponent/NewComponent.tsx

# 4. Run tests until they pass
npm test NewComponent.test.tsx -- --watch

# 5. Refactor and commit
git add .
git commit -m "feat: implement NewComponent with TDD approach"
```

## Component Development Commands

### Create New Component (Manual Process)
```bash
# Create component directory
mkdir src/components/ComponentName

# Create component files
touch src/components/ComponentName/ComponentName.tsx
touch src/components/ComponentName/ComponentName.test.tsx
touch src/components/ComponentName/index.ts

# Start with test file (TDD approach)
# Write tests first, then implement component
```

### shadcn/ui Component Commands
```bash
# Add new shadcn/ui component
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card

# List available components
npx shadcn@latest add

# Update existing component
npx shadcn@latest add button --overwrite
```

## Database Commands (Future)
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## Deployment Commands

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls
```

### Environment Setup
```bash
# Copy environment variables
cp .env.example .env.local

# Validate environment
npm run build
```

## Debugging Commands

### Development Debugging
```bash
# Run with debugging
npm run dev -- --inspect

# Check Next.js bundle
npm run build -- --debug

# Analyze bundle size
npm run build -- --analyze
```

### Testing Debugging
```bash
# Run tests with debugging
npm test -- --debug

# Run single test file with verbose output
npm test ComponentName.test.tsx -- --verbose

# Debug specific test
npm test -- --testNamePattern="specific test name" --verbose
```

## Package Management

### Dependency Management
```bash
# Install new dependency
npm install package-name

# Install dev dependency
npm install -D package-name

# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Security audit
npm audit
npm audit fix
```

### TypeScript Packages
```bash
# Install with TypeScript types
npm install package-name
npm install -D @types/package-name
```

## Useful Development Shortcuts

### File Operations
```bash
# Quick file navigation
cd src/components
cd src/app
cd artifacts/sessions

# Find files by pattern
find . -name "*.test.tsx"
find . -name "Component*.tsx"
```

### Log Analysis
```bash
# Check Next.js logs
tail -f .next/trace

# Check test output
npm test 2>&1 | tee test-output.log
```

## IDE Integration Commands

### VS Code Integration
```bash
# Open project in VS Code
code .

# Open specific file
code src/components/ConversationView/ConversationView.tsx

# Run TypeScript language server
npx typescript-language-server --stdio
```

### ESLint Integration
```bash
# Run ESLint on specific file
npx eslint src/components/ComponentName/ComponentName.tsx

# Get ESLint configuration info
npx eslint --print-config src/components/ComponentName/ComponentName.tsx
```

These commands support the complete development workflow for the Socratic AI Chat Application, emphasizing TDD methodology and code quality.