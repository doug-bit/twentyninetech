# Contributing to Maya-29 Generator

Thank you for your interest in contributing to the Maya-29 AI Image Generator! This document provides guidelines and information for contributors.

## Table of Contents
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database access
- Replicate API account
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/maya-29-generator.git
   cd maya-29-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and database URL
   ```

4. **Initialize database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Code Style

### TypeScript
- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Use proper type annotations
- Avoid `any` types when possible

### React Components
- Use functional components with hooks
- Follow the existing component structure
- Use proper prop types with TypeScript interfaces
- Keep components focused and reusable

### Backend Code
- Use async/await for asynchronous operations
- Implement proper error handling
- Follow RESTful API conventions
- Use Zod schemas for validation

### Styling
- Use Tailwind CSS classes
- Follow the existing design system
- Maintain responsive design patterns
- Use CSS variables for theming

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── config.ts       # Client configuration
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route handlers
│   ├── storage.ts         # Data storage interface
│   └── vite.ts            # Development server setup
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database and validation schemas
└── generated_images/       # Image storage directory
```

## Submitting Changes

### Branch Naming
- Feature branches: `feature/description`
- Bug fixes: `fix/description` 
- Documentation: `docs/description`

### Commit Messages
Use conventional commits format:
- `feat: add new feature`
- `fix: resolve bug in component`
- `docs: update readme`
- `style: format code`
- `refactor: restructure component`

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow code style guidelines
   - Add tests if applicable
   - Update documentation

3. **Test your changes**
   ```bash
   npm run check  # TypeScript check
   npm run dev    # Test locally
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use a descriptive title
   - Include details about changes made
   - Reference any related issues
   - Add screenshots for UI changes

## Reporting Issues

### Bug Reports
When reporting bugs, please include:

- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to reproduce the bug
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Browser, OS, Node.js version
- **Screenshots**: If applicable

### Feature Requests
When suggesting features:

- **Description**: Clear description of the proposed feature
- **Use Case**: Why this feature would be useful
- **Implementation**: Any ideas for implementation
- **Alternatives**: Alternative solutions considered

### Issue Templates

```markdown
**Bug Report**

**Description:**
A clear description of what the bug is.

**Steps to Reproduce:**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior:**
A clear description of what you expected to happen.

**Screenshots:**
If applicable, add screenshots to help explain your problem.

**Environment:**
- Browser: [e.g. Chrome 91]
- OS: [e.g. macOS 12.0]
- Node.js: [e.g. 18.0.0]
```

## Development Guidelines

### Maya-29 Integration
- Always use authentic Maya-29 model parameters
- Maintain PNG format for LED wall compatibility
- Preserve 3:4 aspect ratio for displays
- Keep generation times realistic (~9-10 seconds)

### Performance Considerations
- Optimize image loading and display
- Minimize API calls and database queries
- Use proper caching strategies
- Monitor memory usage

### Security Best Practices
- Never commit API keys or secrets
- Validate all user inputs
- Use proper error handling
- Follow secure coding practices

### Testing
- Test image generation workflow
- Verify download functionality
- Test responsive design
- Check error handling

## Code Review Process

### What We Look For
- Code quality and readability
- Proper error handling
- Security considerations
- Performance implications
- Documentation updates

### Review Criteria
- Does the code follow project conventions?
- Are there adequate tests?
- Is documentation updated?
- Are breaking changes noted?

## Getting Help

### Community
- GitHub Discussions for questions
- Issues for bug reports
- Pull Requests for contributions

### Resources
- [React Documentation](https://reactjs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/)
- [Express.js Guide](https://expressjs.com/)

## Recognition

Contributors will be recognized in the project README and release notes. We appreciate all contributions, whether they're bug fixes, features, documentation, or suggestions!

## License

By contributing to Maya-29 Generator, you agree that your contributions will be licensed under the MIT License.