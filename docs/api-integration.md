# API Integration Guide

This guide explains how to integrate with APIs using our template's built-in utilities for type safety, data fetching, and mockup handling.

## Table of Contents

1. [Folder Structure](#folder-structure)
2. [Type Definitions](#type-definitions)
3. [API Services](#api-services)
4. [Query Hooks](#query-hooks)
5. [Mockup JSON](#mockup-json)
6. [Usage Examples](#usage-examples)

## Folder Structure

Here's the recommended folder structure for implementing API features:

```
src/
├── datas/
│   └── userProfile/
│       ├── types.ts      # Type definitions
│       ├── services.ts   # API service functions
│       └── hooks.ts      # React Query hooks
└── libs/
    └── createFetcher.ts  # Fetch utility

public/
└── apiMockup/
    └── userProfile/
        ├── list.json     # GET response mockup
        └── create.json   # POST response mockup
```

## Type Definitions

Type definitions should be created in a `types.ts` file within your feature's data directory. Here's an example:

```typescript
// src/datas/userProfile/types.ts

export interface IUserProfile {
  id: number
  name: string
  email: string
  isActive: boolean
}

export interface IRequestUserList {
  limit: number
  page: number
  searchTerm?: string
}

export type UserRole = 'admin' | 'user' | 'guest'
```

## API Services

API services should be defined in a `services.ts` file. We use the `createFetcher` utility which provides:

- Type safety
- Mockup JSON support
- Request delay simulation
- Error handling

Example:

```typescript
// src/datas/userProfile/services.ts
import type { IUserProfile, IRequestUserList } from './types'
import createFetcher from '../../libs/createFetcher'
import type { IBaseResponse } from '../../types/response'

// GET request example
export function fetchUserList(params: IRequestUserList) {
  return createFetcher<IBaseResponse<IUserProfile[]>>({
    url: '/api/user-profile/list',
    jsonMockup: '/apiMockup/userProfile/list.json',
    params
  })
}

// POST request example
export function fetchCreateUser(body: IUserProfile) {
  return createFetcher<IBaseResponse<IUserProfile>>({
    method: 'POST',
    url: '/api/user-profile/create',
    jsonMockup: '/apiMockup/userProfile/create.json',
    data: body
  })
}
```

## Query Hooks

Query hooks should be defined in a `hooks.ts` file. These hooks encapsulate React Query logic and provide a clean interface for components.

```typescript
// src/datas/userProfile/hooks.ts
import { useMutation, useQuery } from '@tanstack/react-query'
import { getQueryClient } from '../../libs/reactQuery'
import { fetchUserList, fetchCreateUser } from './services'
import type { IRequestUserList, IUserProfile } from './types'

// Query hook for fetching list
export function useUserList(params: IRequestUserList) {
  return useQuery({
    queryKey: ['userList', params],
    queryFn: () => fetchUserList(params),
    select: (data) => data.data
  })
}

// Mutation hook for creating users
export function useCreateUser() {
  return useMutation({
    mutationFn: fetchCreateUser,
    onSuccess: () => {
      // Invalidate and refetch the list query
      getQueryClient().invalidateQueries({ queryKey: ['userList'] })
    }
  })
}

// Optional: Hook with additional options
export function useUserListWithOptions(params: IRequestUserList) {
  return useQuery({
    queryKey: ['userList', params],
    queryFn: () => fetchUserList(params),
    select: (data) => data.data,
    // Additional options
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Cache kept for 30 minutes
    retry: 3, // Retry failed requests 3 times
    refetchOnWindowFocus: false // Disable refetch on window focus
  })
}
```

## Mockup JSON

Mockup JSON files should be placed in the `public/apiMockup` directory, mirroring your API structure. These files are used during development and testing.

Example structure:

```json
// public/apiMockup/userProfile/list.json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "isActive": true
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "isActive": true
    }
  ]
}
```

## Usage Examples

### Using Query Hooks in Components

```tsx
// src/components/UserProfile/UserProfileList.tsx
import { useUserList, useCreateUser } from '@/datas/userProfile/hooks'
import type { IUserProfile } from '@/datas/userProfile/types'

interface IUserProfileListProps {
  initialLimit: number
}

export function UserProfileList({ initialLimit }: IUserProfileListProps) {
  // Using the query hook
  const {
    data: userList,
    isLoading,
    error
  } = useUserList({
    limit: initialLimit,
    page: 1
  })

  // Using the mutation hook
  const { mutate: createUser, isLoading: isCreating } = useCreateUser()

  const handleCreateUser = () => {
    const newUser: IUserProfile = {
      id: Date.now(),
      name: 'New User',
      email: 'new@example.com',
      isActive: true
    }
    createUser(newUser)
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading data</div>

  return (
    <div className='user-profile-list'>
      {userList?.map((user) => (
        <div key={user.id} className='user-profile-item'>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      ))}
      <button onClick={handleCreateUser} disabled={isCreating} className='create-user-button'>
        {isCreating ? 'Creating...' : 'Create New User'}
      </button>
    </div>
  )
}
```

## Best Practices

1. **Type Safety**

   - Always define types for your request parameters and response data
   - Use TypeScript's type inference to catch errors at compile time
   - Follow interface naming conventions (prefix with 'I')

2. **Mockup Data**

   - Keep mockup data realistic and representative of real API responses
   - Update mockup data when API response structure changes
   - Use consistent naming in mockup files

3. **Error Handling**

   - Always handle API errors appropriately
   - Use try-catch blocks or error boundaries
   - Consider implementing retry logic for failed requests

4. **Performance**

   - Use appropriate caching strategies
   - Implement pagination for large data sets
   - Consider implementing request debouncing for search inputs

5. **Testing**

   - Write unit tests for your API services
   - Test error scenarios
   - Verify type safety in your tests

6. **Query Hooks**

   - Keep hooks focused and single-purpose
   - Use appropriate query keys for caching
   - Implement proper cache invalidation
   - Consider using select for data transformation
   - Add appropriate staleTime and cacheTime settings

7. **Naming Conventions**
   - Use PascalCase for component and type names
   - Use camelCase for variables, functions, and file names
   - Use kebab-case for CSS class names
   - Use descriptive, self-documenting names
   - Prefix boolean variables with is, has, should
