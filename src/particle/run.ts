import { STRIDE } from './renderer'
import type { BurstOptions, Direction, Outro, Physics } from './types'

export const DEFAULTS: Physics = {
  count: 900,
  direction: 'left',
  force: 150,
  curl: 90,
  drag: 2.6,
  gravity: 4,
  size: 9,
  blur: 0.3,
  life: 1600,
  dissolve: 900,
  return: 900
}

const enum Mode {
  Waiting,
  Free,
  Homing,
  Dead
}

type Rgb = [number, number, number]
interface Box {
  left: number
  top: number
  w: number
  h: number
}

export interface Run {
  readonly el: HTMLElement
  /** resolves true when played to the end, false when cut short */
  readonly done: Promise<boolean>
  /** returns false once the run is finished */
  step(dtMs: number): boolean
  /** writes visible particles into out at offset, returns how many */
  write(out: Float32Array, offset: number): number
  readonly capacity: number
  /** jump to the end state, used when the GL context is lost */
  finishNow(): void
}

const SOFT_EDGE = 0.08

export function parseColor(css: string): Rgb | null {
  if (!CSS.supports('color', css)) return null
  const ctx = colorCtx()
  ctx.fillStyle = '#000'
  ctx.fillStyle = css
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
  if (!a) return null
  return [r! / 255, g! / 255, b! / 255]
}

let ctx2d: CanvasRenderingContext2D | null = null
function colorCtx() {
  ctx2d ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })!
  return ctx2d
}

export function elementColor(el: HTMLElement): Rgb {
  const s = getComputedStyle(el)
  return (
    parseColor(s.backgroundColor) ?? parseColor(s.borderTopColor) ?? parseColor(s.color) ?? [0, 0, 0]
  )
}

function boxOf(el: HTMLElement): Box {
  const r = el.getBoundingClientRect()
  return { left: r.left, top: r.top, w: r.width, h: r.height }
}

function radiusPx(value: string, w: number, h: number) {
  const n = parseFloat(value) || 0
  return Math.min(value.endsWith('%') ? (n / 100) * Math.min(w, h) : n, w / 2, h / 2)
}

function insideRounded(x: number, y: number, w: number, h: number, r: number[]) {
  const corners: [number, number, number][] = [
    [r[0]!, r[0]!, r[0]!],
    [r[1]!, w - r[1]!, r[1]!],
    [r[2]!, w - r[2]!, h - r[2]!],
    [r[3]!, r[3]!, h - r[3]!]
  ]
  for (const [rad, cx, cy] of corners) {
    if (rad <= 0) continue
    const inCornerX = cx < w / 2 ? x < cx : x > cx
    const inCornerY = cy < h / 2 ? y < cy : y > cy
    if (inCornerX && inCornerY && (x - cx) ** 2 + (y - cy) ** 2 > rad * rad) return false
  }
  return true
}

/** 0 where the dissolve starts, 1 where it ends */
function frontKey(dir: Direction, x: number, y: number, box: Box, origin: [number, number]) {
  switch (dir) {
    case 'left':
      return x / box.w
    case 'right':
      return 1 - x / box.w
    case 'up':
      return y / box.h
    case 'down':
      return 1 - y / box.h
    case 'pointer':
      return Math.hypot(x - origin[0], y - origin[1]) / maxReach(box, origin)
  }
}

function maxReach(box: Box, [ox, oy]: [number, number]) {
  return Math.max(Math.hypot(ox, oy), Math.hypot(box.w - ox, oy), Math.hypot(ox, box.h - oy), Math.hypot(box.w - ox, box.h - oy), 1)
}

/** hides key < f (dissolve) or shows key < f (reveal) */
function maskCss(dir: Direction, f: number, reveal: boolean, box: Box, origin: [number, number]) {
  const a = f * (1 + SOFT_EDGE) - SOFT_EDGE
  const b = a + SOFT_EDGE
  const [near, far] = reveal ? ['#000', 'transparent'] : ['transparent', '#000']
  if (dir === 'pointer') {
    const reach = maxReach(box, origin)
    return `radial-gradient(circle at ${origin[0]}px ${origin[1]}px, ${near} ${a * reach}px, ${far} ${b * reach}px)`
  }
  const to = { left: 'right', right: 'left', up: 'bottom', down: 'top' }[dir]
  return `linear-gradient(to ${to}, ${near} ${a * 100}%, ${far} ${b * 100}%)`
}

const HIDDEN_MASK = 'linear-gradient(transparent, transparent)'

/** stream function whose curl gives a divergence-free swirl field */
function curl(x: number, y: number, t: number, out: [number, number]) {
  const a = x * 0.9 + t * 0.6
  const b = y * 1.1 - t * 0.4
  const c = x * 1.7 - y * 1.3 + t * 0.9
  const d = x * 2.3 + y * 2.9 - t * 0.5
  const dPsiDx = 0.9 * Math.cos(a) * Math.cos(b) + 0.85 * Math.cos(c) - 0.805 * Math.sin(d)
  const dPsiDy = -1.1 * Math.sin(a) * Math.sin(b) - 0.65 * Math.cos(c) - 1.015 * Math.sin(d)
  out[0] = dPsiDy
  out[1] = -dPsiDx
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1)
  return t * t * (3 - 2 * t)
}

export function createRun(el: HTMLElement, opts: BurstOptions, onLeave: () => void): Run {
  const p: Physics = { ...DEFAULTS, ...definedOnly(opts) }
  const outro: Outro = opts.outro ?? { kind: 'fade' }
  const style = getComputedStyle(el)
  let box = boxOf(el)
  const origin: [number, number] = opts.origin
    ? [opts.origin.x - box.left, opts.origin.y - box.top]
    : [box.w / 2, box.h / 2]
  let color: Rgb = (opts.color && parseColor(opts.color)) || elementColor(el)
  let nextColor: Rgb = color

  const radii = [
    style.borderTopLeftRadius,
    style.borderTopRightRadius,
    style.borderBottomRightRadius,
    style.borderBottomLeftRadius
  ].map((v) => radiusPx(v, box.w, box.h))

  const n = Math.round(Math.min(6000, Math.max(80, (p.count * box.w * box.h) / (200 * 56))))
  const home = new Float32Array(n * 2)
  const pos = new Float32Array(n * 2)
  const vel = new Float32Array(n * 2)
  const key = new Float32Array(n)
  const size = new Float32Array(n)
  const alpha = new Float32Array(n)
  const soft = new Float32Array(n)
  const lifespan = new Float32Array(n)
  const age = new Float32Array(n)
  const mode = new Uint8Array(n)
  const visible = new Float32Array(n).fill(1)

  const dirVec: Record<Exclude<Direction, 'pointer'>, [number, number]> = {
    left: [-1, 0],
    right: [1, 0],
    up: [0, -1],
    down: [0, 1]
  }

  for (let i = 0; i < n; i++) {
    let x = 0
    let y = 0
    do {
      x = Math.random() * box.w
      y = Math.random() * box.h
    } while (!insideRounded(x, y, box.w, box.h, radii))
    home[i * 2] = pos[i * 2] = x
    home[i * 2 + 1] = pos[i * 2 + 1] = y
    key[i] = Math.min(1, frontKey(p.direction, x, y, box, origin) + Math.random() * 0.05)
    const z = Math.random()
    const out = Math.random() < p.blur
    size[i] = p.size * (0.35 + 0.65 * z * z) * (out ? 1.35 : 1)
    soft[i] = out ? 0.55 + Math.random() * 0.45 : 0.12 + Math.random() * 0.15
    alpha[i] = (out ? 0.45 : 0.7) + Math.random() * 0.3
    lifespan[i] = p.life * (0.55 + Math.random() * 0.6)
  }

  const seed = Math.random() * 100
  const T = Math.max(p.return, 1)
  const stagger = T * 0.4
  const travel = T * 0.6
  const omega = 7 / (travel / 1000)
  const returns = outro.kind === 'reassemble' || outro.kind === 'morph'
  const homing = returns || outro.kind === 'fly-to' || outro.kind === 'implode'
  let homingStart = Infinity
  if (outro.kind === 'reassemble') homingStart = p.dissolve + p.life * 0.45
  if (outro.kind === 'fly-to' || outro.kind === 'implode') homingStart = p.dissolve + p.life * 0.2

  let t = 0
  let finished = false
  let swapCalled = false
  let revealStarted = false
  let revealDone = false
  let targetBounced = false
  let alive = n
  const tmp: [number, number] = [0, 0]

  const prevMask = el.style.getPropertyValue('mask-image')
  const prevWebkitMask = el.style.getPropertyValue('-webkit-mask-image')
  let lastMask: string | null = null
  const setMask = (css: string | null) => {
    if (css === lastMask) return
    lastMask = css
    if (css === null) {
      restoreProp('mask-image', prevMask)
      restoreProp('-webkit-mask-image', prevWebkitMask)
    } else {
      el.style.setProperty('mask-image', css)
      el.style.setProperty('-webkit-mask-image', css)
    }
  }
  const restoreProp = (name: string, value: string) =>
    value ? el.style.setProperty(name, value) : el.style.removeProperty(name)

  let resolveDone!: (played: boolean) => void
  const done = new Promise<boolean>((r) => (resolveDone = r))

  const targetLocal = (): [number, number] => {
    if (outro.kind === 'fly-to') {
      const r = outro.target.getBoundingClientRect()
      return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top]
    }
    return [box.w / 2, box.h / 2]
  }

  function startSwap() {
    if (outro.kind !== 'morph' || swapCalled) return
    swapCalled = true
    const oldW = box.w || 1
    const oldH = box.h || 1
    const onSwapped = () => {
      if (finished) return
      box = boxOf(el)
      const sx = box.w / oldW
      const sy = box.h / oldH
      for (let i = 0; i < n; i++) {
        home[i * 2]! *= sx
        home[i * 2 + 1]! *= sy
      }
      nextColor = elementColor(el)
      homingStart = Math.max(t, p.dissolve + p.life * 0.25)
    }
    Promise.resolve()
      .then(() => outro.swap(el))
      .then(() => new Promise((r) => requestAnimationFrame(r)))
      .then(onSwapped, (error: unknown) => {
        reportError(error)
        onSwapped()
      })
  }

  function reveal(kind: 'fade' | 'pop') {
    if (revealStarted) return
    revealStarted = true
    setMask(null)
    const anim =
      kind === 'fade'
        ? el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: T * 0.8, easing: 'ease-out' })
        : el.animate(
            [
              { opacity: 0, transform: 'scale(0.6)' },
              { opacity: 1, transform: 'scale(1.06)', offset: 0.6 },
              { opacity: 1, transform: 'scale(1)' }
            ],
            { duration: 460, easing: 'cubic-bezier(.2,.8,.3,1)' }
          )
    anim.finished.then(
      () => (revealDone = true),
      () => (revealDone = true)
    )
  }

  function bounce(target: Element) {
    target.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.28)', offset: 0.35 },
        { transform: 'scale(0.94)', offset: 0.7 },
        { transform: 'scale(1)' }
      ],
      { duration: 520, easing: 'ease-out' }
    )
  }

  function finish(played = true) {
    if (finished) return
    finished = true
    if (outro.kind === 'vanish') setMask(HIDDEN_MASK)
    else setMask(null)
    resolveDone(played)
    onLeave()
  }

  function step(dtMs: number): boolean {
    if (finished) return false
    if (el.isConnected) box = boxOf(el)
    t += dtMs
    const dt = dtMs / 1000
    const front = Math.min(1, t / Math.max(p.dissolve, 1))
    const easedFront = front * front * (3 - 2 * front)

    if (t <= p.dissolve) setMask(maskCss(p.direction, easedFront, false, box, origin))
    else if (!revealStarted) setMask(HIDDEN_MASK)
    if (t >= p.dissolve) startSwap()

    const [tx, ty] = homing ? targetLocal() : [0, 0]
    const reachHome = returns ? (t - homingStart - travel * 0.85) / stagger : -1
    const damp = Math.exp(-p.drag * dt)
    const time = seed + t / 1000

    alive = 0
    for (let i = 0; i < n; i++) {
      const m = mode[i]
      if (m === Mode.Dead) continue
      alive++
      const ix = i * 2
      const iy = ix + 1
      if (m === Mode.Waiting) {
        if (easedFront < key[i]!) continue
        mode[i] = Mode.Free
        let dx: number
        let dy: number
        if (p.direction === 'pointer') {
          const ox = home[ix]! - origin[0]
          const oy = home[iy]! - origin[1]
          const len = Math.hypot(ox, oy) || 1
          dx = ox / len
          dy = oy / len
        } else {
          ;[dx, dy] = dirVec[p.direction]
        }
        const push = p.force * (0.25 + 0.75 * Math.random() ** 0.6)
        const spread = p.force * 0.9 * (Math.random() + Math.random() - 1)
        vel[ix] = dx * push - dy * spread
        vel[iy] = dy * push + dx * spread
      }

      age[i]! += dtMs
      const x = pos[ix]!
      const y = pos[iy]!
      const homingAt = homingStart + key[i]! * stagger
      if (homing && t >= homingAt) mode[i] = Mode.Homing

      curl(x / 60 + seed, y / 60, time, tmp)
      let ax = tmp[0] * p.curl
      let ay = tmp[1] * p.curl + p.gravity

      if (mode[i] === Mode.Homing) {
        const gx = returns ? home[ix]! : tx
        const gy = returns ? home[iy]! : ty
        const progress = Math.min(1, (t - homingAt) / travel)
        const k = omega * Math.min(1, 0.35 + progress)
        const fade = 1 - progress
        ax = ax * fade + k * k * (gx - x) - 2 * k * vel[ix]!
        ay = ay * fade + k * k * (gy - y) - 2 * k * vel[iy]!
        if (outro.kind === 'implode') {
          ax += (y - gy) * k * 1.4
          ay -= (x - gx) * k * 1.4
        }
        if (!returns) {
          const dist = Math.hypot(gx - x, gy - y)
          visible[i] = Math.min(1, dist / 50)
          if (dist < 6 || progress >= 1) {
            mode[i] = Mode.Dead
            if (outro.kind === 'fly-to' && !targetBounced) {
              targetBounced = true
              bounce(outro.target)
            }
          }
        } else if (key[i]! < reachHome) {
          visible[i] = Math.max(0, visible[i]! - dt * 8)
        }
        vel[ix]! += ax * dt
        vel[iy]! += ay * dt
      } else {
        vel[ix] = (vel[ix]! + ax * dt) * damp
        vel[iy] = (vel[iy]! + ay * dt) * damp
        if (!homing) {
          visible[i] = 1 - smooth(lifespan[i]! * 0.5, lifespan[i]!, age[i]!)
          if (age[i]! >= lifespan[i]!) mode[i] = Mode.Dead
        }
      }
      pos[ix] = x + vel[ix]! * dt
      pos[iy] = y + vel[iy]! * dt
    }

    if (returns && t > homingStart) {
      if (outro.kind === 'morph') {
        const mix = smooth(0, travel, t - homingStart)
        color = color.map((c, j) => c + (nextColor[j]! - c) * mix) as Rgb
      }
      setMask(maskCss(p.direction, Math.max(0, reachHome), true, box, origin))
      if (reachHome > 1 + SOFT_EDGE && visibleCount() === 0) finish()
      return !finished
    }

    if (outro.kind === 'fade' && t > p.dissolve + p.life * 0.55) reveal('fade')
    if ((outro.kind === 'fly-to' || outro.kind === 'implode') && alive < n * 0.04) reveal('pop')
    if (alive === 0 && (outro.kind === 'vanish' || revealDone)) finish()
    return !finished
  }

  function visibleCount() {
    let c = 0
    for (let i = 0; i < n; i++) if (mode[i] !== Mode.Waiting && visible[i]! > 0) c++
    return c
  }

  function write(out: Float32Array, offset: number) {
    let c = 0
    for (let i = 0; i < n; i++) {
      if (mode[i] === Mode.Waiting || mode[i] === Mode.Dead) continue
      const v = visible[i]!
      if (v <= 0.002) continue
      const o = (offset + c) * STRIDE
      out[o] = box.left + pos[i * 2]!
      out[o + 1] = box.top + pos[i * 2 + 1]!
      out[o + 2] = size[i]! * (homing && !returns ? 0.4 + 0.6 * v : 1)
      out[o + 3] = alpha[i]! * (homing && !returns ? 1 : v)
      out[o + 4] = soft[i]!
      out[o + 5] = color[0]
      out[o + 6] = color[1]
      out[o + 7] = color[2]
      c++
    }
    return c
  }

  function finishNow() {
    if (outro.kind === 'morph' && !swapCalled) {
      swapCalled = true
      Promise.resolve()
        .then(() => outro.swap(el))
        .catch(reportError)
    }
    finish(false)
  }

  return { el, done, step, write, capacity: n, finishNow }
}

function definedOnly<T extends object>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>
}
