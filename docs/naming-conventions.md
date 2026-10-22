# React Naming Conventions

This document outlines the naming conventions used in our React project to maintain consistency and readability across the codebase.

## Table of Contents

- 🧩 [Components](#-components)
- 📁 [Files and Folders](#-files-and-folders)
- 🔤 [Variables and Functions](#-variables-and-functions)
- 🔒 [Constants](#-constants)
- 🎨 [CSS/SCSS](#-cssscss)
- 📝 [TypeScript Types and Interfaces](#-typescript-types-and-interfaces)

## 🧩 Components

- Use PascalCase for component names
- Use descriptive, self-documenting names
- Prefix context providers with the context name followed by "Provider"

```ts
// Good
function UserProfile() { ... }
function ThemeProvider() { ... }

// Bad
function userProfile() { ... }
function authentication() { ... }
```

```tsx
type UserProfileProps = {
  name: string
  age: number
  isAdmin: boolean
}

function UserProfile(props: UserProfileProps) {
  return (
    <div>
      <p>Name: {props.name}</p>
      <p>Age: {props.age}</p>
      <p>Is Admin: {props.isAdmin ? 'Yes' : 'No'}</p>
    </div>
  )
}
```

## 📁 Files and Folders

- Use PascalCase for component files
- Use camelCase for non-component files
- Group related components in feature folders
- Use index.ts files for clean exports

```
src/
  components/
    Button/
      index.tsx
      Button.test.tsx
    UserProfile/
      UserRole.tsx
      index.tsx
      UserProfile.test.tsx
      types.ts
  hooks/
    useAuth.ts
    useWindowSize.ts
    useLocalStorage.ts
  utils/
    dateFormatter.ts
    stringUtils.ts
    validationUtils.ts
  services/
    apiClient.ts
    authService.ts
  types/
    common.types.ts
    api.types.ts
  constants/
    routes.ts
    config.ts
```

## 🔤 Variables and Functions

- Use camelCase for variables and functions
- Use descriptive names that indicate purpose
- Prefix boolean variables with `is`, `has`, `should`.
- Use verbs for function names

```tsx
// Good
const [isLoading, setIsLoading] = useState(false);
const handleSubmit = () => { ... }
const fetchUserData = async () => { ... }
const isAdmin = true;
const isActive = true;
const shouldShowHeader = true;
const hasAdminRole = true;

// Bad
const [loading, setLoading] = useState(false);
const submit = () => { ... }
const onSubmit = () => { ... }
const userData = async () => { ... }
const admin = true;
const active = true;
const showHeader = true;
```

## 🔒 Constants

- Use UPPER_SNAKE_CASE for constant values
- Group related constants in objects
- Use descriptive names

```tsx
// Good
const API_ENDPOINTS = {
  USERS: '/api/users',
  AUTH: '/api/auth'
};

const MAX_RETRY_ATTEMPTS = 3;

// Bad
const apiEndpoints = { ... }
const maxRetry = 3;
```

## 🎨 CSS/SCSS

- Use kebab-case for class names
- Use meaningful, semantic names

```scss
// Good
.user-profile {
  &.active { ... }
  > .header { ... }
  > .content { ... }
}

// Bad
.userProfile { ... }
.header { ... }
.active { ... }
```

## 📝 TypeScript Types and Interfaces

- Use PascalCase for type and interface names
- Prefix interfaces with "I" (optional)
- Use descriptive names that indicate purpose
- Use type for simple types, interface for complex objects

```ts
// Good
interface IUserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

type UserRole = 'admin' | 'user' | 'guest';

// Bad
interface userProfile { ... }
type userRole = string;
```

## ⭐ Best Practices

1. **Be Consistent**: Follow these conventions consistently across the project
2. **Be Descriptive**: Names should clearly indicate purpose and functionality
3. **Be Concise**: Avoid unnecessarily long names while maintaining clarity
4. **Follow Conventions**: Stick to established patterns in the React ecosystem
5. **Document Exceptions**: If you need to break a convention, document why

Remember that these conventions are guidelines to help maintain a clean and consistent codebase. When in doubt, prioritize clarity and readability over strict adherence to conventions.
