# COBIP Frontend

Next.js 16, TypeScript, App Router, `src` 디렉터리 구조, Tailwind CSS v4 기반으로 초기 세팅된 프론트엔드 워크스페이스입니다.

## Stack

- Next.js 16.2.3
- React 19
- TypeScript 5
- Tailwind CSS 4
- App Router
- `src` directory
- pnpm

## Scripts

```bash
pnpm dev
pnpm lint
pnpm lint:convention
pnpm check
pnpm typecheck
pnpm build
pnpm build:standalone
```

## Directory

```text
src/
  app/
  components/
```

## Naming Convention

### Variables and Functions

- Camel Case
- Example: `const userData = ...`
- Example: `const fetchTemplates = () => ...`
- Variable names should be nouns.
- Function names should start with verbs such as `fetch`, `handle`, `create`, `update`, or `is`.

### Components and Files

- Pascal Case
- Example: `TemplateCard.tsx`
- Example: `interface UserProfile { ... }`

### Folders

- Kebab Case
- Example: `components/editor-view`
- Example: `pages/market-detail`

## Convention Lint

- `pnpm lint`: ESLint + TypeScript naming rules
- `pnpm lint:convention`: file and folder naming validation
- Next.js reserved files such as `page.tsx`, `layout.tsx`, and dynamic route folders such as `[id]` are treated as allowed exceptions

## CI/CD

- `CI`: pull request and branch push validation with lint, convention lint, typecheck, and production build
- `CD`: push to `main` or manual run builds a standalone artifact with GitHub Actions
- The current CD baseline publishes a deployable artifact. Platform-specific deploy steps can be added later without changing the app structure.
