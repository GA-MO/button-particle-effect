# React TypeScript Best Practices

This guide outlines the best practices for writing clean, maintainable, and type-safe React TypeScript code in our project.

## Table of Contents

- 🏗️ [Component Structure](#️-component-structure)
- 🎯 [Props and State](#-props-and-state)
- 🪝 [Hooks Best Practices](#-hooks-best-practices)
- 🔍 [Type Definitions](#-type-definitions)
- 🚀 [Performance Optimization](#-performance-optimization)
- 🧪 [Testing](#-testing)
- 📦 [Import/Export](#-importexport)
- ⚠️ [Avoid Type Any](#️-avoid-type-any)
- 🔀 [Type vs Interface](#-type-vs-interface)

## 🏗️ Component Structure

### Functional Components with TypeScript

Always prefer functional components with explicit TypeScript typing:

```tsx
// Good
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  onClick?: () => void
}

export function Button({ children, variant = 'primary', disabled = false, onClick }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}

// Bad - No explicit props interface
export function Button(props: any) {
  return <button {...props} />
}
```

### Component Props Interface

- Always define props interfaces separately, never inline
- Define props interfaces above the component
- Use descriptive names
- Make optional props explicit with `?`
- Include JSDoc comments for complex props

```tsx
// Good - Separate interface definition
interface UserCardProps {
  /** User data object */
  user: IUser
  /** Whether to show extended user details */
  showDetails?: boolean
  /** Callback fired when user card is clicked */
  onUserClick?: (userId: string) => void
  /** Additional CSS classes */
  className?: string
}

export function UserCard({ user, showDetails = false, onUserClick, className }: UserCardProps) {
  // Component implementation
}

// Bad - Inline props interface
export function UserCard({
  user,
  showDetails = false,
  onUserClick,
  className
}: {
  user: IUser
  showDetails?: boolean
  onUserClick?: (userId: string) => void
  className?: string
}) {
  // Component implementation
}
```

### Return Type Annotations

For complex components, consider explicit return type annotations:

```tsx
// For simple components, return type can be inferred
interface SimpleButtonProps {
  children: React.ReactNode
}

export function SimpleButton({ children }: SimpleButtonProps) {
  return <button>{children}</button>
}

// For complex components with conditional rendering
interface ComplexComponentProps {
  condition: boolean
}

export function ComplexComponent({ condition }: ComplexComponentProps): JSX.Element | null {
  if (!condition) return null

  return <div>Complex content here</div>
}
```

## 🎯 Props and State

### State Management with TypeScript

Use proper typing for state variables:

```tsx
interface User {
  id: string
  name: string
  email: string
}

export function UserManager() {
  // Explicit typing for complex state
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Type can be inferred for simple state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  return (
    // Component JSX
  )
}
```

### Default Props Pattern

Use default parameters instead of `defaultProps`:

```tsx
// Good
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'small' | 'medium' | 'large'
}

export function Button({ variant = 'primary', size = 'medium', ...props }: ButtonProps) {
  return <button className={`btn-${variant} btn-${size}`} {...props} />
}

// Avoid
Button.defaultProps = {
  variant: 'primary',
  size: 'medium'
}
```

### Event Handlers

Type event handlers properly:

```tsx
interface FormProps {
  onSubmit: (data: FormData) => void
}

export function Form({ onSubmit }: FormProps) {
  const [value, setValue] = useState('')

  // Explicit event typing
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
  }

  // Form submit handler
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(new FormData(event.currentTarget))
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={value} onChange={handleInputChange} />
      <button type='submit'>Submit</button>
    </form>
  )
}
```

## 🪝 Hooks Best Practices

### Custom Hooks Typing

Always type custom hooks properly:

```tsx
interface UseApiReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Generic custom hook
export function useApi<T>(url: string): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(url)
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
```

### useEffect Dependencies

Be explicit about dependencies and their types:

```tsx
interface UserProfileProps {
  userId: string
}

export function UserProfile({ userId }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null)

  // Dependencies typed properly
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUserById(userId)
      setUser(userData)
    }

    fetchUser()
  }, [userId]) // Dependency array is explicit

  return user ? <div>{user.name}</div> : <div>Loading...</div>
}
```

### Ref Typing

Type refs correctly for DOM elements:

```tsx
export function FocusableInput() {
  // Specific DOM element typing
  const inputRef = useRef<HTMLInputElement>(null)

  const focusInput = () => {
    // TypeScript knows this is an input element
    inputRef.current?.focus()
  }

  return (
    <div>
      <input ref={inputRef} type='text' />
      <button onClick={focusInput}>Focus Input</button>
    </div>
  )
}
```

## 🔍 Type Definitions

### Union Types for Props

Use union types for limited options:

```tsx
interface AlertProps {
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
  dismissible?: boolean
}

export function Alert({ type, message, dismissible = true }: AlertProps) {
  return (
    <div className={`alert alert-${type}`}>
      {message}
      {dismissible && <button onClick={() => {}}>×</button>}
    </div>
  )
}
```

### Generic Components

Create reusable generic components:

```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string | number
  emptyMessage?: string
}

export function List<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = 'No items found'
}: ListProps<T>) {
  if (items.length === 0) {
    return <div className='empty-state'>{emptyMessage}</div>
  }

  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>{renderItem(item, index)}</li>
      ))}
    </ul>
  )
}

// Usage
;<List
  items={users}
  renderItem={(user) => <UserCard user={user} />}
  keyExtractor={(user) => user.id}
  emptyMessage='No users available'
/>
```

### Utility Types

Leverage TypeScript utility types:

```tsx
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
  createdAt: Date
}

// Create form types from existing interfaces
type UserFormData = Omit<User, 'id' | 'createdAt'>
type UserUpdateData = Partial<Pick<User, 'name' | 'email'>>

interface UserFormProps {
  initialData?: UserFormData
  onSubmit: (data: UserFormData) => void
}

export function UserForm({ initialData, onSubmit }: UserFormProps) {
  // Form implementation
}
```

## 🚀 Performance Optimization

### React.memo with TypeScript

Use React.memo for expensive components:

```tsx
interface ExpensiveComponentProps {
  data: ComplexData[]
  onItemClick: (id: string) => void
}

export const ExpensiveComponent = React.memo<ExpensiveComponentProps>(({ data, onItemClick }) => {
  return (
    <div>
      {data.map((item) => (
        <div key={item.id} onClick={() => onItemClick(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  )
})

ExpensiveComponent.displayName = 'ExpensiveComponent'
```

### useCallback and useMemo

Type callback functions properly:

```tsx
interface SearchableListProps {
  items: Item[]
  onItemSelect: (item: Item) => void
}

export function SearchableList({ items, onItemSelect }: SearchableListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Memoized filtered results
  const filteredItems = useMemo(() => {
    return items.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [items, searchTerm])

  // Stable callback reference
  const handleItemClick = useCallback(
    (item: Item) => {
      onItemSelect(item)
    },
    [onItemSelect]
  )

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder='Search items...'
      />
      {filteredItems.map((item) => (
        <div key={item.id} onClick={() => handleItemClick(item)}>
          {item.name}
        </div>
      ))}
    </div>
  )
}
```

## 🧪 Testing

### Component Testing with TypeScript

Type your test props and mocks:

```tsx
// Component test with proper typing
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

interface MockButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

describe('Button Component', () => {
  const defaultProps: MockButtonProps = {
    children: 'Click me'
  }

  it('renders with correct text', () => {
    render(<Button {...defaultProps} />)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const mockOnClick = jest.fn()
    render(<Button {...defaultProps} onClick={mockOnClick} />)

    fireEvent.click(screen.getByText('Click me'))
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })
})
```

### Hook Testing

Test custom hooks with proper typing:

```tsx
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter())
    expect(result.current.count).toBe(0)
  })

  it('increments count', () => {
    const { result } = renderHook(() => useCounter())

    act(() => {
      result.current.increment()
    })

    expect(result.current.count).toBe(1)
  })
})
```

## 📦 Import/Export

### Consistent Import Patterns

Use consistent import/export patterns:

```tsx
// Named exports for multiple items
export { Button } from './Button'
export { Input } from './Input'
export { Form } from './Form'

// Re-export types
export type { ButtonProps } from './Button'
export type { InputProps } from './Input'
export type { FormProps } from './Form'

// Index file for clean imports
// components/index.ts
export * from './Button'
export * from './Input'
export * from './Form'

// Usage in other files
import { Button, Input, Form } from '@/components'
import type { ButtonProps } from '@/components'
```

### Type-only Imports

Use type-only imports when importing only types:

```tsx
import type { User } from '@/types/user'
import type { ApiResponse } from '@/types/api'
import { fetchUser } from '@/services/userService'

interface UserProfileProps {
  user: User
}

export function UserProfile({ user }: UserProfileProps) {
  // Component implementation
}
```

## ⚠️ Avoid Type Any

The `any` type defeats the purpose of using TypeScript by disabling all type checking. Always strive for proper typing instead of falling back to `any`.

### Why Avoid `any`?

- **Loses type safety** - No compile-time error checking
- **No IntelliSense** - IDE cannot provide proper autocompletion
- **Runtime errors** - Type-related bugs can slip through to production
- **Poor maintainability** - Makes refactoring dangerous and difficult

### Common Scenarios and Better Alternatives

#### API Responses

```tsx
// Bad - Using any for API responses
interface BadApiResponse {
  data: any
  status: number
}

// Good - Properly typed API responses
interface User {
  id: string
  name: string
  email: string
}

interface ApiResponse<T> {
  data: T
  status: number
  message: string
}

// Usage
const userResponse: ApiResponse<User[]> = await fetchUsers()
```

#### Event Handlers

```tsx
// Bad - Using any for events
const handleSubmit = (event: any) => {
  event.preventDefault()
  // TypeScript can't help with event properties
}

// Good - Proper event typing
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  // TypeScript knows exactly what properties are available
  const formData = new FormData(event.currentTarget)
}

const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value) // Full type safety
}
```

#### Third-party Libraries

```tsx
// Bad - Using any for third-party library
const thirdPartyResult: any = someLibraryFunction()

// Good - Create proper types or use existing ones
interface LibraryResult {
  success: boolean
  data: string[]
  error?: string
}

const thirdPartyResult: LibraryResult = someLibraryFunction()

// Or use utility types if structure is unknown
const thirdPartyResult: Record<string, unknown> = someLibraryFunction()
```

#### Dynamic Object Properties

```tsx
// Bad - Using any for dynamic objects
const dynamicObject: any = {}
dynamicObject.someProperty = 'value' // No type checking

// Good - Use index signatures or Record utility type
interface DynamicObject {
  [key: string]: string | number | boolean
}

const dynamicObject: DynamicObject = {}
dynamicObject.someProperty = 'value' // Type checked

// Or use Record utility type
const dynamicObject: Record<string, string> = {}
dynamicObject.someProperty = 'value'
```

### Better Alternatives to `any`

#### Use `unknown` for Truly Unknown Types

```tsx
// When you truly don't know the type, use unknown instead of any
const parseJsonSafely = (jsonString: string): unknown => {
  try {
    return JSON.parse(jsonString)
  } catch {
    return null
  }
}

// Then use type guards to safely work with the data
const result = parseJsonSafely(someJson)
if (typeof result === 'object' && result !== null && 'name' in result) {
  // TypeScript now knows result has a 'name' property
  console.log((result as { name: string }).name)
}
```

#### Use Type Guards for Runtime Type Checking

```tsx
// Create type guard functions
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'email' in obj &&
    typeof (obj as User).id === 'string' &&
    typeof (obj as User).name === 'string' &&
    typeof (obj as User).email === 'string'
  )
}

// Use the type guard
const handleApiResponse = (response: unknown) => {
  if (isUser(response)) {
    // TypeScript knows response is User type here
    console.log(response.name) // Safe to access
  }
}
```

#### Use Utility Types for Flexibility

```tsx
// Partial for optional properties
interface UpdateUserProps {
  userId: string
  updates: Partial<User> // Some properties of User, all optional
}

// Pick for selecting specific properties
interface UserSummary {
  summary: Pick<User, 'id' | 'name'> // Only id and name from User
}

// Omit for excluding properties
interface CreateUserProps {
  userData: Omit<User, 'id'> // User without id property
}
```

## 🔀 Type vs Interface

Understanding when to use `type` vs `interface` is crucial for writing clean, maintainable TypeScript code. Both can define object shapes, but they have different capabilities and use cases.

### General Rule of Thumb

- **Use `interface`** for object shapes that might be extended or implemented
- **Use `type`** for unions, primitives, computed types, and complex type operations

### When to Use Interface

#### Object Shapes and Component Props

```tsx
// Good - Use interface for component props
interface ButtonProps {
  children: React.ReactNode
  variant: 'primary' | 'secondary'
  disabled?: boolean
  onClick?: () => void
}

export function Button(props: ButtonProps) {
  // Component implementation
}
```

#### Extending and Declaration Merging

```tsx
// Interface can be extended
interface BaseProps {
  id: string
  className?: string
}

interface ButtonProps extends BaseProps {
  variant: 'primary' | 'secondary'
  onClick: () => void
}

// Interface supports declaration merging (same name can be declared multiple times)
interface UserConfig {
  name: string
}

interface UserConfig {
  email: string
}

// Result: UserConfig has both name and email
const config: UserConfig = {
  name: 'John',
  email: 'john@example.com'
}
```

#### Class Implementation

```tsx
interface Clickable {
  onClick: () => void
}

interface Hoverable {
  onHover: () => void
}

// Classes can implement interfaces
class Button implements Clickable, Hoverable {
  onClick() {
    console.log('clicked')
  }

  onHover() {
    console.log('hovered')
  }
}
```

### When to Use Type

#### Union Types

```tsx
// Good - Use type for unions
type Status = 'loading' | 'success' | 'error'
type Theme = 'light' | 'dark' | 'auto'
type Size = 'small' | 'medium' | 'large'

interface ComponentProps {
  status: Status
  theme: Theme
  size: Size
}
```

#### Computed/Mapped Types

```tsx
// Use type for computed types
type Keys = 'name' | 'email' | 'age'
type UserRecord = Record<Keys, string>

// Mapped types
type Partial<T> = {
  [P in keyof T]?: T[P]
}

type OptionalUser = Partial<User>
```

#### Function Types

```tsx
// Good - Use type for function signatures
type EventHandler<T> = (event: T) => void
type AsyncFunction<T, R> = (params: T) => Promise<R>

// Usage
const handleClick: EventHandler<React.MouseEvent> = (event) => {
  event.preventDefault()
}

const fetchUser: AsyncFunction<string, User> = async (id) => {
  // Implementation
  return user
}
```

#### Complex Type Operations

```tsx
// Use type for complex operations
type NonNullable<T> = T extends null | undefined ? never : T
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any

// Conditional types
type ApiResponse<T> = T extends string ? { message: T } : { data: T }
```

### Practical Examples in React

#### Component Props Pattern

```tsx
// Use interface for props - they might be extended
interface BaseInputProps {
  label: string
  error?: string
  disabled?: boolean
}

interface TextInputProps extends BaseInputProps {
  type: 'text' | 'email' | 'password'
  placeholder?: string
}

interface SelectInputProps extends BaseInputProps {
  options: Array<{ value: string; label: string }>
  multiple?: boolean
}

// Use type for unions and variants
type InputVariant = 'outlined' | 'filled' | 'standard'
type InputSize = 'small' | 'medium' | 'large'
```

#### Hook Return Types

```tsx
// Use type for hook return types (they're usually not extended)
type UseApiReturn<T> = {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useApi<T>(url: string): UseApiReturn<T> {
  // Hook implementation
}

// Alternative: interface is also fine for this case
interface UseToggleReturn {
  isOn: boolean
  toggle: () => void
  turnOn: () => void
  turnOff: () => void
}

export function useToggle(initialValue = false): UseToggleReturn {
  // Hook implementation
}
```

#### Event Handler Types

```tsx
// Use type for event handlers
type ChangeHandler = (value: string) => void
type SubmitHandler<T> = (data: T) => void | Promise<void>

interface FormProps<T> {
  initialValues: T
  onSubmit: SubmitHandler<T>
  onChange?: ChangeHandler
}
```

### Migration and Compatibility

#### Converting Between Type and Interface

```tsx
// These are functionally equivalent for simple object shapes
interface UserInterface {
  name: string
  email: string
}

type UserType = {
  name: string
  email: string
}

// Both can be used the same way
const user1: UserInterface = { name: 'John', email: 'john@example.com' }
const user2: UserType = { name: 'Jane', email: 'jane@example.com' }
```

#### When You Need to Convert

```tsx
// Convert interface to type when you need union operations
interface BaseUser {
  id: string
  name: string
}

// This won't work with interface
// interface AdminUser = BaseUser | { role: 'admin' }

// Convert to type for unions
type BaseUserType = {
  id: string
  name: string
}

type AdminUser = BaseUserType | { role: 'admin' }
```

### Best Practices Summary

1. **Default to `interface`** for object shapes and component props
2. **Use `type`** for unions, computed types, and type operations
3. **Be consistent** within the same codebase/feature
4. **Consider future extensibility** - if the shape might be extended, prefer `interface`
5. **Use `type` for function signatures** and complex type manipulations

### Common Patterns

```tsx
// ✅ Good patterns
interface ComponentProps {
  children: React.ReactNode
}

type Status = 'idle' | 'loading' | 'success' | 'error'
type Handler<T> = (value: T) => void

// ✅ Also good - consistency matters more than the choice
type ComponentProps = {
  children: React.ReactNode
}

interface Status {
  current: 'idle' | 'loading' | 'success' | 'error'
}

// ❌ Avoid mixing unnecessarily
interface SomeProps extends BaseProps {
  status: StatusType // mixing interface extending with type
}
```

## ⭐ Summary

1. **Avoid Type Any**: Use proper typing alternatives like `unknown`, type guards, and utility types
2. **Choose Type vs Interface Wisely**: Use `interface` for object shapes and extensibility, `type` for unions and computations
3. **Always Type Props**: Define explicit interfaces for all component props
4. **Use Proper State Typing**: Be explicit with complex state types
5. **Type Event Handlers**: Use proper React event types
6. **Leverage Generic Components**: Create reusable components with generics
7. **Optimize Performance**: Use React.memo, useCallback, and useMemo with proper typing
8. **Test with Types**: Include proper typing in your tests
9. **Consistent Imports**: Use type-only imports when appropriate

Remember: TypeScript is your friend for catching errors early and making your code more maintainable. Embrace strict typing for better developer experience and fewer bugs in production.
