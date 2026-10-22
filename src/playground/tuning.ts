import { Pane } from 'tweakpane'
import { DEFAULTS, type Physics } from '../particle'

export const physics: Physics = { ...DEFAULTS }

export function mountPane(container: HTMLElement): () => void {
  const pane = new Pane({ container, title: 'Tune dust', expanded: window.innerWidth >= 1024 })
  pane.addBinding(physics, 'count', { min: 100, max: 6000, step: 10 })
  pane.addBinding(physics, 'direction', {
    options: { left: 'left', right: 'right', up: 'up', down: 'down', 'from pointer': 'pointer' }
  })
  pane.addBinding(physics, 'force', { min: 0, max: 600 })
  pane.addBinding(physics, 'curl', { min: 0, max: 800 })
  pane.addBinding(physics, 'drag', { min: 0, max: 8 })
  pane.addBinding(physics, 'gravity', { min: -80, max: 80 })
  pane.addBinding(physics, 'size', { min: 1, max: 20 })
  pane.addBinding(physics, 'blur', { min: 0, max: 1 })
  pane.addBinding(physics, 'life', { label: 'life ms', min: 300, max: 4000, step: 10 })
  pane.addBinding(physics, 'dissolve', { label: 'dissolve ms', min: 100, max: 2000, step: 10 })
  pane.addBinding(physics, 'return', { label: 'return ms', min: 200, max: 3000, step: 10 })
  pane.addButton({ title: 'Reset' }).on('click', () => {
    Object.assign(physics, DEFAULTS)
    pane.refresh()
  })
  return () => pane.dispose()
}
