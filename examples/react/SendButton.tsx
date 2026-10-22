import type { MouseEvent } from 'react'
import { burst } from '@/particle'

export function SendButton({ onSend }: { onSend: () => void }) {
  async function handleClick(e: MouseEvent<HTMLButtonElement>) {
    const fromPointer = e.detail > 0
    await burst(e.currentTarget, {
      outro: { kind: 'implode' },
      ...(fromPointer && { origin: { x: e.clientX, y: e.clientY } })
    })
    onSend()
  }

  return (
    <button type='button' onClick={handleClick}>
      Send
    </button>
  )
}
