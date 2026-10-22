import { useState } from 'react'
import { burst } from '@/particle'

export function TodoList({ initial }: { initial: string[] }) {
  const [items, setItems] = useState(initial)

  async function remove(row: HTMLElement, item: string) {
    await burst(row, { outro: { kind: 'vanish' } })
    setItems((list) => list.filter((i) => i !== item))
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item}>
          {item}
          <button
            type='button'
            onClick={(e) => {
              const row = e.currentTarget.closest('li')
              if (row) void remove(row, item)
            }}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  )
}
