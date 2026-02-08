# Development Preferences & Best Practices

## Commit Messages

All commit messages must be written in **English**, prefixed by the change type, with a maximum of **12 words**.

### Prefixes

| Prefix     | Description                                      |
|------------|--------------------------------------------------|
| feat:      | New feature                                      |
| fix:       | Bug fix                                          |
| docs:      | Documentation changes                            |
| style:     | Formatting, semicolons (no code change)          |
| refactor:  | Code refactoring (no new feature or fix)         |
| test:      | Adding or fixing tests                           |
| chore:     | Build tasks, configs, maintenance                |

### Examples

- `feat: add job search scheduler with configurable intervals`
- `fix: resolve duplicate job entries on concurrent searches`
- `docs: update README with setup instructions`
- `style: format sidebar component with consistent spacing`
- `refactor: extract job card actions into reusable hook`
- `test: add unit tests for job search service`
- `chore: update dependencies and prisma schema`

## Code Standards

- **Language**: TypeScript (strict mode)
- **Self-documenting code**: No comments — code must be self-explanatory through clear naming
- **DRY**: Do not repeat yourself — extract shared logic into reusable functions and components
- **Naming conventions**:
  - `camelCase` for variables and functions
  - `PascalCase` for components and types
  - `UPPER_SNAKE_CASE` for constants
- **File structure**: Group by feature, not by type
- **Imports**: Use path aliases (`@/`) for all internal imports

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite via Prisma ORM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
