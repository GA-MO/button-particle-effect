import { useEffect, useLayoutEffect, useRef } from 'react'
import { attach } from './index'
import type { BurstOptions } from './types'

/**
 * Returns a ref that plays `burst` on every click of the element it is attached to.
 * Options are read at click time, so passing a new object each render does not re-attach.
 */
export function useDust<T extends HTMLElement>(options: BurstOptions | (() => BurstOptions) = {}) {
  const ref = useRef<T>(null)
  const latest = useRef(options)
  useLayoutEffect(() => {
    latest.current = options
  })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    return attach(el, () => {
      const current = latest.current
      return typeof current === 'function' ? current() : current
    })
  }, [])
  return ref
}
