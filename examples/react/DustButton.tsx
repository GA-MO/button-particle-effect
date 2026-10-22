'use client'

import type { ReactNode } from 'react'
import { useDust } from '@/particle/react'

export function DustButton({ children }: { children: ReactNode }) {
  const ref = useDust<HTMLButtonElement>({ outro: { kind: 'fade' }, direction: 'left' })
  return (
    <button ref={ref} type='button'>
      {children}
    </button>
  )
}
