# Contributing Guidelines

## Code Style & Quality

### Before Committing

1. Run `npm run validate` to check for:
   - TypeScript errors
   - ESLint violations
   - Prettier formatting issues

2. Our automated git hooks will:
   - Format code with Prettier
   - Fix ESLint issues automatically
   - Prevent commits with TypeScript errors

### Code Conventions

#### Imports Sorting

Imports are automatically sorted in this order:

1. React/React Native
2. External packages
3. Internal modules (@/ imports)
4. Parent directories
5. Current directory
6. Style imports

#### Naming Conventions

- Components: PascalCase (e.g., `PropertyCard`)
- Files: kebab-case (e.g., `property-card.tsx`)
- Constants: UPPER_SNAKE_CASE
- Variables/Functions: camelCase
- Types/Interfaces: PascalCase with `I` prefix or `Type` suffix

#### React Components

- Use arrow functions for components
- Define props types with TypeScript interfaces
- Use React.memo for expensive components
- Extract complex logic into custom hooks
