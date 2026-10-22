export type Direction = 'left' | 'right' | 'up' | 'down' | 'pointer'

export type Outro =
  | { kind: 'fade' }
  | { kind: 'reassemble' }
  | { kind: 'fly-to'; target: Element }
  | { kind: 'morph'; swap: (el: HTMLElement) => void | Promise<void> }
  | { kind: 'implode' }
  | { kind: 'vanish' }

export type OutroKind = Outro['kind']

export interface Physics {
  /** particles for a 200x56 button; scaled by area */
  count: number
  direction: Direction
  /** px/s */
  force: number
  curl: number
  /** 1/s */
  drag: number
  /** px/s², positive is down */
  gravity: number
  /** largest dot diameter in CSS px */
  size: number
  /** 0..1 share of soft, out-of-focus dots */
  blur: number
  /** ms the dust floats before it fades or returns */
  life: number
  /** ms for the dissolve front to cross the element */
  dissolve: number
  /** ms for dust to travel back */
  return: number
}

export interface BurstOptions extends Partial<Physics> {
  outro?: Outro
  /** client coordinates; used by direction 'pointer', defaults to the element center */
  origin?: { x: number; y: number }
  /** CSS color; defaults to the element's background, then border, then text color */
  color?: string
}

export interface BurstResult {
  el: HTMLElement
  /** false when the effect was skipped (reduced motion, no WebGL2, context lost) */
  played: boolean
}
