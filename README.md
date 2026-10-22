# button-particle-effect

A button dissolves into soft dust on one shared WebGL2 canvas, then comes back in one of six ways. The button's box never moves: it hides behind a CSS mask while the dust is drawn on a fixed overlay.

The effect lives in `src/particle/`. It has no dependencies and does not import React. The playground in `src/playground/` uses React and Tweakpane.

## Run

```bash
bun install
bun run dev
bun run build
```

## API

```ts
import { attach, burst } from './src/particle'

// Plays once. Resolves when the effect ends; played is false when it was skipped.
const { played } = await burst(button, { outro: { kind: 'reassemble' }, direction: 'left' })

// Plays on every click or keyboard press. Returns a cleanup.
const detach = attach(button, { outro: { kind: 'fade' } })
```

`outro` picks how the element returns:

| kind | use it for | behavior |
| --- | --- | --- |
| `fade` | general feedback | Dust drifts off. The element fades back in. |
| `reassemble` | undo, reset, toggle | Dust hangs, then springs back into place. |
| `fly-to` (`target`) | add to cart | Dust streams into `target`, which bounces. The element pops back. |
| `morph` (`swap`) | success state | `swap(el)` runs while the element is hidden. Dust returns in the new color. |
| `implode` | submit, send | Dust is pulled to the center. The element pops out. |
| `vanish` | delete, dismiss | Dust drifts off. The element stays hidden; remove it yourself. |

Physics options: `count`, `direction` (`left`, `right`, `up`, `down`, `pointer`), `force`, `curl`, `drag`, `gravity`, `size`, `blur`, `life`, `dissolve`, `return`. `origin` sets the pointer position, and `color` overrides the color read from the element.

Calling `burst` again on an element that is still playing returns the running promise. With `prefers-reduced-motion: reduce`, without WebGL2, or after the context is lost, the effect is skipped: `morph` still runs `swap`, and `vanish` still hides the element.
