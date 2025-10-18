# Project Guidelines for Claude Code

## Package Management

**Use Bun instead of npm**

This project uses [Bun](https://bun.sh) as the package manager and runtime. When installing packages or managing dependencies, always use `bun` commands:

- ✅ `bun install` - Install dependencies
- ✅ `bun add <package>` - Add a new package
- ✅ `bun remove <package>` - Remove a package
- ✅ `bun run <script>` - Run package.json scripts

- ❌ Do not use `npm install`
- ❌ Do not use `npm i`
- ❌ Do not use `yarn` or `pnpm`

## Reason

Bun is significantly faster than npm and provides better compatibility with Next.js and the project's dependencies.
