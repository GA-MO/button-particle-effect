# React + TypeScript + Vite

## 📝 Documentation

- [Naming Conventions](./docs/naming-conventions.md)
- [React TypeScript Best Practices](./docs/react-typescript-best-practices.md)
- [API Integration](./docs/api-integration.md)

## 📑 Table of Contents

- [Libraries](#-libraries)
- [Requirements](#-requirements)
- [VS Code Extensions](#-vs-code-extensions)
- [Installation](#-installation)
- [Run Dev Server](#-run-dev-server)
- [Run Test](#-run-test)
- [Run Lint](#-run-lint)
- [Run Build](#-run-build)
- [Docker Build](#-docker-build)
- [Documentation](#-documentation)

### 📚 Libraries

- [Mantine UI](https://mantine.dev/)
  - [Hooks](https://mantine.dev/hooks/package/)
  - [Components](https://mantine.dev/core/package/)
  - [Forms](https://mantine.dev/form/package/)
  - [Notifications](https://mantine.dev/x/notifications/)
  - [Modals](https://mantine.dev/x/modals/)
  - [Dates](https://mantine.dev/dates/getting-started/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [Typescript Cookie](https://github.com/js-cookie/js.cookie)
- [Vitest](https://vitest.dev/)

### ⚙️ Requirements

- [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/)

### 📦 VS Code Extensions

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

### 🚀 Installation

```sh
bun install
```

### 💻 Run Dev Server

Run the development server with hot reload.

```sh
bun run dev
```

### 🧪 Run Test

```sh
bun run test
bun run test:watch
bun run test:coverage
```

### 🔍 Run Lint

```sh
bun run lint
```

### 🏗️ Run Build

```sh
bun run build
bun run build:dev
bun run build:staging
bun run build:prod
```

### 🐳 Docker Build

```sh

## BUILD_ENV
#  - uat,prd

docker build -t app-name --build-arg BUILD_ENV=uat .

```
