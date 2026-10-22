import { getRenderer, onContextLost, STRIDE } from './renderer'
import { createRun, DEFAULTS, type Run } from './run'
import type { BurstOptions, BurstResult } from './types'

export type { BurstOptions, BurstResult, Direction, Outro, OutroKind, Physics } from './types'
export { DEFAULTS }

const active = new Map<HTMLElement, { run: Run; result: Promise<BurstResult> }>()
const skipping = new Map<HTMLElement, Promise<BurstResult>>()
let frame = 0
let last = 0
let buffer = new Float32Array(0)

onContextLost(() => {
  for (const { run } of [...active.values()]) run.finishNow()
})

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Dissolves `el` into dust on a shared overlay canvas, then plays `options.outro`.
 * Calling again while a burst is playing on the same element returns the running promise.
 */
export function burst(el: HTMLElement, options: BurstOptions = {}): Promise<BurstResult> {
  const playing = active.get(el)?.result ?? skipping.get(el)
  if (playing) return playing

  const { width, height } = el.getBoundingClientRect()
  const renderer = reducedMotion() || width * height === 0 ? null : getRenderer()
  if (!renderer) {
    const result = skip(el, options).finally(() => skipping.delete(el))
    skipping.set(el, result)
    return result
  }

  const run = createRun(el, options, () => active.delete(el))
  const result = run.done.then((played) => ({ el, played }))
  active.set(el, { run, result })
  if (!frame) {
    last = performance.now()
    frame = requestAnimationFrame(tick)
  }
  return result
}

async function skip(el: HTMLElement, options: BurstOptions): Promise<BurstResult> {
  const outro = options.outro
  if (outro?.kind === 'morph') {
    try {
      await outro.swap(el)
    } catch (error) {
      reportError(error)
    }
  }
  if (outro?.kind === 'vanish') {
    el.style.setProperty('mask-image', 'linear-gradient(transparent, transparent)')
    el.style.setProperty('-webkit-mask-image', 'linear-gradient(transparent, transparent)')
  }
  return { el, played: false }
}

function tick(now: number) {
  const dt = Math.max(0, Math.min(now - last, 50))
  last = now
  const renderer = getRenderer()
  let total = 0
  for (const { run } of active.values()) total += run.capacity
  if (buffer.length < total * STRIDE) buffer = new Float32Array(total * STRIDE * 1.5)

  let count = 0
  for (const { run } of [...active.values()]) {
    if (run.step(dt)) count += run.write(buffer, count)
  }
  renderer?.draw(buffer, count)

  frame = active.size ? requestAnimationFrame(tick) : 0
  if (!frame) renderer?.clear()
}

/**
 * Plays `burst` on every click (pointer or keyboard). The pointer position becomes the
 * origin for direction 'pointer'. Returns a cleanup that removes the listener.
 */
export function attach(
  el: HTMLElement,
  options: BurstOptions | (() => BurstOptions) = {}
): () => void {
  const onClick = (e: MouseEvent) => {
    const opts = typeof options === 'function' ? options() : options
    const fromPointer = e.detail > 0
    void burst(el, fromPointer ? { origin: { x: e.clientX, y: e.clientY }, ...opts } : opts)
  }
  el.addEventListener('click', onClick)
  return () => el.removeEventListener('click', onClick)
}
