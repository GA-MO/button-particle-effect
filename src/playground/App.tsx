import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { attach, burst, type Outro } from '../particle'
import { mountPane, physics } from './tuning'

const BUTTON =
  'inline-flex cursor-pointer items-center justify-center gap-2 font-medium text-white transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink'

function play(el: HTMLElement, outro: Outro, e?: MouseEvent, color?: string) {
  const origin = e && e.detail > 0 ? { x: e.clientX, y: e.clientY } : undefined
  return burst(el, { ...physics, outro, ...(origin && { origin }), ...(color && { color }) })
}

export function App() {
  const cartRef = useRef<HTMLSpanElement>(null)
  const paneRef = useRef<HTMLDivElement>(null)
  const [cartCount, setCartCount] = useState(2)

  useEffect(() => (paneRef.current ? mountPane(paneRef.current) : undefined), [])

  return (
    <div className='mx-auto max-w-7xl px-5 pb-24 sm:px-8'>
      <header className='flex items-center justify-between gap-4 py-8 sm:py-10'>
        <div>
          <h1 className='font-display text-5xl leading-none tracking-tight sm:text-6xl'>Dust</h1>
          <p className='mt-2 max-w-md text-sm text-ink-soft'>
            Buttons that dissolve into particles and come back six ways. One shared WebGL2 canvas,
            no layout shift.
          </p>
        </div>
        <span
          ref={cartRef}
          className='relative grid size-14 shrink-0 place-items-center rounded-full border border-card-line bg-card text-ink backdrop-blur'
          aria-label={`Cart, ${cartCount} items`}
          role='status'
        >
          <CartIcon />
          <span className='absolute -top-1 -right-1 grid size-6 place-items-center rounded-full bg-brick text-xs font-semibold text-white tabular-nums'>
            {cartCount}
          </span>
        </span>
      </header>

      <div className='lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-8'>
        <aside ref={paneRef} className='mb-5 lg:sticky lg:top-6 lg:order-last lg:mb-0' />
        <div>
          <div className='mb-6 flex flex-wrap items-center gap-3'>
            <button
              type='button'
              className='cursor-pointer rounded-full border border-card-line bg-card px-5 py-2.5 text-sm font-medium backdrop-blur hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2'
              onClick={() => document.querySelectorAll<HTMLElement>('[data-demo]').forEach((b) => b.click())}
            >
              Play all at once
            </button>
            <span className='text-xs text-ink-soft'>Tune shared physics in the panel. Direction “from pointer” follows where you click.</span>
          </div>

          <main className='grid gap-5 md:grid-cols-2'>
            <Card n='01' name='fade' when='Default feedback. Dust drifts off, the button fades back.'>
              <FadeDemo />
            </Card>
            <Card n='02' name='reassemble' when='Undo, reset, toggle. Dust hangs, then springs home.'>
              <button
                type='button'
                data-demo='reassemble'
                className={`${BUTTON} h-11 rounded-full bg-plum px-6 text-sm`}
                onClick={(e) => play(e.currentTarget, { kind: 'reassemble' }, e)}
              >
                <UndoIcon /> Undo
              </button>
            </Card>
            <Card n='03' name='fly-to' when='Add to cart. Dust streams into the cart, which bounces.'>
              <button
                type='button'
                data-demo='fly-to'
                className={`${BUTTON} h-14 rounded-lg bg-teal px-8`}
                onClick={(e) => {
                  const target = cartRef.current
                  if (!target) return
                  void play(e.currentTarget, { kind: 'fly-to', target }, e).then(() =>
                    setCartCount((c) => c + 1)
                  )
                }}
              >
                Add to bag
              </button>
            </Card>
            <Card n='04' name='morph' when='Success state. Breaks apart, rebuilds as the new label and color.'>
              <MorphDemo />
            </Card>
            <Card n='05' name='implode' when='Submit, send. Dust is pulled to the center, the button pops out.'>
              <button
                type='button'
                data-demo='implode'
                aria-label='Send'
                className={`${BUTTON} size-16 rounded-full bg-tangerine`}
                onClick={(e) => play(e.currentTarget, { kind: 'implode' }, e)}
              >
                <SendIcon />
              </button>
            </Card>
            <Card n='06' name='vanish' when='Delete, dismiss. Gone for good; the caller removes the element.'>
              <VanishDemo />
            </Card>
          </main>
        </div>
      </div>
    </div>
  )
}

function Card({ n, name, when, children }: { n: string; name: string; when: string; children: ReactNode }) {
  return (
    <section className='flex flex-col rounded-card border border-card-line bg-card p-6 shadow-[0_20px_60px_-30px_rgb(91_42_74/0.35)] backdrop-blur-md'>
      <div className='flex items-baseline gap-3'>
        <span className='text-xs font-semibold tracking-widest text-ink-soft tabular-nums'>{n}</span>
        <h2 className='font-display text-3xl leading-none'>{name}</h2>
      </div>
      <p className='mt-2 min-h-10 text-sm text-ink-soft'>{when}</p>
      <div className='mt-4 grid min-h-44 flex-1 place-items-center'>{children}</div>
    </section>
  )
}

function FadeDemo() {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    return attach(el, () => ({ ...physics, outro: { kind: 'fade' } }))
  }, [])
  return (
    <button ref={ref} type='button' data-demo='fade' className={`${BUTTON} h-16 rounded-2xl bg-brick px-10 text-lg`}>
      Add to cart
    </button>
  )
}

function MorphDemo() {
  const [done, setDone] = useState(false)
  return (
    <button
      type='button'
      data-demo='morph'
      aria-live='polite'
      className={`${BUTTON} h-14 min-w-44 rounded-2xl px-7 ${done ? 'bg-success' : 'bg-indigo'}`}
      onClick={(e) =>
        play(e.currentTarget, { kind: 'morph', swap: () => flushSync(() => setDone((d) => !d)) }, e)
      }
    >
      {done ? <>Subscribed <CheckIcon /></> : 'Subscribe'}
    </button>
  )
}

const ITEMS = ['Draft: Q4 roadmap', 'Invoice #2041 (void)', 'Duplicate photo', 'Expired coupon']

function VanishDemo() {
  const [items, setItems] = useState(ITEMS)
  return (
    <div className='w-full'>
      <ul className='flex flex-col gap-2'>
        {items.map((item) => (
          <li
            key={item}
            className='flex items-center justify-between rounded-xl bg-[#fff7f2] py-2.5 pr-2 pl-4 text-sm shadow-sm'
          >
            {item}
            <button
              type='button'
              data-demo='vanish'
              aria-label={`Delete ${item}`}
              className='grid size-8 cursor-pointer place-items-center rounded-lg text-ink-soft hover:bg-ink/5 hover:text-brick focus-visible:outline-2 focus-visible:outline-ink'
              onClick={(e) => {
                const row = e.currentTarget.closest('li')
                if (!row) return
                void play(row, { kind: 'vanish' }, e, '#b4463c').then(() =>
                  setItems((list) => list.filter((i) => i !== item))
                )
              }}
            >
              <TrashIcon />
            </button>
          </li>
        ))}
      </ul>
      {items.length < ITEMS.length && (
        <button
          type='button'
          className='mt-3 cursor-pointer text-xs font-medium text-ink-soft underline-offset-4 hover:underline'
          onClick={() => setItems(ITEMS)}
        >
          Restore list
        </button>
      )}
    </div>
  )
}

const icon = { width: 20, height: 20, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

function CartIcon() {
  return (
    <svg viewBox='0 0 24 24' {...icon} width={22} height={22}>
      <path d='M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2' />
      <circle cx='10' cy='20' r='1.2' />
      <circle cx='17' cy='20' r='1.2' />
    </svg>
  )
}

function UndoIcon() {
  return (
    <svg viewBox='0 0 24 24' {...icon} width={16} height={16}>
      <path d='M9 14 4 9l5-5' />
      <path d='M4 9h10.5a5.5 5.5 0 0 1 0 11H11' />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg viewBox='0 0 24 24' {...icon} width={24} height={24}>
      <path d='m22 2-7 20-4-9-9-4Z' />
      <path d='M22 2 11 13' />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox='0 0 24 24' {...icon} width={18} height={18} strokeWidth={2.4}>
      <path d='M20 6 9 17l-5-5' />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox='0 0 24 24' {...icon} width={16} height={16}>
      <path d='M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6' />
    </svg>
  )
}
