# Contributing to GoogLetter

Thank you for your interest in contributing to GoogLetter! We welcome contributions from the community.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/newsletter.git
   cd newsletter
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables** (see README.md)
5. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing code style and formatting
- Use meaningful variable and function names
- Add comments for complex logic

### Commit Messages
Follow conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

Example: `feat: add email scheduling functionality`

### Pull Request Process
1. **Update documentation** if needed
2. **Test your changes** thoroughly
3. **Run linting**: `npm run lint`
4. **Build the project**: `npm run build`
5. **Create a pull request** with:
   - Clear title and description
   - Reference any related issues
   - Screenshots for UI changes

## 🐛 Bug Reports

When filing a bug report, please include:
- **Description** of the issue
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Environment details** (OS, browser, Node.js version)
- **Screenshots** if applicable

## 💡 Feature Requests

For feature requests, please:
- **Check existing issues** first
- **Describe the feature** clearly
- **Explain the use case**
- **Consider implementation** if possible

## 🔧 Development Setup

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Supabase account
- Google Cloud Console project

### Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Running Tests
```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build project
npm run build
```

## 📚 Project Structure

- `src/app/` - Next.js App Router pages
- `src/components/` - Reusable UI components
- `src/lib/` - Utility functions and configurations
- `src/types/` - TypeScript type definitions
- `src/contexts/` - React contexts

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the project's coding standards

## 📞 Questions?

- Open an issue for bugs or feature requests
- Start a discussion for general questions
- Check existing issues and discussions first

Thank you for contributing to GoogLetter! 🎉
