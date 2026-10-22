import { useDust } from '@/particle/react'

export function UndoButton({ onUndo }: { onUndo: () => void }) {
  const ref = useDust<HTMLButtonElement>({ outro: { kind: 'reassemble' } })
  return (
    <button ref={ref} type='button' onClick={onUndo}>
      Undo
    </button>
  )
}
