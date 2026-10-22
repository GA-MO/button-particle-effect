import { useState } from 'react'
import { flushSync } from 'react-dom'
import { burst } from '@/particle'

export function SubscribeButton() {
  const [subscribed, setSubscribed] = useState(false)
  return (
    <button
      type='button'
      style={{ background: subscribed ? '#2f9a5b' : '#4a4fd1' }}
      onClick={(e) =>
        burst(e.currentTarget, {
          outro: {
            kind: 'morph',
            // flushSync commits the new label and color before burst reads them
            swap: () => flushSync(() => setSubscribed((s) => !s))
          }
        })
      }
    >
      {subscribed ? 'Subscribed ✓' : 'Subscribe'}
    </button>
  )
}
