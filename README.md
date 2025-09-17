# Socratic AI Chat Application

A modern, full-stack chat application that uses AI to conduct Socratic dialogues, helping users explore complex questions through guided questioning rather than providing direct answers.

## 🎯 Project Overview

The Socratic AI Chat Application employs the Socratic method of learning through inquiry. Instead of giving direct answers, the AI asks probing questions that guide users to discover insights and develop deeper understanding of complex topics.

### Core Features

- **🤖 AI-Powered Socratic Dialogue**: AI asks probing questions to help users discover insights
- **🔄 Model Switching**: Users can switch between different AI models (GPT-4, Claude, etc.)
- **💾 Persistent Sessions**: Conversations are saved and can be resumed
- **📈 Question Evolution Tracking**: System tracks how questions evolve and deepen during dialogue
- **⚡ Real-time Streaming**: Progressive AI response streaming with smooth UX and cancel functionality
- **🎯 Modern Chat Interface**: Responsive design with typing indicators, message actions, and auto-scroll

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **React**: React 19 with modern hooks and patterns
- **TypeScript**: Strict mode with comprehensive type safety
- **Styling**: Tailwind CSS 4 with custom design tokens
- **UI Components**: shadcn/ui component system
- **Icons**: Lucide React icon library

### Backend
- **API**: Next.js API routes with Server-Sent Events streaming
- **Database**: PostgreSQL (planned)
- **AI Integration**: OpenAI streaming API integration (Anthropic support planned)
- **Streaming**: Real-time AI response streaming with error handling and retry logic

### Development & Testing
- **Testing**: Jest 30 with React Testing Library
- **Code Quality**: ESLint with Next.js and TypeScript rules
- **Development Methodology**: Strict Test-Driven Development (TDD)
- **Path Aliases**: Clean imports with `@/` prefix

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:Sob7i/socratic-dialogue-ai.git
   cd socratic-dialogue-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Testing
```bash
npm run test         # Run tests
npm test -- --watch # Run tests in watch mode
npm test -- --coverage # Run tests with coverage
```

## 🧪 Test-Driven Development (TDD)

This project follows **strict TDD methodology**:

1. **🔴 RED**: Write failing tests first
2. **🟢 GREEN**: Write minimal code to make tests pass
3. **🔵 REFACTOR**: Improve code while keeping tests green

### TDD Workflow
- Tests must be written before implementation
- No implementation code without corresponding tests
- Follow the Red-Green-Refactor cycle
- Comprehensive test coverage for all scenarios

See [TDD Workflow Guide](.claude/workflows/tdd-cycle.md) for detailed instructions.

## 📁 Project Structure

```
socratic-dialogue-ai/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   └── api/chat/stream/ # Streaming API endpoint
│   ├── components/          # React components
│   │   ├── ChatContainer/   # Main chat container with streaming
│   │   ├── ConversationView/ # Message display with streaming optimization
│   │   ├── MessageInput/    # Input with cancel stream functionality
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   │   └── useStreamingChat.ts # Core streaming functionality
│   ├── types/              # TypeScript type definitions
│   │   └── streaming.ts    # Streaming interfaces
│   └── lib/                # Utility functions
├── artifacts/              # Session documentation
│   ├── sessions/          # Development session records
│   ├── decisions/         # Technical decision logs
│   └── research/          # Research and analysis
├── .claude/               # Claude AI assistant context
│   ├── prompts/          # Context and requirements
│   ├── commands/         # Development commands
│   ├── workflows/        # Development workflows
│   └── guidelines/       # Code style and conventions
├── public/                # Static assets
└── docs/                 # Additional documentation
```

## 🎨 Component Development

### Component Structure
Each component follows this pattern:
```
ComponentName/
├── ComponentName.tsx      # Main component
├── ComponentName.test.tsx # Test suite
└── index.ts              # Export file
```

### Creating New Components
1. Create component directory and test file first
2. Write comprehensive tests covering all scenarios
3. Implement minimal code to pass tests
4. Refactor and improve while keeping tests green

See [Code Style Guidelines](.claude/guidelines/code-style.md) for detailed patterns.

## 🤖 AI Assistant Integration

This project includes comprehensive Claude AI assistant integration:

- **CLAUDE.md**: Complete project context and guidelines
- **Development Commands**: Pre-configured development workflows
- **TDD Guidelines**: Strict test-driven development patterns
- **Code Style**: Consistent coding standards and patterns

## 📊 Session Artifacts

The project maintains detailed documentation of each development session:

### Session Management
```bash
# Start new session
start_session "feature-name"

# End session and commit artifacts
end_session "feature-name"
```

### Artifact Structure
- **Session Summary**: Overview of work completed
- **Commits**: Detailed commit history and analysis
- **Decisions**: Technical decisions and rationale
- **Files Created**: Documentation of new files and changes

## 🎯 Current Development Status

### ✅ Completed
- [x] Next.js 15 setup with TypeScript and Tailwind CSS
- [x] Jest testing framework with React Testing Library
- [x] shadcn/ui component system integration
- [x] TDD methodology and workflow establishment
- [x] ConversationView component with comprehensive tests
- [x] MessageInput component with cancel stream functionality
- [x] ChatContainer with streaming integration
- [x] Real-time AI streaming with Server-Sent Events
- [x] useStreamingChat hook with error handling and retry logic
- [x] OpenAI API integration with streaming support
- [x] Performance optimizations for streaming (debouncing, memoization)
- [x] Comprehensive test coverage for streaming functionality
- [x] Project documentation and artifact structure

### 🚧 In Progress
- [ ] Environment setup with API keys for live testing
- [ ] Additional AI provider integration (Claude, GPT-3.5-turbo)

### 📋 Planned Features
- [ ] User authentication system
- [ ] Database integration for conversation persistence
- [ ] AI model switching functionality
- [ ] Question evolution tracking
- [ ] Advanced chat features (reactions, search, export)

## 🤝 Contributing

### Development Workflow
1. Follow TDD methodology strictly
2. Write tests before implementation
3. Use conventional commit messages
4. Maintain comprehensive documentation
5. Document sessions in artifacts folder

### Code Quality Standards
- TypeScript strict mode required
- 100% test coverage for new components
- ESLint compliance
- Accessibility requirements (WCAG guidelines)
- Responsive design (mobile-first)

## 📚 Documentation

### Development Guides
- [TDD Workflow](.claude/workflows/tdd-cycle.md)
- [Code Style Guidelines](.claude/guidelines/code-style.md)
- [Commit Conventions](.claude/guidelines/commit-conventions.md)
- [Development Commands](.claude/commands/development.md)

### Session Artifacts
- [Session 3: Streaming Implementation](artifacts/sessions/2025-09-17-session-3-streaming/)
- [Session Template](artifacts/sessions/session-template.md)

## 🔧 Configuration

### Environment Setup
Create `.env.local` file for local development:
```env
# AI API Keys
OPENAI_API_KEY=your_openai_key          # Required for streaming functionality
ANTHROPIC_API_KEY=your_anthropic_key    # Optional (planned for future)

# Database (planned)
DATABASE_URL=your_postgres_url
```

**Note**: The streaming functionality requires an OpenAI API key to work with live AI responses.

### IDE Setup
- VS Code with TypeScript and ESLint extensions
- Prettier integration for code formatting
- Jest runner for test execution

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team**: For the excellent framework and tooling
- **shadcn**: For the beautiful and accessible UI component system
- **Vercel**: For hosting and deployment platform
- **OpenAI & Anthropic**: For AI model access and capabilities

---

**Repository**: [git@github.com:Sob7i/socratic-dialogue-ai.git](git@github.com:Sob7i/socratic-dialogue-ai.git)

Built with ❤️ using modern web technologies and AI-assisted development.