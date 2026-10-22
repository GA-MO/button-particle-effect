import { useRef, useState, type MouseEvent } from 'react'
import { burst } from '@/particle'

export function AddToCart() {
  const cartRef = useRef<HTMLSpanElement>(null)
  const [count, setCount] = useState(0)

  async function add(e: MouseEvent<HTMLButtonElement>) {
    const target = cartRef.current
    if (!target) return
    await burst(e.currentTarget, {
      outro: { kind: 'fly-to', target },
      ...(e.detail > 0 && { origin: { x: e.clientX, y: e.clientY } })
    })
    setCount((c) => c + 1)
  }

  return (
    <>
      <span ref={cartRef} aria-label={`Cart, ${count} items`}>
        🛒 {count}
      </span>
      <button type='button' onClick={add}>
        Add to cart
      </button>
    </>
  )
}
